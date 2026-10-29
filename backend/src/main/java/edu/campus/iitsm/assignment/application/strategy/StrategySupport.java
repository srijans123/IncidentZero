package edu.campus.iitsm.assignment.application.strategy;

import edu.campus.iitsm.assignment.domain.TechnicianCandidate;
import edu.campus.iitsm.incident.domain.Priority;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public final class StrategySupport {

  private StrategySupport() {}

  public static double ticketWeight(Priority p) {
    if (p == null) return 1.0;
    return switch (p) {
      case P1 -> 3.0;
      case P2 -> 2.0;
      case P3 -> 1.0;
      case P4 -> 0.5;
    };
  }

  public static List<TechnicianCandidate> filterEligible(
      UUID ownerTeamId,
      double weight,
      Set<String> requiredSkills,
      List<TechnicianCandidate> candidates
  ) {
    List<TechnicianCandidate> eligible = new ArrayList<>();
    for (TechnicianCandidate c : candidates) {
      if (!c.onShift()) continue;
      if (c.currentLoadPoints() + weight > c.capacityPoints()) continue;
      if (ownerTeamId != null && !ownerTeamId.equals(c.teamId())) continue;
      if (requiredSkills != null && !requiredSkills.isEmpty()) {
        boolean hasAnySkill = requiredSkills.stream()
            .anyMatch(s -> c.skillLevels() != null && c.skillLevels().getOrDefault(s, 0) >= 1);
        if (!hasAnySkill) continue;
      }
      eligible.add(c);
    }
    return eligible;
  }

  public static double calculateSkillMatch(Set<String> requiredSkills, TechnicianCandidate candidate) {
    if (requiredSkills == null || requiredSkills.isEmpty()) return 1.0;
    double sum = 0.0;
    for (String s : requiredSkills) {
      int lvl = candidate.skillLevels() != null ? candidate.skillLevels().getOrDefault(s, 0) : 0;
      sum += Math.min(lvl, 3) / 3.0;
    }
    return sum / requiredSkills.size();
  }

  public static double calculateSpeed(TechnicianCandidate c) {
    double m = 3.0;
    double teamMed = Math.max(1.0, c.teamMedianTtrMinutes());
    double n = Math.max(0, c.categoryResolvedCount());
    double candMed = Math.max(1.0, c.medianTtrMinutes());
    double smoothedTtr = (n * candMed + m * teamMed) / (n + m);
    double ratio = teamMed / Math.max(1.0, smoothedTtr);
    double clamped = Math.max(0.5, Math.min(1.5, ratio));
    return clamped / 1.5;
  }

  public static double calculateHybridScore(
      Set<String> requiredSkills,
      TechnicianCandidate c
  ) {
    double skillScore = calculateSkillMatch(requiredSkills, c);
    double loadScore = 1.0 - c.loadRatio();
    double expScore = Math.min(1.0, c.resolvedOnService90d() / 10.0);
    double speedScore = calculateSpeed(c);
    return 0.40 * skillScore + 0.25 * loadScore + 0.20 * expScore + 0.15 * speedScore;
  }
}
