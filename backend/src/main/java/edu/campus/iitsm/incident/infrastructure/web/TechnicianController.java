package edu.campus.iitsm.incident.infrastructure.web;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/technicians")
public class TechnicianController {

  private final JdbcTemplate jdbcTemplate;

  public TechnicianController(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public record TechnicianDto(
      UUID id,
      String name,
      String supportTier,
      UUID teamId,
      String teamCode,
      double loadPoints,
      double capacity
  ) {}

  @GetMapping
  public ResponseEntity<List<TechnicianDto>> listTechnicians() {
    String sql = """
        SELECT u.id, u.name, p.support_tier, t.id AS team_id, t.code AS team_code,
               coalesce(l.points, 0.0) AS load_points,
               coalesce(l.capacity, p.capacity_points, 8.0) AS capacity
        FROM app_user u
        JOIN technician_profile p ON p.user_id = u.id
        JOIN team t ON t.id = p.team_id
        LEFT JOIN technician_load l ON l.technician_id = u.id
        WHERE u.active = true
        ORDER BY u.name ASC
    """;
    List<TechnicianDto> result = jdbcTemplate.query(
        sql,
        (rs, rowNum) -> new TechnicianDto(
            (UUID) rs.getObject("id"),
            rs.getString("name"),
            rs.getString("support_tier"),
            (UUID) rs.getObject("team_id"),
            rs.getString("team_code"),
            rs.getDouble("load_points"),
            rs.getDouble("capacity")
        )
    );
    return ResponseEntity.ok(result);
  }
}
