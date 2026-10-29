package edu.campus.iitsm.incident.domain;

import edu.campus.iitsm.shared.domain.WorkingTimeCalculator;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public sealed interface IncidentState
    permits NewState, ClassifiedState, AssignedState, AcknowledgedState, InProgressState,
            PendingUserState, ResolvedState, VerifiedState, ReopenedState, ClosedState, CancelledState {

  IncidentStatus status();
  Set<CommandType> allowedCommands(Incident inc);

  default TransitionResult classify(Incident inc, UUID categoryId, Priority priority, PriorityExplanation explanation,
      SlaSnapshot sla, UUID actor, Instant now, WorkingTimeCalculator cal) {
    throw StateSupport.illegal(inc, status(), CommandType.CLASSIFY);
  }
  default TransitionResult assign(Incident inc, UUID assigneeId, UUID teamId, String strategy, UUID actor, Instant now) {
    throw StateSupport.illegal(inc, status(), CommandType.ASSIGN);
  }
  default TransitionResult reassign(Incident inc, UUID newAssigneeId, UUID teamId, String reason, UUID actor, Instant now) {
    throw StateSupport.illegal(inc, status(), CommandType.REASSIGN);
  }
  default TransitionResult acknowledge(Incident inc, UUID actor, Instant now, WorkingTimeCalculator cal) {
    throw StateSupport.illegal(inc, status(), CommandType.ACKNOWLEDGE);
  }
  default TransitionResult startInvestigation(Incident inc, UUID actor, Instant now, WorkingTimeCalculator cal) {
    throw StateSupport.illegal(inc, status(), CommandType.START_INVESTIGATION);
  }
  default TransitionResult requestUserInfo(Incident inc, UUID actor, String question, Instant now, WorkingTimeCalculator cal) {
    throw StateSupport.illegal(inc, status(), CommandType.REQUEST_USER_INFO);
  }
  default TransitionResult provideUserInfo(Incident inc, UUID reporter, Instant now) {
    throw StateSupport.illegal(inc, status(), CommandType.PROVIDE_USER_INFO);
  }
  default TransitionResult resolve(Incident inc, UUID actor, Resolution resolution, Instant now, WorkingTimeCalculator cal) {
    throw StateSupport.illegal(inc, status(), CommandType.RESOLVE);
  }
  default TransitionResult verify(Incident inc, UUID actor, Integer rating, Instant now) {
    throw StateSupport.illegal(inc, status(), CommandType.VERIFY);
  }
  default TransitionResult rejectResolution(Incident inc, UUID reporter, String reason, Instant now) {
    throw StateSupport.illegal(inc, status(), CommandType.REJECT_RESOLUTION);
  }
  default TransitionResult close(Incident inc, UUID actor, String closureNote, Instant now) {
    throw StateSupport.illegal(inc, status(), CommandType.CLOSE);
  }
  default TransitionResult resolveWithMaster(Incident inc, Resolution masterResolution, Instant now, WorkingTimeCalculator cal) {
    throw StateSupport.illegal(inc, status(), CommandType.RESOLVE_WITH_MASTER);
  }
  default TransitionResult linkAsChild(Incident inc, UUID masterId, Instant now, WorkingTimeCalculator cal) {
    throw StateSupport.illegal(inc, status(), CommandType.LINK_AS_CHILD);
  }
  default TransitionResult unlinkFromMaster(Incident inc, String reason, Instant now) {
    throw StateSupport.illegal(inc, status(), CommandType.UNLINK_FROM_MASTER);
  }
  default TransitionResult declareMajor(Incident inc, UUID actor, SlaSnapshot p1Sla, Instant now, WorkingTimeCalculator cal) {
    throw StateSupport.illegal(inc, status(), CommandType.DECLARE_MAJOR);
  }
  default TransitionResult reprioritize(Incident inc, Priority newPriority, PriorityExplanation explanation, SlaSnapshot sla,
      String reason, UUID actor, Instant now, WorkingTimeCalculator cal) {
    throw StateSupport.illegal(inc, status(), CommandType.REPRIORITIZE);
  }
  default TransitionResult cancel(Incident inc, UUID actor, String reason, Instant now, WorkingTimeCalculator cal) {
    throw StateSupport.illegal(inc, status(), CommandType.CANCEL);
  }
}
