package edu.campus.iitsm.identity.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "app_user")
public class AppUserJpaEntity {

  @Id
  @Column(name = "id")
  private UUID id;

  @Column(name = "type", nullable = false)
  private String type;

  @Column(name = "employee_number", nullable = false, unique = true)
  private String employeeNumber;

  @Column(name = "name", nullable = false)
  private String name;

  @Column(name = "email", nullable = false, unique = true)
  private String email;

  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  @Column(name = "department")
  private String department;

  @Column(name = "location_block")
  private String locationBlock;

  @Column(name = "admin_role")
  private String adminRole;

  @Column(name = "active", nullable = false)
  private boolean active;

  @Column(name = "failed_logins", nullable = false)
  private int failedLogins;

  @Column(name = "locked_until")
  private Instant lockedUntil;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  public AppUserJpaEntity() {}

  public UUID getId() { return id; }
  public void setId(UUID id) { this.id = id; }
  public String getType() { return type; }
  public void setType(String type) { this.type = type; }
  public String getEmployeeNumber() { return employeeNumber; }
  public void setEmployeeNumber(String employeeNumber) { this.employeeNumber = employeeNumber; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public String getPasswordHash() { return passwordHash; }
  public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
  public String getDepartment() { return department; }
  public void setDepartment(String department) { this.department = department; }
  public String getLocationBlock() { return locationBlock; }
  public void setLocationBlock(String locationBlock) { this.locationBlock = locationBlock; }
  public String getAdminRole() { return adminRole; }
  public void setAdminRole(String adminRole) { this.adminRole = adminRole; }
  public boolean isActive() { return active; }
  public void setActive(boolean active) { this.active = active; }
  public int getFailedLogins() { return failedLogins; }
  public void setFailedLogins(int failedLogins) { this.failedLogins = failedLogins; }
  public Instant getLockedUntil() { return lockedUntil; }
  public void setLockedUntil(Instant lockedUntil) { this.lockedUntil = lockedUntil; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
  public Instant getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
