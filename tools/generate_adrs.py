import pathlib

def create_adrs():
    adr_dir = pathlib.Path("docs/adr")
    adr_dir.mkdir(parents=True, exist_ok=True)

    adrs = [
        ("ADR-001.md", "# ADR-001: Language & Runtime Selection (Java 25 LTS / Java 21 LTS)\n\n"
         "## Status\nAccepted\n\n"
         "## Context\n"
         "The ITSM core requires strict OOP modeling (sealed class hierarchies, exhaustive pattern matching, value objects) alongside high-throughput, low-latency concurrent SLA monitoring across thousands of active timers.\n\n"
         "## Considered Options\n"
         "1. Python 3.12 (weak runtime encapsulation, lack of strict interfaces)\n"
         "2. TypeScript / Node.js (type erasure at runtime, single-threaded event loop)\n"
         "3. Java 25 LTS / Java 21 LTS (Temurin OpenJDK)\n\n"
         "## Decision\n"
         "Adopt **Java 25 / Java 21 LTS**.\n"
         "- Sealed types (`IncidentState`, `DomainEvent`) for exhaustive compile-time verification.\n"
         "- Virtual Threads for lightweight asynchronous SLA scheduling.\n"
         "- Records for immutable data transfer and value semantics.\n"
         "- Zero dependencies in domain core (pure JDK).\n"),

        ("ADR-002.md", "# ADR-002: Architectural Pattern: Hexagonal Modular Monolith\n\n"
         "## Status\nAccepted\n\n"
         "## Context\n"
         "The project needs clear bounded contexts and modularity without the operational and deployment complexity of distributed microservices.\n\n"
         "## Considered Options\n"
         "1. Distributed Microservices (rejected due to network latency, distributed transactions, and DevOps overhead)\n"
         "2. Traditional Layered Monolith (rejected due to leaky abstractions and tight coupling)\n"
         "3. Hexagonal Modular Monolith with Spring Modulith\n\n"
         "## Decision\n"
         "Adopt **Hexagonal Modular Monolith with Spring Modulith**.\n"
         "- Modules communicate strictly through exposed api packages (`@NamedInterface(\"api\")`).\n"
         "- Domain core is protected from frameworks (Hexagonal Ports & Adapters).\n"
         "- Verified at build-time with ArchUnit (R1-R9) and `ApplicationModules.verify()`.\n"),

        ("ADR-003.md", "# ADR-003: Persistence & Search Strategy (NeonDB PostgreSQL + pgvector)\n\n"
         "## Status\nAccepted\n\n"
         "## Context\n"
         "The system must persist relational entities (incidents, users, SLAs), cryptographic audit logs, full-text lexical indices, and 384-dimensional dense semantic embeddings within a single ACID transaction boundary.\n\n"
         "## Considered Options\n"
         "1. Standalone Document Store (MongoDB) + Vector DB (Pinecone) (dual-write inconsistency risk)\n"
         "2. NeonDB Serverless PostgreSQL with `pgvector` and `pg_trgm` (GIN)\n\n"
         "## Decision\n"
         "Adopt **NeonDB Serverless PostgreSQL with pgvector and pg_trgm**.\n"
         "- Single ACID transaction encompasses incident state, audit ledger, and embeddings.\n"
         "- Reciprocal Rank Fusion (RRF) combines BM25 lexical ranking and cosine vector distance in a single SQL query.\n"
         "- Configured with `prepareThreshold=0` for connection pooling safety.\n"),

        ("ADR-004.md", "# ADR-004: AI & Machine Learning Execution Model\n\n"
         "## Status\nAccepted\n\n"
         "## Context\n"
         "Intelligent features (A1 duplicate detection, A2 classification, A5 SLA breach risk, A6 case-based RAG) must operate reliably both online and in offline testing environments without flaky external dependencies.\n\n"
         "## Considered Options\n"
         "1. Python FastAPI microservice sidecar (runtime container sprawl and schema drift)\n"
         "2. Cloud-only LLM API calls (quota exhaustion and network failure vulnerabilities)\n"
         "3. In-process ONNX Runtime + Provider-Neutral `LanguageModelPort`\n\n"
         "## Decision\n"
         "Adopt **In-process ONNX Runtime + Provider-Neutral LanguageModelPort**.\n"
         "- Calibrated tabular models execute in-process via ONNX Runtime (<5ms latency).\n"
         "- LLM calls abstracted via `LanguageModelPort` with 9-stage decorator pipeline.\n"
         "- First-class support for `AI_PROVIDER=replay` and `AI_PROVIDER=off` fallback.\n"),

        ("ADR-005.md", "# ADR-005: Real-Time Communication Protocol (Server-Sent Events with Stream Ticket)\n\n"
         "## Status\nAccepted\n\n"
         "## Context\n"
         "War room state changes, SLA countdown ticks, and storm simulation progress must stream to browsers in real time without polling. Browser `EventSource` cannot pass custom Authorization headers.\n\n"
         "## Considered Options\n"
         "1. Bidirectional WebSockets (heavier state management and complex handshake auth)\n"
         "2. Short polling (high database load and latency)\n"
         "3. Server-Sent Events (SSE) with Single-Use 30s Stream Ticket\n\n"
         "## Decision\n"
         "Adopt **Server-Sent Events (SSE) with Single-Use 30s Stream Ticket**.\n"
         "- Client requests opaque ticket via `POST /api/v1/auth/stream-ticket`.\n"
         "- Connects to `GET /api/v1/stream?ticket=<ticket>`.\n"
         "- InAppSseHub maintains a 512-event circular ring buffer for `Last-Event-ID` reconnection replay and 15s heartbeats.\n"),

        ("ADR-006.md", "# ADR-006: Domain Model: Roles, Capabilities & Categorization\n\n"
         "## Status\nAccepted\n\n"
         "## Context\n"
         "Proper object-oriented modeling of campus user roles, technician capabilities, and incident categories must follow Open/Closed principles without fragile inheritance trees.\n\n"
         "## Considered Options\n"
         "1. Subclassing `Incident` by category (rejected: re-diagnosis alters object identity)\n"
         "2. Subclassing `Technician` by support tier (rejected: promotes rigid hierarchies)\n"
         "3. Inheritance for polymorphic permissions; composition for capabilities; data profiles for categories\n\n"
         "## Decision\n"
         "Adopt **Inheritance for User roles, Composition for Technician capabilities, and Data Profiles for Categories**.\n"
         "- User hierarchy: `Employee`, `Technician`, `Administrator`.\n"
         "- Technician capabilities are composed via skills, load capacity, and availability shifts.\n"
         "- Categories are modeled as data (`CategoryProfile`), enabling re-diagnosis without mutating object identity.\n"),

        ("ADR-007.md", "# ADR-007: Incident State Machine & Dual Pause-Aware SLA Clocks\n\n"
         "## Status\nAccepted\n\n"
         "## Context\n"
         "Incident lifecycle must strictly enforce 11 legal states and dual SLA clocks (response and resolution) that accurately pause during `PENDING_USER` and evaluate breaches before clock stoppage.\n\n"
         "## Considered Options\n"
         "1. Mutable enum with switch statements in service layers (leaks business logic)\n"
         "2. Sealed State Pattern with polymorphic command dispatch\n\n"
         "## Decision\n"
         "Adopt **Sealed State Pattern (11 Concrete Classes) with polymorphic command dispatch**.\n"
         "- `allowedCommands()` dynamically governs valid actions and UI button rendering.\n"
         "- `SlaClock` preserves consumed working milliseconds across pauses and mode changes (`retarget()`).\n"
         "- `stopResponse()` and `stopResolution()` evaluate breach status before stopping the clock so late acknowledgements never erase breaches.\n"),

        ("ADR-008.md", "# ADR-008: Priority Calculation Engine (ITIL Matrix + Modifiers)\n\n"
         "## Status\nAccepted\n\n"
         "## Context\n"
         "Calculating priority via raw integer products ($Impact \\times Urgency$) suffers from collisions ($2 \\times 3 = 6 = 1 \\times 6$). Priority must be explainable and auditable.\n\n"
         "## Considered Options\n"
         "1. Integer product multiplication formula (rejected due to priority collisions)\n"
         "2. Opaque black-box ML scoring (rejected due to lack of explainability)\n"
         "3. ITIL 3x3 Matrix + Bounded Additive Campus Modifiers\n\n"
         "## Decision\n"
         "Adopt **ITIL Matrix with Bounded Additive Campus Modifiers**.\n"
         "- Base priority determined by ITIL matrix (P1 to P4).\n"
         "- Additive modifiers (academic exam windows, VIP reporters, security category floor, affected user thresholds) capped at +1 level.\n"
         "- Full mathematical derivation and reasoning captured in `PriorityExplanation`.\n"),

        ("ADR-009.md", "# ADR-009: Technician Allocation & Hungarian Batch Assignment\n\n"
         "## Status\nAccepted\n\n"
         "## Context\n"
         "Under ticket storms (e.g., 40 simultaneous reports), greedy single-ticket dispatch causes technician overloading and race conditions.\n\n"
         "## Considered Options\n"
         "1. Pure sequential greedy dispatch (sub-optimal global load distribution)\n"
         "2. Exact branch-and-bound ($n \\le 7$) + Multi-pass Kuhn-Munkres ($n > 7$) in `HungarianBatchAssigner`\n\n"
         "## Decision\n"
         "Adopt **Hungarian Batch Assignment with Atomic SQL Capacity Reservation**.\n"
         "- Dispatches batches maximizing total assignment utility while respecting capacity ceilings.\n"
         "- Enforces <= 1 P1 incident per technician.\n"
         "- Atomic SQL `UPDATE technician_load SET points = points + :w WHERE points + :w <= capacity` eliminates race conditions.\n"),

        ("ADR-010.md", "# ADR-010: AI Security, Guardrails & LLM Decorator Chain\n\n"
         "## Status\nAccepted\n\n"
         "## Context\n"
         "AI integrations must guard against prompt injection, PII leakage, unbounded token consumption, and hallucinated source citations.\n\n"
         "## Considered Options\n"
         "1. Direct API calls from controllers/services (insecure and unmonitored)\n"
         "2. Layered Decorator Chain on `LanguageModelPort`\n\n"
         "## Decision\n"
         "Adopt **Layered Decorator Pipeline on LanguageModelPort**.\n"
         "- 9-stage pipeline: PiiRedaction, PromptGuard, SemanticCache, SchemaValidation, RateLimit, CircuitBreakerWithTimeout, Metering, ReplayRecorder.\n"
         "- Closed-vocabulary schemas compiled to type-safe Java records.\n"
         "- Deterministic citation verifier discards unsupported resolution steps.\n"
         "- ArchUnit Rule R6 forbids `intelligence` from calling command services.\n"),

        ("ADR-011.md", "# ADR-011: Empirical Evaluation Methodology & Claims Policy\n\n"
         "## Status\nAccepted\n\n"
         "## Context\n"
         "Academic and professional integrity requires that all AI accuracy, deflection, and latency numbers be empirically measured rather than copied from external papers.\n\n"
         "## Considered Options\n"
         "1. Quoting published benchmarks from research literature\n"
         "2. Automated local evaluation suite with versioned datasets and bootstrap confidence intervals\n\n"
         "## Decision\n"
         "Adopt **Automated Evaluation Suite (/ml/eval) with 95% Bootstrap Confidence Intervals**.\n"
         "- Evaluation runner measures Macro-F1, PR-AUC, precision@1, and latency.\n"
         "- Dataset SHA-256 hashes committed to version control.\n"
         "- Strict claims policy: only numbers output by `/ml/eval/results/metrics.json` may be cited in reports.\n"),

        ("ADR-012.md", "# ADR-012: Quality Assurance, Verification & Fuzzing Harness\n\n"
         "## Status\nAccepted\n\n"
         "## Context\n"
         "The core state machine, audit ledger, and SLA clocks must be provably resilient across all possible legal and illegal command sequences.\n\n"
         "## Considered Options\n"
         "1. Unit tests covering standard happy paths only\n"
         "2. 71-case test pyramid + standalone 50,000-sequence property verification harness\n\n"
         "## Decision\n"
         "Adopt **Comprehensive Test Pyramid + 50,000-Sequence Verify.java Harness**.\n"
         "- `Verify.java` verifies 554,590 randomized state transitions with zero invariant violations.\n"
         "- ArchUnit enforces architectural boundaries R1-R9.\n"
         "- Milestone verification scripts `verify-m1.sh` through `verify-m6.sh` automate continuous gatekeeping.\n"),

        ("ADR-013.md", "# ADR-013: Authentication, Authorization & Cryptographic Audit Ledger\n\n"
         "## Status\nAccepted\n\n"
         "## Context\n"
         "All actions must be authenticated, authorized via role-based access control (RBAC), and immutably recorded in a tamper-evident audit ledger.\n\n"
         "## Considered Options\n"
         "1. Mutable audit log table without cryptographic chaining\n"
         "2. SHA-256 hash-chained audit ledger with canonical JSON payloads and database permission locks\n\n"
         "## Decision\n"
         "Adopt **SHA-256 Hash-Chained Audit Ledger with Canonical JSON**.\n"
         "- Passwords hashed with Argon2id; stateless JWTs for API access.\n"
         "- `audit_record` stores per-incident sequential SHA-256 hashes.\n"
         "- Lexicographically sorted canonical JSON prevents false tamper alarms.\n"
         "- `REVOKE UPDATE, DELETE` on `itsm_app` role ensures append-only storage.\n"
         "- Admin verification endpoint checks hash integrity and pinpoints altered row IDs.\n"),

        ("ADR-014.md", "# ADR-014: Evolution & Horizontal Scale Seams (1,000 to 100,000+ Users)\n\n"
         "## Status\nAccepted\n\n"
         "## Context\n"
         "The architecture must cleanly scale from a single campus deployment (1,000 users) to a multi-campus enterprise (100,000+ users) without rewriting core domain code.\n\n"
         "## Considered Options\n"
         "1. Premature distributed microservices architecture\n"
         "2. Hexagonal Modular Monolith with pre-engineered horizontal scale seams\n\n"
         "## Decision\n"
         "Adopt **Pre-Engineered Horizontal Scale Seams**.\n"
         "- Stateless backend pods behind load balancer using signed JWTs.\n"
         "- Redis Pub/Sub backplane for distributed SSE fanout across instances.\n"
         "- Range partitioning on `incident` and `audit_record` tables by month (`created_at`).\n"
         "- Outbox pattern over Kafka for external event streaming.\n"
         "- Multi-tenant tenant isolation via PostgreSQL Row-Level Security (RLS).\n"),

        ("ADR-015.md", "# ADR-015: Frontend Architecture: React 19 Three-Workspace Role-Guarded PWA\n\n"
         "## Status\nAccepted\n\n"
         "## Context\n"
         "End-users, technicians, and administrators require purpose-built interfaces tailored to their workflows rather than a generic one-size-fits-all dashboard.\n\n"
         "## Considered Options\n"
         "1. Three separate single-page applications\n"
         "2. Single unified React 19 application with role-guarded workspaces and real-time SSE streaming\n\n"
         "## Decision\n"
         "Adopt **React 19 + TypeScript + Vite + Tailwind CSS Three-Workspace PWA**.\n"
         "- `/portal`: Voice-enabled copilot, self-help deflection, live ticket status and rating.\n"
         "- `/workbench`: War room, dynamic action bar, AI panel with RAG citations and leaf-safe RCA.\n"
         "- `/admin`: Interactive 19-node Service DAG canvas, cryptographic ledger verifier, and 40-ticket storm trigger.\n"
         "- Instant user-switching between 8 seeded campus accounts for seamless live demos.\n")
    ]

    for fname, text in adrs:
        path = adr_dir / fname
        path.write_text(text, encoding="utf-8")
        print(f"Generated {path}")

    print(f"Successfully generated all {len(adrs)} ADRs.")

if __name__ == "__main__":
    create_adrs()
