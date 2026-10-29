package edu.campus.iitsm.incident.domain;

import edu.campus.iitsm.incident.api.IncidentEvents.*;
import edu.campus.iitsm.shared.domain.Actors;
import edu.campus.iitsm.shared.domain.WorkingTimeCalculator;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

final class ClassifiedState implements IncidentState {
  static final ClassifiedState INSTANCE = new ClassifiedState();
  private ClassifiedState() {}
  @Override public IncidentStatus status() { return IncidentStatus.CLASSIFIED; }
  @Override public Set<CommandType> allowedCommands(Incident inc) {
    EnumSet<CommandType> s = EnumSet.of(CommandType.CANCEL);
    if (inc.parentId() != null) {
      s.add(CommandType.UNLINK_FROM_MASTER);
      s.add(CommandType.RESOLVE_WITH_MASTER);
    } else {
      s.addAll(EnumSet.of(CommandType.ASSIGN, CommandType.LINK_AS_CHILD, CommandType.DECLARE_MAJOR, CommandType.REPRIORITIZE));
    }
    return s;
  }
  @Override public TransitionResult assign(Incident inc, UUID assigneeId, UUID teamId, String strategy, UUID actor, Instant now) {
    if (inc.parentId() != null) throw StateSupport.illegal(inc, status(), CommandType.ASSIGN);
    StateSupport.requireNonNull("assigneeId", assigneeId);
    String how = StateSupport.requireText("strategy", strategy);
    inc.setAssignee(assigneeId, teamId);
    return new TransitionResult(AssignedState.INSTANCE, List.of(new IncidentAssigned(inc.id(), now, assigneeId, teamId, how, actor)));
  }
  @Override public TransitionResult resolveWithMaster(Incident inc, Resolution masterResolution, Instant now, WorkingTimeCalculator cal) {
    if (inc.parentId() == null) throw StateSupport.illegal(inc, status(), CommandType.RESOLVE_WITH_MASTER);
    StateSupport.requireNonNull("masterResolution", masterResolution);
    inc.setResolution(masterResolution);
    inc.stopResponse(now, cal, false);
    inc.stopResolution(now, cal, false);
    return new TransitionResult(ResolvedState.INSTANCE, List.of(new IncidentResolved(inc.id(), now, Actors.SYSTEM, masterResolution)));
  }
  @Override public TransitionResult cancel(Incident inc, UUID actor, String reason, Instant now, WorkingTimeCalculator cal) {
    return StateSupport.cancel(inc, actor, reason, now, cal);
  }
  @Override public TransitionResult linkAsChild(Incident inc, UUID masterId, Instant now, WorkingTimeCalculator cal) {
    return StateSupport.link(this, inc, masterId, now, cal);
  }
  @Override public TransitionResult unlinkFromMaster(Incident inc, String reason, Instant now) { return StateSupport.unlink(this, inc, reason, now); }
  @Override public TransitionResult declareMajor(Incident inc, UUID actor, SlaSnapshot p1Sla, Instant now, WorkingTimeCalculator cal) {
    return StateSupport.declareMajor(this, inc, actor, p1Sla, now, cal);
  }
  @Override public TransitionResult reprioritize(Incident inc, Priority p, PriorityExplanation e, SlaSnapshot sla, String reason, UUID actor, Instant now, WorkingTimeCalculator cal) {
    return StateSupport.reprioritize(this, inc, p, e, sla, reason, actor, now, cal);
  }
}
