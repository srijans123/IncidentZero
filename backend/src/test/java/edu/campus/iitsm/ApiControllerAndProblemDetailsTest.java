package edu.campus.iitsm;

import edu.campus.iitsm.identity.api.IdentityQueryService;
import edu.campus.iitsm.identity.api.StreamTicketResponse;
import edu.campus.iitsm.identity.api.UserPrincipal;
import edu.campus.iitsm.incident.api.IncidentQueryPort;
import edu.campus.iitsm.incident.api.dto.IncidentDtos;
import edu.campus.iitsm.incident.application.IncidentCommandService;
import edu.campus.iitsm.incident.application.intake.IntakeService;
import edu.campus.iitsm.incident.domain.Incident;
import edu.campus.iitsm.incident.infrastructure.web.AdminController;
import edu.campus.iitsm.incident.infrastructure.web.IncidentController;
import edu.campus.iitsm.incident.infrastructure.web.IntakeController;
import edu.campus.iitsm.intelligence.api.*;
import edu.campus.iitsm.notification.infrastructure.InAppSseHub;
import edu.campus.iitsm.notification.infrastructure.web.StreamController;
import edu.campus.iitsm.shared.domain.ClockPort;
import edu.campus.iitsm.shared.domain.Suggestion;
import edu.campus.iitsm.shared.domain.VirtualAnchoredClock;
import edu.campus.iitsm.shared.domain.error.InvalidStateTransitionException;
import edu.campus.iitsm.shared.infrastructure.web.GlobalProblemDetailsHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ApiControllerAndProblemDetailsTest {

  private MockMvc mockMvc;
  private IncidentCommandService commandService;
  private IncidentQueryPort queryPort;
  private IntakeService intakeService;
  private IdentityQueryService identityQueryService;
  private InAppSseHub sseHub;
  private ClockPort clockPort;
  private CategorizationPort categorizationPort;
  private DuplicateDetectionPort duplicateDetectionPort;
  private SlaBreachPredictorPort slaBreachPredictorPort;
  private ResolutionRagPort resolutionRagPort;
  private RcaRankerPort rcaRankerPort;
  private PirDrafterPort pirDrafterPort;
  private NlSearchPort nlSearchPort;
  private JdbcTemplate jdbcTemplate;

  @BeforeEach
  void setUp() {
    commandService = mock(IncidentCommandService.class);
    queryPort = mock(IncidentQueryPort.class);
    intakeService = mock(IntakeService.class);
    identityQueryService = mock(IdentityQueryService.class);
    categorizationPort = mock(CategorizationPort.class);
    duplicateDetectionPort = mock(DuplicateDetectionPort.class);
    slaBreachPredictorPort = mock(SlaBreachPredictorPort.class);
    resolutionRagPort = mock(ResolutionRagPort.class);
    rcaRankerPort = mock(RcaRankerPort.class);
    pirDrafterPort = mock(PirDrafterPort.class);
    nlSearchPort = mock(NlSearchPort.class);
    jdbcTemplate = mock(JdbcTemplate.class);

    clockPort = new VirtualAnchoredClock(Instant.parse("2026-10-29T10:00:00Z"), 1, () -> {});
    sseHub = new InAppSseHub(clockPort, new com.fasterxml.jackson.databind.ObjectMapper());

    IncidentController incidentController = new IncidentController(
        commandService, queryPort, intakeService, clockPort,
        duplicateDetectionPort, slaBreachPredictorPort, resolutionRagPort,
        rcaRankerPort, pirDrafterPort, nlSearchPort
    );

    IntakeController intakeController = new IntakeController(
        categorizationPort, duplicateDetectionPort, clockPort
    );

    StreamController streamController = new StreamController(
        sseHub, identityQueryService
    );

    edu.campus.iitsm.audit.api.AuditVerificationPort auditVerificationPort = mock(edu.campus.iitsm.audit.api.AuditVerificationPort.class);
    when(auditVerificationPort.verifyAllLedgers()).thenReturn(new edu.campus.iitsm.audit.api.AuditVerificationResult(true, null, 10, "Valid"));

    AdminController adminController = new AdminController(
        intakeService, sseHub, clockPort, auditVerificationPort, jdbcTemplate
    );

    mockMvc = MockMvcBuilders
        .standaloneSetup(incidentController, intakeController, streamController, adminController)
        .setControllerAdvice(new GlobalProblemDetailsHandler())
        .build();
  }

  @Test
  void testStreamWithoutTicketReturns401UnauthorizedProblemDetail() throws Exception {
    mockMvc.perform(get("/api/v1/stream"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.code").value("ITSM-4010"))
        .andExpect(jsonPath("$.type").value("https://incident-zero.campus.edu/errors/ITSM-4010"))
        .andExpect(jsonPath("$.title").value("Unauthorized Operation"));
  }

  @Test
  void testStreamWithValidTicketReturns200TextEventStream() throws Exception {
    String ticket = "st_valid_ticket_12345";
    UUID userId = UUID.randomUUID();
    UserPrincipal principal = new UserPrincipal(
        userId, "EMP-001", "Vikram", "vikram@campus.edu", "TECHNICIAN", "SENIOR", null, "IT", "Vyas", null
    );

    when(identityQueryService.consumeStreamTicket(ticket)).thenReturn(Optional.of(principal));

    mockMvc.perform(get("/api/v1/stream").param("ticket", ticket))
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM));
  }

  @Test
  void testGetIncidentNotFoundReturns404ProblemDetail() throws Exception {
    UUID missingId = UUID.randomUUID();
    when(queryPort.findIncidentDetail(missingId)).thenReturn(Optional.empty());

    mockMvc.perform(get("/api/v1/incidents/" + missingId))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("ITSM-4041"))
        .andExpect(jsonPath("$.status").value(404));
  }

  @Test
  void testInvalidLifecycleStateTransitionReturns409ConflictProblemDetail() throws Exception {
    UUID incidentId = UUID.randomUUID();

    doThrow(new InvalidStateTransitionException(incidentId, "NEW", "CLOSE"))
        .when(commandService).close(eq(incidentId), anyString(), any(), any(), any());

    mockMvc.perform(post("/api/v1/incidents/" + incidentId + "/commands/close")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"closureNote\":\"premature close\"}"))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.code").value("ITSM-4090"))
        .andExpect(jsonPath("$.status").value(409))
        .andExpect(jsonPath("$.title").value("Invalid Incident Lifecycle State Transition"))
        .andExpect(jsonPath("$.currentState").value("NEW"))
        .andExpect(jsonPath("$.attemptedCommand").value("CLOSE"));
  }

  @Test
  void testIntakeAdviceReturnsCategorizationAndDuplicates() throws Exception {
    when(categorizationPort.classify(anyString(), anyString()))
        .thenReturn(new Suggestion<>(
            new LlmClassificationSchema(
                "SOFTWARE", "APP-ERP", "CAMPUS", 50, 3,
                List.of("error"), List.of(), "Provide screenshot", 0.90, "Matched ERP"
            ),
            0.90, "RULES", "model-v1", "v1", "Explanation", false, Instant.now()
        ));

    when(duplicateDetectionPort.findDuplicates(any(), anyString(), any(), any(), anyInt()))
        .thenReturn(List.of());

    mockMvc.perform(post("/api/v1/intake/advice")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"title\":\"Course registration timeout\",\"description\":\"HTTP 504 on AUGSD ERP\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.suggestedService").value("APP-ERP"))
        .andExpect(jsonPath("$.suggestedCategory").value("SOFTWARE"))
        .andExpect(jsonPath("$.clarifyingQuestion").value("Provide screenshot"));
  }
}
