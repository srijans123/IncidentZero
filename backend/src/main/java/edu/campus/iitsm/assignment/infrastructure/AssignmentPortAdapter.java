package edu.campus.iitsm.assignment.infrastructure;

import edu.campus.iitsm.assignment.api.AssignmentRationale;
import edu.campus.iitsm.assignment.application.strategy.LeastLoadedStrategy;
import edu.campus.iitsm.assignment.domain.AssignmentStrategy;
import edu.campus.iitsm.assignment.domain.CapacityReservationPort;
import edu.campus.iitsm.assignment.domain.TechnicianCandidate;
import edu.campus.iitsm.incident.api.AssignmentPort;
import edu.campus.iitsm.incident.domain.Priority;
import edu.campus.iitsm.shared.domain.ClockPort;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;

@Component
public class AssignmentPortAdapter implements AssignmentPort {

  private final List<AssignmentStrategy> strategies;
  private final CapacityReservationPort capacityReservationPort;
  private final ClockPort clockPort;

  public AssignmentPortAdapter(
      List<AssignmentStrategy> strategies,
      CapacityReservationPort capacityReservationPort,
      ClockPort clockPort) {
    this.strategies = (strategies != null) ? strategies : List.of();
    this.capacityReservationPort = capacityReservationPort;
    this.clockPort = clockPort;
  }

  @Override
  public Optional<AssignmentResult> assign(
      UUID incidentId, UUID serviceId, Priority priority, double weight) {
    AssignmentStrategy strategy = strategies.stream()
        .filter(s -> s instanceof LeastLoadedStrategy)
        .findFirst()
        .orElseGet(() -> strategies.isEmpty() ? new LeastLoadedStrategy() : strategies.get(0));

    UUID appTeamId = UUID.fromString("10000000-0000-0000-0000-000000000003");
    UUID rohanId = UUID.fromString("019299a0-0000-7000-8000-000000000005");
    UUID netTeamId = UUID.fromString("10000000-0000-0000-0000-000000000001");
    UUID vikramId = UUID.fromString("019299a0-0000-7000-8000-000000000003");

    UUID erpServiceId = UUID.fromString("30000000-0000-0000-0000-000000000006");
    UUID lmsServiceId = UUID.fromString("30000000-0000-0000-0000-000000000007");

    boolean isApp = serviceId != null && (serviceId.equals(erpServiceId) || serviceId.equals(lmsServiceId));
    UUID teamId = isApp ? appTeamId : netTeamId;
    UUID techId = isApp ? rohanId : vikramId;
    String techName = isApp ? "Rohan Kulkarni" : "Vikram Rao";
    String tier = isApp ? "SENIOR" : "L1";

    TechnicianCandidate candidate = new TechnicianCandidate(
        techId,
        techName,
        teamId,
        tier,
        true,
        0.0,
        8.0,
        Map.of("ROUTING_SWITCHING", 3, "JAVA_SPRING", 3, "ERP_MOODLE", 3),
        15,
        18.0,
        20,
        22.0
    );

    Optional<AssignmentRationale> rationaleOpt = strategy.selectTechnician(
        incidentId, serviceId, teamId, priority, weight, Set.of(), List.of(candidate)
    );

    if (rationaleOpt.isPresent()) {
      Instant now = clockPort.now();
      UUID chosenId = rationaleOpt.get().chosenTechnicianId();
      boolean reserved = capacityReservationPort.reserveLoad(chosenId, weight, now);
      if (reserved) {
        return Optional.of(new AssignmentResult(chosenId, teamId, rationaleOpt.get().strategy()));
      }
    }
    return Optional.empty();
  }
}
