package edu.campus.iitsm.incident.domain;

import edu.campus.iitsm.incident.api.IncidentEvents.*;
import edu.campus.iitsm.shared.domain.Actors;
import edu.campus.iitsm.shared.domain.WorkingTimeCalculator;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

final class NewState implements IncidentState {
  static final NewState INSTANCE = new NewState();
  private NewState() {}
  @Override public IncidentStatus status() { return IncidentStatus.NEW; }
  @Override public Set<CommandType> allowedCommands(Incident inc) {
    EnumSet<CommandType> s = EnumSet.of(CommandType.CLASSIFY, CommandType.CANCEL);
    if (inc.parentId() != null) {
      s.add(CommandType.UNLINK_FROM_MASTER);
      s.add(CommandType.RESOLVE_WITH_MASTER);
    } else {
      s.add(CommandType.LINK_AS_CHILD);
    }
    return s;
  }
  @Override public TransitionResult classify(Incident inc, UUID categoryId, Priority priority, PriorityExplanation explanation,
      SlaSnapshot sla, UUID actor, Instant now, WorkingTimeCalculator cal) {
    StateSupport.requireNonNull("categoryId", categoryId);
    StateSupport.requireNonNull("priority", priority);
    StateSupport.requireNonNull("explanation", explanation);
    StateSupport.requireNonNull("sla", sla);
    inc.applyClassification(categoryId, priority, explanation, sla, now, cal);
    return new TransitionResult(ClassifiedState.INSTANCE, List.of(new IncidentClassified(inc.id(), now, categoryId, priority, actor)));
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
}
