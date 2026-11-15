package edu.campus.iitsm.audit.infrastructure;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.campus.iitsm.audit.domain.AuditHasher;
import edu.campus.iitsm.incident.api.IncidentEvents;
import edu.campus.iitsm.shared.domain.Actors;
import edu.campus.iitsm.shared.domain.ClockPort;
import edu.campus.iitsm.shared.domain.DomainEvent;
import edu.campus.iitsm.shared.domain.UserInfoContext;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class AuditLedgerInTxListener {

  private final JdbcTemplate jdbcTemplate;
  private final ClockPort clockPort;
  private final ObjectMapper objectMapper;

  public AuditLedgerInTxListener(JdbcTemplate jdbcTemplate, ClockPort clockPort, ObjectMapper objectMapper) {
    this.jdbcTemplate = jdbcTemplate;
    this.clockPort = clockPort;
    this.objectMapper = objectMapper;
  }

  private record UserInfo(String name, String type) {}

  private UserInfo lookupUser(UUID id) {
    if (id == null || Actors.SYSTEM.equals(id)) {
      return new UserInfo("System Automation", "SYSTEM");
    }
    List<UserInfo> list = jdbcTemplate.query(
        "SELECT name, type FROM app_user WHERE id = ?",
        (rs, rowNum) -> new UserInfo(rs.getString("name"), rs.getString("type")),
        id
    );
    if (!list.isEmpty()) {
      return list.get(0);
    }
    return new UserInfo("User", "USER");
  }

  @EventListener
  @Transactional(propagation = Propagation.MANDATORY)
  public void onDomainEvent(DomainEvent event) {
    UUID incidentId = event.incidentId();
    Instant now = (event.occurredAt() != null ? event.occurredAt() : clockPort.now())
        .truncatedTo(ChronoUnit.MICROS);

    // Lock the incident row to serialize audit hash chain updates
    String selectSql = "SELECT last_audit_index, last_audit_hash, status FROM incident WHERE id = ? FOR UPDATE";
    Map<String, Object> row;
    try {
      row = jdbcTemplate.queryForMap(selectSql, incidentId);
    } catch (Exception e) {
      System.err.println("AuditLedgerInTxListener failed to lock incident " + incidentId + ": " + e.getMessage());
      return;
    }

    int lastIndex = ((Number) row.getOrDefault("last_audit_index", 0)).intValue();
    String lastHash = (String) row.get("last_audit_hash");
    String currentStatus = (String) row.get("status");

    int nextIndex = lastIndex + 1;
    String prevHash = (lastHash != null && !lastHash.isBlank()) ? lastHash : AuditHasher.GENESIS_HASH;

    // Previous state chaining
    String prevState = null;
    if (lastIndex > 0) {
      List<String> states = jdbcTemplate.query(
          "SELECT new_state FROM audit_record WHERE incident_id = ? AND chain_index = ?",
          (rs, rowNum) -> rs.getString("new_state"),
          incidentId,
          lastIndex
      );
      if (!states.isEmpty()) {
        prevState = states.get(0);
      }
    }

    String action = event.getClass().getSimpleName();
    UUID actorId = null;
    String description;
    Map<String, Object> payloadMap = new LinkedHashMap<>();

    if (event instanceof IncidentEvents.IncidentCreated e) {
      actorId = e.reporterId();
      payloadMap.put("priority", e.priority() != null ? e.priority().name() : "P3");
      payloadMap.put("reporterId", e.reporterId() != null ? e.reporterId().toString() : "");
      payloadMap.put("serviceId", e.serviceId() != null ? e.serviceId().toString() : "");
      UserInfo u = lookupUser(actorId);
      description = u.name() + " reported the incident";
    } else if (event instanceof IncidentEvents.IncidentClassified e) {
      actorId = e.actor();
      payloadMap.put("categoryId", e.categoryId() != null ? e.categoryId().toString() : "");
      payloadMap.put("priority", e.priority() != null ? e.priority().name() : "");
      UserInfo u = lookupUser(actorId);
      description = u.name() + " classified incident as " + (e.priority() != null ? e.priority().name() : "");
    } else if (event instanceof IncidentEvents.IncidentAssigned e) {
      actorId = e.actor();
      payloadMap.put("assigneeId", e.assigneeId() != null ? e.assigneeId().toString() : "");
      payloadMap.put("strategy", e.strategy() != null ? e.strategy() : "");
      payloadMap.put("teamId", e.teamId() != null ? e.teamId().toString() : "");
      UserInfo assignee = lookupUser(e.assigneeId());
      description = "Assigned to " + assignee.name() + " via " + e.strategy();
    } else if (event instanceof IncidentEvents.IncidentReassigned e) {
      actorId = e.actor();
      payloadMap.put("newAssignee", e.newAssignee() != null ? e.newAssignee().toString() : "");
      payloadMap.put("prevAssignee", e.prevAssignee() != null ? e.prevAssignee().toString() : "");
      payloadMap.put("reason", e.reason() != null ? e.reason() : "");
      UserInfo newTech = lookupUser(e.newAssignee());
      description = lookupUser(actorId).name() + " reassigned ticket to " + newTech.name() + ": " + e.reason();
    } else if (event instanceof IncidentEvents.IncidentAcknowledged e) {
      actorId = e.actor();
      description = lookupUser(actorId).name() + " acknowledged the incident";
    } else if (event instanceof IncidentEvents.InvestigationStarted e) {
      actorId = e.actor();
      description = lookupUser(actorId).name() + " started investigation";
    } else if (event instanceof IncidentEvents.UserInfoRequested e) {
      actorId = e.actor();
      payloadMap.put("question", e.question() != null ? e.question() : "");
      description = lookupUser(actorId).name() + " requested user information: " + e.question();
    } else if (event instanceof IncidentEvents.UserInfoProvided e) {
      actorId = e.reporter();
      String ans = UserInfoContext.getAndClear();
      if (ans != null && !ans.isBlank()) {
        payloadMap.put("response", ans);
      }
      description = lookupUser(actorId).name() + " provided requested information";
    } else if (event instanceof IncidentEvents.IncidentResolved e) {
      actorId = e.actor();
      payloadMap.put("code", e.resolution() != null ? e.resolution().code() : "FIXED");
      payloadMap.put("notes", e.resolution() != null ? e.resolution().notes() : "");
      if (e.resolution() != null && e.resolution().rootCauseCategory() != null) {
        payloadMap.put("rootCauseCategory", e.resolution().rootCauseCategory());
      }
      description = lookupUser(actorId).name() + " resolved the incident (" + (e.resolution() != null ? e.resolution().code() : "FIXED") + ")";
    } else if (event instanceof IncidentEvents.ResolutionVerified e) {
      actorId = e.actor();
      payloadMap.put("rating", e.rating() != null ? e.rating() : 5);
      description = lookupUser(actorId).name() + " verified resolution (" + (e.rating() != null ? e.rating() : 5) + " stars)";
    } else if (event instanceof IncidentEvents.ResolutionRejected e) {
      actorId = e.reporter();
      payloadMap.put("reason", e.reason() != null ? e.reason() : "");
      description = lookupUser(actorId).name() + " rejected resolution: " + e.reason();
    } else if (event instanceof IncidentEvents.IncidentClosed e) {
      actorId = e.actor();
      description = lookupUser(actorId).name() + " closed the incident";
    } else if (event instanceof IncidentEvents.IncidentCancelled e) {
      actorId = e.actor();
      payloadMap.put("reason", e.reason() != null ? e.reason() : "");
      description = lookupUser(actorId).name() + " cancelled the incident: " + e.reason();
    } else if (event instanceof IncidentEvents.MajorIncidentDeclared e) {
      actorId = e.actor();
      description = lookupUser(actorId).name() + " declared major incident (P1)";
    } else if (event instanceof IncidentEvents.PriorityChanged e) {
      payloadMap.put("after", e.after() != null ? e.after().name() : "");
      payloadMap.put("before", e.before() != null ? e.before().name() : "");
      payloadMap.put("reason", e.reason() != null ? e.reason() : "");
      description = "Priority changed from " + (e.before() != null ? e.before().name() : "") + " to " + (e.after() != null ? e.after().name() : "");
    } else {
      description = "Domain event " + action + " occurred for incident " + incidentId;
    }

    UserInfo actorInfo = lookupUser(actorId);
    String actorType = (actorId == null || Actors.SYSTEM.equals(actorId)) ? "SYSTEM" : "USER";
    UUID effectiveActorId = (actorId == null || Actors.SYSTEM.equals(actorId)) ? null : actorId;

    String rawPayload;
    try {
      rawPayload = payloadMap.isEmpty() ? "{}" : objectMapper.writeValueAsString(payloadMap);
    } catch (Exception ex) {
      rawPayload = "{}";
    }
    String canonicalPayload = AuditHasher.canonicalizeJson(rawPayload);

    String hash = AuditHasher.computeHash(
        prevHash, incidentId, nextIndex, now, actorType, effectiveActorId,
        action, prevState, currentStatus, description, canonicalPayload
    );

    String insertSql = "INSERT INTO audit_record (incident_id, chain_index, ts, actor_id, actor_type, action, prev_state, new_state, description, payload, prev_hash, hash) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?, ?)";

    jdbcTemplate.update(
        insertSql,
        incidentId,
        nextIndex,
        Timestamp.from(now),
        effectiveActorId,
        actorType,
        action,
        prevState,
        currentStatus,
        description,
        canonicalPayload,
        prevHash,
        hash
    );

    String updateIncidentSql = "UPDATE incident SET last_audit_index = ?, last_audit_hash = ? WHERE id = ?";
    jdbcTemplate.update(updateIncidentSql, nextIndex, hash, incidentId);
  }
}
