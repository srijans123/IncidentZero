package edu.campus.iitsm.incident.domain;

public final class IncidentStates {
  private IncidentStates() {}
  public static IncidentState of(IncidentStatus status) {
    return switch (status) {
      case NEW -> NewState.INSTANCE;
      case CLASSIFIED -> ClassifiedState.INSTANCE;
      case ASSIGNED -> AssignedState.INSTANCE;
      case ACKNOWLEDGED -> AcknowledgedState.INSTANCE;
      case IN_PROGRESS -> InProgressState.INSTANCE;
      case PENDING_USER -> PendingUserState.INSTANCE;
      case RESOLVED -> ResolvedState.INSTANCE;
      case VERIFIED -> VerifiedState.INSTANCE;
      case REOPENED -> ReopenedState.INSTANCE;
      case CLOSED -> ClosedState.INSTANCE;
      case CANCELLED -> CancelledState.INSTANCE;
    };
  }
}
