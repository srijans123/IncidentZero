package edu.campus.iitsm.identity.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface TechnicianProfileJpaRepository extends JpaRepository<TechnicianProfileJpaEntity, UUID> {
  Optional<TechnicianProfileJpaEntity> findByUserId(UUID userId);
}
