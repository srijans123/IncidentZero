package edu.campus.iitsm.incident.infrastructure.web;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/sla-policies")
public class SlaPolicyController {

  private final JdbcTemplate jdbcTemplate;

  public SlaPolicyController(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @GetMapping
  public ResponseEntity<List<Map<String, Object>>> getSlaPolicies() {
    String sql = "SELECT id, tier, priority, response_target_min, resolution_target_min, mode FROM sla_policy ORDER BY tier ASC, priority ASC";
    List<Map<String, Object>> policies = jdbcTemplate.query(
        sql,
        (rs, rowNum) -> {
          Map<String, Object> m = new LinkedHashMap<>();
          m.put("id", rs.getObject("id").toString());
          m.put("tier", rs.getString("tier"));
          m.put("priority", rs.getString("priority"));
          m.put("response_target_min", rs.getInt("response_target_min"));
          m.put("resolution_target_min", rs.getInt("resolution_target_min"));
          m.put("responseTargetMin", rs.getInt("response_target_min"));
          m.put("resolutionTargetMin", rs.getInt("resolution_target_min"));
          m.put("mode", rs.getString("mode"));
          return m;
        }
    );
    return ResponseEntity.ok(policies);
  }
}
