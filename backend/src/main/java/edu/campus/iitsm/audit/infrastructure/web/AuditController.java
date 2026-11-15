package edu.campus.iitsm.audit.infrastructure.web;

import edu.campus.iitsm.audit.api.AuditVerificationPort;
import edu.campus.iitsm.audit.api.AuditVerificationResult;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/audit")
public class AuditController {

  private final AuditVerificationPort auditVerificationPort;
  private final JdbcTemplate jdbcTemplate;

  public AuditController(AuditVerificationPort auditVerificationPort, JdbcTemplate jdbcTemplate) {
    this.auditVerificationPort = auditVerificationPort;
    this.jdbcTemplate = jdbcTemplate;
  }

  @PostMapping("/verify")
  public ResponseEntity<Map<String, Object>> verifyAuditLedger() {
    AuditVerificationResult result = auditVerificationPort.verifyAllLedgers();
    return ResponseEntity.ok(Map.of(
        "valid", result.valid(),
        "firstCorruptedRowId", result.firstCorruptedRowId() != null ? result.firstCorruptedRowId() : 0L,
        "totalRecordsVerified", result.totalRecordsVerified(),
        "totalRecordsChecked", result.totalRecordsVerified(),
        "reason", result.failureReason() != null ? result.failureReason() : "All cryptographic hash links intact."
    ));
  }

  @GetMapping
  public ResponseEntity<List<Map<String, Object>>> getAuditRecords(
      @RequestParam(value = "incidentId", required = false) UUID incidentId,
      @RequestParam(value = "limit", defaultValue = "50") int limit
  ) {
    String sql = """
        SELECT a.id, a.incident_id, coalesce(i.incident_number, 'INC-GLOBAL') AS incident_number,
               a.chain_index, a.ts, a.actor_id, coalesce(u.name, 'System') AS actor_name,
               a.action, a.prev_state, a.new_state, a.description, a.hash, a.prev_hash
        FROM audit_record a
        LEFT JOIN incident i ON i.id = a.incident_id
        LEFT JOIN app_user u ON u.id = a.actor_id
        """ + (incidentId != null ? " WHERE a.incident_id = ? " : "") + """
        ORDER BY a.ts DESC, a.chain_index DESC
        LIMIT ?
    """;

    List<Map<String, Object>> rows = incidentId != null
        ? jdbcTemplate.query(sql, (rs, rn) -> mapAuditRow(rs), incidentId, limit)
        : jdbcTemplate.query(sql, (rs, rn) -> mapAuditRow(rs), limit);

    return ResponseEntity.ok(rows);
  }

  private Map<String, Object> mapAuditRow(java.sql.ResultSet rs) throws java.sql.SQLException {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("id", rs.getLong("id"));
    m.put("chainIndex", rs.getInt("chain_index"));
    m.put("incidentId", rs.getObject("incident_id") != null ? rs.getObject("incident_id").toString() : null);
    m.put("incidentNumber", rs.getString("incident_number"));
    m.put("action", rs.getString("action"));
    m.put("actor", rs.getString("actor_name"));
    m.put("fromState", rs.getString("prev_state"));
    m.put("toState", rs.getString("new_state"));
    m.put("description", rs.getString("description"));
    m.put("hash", rs.getString("hash") != null ? rs.getString("hash").trim() : "");
    m.put("prevHash", rs.getString("prev_hash") != null ? rs.getString("prev_hash").trim() : "");
    m.put("timestamp", rs.getTimestamp("ts") != null ? rs.getTimestamp("ts").toInstant().toString() : "");
    return m;
  }
}
