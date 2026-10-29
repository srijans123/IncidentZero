package edu.campus.iitsm.shared.domain.error;

import java.util.UUID;

public final class UnauthorizedOperationException extends ItsmException {
  private final UUID actorId;
  private final String operation;

  public UnauthorizedOperationException(UUID actorId, String operation) {
    super("ITSM-4030", 403, "Actor " + actorId + " is not authorized to perform " + operation);
    this.actorId = actorId;
    this.operation = operation;
  }
  public UUID actorId() { return actorId; }
  public String operation() { return operation; }
}
