package edu.campus.iitsm.incident.application.priority;

public interface PriorityStrategy {
  String name();
  PriorityResult calculate(PriorityInput in);
}
