# IncidentZero — Truth Sheet & Architectural Citations

**Pinned SHA:** `daf3e1d11f8a89d04095eeab068719e7651506e5`  
**Generated At:** 2026-11-16  
**Status:** FULLY VERIFIED (Gate A & Gate B Compliant)

---

## 1. Domain Core & Lifecycle State Machine

| Claim | Verified Value | Evidence (`file:line` at PINNED_SHA) |
| :--- | :--- | :--- |
| Lifecycle State Classes | 11 state classes | `backend/src/main/java/edu/campus/iitsm/incident/domain/` |
| 1. New State | `NewState` | `backend/src/main/java/edu/campus/iitsm/incident/domain/NewState.java:13` |
| 2. Classified State | `ClassifiedState` | `backend/src/main/java/edu/campus/iitsm/incident/domain/ClassifiedState.java:13` |
| 3. Assigned State | `AssignedState` | `backend/src/main/java/edu/campus/iitsm/incident/domain/AssignedState.java:13` |
| 4. Acknowledged State | `AcknowledgedState` | `backend/src/main/java/edu/campus/iitsm/incident/domain/AcknowledgedState.java:13` |
| 5. In-Progress State | `InProgressState` | `backend/src/main/java/edu/campus/iitsm/incident/domain/InProgressState.java:13` |
| 6. Pending User State | `PendingUserState` | `backend/src/main/java/edu/campus/iitsm/incident/domain/PendingUserState.java:13` |
| 7. Resolved State | `ResolvedState` | `backend/src/main/java/edu/campus/iitsm/incident/domain/ResolvedState.java:13` |
| 8. Verified State | `VerifiedState` | `backend/src/main/java/edu/campus/iitsm/incident/domain/VerifiedState.java:13` |
| 9. Closed State | `ClosedState` | `backend/src/main/java/edu/campus/iitsm/incident/domain/ClosedState.java:11` |
| 10. Reopened State | `ReopenedState` | `backend/src/main/java/edu/campus/iitsm/incident/domain/ReopenedState.java:13` |
| 11. Cancelled State | `CancelledState` | `backend/src/main/java/edu/campus/iitsm/incident/domain/CancelledState.java:11` |
| Command Types | 17 enum values | `backend/src/main/java/edu/campus/iitsm/incident/domain/CommandType.java:3-8` |
| Domain Event Records | 21 record types | `backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java:12-32` |
| Pure-JDK Verification Harness | 24 tests / 554,590 transitions | `backend/src/test/java/Verify.java` (`bash scripts/verify-m1.sh`) |

---

## 2. Intake Pipeline & Processing Steps

| Claim | Order | Evidence (`file:line` at PINNED_SHA) |
| :--- | :--- | :--- |
| Pipeline Orchestrator | - | `backend/src/main/java/edu/campus/iitsm/incident/application/intake/IntakePipeline.java:10` |
| Step 1: Validate | Order 10 | `backend/src/main/java/edu/campus/iitsm/incident/application/intake/ValidateStep.java:14` |
| Step 2: Sanitize & Redact | Order 20 | `backend/src/main/java/edu/campus/iitsm/incident/application/intake/SanitizeRedactStep.java:15` |
| Step 3: Category & Service | Order 30 | `backend/src/main/java/edu/campus/iitsm/incident/application/intake/CategoryAndServiceStep.java:16` |
| Step 4: Priority & SLA | Order 40 | `backend/src/main/java/edu/campus/iitsm/incident/application/intake/PriorityAndSlaStep.java:18` |
| Step 5: Provisional Incident | Order 50 | `backend/src/main/java/edu/campus/iitsm/incident/application/intake/CreateProvisionalIncidentStep.java:16` |
| Step 6: Enrich Context | Order 60 | `backend/src/main/java/edu/campus/iitsm/incident/application/intake/EnrichStep.java:14` |
| Step 7: Duplicate Check | Order 70 | `backend/src/main/java/edu/campus/iitsm/incident/application/intake/DuplicateCheckStep.java:14` |
| Step 8: Assign Technician | Order 80 | `backend/src/main/java/edu/campus/iitsm/incident/application/intake/AssignStep.java:18` |
| Step 9: Persist & Publish | Order 90 | `backend/src/main/java/edu/campus/iitsm/incident/application/intake/PersistAndPublishStep.java:16` |

---

## 3. Priority Strategies (3) & Assignment Strategies (7)

| Strategy Name | Category | Evidence (`file:line` at PINNED_SHA) |
| :--- | :--- | :--- |
| ITIL Matrix Strategy | Priority | `backend/src/main/java/edu/campus/iitsm/incident/application/priority/ItilMatrixPriorityStrategy.java:14` |
| Weighted Score Strategy | Priority | `backend/src/main/java/edu/campus/iitsm/incident/application/priority/WeightedScorePriorityStrategy.java:11` |
| Product Score Strategy | Priority | `backend/src/main/java/edu/campus/iitsm/incident/application/priority/ProductScorePriorityStrategy.java:11` |
| Round Robin Strategy | Assignment | `backend/src/main/java/edu/campus/iitsm/assignment/application/strategy/RoundRobinStrategy.java:13` |
| Least Loaded Strategy | Assignment | `backend/src/main/java/edu/campus/iitsm/assignment/application/strategy/LeastLoadedStrategy.java:12` |
| Skill Match Strategy | Assignment | `backend/src/main/java/edu/campus/iitsm/assignment/application/strategy/SkillMatchStrategy.java:13` |
| Experience Strategy | Assignment | `backend/src/main/java/edu/campus/iitsm/assignment/application/strategy/ExperienceStrategy.java:13` |
| Priority-Aware Strategy | Assignment | `backend/src/main/java/edu/campus/iitsm/assignment/application/strategy/PriorityAwareStrategy.java:13` |
| Hungarian Batch Strategy | Assignment | `backend/src/main/java/edu/campus/iitsm/assignment/application/strategy/HungarianBatchStrategy.java:13` |
| Hybrid Weighted Strategy | Assignment | `backend/src/main/java/edu/campus/iitsm/assignment/application/strategy/HybridWeightedStrategy.java:13` |

---

## 4. Typed Error Codes & Exceptions (15)

| Exception Class | Code | HTTP Status | Evidence (`file:line` at PINNED_SHA) |
| :--- | :--- | :--- | :--- |
| `InvalidCredentialsException` | `ITSM-4010` | 401 | `backend/src/main/java/edu/campus/iitsm/shared/domain/error/InvalidCredentialsException.java:5` |
| `UnauthorizedOperationException` | `ITSM-4030` | 403 | `backend/src/main/java/edu/campus/iitsm/shared/domain/error/UnauthorizedOperationException.java:10` |
| `IncidentNotFoundException` | `ITSM-4041` | 404 | `backend/src/main/java/edu/campus/iitsm/shared/domain/error/IncidentNotFoundException.java:7` |
| `ServiceNotFoundException` | `ITSM-4042` | 404 | `backend/src/main/java/edu/campus/iitsm/shared/domain/error/ServiceNotFoundException.java:5` |
| `InvalidStateTransitionException` | `ITSM-4090` | 409 | `backend/src/main/java/edu/campus/iitsm/shared/domain/error/InvalidStateTransitionException.java:11` |
| `TechnicianUnavailableException` | `ITSM-4091` | 409 | `backend/src/main/java/edu/campus/iitsm/shared/domain/error/TechnicianUnavailableException.java:7` |
| `DuplicateIncidentDetectedException` | `ITSM-4092` | 409 | `backend/src/main/java/edu/campus/iitsm/shared/domain/error/DuplicateIncidentDetectedException.java:7` |
| `PersistenceConcurrencyException` | `ITSM-4093` | 409 | `backend/src/main/java/edu/campus/iitsm/shared/domain/error/PersistenceConcurrencyException.java:7` |
| `InvalidIncidentPayloadException` | `ITSM-4220` | 422 | `backend/src/main/java/edu/campus/iitsm/shared/domain/error/InvalidIncidentPayloadException.java:7` |
| `TechnicianWorkloadExceededException` | `ITSM-4221` | 422 | `backend/src/main/java/edu/campus/iitsm/shared/domain/error/TechnicianWorkloadExceededException.java:7` |
| `RateLimitExceededException` | `ITSM-4290` | 429 | `backend/src/main/java/edu/campus/iitsm/shared/domain/error/RateLimitExceededException.java:7` |
| `MissingSlaConfigurationException` | `ITSM-5001` | 500 | `backend/src/main/java/edu/campus/iitsm/shared/domain/error/MissingSlaConfigurationException.java:5` |
| `PersistenceFailureException` | `ITSM-5030` | 503 | `backend/src/main/java/edu/campus/iitsm/shared/domain/error/PersistenceFailureException.java:5` |
| `ExternalGatewayFailureException` | `ITSM-5031` | 503 | `backend/src/main/java/edu/campus/iitsm/shared/domain/error/ExternalGatewayFailureException.java:5` |
| `AuditChainTamperException` | `ITSM-5090` | 500 | `backend/src/main/java/edu/campus/iitsm/shared/domain/error/AuditChainTamperException.java:5` |

---

## 5. Architectural Invariants (ArchUnit R1–R9)

| Rule | Description | Evidence (`file:line` at PINNED_SHA) |
| :--- | :--- | :--- |
| `R1` | Domain has zero framework imports (Spring, JPA, Hibernate, Jackson) | `backend/src/test/java/edu/campus/iitsm/ArchitectureTest.java:33-42` |
| `R2` | Application isolated from infrastructure and JPA | `backend/src/test/java/edu/campus/iitsm/ArchitectureTest.java:45-51` |
| `R3` | Spring Modulith bounded context verification & PlantUML documentation | `backend/src/test/java/edu/campus/iitsm/ArchitectureTest.java:106-111` |
| `R4` | Web controllers never touch repositories or JpaRepositories | `backend/src/test/java/edu/campus/iitsm/ArchitectureTest.java:54-58` |
| `R5` | Ban wall clock (`Instant.now()`) and unseeded random in core | `backend/src/test/java/edu/campus/iitsm/ArchitectureTest.java:60-70` |
| `R6` | Intelligence package cannot invoke incident commands or domain | `backend/src/test/java/edu/campus/iitsm/ArchitectureTest.java:72-76` |
| `R7` | Port implementations live in infrastructure package | `backend/src/test/java/edu/campus/iitsm/ArchitectureTest.java:78-81` |
| `R8` | Constructor injection only (zero field `@Autowired`) | `backend/src/test/java/edu/campus/iitsm/ArchitectureTest.java:83-86` |
| `R9` | In-Tx listeners use `@EventListener` and `@Transactional(propagation = Propagation.MANDATORY)` | `backend/src/test/java/edu/campus/iitsm/ArchitectureTest.java:88-103` |

---

## 6. Architecture Decision Records (ADR-001 through ADR-015)

| ADR ID | Title | Evidence Path |
| :--- | :--- | :--- |
| ADR-001 | Language & Runtime Selection (Java 25 LTS / Java 21 LTS) | `docs/adr/ADR-001.md:1` |
| ADR-002 | Architectural Pattern: Hexagonal Modular Monolith | `docs/adr/ADR-002.md:1` |
| ADR-003 | Persistence & Search Strategy (NeonDB PostgreSQL + pgvector) | `docs/adr/ADR-003.md:1` |
| ADR-004 | AI & Machine Learning Execution Model | `docs/adr/ADR-004.md:1` |
| ADR-005 | Real-Time Communication Protocol (SSE with Stream Ticket) | `docs/adr/ADR-005.md:1` |
| ADR-006 | Domain Model: Roles, Capabilities & Categorization | `docs/adr/ADR-006.md:1` |
| ADR-007 | Incident State Machine & Dual Pause-Aware SLA Clocks | `docs/adr/ADR-007.md:1` |
| ADR-008 | Priority Calculation Engine (ITIL Matrix + Modifiers) | `docs/adr/ADR-008.md:1` |
| ADR-009 | Technician Allocation & Hungarian Batch Assignment | `docs/adr/ADR-009.md:1` |
| ADR-010 | AI Security, Guardrails & LLM Decorator Chain | `docs/adr/ADR-010.md:1` |
| ADR-011 | Empirical Evaluation Methodology & Claims Policy | `docs/adr/ADR-011.md:1` |
| ADR-012 | Quality Assurance, Verification & Fuzzing Harness | `docs/adr/ADR-012.md:1` |
| ADR-013 | Authentication, Authorization & Cryptographic Audit Ledger | `docs/adr/ADR-013.md:1` |
| ADR-014 | Evolution & Horizontal Scale Seams (1,000 to 100,000+ Users) | `docs/adr/ADR-014.md:1` |
| ADR-015 | Frontend Architecture: React 19 Three-Workspace Role-Guarded PWA | `docs/adr/ADR-015.md:1` |

---

## 7. Seed Data Baseline

| Entity | Count | Evidence (`file:line` in `R__campus_seed.sql`) |
| :--- | :--- | :--- |
| Operational Teams | 4 | `backend/src/main/resources/db/migration/R__campus_seed.sql:2-9` |
| Incident Categories | 10 | `backend/src/main/resources/db/migration/R__campus_seed.sql:10-23` |
| IT Services | 19 | `backend/src/main/resources/db/migration/R__campus_seed.sql:24-46` |
| Service Dependencies (Edges) | 26 | `backend/src/main/resources/db/migration/R__campus_seed.sql:47-82` |
| SLA Policies | 16 (4 tiers × 4 priorities) | `backend/src/main/resources/db/migration/R__campus_seed.sql:83-102` |
| Technician Skills | 12 | `backend/src/main/resources/db/migration/R__campus_seed.sql:103-118` |
| Seeded Users | 8 (2 students, 4 technicians, 2 admins) | `backend/src/main/resources/db/migration/R__campus_seed.sql:119-130` |
| Business Calendar Holidays | 3 | `backend/src/main/resources/db/migration/R__campus_seed.sql:163-168` |

---

## 8. Runtime & Infrastructure Specifications

| Parameter | Specification | Evidence |
| :--- | :--- | :--- |
| Java Target | Java 21 LTS | `pom.xml:17` |
| Spring Boot Version | 3.5.3 | `pom.xml:7` |
| Frontend Framework | React 19 | `frontend/package.json:17` |
| Build Tool | Vite 6 | `frontend/package.json:30` |
| JWT Token Validity | 86,400 seconds (24 hours) | `backend/src/main/resources/application.yml:45` |
| SSE Stream Ticket TTL | 30 seconds (single use) | `backend/src/main/resources/application.yml:49` |
| SSE Heartbeat Interval | 15 seconds | `backend/src/main/resources/application.yml:50` |
| Cryptographic Audit Chain | SHA-256 with genesis zero hash (64 hex zeros) | `backend/src/main/java/edu/campus/iitsm/audit/infrastructure/AuditLedgerInTxListener.java:94` |
| Database Engine Immutability | PostgreSQL trigger `audit_immutable()` | `backend/src/main/resources/db/migration/V003__audit_timers_ai.sql:40-47` |

---

## 9. Banned Terms Audit (Section 4 Compliance)

| Banned Term / Unsupported Claim | Status | Verification Note |
| :--- | :--- | :--- |
| Tarjan / strongly-connected-components cycle check | CLEARED | Zero occurrences in script or code cards |
| Automatic storm detection with 5-minute sliding windows | CLEARED | Replaced with admin-triggered storm simulation & cascade resolution |
| Automatic root-cause pinpointing | CLEARED | Zero claims of automated root-cause pinpointing |
| "forty-five tickets" | CLEARED | Script uses honest seed counts |
| Incident commander appointment & campus-wide broadcast | CLEARED | Removed from narration |
| Escalation ladder notifications | CLEARED | Removed from narration |
| SLA warnings at 50/75/90 percent | CLEARED | Accurate to actual SLA sweeps |
| "sub-millisecond" pgvector search | CLEARED | Removed from narration |
| ONNX embeddings as default path | CLEARED | Fallback / fixture mode properly described |
| SMS notifications | CLEARED | SSE real-time in-browser events used exclusively |
| Decorator, Builder and Facade patterns | CLEARED | Removed unsupported pattern names |
| "eleven patterns" | CLEARED | Confined to real patterns (State, Strategy, Template Method, Adapter, Observer, Factory Method, Singleton, Pipeline) |
| "ninety-four percent coverage" | CLEARED | Removed blanket percentage claims; cited 24 checks & 554,590 transitions |
| "reset script … 2.14 seconds" | CLEARED | Removed fabricated reset timing |
| Playwright viewport specs (before Gate A) | CLEARED | Fixed to real 1920×992 screen recording |
| "bi-directional" Server-Sent Events | CLEARED | Accurately described as uni-directional push from server with HTTP command POSTs |
| "military-grade" | CLEARED | Removed buzzword; replaced with cryptographic SHA-256 hash chaining |
| "Java 22" | CLEARED | Aligned to Java 21 LTS |
| "over six thousand students" | CLEARED | Grounded in campus scale design |
| "legally binding" | CLEARED | Removed legal overclaim |
| "microsecond accuracy" | CLEARED | Grounded in millisecond precision timestamps |
| "hundreds of client threads" | CLEARED | Removed hyperbole |
| "nine technology report questions" | CLEARED | Removed |
| "520,036" | CLEARED | Verified against real count: 554,590 transitions |
