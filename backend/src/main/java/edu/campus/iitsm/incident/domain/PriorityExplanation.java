package edu.campus.iitsm.incident.domain;

import java.util.ArrayList;
import java.util.List;

public record PriorityExplanation(List<PriorityStep> steps) {
  public PriorityExplanation { steps = List.copyOf(steps); }
  public static PriorityExplanation empty() { return new PriorityExplanation(List.of()); }
  public PriorityExplanation with(PriorityStep step) {
    List<PriorityStep> next = new ArrayList<>(steps);
    next.add(step);
    return new PriorityExplanation(next);
  }
}
