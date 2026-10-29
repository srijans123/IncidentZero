package edu.campus.iitsm.incident.domain;

import edu.campus.iitsm.incident.api.IncidentEvents.*;
import edu.campus.iitsm.shared.domain.DomainEvent;
import edu.campus.iitsm.shared.domain.WorkingTimeCalculator;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

final class PendingUserState implements IncidentState {
  static final PendingUserState INSTANCE = new PendingUserState();
  private PendingUserState() {}
  @Override public IncidentStatus status() { return IncidentStatus.PENDING_USER; }
  @Override public Set<CommandType> allowedCommands(Incident inc) {
    return EnumSet.of(CommandType.PROVIDE_USER_INFO, CommandType.CANCEL);
  }
  @Override public TransitionResult provideUserInfo(Incident inc, UUID reporter, Instant now) {
    StateSupport.requireReporter(inc, reporter, "provideUserInfo");
    inc.resumeResolution(now);
    return new TransitionResult(InProgressState.INSTANCE, List.of(new UserInfoProvided(inc.id(), now, reporter)));
  }
  @Override public TransitionResult cancel(Incident inc, UUID actor, String reason, Instant now, WorkingTimeCalculator cal) {
    return StateSupport.cancel(inc, actor, reason, now, cal);
  }
}
