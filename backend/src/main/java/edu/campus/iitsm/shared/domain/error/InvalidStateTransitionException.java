package edu.campus.iitsm.shared.domain.error;

import java.util.UUID;

public final class InvalidStateTransitionException extends ItsmException {
  private final UUID incidentId;
  private final String currentState;
  private final String attemptedCommand;

  public InvalidStateTransitionException(UUID incidentId, String currentState, String attemptedCommand) {
    super("ITSM-4090", 409,
        "Command " + attemptedCommand + " is not permitted when incident " + incidentId + " is in state " + currentState);
    this.incidentId = incidentId;
    this.currentState = currentState;
    this.attemptedCommand = attemptedCommand;
  }
  public UUID incidentId() { return incidentId; }
  public String currentState() { return currentState; }
  public String attemptedCommand() { return attemptedCommand; }
}
