package edu.campus.iitsm.incident.domain;

import edu.campus.iitsm.incident.api.IncidentEvents.*;
import edu.campus.iitsm.shared.domain.WorkingTimeCalculator;
import edu.campus.iitsm.shared.domain.error.InvalidIncidentPayloadException;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

final class InProgressState implements IncidentState {
  static final InProgressState INSTANCE = new InProgressState();
  private InProgressState() {}
  @Override public IncidentStatus status() { return IncidentStatus.IN_PROGRESS; }
  @Override public Set<CommandType> allowedCommands(Incident inc) {
    return EnumSet.of(CommandType.REQUEST_USER_INFO, CommandType.RESOLVE, CommandType.REASSIGN,
        CommandType.LINK_AS_CHILD, CommandType.CANCEL, CommandType.DECLARE_MAJOR, CommandType.REPRIORITIZE);
  }
  @Override public TransitionResult requestUserInfo(Incident inc, UUID actor, String question, Instant now, WorkingTimeCalculator cal) {
    StateSupport.requireAssignee(inc, actor, "requestUserInfo");
    String q = StateSupport.requireText("question", question);
    inc.pauseResolution(now, cal);
    return new TransitionResult(PendingUserState.INSTANCE, List.of(new UserInfoRequested(inc.id(), now, actor, q)));
  }
  @Override public TransitionResult resolve(Incident inc, UUID actor, Resolution resolution, Instant now, WorkingTimeCalculator cal) {
    StateSupport.requireAssignee(inc, actor, "resolve");
    StateSupport.requireNonNull("resolution", resolution);
    if (inc.priority().isCritical() && !resolution.hasRootCause()) {
      throw new InvalidIncidentPayloadException("resolution.rootCauseCategory", "is mandatory for P1 and P2");
    }
    inc.setResolution(resolution);
    inc.stopResolution(now, cal, true);
    return new TransitionResult(ResolvedState.INSTANCE, List.of(new IncidentResolved(inc.id(), now, actor, resolution)));
  }
  @Override public TransitionResult reassign(Incident inc, UUID n, UUID teamId, String reason, UUID actor, Instant now) {
    return StateSupport.reassign(inc, n, teamId, reason, actor, now);
  }
  @Override public TransitionResult linkAsChild(Incident inc, UUID masterId, Instant now, WorkingTimeCalculator cal) {
    return StateSupport.link(this, inc, masterId, now, cal);
  }
  @Override public TransitionResult cancel(Incident inc, UUID actor, String reason, Instant now, WorkingTimeCalculator cal) {
    return StateSupport.cancel(inc, actor, reason, now, cal);
  }
  @Override public TransitionResult declareMajor(Incident inc, UUID actor, SlaSnapshot p1Sla, Instant now, WorkingTimeCalculator cal) {
    return StateSupport.declareMajor(this, inc, actor, p1Sla, now, cal);
  }
  @Override public TransitionResult reprioritize(Incident inc, Priority p, PriorityExplanation e, SlaSnapshot sla, String reason, UUID actor, Instant now, WorkingTimeCalculator cal) {
    return StateSupport.reprioritize(this, inc, p, e, sla, reason, actor, now, cal);
  }
}
