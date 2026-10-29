package edu.campus.iitsm.incident.domain;

import java.util.EnumSet;
import java.util.Set;

final class ClosedState implements IncidentState {
  static final ClosedState INSTANCE = new ClosedState();
  private ClosedState() {}
  @Override public IncidentStatus status() { return IncidentStatus.CLOSED; }
  @Override public Set<CommandType> allowedCommands(Incident inc) { return EnumSet.noneOf(CommandType.class); }
}
