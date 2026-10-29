package edu.campus.iitsm.incident.application.priority;

import edu.campus.iitsm.incident.domain.Priority;
import edu.campus.iitsm.incident.domain.PriorityExplanation;
import edu.campus.iitsm.incident.domain.PriorityStep;
import java.util.List;

public final class WeightedScorePriorityStrategy implements PriorityStrategy {
  @Override public String name() { return "WEIGHTED_SCORE"; }

  @Override
  public PriorityResult calculate(PriorityInput in) {
    int crit = switch (in.serviceTier()) {
      case "T0" -> 3;
      case "T1" -> 2;
      default -> 1;
    };
    double userTerm = Math.min(1.0, Math.log(1.0 + in.affectedUsers()) / Math.log(201.0));
    double score = 100.0 * (0.35 * ((in.impact() - 1) / 2.0)
        + 0.30 * ((in.urgency() - 1) / 2.0)
        + 0.20 * ((crit - 1) / 2.0)
        + 0.15 * userTerm);
    Priority p = score >= 70.0 ? Priority.P1 : score >= 50.0 ? Priority.P2 : score >= 30.0 ? Priority.P3 : Priority.P4;
    PriorityExplanation ex = new PriorityExplanation(List.of(
        new PriorityStep("WEIGHTED_SCORE", null, p, String.format("score = %.2f", score))));
    return new PriorityResult(p, ex, score >= 85.0);
  }
}
