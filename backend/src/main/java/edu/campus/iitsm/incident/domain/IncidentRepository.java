package edu.campus.iitsm.incident.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IncidentRepository {
  Optional<Incident> findById(UUID id);
  Incident save(Incident incident);
  List<Incident> findOpenChildrenByMasterId(UUID masterId);
  List<Incident> findClassifiedUnassignedRoots(int limit);
}
