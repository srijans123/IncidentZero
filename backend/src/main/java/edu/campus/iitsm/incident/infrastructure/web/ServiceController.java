package edu.campus.iitsm.incident.infrastructure.web;

import edu.campus.iitsm.incident.api.IncidentQueryPort;
import edu.campus.iitsm.incident.api.dto.IncidentDtos;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/services")
public class ServiceController {

  private final IncidentQueryPort queryPort;
  private final JdbcTemplate jdbcTemplate;

  public ServiceController(IncidentQueryPort queryPort, JdbcTemplate jdbcTemplate) {
    this.queryPort = queryPort;
    this.jdbcTemplate = jdbcTemplate;
  }

  @GetMapping
  public ResponseEntity<List<IncidentDtos.ServiceDto>> listServices() {
    return ResponseEntity.ok(queryPort.listServices());
  }

  @GetMapping("/topology")
  public ResponseEntity<Map<String, Object>> getTopology() {
    String nodesSql = """
        SELECT s.id, s.code, s.name, s.tier, coalesce(t.name, 'CCIT') AS team_name,
               count(i.id) AS open_incidents
        FROM it_service s
        LEFT JOIN team t ON t.id = s.owner_team_id
        LEFT JOIN incident i ON i.service_id = s.id AND i.status NOT IN ('RESOLVED','VERIFIED','CLOSED','CANCELLED')
        GROUP BY s.id, s.code, s.name, s.tier, t.name
        ORDER BY s.tier ASC, s.code ASC
    """;
    List<Map<String, Object>> nodes = jdbcTemplate.query(
        nodesSql,
        (rs, rn) -> {
          int open = rs.getInt("open_incidents");
          String status = open >= 5 ? "OUTAGE" : (open > 0 ? "DEGRADED" : "HEALTHY");
          Map<String, Object> m = new LinkedHashMap<>();
          m.put("id", rs.getObject("id").toString());
          m.put("code", rs.getString("code"));
          m.put("name", rs.getString("name"));
          m.put("tier", rs.getString("tier"));
          m.put("team", rs.getString("team_name"));
          m.put("openIncidents", open);
          m.put("status", status);
          return m;
        }
    );

    String edgesSql = """
        SELECT u.code AS from_code, d.code AS to_code, dep.type
        FROM service_dependency dep
        JOIN it_service u ON u.id = dep.upstream_id
        JOIN it_service d ON d.id = dep.downstream_id
    """;
    List<Map<String, Object>> edges = jdbcTemplate.query(
        edgesSql,
        (rs, rn) -> {
          Map<String, Object> m = new LinkedHashMap<>();
          m.put("from", rs.getString("from_code"));
          m.put("to", rs.getString("to_code"));
          m.put("type", rs.getString("type"));
          return m;
        }
    );

    return ResponseEntity.ok(Map.of("nodes", nodes, "edges", edges));
  }
}
