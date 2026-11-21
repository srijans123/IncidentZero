# Graph Report - OOP Proj  (2026-11-08)

## Corpus Check
- 296 files · ~149,123 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 50 file(s) not represented in the graph (top: .license 22, (none) 4, .st 4)

## Summary
- 2187 nodes · 5468 edges · 165 communities (89 shown, 76 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 487 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5b624c6b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CommandType
- Incident
- AssignmentStrategy
- CommandAuthorizer
- uuid
- .setUp
- AuthenticationTest.java
- package.json
- incident
- Suggestion
- environment
- HashEmbeddingAdapter
- spring
- train_sla_risk.py
- DomainEvent
- org.springframework.http.ResponseEntity
- SlaClock
- IntakeContext
- IncidentJpaEntity
- AuthController.java
- AppUserJpaEntity
- InAppSseHub
- PriorityExplanation
- Priority
- HungarianBatchAssigner
- .rejectResolution
- EmailSmtpChannelAdapter
- SanitizeRedactStep
- react
- App.tsx
- WorkbenchDetail.tsx
- ArchitectureTest.java
- UserPrincipal
- .main
- TransitionResult
- ApiControllerAndProblemDetailsTest.java
- IncidentCommandService
- .reprioritize
- RcaRankerAdapter
- ClockPort
- compilerOptions
- TechnicianProfileJpaEntity
- IncidentDtos
- steps
- TimerKind
- IncidentController
- TopologyBlastRadius3D.tsx
- SoundEngine
- org.springframework.jdbc.core.JdbcTemplate
- IdentityQueryServiceAdapter.java
- verify_ui_pixel_perfect.mjs
- AssignmentPortAdapter.java
- IntakePipelineTest.java
- AcknowledgedState
- .declareMajor
- InProgressState
- CampusStage.tsx
- NotificationChannel
- env
- Incident-Zero (I-ITSM): Master Implementation Procedure
- CampusCoreRack3D.tsx
- IncidentController.java
- JwtAuthenticationFilter.java
- GlobalProblemDetailsHandler.java
- .startInvestigation
- SlaBreachPredictorAdapter
- InvalidStateTransitionException
- ItsmException
- IncidentStatus
- IncidentZeroApplication
- ClockState
- RateLimitExceededException
- run_test.sh
- AuditChainTamperException
- DuplicateIncidentDetectedException
- org.junit.jupiter.api.Test
- MissingSlaConfigurationException
- PersistenceConcurrencyException
- WorkingTimeCalculator
- ServiceNotFoundException
- .testAssignmentStrategiesSelection
- PriorityAndSlaStep.java
- verify-m1.sh
- verify-m2.sh
- verify-m6.sh
- setup_phase1.sh
- test_e2e.sh
- update_github.sh
- edu.campus:incident-zero-backend
- IdGeneratorPort
- TechnicianCandidate
- Resolution
- 24A. The 24 Frozen Agent Decisions (Zero-Ambiguity Handoff Table)
- .selectTechnician
- SlaPolicyResolver
- IdentityQueryService
- Product Requirements Document (PRD) — Incident-Zero (I-ITSM v2.2)
- Incident-Zero: Reach Zero — Frontend Architecture and Design Brief
- 25. Complete Drop-In Java 25/21 Domain, Port, and Infrastructure Reference Codebase
- Ponytail Help
- .selectTechnician
- .testSlaDualClockLifecycleAndPause
- 9.1 Pattern catalogue
- IncidentRepository
- AbstractIntakeStep
- AuthTokens
- IntelligenceEvents
- InAppSseChannelAdapter
- RandomSourceAdapter
- ADR-001: Language & Runtime Selection (Java 25 LTS / Java 21 LTS)
- ADR-002: Architectural Pattern: Hexagonal Modular Monolith
- ADR-003: Persistence & Search Strategy (NeonDB PostgreSQL + pgvector)
- ADR-004: AI & Machine Learning Execution Model
- ADR-005: Real-Time Communication Protocol (Server-Sent Events with Stream Ticket)
- ADR-006: Domain Model: Roles, Capabilities & Categorization
- ADR-008: Priority Calculation Engine (ITIL Matrix + Modifiers)
- ADR-009: Technician Allocation & Hungarian Batch Assignment
- ADR-010: AI Security, Guardrails & LLM Decorator Chain
- ADR-011: Empirical Evaluation Methodology & Claims Policy
- ADR-012: Quality Assurance, Verification & Fuzzing Harness
- ADR-013: Authentication, Authorization & Cryptographic Audit Ledger
- ADR-014: Evolution & Horizontal Scale Seams (1,000 to 100,000+ Users)
- ADR-015: Frontend Architecture: React 19 Three-Workspace Role-Guarded PWA
- 12. Data, simulator, storm specification, and evaluation
- 32. Autonomous Agent Build Runbook, `tools/split.py`, and Drop-In Infrastructure Files
- ponytail-audit/SKILL.md
- Ponytail Gain
- ponytail-review/SKILL.md
- Ponytail
- CategoryAndServiceStep
- DuplicateCheckStep
- EnrichStep
- ValidateStep
- 3. Locked stack
- ADR-007: Incident State Machine & Dual Pause-Aware SLA Clocks
- ponytail-debt/SKILL.md
- Technology Stack Specification — Incident-Zero (I-ITSM v2.2)
- 2.1 Conflicts and decisions
- 00-incident-zero-guardrails.md
- AGENTS.md
- TEAM_SETUP.md

## God Nodes (most connected - your core abstractions)
1. `Incident` - 196 edges
2. `WorkingTimeCalculator` - 97 edges
3. `ClockPort` - 91 edges
4. `Priority` - 72 edges
5. `TransitionResult` - 65 edges
6. `DomainEvent` - 56 edges
7. `SlaSnapshot` - 49 edges
8. `PriorityExplanation` - 42 edges
9. `CommandType` - 39 edges
10. `IncidentState` - 39 edges

## Surprising Connections (you probably didn't know these)
- `8.5 Concurrency, capacity reservation, rationale and metrics` --references--> `AssignmentRationale`  [INFERRED]
  incident_zero_master_implementation_procedure_v2_2.md → backend/src/main/java/edu/campus/iitsm/assignment/api/AssignmentRationale.java
- `Considered Options` --references--> `HungarianBatchAssigner`  [INFERRED]
  docs/adr/ADR-009.md → backend/src/main/java/edu/campus/iitsm/assignment/domain/HungarianBatchAssigner.java
- `5. Security, Better Auth & Audit Ledger` --references--> `AuditHasher`  [INFERRED]
  docs/PRD.md → backend/src/main/java/edu/campus/iitsm/audit/domain/AuditHasher.java
- `5. Security, Better Auth & Audit Ledger` --references--> `AuditHasher`  [INFERRED]
  docs/tasks/PRD.md → backend/src/main/java/edu/campus/iitsm/audit/domain/AuditHasher.java
- `5. Security, Better Auth & Audit Ledger` --references--> `AuditHasher`  [INFERRED]
  PRD.md → backend/src/main/java/edu/campus/iitsm/audit/domain/AuditHasher.java

## Import Cycles
- None detected.

## Communities (165 total, 76 thin omitted)

### Community 0 - "CommandType"
Cohesion: 0.08
Nodes (19): ClosedState, CommandType, ACKNOWLEDGE, ASSIGN, CANCEL, CLASSIFY, CLOSE, DECLARE_MAJOR (+11 more)

### Community 1 - "Incident"
Cohesion: 0.05
Nodes (5): Incident, SlaStatus, AT_RISK, BREACHED, ON_TRACK

### Community 2 - "AssignmentStrategy"
Cohesion: 0.23
Nodes (5): AssignmentRationale, CandidateScore, ExperienceStrategy, SkillMatchStrategy, AssignmentStrategy

### Community 3 - "CommandAuthorizer"
Cohesion: 0.05
Nodes (20): BusinessCalendar, CalendarConfiguration, SecurityConfig, CommandAuthorizer, IncidentConfiguration, Anchor, VirtualAnchoredClock, ClockConfiguration (+12 more)

### Community 5 - ".setUp"
Cohesion: 0.19
Nodes (4): AssignmentResult, ClockPort, IdGeneratorPort, IncidentRepository

### Community 6 - "AuthenticationTest.java"
Cohesion: 0.12
Nodes (5): ClockMode, BUSINESS_HOURS, CONTINUOUS_24X7, PersistenceAndListenersTest, StrategyAndAssignmentTest

### Community 7 - "package.json"
Cohesion: 0.07
Nodes (35): tailwind-merge@^2.6.1, @types/three@^0.186.0, devDependencies, autoprefixer@^10.4.20, playwright@^1.64.1, @playwright/test@^1.64.1, postcss@^8.5.1, tailwindcss@^3.4.17 (+27 more)

### Community 8 - "incident"
Cohesion: 0.09
Nodes (42): app_user, business_calendar, calendar_window, category, escalation_policy, holiday, it_service, refresh_token (+34 more)

### Community 9 - "Suggestion"
Cohesion: 0.10
Nodes (11): LlmClassificationSchema, ActionItem, LlmPirDraftSchema, TimelineEntry, LlmResolutionSchema, RemediationStep, FilterClause, LlmSearchFilterAst (+3 more)

### Community 10 - "environment"
Cohesion: 0.05
Nodes (41): build, depends_on, environment, ports, profiles, context, dockerfile, condition (+33 more)

### Community 11 - "HashEmbeddingAdapter"
Cohesion: 0.06
Nodes (25): HashEmbeddingAdapter, OnnxEmbeddingAdapter, DuplicateDetectionAdapter, EmbeddingPort, DuplicateDetectionTest, 1. Executive Summary & Core Philosophy, 2. System Architecture & Topology, 3. Incident Lifecycle & The 11-State Sealed State Machine (+17 more)

### Community 12 - "spring"
Cohesion: 0.05
Nodes (38): embedding-mode, provider, app, ai, audit, auth, clock, name (+30 more)

### Community 13 - "train_sla_risk.py"
Cohesion: 0.07
Nodes (7): train_and_export(), main(), render_server_rack(), render_sla_chronometer(), render_topology_core(), create_adrs(), extract_files()

### Community 14 - "DomainEvent"
Cohesion: 0.14
Nodes (21): EscalationTriggered, IncidentAcknowledged, IncidentAssigned, IncidentCancelled, IncidentClassified, IncidentClosed, IncidentEvents, IncidentLinked (+13 more)

### Community 16 - "SlaClock"
Cohesion: 0.20
Nodes (6): SlaBreached, SlaClock, Decision, 22. Viva defence pack (Updated with v2.2 Audit Wording), 23. All 13 Project Risks and Mitigations (Fixes Audit Item B.13), 30. Complete 15-ADR Compendium (Answers All 9 Technology Selection Report Questions)

### Community 17 - "IntakeContext"
Cohesion: 0.19
Nodes (4): IntakePipeline, IntakeContext, IntakeStep, IntakePipelineTest

### Community 18 - "IncidentJpaEntity"
Cohesion: 0.10
Nodes (3): IncidentJpaEntity, IncidentJpaRepository, JpaIncidentRepositoryAdapter

### Community 19 - "AuthController.java"
Cohesion: 0.16
Nodes (4): LoginRequest, StreamTicketResponse, AuthController, KnowledgeController

### Community 21 - "InAppSseHub"
Cohesion: 0.19
Nodes (3): InAppSseHub, SseEvent, StreamController

### Community 22 - "PriorityExplanation"
Cohesion: 0.27
Nodes (5): PriorityExplanation, PriorityStep, 5.1 Aggregates and entities, 5.2 Value objects (immutable records), 5. Domain model

### Community 23 - "Priority"
Cohesion: 0.13
Nodes (9): IncidentCreated, Snapshot, Priority, P1, P2, P3, P4, SlaSnapshot (+1 more)

### Community 24 - "HungarianBatchAssigner"
Cohesion: 0.30
Nodes (7): BatchMatch, BatchResult, HungarianBatchAssigner, TechSlot, TicketCandidate, 0. How to use this document, 8.4 Hungarian batch (`HungarianBatchAssigner`: Exact for $n \le 7$, Multi-Pass Kuhn-Munkres for $n > 7$)

### Community 25 - ".rejectResolution"
Cohesion: 0.17
Nodes (3): PendingUserState, ResolvedState, 5.3 Users, inheritance, permissions and `CommandAuthorizer`

### Community 28 - "react"
Cohesion: 0.17
Nodes (22): ActionButtonProps, ButtonSize, ButtonVariant, HashPillProps, BadgeVariant, StatusBadge(), StatusBadgeProps, StatusDot() (+14 more)

### Community 29 - "App.tsx"
Cohesion: 0.29
Nodes (20): App(), AppContent(), Header(), ActionButton(), HashPill(), AuthProvider(), useAuth(), SseProvider() (+12 more)

### Community 30 - "WorkbenchDetail.tsx"
Cohesion: 0.10
Nodes (28): HeaderProps, SKY_MODES, AuthContext, AuthContextType, PredefinedUser, SEEDED_USERS, SseContext, SseContextType (+20 more)

### Community 32 - "UserPrincipal"
Cohesion: 0.23
Nodes (3): UserPrincipal, IdentityQueryServiceAdapter, StreamTicketService

### Community 33 - ".main"
Cohesion: 0.10
Nodes (11): AuditHasher, AuditRowView, VerificationReport, AuditLedgerTamperTest, DatabaseMigrationTest, Verify, Brand & Aesthetic Commitments, Governing Engineering Principle (+3 more)

### Community 37 - ".reprioritize"
Cohesion: 0.14
Nodes (4): IncidentResolved, ClassifiedState, NewState, StateSupport

### Community 39 - "ClockPort"
Cohesion: 0.10
Nodes (11): CategorizationAdapter, LanguageModelGatewayAdapter, PiiRedactor, RuleBasedFallbackService, PirDrafterAdapter, ResolutionRagAdapter, NlSearchAdapter, ClockPort (+3 more)

### Community 40 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 42 - "IncidentDtos"
Cohesion: 0.09
Nodes (11): AdviceRequest, AdviceResponse, AuditTimelineItemDto, CommandEnvelope, CreateIncidentRequest, IncidentAiPanelDto, IncidentDetailResponse, IncidentDtos (+3 more)

### Community 43 - "steps"
Cohesion: 0.12
Nodes (15): jobs, verify-core-and-archunit, name, on, pull_request, push, branches, name (+7 more)

### Community 44 - "TimerKind"
Cohesion: 0.08
Nodes (23): TimerKind, AUTO_VERIFY_72H, ESC_L2, ESC_L3, ESC_L4, RES_BREACH, RES_WARN_50, RES_WARN_75 (+15 more)

### Community 45 - "IncidentController"
Cohesion: 0.14
Nodes (13): IncidentQueryPort, IntakeService, IncidentController, IntakeController, CategorizationPort, DuplicateDetectionPort, NlSearchPort, PirDrafterPort (+5 more)

### Community 46 - "TopologyBlastRadius3D.tsx"
Cohesion: 0.27
Nodes (9): calculateNodePositions(), DependencyEdge3D, FiberConduit(), NodeOrb(), SEEDED_EDGES, SEEDED_NODES, ServiceNode3D, TopologyBlastRadius3D() (+1 more)

### Community 47 - "SoundEngine"
Cohesion: 0.09
Nodes (19): 1. Concept & Art Direction, 2. Visual Theme & Anti-Slop Principles, 3.1 Palette (Day Mode), 3.2 Four Skies Matrix, 3. Sky Tokens & Color Palette, 4. Game Feel & Audio Synthesizer, 5. Swappable ROM Cartridge Architecture, 6. Official Brand Logos (+11 more)

### Community 48 - "org.springframework.jdbc.core.JdbcTemplate"
Cohesion: 0.15
Nodes (6): CapacityReservationAdapter, AuditVerificationPort, AuditVerificationResult, AuditLedgerInTxListener, AuditVerificationAdapter, SlaTimerInTxListener

### Community 49 - "IdentityQueryServiceAdapter.java"
Cohesion: 0.23
Nodes (3): AppUserJpaRepository, TechnicianProfileJpaRepository, InvalidCredentialsException

### Community 50 - "verify_ui_pixel_perfect.mjs"
Cohesion: 0.18
Nodes (7): MOCK_INCIDENTS, MOCK_SERVICES, OUTPUT_DIR, ROUTES, runAudit(), setupApiMocks(), VIEWPORTS

### Community 51 - "AssignmentPortAdapter.java"
Cohesion: 0.17
Nodes (4): CapacityReservationPort, AssignmentPortAdapter, AssignmentPort, AssignStep

### Community 56 - "CampusStage.tsx"
Cohesion: 0.10
Nodes (29): ActiveTab, CampusStage(), initHashes(), CampusStageProps, CANONICAL_PAYLOADS, computeSha256(), INITIAL_TICKETS, LEGAL_MOVES (+21 more)

### Community 58 - "env"
Cohesion: 0.18
Nodes (5): verify-m3.sh script, verify-m4.sh script, verify-m5.sh script, start.sh script, test_auth.sh script

### Community 59 - "Incident-Zero (I-ITSM): Master Implementation Procedure"
Cohesion: 0.09
Nodes (22): 15. UI specification (All Three Workspaces & Page-to-API Map), 16. Security and privacy (OWASP LLM Top 10 mapping), 18. DevOps and environments, 1. The project on one page, 20. Team ownership, 24. Verified references, 26.1 `V001__reference_tables.sql` (Reference & Identity Tables First), 26.2 `V002__incident_core.sql` (Incident Aggregate, Sequence, Links & Comments) (+14 more)

### Community 60 - "CampusCoreRack3D.tsx"
Cohesion: 0.08
Nodes (28): dependencies, clsx@^2.1.1, lucide-react@^0.475.0, react@^19.0.0, react-dom@^19.0.0, @react-three/drei@^10.7.9, @react-three/fiber@^9.8.2, three@^0.186.1 (+20 more)

### Community 67 - "ItsmException"
Cohesion: 0.13
Nodes (5): ExternalGatewayFailureException, ItsmException, PersistenceFailureException, TechnicianUnavailableException, TechnicianWorkloadExceededException

### Community 69 - "IncidentStatus"
Cohesion: 0.09
Nodes (14): CancelledState, IncidentStatus, ACKNOWLEDGED, ASSIGNED, CANCELLED, CLASSIFIED, CLOSED, IN_PROGRESS (+6 more)

### Community 71 - "ClockState"
Cohesion: 0.40
Nodes (4): ClockState, PAUSED, RUNNING, STOPPED

### Community 74 - "run_test.sh"
Cohesion: 0.50
Nodes (3): JAVA_HOME, PATH, run_test.sh script

### Community 77 - "org.junit.jupiter.api.Test"
Cohesion: 0.18
Nodes (6): ItilMatrixPriorityStrategy, ProductScorePriorityStrategy, WeightedScorePriorityStrategy, PriorityStrategyTest, 25.6 Priority Strategies (`ItilMatrixPriorityStrategy`, `ProductScorePriorityStrategy`, `WeightedScorePriorityStrategy`), 7.4 Alternate strategies (kept for comparison in the report)

### Community 82 - ".testAssignmentStrategiesSelection"
Cohesion: 0.24
Nodes (5): LeastLoadedStrategy, PriorityAwareStrategy, RoundRobinStrategy, 17. Test strategy, Test-Type Legend, and 71 test cases, 19. Execution gates and Gate G2 efficiency cuts

### Community 83 - "PriorityAndSlaStep.java"
Cohesion: 0.22
Nodes (5): PriorityAndSlaStep, PriorityInput, PriorityResult, PriorityStrategy, 4.5 The PDF's 14-step scenario mapped to components (with corrected pipeline ordering)

### Community 110 - "Resolution"
Cohesion: 0.17
Nodes (7): Resolution, 6.1 States, 6.2 Transition table (single source of truth; UI buttons and test matrix are generated from it), 6.3 Illegal transitions, 6.4 Child incidents (complete lifecycle rules for duplicates and cascades), 6.5 Why sealed here but open interfaces elsewhere, 6. Lifecycle state machine

### Community 111 - "24A. The 24 Frozen Agent Decisions (Zero-Ambiguity Handoff Table)"
Cohesion: 0.21
Nodes (8): Notifier, RandomSourcePort, 24A. The 24 Frozen Agent Decisions (Zero-Ambiguity Handoff Table), 4.1 Shape, 4.2 Modules (bounded contexts), 4.3 Repository layout, 4.4 Dependency rules enforced in CI (ArchUnit and Modulith verify), 4. Architecture

### Community 112 - ".selectTechnician"
Cohesion: 0.22
Nodes (8): HybridWeightedStrategy, 11.1 A1: hybrid duplicate and related-incident linking (with typed nulls and `RESOLVED` exclusion), 11.2 A2 to A6 and Tier B (B1 to B5), 11. Intelligent features (Tier A & Tier B), 21.1 Detailed Steps for Demo Workflows 1, 2, and 3 (Fixes Audit Item B.13), 21.2 Video Timing Map (15–20 minutes, all 5 members on camera), 21.3 Resume Bullet Templates (Fill `<...>` Only From `/ml/eval/results/metrics.json` — Fixes Audit Item B.13), 21. Demo, Workflows 1–3, Report and Resume Templates

### Community 113 - "SlaPolicyResolver"
Cohesion: 0.27
Nodes (4): CreateProvisionalIncidentStep, SlaKey, SlaPolicyResolver, SlaClockAndPolicyTest

### Community 115 - "Product Requirements Document (PRD) — Incident-Zero (I-ITSM v2.2)"
Cohesion: 0.20
Nodes (9): 1. Executive Summary & Core Philosophy, 2. System Architecture & Topology, 3. Incident Lifecycle & The 11-State Sealed State Machine, 4. SLA & Business Calendar Engine, 5. Security, Better Auth & Audit Ledger, 6. AI Platform (Tier A & Tier B), 7. Frontend Architecture (React 19), Product Requirements Document (PRD) — Incident-Zero (I-ITSM v2.2) (+1 more)

### Community 116 - "Incident-Zero: Reach Zero — Frontend Architecture and Design Brief"
Cohesion: 0.20
Nodes (9): 1. Concept, 2. Look and feel, 3. Page architecture, 4. Game feel, 5. Atmosphere, 6. Polish added in the final pass, 7. Accessibility and performance, 8. Implementation notes for the real app (+1 more)

### Community 117 - "25. Complete Drop-In Java 25/21 Domain, Port, and Infrastructure Reference Codebase"
Cohesion: 0.20
Nodes (10): 25.10 Assignment, Intake, TimerKind & Authorization Contracts (`AssignmentStrategy`, `IntakeStep`, `TimerKind`, `CommandAuthorizer`), 25.1 Modulith Package Descriptors and ArchUnit R1–R9 Suite (`ArchitectureTest.java`), 25.2 Shared Kernel Ports and Complete 15-Exception Hierarchy (`shared/domain`), 25.3 Domain Value Objects, Dual `SlaClock`, and `DomainEvent` Hierarchy (`incident/domain`), 25.4 Complete 11-State Sealed Lifecycle Engine (`IncidentState`, `StateSupport`, and Concrete States), 25.5 Complete `Incident` Aggregate Root (`Incident.java` — with `restore(Snapshot)` and Late-Ack Breach Check), 25.7 Stateful Demo Clock (`VirtualAnchoredClock.java`) and `BusinessCalendar.java`, 25.8 Exact ($n \le 7$) + Multi-Pass Kuhn-Munkres Solver (`HungarianBatchAssigner.java`) (+2 more)

### Community 118 - "Ponytail Help"
Cohesion: 0.22
Nodes (8): Band (Claude Code), Configure Default Mode, Deactivate, Levels, More, Ponytail Help, Skills, Update

### Community 119 - ".selectTechnician"
Cohesion: 0.28
Nodes (6): HungarianBatchStrategy, 8.1 Strategies (and Gate G2 Cut Rule), 8.2 Hard constraints (all strategies), 8.3 HybridWeighted score (with cold-start and zero-division guards), 8.5 Concurrency, capacity reservation, rationale and metrics, 8. Assignment

### Community 121 - "9.1 Pattern catalogue"
Cohesion: 0.22
Nodes (6): IncidentStates, 9.1 Pattern catalogue, 9.3 Open/closed proofs (keep real diffs), 9.4 Exceptions and RFC 9457 mapping (all 15 exceptions defined in `shared/domain/error`), 9.5 Data structures and complexity rationale, 9. Patterns, pipeline, exceptions, data structures

### Community 123 - "IncidentRepository"
Cohesion: 0.43
Nodes (3): BatchAssignmentScheduler, PersistAndPublishStep, IncidentRepository

### Community 127 - "IntelligenceEvents"
Cohesion: 0.33
Nodes (5): AiSuggestionIssued, AiSuggestionOutcomeRecorded, BreachRiskRaised, DuplicatesCorrelated, IntelligenceEvents

### Community 130 - "ADR-001: Language & Runtime Selection (Java 25 LTS / Java 21 LTS)"
Cohesion: 0.33
Nodes (5): ADR-001: Language & Runtime Selection (Java 25 LTS / Java 21 LTS), Considered Options, Context, Decision, Status

### Community 131 - "ADR-002: Architectural Pattern: Hexagonal Modular Monolith"
Cohesion: 0.33
Nodes (5): ADR-002: Architectural Pattern: Hexagonal Modular Monolith, Considered Options, Context, Decision, Status

### Community 132 - "ADR-003: Persistence & Search Strategy (NeonDB PostgreSQL + pgvector)"
Cohesion: 0.33
Nodes (5): ADR-003: Persistence & Search Strategy (NeonDB PostgreSQL + pgvector), Considered Options, Context, Decision, Status

### Community 133 - "ADR-004: AI & Machine Learning Execution Model"
Cohesion: 0.33
Nodes (5): ADR-004: AI & Machine Learning Execution Model, Considered Options, Context, Decision, Status

### Community 134 - "ADR-005: Real-Time Communication Protocol (Server-Sent Events with Stream Ticket)"
Cohesion: 0.33
Nodes (5): ADR-005: Real-Time Communication Protocol (Server-Sent Events with Stream Ticket), Considered Options, Context, Decision, Status

### Community 135 - "ADR-006: Domain Model: Roles, Capabilities & Categorization"
Cohesion: 0.33
Nodes (5): ADR-006: Domain Model: Roles, Capabilities & Categorization, Considered Options, Context, Decision, Status

### Community 136 - "ADR-008: Priority Calculation Engine (ITIL Matrix + Modifiers)"
Cohesion: 0.33
Nodes (5): ADR-008: Priority Calculation Engine (ITIL Matrix + Modifiers), Considered Options, Context, Decision, Status

### Community 137 - "ADR-009: Technician Allocation & Hungarian Batch Assignment"
Cohesion: 0.33
Nodes (5): ADR-009: Technician Allocation & Hungarian Batch Assignment, Considered Options, Context, Decision, Status

### Community 138 - "ADR-010: AI Security, Guardrails & LLM Decorator Chain"
Cohesion: 0.33
Nodes (5): ADR-010: AI Security, Guardrails & LLM Decorator Chain, Considered Options, Context, Decision, Status

### Community 139 - "ADR-011: Empirical Evaluation Methodology & Claims Policy"
Cohesion: 0.33
Nodes (5): ADR-011: Empirical Evaluation Methodology & Claims Policy, Considered Options, Context, Decision, Status

### Community 140 - "ADR-012: Quality Assurance, Verification & Fuzzing Harness"
Cohesion: 0.33
Nodes (5): ADR-012: Quality Assurance, Verification & Fuzzing Harness, Considered Options, Context, Decision, Status

### Community 141 - "ADR-013: Authentication, Authorization & Cryptographic Audit Ledger"
Cohesion: 0.33
Nodes (5): ADR-013: Authentication, Authorization & Cryptographic Audit Ledger, Considered Options, Context, Decision, Status

### Community 142 - "ADR-014: Evolution & Horizontal Scale Seams (1,000 to 100,000+ Users)"
Cohesion: 0.33
Nodes (5): ADR-014: Evolution & Horizontal Scale Seams (1,000 to 100,000+ Users), Considered Options, Context, Decision, Status

### Community 143 - "ADR-015: Frontend Architecture: React 19 Three-Workspace Role-Guarded PWA"
Cohesion: 0.33
Nodes (5): ADR-015: Frontend Architecture: React 19 Three-Workspace Role-Guarded PWA, Considered Options, Context, Decision, Status

### Community 144 - "12. Data, simulator, storm specification, and evaluation"
Cohesion: 0.33
Nodes (6): 12.1 19 BITS Campus Services & 26 DAG Edges, 12.2 Synthetic Corpus (`/ml/datagen`), 12.3 `ERP_LDAP_POOL_EXHAUSTION` Storm Scenario Specification (40 Reports), 12.4 Simulator (`/sim`), 12.5 Honesty & Claims Policy, 12. Data, simulator, storm specification, and evaluation

### Community 145 - "32. Autonomous Agent Build Runbook, `tools/split.py`, and Drop-In Infrastructure Files"
Cohesion: 0.33
Nodes (6): 32.1 Drop-In Antigravity / Claude Code Prompt and `AGENTS.md`, 32.2 Deterministic File Extractor (`tools/split.py`), 32.3 Drop-In `backend/pom.xml`, `application.yml`, and `IncidentZeroApplication.java`, 32.4 Drop-In `deploy/docker-compose.yml`, Dockerfiles, `nginx.conf`, and CI Workflow, 32.5 Executable Milestone Verification Scripts (`scripts/verify-m1.sh` to `verify-m6.sh`), 32. Autonomous Agent Build Runbook, `tools/split.py`, and Drop-In Infrastructure Files

### Community 146 - "ponytail-audit/SKILL.md"
Cohesion: 0.40
Nodes (4): 1. Map first, 2. Look for, 3. Check before you report, 4. Output

### Community 147 - "Ponytail Gain"
Cohesion: 0.40
Nodes (4): Boundaries, Honesty boundary, Ponytail Gain, Scoreboard

### Community 148 - "ponytail-review/SKILL.md"
Cohesion: 0.40
Nodes (4): 1. Understand first, 2. Look for, 3. Check before you report, 4. Output

### Community 149 - "Ponytail"
Cohesion: 0.40
Nodes (4): Before you write, Levels, Ponytail, The smallest complete change

### Community 154 - "3. Locked stack"
Cohesion: 0.40
Nodes (4): 3.1 Picks, 3.2 Boot, Modulith, Hibernate and Spring AI gotchas (read before Day 1), 3.3 Fallback and version pinning rule, 3. Locked stack

### Community 155 - "ADR-007: Incident State Machine & Dual Pause-Aware SLA Clocks"
Cohesion: 0.40
Nodes (4): ADR-007: Incident State Machine & Dual Pause-Aware SLA Clocks, Considered Options, Context, Status

### Community 156 - "ponytail-debt/SKILL.md"
Cohesion: 0.50
Nodes (3): Boundaries, Output, Scan

### Community 157 - "Technology Stack Specification — Incident-Zero (I-ITSM v2.2)"
Cohesion: 0.50
Nodes (3): 1. Locked Version Matrix, 2. Module Boundary Contracts, Technology Stack Specification — Incident-Zero (I-ITSM v2.2)

### Community 159 - "2.1 Conflicts and decisions"
Cohesion: 0.67
Nodes (3): 2.1 Conflicts and decisions, 2.2 What each source contributed, 2. How the sources were reconciled (including v2.2 Claude Audit fixes)

## Knowledge Gaps
- **56 isolated node(s):** `edu.campus:incident-zero-backend`, `CONTINUOUS_24X7`, `BUSINESS_HOURS`, `RUNNING`, `PAUSED` (+51 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 716 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **76 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `WorkbenchDetail.tsx` to `SlaClock`, `.rejectResolution`, `PriorityExplanation`?**
  _High betweenness centrality (0.193) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `WorkingTimeCalculator` (e.g. with `24A. The 24 Frozen Agent Decisions (Zero-Ambiguity Handoff Table)` and `4.1 Shape`) actually correct?**
  _`WorkingTimeCalculator` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `edu.campus:incident-zero-backend`, `CONTINUOUS_24X7`, `BUSINESS_HOURS` to the rest of the system?**
  _56 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CommandType` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Why does `Incident` connect `Incident` to `CommandType`, `uuid`, `AuthenticationTest.java`, `DomainEvent`, `SlaClock`, `IntakeContext`, `IncidentJpaEntity`, `PriorityExplanation`, `Priority`, `HungarianBatchAssigner`, `.rejectResolution`, `3. Locked stack`, `TransitionResult`, `ApiControllerAndProblemDetailsTest.java`, `IncidentCommandService`, `.reprioritize`, `IncidentDtos`, `TimerKind`, `IncidentController`, `org.springframework.jdbc.core.JdbcTemplate`, `AcknowledgedState`, `.declareMajor`, `InProgressState`, `IncidentController.java`, `.startInvestigation`, `IncidentStatus`, `WorkingTimeCalculator`, `Resolution`, `.testSlaDualClockLifecycleAndPause`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Should `Incident` be split into smaller, more focused modules?**
  _Cohesion score 0.046464646464646465 - nodes in this community are weakly interconnected._
- **Why does `30. Complete 15-ADR Compendium (Answers All 9 Technology Selection Report Questions)` connect `SlaClock` to `CommandAuthorizer`, `ClockPort`, `PriorityExplanation`, `HungarianBatchAssigner`, `Incident-Zero (I-ITSM): Master Implementation Procedure`, `WorkbenchDetail.tsx`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._