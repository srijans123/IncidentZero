package edu.campus.iitsm.shared.domain.error;

import java.util.UUID;

public final class IncidentNotFoundException extends ItsmException {
  public IncidentNotFoundException(UUID incidentId) {
    super("ITSM-4041", 404, "Incident not found: " + incidentId);
  }
}
