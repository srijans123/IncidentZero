package edu.campus.iitsm.incident.infrastructure.persistence;

import edu.campus.iitsm.incident.domain.Incident;
import edu.campus.iitsm.incident.domain.IncidentRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class JpaIncidentRepositoryAdapter implements IncidentRepository {

  private final IncidentJpaRepository jpaRepository;

  public JpaIncidentRepositoryAdapter(IncidentJpaRepository jpaRepository) {
    this.jpaRepository = jpaRepository;
  }

  @Override
  public Optional<Incident> findById(UUID id) {
    return jpaRepository.findById(id).map(e -> Incident.restore(e.toSnapshot()));
  }

  @Override
  public Incident save(Incident incident) {
    Incident.Snapshot snapshot = toSnapshot(incident);
    Optional<IncidentJpaEntity> existing = jpaRepository.findById(incident.id());
    IncidentJpaEntity entity;
    if (existing.isPresent()) {
      entity = existing.get();
      entity.updateFromSnapshot(snapshot);
    } else {
      entity = IncidentJpaEntity.fromSnapshot(snapshot);
    }
    IncidentJpaEntity saved = jpaRepository.saveAndFlush(entity);
    return incident.withPersistedVersion(saved.getVersion());
  }

  @Override
  public List<Incident> findOpenChildrenByMasterId(UUID masterId) {
    List<String> terminal = List.of("RESOLVED", "VERIFIED", "CLOSED", "CANCELLED");
    return jpaRepository.findOpenChildrenByParentId(masterId, terminal)
        .stream()
        .map(e -> Incident.restore(e.toSnapshot()))
        .toList();
  }

  @Override
  public List<Incident> findClassifiedUnassignedRoots(int limit) {
    int safeLimit = Math.max(1, Math.min(limit, 500));
    return jpaRepository.findClassifiedUnassignedRoots(PageRequest.of(0, safeLimit))
        .stream()
        .map(e -> Incident.restore(e.toSnapshot()))
        .toList();
  }

  private static Incident.Snapshot toSnapshot(Incident i) {
    return new Incident.Snapshot(
        i.id(), i.number(), i.reporterId(), i.serviceId(), i.categoryId(),
        i.title(), i.description(), i.impact(), i.urgency(),
        i.priority(), i.priorityExplanation(),
        i.status(), i.slaStatus(), i.sla(),
        i.responseClock(), i.resolutionClock(), i.clockGeneration(),
        i.assigneeId(), i.teamId(), i.parentId(), i.commanderId(),
        i.isMajor(), i.affectedUsers(), i.reassignCount(), i.reopenCount(),
        i.resolution(), i.archivedResolutions(), i.rating(),
        i.closureNote(), i.createdAt(), i.respondedAt(),
        i.resolvedAt(), i.closedAt(), i.version()
    );
  }
}
