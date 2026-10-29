package edu.campus.iitsm.shared.domain.error;

import java.util.UUID;

public final class TechnicianUnavailableException extends ItsmException {
  public TechnicianUnavailableException(UUID technicianId) {
    super("ITSM-4091", 409, "Technician is currently off-shift or inactive: " + technicianId);
  }
}
