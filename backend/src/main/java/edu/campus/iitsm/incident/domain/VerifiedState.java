package edu.campus.iitsm.incident.domain;

import edu.campus.iitsm.incident.api.IncidentEvents.*;
import edu.campus.iitsm.shared.domain.DomainEvent;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

final class VerifiedState implements IncidentState {
  static final VerifiedState INSTANCE = new VerifiedState();
  private VerifiedState() {}
  @Override public IncidentStatus status() { return IncidentStatus.VERIFIED; }
  @Override public Set<CommandType> allowedCommands(Incident inc) { return EnumSet.of(CommandType.CLOSE); }
  @Override public TransitionResult close(Incident inc, UUID actor, String closureNote, Instant now) {
    String note = StateSupport.requireText("closureNote", closureNote);
    inc.markClosed(note, now);
    return new TransitionResult(ClosedState.INSTANCE, List.of(new IncidentClosed(inc.id(), now, actor)));
  }
}
