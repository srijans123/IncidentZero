package edu.campus.iitsm.incident.domain;

import edu.campus.iitsm.shared.domain.DomainEvent;
import java.util.List;

public record TransitionResult(IncidentState nextState, List<DomainEvent> events) {}
