package edu.campus.iitsm.incident.domain;

import edu.campus.iitsm.incident.api.IncidentEvents.*;
import edu.campus.iitsm.shared.domain.DomainEvent;
import edu.campus.iitsm.shared.domain.WorkingTimeCalculator;
import edu.campus.iitsm.shared.domain.error.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

final class StateSupport {
  private StateSupport() {}

  static InvalidStateTransitionException illegal(Incident inc, IncidentStatus status, CommandType command) {
    return new InvalidStateTransitionException(inc.id(), status.name(), command.name());
  }

  static void requireAssignee(Incident inc, UUID actor, String operation) {
    if (inc.assigneeId() == null || !inc.assigneeId().equals(actor)) {
      throw new UnauthorizedOperationException(actor, operation);
    }
  }

  static void requireReporter(Incident inc, UUID actor, String operation) {
    if (!inc.reporterId().equals(actor)) {
      throw new UnauthorizedOperationException(actor, operation);
    }
  }

  static String requireText(String field, String value) {
    if (value == null || value.isBlank()) throw new InvalidIncidentPayloadException(field, "must not be blank");
    return value.strip();
  }

  static <T> T requireNonNull(String field, T value) {
    if (value == null) throw new InvalidIncidentPayloadException(field, "is required");
    return value;
  }

  static TransitionResult reassign(Incident inc, UUID newAssignee, UUID teamId, String reason, UUID actor, Instant now) {
    requireNonNull("newAssigneeId", newAssignee);
    String why = requireText("reason", reason);
    if (newAssignee.equals(inc.assigneeId())) {
      throw new InvalidIncidentPayloadException("newAssigneeId", "must differ from the current assignee");
    }
    UUID previous = inc.assigneeId();
    inc.setAssignee(newAssignee, teamId);
    inc.incrementReassignCount();
    return new TransitionResult(AssignedState.INSTANCE,
        List.of(new IncidentReassigned(inc.id(), now, previous, newAssignee, why, actor)));
  }

  static TransitionResult cancel(Incident inc, UUID actor, String reason, Instant now, WorkingTimeCalculator cal) {
    String why = requireText("reason", reason);
    inc.stopResponse(now, cal, false);
    inc.stopResolution(now, cal, false);
    return new TransitionResult(CancelledState.INSTANCE, List.of(new IncidentCancelled(inc.id(), now, actor, why)));
  }

  static TransitionResult link(IncidentState self, Incident inc, UUID masterId, Instant now, WorkingTimeCalculator cal) {
    if (inc.parentId() != null) throw illegal(inc, self.status(), CommandType.LINK_AS_CHILD);
    requireNonNull("masterId", masterId);
    if (masterId.equals(inc.id())) {
      throw new InvalidIncidentPayloadException("masterId", "an incident cannot be its own master");
    }
    inc.linkToMaster(masterId, now, cal);
    IncidentState nextState = (self == NewState.INSTANCE) ? NewState.INSTANCE : ClassifiedState.INSTANCE;
    return new TransitionResult(nextState, List.of(new IncidentLinked(inc.id(), now, masterId)));
  }

  static TransitionResult unlink(IncidentState self, Incident inc, String reason, Instant now) {
    if (inc.parentId() == null) throw illegal(inc, self.status(), CommandType.UNLINK_FROM_MASTER);
    String why = requireText("reason", reason);
    UUID former = inc.parentId();
    inc.unlinkFromMasterInternal(now);
    return new TransitionResult(self, List.of(new IncidentUnlinked(inc.id(), now, former, why)));
  }

  static TransitionResult declareMajor(IncidentState self, Incident inc, UUID actor, SlaSnapshot p1Sla, Instant now, WorkingTimeCalculator cal) {
    if (inc.parentId() != null) throw illegal(inc, self.status(), CommandType.DECLARE_MAJOR);
    requireNonNull("p1Sla", p1Sla);
    if (inc.isMajor()) return new TransitionResult(self, List.of());
    Priority before = inc.priority();
    PriorityExplanation explanation = inc.priorityExplanation()
        .with(new PriorityStep("MAJOR_OVERRIDE", before, Priority.P1, "declared by " + actor));
    inc.applyPriority(Priority.P1, explanation, p1Sla, now, cal);
    inc.setMajor(actor);
    List<DomainEvent> events = (before == Priority.P1)
        ? List.of(new MajorIncidentDeclared(inc.id(), now, actor))
        : List.of(new MajorIncidentDeclared(inc.id(), now, actor),
                  new PriorityChanged(inc.id(), now, before, Priority.P1, "major incident"));
    return new TransitionResult(self, events);
  }

  static TransitionResult reprioritize(IncidentState self, Incident inc, Priority newPriority, PriorityExplanation explanation,
      SlaSnapshot sla, String reason, UUID actor, Instant now, WorkingTimeCalculator cal) {
    if (inc.parentId() != null) throw illegal(inc, self.status(), CommandType.REPRIORITIZE);
    requireNonNull("priority", newPriority);
    requireNonNull("explanation", explanation);
    requireNonNull("sla", sla);
    String why = requireText("reason", reason);
    Priority before = inc.priority();
    inc.applyPriority(newPriority, explanation, sla, now, cal);
    List<DomainEvent> events = (before == newPriority) ? List.of()
        : List.of(new PriorityChanged(inc.id(), now, before, newPriority, why));
    return new TransitionResult(self, events);
  }
}
