package edu.campus.iitsm;

import edu.campus.iitsm.audit.domain.AuditHasher;
import edu.campus.iitsm.incident.api.IncidentEvents.IncidentCreated;
import edu.campus.iitsm.incident.domain.ClockMode;
import edu.campus.iitsm.incident.domain.Incident;
import edu.campus.iitsm.incident.domain.IncidentRepository;
import edu.campus.iitsm.incident.domain.Priority;
import edu.campus.iitsm.incident.domain.PriorityExplanation;
import edu.campus.iitsm.incident.domain.SlaSnapshot;
import edu.campus.iitsm.shared.domain.ClockPort;
import edu.campus.iitsm.shared.domain.IdGeneratorPort;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.io.File;
import java.nio.file.Files;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@TestPropertySource(properties = {"spring.flyway.enabled=false"})
@SpringBootTest
class PersistenceAndListenersTest {

  private static Map<String, String> loadDotEnv() {
    Map<String, String> map = new HashMap<>();
    File[] candidates = new File[] { new File(".env"), new File("../.env") };
    for (File f : candidates) {
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
  static void registerProperties(DynamicPropertyRegistry registry) {
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
  }

  @Autowired
  private IncidentRepository incidentRepository;

  @Autowired
  private ClockPort clockPort;

  @Autowired
  private IdGeneratorPort idGeneratorPort;

  @Autowired
  private ApplicationEventPublisher eventPublisher;

  @Autowired
  private PlatformTransactionManager transactionManager;

  @Autowired
  private JdbcTemplate jdbcTemplate;

  @Test
  void testIncidentJpaPersistenceAndRestoration() {
    UUID incidentId = idGeneratorPort.newUuidV7();
    String number = idGeneratorPort.nextIncidentNumber(2026);
    UUID reporterId = UUID.fromString("019299a0-0000-7000-8000-000000000001");
    UUID serviceId = UUID.fromString("30000000-0000-0000-0000-000000000001");
    UUID policyId = UUID.fromString("40000000-0000-0000-0000-000000000001");

    Instant now = clockPort.now();
    SlaSnapshot sla = new SlaSnapshot(policyId, "T1", 3_600_000L, 28_800_000L, ClockMode.BUSINESS_HOURS);
    Incident incident = Incident.createWithNumber(
        incidentId, number, reporterId, serviceId,
        "Network switch offline", "Hostel 4 core switch dropped connection",
        2, 2, Priority.P2, PriorityExplanation.empty(), sla, now
    );

    TransactionTemplate tx = new TransactionTemplate(transactionManager);
    tx.executeWithoutResult(status -> {
      Incident saved = incidentRepository.save(incident);
      assertNotNull(saved);
      assertEquals(0L, saved.version());
    });

    Optional<Incident> loaded = incidentRepository.findById(incidentId);
    assertTrue(loaded.isPresent());
    Incident found = loaded.get();
    assertEquals(incidentId, found.id());
    assertEquals(number, found.number());
    assertEquals("Network switch offline", found.title());
    assertEquals(Priority.P2, found.priority());
    assertEquals(0L, found.version());
  }

  @Test
  void testAuditLedgerAndSlaTimerInTxListeners() {
    UUID incidentId = idGeneratorPort.newUuidV7();
    String number = idGeneratorPort.nextIncidentNumber(2026);
    UUID reporterId = UUID.fromString("019299a0-0000-7000-8000-000000000001");
    UUID serviceId = UUID.fromString("30000000-0000-0000-0000-000000000001");
    UUID policyId = UUID.fromString("40000000-0000-0000-0000-000000000001");

    Instant now = clockPort.now();
    SlaSnapshot sla = new SlaSnapshot(policyId, "T1", 3_600_000L, 28_800_000L, ClockMode.BUSINESS_HOURS);
    Incident incident = Incident.createWithNumber(
        incidentId, number, reporterId, serviceId,
        "ERP Portal unreachable", "Cannot access course registration page",
        1, 1, Priority.P1, PriorityExplanation.empty(), sla, now
    );

    TransactionTemplate tx = new TransactionTemplate(transactionManager);
    tx.executeWithoutResult(status -> {
      incidentRepository.save(incident);
      eventPublisher.publishEvent(new IncidentCreated(incidentId, now, reporterId, serviceId, Priority.P1));
    });

    // Verify audit record was inserted
    Integer auditCount = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM audit_record WHERE incident_id = ?",
        Integer.class,
        incidentId
    );
    assertNotNull(auditCount);
    assertTrue(auditCount >= 1, "Audit record should be inserted by AuditLedgerInTxListener");

    Map<String, Object> auditRow = jdbcTemplate.queryForMap(
        "SELECT chain_index, prev_hash, hash, action FROM audit_record WHERE incident_id = ? ORDER BY chain_index DESC LIMIT 1",
        incidentId
    );
    assertEquals("IncidentCreated", auditRow.get("action"));
    assertNotNull(auditRow.get("hash"));
    assertNotEquals(AuditHasher.GENESIS_HASH, auditRow.get("hash"));

    // Verify SLA timers were scheduled
    Integer timerCount = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM sla_timer WHERE incident_id = ? AND cancelled_at IS NULL",
        Integer.class,
        incidentId
    );
    assertNotNull(timerCount);
    assertTrue(timerCount >= 4, "SLA milestone timers should be scheduled by SlaTimerInTxListener");
  }
}
