package edu.campus.iitsm.incident.infrastructure.persistence;

import edu.campus.iitsm.incident.api.IncidentQueryPort;
import edu.campus.iitsm.incident.api.dto.IncidentDtos;
import edu.campus.iitsm.incident.domain.Incident;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Component
public class IncidentQueryAdapter implements IncidentQueryPort {

  private final IncidentJpaRepository jpaRepository;
  private final JdbcTemplate jdbcTemplate;

  public IncidentQueryAdapter(IncidentJpaRepository jpaRepository, JdbcTemplate jdbcTemplate) {
    this.jpaRepository = jpaRepository;
    this.jdbcTemplate = jdbcTemplate;
  }

  @Override
  public Optional<IncidentDtos.IncidentDetailResponse> findIncidentDetail(UUID id) {
    return jpaRepository.findById(id).map(this::toDetailResponse);
  }

  @Override
  public IncidentDtos.PageResponse<IncidentDtos.IncidentSummaryDto> listIncidents(
      String status,
      String priority,
      UUID serviceId,
      String q,
      String cursor,
      int limit
  ) {
    int maxLimit = (limit <= 0 || limit > 100) ? 50 : limit;

    // Use JdbcTemplate for dynamic filtering
    StringBuilder sql = new StringBuilder("SELECT id, number, title, status, sla_status, priority, assignee_id, version, created_at, response_due_at, resolution_due_at FROM incident WHERE 1=1");
    List<Object> params = new ArrayList<>();

    if (status != null && !status.isBlank()) {
      sql.append(" AND status = ?");
      params.add(status.trim().toUpperCase());
    }
    if (priority != null && !priority.isBlank()) {
      sql.append(" AND priority = ?");
      params.add(priority.trim().toUpperCase());
    }
    if (serviceId != null) {
      sql.append(" AND service_id = ?");
      params.add(serviceId);
    }
    if (q != null && !q.isBlank()) {
      sql.append(" AND (title ILIKE ? OR number ILIKE ?)");
      params.add("%" + q.trim() + "%");
      params.add("%" + q.trim() + "%");
    }

    sql.append(" ORDER BY created_at DESC LIMIT ?");
    params.add(maxLimit + 1);

    List<IncidentDtos.IncidentSummaryDto> items = jdbcTemplate.query(
        sql.toString(),
        ps -> {
          for (int i = 0; i < params.size(); i++) {
            ps.setObject(i + 1, params.get(i));
          }
        },
        (rs, rowNum) -> {
          UUID id = (UUID) rs.getObject("id");
          String number = rs.getString("number");
          String title = rs.getString("title");
          String st = rs.getString("status");
          String slaSt = rs.getString("sla_status");
          String prio = rs.getString("priority");
          UUID assigneeId = (UUID) rs.getObject("assignee_id");
          long version = rs.getLong("version");
          Timestamp createdAtTs = rs.getTimestamp("created_at");
          Timestamp respTs = rs.getTimestamp("response_due_at");
          Timestamp resTs = rs.getTimestamp("resolution_due_at");

          return new IncidentDtos.IncidentSummaryDto(
              id,
              number,
              title,
              "APP-ERP",
              "SOFTWARE",
              st,
              slaSt,
              prio,
              assigneeId,
              assigneeId != null ? "Assigned Technician" : "Unassigned",
              createdAtTs != null ? createdAtTs.toInstant() : Instant.now(),
              respTs != null ? respTs.toInstant() : null,
              resTs != null ? resTs.toInstant() : null,
              version
          );
        }
    );

    boolean hasMore = items.size() > maxLimit;
    List<IncidentDtos.IncidentSummaryDto> pagedItems = hasMore ? items.subList(0, maxLimit) : items;
    String nextCursor = hasMore && !pagedItems.isEmpty() ? pagedItems.get(pagedItems.size() - 1).id().toString() : null;

    return new IncidentDtos.PageResponse<>(pagedItems, nextCursor, hasMore, pagedItems.size());
  }

  @Override
  public List<IncidentDtos.AuditTimelineItemDto> getTimeline(UUID incidentId) {
    String sql = "SELECT id, incident_id, event_type, actor_type, actor_id, summary, payload, hash, ts FROM audit_record WHERE incident_id = ? ORDER BY seq ASC";
    return jdbcTemplate.query(
        sql,
        ps -> ps.setObject(1, incidentId),
        (rs, rowNum) -> new IncidentDtos.AuditTimelineItemDto(
            rs.getLong("id"),
            (UUID) rs.getObject("incident_id"),
            rs.getString("event_type"),
            rs.getString("actor_type"),
            rs.getString("actor_id"),
            rs.getString("summary"),
            rs.getString("payload"),
            rs.getString("hash"),
            rs.getTimestamp("ts").toInstant()
        )
    );
  }

  private IncidentDtos.IncidentDetailResponse toDetailResponse(IncidentJpaEntity e) {
    Incident.Snapshot s = e.toSnapshot();
    List<String> allowed = computeAllowedCommands(s.status() != null ? s.status().name() : "NEW");

    Map<String, Object> slaMap = Map.of(
        "policyTier", s.sla() != null ? s.sla().tier() : "T1",
        "clockMode", s.sla() != null ? s.sla().mode().name() : "CONTINUOUS_24X7",
        "responseTargetMinutes", s.sla() != null ? (int)(s.sla().responseTargetMs() / 60000L) : 5,
        "resolutionTargetMinutes", s.sla() != null ? (int)(s.sla().resolutionTargetMs() / 60000L) : 30
    );

    Map<String, Object> assigneeMap = s.assigneeId() != null
        ? Map.of("id", s.assigneeId().toString(), "name", "Assigned Technician", "supportTier", "SENIOR")
        : Map.of();

    return new IncidentDtos.IncidentDetailResponse(
        s.id(),
        s.number(),
        s.title(),
        s.description(),
        s.status() != null ? s.status().name() : "NEW",
        s.slaStatus() != null ? s.slaStatus().name() : "ON_TRACK",
        "APP-ERP",
        "SOFTWARE",
        (short) s.impact(),
        (short) s.urgency(),
        s.priority() != null ? s.priority().name() : "P3",
        List.of(),
        slaMap,
        assigneeMap,
        Map.of("strategy", "LEAST_LOADED"),
        s.parentId(),
        s.commanderId(),
        s.affectedUsers(),
        allowed,
        false,
        s.version(),
        s.createdAt(),
        null,
        null
    );
  }

  private List<String> computeAllowedCommands(String status) {
    if (status == null) return List.of();
    return switch (status.toUpperCase()) {
      case "NEW" -> List.of("CLASSIFY", "CANCEL");
      case "CLASSIFIED" -> List.of("ASSIGN", "CANCEL");
      case "ASSIGNED" -> List.of("ACKNOWLEDGE", "REASSIGN", "LINK_AS_CHILD", "CANCEL", "DECLARE_MAJOR", "REPRIORITIZE");
      case "ACKNOWLEDGED" -> List.of("START", "REASSIGN", "REQUEST_INFO", "CANCEL", "DECLARE_MAJOR");
      case "IN_PROGRESS" -> List.of("RESOLVE", "REQUEST_INFO", "REASSIGN", "DECLARE_MAJOR", "LINK_AS_CHILD");
      case "PENDING_USER" -> List.of("PROVIDE_INFO", "CANCEL");
      case "RESOLVED" -> List.of("VERIFY", "REJECT");
      case "VERIFIED" -> List.of("CLOSE");
      case "REOPENED" -> List.of("REASSIGN", "RESOLVE", "REQUEST_INFO");
      case "CLOSED", "CANCELLED" -> List.of();
      default -> List.of();
    };
  }
}
