package edu.campus.iitsm.identity.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "technician_profile")
public class TechnicianProfileJpaEntity {

  @Id
  @Column(name = "user_id")
  private UUID userId;

  @Column(name = "team_id", nullable = false)
  private UUID teamId;

  @Column(name = "support_tier", nullable = false)
  private String supportTier;

  @Column(name = "capacity_points", nullable = false)
  private BigDecimal capacityPoints;

  public TechnicianProfileJpaEntity() {}

  public UUID getUserId() { return userId; }
  public void setUserId(UUID userId) { this.userId = userId; }
  public UUID getTeamId() { return teamId; }
  public void setTeamId(UUID teamId) { this.teamId = teamId; }
  public String getSupportTier() { return supportTier; }
  public void setSupportTier(String supportTier) { this.supportTier = supportTier; }
  public BigDecimal getCapacityPoints() { return capacityPoints; }
  public void setCapacityPoints(BigDecimal capacityPoints) { this.capacityPoints = capacityPoints; }
}
