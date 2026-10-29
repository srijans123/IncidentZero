package edu.campus.iitsm;

import edu.campus.iitsm.audit.api.AuditVerificationPort;
import edu.campus.iitsm.audit.api.AuditVerificationResult;
import edu.campus.iitsm.identity.api.UserPrincipal;
import edu.campus.iitsm.incident.api.IncidentQueryPort;
import edu.campus.iitsm.incident.api.dto.IncidentDtos;
import edu.campus.iitsm.incident.application.IncidentCommandService;
import edu.campus.iitsm.incident.application.intake.IntakeService;
import edu.campus.iitsm.incident.domain.Incident;
import edu.campus.iitsm.incident.domain.Resolution;
import edu.campus.iitsm.incident.infrastructure.web.AdminController;
import edu.campus.iitsm.incident.infrastructure.web.IncidentController;
import edu.campus.iitsm.incident.infrastructure.web.IntakeController;
import edu.campus.iitsm.intelligence.api.*;
import edu.campus.iitsm.shared.domain.ClockPort;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class DemoWorkflowsEndToEndTest {

  private static Map<String, String> loadDotEnv() {
    Map<String, String> map = new HashMap<>();
    java.io.File[] candidates = new java.io.File[] { new java.io.File(".env"), new java.io.File("../.env") };
    for (java.io.File f : candidates) {
      if (f.exists()) {
        try {
          for (String line : Files.readAllLines(f.toPath())) {
            line = line.trim();
            if (line.startsWith("#") || !line.contains("=")) continue;
            int idx = line.indexOf('=');
            String key = line.substring(0, idx).trim();
            String val = line.substring(idx + 1).trim();
            if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.substring(1, val.length() - 1);
            }
            map.put(key, val);
          }
          break;
        } catch (Exception ignored) {}
      }
    }
    return map;
  }

  @DynamicPropertySource
  static void registerPgProperties(DynamicPropertyRegistry registry) {
    Map<String, String> dotenv = loadDotEnv();
    String rawDbUrl = System.getenv("DB_URL");
    if (rawDbUrl == null || rawDbUrl.isBlank()) rawDbUrl = dotenv.get("DB_URL");
    final String dbUrl = rawDbUrl;
    if (dbUrl != null) registry.add("spring.datasource.url", () -> dbUrl);

    String rawDbUser = System.getenv("DB_APP_USER");
    if (rawDbUser == null || rawDbUser.isBlank()) rawDbUser = dotenv.get("DB_APP_USER");
    final String dbUser = rawDbUser;
    if (dbUser != null) registry.add("spring.datasource.username", () -> dbUser);

    String rawDbPass = System.getenv("DB_APP_PASSWORD");
    if (rawDbPass == null || rawDbPass.isBlank()) rawDbPass = dotenv.get("DB_APP_PASSWORD");
    final String dbPass = rawDbPass;
    if (dbPass != null) registry.add("spring.datasource.password", () -> dbPass);

    String rawSecret = System.getenv("BETTER_AUTH_SECRET");
    if (rawSecret == null || rawSecret.isBlank()) rawSecret = dotenv.get("BETTER_AUTH_SECRET");
    final String secret = rawSecret != null ? rawSecret : "4Jqn3ImSvW4jSM8bmB0OdqaEwCCaAPw1mSz06tdFdIQ=";
    registry.add("app.auth.secret", () -> secret);
    registry.add("spring.flyway.connect-retries", () -> "10");

    registry.add("app.ai.provider", () -> "replay");
  }

  @Autowired
  private IntakeController intakeController;

  @Autowired
  private IncidentController incidentController;

  @Autowired
  private AdminController adminController;

  @Autowired
  private IntakeService intakeService;

  @Autowired
  private IncidentCommandService commandService;

  @Autowired
  private IncidentQueryPort queryPort;

  @Autowired
  private AuditVerificationPort auditVerificationPort;

  @Autowired
  private ClockPort clockPort;

  @Autowired
  private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

  @org.junit.jupiter.api.BeforeEach
  void setUp() {
    jdbcTemplate.update("UPDATE technician_load SET points = 0.0");
  }

  @Test
  @DisplayName("Workflow 1: Employee Copilot Intake, A1/A2 Advice, Priority & Assignment")
  void testWorkflow1_EmployeeCopilotIntake() {
    UUID studentId = UUID.fromString("019299a0-0000-7000-8000-000000000001");
    UUID lmsServiceId = UUID.fromString("30000000-0000-0000-0000-000000000007");

    // 1. Employee asks Copilot for advice
    IncidentDtos.AdviceRequest adviceReq = new IncidentDtos.AdviceRequest(
        "Cannot log into Nalanda LMS for my 10 AM quiz from Vyas Bhawan Wi-Fi",
        "SSO redirect timeout error HTTP 504",
        "APP-LMS",
        3
    );
    ResponseEntity<IncidentDtos.AdviceResponse> adviceResp = intakeController.getAdvice(adviceReq);
    assertNotNull(adviceResp.getBody());
    assertEquals("AUTHENTICATION", adviceResp.getBody().suggestedCategory());
    assertEquals("APP-LMS", adviceResp.getBody().suggestedService());

    // 2. Submit Incident
    Incident created = intakeService.createIncident(
        studentId,
        "Cannot log into Nalanda LMS for my 10 AM quiz from Vyas Bhawan Wi-Fi",
        "SSO redirect timeout error HTTP 504 from Vyas Bhawan",
        lmsServiceId,
        "T1",
        2,
        3
    );
    assertNotNull(created);
    assertNotNull(created.id());
    assertEquals("P1", created.priority().name());
    assertTrue(created.allowedCommands().contains(edu.campus.iitsm.incident.domain.CommandType.ACKNOWLEDGE));
  }

  @Test
  @DisplayName("Workflow 2: Investigation, PENDING_USER Pause/Resume, Resolution, Verification & Audit Proof")
  void testWorkflow2_InvestigationPauseResumeVerificationAndAudit() {
    UUID studentId = UUID.fromString("019299a0-0000-7000-8000-000000000001");
    UUID seniorTechId = UUID.fromString("019299a0-0000-7000-8000-000000000005");
    UUID erpServiceId = UUID.fromString("30000000-0000-0000-0000-000000000006");

    // 1. Create incident
    Incident inc = intakeService.createIncident(
        studentId,
        "AUGSD Course Registration Timeout HTTP 504",
        "Registration portal stuck during SSO redirect",
        erpServiceId,
        "T1",
        2,
        3
    );
    UUID incId = inc.id();
    UUID assignedTech = inc.assigneeId();
    assertNotNull(assignedTech, "Incident must be assigned to a technician");

    // 2. Tech acknowledges
    commandService.acknowledge(incId, assignedTech, "TECHNICIAN", "SENIOR");
    var s1 = queryPort.findIncidentDetail(incId).orElseThrow();
    assertEquals("ACKNOWLEDGED", s1.status());

    // 3. Tech starts investigation
    commandService.startInvestigation(incId, assignedTech, "TECHNICIAN", "SENIOR");
    var s2 = queryPort.findIncidentDetail(incId).orElseThrow();
    assertEquals("IN_PROGRESS", s2.status());

    // 4. Tech requests user info (clock pauses)
    commandService.requestUserInfo(incId, "Please paste the exact error code", assignedTech, "TECHNICIAN", "SENIOR");
    var s3 = queryPort.findIncidentDetail(incId).orElseThrow();
    assertEquals("PENDING_USER", s3.status());

    // 5. Employee provides user info (clock resumes)
    commandService.provideUserInfo(incId, studentId, "EMPLOYEE", null);
    var s4 = queryPort.findIncidentDetail(incId).orElseThrow();
    assertEquals("IN_PROGRESS", s4.status());

    // 6. Tech resolves incident
    Resolution res = new Resolution("FIXED", "Restarted LDAP connection pool and purged exhausted sessions.", "LDAP_POOL");
    commandService.resolve(incId, res, assignedTech, "TECHNICIAN", "SENIOR");
    var s5 = queryPort.findIncidentDetail(incId).orElseThrow();
    assertEquals("RESOLVED", s5.status());

    // 7. Employee verifies with 5 stars
    commandService.verify(incId, 5, studentId, "EMPLOYEE", null);
    var s6 = queryPort.findIncidentDetail(incId).orElseThrow();
    assertEquals("VERIFIED", s6.status());

    // 8. Tech closes incident
    commandService.close(incId, "Verified by student. Closed.", assignedTech, "TECHNICIAN", "SENIOR");
    var s7 = queryPort.findIncidentDetail(incId).orElseThrow();
    assertEquals("CLOSED", s7.status());

    // 9. Audit ledger verification
    AuditVerificationResult auditResult = auditVerificationPort.verifyLedger(incId);
    assertTrue(auditResult.valid(), "Audit chain should be cryptographically sound: " + auditResult.failureReason() + " (corrupted row: " + auditResult.firstCorruptedRowId() + ")");
  }

  @Test
  @DisplayName("Workflow 3: 40-Ticket Storm Simulation, 30x Demo Clock, B2 Graph RCA & Blameless PIR")
  void testWorkflow3_StormSimulationAndRca() {
    // 1. Simulate 40-ticket storm
    Map<String, Object> stormReq = Map.of(
        "scenario", "ERP_LDAP_POOL_EXHAUSTION",
        "reportCount", 40
    );
    ResponseEntity<Map<String, Object>> stormResp = adminController.simulateStorm(stormReq);
    assertNotNull(stormResp.getBody());
    assertEquals(40, stormResp.getBody().get("totalInjected"));
    assertEquals(4, stormResp.getBody().get("masterCount"));
    assertEquals(36, stormResp.getBody().get("childCount"));
    assertEquals("AUTH-LDAP", stormResp.getBody().get("rootCandidateService"));

    // 2. Accelerate clock to 30x
    ResponseEntity<Map<String, Object>> clockResp = adminController.setDemoClock(Map.of("scaleFactor", 30));
    assertNotNull(clockResp.getBody());
    assertEquals(30, clockResp.getBody().get("scaleFactor"));

    // 3. Reset clock to 1x
    adminController.setDemoClock(Map.of("scaleFactor", 1));

    // 4. Test B2 RCA endpoint
    UUID dummyId = UUID.randomUUID();
    var rcaResp = incidentController.getRca(dummyId);
    assertNotNull(rcaResp.getBody());
    assertEquals("AUTH-LDAP", rcaResp.getBody().primaryCandidateServiceCode());

    // 5. Test Blameless PIR Drafter endpoint
    var pirResp = incidentController.draftPir(dummyId);
    assertNotNull(pirResp.getBody());
    assertNotNull(pirResp.getBody().executiveSummary());
  }
}
