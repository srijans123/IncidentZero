package edu.campus.iitsm.incident.domain;

import edu.campus.iitsm.incident.api.IncidentEvents.*;
import edu.campus.iitsm.shared.domain.WorkingTimeCalculator;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

final class AcknowledgedState implements IncidentState {
  static final AcknowledgedState INSTANCE = new AcknowledgedState();
  private AcknowledgedState() {}
  @Override public IncidentStatus status() { return IncidentStatus.ACKNOWLEDGED; }
  @Override public Set<CommandType> allowedCommands(Incident inc) {
    return EnumSet.of(CommandType.START_INVESTIGATION, CommandType.REASSIGN, CommandType.LINK_AS_CHILD,
        CommandType.CANCEL, CommandType.DECLARE_MAJOR, CommandType.REPRIORITIZE);
  }
  @Override public TransitionResult startInvestigation(Incident inc, UUID actor, Instant now, WorkingTimeCalculator cal) {
    StateSupport.requireAssignee(inc, actor, "startInvestigation");
    inc.stopResponse(now, cal, true);
    return new TransitionResult(InProgressState.INSTANCE, List.of(new InvestigationStarted(inc.id(), now, actor)));
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
