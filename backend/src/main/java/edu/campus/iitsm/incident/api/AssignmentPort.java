package edu.campus.iitsm.incident.api;

import edu.campus.iitsm.incident.domain.Priority;
import java.util.Optional;
import java.util.UUID;

public interface AssignmentPort {
  record AssignmentResult(UUID chosenTechnicianId, UUID teamId, String strategy) {}
  Optional<AssignmentResult> assign(UUID incidentId, UUID serviceId, Priority priority, double weight);
}
