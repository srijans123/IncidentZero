package edu.campus.iitsm.incident.infrastructure.persistence;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.campus.iitsm.incident.api.IncidentQueryPort;
import edu.campus.iitsm.incident.api.dto.IncidentDtos;
import edu.campus.iitsm.incident.domain.ClockState;
import edu.campus.iitsm.incident.domain.Incident;
import edu.campus.iitsm.shared.domain.ClockPort;
import edu.campus.iitsm.shared.domain.WorkingTimeCalculator;
import edu.campus.iitsm.shared.domain.error.ServiceNotFoundException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Component
public class IncidentQueryAdapter implements IncidentQueryPort {

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

  private final IncidentJpaRepository jpaRepository;
  private final JdbcTemplate jdbcTemplate;
  private final ClockPort clockPort;
  private final WorkingTimeCalculator calendar;

  public IncidentQueryAdapter(
      IncidentJpaRepository jpaRepository,
      JdbcTemplate jdbcTemplate,
      ClockPort clockPort,
      WorkingTimeCalculator calendar
  ) {
    this.jpaRepository = jpaRepository;
    this.jdbcTemplate = jdbcTemplate;
    this.clockPort = clockPort;
    this.calendar = calendar;
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
      UUID parentId,
      Boolean mine,
      UUID callerId,
      String callerRole,
      String q,
      String cursor,
      int limit
  ) {
    int maxLimit = (limit <= 0 || limit > 100) ? 50 : limit;

    StringBuilder sql = new StringBuilder("""
        SELECT i.id, i.number, i.title, i.status, i.sla_status, i.priority,
               i.reporter_id, r.name AS reporter_name,
               i.assignee_id, a.name AS assignee_name,
               i.service_id, s.code AS service_code,
               i.category_id, c.code AS category_code,
               i.parent_id, i.is_major, i.reopen_count, i.version, i.created_at,
               (SELECT count(*) FROM incident ch WHERE ch.parent_id = i.id) AS child_count
        FROM incident i
        JOIN it_service s ON s.id = i.service_id
        LEFT JOIN category c ON c.id = i.category_id
        LEFT JOIN app_user a ON a.id = i.assignee_id
        LEFT JOIN app_user r ON r.id = i.reporter_id
        WHERE 1=1
    """);
    List<Object> params = new ArrayList<>();

    if (status != null && !status.isBlank()) {
      sql.append(" AND i.status = ?");
      params.add(status.trim().toUpperCase());
    }
    if (priority != null && !priority.isBlank()) {
      sql.append(" AND i.priority = ?");
      params.add(priority.trim().toUpperCase());
    }
    if (serviceId != null) {
      sql.append(" AND i.service_id = ?");
      params.add(serviceId);
    }
    if (parentId != null) {
      sql.append(" AND i.parent_id = ?");
      params.add(parentId);
    }
    if (Boolean.TRUE.equals(mine) && callerId != null) {
      if ("EMPLOYEE".equalsIgnoreCase(callerRole)) {
        sql.append(" AND i.reporter_id = ?");
        params.add(callerId);
      } else if ("TECHNICIAN".equalsIgnoreCase(callerRole)) {
        sql.append(" AND i.assignee_id = ?");
        params.add(callerId);
      }
    }
    if (q != null && !q.isBlank()) {
      sql.append(" AND (i.title ILIKE ? OR i.number ILIKE ?)");
      params.add("%" + q.trim() + "%");
      params.add("%" + q.trim() + "%");
    }

    sql.append(" ORDER BY i.created_at DESC LIMIT ?");
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
          UUID reporterId = (UUID) rs.getObject("reporter_id");
          String reporterName = rs.getString("reporter_name");
          UUID assigneeId = (UUID) rs.getObject("assignee_id");
          String assigneeName = rs.getString("assignee_name");
          String sCode = rs.getString("service_code");
          String cCode = rs.getString("category_code");
          UUID pId = (UUID) rs.getObject("parent_id");
          boolean isMaj = rs.getBoolean("is_major");
          int childCount = rs.getInt("child_count");
          int reopenCount = rs.getInt("reopen_count");
          long version = rs.getLong("version");
          Timestamp createdAtTs = rs.getTimestamp("created_at");

          return new IncidentDtos.IncidentSummaryDto(
              id,
              number,
              title,
              sCode != null ? sCode : "APP-ERP",
              cCode != null ? cCode : "SOFTWARE",
              st,
              slaSt,
              prio,
              reporterId,
              reporterName != null ? reporterName : "Reporter",
              assigneeId,
              assigneeName != null ? assigneeName : (assigneeId != null ? "Assigned Technician" : "Unassigned"),
              createdAtTs != null ? createdAtTs.toInstant() : Instant.now(),
              null,
              null,
              pId,
              isMaj,
              childCount,
              reopenCount,
              List.of(),
              version
          );
        }
    );

    boolean hasMore = items.size() > maxLimit;
    List<IncidentDtos.IncidentSummaryDto> pagedItems = hasMore ? items.subList(0, maxLimit) : items;

    if (!pagedItems.isEmpty()) {
      List<UUID> ids = pagedItems.stream().map(IncidentDtos.IncidentSummaryDto::id).toList();
      Map<UUID, IncidentJpaEntity> entityMap = new HashMap<>();
      jpaRepository.findAllById(ids).forEach(e -> entityMap.put(e.getId(), e));

      Instant now = clockPort.now();
      List<IncidentDtos.IncidentSummaryDto> enriched = new ArrayList<>();
      for (IncidentDtos.IncidentSummaryDto item : pagedItems) {
        IncidentJpaEntity entity = entityMap.get(item.id());
        if (entity != null) {
          Incident domainInc = Incident.restore(entity.toSnapshot());
          Instant respDue = (domainInc.responseClock() != null && domainInc.responseClock().state() == ClockState.RUNNING)
              ? domainInc.responseClock().dueAt(now, calendar) : null;
          Instant resDue = (domainInc.resolutionClock() != null && domainInc.resolutionClock().state() == ClockState.RUNNING)
              ? domainInc.resolutionClock().dueAt(now, calendar) : null;
          List<String> allowed = domainInc.allowedCommands().stream().map(Enum::name).toList();

          enriched.add(new IncidentDtos.IncidentSummaryDto(
              item.id(), item.number(), item.title(), item.serviceCode(), item.categoryCode(),
              item.status(), item.slaStatus(), item.priority(),
              item.reporterId(), item.reporterName(), item.assigneeId(), item.assigneeName(),
              item.createdAt(), respDue, resDue, item.parentId(), item.major(), item.childCount(),
              item.reopenCount(), allowed, item.version()
          ));
        } else {
          enriched.add(item);
        }
      }
      pagedItems = enriched;
    }

    String nextCursor = hasMore && !pagedItems.isEmpty() ? pagedItems.get(pagedItems.size() - 1).id().toString() : null;
    return new IncidentDtos.PageResponse<>(pagedItems, nextCursor, hasMore, pagedItems.size());
  }

  @Override
  public List<IncidentDtos.AuditTimelineItemDto> getTimeline(UUID incidentId) {
    String sql = "SELECT id, incident_id, action, actor_type, actor_id, description, payload, hash, ts FROM audit_record WHERE incident_id = ? ORDER BY chain_index ASC";
    return jdbcTemplate.query(
        sql,
        ps -> ps.setObject(1, incidentId),
        (rs, rowNum) -> new IncidentDtos.AuditTimelineItemDto(
            rs.getLong("id"),
            (UUID) rs.getObject("incident_id"),
            rs.getString("action"),
            rs.getString("actor_type"),
            rs.getString("actor_id"),
            rs.getString("description"),
            rs.getString("payload"),
            rs.getString("hash"),
            rs.getTimestamp("ts").toInstant()
        )
    );
  }

  @Override
  public Optional<IncidentDtos.ServiceDto> findService(String serviceCode, UUID serviceId) {
    if (serviceCode != null && !serviceCode.isBlank()) {
      List<IncidentDtos.ServiceDto> list = jdbcTemplate.query(
          "SELECT id, code, name, tier FROM it_service WHERE code = ?",
          (rs, rowNum) -> new IncidentDtos.ServiceDto(
              (UUID) rs.getObject("id"),
              rs.getString("code"),
              rs.getString("name"),
              rs.getString("tier")
          ),
          serviceCode.trim()
      );
      if (list.isEmpty()) {
        throw new ServiceNotFoundException(serviceCode);
      }
      return Optional.of(list.get(0));
    }
    if (serviceId != null) {
      List<IncidentDtos.ServiceDto> list = jdbcTemplate.query(
          "SELECT id, code, name, tier FROM it_service WHERE id = ?",
          (rs, rowNum) -> new IncidentDtos.ServiceDto(
              (UUID) rs.getObject("id"),
              rs.getString("code"),
              rs.getString("name"),
              rs.getString("tier")
          ),
          serviceId
      );
      if (list.isEmpty()) {
        throw new ServiceNotFoundException(serviceId.toString());
      }
      return Optional.of(list.get(0));
    }
    return Optional.empty();
  }

  @Override
  public List<IncidentDtos.ServiceDto> listServices() {
    return jdbcTemplate.query(
        "SELECT id, code, name, tier FROM it_service WHERE active = true ORDER BY name ASC",
        (rs, rowNum) -> new IncidentDtos.ServiceDto(
            (UUID) rs.getObject("id"),
            rs.getString("code"),
            rs.getString("name"),
            rs.getString("tier")
        )
    );
  }

  private IncidentDtos.IncidentDetailResponse toDetailResponse(IncidentJpaEntity e) {
    Incident.Snapshot s = e.toSnapshot();
    Incident inc = Incident.restore(s);
    Instant now = clockPort.now();

    Instant responseDueAt = (inc.responseClock() != null && inc.responseClock().state() == ClockState.RUNNING)
        ? inc.responseClock().dueAt(now, calendar) : null;
    Instant resolutionDueAt = (inc.resolutionClock() != null && inc.resolutionClock().state() == ClockState.RUNNING)
        ? inc.resolutionClock().dueAt(now, calendar) : null;

    String serviceCode = "APP-ERP";
    String serviceTier = "T1";
    try {
      var row = jdbcTemplate.queryForMap("SELECT code, tier FROM it_service WHERE id = ?", s.serviceId());
      if (row.get("code") != null) serviceCode = (String) row.get("code");
      if (row.get("tier") != null) serviceTier = (String) row.get("tier");
    } catch (Exception ignored) {}

    String categoryCode = null;
    if (s.categoryId() != null) {
      try {
        categoryCode = jdbcTemplate.queryForObject("SELECT code FROM category WHERE id = ?", String.class, s.categoryId());
      } catch (Exception ignored) {}
    }

    String reporterName = "Campus User";
    try {
      reporterName = jdbcTemplate.queryForObject("SELECT name FROM app_user WHERE id = ?", String.class, s.reporterId());
    } catch (Exception ignored) {}

    Map<String, Object> assigneeMap = Map.of();
    if (s.assigneeId() != null) {
      try {
        var row = jdbcTemplate.queryForMap(
            "SELECT u.name, p.support_tier FROM app_user u LEFT JOIN technician_profile p ON p.user_id = u.id WHERE u.id = ?",
            s.assigneeId()
        );
        String name = (String) row.get("name");
        String supTier = (String) row.get("support_tier");
        assigneeMap = Map.of(
            "id", s.assigneeId().toString(),
            "name", name != null ? name : "Technician",
            "supportTier", supTier != null ? supTier : "SENIOR"
        );
      } catch (Exception ignored) {}
    }

    int childCount = 0;
    try {
      Integer c = jdbcTemplate.queryForObject("SELECT count(*) FROM incident WHERE parent_id = ?", Integer.class, s.id());
      childCount = c != null ? c : 0;
    } catch (Exception ignored) {}

    List<String> allowed = inc.allowedCommands().stream().map(Enum::name).toList();

    Map<String, Object> slaMap = Map.of(
        "policyTier", serviceTier != null ? serviceTier : (s.sla() != null ? s.sla().tier() : "T1"),
        "clockMode", s.sla() != null ? s.sla().mode().name() : "CONTINUOUS_24X7",
        "responseTargetMinutes", s.sla() != null ? (int)(s.sla().responseTargetMs() / 60000L) : 5,
        "resolutionTargetMinutes", s.sla() != null ? (int)(s.sla().resolutionTargetMs() / 60000L) : 30
    );

    Map<String, Object> resolutionMap = null;
    if (s.resolution() != null) {
      resolutionMap = new HashMap<>();
      resolutionMap.put("code", s.resolution().code());
      resolutionMap.put("notes", s.resolution().notes());
      resolutionMap.put("rootCauseCategory", s.resolution().rootCauseCategory() != null ? s.resolution().rootCauseCategory() : "");
    }

    List<Map<String, Object>> prioritySteps = new ArrayList<>();
    if (e.getPriorityExplanationJson() != null && !e.getPriorityExplanationJson().isBlank()) {
      try {
        prioritySteps = OBJECT_MAPPER.readValue(e.getPriorityExplanationJson(), new TypeReference<List<Map<String, Object>>>() {});
      } catch (Exception ignored) {}
    }

    return new IncidentDtos.IncidentDetailResponse(
        s.id(),
        s.number(),
        s.title(),
        s.description(),
        s.status() != null ? s.status().name() : "NEW",
        s.slaStatus() != null ? s.slaStatus().name() : "ON_TRACK",
        serviceCode,
        categoryCode,
        (short) s.impact(),
        (short) s.urgency(),
        s.priority() != null ? s.priority().name() : "P3",
        prioritySteps,
        slaMap,
        assigneeMap,
        Map.of("strategy", "LEAST_LOADED"),
        s.reporterId(),
        reporterName,
        s.parentId(),
        s.commanderId(),
        s.major(),
        childCount,
        s.affectedUsers(),
        s.reopenCount(),
        allowed,
        false,
        resolutionMap,
        s.rating() != null ? s.rating().shortValue() : null,
        s.closureNote(),
        s.respondedAt(),
        s.resolvedAt(),
        s.closedAt(),
        s.createdAt(),
        responseDueAt,
        resolutionDueAt,
        s.version()
    );
  }
}
