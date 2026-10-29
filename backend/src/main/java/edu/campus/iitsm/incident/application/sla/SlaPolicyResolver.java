package edu.campus.iitsm.incident.application.sla;

import edu.campus.iitsm.incident.domain.ClockMode;
import edu.campus.iitsm.incident.domain.Priority;
import edu.campus.iitsm.incident.domain.SlaSnapshot;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SlaPolicyResolver {

  private record SlaKey(String tier, Priority priority) {}
  private final Map<SlaKey, SlaSnapshot> policies = new ConcurrentHashMap<>();

  public SlaPolicyResolver() {
    register("T0", Priority.P1, UUID.fromString("40000000-0000-0000-0000-000000000001"), 5, 30, ClockMode.CONTINUOUS_24X7);
    register("T0", Priority.P2, UUID.fromString("40000000-0000-0000-0000-000000000002"), 10, 90, ClockMode.CONTINUOUS_24X7);
    register("T0", Priority.P3, UUID.fromString("40000000-0000-0000-0000-000000000003"), 30, 360, ClockMode.BUSINESS_HOURS);
    register("T0", Priority.P4, UUID.fromString("40000000-0000-0000-0000-000000000004"), 120, 960, ClockMode.BUSINESS_HOURS);

    register("T1", Priority.P1, UUID.fromString("40000000-0000-0000-0000-000000000005"), 5, 30, ClockMode.CONTINUOUS_24X7);
    register("T1", Priority.P2, UUID.fromString("40000000-0000-0000-0000-000000000006"), 15, 120, ClockMode.CONTINUOUS_24X7);
    register("T1", Priority.P3, UUID.fromString("40000000-0000-0000-0000-000000000007"), 60, 480, ClockMode.BUSINESS_HOURS);
    register("T1", Priority.P4, UUID.fromString("40000000-0000-0000-0000-000000000008"), 240, 1440, ClockMode.BUSINESS_HOURS);

    register("T2", Priority.P1, UUID.fromString("40000000-0000-0000-0000-000000000009"), 10, 60, ClockMode.BUSINESS_HOURS);
    register("T2", Priority.P2, UUID.fromString("40000000-0000-0000-0000-000000000010"), 30, 240, ClockMode.BUSINESS_HOURS);
    register("T2", Priority.P3, UUID.fromString("40000000-0000-0000-0000-000000000011"), 120, 720, ClockMode.BUSINESS_HOURS);
    register("T2", Priority.P4, UUID.fromString("40000000-0000-0000-0000-000000000012"), 480, 2880, ClockMode.BUSINESS_HOURS);

    register("T3", Priority.P1, UUID.fromString("40000000-0000-0000-0000-000000000013"), 15, 120, ClockMode.BUSINESS_HOURS);
    register("T3", Priority.P2, UUID.fromString("40000000-0000-0000-0000-000000000014"), 60, 480, ClockMode.BUSINESS_HOURS);
    register("T3", Priority.P3, UUID.fromString("40000000-0000-0000-0000-000000000015"), 240, 1440, ClockMode.BUSINESS_HOURS);
    register("T3", Priority.P4, UUID.fromString("40000000-0000-0000-0000-000000000016"), 480, 4320, ClockMode.BUSINESS_HOURS);
  }

  private void register(String tier, Priority priority, UUID id, long respMinutes, long resMinutes, ClockMode mode) {
    policies.put(new SlaKey(tier, priority), new SlaSnapshot(id, tier, respMinutes * 60_000L, resMinutes * 60_000L, mode));
  }

  public SlaSnapshot resolve(String tier, Priority priority) {
    String cleanTier = (tier == null || tier.isBlank()) ? "T2" : tier.toUpperCase();
    Priority cleanPriority = (priority == null) ? Priority.P3 : priority;
    SlaSnapshot snapshot = policies.get(new SlaKey(cleanTier, cleanPriority));
    if (snapshot == null) {
      snapshot = policies.get(new SlaKey("T2", cleanPriority));
    }
    if (snapshot == null) {
      snapshot = policies.get(new SlaKey("T2", Priority.P3));
    }
    return snapshot;
  }
}
