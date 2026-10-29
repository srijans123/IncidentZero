package edu.campus.iitsm;

import edu.campus.iitsm.incident.api.AssignmentPort;
import edu.campus.iitsm.incident.application.intake.*;
import edu.campus.iitsm.incident.application.priority.ItilMatrixPriorityStrategy;
import edu.campus.iitsm.incident.domain.*;
import edu.campus.iitsm.intake.application.IntakeStep;
import edu.campus.iitsm.notification.infrastructure.EmailSmtpChannelAdapter;
import edu.campus.iitsm.notification.infrastructure.InAppSseChannelAdapter;
import edu.campus.iitsm.shared.domain.ClockPort;
import edu.campus.iitsm.shared.domain.IdGeneratorPort;
import edu.campus.iitsm.shared.domain.WorkingTimeCalculator;
import edu.campus.iitsm.shared.domain.error.InvalidIncidentPayloadException;
import edu.campus.iitsm.incident.application.sla.SlaPolicyResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import static org.junit.jupiter.api.Assertions.*;

class IntakePipelineTest {

  private ClockPort clockPort;
  private IdGeneratorPort idGeneratorPort;
  private SlaPolicyResolver slaPolicyResolver;
  private WorkingTimeCalculator calendar;
  private IncidentRepository inMemoryRepo;
  private ApplicationEventPublisher mockEventPublisher;
  private InAppSseChannelAdapter inAppSseChannel;
  private EmailSmtpChannelAdapter emailChannel;
  private IntakePipeline pipeline;

  @BeforeEach
  void setUp() {
    Instant fixedTime = Instant.parse("2026-03-02T10:00:00Z");
    clockPort = new ClockPort() {
      @Override public Instant now() { return fixedTime; }
      @Override public Instant wallNow() { return fixedTime; }
      @Override public int scaleFactor() { return 1; }
      @Override public long realNanosUntil(Instant target) { return 0L; }
    };

    idGeneratorPort = new IdGeneratorPort() {
      private int seq = 1;
      @Override public UUID newUuidV7() { return UUID.fromString("00000000-0000-0000-0000-0000000000" + String.format("%02d", seq++)); }
      @Override public String nextIncidentNumber(int year) { return "INC-2026-000001"; }
    };

    slaPolicyResolver = new SlaPolicyResolver();
    calendar = new edu.campus.iitsm.catalog.domain.BusinessCalendar(
        java.time.ZoneId.of("Asia/Kolkata"),
        Set.of(java.time.DayOfWeek.MONDAY, java.time.DayOfWeek.TUESDAY, java.time.DayOfWeek.WEDNESDAY, java.time.DayOfWeek.THURSDAY, java.time.DayOfWeek.FRIDAY),
        java.time.LocalTime.of(8, 0),
        java.time.LocalTime.of(18, 0),
        Set.of()
    );

    inMemoryRepo = new IncidentRepository() {
      private final Map<UUID, Incident.Snapshot> storage = new ConcurrentHashMap<>();
      @Override public Optional<Incident> findById(UUID id) {
        Incident.Snapshot s = storage.get(id);
        return s != null ? Optional.of(Incident.restore(s)) : Optional.empty();
      }
      @Override public Incident save(Incident incident) {
        storage.put(incident.id(), incident.toSnapshot());
        return incident;
      }
      @Override public List<Incident> findOpenChildrenByMasterId(UUID masterId) {
        return List.of();
      }
      @Override public List<Incident> findClassifiedUnassignedRoots(int limit) {
        return List.of();
      }
    };

    UUID chosenTech = UUID.fromString("00000000-0000-0000-0000-000000000003");
    UUID teamId = UUID.fromString("10000000-0000-0000-0000-000000000001");
    AssignmentPort mockAssignmentPort = (incId, sId, p, w) -> Optional.of(
        new AssignmentPort.AssignmentResult(chosenTech, teamId, "LeastLoaded")
    );

    mockEventPublisher = event -> {};

    inAppSseChannel = new InAppSseChannelAdapter();
    emailChannel = new EmailSmtpChannelAdapter(Optional.empty());

    List<IntakeStep> steps = List.of(
        new ValidateStep(clockPort),
        new SanitizeRedactStep(clockPort),
        new CreateProvisionalIncidentStep(clockPort, idGeneratorPort, slaPolicyResolver),
        new DuplicateCheckStep(clockPort, calendar),
        new CategoryAndServiceStep(clockPort),
        new EnrichStep(clockPort),
        new PriorityAndSlaStep(clockPort, List.of(new ItilMatrixPriorityStrategy()), slaPolicyResolver, calendar),
        new AssignStep(clockPort, Optional.of(mockAssignmentPort)),
        new PersistAndPublishStep(clockPort, inMemoryRepo, mockEventPublisher)
    );

    pipeline = new IntakePipeline(steps);
  }

  @Test
  void testValidateStepRejectsInvalidInputs() {
    IntakeStep.IntakeContext ctx = new IntakeStep.IntakeContext();
    ctx.rawTitle = "Hi"; // < 5 chars
    ctx.rawDescription = "Short";
    ctx.impact = 1;
    ctx.urgency = 1;

    assertThrows(InvalidIncidentPayloadException.class, () -> pipeline.process(ctx));
  }

  @Test
  void testFullIntakePipelineExecution() {
    IntakeStep.IntakeContext ctx = new IntakeStep.IntakeContext();
    ctx.actorId = UUID.fromString("00000000-0000-0000-0000-000000000010");
    ctx.rawTitle = "Hostel 4 Wi-Fi AP is offline in Block B";
    ctx.rawDescription = "Please contact me at student@bits.campus or call 9876543210. <script>alert(1)</script> Router reboot did not help.";
    ctx.serviceId = UUID.fromString("30000000-0000-0000-0000-000000000009"); // NET-WIFI-HOSTEL
    ctx.serviceTier = "T1";
    ctx.impact = 3;
    ctx.urgency = 3;

    IntakeStep.IntakeContext result = pipeline.process(ctx);

    assertNotNull(result.incident);
    assertEquals("INC-2026-000001", result.incident.number());
    // PII redacted and script tag removed
    assertTrue(result.redactedDescription.contains("[REDACTED_EMAIL]"));
    assertTrue(result.redactedDescription.contains("[REDACTED_PHONE]"));
    assertFalse(result.redactedDescription.contains("<script>"));

    // Classified to P1 (impact 3, urgency 3)
    assertEquals(Priority.P1, result.incident.priority());
    // Assigned to technician
    assertEquals(IncidentStatus.ASSIGNED, result.incident.status());
    assertNotNull(result.incident.assigneeId());

    // Verified saved in repository
    Optional<Incident> persisted = inMemoryRepo.findById(result.incident.id());
    assertTrue(persisted.isPresent());
    assertEquals(result.incident.id(), persisted.get().id());
  }

  @Test
  void testNotificationChannels() {
    UUID recipientId = UUID.fromString("00000000-0000-0000-0000-000000000003");
    UUID incidentId = UUID.fromString("00000000-0000-0000-0000-000000000001");

    inAppSseChannel.send(recipientId, incidentId, "INCIDENT_ASSIGNED", "{\"title\":\"Test\"}", "key-1");
    assertEquals(1, inAppSseChannel.getSentNotifications().size());
    assertEquals("IN_APP_SSE", inAppSseChannel.channelName());

    emailChannel.send(recipientId, incidentId, "INCIDENT_ASSIGNED", "{\"title\":\"Test\"}", "key-2");
    assertEquals(1, emailChannel.getSentEmails().size());
    assertEquals("EMAIL_SMTP", emailChannel.channelName());
  }
}
