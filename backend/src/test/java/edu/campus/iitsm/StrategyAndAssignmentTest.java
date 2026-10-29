package edu.campus.iitsm;

import edu.campus.iitsm.assignment.api.AssignmentRationale;
import edu.campus.iitsm.assignment.application.BatchAssignmentScheduler;
import edu.campus.iitsm.assignment.application.strategy.*;
import edu.campus.iitsm.assignment.domain.CapacityReservationPort;
import edu.campus.iitsm.assignment.domain.TechnicianCandidate;
import edu.campus.iitsm.incident.application.priority.*;
import edu.campus.iitsm.incident.domain.ClockMode;
import edu.campus.iitsm.incident.domain.Incident;
import edu.campus.iitsm.incident.domain.Priority;
import edu.campus.iitsm.incident.domain.PriorityExplanation;
import edu.campus.iitsm.incident.domain.SlaSnapshot;
import edu.campus.iitsm.shared.domain.ClockPort;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;

import java.io.File;
import java.nio.file.Files;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@TestPropertySource(properties = {"spring.flyway.enabled=false"})
@SpringBootTest
class StrategyAndAssignmentTest {

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
  private CapacityReservationPort capacityReservationPort;

  @Autowired
  private ClockPort clockPort;

  @Autowired
  private BatchAssignmentScheduler batchScheduler;

  @Test
  void testPriorityStrategies() {
    PriorityInput high = new PriorityInput(3, 3, "T1", 100, true, true, 5);
    PriorityInput low = new PriorityInput(1, 1, "T3", 1, false, false, 0);

    ItilMatrixPriorityStrategy itil = new ItilMatrixPriorityStrategy();
    PriorityResult itilHigh = itil.calculate(high);
    PriorityResult itilLow = itil.calculate(low);
    assertEquals(Priority.P1, itilHigh.priority());
    assertEquals(Priority.P4, itilLow.priority());

    ProductScorePriorityStrategy prod = new ProductScorePriorityStrategy();
    assertEquals(Priority.P1, prod.calculate(high).priority());
    assertEquals(Priority.P4, prod.calculate(low).priority());

    WeightedScorePriorityStrategy weighted = new WeightedScorePriorityStrategy();
    assertEquals(Priority.P1, weighted.calculate(high).priority());
    assertEquals(Priority.P4, weighted.calculate(low).priority());
  }

  @Test
  void testAssignmentStrategiesSelection() {
    UUID teamId = UUID.randomUUID();
    UUID techA = UUID.randomUUID();
    UUID techB = UUID.randomUUID();

    TechnicianCandidate candA = new TechnicianCandidate(
        techA, "Alice", teamId, "SENIOR", true, 2.0, 8.0,
        Map.of("NETWORKING", 3), 15, 45.0, 20, 60.0
    );

    TechnicianCandidate candB = new TechnicianCandidate(
        techB, "Bob", teamId, "L1", true, 6.0, 8.0,
        Map.of("NETWORKING", 1), 2, 90.0, 5, 60.0
    );

    List<TechnicianCandidate> candidates = List.of(candA, candB);
    UUID incId = UUID.randomUUID();
    UUID svcId = UUID.randomUUID();

    // RoundRobin
    RoundRobinStrategy rr = new RoundRobinStrategy();
    Optional<AssignmentRationale> rrResult1 = rr.selectTechnician(incId, svcId, teamId, Priority.P2, 2.0, Set.of("NETWORKING"), candidates);
    assertTrue(rrResult1.isPresent());

    // LeastLoaded (Alice has 2.0/8.0 = 0.25, Bob has 6.0/8.0 = 0.75 -> Alice selected)
    LeastLoadedStrategy ll = new LeastLoadedStrategy();
    Optional<AssignmentRationale> llResult = ll.selectTechnician(incId, svcId, teamId, Priority.P2, 1.0, Set.of(), candidates);
    assertTrue(llResult.isPresent());
    assertEquals(techA, llResult.get().chosenTechnicianId());

    // HybridWeighted (Alice has higher skill, lower load, higher experience)
    HybridWeightedStrategy hw = new HybridWeightedStrategy();
    Optional<AssignmentRationale> hwResult = hw.selectTechnician(incId, svcId, teamId, Priority.P2, 1.0, Set.of("NETWORKING"), candidates);
    assertTrue(hwResult.isPresent());
    assertEquals(techA, hwResult.get().chosenTechnicianId());

    // PriorityAware: P1 routes to Senior (Alice), P3 routes to L1 (Bob if capacity allows 1.0 pt)
    PriorityAwareStrategy pa = new PriorityAwareStrategy();
    Optional<AssignmentRationale> paP1 = pa.selectTechnician(incId, svcId, teamId, Priority.P1, 1.0, Set.of(), candidates);
    assertTrue(paP1.isPresent());
    assertEquals(techA, paP1.get().chosenTechnicianId());

    Optional<AssignmentRationale> paP3 = pa.selectTechnician(incId, svcId, teamId, Priority.P3, 1.0, Set.of(), candidates);
    assertTrue(paP3.isPresent());
    assertEquals(techB, paP3.get().chosenTechnicianId());
  }

  @Test
  void testBatchAssignmentSchedulerConditions() {
    Instant now = clockPort.now();
    UUID policyId = UUID.fromString("40000000-0000-0000-0000-000000000001");
    SlaSnapshot sla = new SlaSnapshot(policyId, "T1", 3600000L, 28800000L, ClockMode.BUSINESS_HOURS);

    // List with 1 fresh ticket (<10s) -> should not flush
    Incident fresh = Incident.createWithNumber(
        UUID.randomUUID(), "INC-2026-000991", UUID.randomUUID(), UUID.randomUUID(),
        "Ticket 1", "Desc 1234567890", 2, 2, Priority.P2, PriorityExplanation.empty(), sla, now.minus(5, ChronoUnit.SECONDS)
    );
    assertFalse(batchScheduler.shouldFlush(List.of(fresh), now));

    // List with 1 old ticket (waited 15s >= 10s) -> should flush
    Incident old = Incident.createWithNumber(
        UUID.randomUUID(), "INC-2026-000992", UUID.randomUUID(), UUID.randomUUID(),
        "Ticket 2", "Desc 1234567890", 2, 2, Priority.P2, PriorityExplanation.empty(), sla, now.minus(15, ChronoUnit.SECONDS)
    );
    assertTrue(batchScheduler.shouldFlush(List.of(old), now));

    // List with 5 tickets -> should flush immediately
    Incident t3 = Incident.createWithNumber(UUID.randomUUID(), "INC-2026-000993", UUID.randomUUID(), UUID.randomUUID(), "Ticket 3", "Desc 1234567890", 2, 2, Priority.P3, PriorityExplanation.empty(), sla, now);
    Incident t4 = Incident.createWithNumber(UUID.randomUUID(), "INC-2026-000994", UUID.randomUUID(), UUID.randomUUID(), "Ticket 4", "Desc 1234567890", 2, 2, Priority.P3, PriorityExplanation.empty(), sla, now);
    Incident t5 = Incident.createWithNumber(UUID.randomUUID(), "INC-2026-000995", UUID.randomUUID(), UUID.randomUUID(), "Ticket 5", "Desc 1234567890", 2, 2, Priority.P3, PriorityExplanation.empty(), sla, now);
    assertTrue(batchScheduler.shouldFlush(List.of(fresh, t3, t4, t5, old), now));
  }

  @Test
  void testAtomicSqlCapacityReservation() {
    UUID vikramId = UUID.fromString("019299a0-0000-7000-8000-000000000003");
    Instant now = clockPort.now();

    // Vikram initially has points = 1.0, capacity = 8.0
    // Try reserving 2.0 points (1.0 + 2.0 = 3.0 <= 8.0) -> Should succeed
    boolean reserved = capacityReservationPort.reserveLoad(vikramId, 2.0, now);
    assertTrue(reserved, "Should reserve 2.0 capacity points");

    // Try reserving 10.0 points (3.0 + 10.0 = 13.0 > 8.0) -> Should fail
    boolean overbooked = capacityReservationPort.reserveLoad(vikramId, 10.0, now);
    assertFalse(overbooked, "Should fail when exceeding capacity");

    // Release 2.0 points back
    capacityReservationPort.releaseLoad(vikramId, 2.0, now);
  }
}
