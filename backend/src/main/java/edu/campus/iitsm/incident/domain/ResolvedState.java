package edu.campus.iitsm.incident.domain;

import edu.campus.iitsm.incident.api.IncidentEvents.*;
import edu.campus.iitsm.shared.domain.DomainEvent;
import edu.campus.iitsm.shared.domain.Actors;
import edu.campus.iitsm.shared.domain.error.InvalidIncidentPayloadException;
import edu.campus.iitsm.shared.domain.error.UnauthorizedOperationException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

final class ResolvedState implements IncidentState {
  static final ResolvedState INSTANCE = new ResolvedState();
  private ResolvedState() {}
  @Override public IncidentStatus status() { return IncidentStatus.RESOLVED; }
  @Override public Set<CommandType> allowedCommands(Incident inc) {
    return EnumSet.of(CommandType.VERIFY, CommandType.REJECT_RESOLUTION);
  }
  @Override public TransitionResult verify(Incident inc, UUID actor, Integer rating, Instant now) {
    if (!inc.reporterId().equals(actor) && !Actors.SYSTEM.equals(actor)) {
      throw new UnauthorizedOperationException(actor, "verify");
    }
    if (rating != null && (rating < 1 || rating > 5)) {
      throw new InvalidIncidentPayloadException("rating", "must be between 1 and 5");
    }
    inc.setRating(rating);
    return new TransitionResult(VerifiedState.INSTANCE, List.of(new ResolutionVerified(inc.id(), now, actor, rating)));
  }
  @Override public TransitionResult rejectResolution(Incident inc, UUID reporter, String reason, Instant now) {
    StateSupport.requireReporter(inc, reporter, "rejectResolution");
    String why = StateSupport.requireText("reason", reason);
    UUID formerMaster = inc.parentId();
    inc.reopen(now);
    List<DomainEvent> events = new ArrayList<>();
    events.add(new ResolutionRejected(inc.id(), now, reporter, why));
    if (formerMaster != null) {
      events.add(new IncidentUnlinked(inc.id(), now, formerMaster, "fix rejected by this reporter"));
    }
    return new TransitionResult(ReopenedState.INSTANCE, events);
  }
}
