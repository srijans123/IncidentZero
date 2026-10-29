# Product Requirements Document (PRD) — Incident-Zero (I-ITSM v2.2)

## 1. Executive Summary & Core Philosophy
Incident-Zero (I-ITSM) is an enterprise-grade, intelligence-augmented campus IT Service Management platform built for higher education institutions (specifically modeled around the BITS campus IT ecosystem).

### The Governing Principle
**"AI proposes, the deterministic domain core disposes."**
Artificial Intelligence outputs candidate classifications, duplicate links, root-cause rankings, and resolution suggestions with explicit confidence and provenance. The deterministic domain core strictly enforces lifecycle transitions, computes ITIL priorities, manages SLA deadlines, authorizes actions via RBAC, and writes immutable cryptographically-chained audit logs.

---

## 2. System Architecture & Topology
Incident-Zero is structured as a **Hexagonal Modular Monolith** enforcing strict architectural boundaries via Spring Modulith and ArchUnit rules R1–R9:
- **Domain Ring:** Zero framework dependencies (no Spring, JPA, or Jackson). Pure JDK 21/25.
- **Application Ring:** Use case orchestrators, strategy implementations, Spring Modulith modules with `@NamedInterface("api")`.
- **Infrastructure Ring:** NeonDB Serverless PostgreSQL (`pgvector`, `pg_trgm`), Better Auth JWT / RBAC bridge, ONNX Runtime in-process inference, in-memory SSE ring buffer hub.

---

## 3. Incident Lifecycle & The 11-State Sealed State Machine
An incident advances through an 11-state sealed hierarchy governed by the `IncidentState` type:
1. `NEW`: Initial intake state.
2. `CLASSIFIED`: Category, priority, and SLA calculated; suggestions pending.
3. `ASSIGNED`: Individual technician assigned; response clock running.
4. `ACKNOWLEDGED`: Technician accepted; response clock stopped (breach checked).
5. `IN_PROGRESS`: Active investigation and remediation.
6. `PENDING_USER`: Awaiting reporter response (dual SLA clocks paused).
7. `PENDING_VENDOR`: Awaiting 3rd-party vendor (dual SLA clocks paused).
8. `RESOLVED`: Resolution documented; resolution clock stopped (breach checked).
9. `VERIFIED`: Resolution confirmed by user or automated health check.
10. `CLOSED`: Terminal state; read-only.
11. `REOPENED`: Issue recurred within re-open window; resolution restarted.

---

## 4. SLA & Business Calendar Engine
- **Dual Pause-Aware Clocks:** `responseClock` and `resolutionClock` track calendar and working hours.
- **SLA Status States:** `ON_TRACK`, `AT_RISK` (ratio >= 0.75), `BREACHED`.
- **Sticky Breach Evaluation:** Late acknowledgement (`stopResponse`) and late resolution (`stopResolution`) evaluate `remainingMs(now, cal) <= 0` immediately before stopping clocks, permanently marking `slaStatus = BREACHED`.
- **Business Calendar:** Monday–Friday 08:00–20:00 IST with campus holiday awareness and 3700-day overflow guards.

---

## 5. Security, Better Auth & Audit Ledger
- **Authentication:** Better Auth with `BETTER_AUTH_SECRET`, issued tokens signed and verified.
- **RBAC Roles:** `EMPLOYEE`, `TECHNICIAN` (`L1`, `SENIOR`, `TEAM_LEAD`), `ADMINISTRATOR` (`SYSTEM_ADMIN`, `IT_MANAGER`).
- **SSE Stream Ticket:** 30-second single-use ticket (`POST /api/v1/auth/stream-ticket`) enabling secure browser `EventSource` connections.
- **Cryptographic Audit Ledger:** Canonical SHA-256 hash chaining (`AuditHasher`) preventing in-database tampering. `V003` enforces `audit_no_change` triggers and dual `/var/log/iitsm/ledger_anchors.jsonl` persistence.

---

## 6. AI Platform (Tier A & Tier B)
- **A1 Typed Hybrid RRF Duplicate Detector:** Combines BM25 text match (`pg_trgm`) and dense vector similarity (`pgvector`) using Reciprocal Rank Fusion.
- **A2 Categorization Cascade:** Rule-based heuristics fallback to in-process LLM / ONNX classifier.
- **A3 Explainable Priority Engine:** ITIL $3\times 3$ Matrix with logged additive campus modifiers.
- **A4 Technician Recommendation & Hungarian Batch Assigner:** Multi-pass Kuhn-Munkres heuristic with exact branch-and-bound optimization for $n \le 7$.
- **A5 ONNX SLA Breach Risk Predictor:** In-process calibrated classifier predicting probability of breach.
- **A6 Case-Based RAG with Citation Verifier:** Retrieves resolved cases from historical audit logs with strict source attribution.
- **B2 Leaf-Safe Graph RCA Ranker & Storm Simulator:** 19-service / 26-edge campus service dependency DAG analyzing topology and identifying root causes during ticket storms (e.g., 40-ticket `ERP_LDAP_POOL_EXHAUSTION`).

---

## 7. Frontend Architecture (React 19)
Three role-guarded workspaces:
- `/portal`: Campus employee intake copilot, self-service ticket status, verification.
- `/workbench`: Technician War Room, SLA countdown timers, live updates via SSE, AI recommendations, linked ticket clusters.
- `/admin`: Service Dependency DAG (`@xyflow/react`), Audit Ledger verification tool, storm simulator trigger, system settings.

---

## 8. Ralph Loop Task Checklist

- [x] TASK-01: Generate `PRD.md`, `docs/DESIGN.md`, `docs/TECH_STACK.md`, `docs/AUTH_AND_DATABASE.md`, and `progress.txt`.
- [x] TASK-02: Pass Milestone M1 Pure-JDK 520,036-Transition Verification Harness (`bash scripts/verify-m1.sh`).
- [x] TASK-03: Connect to NeonDB (`NEON_DATABASE_URL` / `DB_URL` from `.env`), run Flyway `V001` -> `V002` -> `V003` -> `R__campus_seed.sql` (19 services, 26 dependency edges, 16 SLA policies, 8 demo users), and pass ArchUnit R1–R9 (`bash scripts/verify-m2.sh`).
- [x] TASK-04: Implement Better Auth (`BETTER_AUTH_SECRET`) + Spring Security JWT Bridge (`CommandAuthorizer` + 30s single-use SSE stream-ticket endpoint `POST /api/v1/auth/stream-ticket`).
- [x] TASK-05: Implement JPA Persistence Adapter (`IncidentJpaEntity` <-> `Incident.restore(Snapshot)` / `toSnapshot()`, keeping `@Version` separate from background `refreshSla` ticks) and in-transaction `AuditLedgerInTxListener` + `SlaTimerInTxListener` (`@EventListener` + `@Transactional(propagation = MANDATORY)`).
- [x] TASK-06: Implement Priority Strategies (`ItilMatrix`, `ProductScore`, `WeightedScore`), Assignment Strategies (`RoundRobin`, `LeastLoaded`, `HybridWeighted`, `SkillMatch`, `Experience`, `PriorityAware`, `HungarianBatchAssigner` with `BatchAssignmentScheduler`), and Atomic SQL Load Reservation.
- [x] TASK-07: Implement the 9-Step Synchronous Intake Pipeline (`ValidateStep -> SanitizeRedactStep -> CreateProvisionalIncidentStep -> DuplicateCheckStep -> CategoryAndServiceStep -> EnrichStep -> PriorityAndSlaStep -> AssignStep -> PersistAndPublishStep`) and Notification Channels (`InAppSseChannelAdapter`, `EmailSmtpChannelAdapter`) (`bash scripts/verify-m3.sh`).
- [x] TASK-08: Implement the AI Platform (`HashEmbeddingAdapter` + `OnnxEmbeddingAdapter`, `LanguageModelPort` decorators: `PiiRedaction`, `PromptGuard`, `SemanticCache`, `SchemaValidation`, `RateLimit`, `CircuitBreakerWithTimeout`, `Metering`, `ReplayRecorder` using `<%var%>` prompts), A1 Typed Hybrid RRF Duplicate Detector, A2 Categorization Cascade, A5 ONNX SLA Breach Risk Predictor, A6 Case-Based RAG with Citation Verifier, B2 Leaf-Safe Graph RCA Ranker + 40-Ticket Storm Simulator, B3 PIR Drafter, and B4 NL Search (`bash scripts/verify-m4.sh`).
- [x] TASK-09: Implement all REST Controllers (`/api/v1/*`), RFC 9457 `GlobalProblemDetailsHandler` (`ITSM-4010` to `ITSM-5090`), and `InAppSseHub` (512-event ring buffer with `Last-Event-ID` replay and 15s heartbeat) (`bash scripts/verify-m5.sh`).
- [x] TASK-10: Scaffold and build the React 19 + TypeScript + Vite + Tailwind + shadcn/ui + React Flow + Recharts frontend (`frontend/`) with Better Auth client integration and all 3 role-guarded workspaces (`/portal`, `/workbench`, `/admin`) mapped to the exact API table in Section 15 (`bash scripts/verify-m6.sh`).
- [ ] TASK-11: Run CodeRabbit CLI review (`cr review --agent --uncommitted`), fix all critical/major findings (max 2 passes), and write ADRs (`docs/adr/ADR-001.md` to `ADR-015.md`).
- [ ] TASK-12: Execute full end-to-end verification of Demo Workflows 1, 2, and 3 (Employee Copilot Intake, Technician War Room + Pause/Resume SLA + SQL Tamper Detection, and 40-Ticket `ERP_LDAP_POOL_EXHAUSTION` Storm) and push the final version to GitHub via `upload/update_github.sh`.
