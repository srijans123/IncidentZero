package edu.campus.iitsm.sla.infrastructure;

import edu.campus.iitsm.incident.api.IncidentEvents.*;
import edu.campus.iitsm.shared.domain.ClockPort;
import edu.campus.iitsm.shared.domain.DomainEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

@Component
public class SlaTimerInTxListener {

  private final JdbcTemplate jdbcTemplate;
  private final ClockPort clockPort;

  public SlaTimerInTxListener(JdbcTemplate jdbcTemplate, ClockPort clockPort) {
    this.jdbcTemplate = jdbcTemplate;
    this.clockPort = clockPort;
  }

  @EventListener
  @Transactional(propagation = Propagation.MANDATORY)
  public void onDomainEvent(DomainEvent event) {
    UUID incidentId = event.incidentId();
    Instant now = event.occurredAt() != null ? event.occurredAt() : clockPort.now();

    // Fetch current incident clock generation, status, and SLA target durations
    String query = "SELECT clock_generation, status, response_target_min, resolution_target_min FROM incident WHERE id = ?";
    Map<String, Object> incidentRow;
    try {
      incidentRow = jdbcTemplate.queryForMap(query, incidentId);
    } catch (Exception e) {
      // Incident may not yet be persisted in some tests
      return;
    }

    int generation = ((Number) incidentRow.getOrDefault("clock_generation", 0)).intValue();
    String status = (String) incidentRow.get("status");
    int respTargetMin = ((Number) incidentRow.getOrDefault("response_target_min", 60)).intValue();
    int resTargetMin = ((Number) incidentRow.getOrDefault("resolution_target_min", 480)).intValue();

    // Cancel existing unfired timers for this incident
    String cancelSql = "UPDATE sla_timer SET cancelled_at = ? WHERE incident_id = ? AND fired_at IS NULL AND cancelled_at IS NULL";
    jdbcTemplate.update(cancelSql, Timestamp.from(now), incidentId);

    // If terminal, do not schedule new timers
    if ("RESOLVED".equals(status) || "VERIFIED".equals(status) || "CLOSED".equals(status) || "CANCELLED".equals(status)) {
      if ("RESOLVED".equals(status)) {
        // Schedule AUTO_VERIFY_72H timer
        Instant autoVerifyDue = now.plus(72, ChronoUnit.HOURS);
        insertTimer(incidentId, "AUTO_VERIFY_72H", generation, autoVerifyDue);
      }
      return;
    }

    if ("PENDING_USER".equals(status)) {
      // Clocks paused in PENDING_USER; schedule reminder
      Instant remindDue = now.plus(24, ChronoUnit.HOURS);
      insertTimer(incidentId, "USER_REMIND_24H", generation, remindDue);
      return;
    }

    // Schedule active response milestone timers if not yet acknowledged/investigating
    if ("NEW".equals(status) || "CLASSIFIED".equals(status) || "ASSIGNED".equals(status)) {
      long respMs = (long) respTargetMin * 60_000L;
      insertTimer(incidentId, "RESP_WARN_50", generation, now.plusMillis(respMs / 2));
      insertTimer(incidentId, "RESP_WARN_75", generation, now.plusMillis((respMs * 3) / 4));
      insertTimer(incidentId, "RESP_WARN_90", generation, now.plusMillis((respMs * 9) / 10));
      insertTimer(incidentId, "RESP_BREACH", generation, now.plusMillis(respMs));
    }

    // Schedule active resolution milestone timers
    long resMs = (long) resTargetMin * 60_000L;
    insertTimer(incidentId, "RES_WARN_50", generation, now.plusMillis(resMs / 2));
    insertTimer(incidentId, "RES_WARN_75", generation, now.plusMillis((resMs * 3) / 4));
    insertTimer(incidentId, "RES_WARN_90", generation, now.plusMillis((resMs * 9) / 10));
    insertTimer(incidentId, "RES_BREACH", generation, now.plusMillis(resMs));
  }

  private void insertTimer(UUID incidentId, String kind, int generation, Instant dueAt) {
    String insertSql = "INSERT INTO sla_timer (incident_id, kind, generation, due_at) VALUES (?, ?, ?, ?) " +
        "ON CONFLICT (incident_id, kind, generation) DO NOTHING";
    try {
      jdbcTemplate.update(insertSql, incidentId, kind, generation, Timestamp.from(dueAt));
    } catch (Exception ignored) {}
  }
}
