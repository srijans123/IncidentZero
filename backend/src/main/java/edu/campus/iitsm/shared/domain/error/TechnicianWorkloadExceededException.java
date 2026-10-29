package edu.campus.iitsm.shared.domain.error;

import java.util.UUID;

public final class TechnicianWorkloadExceededException extends ItsmException {
  public TechnicianWorkloadExceededException(UUID technicianId) {
    super("ITSM-4221", 422, "Technician capacity exceeded: " + technicianId);
  }
}
