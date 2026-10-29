package edu.campus.iitsm.incident.application.priority;

import edu.campus.iitsm.incident.domain.Priority;
import edu.campus.iitsm.incident.domain.PriorityExplanation;
import edu.campus.iitsm.incident.domain.PriorityStep;
import java.util.List;

public final class ProductScorePriorityStrategy implements PriorityStrategy {
  @Override public String name() { return "PRODUCT_SCORE"; }

  @Override
  public PriorityResult calculate(PriorityInput in) {
    int crit = switch (in.serviceTier()) {
      case "T0" -> 3;
      case "T1" -> 2;
      default -> 1;
    };
    int score = in.impact() * in.urgency() * crit;
    Priority p = score >= 18 ? Priority.P1 : score >= 9 ? Priority.P2 : score >= 4 ? Priority.P3 : Priority.P4;
    PriorityExplanation ex = new PriorityExplanation(List.of(
        new PriorityStep("PRODUCT_SCORE", null, p, "score = " + score)));
    return new PriorityResult(p, ex, p == Priority.P1);
  }
}
