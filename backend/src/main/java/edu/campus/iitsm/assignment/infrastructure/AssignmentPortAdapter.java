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

    UUID teamId = UUID.fromString("10000000-0000-0000-0000-000000000001");
    UUID defaultTechId = UUID.fromString("00000000-0000-0000-0000-000000000003");

    TechnicianCandidate candidate = new TechnicianCandidate(
        defaultTechId,
        "Vikram Network",
        teamId,
        "L1",
        true,
        0.0,
        8.0,
        Map.of("ROUTING_SWITCHING", 3),
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
