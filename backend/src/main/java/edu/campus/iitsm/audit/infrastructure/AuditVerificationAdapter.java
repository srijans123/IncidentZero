package edu.campus.iitsm.audit.infrastructure;

import edu.campus.iitsm.audit.api.AuditVerificationPort;
import edu.campus.iitsm.audit.api.AuditVerificationResult;
import edu.campus.iitsm.audit.domain.AuditHasher;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Component
public class AuditVerificationAdapter implements AuditVerificationPort {

  private final JdbcTemplate jdbcTemplate;

  public AuditVerificationAdapter(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @Override
  public AuditVerificationResult verifyAllLedgers() {
    String sql = "SELECT id, incident_id, chain_index, ts, actor_type, actor_id, action, prev_state, new_state, description, payload, prev_hash, hash FROM audit_record ORDER BY id ASC";
    List<AuditHasher.AuditRowView> rows = jdbcTemplate.query(
        sql,
        (rs, rowNum) -> {
          UUID incId = (UUID) rs.getObject("incident_id");
          UUID actId = (UUID) rs.getObject("actor_id");
          Timestamp ts = rs.getTimestamp("ts");
          return new AuditHasher.AuditRowView(
              rs.getLong("id"),
              incId,
              rs.getInt("chain_index"),
              ts != null ? ts.toInstant() : Instant.now(),
              rs.getString("actor_type"),
              actId,
              rs.getString("action"),
              rs.getString("prev_state"),
              rs.getString("new_state"),
              rs.getString("description"),
              rs.getString("payload"),
              rs.getString("prev_hash"),
              rs.getString("hash")
          );
        }
    );

    if (rows.isEmpty()) {
      return new AuditVerificationResult(true, null, 0, "No audit records found.");
    }

    Map<UUID, List<AuditHasher.AuditRowView>> grouped = new HashMap<>();
    for (var r : rows) {
      grouped.computeIfAbsent(r.incidentId(), k -> new ArrayList<>()).add(r);
    }

    for (var entry : grouped.entrySet()) {
      List<AuditHasher.AuditRowView> incRows = entry.getValue();
      String headHash = incRows.get(incRows.size() - 1).hash();
      int headIndex = incRows.get(incRows.size() - 1).chainIndex();
      var report = AuditHasher.verifyIncidentChain(incRows, headHash, headIndex);
      if (!report.valid()) {
        return new AuditVerificationResult(
            false,
            report.firstCorruptedRowId(),
            rows.size(),
            report.failureReason()
        );
      }
    }

    return new AuditVerificationResult(true, null, rows.size(), "All cryptographic hash links intact.");
  }
}
