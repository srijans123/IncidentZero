package edu.campus.iitsm.incident.domain;

import java.util.EnumSet;
import java.util.Set;

final class CancelledState implements IncidentState {
  static final CancelledState INSTANCE = new CancelledState();
  private CancelledState() {}
  @Override public IncidentStatus status() { return IncidentStatus.CANCELLED; }
  @Override public Set<CommandType> allowedCommands(Incident inc) { return EnumSet.noneOf(CommandType.class); }
}
