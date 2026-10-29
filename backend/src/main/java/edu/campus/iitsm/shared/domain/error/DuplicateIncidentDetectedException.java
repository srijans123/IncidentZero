package edu.campus.iitsm.shared.domain.error;

import java.util.UUID;

public final class DuplicateIncidentDetectedException extends ItsmException {
  public DuplicateIncidentDetectedException(UUID masterId) {
    super("ITSM-4092", 409, "Duplicate incident linked to master: " + masterId);
  }
}
