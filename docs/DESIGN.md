# System Design Document — Incident-Zero (I-ITSM v2.2)

## 1. Architectural Architecture: Hexagonal Modular Monolith
The Incident-Zero platform follows the **Hexagonal Architecture (Ports and Adapters)** pattern organized as a **Spring Modulith**:
- **Domain Ring (`edu.campus.iitsm.*.domain`)**:
  - Pure Java 21/25 with zero external frameworks (no Spring, no Hibernate/JPA, no Jackson).
  - Contains core aggregates, value objects, domain events, domain error hierarchies, and port interfaces.
  - Enforced by ArchUnit Rule `R1`.
- **Application Ring (`edu.campus.iitsm.*.application`)**:
  - Implements use case orchestration, inbound ports, strategy resolvers, and transactional pipelines.
  - Spring-managed beans (`@Service`, `@Component`). Inter-module dependencies are explicitly mediated via `@NamedInterface("api")`.
  - Enforced by Spring Modulith `verify()` and ArchUnit Rules `R2`–`R5`.
- **Infrastructure Ring (`edu.campus.iitsm.*.infrastructure`)**:
  - Outbound adapters: PostgreSQL repositories (Spring Data JPA), Better Auth / JWT security filters, ONNX Runtime inference, SSE stream hubs, SMTP email simulators.

---

## 2. The 11-State Sealed State Machine (`IncidentState`)
The core `Incident` aggregate delegates lifecycle transitions to a sealed hierarchy of 11 record states:
```
                    ┌──────────────┐
                    │     NEW      │
                    └──────┬───────┘
                           │ classify
                    ┌──────▼───────┐
             ┌─────►│  CLASSIFIED  │◄─────┐
             │      └──────┬───────┘      │
             │             │ assign       │
             │      ┌──────▼───────┐      │
             │      │   ASSIGNED   │      │
             │      └──────┬───────┘      │
             │             │ acknowledge  │
             │      ┌──────▼───────┐      │
             │      │ ACKNOWLEDGED │      │
             │      └──────┬───────┘      │
             │             │ startWork    │
             │      ┌──────▼───────┐      │
             │  ┌──►│ IN_PROGRESS  ├──┐   │
             │  │   └──────┬───────┘  │   │
  reassign   │  │ resume   │ pause    │   │
  to team    │  │   ┌──────▼───────┐  │   │
             │  └───┤ PENDING_USER │  │   │
             │      │PENDING_VENDOR│  │   │
             │      └──────────────┘  │   │
             │             │ resolve  │   │
             │      ┌──────▼───────┐  │   │
             │      │   RESOLVED   │◄─┘   │
             │      └──────┬───────┘      │
             │             │ verify / timeout
             │      ┌──────▼───────┐      │
             │      │   VERIFIED   │      │
             │      └──────┬───────┘      │
             │             │ close        │
             │      ┌──────▼───────┐      │
             │      │    CLOSED    │      │
             │      └──────────────┘      │
             │             │ reopen       │
             │      ┌──────▼───────┐      │
             └──────┤   REOPENED   ├──────┘
                    └──────────────┘
```

### Transition Guards:
- **`NEW -> CLASSIFIED`**: Requires `categoryId`, `Priority`, `SlaPolicy`, and `PriorityExplanation`.
- **`CLASSIFIED -> ASSIGNED`**: Requires active `technicianId` within capacity limits. Starts `responseClock`.
- **`ASSIGNED -> ACKNOWLEDGED`**: Invoked by assigned technician. Evaluates `responseClock` breach and stops response clock.
- **`IN_PROGRESS <-> PENDING_USER / PENDING_VENDOR`**: Pauses both response and resolution SLA clocks; records pause reason.
- **`IN_PROGRESS -> RESOLVED`**: Requires `Resolution` record (root cause, fix note). Stops resolution clock and evaluates breach.
- **`RESOLVED -> REOPENED`**: Permitted within 48-hour reopen window if satisfaction is negative or issue recurs.

---

## 3. Dual Pause-Aware SLA State Machine (`SlaClock`)
Every incident maintains two independent `SlaClock` value objects:
1. **`responseClock`**: Tracks time until technician acknowledges.
2. **`resolutionClock`**: Tracks time until incident is resolved.

### States:
- `RUNNING`: Consuming business hours from `WorkingTimeCalculator`.
- `PAUSED`: Frozen while awaiting external action (`PENDING_USER`, `PENDING_VENDOR`).
- `STOPPED`: Finalized upon completion.

### Sticky Breach Evaluation:
If `stopResponse` or `stopResolution` occurs after the target deadline, the clock status is recorded as breached and the aggregate `slaStatus` is permanently latched to `BREACHED`. Subsequent background ticks never un-breach an incident.

---

## 4. Cryptographic Audit Ledger & Canonical Hasher
Every state transition, assignment, or priority change publishes a domain event persisted to the `audit_record` table.
- **Hash Algorithm:** SHA-256 over canonical JSON representation:
  ```
  Hash_n = SHA-256(RecordId_n || Timestamp_n || ActorId_n || EventType_n || CanonicalJson(Payload_n) || Hash_{n-1})
  ```
- **Genesis Hash:** `0000000000000000000000000000000000000000000000000000000000000000`
- **Database Immutability:** PostgreSQL triggers prevent `UPDATE`, `DELETE`, or `TRUNCATE` operations on `audit_record`.
- **Offsite Anchoring:** Daily Merkle root anchors are logged to append-only `/var/log/iitsm/ledger_anchors.jsonl`.

---

## 5. UI Design System & Wire Contracts
The frontend client provides role-tailored experiences using a curated dark-mode palette (`#0F172A` Slate base, `#6366F1` Indigo accents, `#10B981` Emerald SLA indicators, `#EF4444` Rose breach alerts):
- **`/portal` (Employee Workspace)**:
  - Guided conversational intake copilot.
  - Active ticket tracker with real-time SSE stage indicators.
  - One-click resolution verification and feedback submission.
- **`/workbench` (Technician War Room)**:
  - Prioritized work queue with live SLA countdown timers.
  - Interactive ticket inspection drawer with AI duplicate links, recommended resolutions (RAG), and category suggestions.
  - One-click transitions: Acknowledge, Start Investigation, Pause (with reason), Resolve.
- **`/admin` (Operations & Governance)**:
  - Interactive 19-node Service Dependency DAG rendered with `@xyflow/react`.
  - Cryptographic Audit Ledger Verifier with live tampering detection demo.
  - 40-Ticket Ticket Storm Simulator (`ERP_LDAP_POOL_EXHAUSTION`) and Root Cause Analysis visualization.
