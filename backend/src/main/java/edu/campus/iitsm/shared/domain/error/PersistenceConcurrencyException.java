package edu.campus.iitsm.shared.domain.error;

import java.util.UUID;

public final class PersistenceConcurrencyException extends ItsmException {
  public PersistenceConcurrencyException(UUID entityId) {
    super("ITSM-4093", 409, "Concurrent modification detected for entity: " + entityId);
  }
}
