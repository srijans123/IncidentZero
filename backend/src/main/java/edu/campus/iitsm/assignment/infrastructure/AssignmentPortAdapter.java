package edu.campus.iitsm.assignment.infrastructure;

import edu.campus.iitsm.assignment.api.AssignmentRationale;
import edu.campus.iitsm.assignment.application.strategy.LeastLoadedStrategy;
import edu.campus.iitsm.assignment.domain.AssignmentStrategy;
import edu.campus.iitsm.assignment.domain.CapacityReservationPort;
import edu.campus.iitsm.assignment.domain.TechnicianCandidate;
import edu.campus.iitsm.incident.api.AssignmentPort;
import edu.campus.iitsm.incident.domain.Priority;
import edu.campus.iitsm.shared.domain.ClockPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;

@Component
public class AssignmentPortAdapter implements AssignmentPort {

  private final List<AssignmentStrategy> strategies;
  private final CapacityReservationPort capacityReservationPort;
  private final ClockPort clockPort;
  private final JdbcTemplate jdbcTemplate;
  private final String configuredStrategy;

  public AssignmentPortAdapter(
      List<AssignmentStrategy> strategies,
      CapacityReservationPort capacityReservationPort,
      ClockPort clockPort,
      JdbcTemplate jdbcTemplate,
      @Value("${app.assignment.strategy:LEAST_LOADED}") String configuredStrategy) {
    this.strategies = (strategies != null) ? strategies : List.of();
    this.capacityReservationPort = capacityReservationPort;
    this.clockPort = clockPort;
    this.jdbcTemplate = jdbcTemplate;
    this.configuredStrategy = configuredStrategy;
  }

  @Override
  public Optional<AssignmentResult> assign(
      UUID incidentId, UUID serviceId, Priority priority, double weight) {
    
    AssignmentStrategy strategy = strategies.stream()
        .filter(s -> s.name().equalsIgnoreCase(configuredStrategy)
            || s.name().replace("_", "").equalsIgnoreCase(configuredStrategy.replace("_", "").replace("-", "")))
        .findFirst()
        .orElseGet(() -> strategies.stream()
            .filter(s -> s instanceof LeastLoadedStrategy)
            .findFirst()
            .orElseGet(() -> strategies.isEmpty() ? new LeastLoadedStrategy() : strategies.get(0)));

    UUID ownerTeamId = null;
    if (serviceId != null) {
      try {
        ownerTeamId = jdbcTemplate.queryForObject(
            "SELECT owner_team_id FROM it_service WHERE id = ?",
            UUID.class,
            serviceId
        );
      } catch (Exception ignored) {}
    }

    Map<UUID, Map<String, Integer>> skillsMap = new HashMap<>();
    try {
      jdbcTemplate.query(
          "SELECT ts.user_id, s.code, ts.level FROM technician_skill ts JOIN skill s ON s.id = ts.skill_id",
          rs -> {
            UUID uId = (UUID) rs.getObject("user_id");
            String code = rs.getString("code");
            int level = rs.getInt("level");
            skillsMap.computeIfAbsent(uId, k -> new HashMap<>()).put(code, level);
          }
      );
    } catch (Exception ignored) {}

    String candidateSql = """
        SELECT u.id, u.name, p.team_id, p.support_tier,
               coalesce(p.on_shift_override, true) AS on_shift,
               coalesce(l.points, 0.0) AS load_points,
               coalesce(l.capacity, p.capacity_points, 8.0) AS capacity_points
        FROM app_user u
        JOIN technician_profile p ON p.user_id = u.id
        LEFT JOIN technician_load l ON l.technician_id = u.id
        WHERE u.active = true
        ORDER BY (CASE WHEN p.team_id = ? THEN 0 ELSE 1 END), u.name ASC
    """;

    List<TechnicianCandidate> candidates = new ArrayList<>();
    try {
      candidates = jdbcTemplate.query(
          candidateSql,
          (rs, rowNum) -> {
            UUID techId = (UUID) rs.getObject("id");
            String name = rs.getString("name");
            UUID teamId = (UUID) rs.getObject("team_id");
            String tier = rs.getString("support_tier");
            boolean onShift = rs.getBoolean("on_shift");
            double load = rs.getDouble("load_points");
            double cap = rs.getDouble("capacity_points");
            return new TechnicianCandidate(
                techId,
                name,
                teamId,
                tier,
                onShift,
                load,
                cap,
                skillsMap.getOrDefault(techId, Map.of()),
                12,
                25.0,
                15,
                30.0
            );
          },
          ownerTeamId
      );
    } catch (Exception e) {
      System.err.println("Failed to query technician candidates: " + e.getMessage());
    }

    if (candidates.isEmpty()) {
      return Optional.empty();
    }

    Optional<AssignmentRationale> rationaleOpt = strategy.selectTechnician(
        incidentId, serviceId, ownerTeamId, priority, weight, Set.of(), candidates
    );

    if (rationaleOpt.isPresent()) {
      Instant now = clockPort.now();
      UUID chosenId = rationaleOpt.get().chosenTechnicianId();
      TechnicianCandidate chosenCand = candidates.stream()
          .filter(c -> c.technicianId().equals(chosenId))
          .findFirst()
          .orElse(candidates.get(0));
      UUID teamId = chosenCand.teamId();

      boolean reserved = capacityReservationPort.reserveLoad(chosenId, weight, now);
      if (reserved) {
        return Optional.of(new AssignmentResult(chosenId, teamId, rationaleOpt.get().strategy()));
      }
    }

    return Optional.empty();
  }
}
