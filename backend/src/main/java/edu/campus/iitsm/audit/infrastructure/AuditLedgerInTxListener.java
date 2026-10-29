package edu.campus.iitsm.audit.infrastructure;

import edu.campus.iitsm.audit.domain.AuditHasher;
import edu.campus.iitsm.shared.domain.ClockPort;
import edu.campus.iitsm.shared.domain.DomainEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Component
public class AuditLedgerInTxListener {

  private final JdbcTemplate jdbcTemplate;
  private final ClockPort clockPort;

  public AuditLedgerInTxListener(JdbcTemplate jdbcTemplate, ClockPort clockPort) {
    this.jdbcTemplate = jdbcTemplate;
    this.clockPort = clockPort;
  }

  @EventListener
  @Transactional(propagation = Propagation.MANDATORY)
  public void onDomainEvent(DomainEvent event) {
    UUID incidentId = event.incidentId();
    Instant now = event.occurredAt() != null ? event.occurredAt() : clockPort.now();

    // Lock the incident row to serialize audit hash chain updates
    String selectSql = "SELECT last_audit_index, last_audit_hash, status FROM incident WHERE id = ? FOR UPDATE";
    Map<String, Object> row;
    try {
      row = jdbcTemplate.queryForMap(selectSql, incidentId);
    } catch (Exception e) {
      System.err.println("AuditLedgerInTxListener failed to lock incident " + incidentId + ": " + e.getMessage());
      e.printStackTrace();
      return;
    }

    int lastIndex = ((Number) row.getOrDefault("last_audit_index", 0)).intValue();
    String lastHash = (String) row.get("last_audit_hash");
    String currentStatus = (String) row.get("status");

    int nextIndex = lastIndex + 1;
    String prevHash = (lastHash != null && !lastHash.isBlank()) ? lastHash : AuditHasher.GENESIS_HASH;

    String action = event.getClass().getSimpleName();
    String actorType = "SYSTEM";
    UUID actorId = null;
    String description = "Domain event " + action + " occurred for incident " + incidentId;
    String payloadJson = "{}";

    String hash = AuditHasher.computeHash(
        prevHash, incidentId, nextIndex, now, actorType, actorId,
        action, currentStatus, currentStatus, description, payloadJson
    );

    String insertSql = "INSERT INTO audit_record (incident_id, chain_index, ts, actor_id, actor_type, action, prev_state, new_state, description, payload, prev_hash, hash) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?, ?)";

    jdbcTemplate.update(
        insertSql,
        incidentId,
        nextIndex,
        Timestamp.from(now),
        actorId,
        actorType,
        action,
        currentStatus,
        currentStatus,
        description,
        payloadJson,
        prevHash,
        hash
    );

    String updateIncidentSql = "UPDATE incident SET last_audit_index = ?, last_audit_hash = ? WHERE id = ?";
    jdbcTemplate.update(updateIncidentSql, nextIndex, hash, incidentId);
  }
}
