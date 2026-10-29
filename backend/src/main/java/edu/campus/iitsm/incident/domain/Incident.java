package edu.campus.iitsm.incident.domain;

import edu.campus.iitsm.incident.api.IncidentEvents.*;
import edu.campus.iitsm.shared.domain.DomainEvent;
import edu.campus.iitsm.shared.domain.WorkingTimeCalculator;
import edu.campus.iitsm.shared.domain.error.InvalidIncidentPayloadException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public final class Incident {

  public record Snapshot(
      UUID id, String number, UUID reporterId, UUID serviceId, UUID categoryId,
      String title, String description, int impact, int urgency,
      Priority priority, PriorityExplanation priorityExplanation,
      IncidentStatus status, SlaStatus slaStatus, SlaSnapshot sla,
      SlaClock responseClock, SlaClock resolutionClock, int clockGeneration,
      UUID assigneeId, UUID teamId, UUID parentId, UUID commanderId,
      boolean major, int affectedUsers, int reassignCount, int reopenCount,
      Resolution resolution, List<Resolution> archivedResolutions, Integer rating,
      String closureNote, Instant createdAt, Instant respondedAt,
      Instant resolvedAt, Instant closedAt, long version
  ) {}

  private final UUID id;
  private final String number;
  private final UUID reporterId;
  private final UUID serviceId;
  private final Instant createdAt;
  private final List<DomainEvent> pending = new ArrayList<>();
  private final List<Resolution> archivedResolutions = new ArrayList<>();

  private String title;
  private String description;
  private IncidentState state = NewState.INSTANCE;
  private UUID categoryId;
  private final int impact;
  private final int urgency;
  private Priority priority;
  private PriorityExplanation priorityExplanation;
  private SlaSnapshot sla;
  private SlaClock responseClock;
  private SlaClock resolutionClock;
  private int clockGeneration;
  private SlaStatus slaStatus = SlaStatus.ON_TRACK;
  private UUID assigneeId;
  private UUID teamId;
  private UUID parentId;
  private UUID commanderId;
  private int affectedUsers = 1;
  private int reassignCount;
  private int reopenCount;
  private Resolution resolution;
  private Integer rating;
  private String closureNote;
  private Instant respondedAt;
  private Instant resolvedAt;
  private Instant closedAt;
  private boolean major;
  private long version;

  private Incident(UUID id, String number, UUID reporterId, UUID serviceId, String title, String description,
                   int impact, int urgency, Priority priority, PriorityExplanation explanation, SlaSnapshot sla, Instant now) {
    this.id = id;
    this.number = number;
    this.reporterId = reporterId;
    this.serviceId = serviceId;
    this.title = title;
    this.description = description;
    this.createdAt = now;
    this.impact = impact;
    this.urgency = urgency;
    this.priority = priority;
    this.priorityExplanation = explanation;
    this.sla = sla;
    this.responseClock = SlaClock.start(now, sla.responseTargetMs(), sla.mode());
    this.resolutionClock = SlaClock.start(now, sla.resolutionTargetMs(), sla.mode());
  }

  public static Incident create(UUID id, UUID reporterId, UUID serviceId, int impact, int urgency, Priority provisional,
                                PriorityExplanation explanation, SlaSnapshot sla, Instant now) {
    return createWithNumber(id, "INC-2026-000001", reporterId, serviceId,
        "Campus incident report", "Detailed incident description provided by reporter",
        impact, urgency, provisional, explanation, sla, now);
  }

  public static Incident createWithNumber(UUID id, String number, UUID reporterId, UUID serviceId,
                                          String title, String description, int impact, int urgency,
                                          Priority provisional, PriorityExplanation explanation, SlaSnapshot sla, Instant now) {
    StateSupport.requireNonNull("id", id);
    String num = StateSupport.requireText("number", number);
    StateSupport.requireNonNull("reporterId", reporterId);
    StateSupport.requireNonNull("serviceId", serviceId);
    String cleanTitle = StateSupport.requireText("title", title);
    String cleanDesc = StateSupport.requireText("description", description);
    if (cleanTitle.length() < 5 || cleanTitle.length() > 200) {
      throw new InvalidIncidentPayloadException("title", "must be between 5 and 200 characters");
    }
    if (cleanDesc.length() < 10 || cleanDesc.length() > 4000) {
      throw new InvalidIncidentPayloadException("description", "must be between 10 and 4000 characters");
    }
    StateSupport.requireNonNull("priority", provisional);
    StateSupport.requireNonNull("explanation", explanation);
    StateSupport.requireNonNull("sla", sla);
    StateSupport.requireNonNull("now", now);
    if (impact < 1 || impact > 3) throw new InvalidIncidentPayloadException("impact", "must be between 1 and 3");
    if (urgency < 1 || urgency > 3) throw new InvalidIncidentPayloadException("urgency", "must be between 1 and 3");
    Incident i = new Incident(id, num, reporterId, serviceId, cleanTitle, cleanDesc, impact, urgency, provisional, explanation, sla, now);
    i.pending.add(new IncidentCreated(id, now, reporterId, serviceId, provisional));
    return i;
  }

  /** Rebuilds an Incident aggregate from JPA persistence without emitting creation events. */
  public static Incident restore(Snapshot s) {
    StateSupport.requireNonNull("snapshot", s);
    Incident i = new Incident(
        s.id(), s.number(), s.reporterId(), s.serviceId(),
        s.title() != null ? s.title() : "Restored Incident",
        s.description() != null ? s.description() : "Restored incident description",
        s.impact(), s.urgency(), s.priority(), s.priorityExplanation(), s.sla(), s.createdAt()
    );
    i.state = IncidentStates.of(s.status());
    i.categoryId = s.categoryId();
    i.slaStatus = s.slaStatus();
    i.responseClock = s.responseClock();
    i.resolutionClock = s.resolutionClock();
    i.clockGeneration = s.clockGeneration();
    i.assigneeId = s.assigneeId();
    i.teamId = s.teamId();
    i.parentId = s.parentId();
    i.commanderId = s.commanderId();
    i.major = s.major();
    i.affectedUsers = s.affectedUsers();
    i.reassignCount = s.reassignCount();
    i.reopenCount = s.reopenCount();
    i.resolution = s.resolution();
    if (s.archivedResolutions() != null) i.archivedResolutions.addAll(s.archivedResolutions());
    i.rating = s.rating();
    i.closureNote = s.closureNote();
    i.respondedAt = s.respondedAt();
    i.resolvedAt = s.resolvedAt();
    i.closedAt = s.closedAt();
    i.version = s.version();
    return i;
  }

  public Snapshot toSnapshot() {
    return new Snapshot(
        id, number, reporterId, serviceId, categoryId, title, description, impact, urgency,
        priority, priorityExplanation, status(), slaStatus, sla, responseClock, resolutionClock,
        clockGeneration, assigneeId, teamId, parentId, commanderId, major, affectedUsers,
        reassignCount, reopenCount, resolution, List.copyOf(archivedResolutions), rating,
        closureNote, createdAt, respondedAt, resolvedAt, closedAt, version
    );
  }

  public void classify(UUID categoryId, Priority priority, PriorityExplanation explanation, SlaSnapshot sla,
                       UUID actor, Instant now, WorkingTimeCalculator cal) {
    commit(state.classify(this, categoryId, priority, explanation, sla, actor, now, cal));
  }
  public void assign(UUID assigneeId, UUID teamId, String strategy, UUID actor, Instant now) {
    commit(state.assign(this, assigneeId, teamId, strategy, actor, now));
  }
  public void reassign(UUID newAssigneeId, UUID teamId, String reason, UUID actor, Instant now) {
    commit(state.reassign(this, newAssigneeId, teamId, reason, actor, now));
  }
  public void acknowledge(UUID actor, Instant now, WorkingTimeCalculator cal) {
    commit(state.acknowledge(this, actor, now, cal));
  }
  public void startInvestigation(UUID actor, Instant now, WorkingTimeCalculator cal) {
    commit(state.startInvestigation(this, actor, now, cal));
  }
  public void requestUserInfo(UUID actor, String question, Instant now, WorkingTimeCalculator cal) {
    commit(state.requestUserInfo(this, actor, question, now, cal));
  }
  public void provideUserInfo(UUID reporter, Instant now) {
    commit(state.provideUserInfo(this, reporter, now));
  }
  public void resolve(UUID actor, Resolution resolution, Instant now, WorkingTimeCalculator cal) {
    commit(state.resolve(this, actor, resolution, now, cal));
  }
  public void verify(UUID actor, Integer rating, Instant now) {
    commit(state.verify(this, actor, rating, now));
  }
  public void rejectResolution(UUID reporter, String reason, Instant now) {
    commit(state.rejectResolution(this, reporter, reason, now));
  }
  public void close(UUID actor, String closureNote, Instant now) {
    commit(state.close(this, actor, closureNote, now));
  }
  public void resolveWithMaster(Resolution masterResolution, Instant now, WorkingTimeCalculator cal) {
    commit(state.resolveWithMaster(this, masterResolution, now, cal));
  }
  public void linkAsChild(UUID masterId, Instant now, WorkingTimeCalculator cal) {
    commit(state.linkAsChild(this, masterId, now, cal));
  }
  public void unlinkFromMaster(String reason, Instant now) { commit(state.unlinkFromMaster(this, reason, now)); }
  public void declareMajor(UUID actor, SlaSnapshot p1Sla, Instant now, WorkingTimeCalculator cal) {
    commit(state.declareMajor(this, actor, p1Sla, now, cal));
  }
  public void reprioritize(Priority newPriority, PriorityExplanation explanation, SlaSnapshot sla, String reason,
                           UUID actor, Instant now, WorkingTimeCalculator cal) {
    commit(state.reprioritize(this, newPriority, explanation, sla, reason, actor, now, cal));
  }
  public void cancel(UUID actor, String reason, Instant now, WorkingTimeCalculator cal) {
    commit(state.cancel(this, actor, reason, now, cal));
  }

  /**
   * Evaluates SLA warning/breach state without bumping the HTTP ETag optimistic-lock version
   * when only AT_RISK/ON_TRACK changes, preventing background SLA ticks from causing spurious 409s.
   * Resets AT_RISK back to ON_TRACK when an SLA target extension drops active ratios below 0.75.
   */
  public void refreshSla(Instant now, WorkingTimeCalculator cal) {
    if (state.status().isTerminal()) return;
    boolean breached = running(responseClock) && responseClock.remainingMs(now, cal) <= 0;
    boolean breachedRes = running(resolutionClock) && resolutionClock.remainingMs(now, cal) <= 0;
    if (breached || breachedRes) {
      if (slaStatus != SlaStatus.BREACHED) {
        slaStatus = SlaStatus.BREACHED;
        pending.add(new SlaBreached(id, now, breached ? "RESPONSE" : "RESOLUTION"));
      }
    } else if (slaStatus != SlaStatus.BREACHED) {
      boolean atRisk = ratio(responseClock, now, cal) >= 0.75 || ratio(resolutionClock, now, cal) >= 0.75;
      slaStatus = atRisk ? SlaStatus.AT_RISK : SlaStatus.ON_TRACK;
    }
  }

  /** Synchronizes the aggregate's optimistic-lock version with the JPA @Version column after flush. */
  public Incident withPersistedVersion(long persistedVersion) {
    this.version = persistedVersion;
    return this;
  }

  public void updateAffectedUsers(int n) {
    if (n < 1) throw new InvalidIncidentPayloadException("affectedUsers", "must be at least 1");
    this.affectedUsers = n;
  }

  public List<DomainEvent> pullEvents() {
    List<DomainEvent> copy = List.copyOf(pending);
    pending.clear();
    return copy;
  }

  public UUID id() { return id; }
  public String number() { return number; }
  public UUID reporterId() { return reporterId; }
  public UUID serviceId() { return serviceId; }
  public String title() { return title; }
  public String description() { return description; }
  public Instant createdAt() { return createdAt; }
  public IncidentState state() { return state; }
  public IncidentStatus status() { return state.status(); }
  public Set<CommandType> allowedCommands() { return state.allowedCommands(this); }
  public UUID categoryId() { return categoryId; }
  public int impact() { return impact; }
  public int urgency() { return urgency; }
  public Priority priority() { return priority; }
  public PriorityExplanation priorityExplanation() { return priorityExplanation; }
  public SlaSnapshot sla() { return sla; }
  public SlaClock responseClock() { return responseClock; }
  public SlaClock resolutionClock() { return resolutionClock; }
  public int clockGeneration() { return clockGeneration; }
  public SlaStatus slaStatus() { return slaStatus; }
  public UUID assigneeId() { return assigneeId; }
  public UUID teamId() { return teamId; }
  public UUID parentId() { return parentId; }
  public UUID commanderId() { return commanderId; }
  public int affectedUsers() { return affectedUsers; }
  public int reassignCount() { return reassignCount; }
  public int reopenCount() { return reopenCount; }
  public Resolution resolution() { return resolution; }
  public List<Resolution> archivedResolutions() { return List.copyOf(archivedResolutions); }
  public Integer rating() { return rating; }
  public String closureNote() { return closureNote; }
  public Instant respondedAt() { return respondedAt; }
  public Instant resolvedAt() { return resolvedAt; }
  public Instant closedAt() { return closedAt; }
  public boolean isMajor() { return major; }
  public long version() { return version; }
  public int pendingEventCount() { return pending.size(); }

  private void commit(TransitionResult r) {
    boolean changed = r.nextState() != state || !r.events().isEmpty();
    this.state = r.nextState();
    this.pending.addAll(r.events());
    if (changed) this.version++;
  }
  void applyClassification(UUID categoryId, Priority p, PriorityExplanation e, SlaSnapshot newSla, Instant now, WorkingTimeCalculator cal) {
    this.categoryId = categoryId;
    applyPriority(p, e, newSla, now, cal);
  }
  void applyPriority(Priority p, PriorityExplanation e, SlaSnapshot newSla, Instant now, WorkingTimeCalculator cal) {
    this.priority = p;
    this.priorityExplanation = e;
    this.sla = newSla;
    this.responseClock = responseClock.retarget(now, cal, newSla.responseTargetMs(), newSla.mode());
    this.resolutionClock = resolutionClock.retarget(now, cal, newSla.resolutionTargetMs(), newSla.mode());
    this.clockGeneration++;
    refreshSla(now, cal);
  }
  void setAssignee(UUID assignee, UUID team) { this.assigneeId = assignee; this.teamId = team; }
  void incrementReassignCount() { this.reassignCount++; }
  void linkToMaster(UUID masterId, Instant now, WorkingTimeCalculator cal) {
    this.parentId = masterId;
    this.assigneeId = null;
    this.teamId = null;
    this.responseClock = responseClock.pause(now, cal);
    this.resolutionClock = resolutionClock.pause(now, cal);
    this.clockGeneration++;
  }
  void unlinkFromMasterInternal(Instant now) {
    this.parentId = null;
    this.responseClock = responseClock.resume(now);
    this.resolutionClock = resolutionClock.resume(now);
    this.clockGeneration++;
  }
  void setMajor(UUID actor) {
    this.major = true;
    if (this.commanderId == null) this.commanderId = actor;
  }
  void setResolution(Resolution r) { this.resolution = r; }
  void setRating(Integer r) { this.rating = r; }
  void markClosed(String note, Instant now) {
    this.closureNote = note;
    this.closedAt = now;
  }

  /**
   * Fixes Audit Item B.1: Evaluates response breach BEFORE stopping the clock when a human
   * acknowledges late, ensuring a late acknowledgement never erases a response SLA breach.
   */
  void stopResponse(Instant now, WorkingTimeCalculator cal, boolean evaluateBreach) {
    if (evaluateBreach && running(responseClock) && responseClock.remainingMs(now, cal) <= 0 && slaStatus != SlaStatus.BREACHED) {
      this.slaStatus = SlaStatus.BREACHED;
      this.pending.add(new SlaBreached(id, now, "RESPONSE"));
    }
    this.responseClock = responseClock.stop(now, cal);
    if (evaluateBreach && this.respondedAt == null) {
      this.respondedAt = now;
    }
  }

  /**
   * Fixes Audit Item B.1: Evaluates resolution breach BEFORE stopping the clock when a human
   * resolves late, ensuring a late resolution never erases a resolution SLA breach.
   */
  void stopResolution(Instant now, WorkingTimeCalculator cal, boolean evaluateBreach) {
    if (evaluateBreach && running(resolutionClock) && resolutionClock.remainingMs(now, cal) <= 0 && slaStatus != SlaStatus.BREACHED) {
      this.slaStatus = SlaStatus.BREACHED;
      this.pending.add(new SlaBreached(id, now, "RESOLUTION"));
    }
    this.resolutionClock = resolutionClock.stop(now, cal);
    if (evaluateBreach) {
      this.resolvedAt = now;
    }
  }

  void pauseResolution(Instant now, WorkingTimeCalculator cal) {
    this.resolutionClock = resolutionClock.pause(now, cal);
    this.clockGeneration++;
  }
  void resumeResolution(Instant now) {
    this.resolutionClock = resolutionClock.resume(now);
    this.clockGeneration++;
  }

  void reopen(Instant now) {
    if (resolution != null) archivedResolutions.add(resolution);
    this.resolution = null;
    this.resolvedAt = null;
    this.rating = null;
    this.reopenCount++;
    this.parentId = null;
    this.resolutionClock = resolutionClock.reopen(now);
    long quarter = Math.max(60_000L, Math.round(sla.responseTargetMs() * 0.25));
    this.responseClock = SlaClock.start(now, quarter, sla.mode());
    this.clockGeneration++;
  }

  private static boolean running(SlaClock c) { return c.state() == ClockState.RUNNING; }
  private static double ratio(SlaClock c, Instant now, WorkingTimeCalculator cal) {
    if (!running(c) || c.targetMs() == 0) return 0.0;
    return (double) c.elapsedMs(now, cal) / c.targetMs();
  }
}
