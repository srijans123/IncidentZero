package edu.campus.iitsm.assignment.application.strategy;

import edu.campus.iitsm.assignment.api.AssignmentRationale;
import edu.campus.iitsm.assignment.domain.AssignmentStrategy;
import edu.campus.iitsm.assignment.domain.TechnicianCandidate;
import edu.campus.iitsm.incident.domain.Priority;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public class HybridWeightedStrategy implements AssignmentStrategy {

  @Override
  public String name() {
    return "HybridWeighted";
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

    record ScoredCandidate(TechnicianCandidate candidate, double total, double skill, double load, double exp, double speed) {}
    List<ScoredCandidate> scored = new ArrayList<>();
    for (TechnicianCandidate c : eligible) {
      double skill = StrategySupport.calculateSkillMatch(requiredSkills, c);
      double load = 1.0 - c.loadRatio();
      double exp = Math.min(1.0, c.resolvedOnService90d() / 10.0);
      double speed = StrategySupport.calculateSpeed(c);
      double total = 0.40 * skill + 0.25 * load + 0.20 * exp + 0.15 * speed;
      scored.add(new ScoredCandidate(c, total, skill, load, exp, speed));
    }

    scored.sort((a, b) -> {
      int cmp = Double.compare(b.total(), a.total());
      if (cmp != 0) return cmp;
      return a.candidate().technicianId().compareTo(b.candidate().technicianId());
    });

    ScoredCandidate best = scored.get(0);
    List<AssignmentRationale.CandidateScore> top = scored.stream()
        .limit(3)
        .map(s -> new AssignmentRationale.CandidateScore(
            s.candidate().technicianId(),
            s.candidate().name(),
            s.total(),
            s.skill(),
            s.load(),
            s.exp(),
            s.speed()
        ))
        .toList();

    AssignmentRationale rationale = new AssignmentRationale(
        name(),
        best.candidate().technicianId(),
        best.total(),
        top,
        List.of("onShift", "loadCapacity", "teamMatch", "weightedScore")
    );
    return Optional.of(rationale);
  }
}
