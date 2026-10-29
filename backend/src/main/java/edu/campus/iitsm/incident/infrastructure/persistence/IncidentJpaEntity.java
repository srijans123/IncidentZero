package edu.campus.iitsm.incident.infrastructure.persistence;

import edu.campus.iitsm.incident.domain.ClockMode;
import edu.campus.iitsm.incident.domain.ClockState;
import edu.campus.iitsm.incident.domain.Incident;
import edu.campus.iitsm.incident.domain.IncidentStatus;
import edu.campus.iitsm.incident.domain.Priority;
import edu.campus.iitsm.incident.domain.PriorityExplanation;
import edu.campus.iitsm.incident.domain.PriorityStep;
import edu.campus.iitsm.incident.domain.Resolution;
import edu.campus.iitsm.incident.domain.SlaClock;
import edu.campus.iitsm.incident.domain.SlaSnapshot;
import edu.campus.iitsm.incident.domain.SlaStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.persistence.Version;
import org.springframework.data.domain.Persistable;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "incident")
public class IncidentJpaEntity implements Persistable<UUID> {

  private static final UUID DEFAULT_POLICY_ID = UUID.fromString("40000000-0000-0000-0000-000000000001");

  @Transient
  private boolean isNew = false;

  @Id
  @Column(name = "id", nullable = false)
  private UUID id;

  @Column(name = "number", nullable = false, unique = true)
  private String number;

  @Column(name = "reporter_id", nullable = false)
  private UUID reporterId;

  @Column(name = "service_id", nullable = false)
  private UUID serviceId;

  @Column(name = "category_id")
  private UUID categoryId;

  @Column(name = "title", nullable = false)
  private String title;

  @Column(name = "description", nullable = false)
  private String description;

  @Column(name = "impact", nullable = false)
  private short impact;

  @Column(name = "urgency", nullable = false)
  private short urgency;

  @Column(name = "priority", nullable = false)
  private String priority;

  @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
  @Column(name = "priority_explanation", nullable = false, columnDefinition = "jsonb")
  private String priorityExplanationJson;

  @Column(name = "status", nullable = false)
  private String status;

  @Column(name = "sla_status", nullable = false)
  private String slaStatus;

  @Column(name = "assignee_id")
  private UUID assigneeId;

  @Column(name = "team_id")
  private UUID teamId;

  @Column(name = "parent_id")
  private UUID parentId;

  @Column(name = "commander_id")
  private UUID commanderId;

  @Column(name = "is_major", nullable = false)
  private boolean major;

  @Column(name = "affected_users", nullable = false)
  private int affectedUsers = 1;

  @Column(name = "sla_policy_id")
  private UUID slaPolicyId;

  @Column(name = "sla_clock_mode", nullable = false)
  private String slaClockMode;

  @Column(name = "response_target_min", nullable = false)
  private int responseTargetMin = 60;

  @Column(name = "resolution_target_min", nullable = false)
  private int resolutionTargetMin = 480;

  @Column(name = "resp_clock_state", nullable = false)
  private String respClockState;

  @Column(name = "resp_clock_consumed_ms", nullable = false)
  private long respClockConsumedMs;

  @Column(name = "resp_clock_last_resume_at")
  private Instant respClockLastResumeAt;

  @Column(name = "res_clock_state", nullable = false)
  private String resClockState;

  @Column(name = "res_clock_consumed_ms", nullable = false)
  private long resClockConsumedMs;

  @Column(name = "res_clock_last_resume_at")
  private Instant resClockLastResumeAt;

  @Column(name = "clock_generation", nullable = false)
  private int clockGeneration;

  @Column(name = "last_audit_index", nullable = false)
  private int lastAuditIndex;

  @org.hibernate.annotations.JdbcTypeCode(java.sql.Types.CHAR)
  @Column(name = "last_audit_hash", nullable = false, length = 64)
  private String lastAuditHash;

  @Column(name = "responded_at")
  private Instant respondedAt;

  @Column(name = "resolved_at")
  private Instant resolvedAt;

  @Column(name = "closed_at")
  private Instant closedAt;

  @Column(name = "closure_note")
  private String closureNote;

  @Column(name = "resolution_code")
  private String resolutionCode;

  @Column(name = "resolution_notes")
  private String resolutionNotes;

  @Column(name = "root_cause_category")
  private String rootCauseCategory;

  @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
  @Column(name = "archived_resolutions", nullable = false, columnDefinition = "jsonb")
  private String archivedResolutionsJson;

  @Column(name = "rating")
  private Short rating;

  @Column(name = "reassign_count", nullable = false)
  private int reassignCount;

  @Column(name = "reopen_count", nullable = false)
  private int reopenCount;

  @Column(name = "suggestions_pending", nullable = false)
  private boolean suggestionsPending;

  @Column(name = "flagged", nullable = false)
  private boolean flagged;

  @Version
  @Column(name = "version", nullable = false)
  private Long version;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  public IncidentJpaEntity() {}

  public static IncidentJpaEntity fromSnapshot(Incident.Snapshot s) {
    IncidentJpaEntity entity = new IncidentJpaEntity();
    entity.id = s.id();
    entity.number = s.number();
    entity.reporterId = s.reporterId();
    entity.serviceId = s.serviceId();
    entity.categoryId = s.categoryId();
    entity.title = s.title();
    entity.description = s.description();
    entity.impact = (short) s.impact();
    entity.urgency = (short) s.urgency();
    entity.priority = s.priority() != null ? s.priority().name() : "P3";
    entity.priorityExplanationJson = "[]";
    entity.status = s.status() != null ? s.status().name() : "NEW";
    entity.slaStatus = s.slaStatus() != null ? s.slaStatus().name() : "ON_TRACK";
    entity.assigneeId = s.assigneeId();
    entity.teamId = s.teamId();
    entity.parentId = s.parentId();
    entity.commanderId = s.commanderId();
    entity.major = s.major();
    entity.affectedUsers = s.affectedUsers() >= 1 ? s.affectedUsers() : 1;

    if (s.sla() != null) {
      entity.slaPolicyId = s.sla().policyId();
      entity.slaClockMode = s.sla().mode().name();
      entity.responseTargetMin = (int) (s.sla().responseTargetMs() / 60_000L);
      entity.resolutionTargetMin = (int) (s.sla().resolutionTargetMs() / 60_000L);
    } else {
      entity.slaPolicyId = DEFAULT_POLICY_ID;
      entity.slaClockMode = "BUSINESS_HOURS";
      entity.responseTargetMin = 60;
      entity.resolutionTargetMin = 480;
    }

    if (s.responseClock() != null) {
      entity.respClockState = s.responseClock().state().name();
      entity.respClockConsumedMs = s.responseClock().consumedMs();
      entity.respClockLastResumeAt = s.responseClock().lastResumeAt();
    } else {
      entity.respClockState = "RUNNING";
      entity.respClockConsumedMs = 0L;
      entity.respClockLastResumeAt = s.createdAt();
    }

    if (s.resolutionClock() != null) {
      entity.resClockState = s.resolutionClock().state().name();
      entity.resClockConsumedMs = s.resolutionClock().consumedMs();
      entity.resClockLastResumeAt = s.resolutionClock().lastResumeAt();
    } else {
      entity.resClockState = "RUNNING";
      entity.resClockConsumedMs = 0L;
      entity.resClockLastResumeAt = s.createdAt();
    }

    entity.clockGeneration = s.clockGeneration();
    entity.lastAuditIndex = 0;
    entity.lastAuditHash = "0".repeat(64);
    entity.respondedAt = s.respondedAt();
    entity.resolvedAt = s.resolvedAt();
    entity.closedAt = s.closedAt();
    entity.closureNote = s.closureNote();

    if (s.resolution() != null) {
      entity.resolutionCode = s.resolution().code();
      entity.resolutionNotes = s.resolution().notes();
      entity.rootCauseCategory = s.resolution().rootCauseCategory();
    }
    entity.archivedResolutionsJson = "[]";
    entity.rating = s.rating() != null ? s.rating().shortValue() : null;
    entity.reassignCount = s.reassignCount();
    entity.reopenCount = s.reopenCount();
    entity.suggestionsPending = false;
    entity.flagged = false;
    entity.isNew = true;
    entity.version = null;
    entity.createdAt = s.createdAt() != null ? s.createdAt() : Instant.now();
    entity.updatedAt = s.createdAt() != null ? s.createdAt() : Instant.now();
    return entity;
  }

  public void updateFromSnapshot(Incident.Snapshot s) {
    this.categoryId = s.categoryId();
    this.title = s.title();
    this.description = s.description();
    this.impact = (short) s.impact();
    this.urgency = (short) s.urgency();
    this.priority = s.priority() != null ? s.priority().name() : this.priority;
    this.status = s.status() != null ? s.status().name() : this.status;
    this.slaStatus = s.slaStatus() != null ? s.slaStatus().name() : this.slaStatus;
    this.assigneeId = s.assigneeId();
    this.teamId = s.teamId();
    this.parentId = s.parentId();
    this.commanderId = s.commanderId();
    this.major = s.major();
    this.affectedUsers = s.affectedUsers();

    if (s.sla() != null) {
      this.slaPolicyId = s.sla().policyId();
      this.slaClockMode = s.sla().mode().name();
      this.responseTargetMin = (int) (s.sla().responseTargetMs() / 60_000L);
      this.resolutionTargetMin = (int) (s.sla().resolutionTargetMs() / 60_000L);
    }

    if (s.responseClock() != null) {
      this.respClockState = s.responseClock().state().name();
      this.respClockConsumedMs = s.responseClock().consumedMs();
      this.respClockLastResumeAt = s.responseClock().lastResumeAt();
    }

    if (s.resolutionClock() != null) {
      this.resClockState = s.resolutionClock().state().name();
      this.resClockConsumedMs = s.resolutionClock().consumedMs();
      this.resClockLastResumeAt = s.resolutionClock().lastResumeAt();
    }

    this.clockGeneration = s.clockGeneration();
    this.respondedAt = s.respondedAt();
    this.resolvedAt = s.resolvedAt();
    this.closedAt = s.closedAt();
    this.closureNote = s.closureNote();

    if (s.resolution() != null) {
      this.resolutionCode = s.resolution().code();
      this.resolutionNotes = s.resolution().notes();
      this.rootCauseCategory = s.resolution().rootCauseCategory();
    } else {
      this.resolutionCode = null;
      this.resolutionNotes = null;
      this.rootCauseCategory = null;
    }

    this.rating = s.rating() != null ? s.rating().shortValue() : null;
    this.reassignCount = s.reassignCount();
    this.reopenCount = s.reopenCount();
    this.updatedAt = Instant.now();
  }

  public Incident.Snapshot toSnapshot() {
    ClockMode mode = "CONTINUOUS_24X7".equalsIgnoreCase(slaClockMode) ? ClockMode.CONTINUOUS_24X7 : ClockMode.BUSINESS_HOURS;
    long respTargetMs = Math.max(60_000L, (long) responseTargetMin * 60_000L);
    long resTargetMs = Math.max(respTargetMs, (long) resolutionTargetMin * 60_000L);
    UUID polId = slaPolicyId != null ? slaPolicyId : DEFAULT_POLICY_ID;
    SlaSnapshot sla = new SlaSnapshot(polId, "T1", respTargetMs, resTargetMs, mode);

    ClockState respState = ClockState.valueOf(respClockState != null ? respClockState : "RUNNING");
    Instant respResume = respClockLastResumeAt != null ? respClockLastResumeAt : createdAt;
    SlaClock respClock = new SlaClock(respState, respClockConsumedMs, respResume, respTargetMs, mode);

    ClockState resState = ClockState.valueOf(resClockState != null ? resClockState : "RUNNING");
    Instant resResume = resClockLastResumeAt != null ? resClockLastResumeAt : createdAt;
    SlaClock resClock = new SlaClock(resState, resClockConsumedMs, resResume, resTargetMs, mode);

    Resolution res = (resolutionCode != null && resolutionNotes != null)
        ? new Resolution(resolutionCode, resolutionNotes, rootCauseCategory)
        : null;

    Priority p = Priority.valueOf(priority != null ? priority : "P3");
    IncidentStatus stat = IncidentStatus.valueOf(status != null ? status : "NEW");
    SlaStatus sStatus = SlaStatus.valueOf(slaStatus != null ? slaStatus : "ON_TRACK");

    return new Incident.Snapshot(
        id, number, reporterId, serviceId, categoryId,
        title, description, impact, urgency,
        p, PriorityExplanation.empty(),
        stat, sStatus, sla,
        respClock, resClock, clockGeneration,
        assigneeId, teamId, parentId, commanderId,
        major, affectedUsers, reassignCount, reopenCount,
        res, new ArrayList<>(), rating != null ? rating.intValue() : null,
        closureNote, createdAt, respondedAt,
        resolvedAt, closedAt, version != null ? version : 0L
    );
  }

  @Override
  public boolean isNew() {
    return isNew || version == null;
  }

  @Override
  public UUID getId() { return id; }
  public String getNumber() { return number; }
  public Long getVersion() { return version; }
  public String getStatus() { return status; }
  public String getPriority() { return priority; }
  public int getLastAuditIndex() { return lastAuditIndex; }
  public String getLastAuditHash() { return lastAuditHash; }
}
