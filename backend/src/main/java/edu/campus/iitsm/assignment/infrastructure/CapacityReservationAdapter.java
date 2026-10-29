package edu.campus.iitsm.assignment.infrastructure;

import edu.campus.iitsm.assignment.domain.CapacityReservationPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

@Component
public class CapacityReservationAdapter implements CapacityReservationPort {

  private final JdbcTemplate jdbcTemplate;

  public CapacityReservationAdapter(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @Override
  public boolean reserveLoad(UUID technicianId, double weight, Instant now) {
    String sql = "UPDATE technician_load SET points = points + ?, version = version + 1, updated_at = ? " +
        "WHERE technician_id = ? AND points + ? <= capacity";
    int updated = jdbcTemplate.update(sql, weight, Timestamp.from(now), technicianId, weight);
    return updated > 0;
  }

  @Override
  public void releaseLoad(UUID technicianId, double weight, Instant now) {
    String sql = "UPDATE technician_load SET points = GREATEST(0.0, points - ?), version = version + 1, updated_at = ? " +
        "WHERE technician_id = ?";
    jdbcTemplate.update(sql, weight, Timestamp.from(now), technicianId);
  }
}
