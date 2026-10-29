package edu.campus.iitsm.incident.domain;

import edu.campus.iitsm.incident.api.IncidentEvents.*;
import edu.campus.iitsm.shared.domain.DomainEvent;
import edu.campus.iitsm.shared.domain.WorkingTimeCalculator;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

final class ReopenedState implements IncidentState {
  static final ReopenedState INSTANCE = new ReopenedState();
  private ReopenedState() {}
  @Override public IncidentStatus status() { return IncidentStatus.REOPENED; }
  @Override public Set<CommandType> allowedCommands(Incident inc) {
    return inc.assigneeId() != null
        ? EnumSet.of(CommandType.START_INVESTIGATION, CommandType.REASSIGN)
        : EnumSet.of(CommandType.REASSIGN);
  }
  @Override public TransitionResult startInvestigation(Incident inc, UUID actor, Instant now, WorkingTimeCalculator cal) {
    if (inc.assigneeId() == null) throw StateSupport.illegal(inc, status(), CommandType.START_INVESTIGATION);
    StateSupport.requireAssignee(inc, actor, "startInvestigation");
    inc.stopResponse(now, cal, true);
    return new TransitionResult(InProgressState.INSTANCE, List.of(new InvestigationStarted(inc.id(), now, actor)));
  }
  @Override public TransitionResult reassign(Incident inc, UUID n, UUID teamId, String reason, UUID actor, Instant now) {
    return StateSupport.reassign(inc, n, teamId, reason, actor, now);
  }
}
