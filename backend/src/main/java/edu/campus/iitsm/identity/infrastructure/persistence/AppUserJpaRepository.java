package edu.campus.iitsm.identity.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface AppUserJpaRepository extends JpaRepository<AppUserJpaEntity, UUID> {
  Optional<AppUserJpaEntity> findByEmail(String email);
  Optional<AppUserJpaEntity> findByEmployeeNumber(String employeeNumber);
}
