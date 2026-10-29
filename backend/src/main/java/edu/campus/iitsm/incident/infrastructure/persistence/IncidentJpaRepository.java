package edu.campus.iitsm.incident.infrastructure.persistence;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IncidentJpaRepository extends JpaRepository<IncidentJpaEntity, UUID> {

  Optional<IncidentJpaEntity> findByNumber(String number);

  @Query("SELECT i FROM IncidentJpaEntity i WHERE i.parentId = :parentId AND i.status NOT IN :terminalStatuses")
  List<IncidentJpaEntity> findOpenChildrenByParentId(
      @Param("parentId") UUID parentId,
      @Param("terminalStatuses") Collection<String> terminalStatuses
  );

  @Query("SELECT i FROM IncidentJpaEntity i WHERE i.status = 'CLASSIFIED' AND i.assigneeId IS NULL AND i.parentId IS NULL ORDER BY i.createdAt ASC")
  List<IncidentJpaEntity> findClassifiedUnassignedRoots(Pageable pageable);
}
