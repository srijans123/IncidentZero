import edu.campus.iitsm.assignment.domain.HungarianBatchAssigner;
import edu.campus.iitsm.assignment.domain.HungarianBatchAssigner.*;
import edu.campus.iitsm.audit.domain.AuditHasher;
import edu.campus.iitsm.audit.domain.AuditHasher.*;
import edu.campus.iitsm.catalog.domain.BusinessCalendar;
import edu.campus.iitsm.incident.application.priority.*;
import edu.campus.iitsm.incident.domain.*;
import edu.campus.iitsm.incident.api.IncidentEvents.*;
import edu.campus.iitsm.shared.domain.DomainEvent;
import edu.campus.iitsm.shared.domain.Actors;
import edu.campus.iitsm.shared.domain.error.*;
import java.time.*;
import java.util.*;

public class Verify {
  static int pass = 0, fail = 0;
  static void check(String name, boolean ok, String detail) {
    if (ok) { pass++; System.out.println("PASS  " + name); }
    else { fail++; System.out.println("FAIL  " + name + "  :: " + detail); }
  }

  static final ZoneId IST = ZoneId.of("Asia/Kolkata");
  static final BusinessCalendar CAL = new BusinessCalendar(IST,
      EnumSet.range(DayOfWeek.MONDAY, DayOfWeek.FRIDAY), LocalTime.of(9, 0), LocalTime.of(18, 0), Set.of());
  static Instant ist(int y, int mo, int d, int h, int mi) {
    return ZonedDateTime.of(y, mo, d, h, mi, 0, 0, IST).toInstant();
  }
  static final UUID R = new UUID(9, 1), A = new UUID(9, 2), B = new UUID(9, 3), M = new UUID(9, 4), SYS = Actors.SYSTEM;
  static final UUID SERVICE = new UUID(8, 1), CAT = new UUID(8, 2), TEAM = new UUID(8, 3);
  static final Instant T0 = ist(2026, 10, 19, 10, 0);
  static final long MIN = 60_000L;
  static final Resolution RES = new Resolution("FIXED", "Restarted the LDAP connection pool and verified logins", "LDAP_POOL");
  static final PriorityExplanation EX = PriorityExplanation.empty();

  static SlaSnapshot sla(Priority p) {
    return switch (p) {
      case P1 -> new SlaSnapshot(new UUID(7, 1), "T1", 5 * MIN, 30 * MIN, ClockMode.CONTINUOUS_24X7);
      case P2 -> new SlaSnapshot(new UUID(7, 2), "T1", 15 * MIN, 120 * MIN, ClockMode.CONTINUOUS_24X7);
      case P3 -> new SlaSnapshot(new UUID(7, 3), "T1", 60 * MIN, 480 * MIN, ClockMode.BUSINESS_HOURS);
      case P4 -> new SlaSnapshot(new UUID(7, 4), "T1", 240 * MIN, 1440 * MIN, ClockMode.BUSINESS_HOURS);
    };
  }
  static Incident fresh(Priority p) { return Incident.create(UUID.randomUUID(), R, SERVICE, 2, 2, p, EX, sla(p), T0); }
  static Instant t(int minutes) { return T0.plusSeconds(minutes * 60L); }

  static Incident toState(IncidentStatus s, boolean child) {
    Incident i = fresh(Priority.P3);
    if (child) i.linkAsChild(M, t(0), CAL);
    switch (s) {
      case NEW -> {}
      case CLASSIFIED -> i.classify(CAT, Priority.P3, EX, sla(Priority.P3), SYS, t(1), CAL);
      case ASSIGNED -> toAssigned(i);
      case ACKNOWLEDGED -> { toAssigned(i); i.acknowledge(A, t(3), CAL); }
      case IN_PROGRESS -> toInProgress(i);
      case PENDING_USER -> { toInProgress(i); i.requestUserInfo(A, "Please attach the log", t(5), CAL); }
      case RESOLVED -> {
        if (child) { i.classify(CAT, Priority.P3, EX, sla(Priority.P3), SYS, t(1), CAL); i.resolveWithMaster(RES, t(6), CAL); }
        else { toInProgress(i); i.resolve(A, RES, t(6), CAL); }
      }
      case VERIFIED -> { Incident x = toState(IncidentStatus.RESOLVED, child); x.verify(R, 5, t(7)); return x; }
      case CLOSED -> { Incident x = toState(IncidentStatus.VERIFIED, child); x.close(SYS, "done", t(8)); return x; }
      case REOPENED -> { Incident x = toState(IncidentStatus.RESOLVED, child); x.rejectResolution(R, "still broken", t(7)); return x; }
      case CANCELLED -> i.cancel(R, "never mind", t(2), CAL);
    }
    return i;
  }
  static void toAssigned(Incident i) { i.classify(CAT, Priority.P3, EX, sla(Priority.P3), SYS, t(1), CAL); i.assign(A, TEAM, "HYBRID", SYS, t(2)); }
  static void toInProgress(Incident i) { toAssigned(i); i.acknowledge(A, t(3), CAL); i.startInvestigation(A, t(4), CAL); }

  static void apply(Incident i, CommandType c, Instant now) {
    UUID tech = i.assigneeId() != null ? i.assigneeId() : A;
    UUID nextTech = B.equals(i.assigneeId()) ? A : B;
    switch (c) {
      case CLASSIFY -> i.classify(CAT, Priority.P3, EX, sla(Priority.P3), SYS, now, CAL);
      case ASSIGN -> i.assign(A, TEAM, "HYBRID", SYS, now);
      case REASSIGN -> i.reassign(nextTech, TEAM, "load", SYS, now);
      case ACKNOWLEDGE -> i.acknowledge(tech, now, CAL);
      case START_INVESTIGATION -> i.startInvestigation(tech, now, CAL);
      case REQUEST_USER_INFO -> i.requestUserInfo(tech, "question", now, CAL);
      case PROVIDE_USER_INFO -> i.provideUserInfo(R, now);
      case RESOLVE -> i.resolve(tech, RES, now, CAL);
      case VERIFY -> i.verify(R, 5, now);
      case REJECT_RESOLUTION -> i.rejectResolution(R, "no", now);
      case CLOSE -> i.close(SYS, "ok", now);
      case RESOLVE_WITH_MASTER -> i.resolveWithMaster(RES, now, CAL);
      case LINK_AS_CHILD -> i.linkAsChild(M, now, CAL);
      case UNLINK_FROM_MASTER -> i.unlinkFromMaster("false positive", now);
      case DECLARE_MAJOR -> i.declareMajor(SYS, sla(Priority.P1), now, CAL);
      case REPRIORITIZE -> i.reprioritize(Priority.P2, EX, sla(Priority.P2), "more users", SYS, now, CAL);
      case CANCEL -> i.cancel(R, "x", now, CAL);
    }
  }
  static String outcome(Incident i, CommandType c, Instant now) {
    try { apply(i, c, now); return "OK"; }
    catch (InvalidStateTransitionException e) { return "ILLEGAL"; }
    catch (RuntimeException e) { return "OTHER:" + e.getClass().getSimpleName() + ":" + e.getMessage(); }
  }

  static Set<CommandType> E(CommandType... c) { return c.length == 0 ? EnumSet.noneOf(CommandType.class) : EnumSet.copyOf(Arrays.asList(c)); }
  static Set<CommandType> expected(IncidentStatus s, boolean child, boolean hasAssignee) {
    return switch (s) {
      case NEW -> child ? E(CommandType.CLASSIFY, CommandType.CANCEL, CommandType.UNLINK_FROM_MASTER, CommandType.RESOLVE_WITH_MASTER)
                        : E(CommandType.CLASSIFY, CommandType.CANCEL, CommandType.LINK_AS_CHILD);
      case CLASSIFIED -> child ? E(CommandType.CANCEL, CommandType.UNLINK_FROM_MASTER, CommandType.RESOLVE_WITH_MASTER)
                               : E(CommandType.ASSIGN, CommandType.CANCEL, CommandType.LINK_AS_CHILD, CommandType.DECLARE_MAJOR, CommandType.REPRIORITIZE);
      case ASSIGNED -> E(CommandType.ACKNOWLEDGE, CommandType.REASSIGN, CommandType.LINK_AS_CHILD, CommandType.CANCEL, CommandType.DECLARE_MAJOR, CommandType.REPRIORITIZE);
      case ACKNOWLEDGED -> E(CommandType.START_INVESTIGATION, CommandType.REASSIGN, CommandType.LINK_AS_CHILD, CommandType.CANCEL, CommandType.DECLARE_MAJOR, CommandType.REPRIORITIZE);
      case IN_PROGRESS -> E(CommandType.REQUEST_USER_INFO, CommandType.RESOLVE, CommandType.REASSIGN, CommandType.LINK_AS_CHILD, CommandType.CANCEL, CommandType.DECLARE_MAJOR, CommandType.REPRIORITIZE);
      case PENDING_USER -> E(CommandType.PROVIDE_USER_INFO, CommandType.CANCEL);
      case RESOLVED -> E(CommandType.VERIFY, CommandType.REJECT_RESOLUTION);
      case VERIFIED -> E(CommandType.CLOSE);
      case REOPENED -> hasAssignee ? E(CommandType.START_INVESTIGATION, CommandType.REASSIGN) : E(CommandType.REASSIGN);
      case CLOSED, CANCELLED -> E();
    };
  }

  static String snap(Incident i) {
    return i.status() + "|" + i.version() + "|" + i.assigneeId() + "|" + i.parentId() + "|" + i.priority() + "|" + i.reassignCount() + "|"
        + i.reopenCount() + "|" + i.responseClock() + "|" + i.resolutionClock() + "|" + i.pendingEventCount() + "|" + i.slaStatus() + "|" + i.isMajor() + "|" + i.resolution();
  }

  static String invariants(Incident i) {
    IncidentStatus s = i.status();
    if ((s == IncidentStatus.RESOLVED || s == IncidentStatus.VERIFIED || s == IncidentStatus.CLOSED) && i.resolution() == null) return "resolved without resolution";
    if (EnumSet.of(IncidentStatus.ASSIGNED, IncidentStatus.ACKNOWLEDGED, IncidentStatus.IN_PROGRESS, IncidentStatus.PENDING_USER).contains(s) && i.assigneeId() == null) return "active without assignee";
    if (i.parentId() != null && i.assigneeId() != null) return "child with its own technician";
    if (i.parentId() != null && !EnumSet.of(IncidentStatus.NEW, IncidentStatus.CLASSIFIED, IncidentStatus.RESOLVED, IncidentStatus.VERIFIED, IncidentStatus.CLOSED, IncidentStatus.CANCELLED).contains(s)) return "child in status " + s;
    ClockState rc = i.resolutionClock().state(), sc = i.responseClock().state();
    if (s == IncidentStatus.PENDING_USER && rc != ClockState.PAUSED) return "pending but resolution clock " + rc;
    if (EnumSet.of(IncidentStatus.RESOLVED, IncidentStatus.VERIFIED, IncidentStatus.CLOSED, IncidentStatus.CANCELLED).contains(s) && rc != ClockState.STOPPED) return s + " but resolution clock " + rc;
    if (i.parentId() != null && EnumSet.of(IncidentStatus.NEW, IncidentStatus.CLASSIFIED).contains(s) && (rc != ClockState.PAUSED || sc == ClockState.RUNNING)) return "linked child clock still running";
    if (i.parentId() == null && EnumSet.of(IncidentStatus.NEW, IncidentStatus.CLASSIFIED, IncidentStatus.ASSIGNED, IncidentStatus.ACKNOWLEDGED, IncidentStatus.IN_PROGRESS, IncidentStatus.REOPENED).contains(s) && rc != ClockState.RUNNING) return s + " root but resolution clock " + rc;
    if (EnumSet.of(IncidentStatus.ACKNOWLEDGED, IncidentStatus.IN_PROGRESS, IncidentStatus.PENDING_USER, IncidentStatus.RESOLVED, IncidentStatus.VERIFIED, IncidentStatus.CLOSED, IncidentStatus.CANCELLED).contains(s) && sc == ClockState.RUNNING) return s + " but response clock running";
    if (s.isTerminal() && !i.allowedCommands().isEmpty()) return "terminal state offers commands";
    return null;
  }

  public static void main(String[] args) throws Exception {
    // 1. Exhaustive State Matrix vs. allowedCommands vs. Behaviour
    int combos = 0, mismatchAllowed = 0, mismatchBehaviour = 0, others = 0, unchangedViolations = 0;
    List<String> notes = new ArrayList<>();
    for (IncidentStatus s : IncidentStatus.values()) {
      for (boolean child : new boolean[]{false, true}) {
        if (child && EnumSet.of(IncidentStatus.ASSIGNED, IncidentStatus.ACKNOWLEDGED, IncidentStatus.IN_PROGRESS, IncidentStatus.PENDING_USER, IncidentStatus.REOPENED).contains(s)) continue;
        Incident probe = toState(s, child);
        Set<CommandType> exp = expected(s, child, probe.assigneeId() != null);
        combos++;
        if (!probe.allowedCommands().equals(exp)) mismatchAllowed++;
        for (CommandType c : CommandType.values()) {
          Incident inc = toState(s, child);
          String before = snap(inc);
          String out = outcome(inc, c, t(30));
          boolean legal = out.equals("OK");
          if (out.startsWith("OTHER")) others++;
          else if (legal != exp.contains(c)) mismatchBehaviour++;
          if (!legal && !before.equals(snap(inc))) unchangedViolations++;
        }
      }
    }
    check("state machine: allowedCommands() equals the transition table (" + combos + " state/child combinations)", mismatchAllowed == 0, notes.toString());
    check("state machine: every command is legal exactly where the table says (" + combos * CommandType.values().length + " attempts)", mismatchBehaviour == 0 && others == 0, notes.toString());
    check("state machine: a rejected command never changes the aggregate", unchangedViolations == 0, notes.toString());

    // 2. Named Business-Rule Checks (TC-01, TC-06, TC-08, TC-09, P1 rootCause)
    Incident n1 = fresh(Priority.P3);
    try { n1.close(SYS, "x", t(1)); check("TC-01 close on NEW is rejected", false, ""); }
    catch (InvalidStateTransitionException e) { check("TC-01 close on NEW is rejected (409, ITSM-4090)", e.httpStatus() == 409 && e.code().equals("ITSM-4090"), ""); }
    Incident n2 = toState(IncidentStatus.ASSIGNED, false);
    try { n2.resolve(A, RES, t(10), CAL); check("TC-06 resolve from ASSIGNED is rejected", false, ""); }
    catch (InvalidStateTransitionException e) { check("TC-06 resolve from ASSIGNED is rejected", true, ""); }
    try { n2.acknowledge(B, t(10), CAL); check("TC-09 non-assignee cannot acknowledge", false, ""); }
    catch (UnauthorizedOperationException e) { check("TC-09 non-assignee cannot acknowledge (403)", e.httpStatus() == 403, ""); }
    Incident n3 = toState(IncidentStatus.IN_PROGRESS, false);
    try { n3.resolve(A, new Resolution("FIXED", "too short", null), t(10), CAL); check("TC-08 short resolution notes rejected", false, ""); }
    catch (InvalidIncidentPayloadException e) { check("TC-08 short resolution notes rejected (422)", e.httpStatus() == 422, ""); }
    Incident p1 = fresh(Priority.P1); p1.classify(CAT, Priority.P1, EX, sla(Priority.P1), SYS, t(1), CAL); p1.assign(A, TEAM, "H", SYS, t(2));
    p1.acknowledge(A, t(3), CAL); p1.startInvestigation(A, t(4), CAL);
    try { p1.resolve(A, new Resolution("FIXED", "Restarted the service and verified", null), t(10), CAL); check("P1 resolve needs root-cause category", false, ""); }
    catch (InvalidIncidentPayloadException e) { check("P1 resolve needs root-cause category", e.field().contains("rootCause"), ""); }

    // 3. Dual Clocks, Late-Acknowledgement Breach, Restore Snapshot & Child Unlink
    Incident c1 = fresh(Priority.P1);
    c1.classify(CAT, Priority.P1, EX, sla(Priority.P1), SYS, t(0), CAL); c1.assign(A, TEAM, "H", SYS, t(1));
    c1.acknowledge(A, t(3), CAL);
    check("clock: response clock stops at acknowledgement with 3m consumed", c1.responseClock().state() == ClockState.STOPPED && c1.responseClock().consumedMs() == 3 * MIN, "");
    c1.startInvestigation(A, t(4), CAL); c1.requestUserInfo(A, "logs please", t(10), CAL);
    check("TC-03 request-info pauses resolution clock with 10m consumed", c1.resolutionClock().state() == ClockState.PAUSED && c1.resolutionClock().consumedMs() == 10 * MIN, "");
    c1.provideUserInfo(R, t(40)); c1.resolve(A, RES, t(50), CAL);
    check("TC-04 30 paused minutes are not counted (20m consumed, 10m left)", c1.resolutionClock().consumedMs() == 20 * MIN && c1.resolutionClock().remainingMs(t(50), CAL) == 10 * MIN, "");
    c1.rejectResolution(R, "still failing", t(60));
    check("TC-05 reject: REOPENED, count 1, resolution clock resumes without reset", c1.status() == IncidentStatus.REOPENED && c1.reopenCount() == 1 && c1.resolutionClock().consumedMs() == 20 * MIN, "");
    check("TC-05 reject: new response target is 25% of 5m (75s)", c1.responseClock().targetMs() == 75_000L && c1.responseClock().state() == ClockState.RUNNING, "");
    Incident c2 = Incident.create(UUID.randomUUID(), R, SERVICE, 2, 2, Priority.P3, EX, sla(Priority.P3), ist(2026, 10, 16, 17, 0));
    check("TC-16 business clock: Fri 17:00 to Mon 10:00 is 2h elapsed", c2.resolutionClock().elapsedMs(ist(2026, 10, 19, 10, 0), CAL) == 120 * MIN, "");
    Incident c3 = fresh(Priority.P3); c3.classify(CAT, Priority.P3, EX, sla(Priority.P3), SYS, t(0), CAL); c3.assign(A, TEAM, "H", SYS, t(1));
    c3.declareMajor(SYS, sla(Priority.P1), t(2), CAL);
    check("major incident: P1, major flag, commander set, clocks retargeted keeping 2m elapsed", c3.priority() == Priority.P1 && c3.isMajor() && SYS.equals(c3.commanderId()) && c3.resolutionClock().remainingMs(t(2), CAL) == 28 * MIN, "");
    long ver = c3.version(); c3.declareMajor(SYS, sla(Priority.P1), t(3), CAL);
    check("declareMajor is idempotent", c3.version() == ver, "");
    Incident c4 = fresh(Priority.P1); c4.classify(CAT, Priority.P1, EX, sla(Priority.P1), SYS, t(0), CAL);
    c4.pullEvents(); c4.refreshSla(t(4), CAL);
    boolean atRisk = c4.slaStatus() == SlaStatus.AT_RISK;
    c4.reprioritize(Priority.P3, EX, sla(Priority.P3), "downgraded after triage", SYS, t(4), CAL);
    boolean resetToOnTrack = c4.slaStatus() == SlaStatus.ON_TRACK;
    c4.reprioritize(Priority.P1, EX, sla(Priority.P1), "restored P1", SYS, t(4), CAL);
    c4.refreshSla(t(6), CAL); c4.refreshSla(t(7), CAL);
    Incident lateAck = fresh(Priority.P1); lateAck.classify(CAT, Priority.P1, EX, sla(Priority.P1), SYS, t(0), CAL); lateAck.assign(A, TEAM, "H", SYS, t(1));
    lateAck.pullEvents(); lateAck.acknowledge(A, t(20), CAL);
    Incident restored = Incident.restore(lateAck.toSnapshot()).withPersistedVersion(lateAck.version());
    check("TC-21 SLA: AT_RISK at 80%, resets to ON_TRACK on SLA extension, BREACHED sticky on tick/late-ack, restore round-trips",
        atRisk && resetToOnTrack && c4.slaStatus() == SlaStatus.BREACHED
            && c4.pullEvents().stream().filter(e -> e instanceof SlaBreached).count() == 1
            && lateAck.slaStatus() == SlaStatus.BREACHED
            && lateAck.pullEvents().stream().anyMatch(e -> e instanceof SlaBreached)
            && snap(restored).equals(snap(lateAck)), "");

    Incident ch2 = toState(IncidentStatus.RESOLVED, true); ch2.rejectResolution(R, "does not work for me", t(8));
    ch2.reassign(B, TEAM, "take it", SYS, t(9));
    check("rejected child unlinks to REOPENED and can be reassigned", ch2.parentId() == null && ch2.status() == IncidentStatus.ASSIGNED && ch2.assigneeId().equals(B), "");

    // 4. Fuzzing: 50,000 Random & Guided Command Sequences (520,036 transitions)
    Random rnd = new Random(2026);
    CommandType[] CMDS = CommandType.values();
    UUID[] ACTORS = {R, A, B, SYS};
    int runs = 50_000, invariantFailures = 0, unexpected = 0, stickyFailures = 0, counterFailures = 0, totalTransitions = 0;
    Map<IncidentStatus, Integer> visited = new EnumMap<>(IncidentStatus.class);
    for (int run = 0; run < runs; run++) {
      Incident inc = fresh(Priority.values()[rnd.nextInt(4)]);
      if (rnd.nextInt(4) == 0) { try { inc.linkAsChild(M, t(0), CAL); } catch (RuntimeException ignored) {} }
      int reopens = 0, reassigns = 0; boolean breached = false, guided = (run & 1) == 1;
      Instant now = T0;
      for (int k = 0; k < 40; k++) {
        totalTransitions++;
        now = now.plusSeconds(1 + rnd.nextInt(1800));
        CommandType c = CMDS[rnd.nextInt(CMDS.length)];
        UUID actor = ACTORS[rnd.nextInt(ACTORS.length)];
        if (guided && rnd.nextInt(10) < 8) {
          List<CommandType> al = new ArrayList<>(inc.allowedCommands());
          if (!al.isEmpty()) {
            c = al.get(rnd.nextInt(al.size()));
            actor = switch (c) {
              case ACKNOWLEDGE, START_INVESTIGATION, REQUEST_USER_INFO, RESOLVE -> inc.assigneeId() != null ? inc.assigneeId() : A;
              case PROVIDE_USER_INFO, VERIFY, REJECT_RESOLUTION -> R;
              default -> SYS;
            };
          }
        }
        String before = snap(inc); long vBefore = inc.version(); UUID prevAssignee = inc.assigneeId();
        String result;
        try {
          apply(inc, c, now); result = "OK";
          if (inc.version() < vBefore) counterFailures++;
          if (c == CommandType.REJECT_RESOLUTION) reopens++;
          if (c == CommandType.REASSIGN && inc.assigneeId() != null && !inc.assigneeId().equals(prevAssignee)) reassigns++;
          if (inc.slaStatus() == SlaStatus.BREACHED) breached = true;
        } catch (InvalidStateTransitionException | UnauthorizedOperationException | InvalidIncidentPayloadException e) { result = "EXPECTED_ERR"; }
        catch (RuntimeException e) { result = "UNEXPECTED"; unexpected++; }
        if (!result.equals("OK") && !before.equals(snap(inc))) invariantFailures++;
        if (rnd.nextInt(3) == 0) {
          inc.refreshSla(now, CAL);
          if (breached && inc.slaStatus() != SlaStatus.BREACHED && !inc.status().isTerminal()) stickyFailures++;
          if (inc.slaStatus() == SlaStatus.BREACHED) breached = true;
        }
        if (invariants(inc) != null) invariantFailures++;
        visited.merge(inc.status(), 1, Integer::sum);
        if (inc.status().isTerminal()) break;
      }
      if (inc.reopenCount() != reopens || inc.reassignCount() < reassigns) counterFailures++;
    }
    check("fuzz: invariants hold across all 50,000 sequences (" + totalTransitions + " transitions)", invariantFailures == 0 && unexpected == 0 && stickyFailures == 0 && counterFailures == 0, "");
    check("fuzz: all 11 statuses visited (including deep states)", visited.size() == IncidentStatus.values().length && visited.get(IncidentStatus.PENDING_USER) >= 300, visited.toString());

    // 5. Priority, Canonical AuditHasher & Exact + Multi-Pass Hungarian Solver
    ItilMatrixPriorityStrategy itil = new ItilMatrixPriorityStrategy();
    ProductScorePriorityStrategy prod = new ProductScorePriorityStrategy();
    PriorityInput x = new PriorityInput(2, 3, "T2", 1, false, false, 0), y = new PriorityInput(1, 2, "T0", 1, false, false, 0);
    check("TC-14 product score collides (both P3) while ITIL matrix separates (P2 vs P4)",
        prod.calculate(x).priority() == Priority.P3 && prod.calculate(y).priority() == Priority.P3
            && itil.calculate(x).priority() == Priority.P2 && itil.calculate(y).priority() == Priority.P4, "");

    UUID incId = new UUID(0, 1), actId = new UUID(0, 2);
    List<AuditRowView> rows = new ArrayList<>(); String prev = AuditHasher.GENESIS_HASH;
    for (int i = 1; i <= 5; i++) {
      Instant ts = Instant.parse("2026-10-17T10:00:00.123456Z").plusSeconds(i);
      String h = AuditHasher.computeHash(prev, incId, i, ts, "USER", actId, "ACT" + i, "NEW", "CLASSIFIED", "s" + i,
          "{\"z\":{\"b\":1,\"a\":[2,{\"d\":4,\"c\":\"x:y,z\"}]},\"a\":true}");
      rows.add(new AuditRowView(100 + i, incId, i, ts, "USER", actId, "ACT" + i, "NEW", "CLASSIFIED", "s" + i,
          "{ \"a\" : true , \"z\" : { \"a\" : [ 2 , { \"c\" : \"x:y,z\" , \"d\" : 4 } ] , \"b\" : 1 } }", prev, h));
      prev = h;
    }
    String head = rows.get(4).hash();
    check("audit: valid chain verifies even when jsonb reorders keys", AuditHasher.verifyIncidentChain(rows, head, 5).valid(), "");
    List<AuditRowView> tam = new ArrayList<>(rows); AuditRowView r3 = rows.get(2);
    tam.set(2, new AuditRowView(r3.id(), r3.incidentId(), r3.chainIndex(), r3.ts(), r3.actorType(), r3.actorId(), r3.action(), r3.prevState(), r3.newState(), "TAMPERED", r3.canonicalPayloadJson(), r3.prevHash(), r3.hash()));
    check("TC-54 audit: edited row 103 is pinpointed", AuditHasher.verifyIncidentChain(tam, head, 5).firstCorruptedRowId() == 103L, "");

    Random hr = new Random(7);
    double[] weights = {0.5, 1.0, 2.0, 3.0}, caps = {2.0, 3.0, 4.0, 5.0, 8.0};
    int overbook = 0, p1Viol = 0;
    for (int tr = 0; tr < 5000; tr++) {
      int nt = 3 + hr.nextInt(4), ni = (tr < 2500) ? (2 + hr.nextInt(6)) : (8 + hr.nextInt(13));
      Map<UUID, Double> free = new LinkedHashMap<>(); List<UUID> techs = new ArrayList<>();
      for (int i = 0; i < nt; i++) { UUID id = new UUID(0, i + 1); techs.add(id); free.put(id, caps[hr.nextInt(caps.length)]); }
      List<TicketCandidate> tix = new ArrayList<>(); Map<UUID, Map<UUID, Double>> el = new HashMap<>(); Map<UUID, Double> w = new HashMap<>(); Map<UUID, Boolean> isP1 = new HashMap<>();
      for (int i = 0; i < ni; i++) {
        UUID id = new UUID(1, i + 1); double wt = weights[hr.nextInt(4)]; tix.add(new TicketCandidate(id, wt, wt == 3.0)); w.put(id, wt); isP1.put(id, wt == 3.0);
        Map<UUID, Double> sc = new HashMap<>(); for (UUID tq : techs) if (hr.nextInt(5) != 0) sc.put(tq, 0.4 + 0.6 * hr.nextDouble()); el.put(id, sc);
      }
      BatchResult res = HungarianBatchAssigner.matchBatch(tix, free, el);
      Map<UUID, Double> used = new HashMap<>(); Map<UUID, Integer> p1s = new HashMap<>();
      for (BatchMatch bm : res.matches()) {
        used.merge(bm.technicianId(), w.get(bm.incidentId()), Double::sum);
        if (isP1.get(bm.incidentId())) p1s.merge(bm.technicianId(), 1, Integer::sum);
      }
      for (var e : used.entrySet()) if (e.getValue() - free.get(e.getKey()) > 1e-9) overbook++;
      for (int c : p1s.values()) if (c > 1) p1Viol++;
    }
    check("TC-31 hungarian: exact (n <= 7) + multi-pass (n > 7) across 5,000 batches have 0 overbookings and <= 1 P1/tech", overbook == 0 && p1Viol == 0, "");

    System.out.println("\nSUMMARY: " + pass + " passed, " + fail + " failed (" + totalTransitions + " transitions verified)");
    if (fail > 0) System.exit(1);
  }
}
