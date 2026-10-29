package edu.campus.iitsm.incident.application.priority;

import edu.campus.iitsm.incident.domain.Priority;
import edu.campus.iitsm.incident.domain.PriorityExplanation;

public record PriorityResult(Priority priority, PriorityExplanation explanation, boolean major) {}
