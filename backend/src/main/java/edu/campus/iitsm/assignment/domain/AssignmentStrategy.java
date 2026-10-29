package edu.campus.iitsm.assignment.domain;

import edu.campus.iitsm.assignment.api.AssignmentRationale;
import edu.campus.iitsm.incident.domain.Priority;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface AssignmentStrategy {
  String name();
  Optional<AssignmentRationale> selectTechnician(
      UUID incidentId,
      UUID serviceId,
      UUID ownerTeamId,
      Priority priority,
      double ticketWeight,
      Set<String> requiredSkills,
      List<TechnicianCandidate> candidates
  );
}
