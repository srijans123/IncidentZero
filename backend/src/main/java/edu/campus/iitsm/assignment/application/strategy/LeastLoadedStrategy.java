package edu.campus.iitsm.assignment.application.strategy;

import edu.campus.iitsm.assignment.api.AssignmentRationale;
import edu.campus.iitsm.assignment.domain.AssignmentStrategy;
import edu.campus.iitsm.assignment.domain.TechnicianCandidate;
import edu.campus.iitsm.incident.domain.Priority;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public class LeastLoadedStrategy implements AssignmentStrategy {

  @Override
  public String name() {
    return "LeastLoaded";
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

    eligible.sort(Comparator
        .comparingDouble(TechnicianCandidate::loadRatio)
        .thenComparing(TechnicianCandidate::technicianId));

    TechnicianCandidate chosen = eligible.get(0);
    double score = 1.0 - chosen.loadRatio();

    AssignmentRationale rationale = new AssignmentRationale(
        name(),
        chosen.technicianId(),
        score,
        List.of(new AssignmentRationale.CandidateScore(chosen.technicianId(), chosen.name(), score, 1.0, score, 0.0, 0.0)),
        List.of("onShift", "loadCapacity", "teamMatch", "leastLoadedRatio")
    );
    return Optional.of(rationale);
  }
}
