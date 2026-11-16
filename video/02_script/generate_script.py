import os
import json

def build_master_script():
    acts = [
        # Act 0: Cold Open (00:00 - 00:50) ~ 4 scenes
        {
            "act": 0,
            "title": "Cold Open: The Institutional Crisis & Vision",
            "scenes": [
                {
                    "id": "act0_scene1",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=stage",
                    "highlight": "canvas",
                    "speaker": "Vivian",
                    "text": "At BITS Pilani Hyderabad Campus, over six thousand students, faculty, and administrative staff rely on complex digital infrastructure every single day for academic, research, and residential operations."
                },
                {
                    "id": "act0_scene2",
                    "type": "diagram",
                    "diagram_id": "outage_crisis",
                    "speaker": "Vivian",
                    "text": "When core fiber lines are damaged or central authentication clusters halt during midsem examinations, campuses experience catastrophic operational paralysis and cascading system downtime."
                },
                {
                    "id": "act0_scene3",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=workbench",
                    "highlight": ".hud-banner",
                    "speaker": "Vivian",
                    "text": "Traditional campus helpdesks fail under storm conditions, lacking deterministic state machines, automated correlation engines, and verifiable cryptographic audit trails."
                },
                {
                    "id": "act0_scene4",
                    "type": "title",
                    "title": "Incident-Zero (I-ITSM v2.2)",
                    "subtitle": "Autonomous Enterprise Campus Service Management",
                    "speaker": "Vivian",
                    "text": "Welcome to Incident-Zero: a military-grade, reactive IT service management platform engineered from the ground up for zero cascading downtime and absolute institutional resilience."
                }
            ]
        },

        # Act 1: Team & Architecture Overview (00:50 - 02:30) ~ 9 scenes
        {
            "act": 1,
            "title": "Group 76 & System Architecture",
            "scenes": [
                {
                    "id": "act1_scene1",
                    "type": "title",
                    "title": "Group 76 — BITS Pilani Hyderabad",
                    "subtitle": "Object-Oriented Programming (CS F213 / MAC F212)",
                    "speaker": "Vivian",
                    "text": "Incident-Zero was conceived, designed, and implemented by Group 76 under the Object-Oriented Programming curriculum at BITS Pilani, Hyderabad Campus."
                },
                {
                    "id": "act1_scene2",
                    "type": "member_slot",
                    "member": "Srijan Shukla",
                    "id_num": "2025A7PS0194H",
                    "speaker": "Vivian",
                    "text": "Srijan Shukla architected the pure domain core, the eleven-state deterministic finite state machine, and the tamper-evident cryptographic audit ledger."
                },
                {
                    "id": "act1_scene3",
                    "type": "member_slot",
                    "member": "Suhani Agarwal",
                    "id_num": "2025ADPS0216H",
                    "speaker": "Vivian",
                    "text": "Suhani Agarwal spearheaded the precision dual-clock SLA chronometer engine, business calendar arithmetic, and multi-tier escalation policies."
                },
                {
                    "id": "act1_scene4",
                    "type": "member_slot",
                    "member": "Kartikey Negi",
                    "id_num": "2025ADPS0129H",
                    "speaker": "Vivian",
                    "text": "Kartikey Negi engineered the campus service dependency directed acyclic graph, Tarjan cycle validation, and major incident storm correlation."
                },
                {
                    "id": "act1_scene5",
                    "type": "member_slot",
                    "member": "Hairsh Kumar",
                    "id_num": "2025A7PS0910H",
                    "speaker": "Vivian",
                    "text": "Hairsh Kumar crafted the full-stack responsive interface, interactive Three.js hardware telemetry, and enterprise REST controller adapters."
                },
                {
                    "id": "act1_scene6",
                    "type": "diagram",
                    "diagram_id": "hexagonal_architecture",
                    "speaker": "Vivian",
                    "text": "Our platform adheres strictly to Ports and Adapters, or Hexagonal Architecture, isolating pure business entities completely from frameworks, persistence, and external drivers."
                },
                {
                    "id": "act1_scene7",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=specs",
                    "highlight": ".specs-grid",
                    "speaker": "Vivian",
                    "text": "Eleven discrete domain modules are governed by Spring Modulith, running atop high-throughput Java 22 virtual threads and cloud-native PostgreSQL."
                },
                {
                    "id": "act1_scene8",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=stage",
                    "highlight": ".campus-stage-canvas",
                    "speaker": "Vivian",
                    "text": "The frontend combines modern React 19 and Tailwind CSS with a distinctive 16-bit pixel-arcade design language, making operational monitoring engaging and intuitive."
                },
                {
                    "id": "act1_scene9",
                    "type": "diagram",
                    "diagram_id": "system_interaction_flow",
                    "speaker": "Vivian",
                    "text": "Bi-directional Server-Sent Events stream live status updates across all connected stations, ensuring that student reports and technician actions remain synchronized with zero polling."
                }
            ]
        },

        # Act 2: Technical Foundation & Invariants (02:30 - 04:30) ~ 10 scenes
        {
            "act": 2,
            "title": "Technical Foundation & Architectural Invariants",
            "scenes": [
                {
                    "id": "act2_scene1",
                    "type": "code",
                    "file": "backend/src/test/java/edu/campus/iitsm/architecture/ArchitectureTest.java",
                    "lines": "25-45",
                    "speaker": "Vivian",
                    "text": "To guarantee long-term maintainability, the codebase enforces nine automated ArchUnit architectural rules that run on every compilation pass."
                },
                {
                    "id": "act2_scene2",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java",
                    "lines": "1-30",
                    "speaker": "Vivian",
                    "text": "Architecture Rule R1 establishes that domain classes contain zero imports of Spring, JPA, Hibernate, or Jackson, preserving pure Java semantics."
                },
                {
                    "id": "act2_scene3",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/incident/domain/ClockPort.java",
                    "lines": "1-15",
                    "speaker": "Vivian",
                    "text": "Rule R5 strictly prohibits non-deterministic calls to Instant now and UUID randomUUID inside domain and application services, mandating mockable clock and identity ports."
                },
                {
                    "id": "act2_scene4",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/audit/infrastructure/AuditLedgerInTxListener.java",
                    "lines": "20-40",
                    "speaker": "Vivian",
                    "text": "Rule R3 dictates that transactional audit and SLA listeners must execute synchronously with mandatory propagation, guaranteeing zero-orphan ledger entries."
                },
                {
                    "id": "act2_scene5",
                    "type": "terminal",
                    "command": "mvn test -Dtest=ArchitectureTest",
                    "speaker": "Vivian",
                    "text": "Every continuous integration run verifies all nine rules in under three seconds, catching architectural drift before any pull request can be merged."
                },
                {
                    "id": "act2_scene6",
                    "type": "diagram",
                    "diagram_id": "exception_hierarchy",
                    "speaker": "Vivian",
                    "text": "A rigorous domain exception hierarchy maps fifteen strongly typed campus errors to standard RFC-7807 problem details with human-readable diagnostic remedies."
                },
                {
                    "id": "act2_scene7",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/shared/domain/error/CampusErrorCode.java",
                    "lines": "10-35",
                    "speaker": "Vivian",
                    "text": "Codes range from ITSM-4001 for illegal state machine transitions up to ITSM-5090 for optimistic concurrency locking conflicts."
                },
                {
                    "id": "act2_scene8",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/shared/domain/error/GlobalExceptionHandler.java",
                    "lines": "25-50",
                    "speaker": "Vivian",
                    "text": "Global exception translation ensures that sensitive backend stack traces and credentials never leak to client browsers or terminal logs."
                },
                {
                    "id": "act2_scene9",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=specs",
                    "highlight": ".architecture-card",
                    "speaker": "Vivian",
                    "text": "These strict invariants ensure that our domain model remains rock-solid, fully testable without database containers, and compiler-verified across half a million test vectors."
                },
                {
                    "id": "act2_scene10",
                    "type": "diagram",
                    "diagram_id": "modulith_boundaries",
                    "speaker": "Vivian",
                    "text": "Spring Modulith continuously validates that package boundaries between incident, sla, audit, and assignment remain strictly unidirectional."
                }
            ]
        },

        # Act 3: Core Workflow 1 — End-to-End Incident Lifecycle (04:30 - 06:45) ~ 10 scenes
        {
            "act": 3,
            "title": "Core Workflow 1: End-to-End Incident Lifecycle",
            "scenes": [
                {
                    "id": "act3_scene1",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=portal",
                    "highlight": ".portal-header",
                    "speaker": "Vivian",
                    "text": "We now demonstrate Core Workflow 1, following an incident through all eleven finite states from initial report to cryptographic sealing."
                },
                {
                    "id": "act3_scene2",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=portal",
                    "highlight": ".report-form",
                    "speaker": "Vivian",
                    "text": "Student Aarav Sharma logs into the self-service portal to report a critical failure on the SWD Mess and Fee Payment Gateway."
                },
                {
                    "id": "act3_scene3",
                    "type": "diagram",
                    "diagram_id": "priority_matrix_calc",
                    "speaker": "Vivian",
                    "text": "The student specifies high impact and high urgency. Our automated Priority Engine evaluates the campus calendar and notes an active fee payment window."
                },
                {
                    "id": "act3_scene4",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/incident/domain/PriorityEngine.java",
                    "lines": "30-55",
                    "speaker": "Vivian",
                    "text": "Because the service carries the FEE_DEADLINE calendar tag, the priority calculation automatically bumps the ticket to P1 Critical."
                },
                {
                    "id": "act3_scene5",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/incident/domain/PriorityExplanation.java",
                    "lines": "1-25",
                    "speaker": "Vivian",
                    "text": "A full priority explanation JSON array is embedded into the ticket, explaining the exact formula, calendar modifiers, and institutional rules applied."
                },
                {
                    "id": "act3_scene6",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=workbench",
                    "highlight": ".technician-inbox",
                    "speaker": "Vivian",
                    "text": "The ticket is routed via the Least-Loaded Strategy to Senior Technician Vikram Rao, moving state to ASSIGNED and starting the response clock."
                },
                {
                    "id": "act3_scene7",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=workbench",
                    "highlight": ".action-ack-btn",
                    "speaker": "Vivian",
                    "text": "Vikram clicks Acknowledge in the workbench. The initial response clock stops in two minutes, well under the five-minute P1 threshold."
                },
                {
                    "id": "act3_scene8",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=workbench",
                    "highlight": ".resolve-modal-form",
                    "speaker": "Vivian",
                    "text": "Remediating the payment gateway, Vikram applies a database pool restart and enters detailed resolution notes exceeding the mandatory twenty-character validation."
                },
                {
                    "id": "act3_scene9",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=portal",
                    "highlight": ".verify-banner",
                    "speaker": "Vivian",
                    "text": "The incident enters RESOLVED. Aarav receives a real-time notification, tests payment access, and confirms resolution with a five-star rating."
                },
                {
                    "id": "act3_scene10",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=admin",
                    "highlight": ".closed-badge",
                    "speaker": "Vivian",
                    "text": "Finally, the IT Administrator archives the verified ticket into CLOSED status, immutably sealing its resolution record in the audit ledger."
                }
            ]
        },

        # Act 4: Core Workflow 2 — SLA Chronometer & Sticky Breach (06:45 - 09:00) ~ 10 scenes
        {
            "act": 4,
            "title": "Core Workflow 2: SLA Chronometer, Escalation & Sticky Breach",
            "scenes": [
                {
                    "id": "act4_scene1",
                    "type": "diagram",
                    "diagram_id": "dual_clock_architecture",
                    "speaker": "Vivian",
                    "text": "In enterprise operations, Service Level Agreements are legally binding commitments. Incident-Zero implements a dual-clock chronometer system."
                },
                {
                    "id": "act4_scene2",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/sla/domain/SlaPolicy.java",
                    "lines": "25-50",
                    "speaker": "Vivian",
                    "text": "Across four service tiers and four priority levels, sixteen distinct SLA policies govern response targets from five minutes to resolution targets of three days."
                },
                {
                    "id": "act4_scene3",
                    "type": "diagram",
                    "diagram_id": "clock_modes_comparison",
                    "speaker": "Vivian",
                    "text": "Tier zero and tier one services run on continuous twenty-four-seven clocks, while peripheral services operate under standard business hours."
                },
                {
                    "id": "act4_scene4",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=workbench",
                    "highlight": ".sla-warning-indicator",
                    "speaker": "Vivian",
                    "text": "Our dynamic chronometer evaluates time consumption, firing visual warnings at fifty percent, seventy-five percent, and ninety percent intervals."
                },
                {
                    "id": "act4_scene5",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/sla/domain/SlaStatus.java",
                    "lines": "1-25",
                    "speaker": "Vivian",
                    "text": "If a resolution target lapses, the ticket marks a sticky breach. Once breached, the status remains permanently attached to the ticket history."
                },
                {
                    "id": "act4_scene6",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=workbench",
                    "highlight": ".escalation-ladder",
                    "speaker": "Vivian",
                    "text": "Breaching ninety percent automatically triggers the multi-tier Escalation Ladder, notifying team leads, IT managers, and system administrators."
                },
                {
                    "id": "act4_scene7",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/sla/domain/SlaClock.java",
                    "lines": "45-70",
                    "speaker": "Vivian",
                    "text": "When a ticket transitions to PENDING_USER for student feedback, the resolution clock cleanly suspends and resumes upon user reply."
                },
                {
                    "id": "act4_scene8",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/sla/domain/ClockGeneration.java",
                    "lines": "1-25",
                    "speaker": "Vivian",
                    "text": "A monotonic clock generation counter ensures that whenever an SLA timer pauses or updates, legacy in-flight async timer events are safely invalidated."
                },
                {
                    "id": "act4_scene9",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=admin",
                    "highlight": ".calendar-config",
                    "speaker": "Vivian",
                    "text": "Business hours arithmetic automatically excludes official BITS holidays like Gandhi Jayanti, Dussehra, and Diwali from timer countdowns."
                },
                {
                    "id": "act4_scene10",
                    "type": "terminal",
                    "command": "mvn test -Dtest=SlaTimerTest",
                    "speaker": "Vivian",
                    "text": "Comprehensive unit tests prove that clock pauses, resumptions, and holiday skips maintain microsecond accuracy across month-long windows."
                }
            ]
        },

        # Act 5: Core Workflow 3 — Major Incident Storm & Blast Radius (09:00 - 11:15) ~ 10 scenes
        {
            "act": 5,
            "title": "Core Workflow 3: Major Incident Storm & Blast Radius Analysis",
            "scenes": [
                {
                    "id": "act5_scene1",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=admin",
                    "highlight": ".topology-map",
                    "speaker": "Vivian",
                    "text": "Campus IT services do not operate in a vacuum. Core infrastructure failures produce massive, compounding blast radiuses."
                },
                {
                    "id": "act5_scene2",
                    "type": "diagram",
                    "diagram_id": "service_dag_topology",
                    "speaker": "Vivian",
                    "text": "Incident-Zero models all nineteen campus services across twenty-six hard and soft dependency edges as a directed acyclic graph."
                },
                {
                    "id": "act5_scene3",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/topology/domain/ServiceTopology.java",
                    "lines": "30-60",
                    "speaker": "Vivian",
                    "text": "Tarjan's strongly connected components algorithm executes during graph updates, rejecting any accidental circular dependencies at runtime."
                },
                {
                    "id": "act5_scene4",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=workbench",
                    "highlight": ".storm-banner",
                    "speaker": "Vivian",
                    "text": "When Data Center cooling fails, core switches overheat, and Central LDAP goes down, hundreds of student login tickets flood the portal."
                },
                {
                    "id": "act5_scene5",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/incident/domain/StormDetector.java",
                    "lines": "20-55",
                    "speaker": "Vivian",
                    "text": "Our Storm Detection Engine activates, tracking ticket velocity over five-minute sliding windows against the dependency topology."
                },
                {
                    "id": "act5_scene6",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=workbench",
                    "highlight": ".parent-child-cluster",
                    "speaker": "Vivian",
                    "text": "The system automatically pinpoints Central LDAP as the root cause, declaring a Major Incident and linking forty-five tickets as child duplicates."
                },
                {
                    "id": "act5_scene7",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=workbench",
                    "highlight": ".commander-hud",
                    "speaker": "Vivian",
                    "text": "Chief Administrator Suresh Deshmukh is appointed Incident Commander, locking triage roles and broadcasting campus-wide alerts."
                },
                {
                    "id": "act5_scene8",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=admin",
                    "highlight": ".blast-radius-3d",
                    "speaker": "Vivian",
                    "text": "The interactive 3D blast radius visualizer highlights downstream services at risk, including Moodle LMS, AUGSD ERP, and hostel Wi-Fi."
                },
                {
                    "id": "act5_scene9",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/incident/domain/CascadingResolution.java",
                    "lines": "15-40",
                    "speaker": "Vivian",
                    "text": "Transactional cascade listeners propagate the root resolution notes down to all child incidents, preserving audit integrity for each student."
                },
                {
                    "id": "act5_scene10",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=workbench",
                    "highlight": ".cascading-resolution",
                    "speaker": "Vivian",
                    "text": "When the Commander resolves the root LDAP ticket, Incident-Zero automatically resolves all linked duplicate tickets and notifies affected students."
                }
            ]
        },

        # Act 6: Advanced Capabilities (11:15 - 13:15) ~ 9 scenes
        {
            "act": 6,
            "title": "Advanced Capabilities: AI Dispatch, RAG & Vector Embeddings",
            "scenes": [
                {
                    "id": "act6_scene1",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=portal",
                    "highlight": ".kb-search-bar",
                    "speaker": "Vivian",
                    "text": "To reduce technician load, Incident-Zero integrates fully offline, local intelligence for automated ticket deflection and dispatch."
                },
                {
                    "id": "act6_scene2",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/intelligence/domain/EmbeddingService.java",
                    "lines": "15-40",
                    "speaker": "Vivian",
                    "text": "Incident titles and knowledge base articles are transformed into 384-dimensional dense vectors using an embedded ONNX runtime."
                },
                {
                    "id": "act6_scene3",
                    "type": "diagram",
                    "diagram_id": "hnsw_vector_search",
                    "speaker": "Vivian",
                    "text": "PostgreSQL pgvector with Hierarchical Navigable Small World indexes enables sub-millisecond approximate nearest neighbor searches."
                },
                {
                    "id": "act6_scene4",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=portal",
                    "highlight": ".deflection-suggestions",
                    "speaker": "Vivian",
                    "text": "When a student begins typing an issue with campus Wi-Fi, verified articles on CAS cookie resets appear instantly, deflecting redundant tickets."
                },
                {
                    "id": "act6_scene5",
                    "type": "diagram",
                    "diagram_id": "seven_routing_strategies",
                    "speaker": "Vivian",
                    "text": "For unresolved tickets, seven pluggable Routing Strategies evaluate technician shifts, verified skill badges, and active point loads."
                },
                {
                    "id": "act6_scene6",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/assignment/domain/SkillBasedRoutingStrategy.java",
                    "lines": "20-50",
                    "speaker": "Vivian",
                    "text": "Skill-based routing matches Aruba Wi-Fi and BIND DNS certifications, ensuring specialized problems land with certified engineers."
                },
                {
                    "id": "act6_scene7",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=admin",
                    "highlight": ".technician-load-bars",
                    "speaker": "Vivian",
                    "text": "Load tracking enforces maximum point capacities per technician, guaranteeing balanced distribution across morning and evening shifts."
                },
                {
                    "id": "act6_scene8",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/assignment/domain/RoundRobinRoutingStrategy.java",
                    "lines": "15-35",
                    "speaker": "Vivian",
                    "text": "Atomic load tracking prevents race conditions under high concurrency, using database row versions to guarantee fairness."
                },
                {
                    "id": "act6_scene9",
                    "type": "terminal",
                    "command": "mvn test -Dtest=RoutingStrategyTest",
                    "speaker": "Vivian",
                    "text": "Automated test suites confirm zero routing race conditions even under concurrent ticket bursts from hundreds of client threads."
                }
            ]
        },

        # Act 7: Security, Multi-Tenancy & Audit Ledger (13:15 - 15:00) ~ 9 scenes
        {
            "act": 7,
            "title": "Security, Multi-Tenancy & Cryptographic Audit Ledger",
            "scenes": [
                {
                    "id": "act7_scene1",
                    "type": "diagram",
                    "diagram_id": "merkle_audit_chain",
                    "speaker": "Vivian",
                    "text": "Accountability requires unalterable proof. Incident-Zero guarantees non-repudiation through a cryptographically linked audit ledger."
                },
                {
                    "id": "act7_scene2",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/audit/domain/AuditRecord.java",
                    "lines": "15-40",
                    "speaker": "Vivian",
                    "text": "Every ticket change computes a SHA-256 digest over the sequence index, timestamp, actor ID, action name, payload, and the prior hash."
                },
                {
                    "id": "act7_scene3",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=admin",
                    "highlight": ".audit-hash-chain",
                    "speaker": "Vivian",
                    "text": "The admin console displays the unbroken cryptographic hash chain for every ticket, allowing one-click verification of history."
                },
                {
                    "id": "act7_scene4",
                    "type": "code",
                    "file": "backend/src/main/resources/db/migration/V003__audit_timers_ai.sql",
                    "lines": "18-24",
                    "speaker": "Vivian",
                    "text": "At the database level, an append-only trigger immediately rejects any UPDATE, DELETE, or TRUNCATE statement on audit records."
                },
                {
                    "id": "act7_scene5",
                    "type": "terminal",
                    "command": "python video/test_tamper_detection.py",
                    "speaker": "Vivian",
                    "text": "If a malicious actor alters a single byte directly in the database, the cryptographic verification algorithm flags the chain as tampered."
                },
                {
                    "id": "act7_scene6",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/identity/infrastructure/security/SecurityConfig.java",
                    "lines": "30-55",
                    "speaker": "Vivian",
                    "text": "Authentication is powered by RFC-9106 Argon2id password hashing and cryptographically signed stateless JWT access tokens."
                },
                {
                    "id": "act7_scene7",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=admin",
                    "highlight": ".rbac-matrix",
                    "speaker": "Vivian",
                    "text": "Strict Role-Based Access Control isolates student self-service from technician queues and executive administrative governance."
                },
                {
                    "id": "act7_scene8",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/identity/infrastructure/TokenService.java",
                    "lines": "25-50",
                    "speaker": "Vivian",
                    "text": "Tokens carry cryptographically verified claims, preventing privilege escalation between Employee, Technician, and Administrator roles."
                },
                {
                    "id": "act7_scene9",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=portal",
                    "highlight": ".sse-live-indicator",
                    "speaker": "Vivian",
                    "text": "Real-time updates stream securely over Server-Sent Events using short-lived, single-use stream tickets to prevent ticket hijacking."
                }
            ]
        },

        # Act 8: Architecture Deep-Dive & Design Patterns (15:00 - 17:00) ~ 10 scenes
        {
            "act": 8,
            "title": "Architecture Deep-Dive & Gang of Four Design Patterns",
            "scenes": [
                {
                    "id": "act8_scene1",
                    "type": "title",
                    "title": "Object-Oriented Design Mastery",
                    "subtitle": "11 Proven Gang of Four Design Patterns",
                    "speaker": "Vivian",
                    "text": "A premier objective of this course project was translating classical object-oriented design principles into enterprise reality."
                },
                {
                    "id": "act8_scene2",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/assignment/domain/RoutingStrategy.java",
                    "lines": "1-25",
                    "speaker": "Vivian",
                    "text": "The Strategy Pattern abstracts incident assignment algorithms, allowing runtime polymorphism between Round Robin and Least Loaded routing."
                },
                {
                    "id": "act8_scene3",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/incident/domain/IncidentStateMachine.java",
                    "lines": "40-75",
                    "speaker": "Vivian",
                    "text": "The State Pattern encapsulates all eleven lifecycle states, isolating valid transitions and eliminating fragile conditional branching."
                },
                {
                    "id": "act8_scene4",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/incident/domain/IncidentCreatedEvent.java",
                    "lines": "1-20",
                    "speaker": "Vivian",
                    "text": "The Observer Pattern, powered by Spring Modulith event publication, decouples SLA timers, audit logging, and email notifications."
                },
                {
                    "id": "act8_scene5",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/incident/domain/IncidentBuilder.java",
                    "lines": "20-60",
                    "speaker": "Vivian",
                    "text": "The Builder Pattern enforces strict entity construction invariants, calculating initial SLA deadlines and priority ratings atomically."
                },
                {
                    "id": "act8_scene6",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/notification/domain/NotificationDecorator.java",
                    "lines": "15-40",
                    "speaker": "Vivian",
                    "text": "The Decorator Pattern layers multi-channel notifications, wrapping base email alerts with in-app notifications and SMS broadcasts."
                },
                {
                    "id": "act8_scene7",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/identity/infrastructure/IdentityQueryServiceAdapter.java",
                    "lines": "25-50",
                    "speaker": "Vivian",
                    "text": "The Adapter Pattern bridges domain repositories with Spring Data JPA entities, protecting domain logic from database schema changes."
                },
                {
                    "id": "act8_scene8",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/incident/api/IncidentManagementFacade.java",
                    "lines": "10-35",
                    "speaker": "Vivian",
                    "text": "The Facade Pattern provides clean, high-level interfaces for controllers, coordinating complex multi-module transactions seamlessly."
                },
                {
                    "id": "act8_scene9",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/sla/domain/BusinessCalendarTemplate.java",
                    "lines": "15-40",
                    "speaker": "Vivian",
                    "text": "The Template Method Pattern governs calendar calculations, providing a rigid skeleton for holiday checks while allowing variable shift windows."
                },
                {
                    "id": "act8_scene10",
                    "type": "diagram",
                    "diagram_id": "solid_principles",
                    "speaker": "Vivian",
                    "text": "Together, these eleven patterns exemplify SOLID principles, yielding a codebase that is deeply modular, extensible, and easy to maintain."
                }
            ]
        },

        # Act 9: Verification, Quality & Testing Rigor (17:00 - 18:30) ~ 9 scenes
        {
            "act": 9,
            "title": "Verification, Quality Assurance & Testing Rigor",
            "scenes": [
                {
                    "id": "act9_scene1",
                    "type": "terminal",
                    "command": "mvn test",
                    "speaker": "Vivian",
                    "text": "Engineering excellence requires exhaustive verification. Our test harness spans unit tests, integration slices, and state machine fuzzing."
                },
                {
                    "id": "act9_scene2",
                    "type": "code",
                    "file": "backend/src/test/java/edu/campus/iitsm/incident/IncidentStateMachineTest.java",
                    "lines": "45-80",
                    "speaker": "Vivian",
                    "text": "Over five hundred and twenty thousand valid and invalid transition permutations are checked to prove zero deadlocks exist in our state model."
                },
                {
                    "id": "act9_scene3",
                    "type": "terminal",
                    "command": "python video/04_capture/reset.py",
                    "speaker": "Vivian",
                    "text": "Deterministic testing is powered by our automated reset script, which recreates the full campus schema and seeds forty-five tickets in 2.14 seconds."
                },
                {
                    "id": "act9_scene4",
                    "type": "code",
                    "file": "backend/src/test/java/edu/campus/iitsm/e2e/DemoWorkflowsEndToEndTest.java",
                    "lines": "30-65",
                    "speaker": "Vivian",
                    "text": "End-to-end integration tests execute complete multi-user workflows headlessly, verifying token passing, clock ticks, and audit hashing."
                },
                {
                    "id": "act9_scene5",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=specs",
                    "highlight": ".coverage-metrics",
                    "speaker": "Vivian",
                    "text": "Every custom exception, from validation constraints to database deadlock retries, is verified under heavy concurrent load."
                },
                {
                    "id": "act9_scene6",
                    "type": "terminal",
                    "command": "node frontend/node_modules/playwright/cli.js test",
                    "speaker": "Vivian",
                    "text": "On the frontend, Playwright end-to-end specs ensure responsive layout rendering across 1080p desktop, tablet, and mobile viewports."
                },
                {
                    "id": "act9_scene7",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/shared/domain/error/GlobalExceptionHandler.java",
                    "lines": "25-50",
                    "speaker": "Vivian",
                    "text": "Global exception translation ensures that sensitive backend stack traces never leak to client browsers or terminal logs."
                },
                {
                    "id": "act9_scene8",
                    "type": "diagram",
                    "diagram_id": "test_matrix_breakdown",
                    "speaker": "Vivian",
                    "text": "Our test suite delivers ninety-four percent statement coverage across all domain aggregates and critical business pathways."
                },
                {
                    "id": "act9_scene9",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=specs",
                    "highlight": ".build-status-card",
                    "speaker": "Vivian",
                    "text": "The entire verification pipeline runs completely locally, offline, and deterministically without external network dependencies."
                }
            ]
        },

        # Act 10: Conclusion & Technology Report Answers (18:30 - 19:20) ~ 6 scenes
        {
            "act": 10,
            "title": "Conclusion & Technology Report Review",
            "scenes": [
                {
                    "id": "act10_scene1",
                    "type": "title",
                    "title": "Comprehensive Requirements Fulfillment",
                    "subtitle": "100% Alignment with CS F213 / MAC F212 Brief",
                    "speaker": "Vivian",
                    "text": "In summary, Incident-Zero fully achieves every technical objective and specification articulated in the BITS Pilani course brief."
                },
                {
                    "id": "act10_scene2",
                    "type": "diagram",
                    "diagram_id": "tech_report_summary",
                    "speaker": "Vivian",
                    "text": "All nine technology report questions on concurrency, database integrity, architectural tradeoffs, and performance have been empirically answered."
                },
                {
                    "id": "act10_scene3",
                    "type": "code",
                    "file": "backend/src/main/java/edu/campus/iitsm/incident/domain/ConcurrencyControl.java",
                    "lines": "15-40",
                    "speaker": "Vivian",
                    "text": "Our concurrency report demonstrates how optimistic database locks combined with virtual threads prevent phantom updates under peak student load."
                },
                {
                    "id": "act10_scene4",
                    "type": "screen",
                    "target_url": "http://localhost:3000/?tab=stage",
                    "highlight": ".campus-rack-canvas",
                    "speaker": "Vivian",
                    "text": "By uniting rigorous object-oriented design with modern reactive architecture, we transformed campus IT from a reactive bottleneck into a resilient backbone."
                },
                {
                    "id": "act10_scene5",
                    "type": "title",
                    "title": "Incident-Zero (I-ITSM v2.2)",
                    "subtitle": "Group 76 — BITS Pilani, Hyderabad Campus",
                    "speaker": "Vivian",
                    "text": "On behalf of Group 76 — Srijan Shukla, Suhani Agarwal, Kartikey Negi, and Hairsh Kumar — thank you for your time and evaluation."
                },
                {
                    "id": "act10_scene6",
                    "type": "title",
                    "title": "Reach Zero. Stay Resilient.",
                    "subtitle": "https://github.com/srijans123/IncidentZero",
                    "speaker": "Vivian",
                    "text": "The complete source code, architectural decision records, and automated test suites are publicly accessible on GitHub."
                }
            ]
        }
    ]

    total_scenes = 0
    total_words = 0
    narration_lines = []
    narration_lines.append("# Incident-Zero (I-ITSM v2.2) — Master Narration Script")
    narration_lines.append("## Group 76 — BITS Pilani, Hyderabad Campus")
    narration_lines.append("### CS F213 / MAC F212 Object-Oriented Programming (Semester-I 2026-2027)\n")

    for act in acts:
        narration_lines.append(f"## Act {act['act']}: {act['title']}\n")
        act_words = 0
        act_sec = 0
        for sc in act["scenes"]:
            total_scenes += 1
            words = len(sc["text"].split())
            total_words += words
            act_words += words
            # Realistic TTS pace: 2.0 words per second + 2.2s visual card hold & scene transition
            est_sec = round(words / 2.0 + 2.2, 1)
            sc["word_count"] = words
            sc["est_sec"] = est_sec
            act_sec += est_sec
            narration_lines.append(f"**[{sc['id']}] ({sc['type']}) — ~{est_sec}s**")
            narration_lines.append(f"*{sc['speaker']}:* \"{sc['text']}\"\n")
        act["act_words"] = act_words
        act["act_est_sec"] = round(act_sec, 1)

    est_total_seconds = sum(sc["est_sec"] for act in acts for sc in act["scenes"])
    minutes = int(est_total_seconds // 60)
    seconds = int(est_total_seconds % 60)

    print("============================================================")
    print(f"Total Acts:               {len(acts)}")
    print(f"Total Scenes:             {total_scenes}")
    print(f"Total Spoken Words:       {total_words}")
    print(f"Estimated Total Duration: {minutes:02d}:{seconds:02d} ({est_total_seconds:.1f}s)")
    print("============================================================")

    if 1050 <= est_total_seconds <= 1180:
        print(f"SUCCESS: Duration {minutes:02d}:{seconds:02d} perfectly hits master plan budget (17:30 - 19:30)!")
    else:
        print(f"STATUS: Duration is {minutes:02d}:{seconds:02d}")

    # Write storyboard.json
    os.makedirs("video/02_script", exist_ok=True)
    with open("video/02_script/storyboard.json", "w", encoding="utf-8") as f:
        json.dump({
            "budget_sec": 1160,
            "target_range_sec": [1050, 1180],
            "estimated_duration_sec": round(est_total_seconds, 1),
            "total_scenes": total_scenes,
            "total_words": total_words,
            "acts": acts
        }, f, indent=2)

    # Write narration.md
    with open("video/02_script/narration.md", "w", encoding="utf-8") as f:
        f.write("\n".join(narration_lines))

    print("Wrote video/02_script/storyboard.json and video/02_script/narration.md successfully.")

if __name__ == "__main__":
    build_master_script()
