package edu.campus.iitsm.incident.application.priority;

import edu.campus.iitsm.incident.domain.Priority;
import edu.campus.iitsm.incident.domain.PriorityExplanation;
import edu.campus.iitsm.incident.domain.PriorityStep;
import java.util.ArrayList;
import java.util.List;

public final class ItilMatrixPriorityStrategy implements PriorityStrategy {
  private static final Priority[][] MATRIX = {
      {Priority.P4, Priority.P4, Priority.P3},
      {Priority.P4, Priority.P3, Priority.P2},
      {Priority.P3, Priority.P2, Priority.P1}
  };

  @Override public String name() { return "ITIL_MATRIX"; }

  @Override
  public PriorityResult calculate(PriorityInput in) {
    List<PriorityStep> steps = new ArrayList<>();
    Priority base = MATRIX[in.impact() - 1][in.urgency() - 1];
    steps.add(new PriorityStep("ITIL_MATRIX_BASE", null, base,
        "Impact " + in.impact() + " x Urgency " + in.urgency() + " -> " + base));

    Priority cur = base;
    int bumps = 0;

    if ("T0".equals(in.serviceTier()) && in.impact() >= 2) {
      Priority next = (bumps == 0) ? cur.bumpOneLevel() : cur;
      bumps++;
      steps.add(new PriorityStep("TIER_T0_BUMP", cur, next,
          bumps == 1 ? "T0 core service with impact >= 2 (+1)" : "Capped at +1 total modifier bump"));
      cur = next;
    }
    if (in.affectedUsers() >= 50) {
      Priority next = (bumps == 0) ? cur.bumpOneLevel() : cur;
      bumps++;
      steps.add(new PriorityStep("AFFECTED_USERS_50", cur, next,
          bumps == 1 ? "Affected users >= 50 (+1)" : "Capped at +1 total modifier bump"));
      cur = next;
    }
    if (in.activeCalendarWindow()) {
      Priority next = (bumps == 0) ? cur.bumpOneLevel() : cur;
      bumps++;
      steps.add(new PriorityStep("CALENDAR_WINDOW", cur, next,
          bumps == 1 ? "Active exam/registration window (+1)" : "Capped at +1 total modifier bump"));
      cur = next;
    }
    if (in.securityCategory() && (cur == Priority.P3 || cur == Priority.P4)) {
      steps.add(new PriorityStep("SECURITY_FLOOR", cur, Priority.P2, "Security category has floor P2"));
      cur = Priority.P2;
    }

    boolean major = in.affectedUsers() >= 200
        || in.linkedReportsIn15Min() >= 10
        || ("T0".equals(in.serviceTier()) && in.impact() == 3);
    if (major) {
      steps.add(new PriorityStep("MAJOR_OVERRIDE", cur, Priority.P1, "Major incident threshold triggered"));
      cur = Priority.P1;
    }
    return new PriorityResult(cur, new PriorityExplanation(steps), major);
  }
}
