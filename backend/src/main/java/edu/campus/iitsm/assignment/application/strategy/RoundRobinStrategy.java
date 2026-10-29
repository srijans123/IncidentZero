package edu.campus.iitsm.assignment.application.strategy;

import edu.campus.iitsm.assignment.api.AssignmentRationale;
import edu.campus.iitsm.assignment.domain.AssignmentStrategy;
import edu.campus.iitsm.assignment.domain.TechnicianCandidate;
import edu.campus.iitsm.incident.domain.Priority;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

public class RoundRobinStrategy implements AssignmentStrategy {

  private final Map<UUID, AtomicInteger> teamCursors = new ConcurrentHashMap<>();

  @Override
  public String name() {
    return "RoundRobin";
  }

  @Override
  public Optional<AssignmentRationale> selectTechnician(
      UUID incidentId,
      UUID serviceId,
      UUID ownerTeamId,
      Priority priority,
      double ticketWeight,
      Set<String> requiredSkills,
      List<TechnicianCandidate> candidates
  ) {
    List<TechnicianCandidate> eligible = StrategySupport.filterEligible(ownerTeamId, ticketWeight, requiredSkills, candidates);
    if (eligible.isEmpty()) return Optional.empty();

    eligible.sort(Comparator.comparing(TechnicianCandidate::technicianId));
    UUID teamKey = ownerTeamId != null ? ownerTeamId : eligible.get(0).teamId();
    AtomicInteger cursor = teamCursors.computeIfAbsent(teamKey, k -> new AtomicInteger(0));
    int index = Math.abs(cursor.getAndIncrement() % eligible.size());
    TechnicianCandidate chosen = eligible.get(index);

    AssignmentRationale rationale = new AssignmentRationale(
        name(),
        chosen.technicianId(),
        1.0,
        List.of(new AssignmentRationale.CandidateScore(chosen.technicianId(), chosen.name(), 1.0, 1.0, 1.0 - chosen.loadRatio(), 0.0, 0.0)),
        List.of("onShift", "loadCapacity", "teamMatch")
    );
    return Optional.of(rationale);
  }
}
