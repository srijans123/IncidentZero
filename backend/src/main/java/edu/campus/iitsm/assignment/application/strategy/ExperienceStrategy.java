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

public class ExperienceStrategy implements AssignmentStrategy {

  @Override
  public String name() {
    return "Experience";
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
        .comparingInt(TechnicianCandidate::resolvedOnService90d).reversed()
        .thenComparingDouble(TechnicianCandidate::medianTtrMinutes)
        .thenComparing(TechnicianCandidate::technicianId));

    TechnicianCandidate chosen = eligible.get(0);
    double score = Math.min(1.0, chosen.resolvedOnService90d() / 10.0);

    AssignmentRationale rationale = new AssignmentRationale(
        name(),
        chosen.technicianId(),
        score,
        List.of(new AssignmentRationale.CandidateScore(chosen.technicianId(), chosen.name(), score, 0.0, 1.0 - chosen.loadRatio(), score, 0.0)),
        List.of("onShift", "loadCapacity", "teamMatch", "serviceExperience90d")
    );
    return Optional.of(rationale);
  }
}
