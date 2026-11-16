# INCIDENT-ZERO — MASTER BUILD BRIEF (for the Antigravity agent)

Put this file at the repo root (the folder that contains `backend/`, `frontend/`, `video/`; on Srijan's machine it is called `OOP Proj`). Everything below is an instruction to you, the agent. Srijan is the human owner.

Analysis baseline: repo `https://github.com/srijans123/IncidentZero`, commit `bf7a2bc` ("Release v1.25"). Line numbers in this brief refer to that commit. If a line number no longer matches, find the code by the symbol name given next to it.

---

## 0. OPERATING RULES (read first, obey always)

1. **Two jobs, in this order.** (A) Make the product really work end to end. (B) Build a new ~18½-minute video from scratch that looks like a narrated screen recording of the GitHub repo, the code, and the live app. Job B shows only things that Job A proved working.
2. **Work in phases with gates.** Phases: `A` fix product → `B` truth sheet → `C` video → `D` hosted demo. Do not start a phase until the previous gate is green. After each numbered step, append one line to `video_v3/PROGRESS.md` (`<ISO time> | <step id> | DONE/FAILED | <one-line note>`). On restart, read that file and resume; never redo a DONE step.
3. **Never fake anything.** No invented terminal output, no mock data presented as live data, no narration claim without file-and-line evidence (see Phase B). If something cannot be made to work, remove it from the UI and from the video, and record it in the final report.
4. **Three-strike rule.** If a step fails, fix the cause and retry, at most 3 times. After the third failure write the exact error into `BLOCKERS.md`, skip to the next independent step, and report it at the end. Never loop.
5. **Repo invariants (from `AGENTS.md`, still binding).**
   - Do not edit, rename, or move anything under `backend/src/main/java/edu/campus/iitsm/**/domain/**`. Every fix in this brief is achievable in `api`, `application`, `infrastructure`, SQL migrations, tests, or the frontend. If you believe a domain change is unavoidable, stop and write it to `BLOCKERS.md`.
   - `..domain..` has zero Spring/JPA/Hibernate/Jackson imports. `AuditLedgerInTxListener` and `SlaTimerInTxListener` keep `@EventListener` + `@Transactional(propagation = Propagation.MANDATORY)`. No `Instant.now()` / `UUID.randomUUID()` in `domain` or `application`; inject `ClockPort` / `IdGeneratorPort`.
   - The "execute milestones M1–M6" section of `AGENTS.md` does not apply to this task. This brief replaces it.
6. **Do not delete** the old `video/` folder or anything in `video/08_out/`. Build the new video in `video_v3/`. You may copy scripts and components from `video/` and adapt them.
7. **Git.** Work on branch `fix/e2e-lifecycle`. Commit after every green step (`fix(A7): …`). Merge to `main` and push only at Gate A (section 3). If `git push` asks for credentials or fails, stop and ask Srijan. Never commit `.env`, audio, clips, frames, or rendered video; add them to `.gitignore`.
8. **Ask Srijan only for the items in section 9.** For everything else use the defaults written here.
9. **Machine facts.** Windows, PowerShell. Paths contain spaces: always quote them. GPU: NVIDIA RTX 4050 Laptop (about 6 GB VRAM): never run speech generation and Remotion rendering at the same time.

---

## 1. WHAT IS WRONG TODAY (so you understand the mission)

Found by reading the code at `bf7a2bc`. The backend could not be booted in the analysis sandbox, so every item below comes from static reading; confirm each one against the running app before you fix it (Step A0).

**Why the screenshot shows "Error creating incident. Check backend connection."**
- The page was opened on `https://srijans123.github.io/IncidentZero/app.html`. GitHub Pages hosts only the static frontend (`.github/workflows/deploy-pages.yml` builds `frontend/dist` and nothing else). `frontend/src/services/api.ts:3` hardcodes `API_BASE = '/api/v1'`, so every call goes to `https://srijans123.github.io/api/v1/...` and gets a 404. There is no backend on the internet at all.
- `frontend/src/pages/portal/PortalReport.tsx:156-160` swallows the real error and always shows that one `alert()`.
- Even with the backend running locally, the same submit fails in common cases: (1) the form sends `serviceId: advice.suggestedService`, a code such as `"APP-ERP"`, but `CreateIncidentRequest.serviceId` is a `UUID`, so JSON parsing fails and the generic handler returns a 500; (2) the domain requires title ≥ 5 and description ≥ 10 characters (`ValidateStep`, `Incident.createWithNumber`) and the form does not enforce or explain that (the screenshot has a 5-character description).

**Why almost nothing else works either: the frontend and backend disagree on the JSON contract.**

| Frontend expects | Backend actually sends | Effect |
|---|---|---|
| `incident.state` | `status` | Every state check is `undefined`: filters, status dots, "resolved" banner, lifecycle bar |
| `incident.allowedCommands` on list rows | not present in `IncidentSummaryDto` | `WorkbenchHome.tsx:65` and `:274` call `.includes` on `undefined` → the Workbench crashes as soon as one ticket exists |
| `'START_INVESTIGATION'`, `'REQUEST_USER_INFO'` | `"START"`, `"REQUEST_INFO"` (hand-written switch in `IncidentQueryAdapter.computeAllowedCommands`) | Start and Request-Info buttons never appear; a ticket cannot go past ACKNOWLEDGED from the UI |
| `isMajor`, `assigneeName`, `responseDueAt`, `resolutionDueAt`, real `serviceCode` | no `major` field; name hardcoded `"Assigned Technician"`; due dates `null`; service hardcoded `"APP-ERP"`, category `"SOFTWARE"` | Wrong data everywhere |
| timeline `action`, `ts`, `description` | `eventType`, `timestamp`, `summary` | Timeline rows render blank with a fake time `10:00:00` |
| advice `matchedKbs[]`, `potentialDuplicates[]`, `confidence`, `priorityRationale` | `kbArticles: string[]`, `duplicates[]`, nothing else | Copilot panel shows placeholder text |
| audit verify `totalRecordsChecked`, `tamperedRowId`, `message` | `totalRecordsVerified`, `firstCorruptedRowId`, `reason` | Verify result shows `undefined` |
| command `comment` | not implemented (`IllegalArgumentException` → 500) | "Post note" always fails |
| student "Verify & Close" sends `close` | RESOLVED only allows `VERIFY`/`REJECT_RESOLUTION`; `CLOSE` is technician/admin only | Students can never verify a fix |

**Features the old video narrated that the code does not do** (details and the full ban list are in Phase B): no SSE event is ever published for incident changes (only heartbeat and storm progress), nothing refreshes SLA status or fires SLA timers, resolving a master ticket does not resolve its children, the assignment adapter always picks one of two hardcoded technicians, priority explanations are saved as `"[]"`, every audit row is written with actor `SYSTEM` and payload `{}`, the storm simulator uses wrong service IDs, the Admin overview/topology/config/audit tables are hardcoded mock data, and login accepts the literal password `Bits@2026` before it looks at the Argon2 hash.

---

## 2. PHASE A — MAKE THE PRODUCT WORK

### A0. Bring up a local stack and record the baseline
1. Database for all development, tests and recording (never the main Neon database):
   - If `docker info` succeeds: `docker compose -f deploy/docker-compose.yml up -d db mailpit` (image `pgvector/pgvector:pg16`, port 5432, DB `iitsm`, owner `itsm_owner` / `itsm_owner_password`; migration V001 creates role `itsm_app`). `application.yml` defaults already point here, so start the backend **without** loading `.env`.
   - If Docker is not available: use the Neon server from `.env` but a separate database named `incidentzero_demo` (create it if missing) and override `DB_URL` for your processes only.
2. Create `scripts/demo-up.ps1` (starts DB if needed, starts backend on 8080 with the demo DB, starts Vite on 3000, waits until `POST /api/v1/auth/login` answers 200) and `scripts/demo-reset.ps1` (stops the backend, drops and recreates schema `public` as the owner role, restarts the backend so Flyway re-migrates and re-seeds). Note: `audit_record` has a trigger that rejects UPDATE/DELETE/TRUNCATE, so a reset must drop the schema; it cannot delete rows.
3. Baseline, saved to `video_v3/01_facts/baseline.txt`: output of `bash scripts/verify-m1.sh` (expected today: `SUMMARY: 24 passed, 0 failed (554590 transitions verified)`), `mvn -q test` in `backend/` with the demo DB, and `npm ci && npm run build` in `frontend/`. No fix may reduce the number of passing tests.
4. Reproduce each row of the table in section 1 against the running stack (curl or browser). Write what you observed to `video_v3/01_facts/repro.md`. If a row does not reproduce, note it and skip its fix.

### Priority 0 — the ticket lifecycle (all mandatory)

**A1. Configurable API origin.** `frontend/src/services/api.ts:3`, `frontend/src/context/SseContext.tsx:46`.
```ts
// api.ts
const ORIGIN = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, ''); // '' = same origin (Vite proxy)
export const API_BASE = `${ORIGIN}/api/v1`;
```
Use `API_BASE` for the `EventSource` URL too. Declare `VITE_API_BASE_URL` in `vite-env.d.ts`. Local dev keeps the Vite proxy (value empty).

**A2. One mapping layer between backend JSON and frontend types.** New file `frontend/src/services/mappers.ts`; call it inside `api.incidents.list/get/create/command`, `timeline`, `intake.getAdvice`, `admin.verifyAuditLedger`. No page may read raw backend JSON.
```ts
export function toIncident(r: any): Incident {
  return {
    id: r.id, number: r.number, title: r.title, description: r.description ?? '',
    state: r.status ?? r.state,
    priority: r.priority, impact: r.impact, urgency: r.urgency,
    category: r.categoryCode ?? r.category, serviceCode: r.serviceCode,
    reporterId: r.reporter?.id ?? r.reporterId, reporterName: r.reporter?.name,
    assigneeId: r.assignee?.id ?? r.assigneeId ?? undefined,
    assigneeName: r.assignee?.name ?? r.assigneeName ?? undefined,
    createdAt: r.createdAt, respondedAt: r.respondedAt, resolvedAt: r.resolvedAt, closedAt: r.closedAt,
    reopenCount: r.reopenCount ?? 0,
    masterIncidentId: r.parentId ?? undefined,
    isMajor: Boolean(r.major ?? r.isMajor), childCount: r.childCount ?? 0,
    slaStatus: r.slaStatus ?? 'ON_TRACK',
    responseDueAt: r.responseDueAt ?? undefined, resolutionDueAt: r.resolutionDueAt ?? undefined,
    allowedCommands: Array.isArray(r.allowedCommands) ? r.allowedCommands : [],
    priorityExplanation: r.priorityExplanation ?? [], sla: r.sla,
    resolution: r.resolution, rating: r.rating, version: r.version,
  };
}
export const toTimelineItem = (r: any) => ({
  id: r.id, action: r.eventType, actor: r.actorName, actorType: r.actorType,
  description: r.summary, payload: safeJson(r.payloadJson), hash: r.hash, ts: r.timestamp,
});
export const toAuditVerify = (r: any) => ({
  valid: r.valid, totalRecordsChecked: r.totalRecordsVerified,
  tamperedRowId: r.firstCorruptedRowId ? String(r.firstCorruptedRowId) : undefined, message: r.reason,
});
```
Extend `frontend/src/types/index.ts` to match. Write `toAdvice` and `toRca` after reading `intelligence/api/DuplicateCandidate.java` and `LlmRcaExplanationSchema.java` for the real field names.

**A3. Backend responses must carry real data.** Files: `incident/api/dto/IncidentDtos.java`, `incident/infrastructure/persistence/IncidentQueryAdapter.java`, `incident/api/IncidentQueryPort.java`.
- `IncidentSummaryDto` and `IncidentDetailResponse`: real `serviceCode` (join `it_service`), real `categoryCode` (left join `category`), real assignee name (left join `app_user`), `major` (`is_major`), `parentId`, `reporterId`/reporter name, `reopenCount`. Remove the constants `"APP-ERP"`, `"SOFTWARE"`, `"Assigned Technician"` (adapter lines ~89-95 and ~143-161).
- Detail only: `responseDueAt` / `resolutionDueAt` computed from the restored aggregate (`inc.responseClock().dueAt(now, calendar)` when that clock is RUNNING, else `null`; inject `ClockPort` and `WorkingTimeCalculator` into the adapter), `respondedAt`, `resolvedAt`, `closedAt`, `resolution {code, notes, rootCauseCategory}`, `rating`, `closureNote`, `childCount` (`SELECT count(*) FROM incident WHERE parent_id = ?`), `sla.policyTier` = the service's real tier (the entity currently restores `"T1"` for everything).
- **Delete `computeAllowedCommands`.** Allowed commands come from the domain: `Incident.restore(entity.toSnapshot()).allowedCommands()` mapped with `Enum::name`. This is the single source of truth and removes the START / REQUEST_INFO naming bug.
- List endpoint also returns `allowedCommands` per row (load the entities for the page of IDs with `jpaRepository.findAllById`).
- Add `GET /api/v1/incidents?parentId=<uuid>` filter (needed for the major-incident child list) and `GET /api/v1/incidents?mine=true` (reporter = caller for EMPLOYEE, assignee = caller for TECHNICIAN).

**A4. Show only commands the current user may run.** Add to `IncidentCommandService` a read-only method `permittedCommands(UUID incidentId, UUID actorId, String role, String supportTier)`: load the incident, keep each `CommandType` from `inc.allowedCommands()` for which `commandAuthorizer.authorize(...)` does not throw. `IncidentController.getIncident`, `createIncident`, `executeCommand` and the list endpoint replace `allowedCommands` in the response with this filtered list (add a small `withAllowedCommands(List<String>)` helper on the record). Result: a technician who is not the assignee no longer sees an Acknowledge button that would return 403.

**A5. Persist the priority explanation.** `incident/infrastructure/persistence/IncidentJpaEntity.java`: `fromSnapshot` (line ~199) and `updateFromSnapshot` write `"[]"`, and `toSnapshot` (line ~349) returns `PriorityExplanation.empty()`. Serialize `s.priorityExplanation().steps()` (fields `rule, before, after, reason`) to the `priority_explanation` jsonb column and parse it back in `toSnapshot`. Jackson is allowed here (infrastructure). Return it in `IncidentDetailResponse.priorityExplanation` (adapter line ~148 currently `List.of()`).

**A6. Create-incident contract.** `incident/infrastructure/web/IncidentController.java:61-88`, `PortalReport.tsx:138-163`.
- Backend: accept `serviceCode` (already a field of `CreateIncidentRequest`) or `serviceId`. Resolve the service row (id, code, tier) through a new `IncidentQueryPort.findService(...)` method (ArchUnit rule R4: controllers never touch repositories). Unknown code → `ServiceNotFoundException`. No service given → use the service proposed by `CategorizationPort.classify(title, description)` if it resolves, otherwise `APP-ERP`. Pass the service's **real tier** to `intakeService.createIncident` (today it always passes `"T1"`; the default UUID `…0001` is `NET-CORE`, a T0 service, which is not what the comment intends).
- New endpoint `GET /api/v1/services` (any authenticated user): `[{id, code, name, tier}]` for a dropdown.
- Frontend: send `serviceCode`, never `serviceId`. Add a "Affected service" dropdown filled from `/services`, preselected from the copilot suggestion. Validate before sending: title 5–200 characters, description 10–4000 characters, with inline error text and character counters. Delete the fabricated fallback advice in `PortalReport.tsx:96-129` (it invents a duplicate `INC-2026-000104` and a KB hit).

**A7. Honest error handling, no browser dialogs.**
- Backend `shared/infrastructure/web/GlobalProblemDetailsHandler.java`: add handlers so bad input is a 4xx with a problem body: `HttpMessageNotReadableException` and `MethodArgumentTypeMismatchException` → 400 `ITSM-4000`; `IllegalArgumentException` (unknown command) → 400 `ITSM-4000`. Add JSON 401/403 entry points in `SecurityConfig` so the frontend can read `detail`.
- Frontend: add `components/ui/Toast.tsx` and `components/ui/Modal.tsx` (pixel style, 0px corners) and replace **every** `alert(`, `prompt(`, `confirm(` (`PortalReport`, `PortalDetail`, `WorkbenchHome`, `WorkbenchDetail`, `WorkbenchMajor`, `AdminAudit`). Native dialogs block Playwright and do not appear in recordings.
- Every failure toast shows the server's `detail` and `code` from the problem body (`err.body`). `WorkbenchDetail.runCommand` (lines 92-103) must stop printing the hardcoded text `409 CONFLICT … State machine violation` for every error.

**A8. Command names in one place.** New `frontend/src/services/commands.ts`:
```ts
export const COMMAND_SLUG: Record<string, string> = {
  ACKNOWLEDGE: 'acknowledge', START_INVESTIGATION: 'start', REQUEST_USER_INFO: 'request-info',
  PROVIDE_USER_INFO: 'provide-info', RESOLVE: 'resolve', VERIFY: 'verify', REJECT_RESOLUTION: 'reject',
  CLOSE: 'close', CANCEL: 'cancel', DECLARE_MAJOR: 'declare-major', REASSIGN: 'reassign',
};
```
Buttons render from `incident.allowedCommands` (domain enum names) and call `api.incidents.command(id, COMMAND_SLUG[name], payload)`. Any allowed command without a button is simply not shown.

**A9. Student ticket page.** `frontend/src/pages/portal/PortalDetail.tsx`.
- "Verify & Close" → send `verify` with `{ rating }` (line 99 sends `close`). Rename the button "Confirm it is fixed". After success the page shows state VERIFIED and the text "Waiting for the service desk to close the ticket".
- "Not fixed" → modal with a required reason → `reject`.
- Show "Cancel my ticket" (modal, required reason) when `CANCEL` is allowed.
- Lifecycle bar: `LIFECYCLE_STEPS` contains `INVESTIGATING`, which is not a state, and the label says "6-Step" above 5 boxes. Use `NEW → CLASSIFIED → ASSIGNED → ACKNOWLEDGED → IN_PROGRESS → RESOLVED → VERIFIED → CLOSED` and show `PENDING_USER`, `REOPENED`, `CANCELLED` as a badge on the current step.
- Timeline uses the mapped fields from A2 (action, actor, description, time, hash).

**A10. Technician workbench.** `WorkbenchHome.tsx`, `WorkbenchDetail.tsx`.
- With A2 the crash at `WorkbenchHome.tsx:65/274` is gone; keep a guard anyway.
- Buttons: Acknowledge, Start investigation, Request user info (modal with the question), Resolve (modal; notes must be **≥ 20 characters**, the domain rule in `Resolution`; the UI check at `WorkbenchDetail.tsx:107` says 10), Close (when VERIFIED), Declare major, Cancel, Reassign.
- Reassign: add the backend command (`reassign` case in `IncidentController.executeCommand`, a `reassign` method in `IncidentCommandService` calling the existing domain `inc.reassign(newAssigneeId, teamId, reason, actor, now)`) and `GET /api/v1/technicians` (`[{id, name, supportTier, teamCode, loadPoints, capacity}]`). Modal: technician dropdown + required reason.
- The "comment" box (`WorkbenchDetail.tsx:118-134`) calls a command that does not exist. Remove the box in Priority 0. (Optional later: A21.)
- The "MY" queue filter compares `assigneeId` to the logged-in user id; it works once A2/A3 land. Make "MY" the default queue for technicians.

**A11. Sessions that cannot silently break.** `frontend/src/context/AuthContext.tsx`, `api.ts`.
- On app load, if a token exists, call `/me`; if it fails or the email differs from the selected user, log in again. On any 401, re-login once and retry the request.
- If login fails because the server is unreachable, do **not** continue as a "demo fallback session" (line 121-126). Show a persistent red banner "BACKEND OFFLINE — nothing you click will be saved" with a Retry button, and disable submit buttons.
- After login use the server's `/me` for role, support tier and team. The hardcoded `SEEDED_USERS` metadata is wrong (seed data: Vikram Rao is SENIOR in NET_INFRA, Priya Menon TEAM_LEAD in SYS_IDENT, Rohan Kulkarni SENIOR in CAMPUS_APPS, Ananya Iyer L1 in FAC_AV).
- `SseContext`: reconnect when the token changes, not only when the user object changes.

**A12. Small truth fixes in visible text.** `index.html` and `app.html` meta description say "10-state lifecycles" (the code has 11 state classes); `CampusStage.tsx:696` shows `POST /api/v1/tickets` (real route `/api/v1/incidents`); `SystemSpecs.tsx:160,175` shows `POST /api/v1/incidents/INC-142/actions/ack` (real route `/api/v1/incidents/{id}/commands/acknowledge`); `run_backend.bat` prints "Java 22" while `pom.xml` targets Java 21 and the README badge says Java 21. Make them all say what the code does.

### Priority 1 — needed so the demo is honest (do all; if one is blocked, drop its beat from the video)

**A13. Live updates.** Nothing publishes `incident.created` / `incident.updated`, although the frontend listens for them. Add a listener in `notification/infrastructure` with `@TransactionalEventListener(phase = AFTER_COMMIT)` on `DomainEvent` that calls `sseHub.broadcast("incident.created" | "incident.updated", {incidentId, eventType})`. Keep ArchUnit R3 (Modulith boundaries) and R9 green: read `ArchitectureTest.java` first.

**A14. Audit rows that say who did what.** `audit/infrastructure/AuditLedgerInTxListener.java:53-58` writes actor `SYSTEM`, the same value for `prev_state` and `new_state`, a generic description and payload `{}` for every event. Derive from the event: actor id and type (the event records carry `actor` / `reporter`; `Actors.SYSTEM` stays SYSTEM), a readable description ("Vikram Rao acknowledged the incident"), a payload with the event's own fields (question, reason, resolution code and notes, rating, strategy), and `prev_state` = the `new_state` of the previous audit row for that incident. Canonicalise the payload with `AuditHasher.canonicalizeJson` before hashing. `AuditLedgerTamperTest` and `POST /admin/audit/verify` must still pass. `provide-info`: the student's answer text is currently discarded; put it in the payload.

**A15. Admin endpoints need the admin role.** `SecurityConfig.java:33-38`: add `.requestMatchers("/api/v1/admin/**").hasRole("ADMINISTRATOR")` before the generic rule (the JWT filter grants `ROLE_<type>`). Today a student token can call `/admin/simulate/storm`. Frontend: hide the Admin tab, the demo-clock toggle and the storm button for non-admins (remove the "CAMPUS DEMO MODE … Admin Command clearance" banner in `App.tsx:119-128`). Make login rely on the Argon2id hash only: `IdentityQueryServiceAdapter.login` (line ~46) accepts the literal `"Bits@2026"` before checking the hash. Confirm with `AuthenticationTest` that the seeded hash matches `Bits@2026`; if not, regenerate the seed hash.

**A16. Real assignment.** `assignment/infrastructure/AssignmentPortAdapter.java:40-67` builds one fabricated candidate (Vikram, or Rohan for ERP/LMS). Load real candidates from `technician_profile`, `technician_load`, `technician_skill` (owner team of the service first, then every on-shift technician), pass the list to the strategy, and make the strategy selectable by property `app.assignment.strategy` (default `LEAST_LOADED`; the seven strategy classes already exist in `assignment/application/strategy/`). Return the real rationale in the detail response instead of the constant `Map.of("strategy","LEAST_LOADED")`. `StrategyAndAssignmentTest` stays green.

**A17. SLA status that actually moves.** No scheduler calls `Incident.refreshSla`, and nothing ever fires rows in `sla_timer`, so `sla_status` never changes after creation. Add `sla/infrastructure/SlaSweepScheduler` (`@Scheduled(fixedDelay = 5000)`, `@Transactional`): for each non-terminal incident, restore, `refreshSla(clockPort.now(), calendar)`, save and publish events when the SLA status changed. It must use `ClockPort`, so the existing demo clock (`POST /admin/demo-clock`, 30×) makes the SLA hearts drop on camera. Include `virtualNow` and `scaleFactor` in the heartbeat SSE payload and render a live countdown from `responseDueAt` / `resolutionDueAt` in both detail pages.

**A18. Storm simulation and major-incident cascade.**
- `AdminController.simulateStorm` lines 72-75 use wrong IDs: `…0001` is NET-CORE (not ERP), `…0003` is DB-PRIMARY (not LMS), `…0004` is NET-DNS (not the library). Resolve services by code: `AUTH-LDAP`, `APP-ERP`, `APP-LMS`, `APP-LIB`, with each service's real tier. Line 107 declares a major incident using a student's id with the role string `ADMINISTRATOR`; use the calling admin's principal.
- Resolving a master does not touch its children: the domain has `resolveWithMaster` and the repository has `findOpenChildrenByMasterId`, but no application code calls them. In `IncidentCommandService.resolve`, after the master is resolved, load open children and call `child.resolveWithMaster(resolution, now, calendar)`, then save and publish each. Add a test.
- `WorkbenchMajor.tsx`: show the real child list (`?parentId=`) and real count (line 104 reads a field that does not exist), with a confirmation modal.

**A19. Knowledge base and copilot.** `KnowledgeController.java:24` queries table `kb_article` and column `number`; the real table is `knowledge_article` with column `code`, so the endpoint always returns its hardcoded fallback. Fix the query and remove the fallback. `IntakeController.getAdvice` line 53 returns one hardcoded article string: return real matches from `knowledge_article` (full-text on `search_tsv`, top 3: `{id, code, title, snippet}`), and map them in `toAdvice`.

**A20. Admin pages show real data or are removed.**
- `AdminOverview.tsx`: all KPIs are literals ("1,428", "96.8%", "34.6%"). Add `GET /api/v1/admin/metrics` (counts by status, priority and SLA status, open majors, average minutes to resolve) and render those. Delete any KPI you cannot compute.
- `AdminTopology.tsx`: 15 invented nodes and 10 invented edges. Add `GET /api/v1/services/topology` returning the 19 seeded services and 26 edges from `service_dependency`, with a status derived from open incidents per service. Render that in the 2D view; keep the 3D view only if it reads the same data.
- `AdminAudit.tsx`: the table is a hardcoded array and "Simulate tamper" fakes a result in the browser. Add `GET /api/v1/admin/audit?incidentId=&limit=` (real rows: chain index, action, actor, states, hash, previous hash, time), show the real verify result, and delete the fake tamper button (the real tamper demo is done in a terminal, see Act 10).
- `AdminConfig.tsx`: sliders change local state only. Replace with a read-only view: the 16 SLA policies (`GET /api/v1/sla-policies`) and the active priority and assignment strategy names.
- `IncidentController.getAiPanel` and `getRca` (lines 163-197) return constants (`"KB-0001"`, fixed LDAP counts). Return the real priority explanation and assignment rationale; hide the "suggested resolution" and RCA panels in the workbench.

### Priority 2 — optional, only if time remains
**A21.** Comments: `POST /api/v1/incidents/{id}/comments` writing a `COMMENT_ADDED` audit row through the same hash-chain writer; bring the note box back. **A22.** Reprioritize command and UI. **A23.** If the `graphify` CLI is installed, run `graphify update .` once at the end (repo rule `.agents/rules/graphify.md`).

### Rule for the whole UI: no dead controls
When Phase A ends, click every button, tab and link in the app once. Each one either does what its label says against the real backend, or you delete it. Write the click-through result to `video_v3/01_facts/ui_audit.md`.

---

## 3. GATE A — proof that it works (all must pass before any video work)

1. `bash scripts/verify-m1.sh` unchanged result; `mvn -q test` green (ArchitectureTest R1–R9 included); `npm run build` green.
2. `scripts/e2e_lifecycle.mjs` (Node 20+, plain `fetch`, runs after `demo-reset`) and prints a PASS/FAIL table. Cases:
   - login as `emp@bits.campus`, a technician, `admin@bits.campus` (password `Bits@2026`); wrong password → 401.
   - create with a 4-character title → 422 with `code: ITSM-4220`; create with unknown `serviceCode` → 404; valid create → 201, state `ASSIGNED`, real `serviceCode`, an assignee id and name, non-null `responseDueAt`.
   - acknowledge as a technician who is not the assignee → 403; as the assignee → `ACKNOWLEDGED`, `respondedAt` set.
   - `start` → `IN_PROGRESS`; `request-info` → `PENDING_USER`; `provide-info` as the reporter → `IN_PROGRESS`; `resolve` with 10-character notes → 422; with valid notes → `RESOLVED`.
   - `verify` rating 5 as reporter → `VERIFIED`; `close` as technician → `CLOSED`; `close` again → 409 with `code: ITSM-4090`, `currentState`, `attemptedCommand`.
   - second ticket: resolve, `reject` → `REOPENED`. Third ticket: `cancel` by reporter → `CANCELLED`.
   - timeline of ticket 1: one row per transition, at least 3 distinct actors, each `prevHash` equals the previous row's `hash`.
   - `/admin/audit/verify` as admin → `valid: true`; the same call with the student token → 403.
   - as DB role `itsm_app`: `UPDATE audit_record SET description='x' WHERE id=1` → rejected.
   - storm (40 reports) → at least one master with children; resolve the master → every child `RESOLVED`.
   - SSE: after a command, a second logged-in client receives `incident.updated` within 3 seconds.
3. `frontend/e2e/lifecycle.spec.ts` (Playwright, already a devDependency): the same main lifecycle through the real UI with three users, zero console errors, zero native dialogs.
4. Merge `fix/e2e-lifecycle` into `main`, push, and record the pushed commit SHA in `video_v3/01_facts/PINNED_SHA.txt`. Every GitHub URL and every code card in the video uses this SHA.

---

## 4. PHASE B — TRUTH SHEET (what the narration may and may not say)

Create `video_v3/01_facts/truth_sheet.md`: one row per claim → `claim | value | evidence (file:line at PINNED_SHA or command output)`. The narration linter (C7) rejects any number or feature name that is not in this sheet.

**Verified at `bf7a2bc` (re-verify after Phase A, counts may change):** 11 lifecycle state classes (New, Classified, Assigned, Acknowledged, InProgress, PendingUser, Resolved, Verified, Reopened, Closed, Cancelled); 17 command types; 21 domain event records in `IncidentEvents.java`; 9 intake steps (orders 1–9: Validate, SanitizeRedact, CreateProvisionalIncident, DuplicateCheck, CategoryAndService, Enrich, PriorityAndSla, Assign, PersistAndPublish); 3 priority strategies; 7 assignment strategies; 15 typed exceptions with codes `ITSM-4010 … ITSM-5090`; ArchUnit rules R1–R9 in `ArchitectureTest.java` (R3 is the Spring Modulith verification test); pure-JDK harness `Verify.java`: 24 checks, 554,590 transitions, about 5 seconds; 14 Spring test classes; 15 ADRs in `docs/adr/`; seed data: 19 services, 26 dependency edges, 16 SLA policies (fastest 5 min response / 30 min resolution, slowest 480 min / 4320 min), 4 teams, 10 categories, 12 skills, 8 users (2 students, 4 technicians, 2 admins), 3 holidays; Java 21 target, Spring Boot 3.5.3, React 19, Vite 6; JWT validity 86,400 s; SSE stream ticket valid 30 s, single use; SSE heartbeat every 15 s; audit hash = SHA-256 chain starting from 64 zeros; DB trigger `audit_immutable` blocks UPDATE/DELETE/TRUNCATE on `audit_record`.

**Banned unless you implement it in Phase A and add evidence** (all were in the old narration, none is in the code): Tarjan / strongly-connected-components cycle check; automatic storm detection with five-minute sliding windows; automatic root-cause pinpointing; "forty-five tickets"; incident commander appointment and campus-wide broadcast; escalation ladder notifications; SLA warnings at 50/75/90 percent (only after A17, and only what A17 really does); "sub-millisecond" pgvector search (the HNSW index exists but no code ever writes an embedding, and the default mode is `fixture`); ONNX embeddings as the default path; SMS notifications; Decorator, Builder and Facade patterns; "eleven patterns"; "ninety-four percent coverage"; "reset script … 2.14 seconds"; Playwright viewport specs (before Gate A there were none); "bi-directional" Server-Sent Events; "military-grade"; "Java 22"; "over six thousand students"; "legally binding"; "microsecond accuracy"; "hundreds of client threads"; "nine technology report questions"; "520,036" (the harness prints 554,590).

**Design patterns you may name, because the code has them:** State (`IncidentState` + 11 classes), Strategy (`PriorityStrategy`, `AssignmentStrategy`), Template Method (`AbstractIntakeStep.execute` → `doExecute`), Adapter / Ports-and-Adapters (`JpaIncidentRepositoryAdapter` implements the domain port `IncidentRepository`; `ClockPort`), Observer (domain events → `@EventListener` listeners), Factory Method (`Incident.createWithNumber`, `Incident.restore`), Singleton (`AssignedState.INSTANCE` and the other states), Pipeline (`IntakePipeline`).

---

## 5. PHASE C — THE VIDEO

### C1. Format
- 1920×1080, 30 fps constant, H.264 yuv420p, AAC 48 kHz stereo, −16 LUFS.
- Length target **18:40**, allowed 17:30–19:30. Hard course limits: not under 15:00, not over 19:55. (A full 20:00 breaks the course limit.)
- Subtitles: external `.srt` only, nothing burned in.
- Output: `video_v3/08_out/76_OOP_S1_2025-2026_Project_v3.mp4` and `.srt`, plus `acts/act_00.mp4 … act_11.mp4` with their own `.srt` starting at `00:00:00,000`.

### C2. The look: one continuous narrated screen recording
The viewer must feel they are watching Srijan's screen while he talks. There are no slide-style "scenes".
- A browser window fills the frame the whole time. Draw the browser chrome yourself in Remotion: 88 px top bar (40 px tab strip + 48 px toolbar with a URL field), dark theme. Two tabs: `srijans123/IncidentZero · GitHub` and `Incident-Zero`. The URL field shows the real URL of the captured page at that moment (from the capture event log). Switching between GitHub and the app is an animated tab switch.
- Page area below the chrome is exactly 1920×992. Capture every page at viewport 1920×992 so nothing is scaled.
- A visible mouse cursor moves to things before they are clicked, with a short click ripple.
- Code explanations are **SVG code cards** that open over the dimmed, blurred GitHub page (it should feel like a file popped open), then close back to the same GitHub page.
- Overlay style (cards, arrows, popups, chips): the existing 16-bit arcade theme from the old video and the live app: 0px corners, 24×24 checker dither `#1E1646` / `#261C58`, ink outline `#0B071E`, hard shadow `6px 6px 0`, accent yellow `#FFD84D`, red `#FF4D3D`, green `#43D17A`, cyan `#59C9F5`. Code font JetBrains Mono, label font Silkscreen. Load fonts from local files and block rendering (`delayRender`) until they are ready.
- A small chapter chip sits inside the browser toolbar on the right (`3 · DOMAIN CORE`). No lower third, nothing covering the page.

### C3. Folder layout
```
video_v3/
  01_facts/      truth_sheet.md, PINNED_SHA.txt, baseline.txt, repro.md, ui_audit.md
  02_script/     storyboard.json (the single source of truth), narration_script.md (human-readable)
  03_audio/      beats/<beatId>.wav, timings.json, pronunciation.json, tts_cache.json
  04_capture/    lib/recorder.mjs, lib/cursor.mjs, capture_github.mjs, capture_app.mjs, clips/<sceneId>.mp4 + .events.json
  05_cards/      <cardId>.svg, cards.json (packed), make_cards.mjs, verify_cards.mjs
  06_terminal/   <id>.json (real captured command output)
  07_remotion/   React project
  08_out/        master, acts/, contact_sheet/, qa_report.json, REVIEW.md
  PROGRESS.md
```

### C4. The beat model (this is what keeps voice and picture in sync)
Everything is a list of **beats**. One beat = one or two spoken sentences + one visual action. Audio is generated first; picture is then made to fit the audio, never the other way round.

`storyboard.json`:
```json
{ "acts": [ { "id": "act03", "title": "Domain core", "scenes": [
  { "id": "a03s02", "type": "code",
    "file": "backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java",
    "beats": [
      { "id": "a03s02b01", "say": "This is the Incident class. [confirmation-en] It is the heart of the whole project.",
        "card": { "symbol": "createWithNumber", "maxLines": 24 }, "highlight": [], "note": "Factory method" },
      { "id": "a03s02b02", "say": "Here the title must be between five and two hundred characters, otherwise it throws.",
        "highlight": ["cleanTitle.length() < 5"], "note": "Rules live inside the object" }
    ] } ] } ] }
```
Scene types and what a beat's action may be:

| type | picture | beat actions |
|---|---|---|
| `github` | real github.com pages | `goto`, `click` (folder or file), `scroll`, `hoverRow`, `hold` |
| `code` | SVG code card over the last GitHub frame | `card` (which lines), `highlight` (which lines glow), `note` (short margin label) |
| `app` | the real app at `http://localhost:3000/app.html` | `click`, `type`, `select`, `switchUser`, `waitFor`, `hold` |
| `trace` | frozen app frame + popup snippets + arrows | `hop` (next snippet in the chain) |
| `terminal` | CRT terminal card | `run` (command + its real captured output) |
| `title` | 3–4 s chapter card | text only |

Timing rule used by every capture script and by Remotion: start the beat's action at the beat start; the beat lasts `max(audioDuration + 0.35 s, actionDuration)`; the next beat starts after that. Scene duration is the sum of its beats; add 0.5 s after a scene and 0.8 s after an act.

### C5. Narration: how it must sound
- First person, Srijan talking to his evaluator and classmates. Plain words, short sentences (22 words maximum, one idea each). Around 150 words per minute. Total 2,500–2,700 words.
- The pattern for code is: say what the file is for → point at a method → "this method does X" → "when Y happens, it does Z" → "so …" the consequence. Never read code aloud line by line. Never say a symbol the viewer cannot see on screen at that moment.
- Bridge phrases that make it feel recorded live: "Let me go back to the repo." "I'll open this folder." "Now watch what happens when I click this." "This is the line I showed you a minute ago."
- Banned words: military-grade, enterprise-grade, cutting-edge, seamlessly, robust, leverage, state-of-the-art, catastrophic, paralysis, meticulously, rock-solid.
- Every factual statement must be in the truth sheet.
- Two text forms per beat: `say` (display text, used for subtitles) and a spoken form made by applying `03_audio/pronunciation.json` before synthesis. Seed that map with: `SLA → S L A`, `JPA → J P A`, `JWT → J W T`, `SSE → S S E`, `DAG → dag`, `ArchUnit → Arch Unit`, `SHA-256 → shah two fifty six`, `P1 → P one`, `BITS → Bits`, `api.ts → A P I dot T S`, `.tsx → dot T S X`, and CamelCase identifiers split into words (`IncidentCommandService → Incident Command Service`). Add entries whenever the speech check (C6) hears something wrong.

**Emotion tags.** The voice engine (OmniVoice) understands exactly these tags and nothing else: `[laughter] [sigh] [confirmation-en] [question-en] [question-ah] [question-oh] [question-ei] [question-yi] [surprise-ah] [surprise-oh] [surprise-wa] [surprise-yo] [dissatisfaction-hnn]`. `[breath]` is **not** supported and would be read aloud as a word: never use it.
- Budget: 12 to 18 tags in the whole video, at most one per sentence, never two beats in a row, none inside or next to a code identifier.
- Keep normal spacing and punctuation around a tag: `…the old helpdesk just lost tickets. [sigh] So we built this.`
- Where they fit: `[sigh]` when describing the pain of the old way or a long error; `[laughter]` after a light self-aware remark (the arcade UI, a silly test title); `[question-en]` right after a rhetorical question ("So what stops a technician from closing someone else's ticket?"); `[confirmation-en]` when something works on screen ("…and it is assigned."); `[surprise-oh]` at a reveal (the 409 error appearing, the tamper being caught); `[dissatisfaction-hnn]` when showing what an illegal move would have done.
- Subtitles never contain tags: strip them from the `.srt`.

### C6. Voice: VoiceStudio, Srijan's cloned voice, no manual steps
Target: every beat spoken by the saved profile **"Srijan Voice"** in the VoiceStudio app installed at `D:\Apps\Voice Studio\VoiceStudio`. Reference recording: `D:\Projects\voice sample.m4a`. The engine must be OmniVoice (the tags above only work there).

Do this in order and stop at the first route that works:

**Route 1: VoiceStudio's local HTTP API (preferred).** The desktop app runs a local backend on `http://127.0.0.1:3900`.
1. `GET http://127.0.0.1:3900/health`. If the connection is refused, start the app (`Get-ChildItem "D:\Apps\Voice Studio\VoiceStudio" -Filter *.exe`, then `Start-Process` the main executable) and poll `/health` for up to 180 s (it returns 503 while models load).
2. Discover the API instead of guessing: try `GET /openapi.json` and `GET /docs`. Save what you find to `03_audio/voicestudio_api.md`.
3. `GET /profiles` → find the entry whose name is `Srijan Voice` → keep its id.
4. Generate: `POST /v1/audio/speech` with JSON `{"model":"omnivoice","voice":"<profile id>","input":"<spoken text with tags>","response_format":"wav"}` → WAV (24 kHz mono). Calls from the same machine normally need no key; if you get 401, look for `OMNIVOICE_API_KEY` in the app's settings or environment and send it as `Authorization: Bearer …`.
5. If the OpenAPI document shows extra parameters (speed, seed, quality "Standard"/"Faster", emotion), use: quality Standard, a fixed seed for all beats, speed 1.0.
6. If VoiceStudio's MCP server is already connected in Antigravity you may use it instead of HTTP. Do not spend time setting it up.

**Route 2: OmniVoice Python library directly** (only if Route 1 cannot select the saved profile). Convert the sample once (`ffmpeg -i "D:\Projects\voice sample.m4a" -ar 24000 -ac 1 ref.wav`), transcribe it with faster-whisper to get the reference text, then use the `omnivoice` package (`OmniVoice.from_pretrained("k2-fsa/OmniVoice", …)`, `model.generate(text=…, ref_audio="ref.wav", ref_text="…")`, 24 kHz output). Read the package README before coding; do not trust this line blindly.

**Route 3:** stop and ask Srijan. Do not fall back to the old Qwen "Ryan" voice without his approval.

**Batch generation rules** (`video_v3/generate_voice.py`):
- One request per beat. Split any beat longer than 240 characters at a sentence boundary and join the parts with 120 ms of silence.
- Resumable cache keyed by SHA-256 of (spoken text + profile id + settings) in `tts_cache.json`. Never regenerate a cached beat.
- Time the first three beats and write the estimate for the whole script to `PROGRESS.md`. The UI screenshot shows a 39-character line still generating after 22 s, so the full script may take hours: run it as a background job, keep working on capture code meanwhile, but do not start Remotion rendering until speech generation has finished.
- Quality loop per beat, up to 5 takes: transcribe with faster-whisper, compare with the spoken text after removing tags; accept only if word error rate ≤ 12 %, the transcript contains none of the tag words spoken literally ("laughter", "sigh", "confirmation", "surprise", "dissatisfaction", "bracket"), duration is between 0.6× and 1.6× of `words / 2.5` seconds, and there is no silence gap longer than 1.2 s inside the take. If a beat fails 5 times, remove its tag and try 3 more times; if it still fails, log it in `BLOCKERS.md`.
- Post-process each accepted take: trim leading and trailing silence to 80 ms, resample to 48 kHz, loudness-normalise to −16 LUFS (two-pass `loudnorm`), 100 ms fade-out, then append 200 ms of silence.
- Write `03_audio/timings.json`: per beat `{file, duration, words:[{w,start,end}]}` from faster-whisper word alignment.
- Voice consistency check: the acts must not drift in level or tone. After all beats exist, compute integrated loudness per act; all acts within ±1 LU.

### C7. Script lint (run before any speech is generated)
`video_v3/lint_script.py` fails the build when: a sentence has more than 22 words; a banned word or banned claim (Phase B) appears; a number is not in the truth sheet; a tag is not in the allowed list, or `[breath]` appears; the tag budget or spacing rules are broken; a `code` beat names a symbol that is not inside that beat's card lines; total words are outside 2,500–2,700; a team member name is not exactly as in `02_script/team.json`.

### C8. Capturing GitHub (`04_capture/capture_github.mjs`)
- Playwright Chromium, viewport 1920×992, `deviceScaleFactor: 1`, `colorScheme: 'dark'`, `reducedMotion: 'no-preference'`, not logged in. All URLs use `PINNED_SHA` (`https://github.com/srijans123/IncidentZero/tree/<sha>/…`, `…/blob/<sha>/<path>#L<start>-L<end>`), except the very first shot, which is the plain repo home page.
- Navigate by **clicking** like a person: repo home → click `backend` → click through to `src/main/java/edu/campus/iitsm` → click a module folder → click a file. When a file opens, scroll so the method being discussed is in view and select its line range (the `#Lx-Ly` highlight) just before the code card opens.
- Find selectors by inspecting the live page with Playwright at capture time (prefer role and text locators). Do not hardcode selectors from memory. If GitHub shows a sign-up banner or cookie bar, hide it with injected CSS.
- Wait for network idle and web fonts before each recording starts. No white flash at clip start.
- Before a `code` scene, save a PNG of the current GitHub frame: the code card is drawn over a blurred copy of it.
- Be gentle: one page load at a time, 400 ms between navigations.

**Recorder (use this, not Playwright's built-in `recordVideo`, which is too low in bitrate for text):**
```js
// 04_capture/lib/recorder.mjs
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
export async function startRecorder(page, outBase) {
  const dir = outBase + '_frames'; fs.mkdirSync(dir, { recursive: true });
  const cdp = await page.context().newCDPSession(page);
  const frames = []; const events = []; let n = 0;
  cdp.on('Page.screencastFrame', async (f) => {
    const file = path.join(dir, `f_${String(n++).padStart(6, '0')}.jpg`);
    fs.writeFileSync(file, Buffer.from(f.data, 'base64'));
    frames.push({ file, t: f.metadata.timestamp });            // seconds since epoch
    await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1920, maxHeight: 992, everyNthFrame: 1 });
  const t0 = Date.now() / 1000;
  return {
    mark(type, data = {}) { events.push({ t: Date.now() / 1000 - t0, type, url: page.url(), ...data }); },
    async stop() {
      const tEnd = Date.now() / 1000; await cdp.send('Page.stopScreencast');
      const lines = ['ffconcat version 1.0'];
      frames.forEach((fr, i) => {
        const next = i + 1 < frames.length ? frames[i + 1].t : tEnd;
        lines.push(`file '${fr.file.replace(/\\/g, '/')}'`, `duration ${Math.max(0.001, next - fr.t).toFixed(4)}`);
      });
      if (frames.length) lines.push(`file '${frames.at(-1).file.replace(/\\/g, '/')}'`);
      fs.writeFileSync(outBase + '.ffconcat', lines.join('\n'));
      execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', outBase + '.ffconcat',
        '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-crf', '14', '-preset', 'slow', outBase + '.mp4']);
      fs.writeFileSync(outBase + '.events.json', JSON.stringify({ t0, duration: tEnd - t0, events }, null, 2));
    },
  };
}
```
The screencast only sends a frame when the page changes; the `duration` lines make still moments last the right time. If the first frame arrives late, pad the start so clip time 0 equals `t0`.

**Cursor (`04_capture/lib/cursor.mjs`):** inject with `page.addInitScript` a fixed, `pointer-events:none`, top-most arrow cursor element that follows `mousemove` and plays a 300 ms ring on `mousedown`. Helper `clickLike(page, locator, rec, label)`: get the bounding box, `page.mouse.move(cx, cy, { steps: 28 })`, wait 180 ms, `rec.mark('click', { label, box })`, click, wait for the result. `rec.mark` must record the element's box (`x, y, width, height` in viewport pixels): the trace overlays draw arrows from it.

### C9. Capturing the app (`04_capture/capture_app.mjs`)
- Run `scripts/demo-reset.ps1` before each full capture pass so ticket numbers and data are identical every time.
- Open `http://localhost:3000/app.html?tab=portal`. Same viewport, recorder and cursor as C8. Mute the app's sound (`Audio On` toggle) at the start.
- Type like a person (40–70 ms per character). Use this ticket text: title `Cannot open Moodle quiz, login keeps timing out`, description `Since 9 am the LMS login page loads forever and then shows a gateway timeout. Tried two browsers on hostel Wi-Fi.`, urgency High.
- Switch users on camera through the header user menu. Never hardcode the technician: after creating the ticket, read the assignee from the API and switch to that user.
- For every click that a `trace` scene will explain, the `rec.mark('click', …)` label must match the trace id (C11).
- Fail the capture if the page logs a console error, a request returns 5xx, or a native dialog appears.

### C10. Code cards (`05_cards/make_cards.mjs`)
- Input: a file path, and either a symbol name or a line range. Read the file **from git at `PINNED_SHA`** (`git show <sha>:<path>`), never from memory.
- Output: one SVG per card, 1720 px wide. Header bar: file name large, full repo path small, `L<start>–L<end>`, language chip. Gutter with the real line numbers. Syntax colours from Shiki (dark theme tuned to the palette). At most 26 lines and 96 columns per card; wrap longer lines with `↳`; if a method is longer, make several cards and move between them.
- Highlights are separate layers keyed by line number so Remotion can turn them on per beat (a soft yellow band behind the line and a small arrow in the gutter).
- Margin notes: 1 to 4 per card, at most 6 words each, pinned to a line, shown when their beat starts.
- Escape all text for XML. Pack all cards into `05_cards/cards.json` and mount them inline in Remotion (not through `<img>`): headless Chromium snapshotted before `<img>` SVGs decoded in the old pipeline and produced black frames.
- `verify_cards.mjs` (a gate): for every card, the text of every line equals the same line of the file at `PINNED_SHA`. Any difference fails the build.

### C11. Trace overlays ("like I showed you in the code")
Used in the live demo. When the cursor clicks a button, the app clip **freezes on the frame right after the click**, a pulsing ring marks the button (box from the event log), and snippet popups appear with arrows:

button → snippet 1 (frontend handler, the calling line highlighted) → snippet 2 (the next file, the receiving line highlighted) → …

- Each popup: file name header, 7–11 real lines from `PINNED_SHA` (same generator as C10), one highlighted line.
- At most two popups visible at once. When hop 3 appears, hop 1 slides out. A breadcrumb row at the bottom shows the whole chain with the current hop lit, e.g. `PortalReport.tsx › api.ts › IncidentController › IntakeService › IntakePipeline › Incident`.
- Arrows are thick pixel-style elbows with an arrowhead that land exactly on the highlighted line. One hop per beat.
- When the chain ends, the popups close and the clip continues from the frozen frame, showing the result of the click.

Trace definitions (resolve every line by symbol at `PINNED_SHA`; after Phase A some names will have moved, so follow the real call path, not this list blindly):

| id | click | chain |
|---|---|---|
| `T1-submit` | Submit Incident | `PortalReport.tsx` `handleSubmit` → `api.ts` `incidents.create` → `IncidentController.createIncident` → `IntakeService.createIncident` → `IntakePipeline.process` (the loop over steps) → `Incident.createWithNumber` → `PersistAndPublishStep.doExecute` → `AuditLedgerInTxListener.onDomainEvent` |
| `T2-ack` | Acknowledge | `WorkbenchDetail.tsx` `runCommand` → `api.ts` `incidents.command` → `IncidentController.executeCommand` (`case "acknowledge"`) → `IncidentCommandService.acknowledge` → `CommandAuthorizer.authorize` → `AssignedState.acknowledge` → `Incident.stopResponse` |
| `T3-pause` | Request user info | `executeCommand` (`case "request-info"`) → `IncidentCommandService.requestUserInfo` → `InProgressState.requestUserInfo` → `Incident.pauseResolution` → `SlaClock.pause` |
| `T4-verify` | Confirm it is fixed | `PortalDetail.tsx` `handleVerifyResolution` → `executeCommand` (`case "verify"`) → `ResolvedState.verify` (reporter check, rating 1–5) |
| `T5-ledger` | Verify ledger | `AdminAudit.tsx` `handleVerifyLedger` → `AdminController.verifyAuditLedger` → `AuditVerificationAdapter.verifyAllLedgers` → `AuditHasher.verifyIncidentChain` |

Keep T1 and T2 at full length; T3–T5 use at most 3 hops each.

### C12. Terminal cards (`06_terminal/`)
Run the real command, capture stdout and stderr and the exit code to JSON, and replay it as typed text in a CRT-style card. Trim long output in the middle with a visible `… 18 lines …` marker; never edit the text. Commands used: `bash scripts/verify-m1.sh`; `mvn -q test -Dtest=ArchitectureTest`; the illegal-transition `curl` (close an already closed ticket → 409 problem JSON); the tamper attempt in `psql` as `itsm_app` (`UPDATE audit_record …` → error).

### C13. Storyboard: acts, files, and what to say about each
Write `storyboard.json` from this table. Durations are targets; the audio decides the real length. Before writing any beat, open the file at `PINNED_SHA` and confirm each talking point; drop a point that is no longer true. Only "major" files get code cards; other files are only pointed at in the GitHub listing.

| # | Act | Target | Picture |
|---|---|---|---|
| 0 | Hook | 0:40 | app → GitHub |
| 1 | The repo and its folders | 1:25 | github |
| 2 | Backend modules and the layer rule | 1:10 | github + 1 card |
| 3 | Domain core: `Incident` and the State pattern | 2:30 | github ↔ cards |
| 4 | Domain core: SLA clock, calendar, virtual clock | 1:15 | github ↔ cards |
| 5 | Application: the intake pipeline and priority | 1:40 | github ↔ cards |
| 6 | Application: commands, permissions, assignment | 1:35 | github ↔ cards |
| 7 | Infrastructure: REST, database, audit chain, security | 2:15 | github ↔ cards |
| 8 | Frontend | 1:05 | github ↔ cards |
| 9 | Live demo with code traces | 3:30 | app + traces |
| 10 | Proof | 1:10 | app + terminal |
| 11 | Team and close | 0:25 | title card + GitHub |

**Act 0 · Hook.** Open on the live app: the student portal, a ticket being submitted and appearing as ASSIGNED in a few seconds. Say what the project is in two sentences (a campus IT service desk for BITS Pilani Hyderabad: students report a problem, the system classifies, prioritises and assigns it, technicians work it, and every step is recorded). Say what the video will do: walk through the repo, open the important files, then run the app and connect each click back to the code. Switch to the GitHub tab.

**Act 1 · The repo and its folders.** Repo home at `github.com/srijans123/IncidentZero`. Scroll the README header briefly. Point at folders in the listing, one sentence each: `backend/` (Java, Spring Boot, one modular application), `frontend/` (React and TypeScript), `docs/adr/` (15 decision records explaining why choices were made), `scripts/` (verification scripts `verify-m1.sh` to `verify-m6.sh`), `deploy/` (Docker Compose, Dockerfiles, nginx), `.github/workflows/` (CI and the Pages deploy). Do not explain tooling folders (`.agent`, `.agents`, `graphify-out`, `tools`, `upload`).

**Act 2 · Backend modules and the layer rule.** Click `backend` → `src/main/java/edu/campus/iitsm`. Hover the module folders: `incident`, `assignment`, `sla`, `audit`, `identity`, `notification`, `intelligence`, `catalog`, `knowledge`, `shared`. Open `incident/`: it has `api`, `application`, `domain`, `infrastructure`. Explain the rule in simple words: `domain` is plain Java with the business rules; `application` runs use cases; `infrastructure` is everything that touches Spring, the database or HTTP; outer layers may depend on inner ones, never the reverse. One card: `backend/src/test/java/edu/campus/iitsm/ArchitectureTest.java`, rule `R1_domain_has_zero_framework_imports`: "this test fails the build if anyone breaks the rule".

**Act 3 · Domain core.**
- `incident/domain/Incident.java` (3 cards). Card 1, `createWithNumber`: the only way to create an incident; it checks title 5–200 characters, description 10–4000, impact and urgency 1–3, then records an `IncidentCreated` event. Fields are private and the constructor is private: encapsulation. Card 2, the command methods (`acknowledge`, `resolve`, `verify`, …): each is one line that hands the work to the current state object and passes the result to `commit`. Card 3, `commit` and `pullEvents`: `commit` switches to the next state, stores the events, and raises the version; `pullEvents` hands the events to the application layer.
- `incident/domain/IncidentState.java` (1 card): a sealed interface that permits exactly 11 state classes. Every command has a default body that throws an illegal-transition error. "So a state only overrides the moves that are legal for it. There is no big if-else anywhere." This is polymorphism and the State pattern.
- `incident/domain/AssignedState.java` (1 card): `allowedCommands` lists what is legal here; `acknowledge` checks the caller is the assignee, stops the response clock, and returns the next state `AcknowledgedState` with an `IncidentAcknowledged` event. The state is a single shared `INSTANCE`.
- `incident/domain/ResolvedState.java` (1 card): `verify` only accepts the reporter and a rating from 1 to 5; `rejectResolution` reopens the ticket.
- `shared/domain/error/ItsmException.java` and the folder listing of its 15 subclasses (GitHub listing only, 1 short card of `InvalidStateTransitionException`): inheritance, and each error carries its own code and HTTP status.

**Act 4 · Time.**
- `incident/domain/SlaClock.java` (1 card): an immutable record. `start`, `pause`, `resume`, `stop` each return a new clock; `remainingMs` asks a calendar how much working time has passed.
- `catalog/domain/BusinessCalendar.java` (1 card): `isWorkingDay` (weekdays minus holidays), `workingMillisBetween` (counts only working hours unless the policy is 24×7).
- `shared/domain/ClockPort.java` + `VirtualAnchoredClock.java` (1 card): the code never reads the system clock directly; it asks this interface. The virtual clock can run faster (`setScaleFactor`), which is how the demo fast-forwards SLA time. This is abstraction and dependency inversion in one small example.

**Act 5 · Intake pipeline and priority.**
- `incident/application/intake/IntakePipeline.java` (1 card): collects all steps, sorts them by `order()`, runs them one after another.
- `incident/application/intake/AbstractIntakeStep.java` (1 card): the shared skeleton `execute`, with each step filling in `doExecute`: Template Method, and inheritance used on purpose.
- GitHub listing of the nine step files in order, one clause each. Then `ValidateStep.java` (1 small card) and `PriorityAndSlaStep.java` (1 card): it asks the priority strategy for a priority, looks up the SLA policy for the service tier, and calls `incident.classify(...)`.
- `incident/application/priority/PriorityStrategy.java` and `ItilMatrixPriorityStrategy.java` (1 card): one interface, three interchangeable implementations: Strategy pattern.

**Act 6 · Commands, permissions, assignment.**
- `incident/application/IncidentCommandService.java` (1 card on `acknowledge`): every command follows the same five steps: load, authorise, read the clock, call the domain, save and publish events, all in one transaction.
- `incident/application/CommandAuthorizer.java` (1 card): the `switch` that says who may do what: only the assignee may acknowledge and resolve; only the reporter may verify or reject; only a team lead or admin may declare a major incident.
- `assignment/domain/AssignmentStrategy.java` and the folder `assignment/application/strategy/` (listing of the 7 strategies, 1 card of `LeastLoadedStrategy`). Mention `assignment/domain/HungarianBatchAssigner.java` in one sentence without a card.

**Act 7 · Infrastructure.**
- `incident/infrastructure/web/IncidentController.java` (2 cards): `createIncident` (reads the request, calls the intake service, returns 201) and `executeCommand` (the `switch` from URL word to service method).
- `incident/infrastructure/persistence/JpaIncidentRepositoryAdapter.java` (1 card): implements the domain's `IncidentRepository` interface with JPA: the Adapter in Ports and Adapters. The domain object never sees a JPA annotation; it is converted through a `Snapshot`.
- `audit/infrastructure/AuditLedgerInTxListener.java` + `audit/domain/AuditHasher.java` (2 cards): the listener runs inside the same transaction as the change, locks the incident row, takes the previous hash, and stores a new SHA-256 hash that includes it; the first link is 64 zeros. Then `db/migration/V003__audit_timers_ai.sql`, trigger `audit_immutable` (1 small card): the database itself refuses UPDATE, DELETE and TRUNCATE on the audit table.
- `identity/infrastructure/security/SecurityConfig.java` (1 card): which routes are open, which need a login, which need the admin role (after A15).
- `shared/infrastructure/web/GlobalProblemDetailsHandler.java` (1 card): turns any domain exception into a standard error JSON with the project's own error code.

**Act 8 · Frontend.** GitHub: `frontend/src/` listing (`services`, `context`, `pages`, `components`). Cards: `services/api.ts` `request` (adds the token, turns error bodies into exceptions); `context/AuthContext.tsx` `switchUser`; `pages/portal/PortalReport.tsx` `handleSubmit`; `pages/workbench/WorkbenchDetail.tsx` action bar ("the buttons are drawn from `allowedCommands`, the list the backend's state object produced. The UI does not decide what is legal.").

**Act 9 · Live demo with code traces.** Switch to the app tab. One continuous story:
1. As Aarav Sharma (student): open "Report New Incident", type the ticket, the copilot suggests the service, Submit → **`T1-submit`**. Ticket page shows ASSIGNED, a real technician name, P-level, and the SLA countdown.
2. Switch user to the assigned technician. "My queue" shows the ticket. Open it. Acknowledge → **`T2-ack`**. Response clock stops.
3. Start investigation. Request user info with a question → **`T3-pause`** (the resolution countdown visibly stops).
4. Switch back to Aarav: the banner asks for input; answer it; state returns to IN_PROGRESS and the countdown runs again (live, through SSE).
5. Technician: Resolve with a proper note.
6. Aarav: Confirm it is fixed, five stars → **`T4-verify`**. State VERIFIED.
7. Technician: Close. Timeline shows every step with its actor and hash.
Optional beat if A17 and A18 are green: as admin, switch the demo clock to 30× and show a heart being lost on another open ticket; run the storm simulation and resolve the master to show the children resolving.

**Act 10 · Proof.**
1. Terminal: `curl` trying to close the already closed ticket → 409 JSON with `ITSM-4090`, `currentState`, `attemptedCommand`. One sentence linking back to the default method in `IncidentState`.
2. App, admin: Verify ledger → **`T5-ledger`** → valid. Terminal: the `psql` UPDATE on `audit_record` → rejected by the trigger.
3. Terminal: `bash scripts/verify-m1.sh` → 24 checks, 554,590 transitions, in about five seconds. Terminal: ArchUnit test run → green.

**Act 11 · Team and close.** Title card with the four names and what each owned, taken from `02_script/team.json`. State an ownership only if the code for it exists at `PINNED_SHA`. Last shot: the GitHub repo page with the URL visible. Thank-you line.

`02_script/team.json` (create it; names must be confirmed, see section 9):
```json
{ "group": "Group 76", "course": "Object-Oriented Programming, S1 2025–2026", "campus": "BITS Pilani, Hyderabad Campus",
  "members": [
    { "name": "Srijan Shukla",  "owned": "domain core, incident state machine, audit ledger" },
    { "name": "Suhani Agarwal", "owned": "SLA clock, business calendar, SLA policies" },
    { "name": "Kartikey Negi",  "owned": "service catalogue and dependency data, major-incident flow" },
    { "name": "Harish Kumar",   "owned": "frontend, REST controllers" } ] }
```

### C14. Remotion project (`07_remotion/`)
- Remotion 4, React 18. One composition per act plus `Master`. A build script (`build_manifest.py`) joins `storyboard.json`, `timings.json`, clip event logs and card data into `manifest.json` with exact frame ranges.
- Components: `BrowserChrome` (tabs, URL from events, chapter chip), `ClipPlayer` (plays a capture clip; can freeze on a frame for traces; never changes playback speed), `CodeCardScene` (blurred backdrop, card, per-beat highlights and notes), `TraceOverlay` (ring, popups, arrows, breadcrumb), `TerminalCard`, `TitleCard`, `Cursor` is already inside the clips.
- Motion: cards open with a 9-frame scale-and-fade from the highlighted GitHub lines; highlights move with a 6-frame ease; tab switches take 8 frames. No other effects.
- Audio: one `<Audio>` per beat at its start frame. No music. (Optional: a very quiet room-tone bed at −45 LUFS so silences do not sound dead.)
- Render act by act (a single process for the full length ran out of memory on 16 GB before): `--concurrency=6 --gl=angle`, then join with `ffmpeg -f concat -safe 0 -c copy`.
- Subtitles (`make_srt.py`): from the beats' display text and word timings; at most 2 lines of 42 characters; break only at punctuation or between clauses, never after "and", "the", "a", "of" or in the middle of a name (the old `.srt` broke lines like "…students, faculty, and"); cue length 1.2–6 s; tags removed.

### C15. Gate C — video quality checks (all automatic, all must pass)
1. `lint_script.py` and `verify_cards.mjs` pass.
2. Duration between 17:30 and 19:30; never outside 15:00–19:55.
3. Sync: for every beat, the audio start equals the beat's visual start within 2 frames; for every `click` event inside a beat, the click happens within that beat.
4. Speech: every accepted take passed C6; whole-master faster-whisper transcript vs script WER ≤ 10 %.
5. Audio: −16 LUFS ±0.5, true peak ≤ −1 dBTP, no silence longer than 2.5 s, no clicks at act joins, master duration equals the sum of acts within 0.05 s.
6. Picture: `blackdetect` finds nothing ≥ 0.4 s; no frozen picture longer than 12 s outside `trace` scenes; midpoint frame of every scene is not blank.
7. Honesty: every `app` clip was recorded against the Gate-A commit with zero console errors; every terminal card's text equals its captured JSON; every URL shown in the chrome was really visited.
8. `08_out/contact_sheet/index.html`: one thumbnail per beat with its spoken text beside it. `08_out/REVIEW.md`: the 20 beats most worth a human look (lowest speech score, longest freeze, densest card), with timestamps.

---

## 6. PHASE D — THE PUBLIC DEMO SITE (after the video is done)

GitHub Pages cannot run the Spring backend. Do D1 always; D2 by default; D3 only if Srijan provides hosting.
- **D1.** With A11 the public site already shows "BACKEND OFFLINE" instead of a misleading alert. Add a link there to the README quick-start.
- **D2. In-browser demo mode.** When `VITE_API_BASE_URL` is empty and the page is not served from localhost, load `frontend/src/services/demoBackend.ts`: an in-memory implementation of the same `api` interface (login, list, get, create, the lifecycle commands with the same legal-transition table, timeline with real Web Crypto SHA-256 chaining), persisted in `localStorage`, seeded with the 8 users and 19 services. Show a permanent badge: "DEMO MODE: runs in your browser, no server". The video never uses demo mode.
- **D3. Real backend.** If Srijan supplies a host (for example a container host plus the existing Neon database), build the Pages bundle with `VITE_API_BASE_URL=https://<host>` in `deploy-pages.yml` and restrict CORS in `SecurityConfig` to the Pages origin.

---

## 7. FINAL REPORT (write `video_v3/08_out/FINAL_REPORT.md` and show it to Srijan)

1. Table of every A-item: fixed / skipped / blocked, with the commit hash.
2. Gate A, Gate C results (the PASS/FAIL tables).
3. Final duration, word count, number of tags used, voice route used (1, 2 or 3).
4. Anything narrated differently from this brief because the code said otherwise.
5. Everything in `BLOCKERS.md`.
6. The `REVIEW.md` list.

---

## 8. LESSONS FROM THE OLD VIDEO (do not repeat)

- Its narration described features that do not exist (Phase B list). The new one is generated from the truth sheet.
- It repeated a sentence in two acts ("Global exception translation ensures…", old cues 49–50 and 196–197).
- Its subtitles split in the middle of phrases.
- The script spelled a team member's name "Hairsh"; the production notes say "Harish".
- Its app clips were recorded before the lifecycle worked, so they could not show a real ticket moving through states.
- SVGs loaded through `<img>` rendered black in headless Chromium; mount SVG inline.
- A single full-length Remotion render ran out of memory; render per act.

---

## 9. QUESTIONS FOR SRIJAN (ask once, at the start; continue with the default if there is no answer)

1. Exact spelling of the fourth member's name: "Harish Kumar" (default) or something else? Is each ownership line in `team.json` correct?
2. May I push the fixes to `main` on GitHub when Gate A is green (default: yes)? The Pages site redeploys automatically.
3. Is Docker Desktop installed (default: I will check with `docker info` and fall back to a separate `incidentzero_demo` database on Neon)?
4. Should the video leave four empty slots for member video clips, as the old "no_member_clips" draft did (default: no, one voice throughout)?
5. Do you have a host for a public backend (default: no, I build the in-browser demo mode for Pages)?
