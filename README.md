<div align="center">

![Incident-Zero Banner](assets/banner.svg)

# INCIDENT-ZERO (I-ITSM v2.2)
### Autonomous Mission-Critical IT Service Management & Hardware Telemetry Engine
**BITS Pilani, Hyderabad Campus (BPHC) — Computer Centre & Information Technology (CCIT)**

[![Java 21](https://img.shields.io/badge/Java-21%20LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React 19](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL_60fps-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![ArchUnit](https://img.shields.io/badge/ArchUnit-R1--R9_Strict-blue?style=for-the-badge)](https://www.archunit.org/)
[![FSM Verified](https://img.shields.io/badge/FSM_Transitions-520%2C036_Verified-success?style=for-the-badge)](https://github.com/srijans123/IncidentZero)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

<br/>

> **"Reach Zero Open Incidents. Zero AI-Slop. Zero Framework Leakage."**  
> An uncompromising, hexagonal enterprise ITSM engine engineered for campus scale, combining a **Pure JDK 21 Domain Core**, **Immutable Cryptographic Audit Ledger**, **$O(V^3)$ Kuhn-Munkres Optimal Dispatch**, **19-Node Topological Dependency DAG**, **Procedural WebGL 3D Server Blade Telemetry**, and a **Retro Pixel-Arcade Visual Aesthetic** with procedural 8-bit chiptune audio.

<br/>

### 🕹️ Live Deployments & Exploration
| Destination | URL / Entry Point | Description |
|:---|:---|:---|
| **🕹️ Live Pixel Arcade & Stage** | [srijans123.github.io/IncidentZero/landing.html](https://srijans123.github.io/IncidentZero/landing.html) | Playable 8-bit campus stage, chiptune soundboard, 4 atmospheric skies, CRT toggle |
| **🚀 Mission Control Workspace** | [srijans123.github.io/IncidentZero/](https://srijans123.github.io/IncidentZero/) | Full 5-cartridge command center (Portal, Technician Workbench, Admin NOC, 3D Racks) |
| **📦 GitHub Repository** | [github.com/srijans123/IncidentZero](https://github.com/srijans123/IncidentZero) | Complete source code, Docker configs, verified test suites, and technical specs |

</div>

![Section Divider](assets/divider.svg)

## 📑 Table of Contents
1. [Architectural Master Philosophy](#1-architectural-master-philosophy)
2. [5 Swappable ROM Cartridges](#2-5-swappable-rom-cartridges)
3. [Compiler-Guarded 10-State FSM & Cryo-Stasis](#3-compiler-guarded-10-state-fsm--cryo-stasis)
4. [AI Proposes, Deterministic Core Disposes](#4-ai-proposes-deterministic-core-disposes)
5. [Immutable SHA-256 Cryptographic Audit Ledger](#5-immutable-sha-256-cryptographic-audit-ledger)
6. [Kuhn-Munkres $O(V^3)$ Optimal Technician Dispatch](#6-kuhn-munkres-ov3-optimal-technician-dispatch)
7. [19-Node Campus Dependency DAG & Leaf-Safe RCA](#7-19-node-campus-dependency-dag--leaf-safe-rca)
8. [40-Ticket Outage Storm & Reciprocal Rank Fusion (RRF)](#8-40-ticket-outage-storm--reciprocal-rank-fusion-rrf)
9. [Procedural 3D Weaponized Telemetry (img2threejs)](#9-procedural-3d-weaponized-telemetry-img2threejs)
10. [Web Audio Chiptune Synthesizer & 4 Skies Engine](#10-web-audio-chiptune-synthesizer--4-skies-engine)
11. [8 Seeded Test Personas & Security RBAC](#11-8-seeded-test-personas--security-rbac)
12. [Project Layout & Directory Hierarchy](#12-project-layout--directory-hierarchy)
13. [Quickstart & Verification Runbook](#13-quickstart--verification-runbook)

![Section Divider](assets/divider.svg)

## 1. Architectural Master Philosophy

Incident-Zero is built upon the **Ports & Adapters (Hexagonal) Architecture** governed by strict compiler-enforced invariants (ArchUnit R1–R9). It completely decouples enterprise business rules from any web framework, database engine, or AI model.

![Hexagonal Modular Architecture](assets/architecture.svg)

### 🛡️ ArchUnit Invariants (R1 – R9)
The `backend/src/test/java/edu/campus/iitsm/architecture/ArchitectureTest.java` suite continuously enforces 9 non-negotiable architectural axioms:
* **R1 (Zero Framework Leakage):** The `..domain..` package has **ZERO** imports from Spring, Jakarta/JPA, Hibernate, or Jackson. It is 100% pure JDK 21.
* **R2 (Inversion of Control):** Application and Infrastructure layers depend strictly inward upon Domain Ports; Domain never references outer layers.
* **R3 (Immutable Event Value Objects):** All domain events are pure Java records with non-null, immutable payloads.
* **R4 (Transactional Audit Spine):** Audit listeners (`AuditLedgerInTxListener`) MUST execute with `@EventListener` + `@Transactional(propagation = Propagation.MANDATORY)`. If an audit log write fails, the entire business transaction rolls back.
* **R5 (Deterministic Time & Identity):** Never call `Instant.now()` or `UUID.randomUUID()` inside `domain` or `application`. All temporal and identity operations are injected via `ClockPort` and `IdGeneratorPort` to guarantee 100% deterministic unit testing and replayability.
* **R6 (FSM Encapsulation):** Incident status transitions cannot be modified via getters/setters or raw database updates; every lifecycle step MUST pass through `Incident.transitionTo(...)`.
* **R7 (Optimistic Concurrency Control):** All incident entities maintain an atomic `@Version` counter. Simultaneous technician edits reject stale revisions with HTTP 409 Conflict.
* **R8 (Polynomial Complexity Bound):** Hungarian assignment algorithm execution is strictly bounded to $O(V^3)$ time and $O(V^2)$ memory space.
* **R9 (Acyclic Topological Dependency):** The campus service graph is mathematically validated against cyclic dependencies via Kahn's Algorithm before dispatch execution.

![Section Divider](assets/divider.svg)

## 2. 5 Swappable ROM Cartridges

Instead of a generic, uninspired administrative dashboard, Incident-Zero presents its capabilities through **5 Physical ROM Cartridges**, reflecting physical arcade cartridge architecture with instant slot-switching, tactile click audio, and specialized responsibilities:

![5 Physical ROM Cartridges](assets/cartridges.svg)

### 🕹️ Cartridge 00: Stage (Landing & Showcase)
* **Route:** `/landing.html`
* **Purpose:** Public-facing pixel-arcade overview of the BPHC campus IT network. Features an interactive 8-bit campus map, live SLA heart meters, real-time ticket statistics, CRT scanline toggles, and chiptune soundboard.

### 📋 Cartridge 01: Portal (Student & Faculty Self-Service)
* **Route:** `/?tab=portal`
* **Purpose:** High-friction-free reporting terminal for 5,000+ campus residents across Vyas, Budh, Gandhi, Krishna, Shankar, and Valmiki Bhawans.
* **Capabilities:** AI-assisted auto-categorization, natural language service matching, real-time status tracker, and one-click feedback resolution.

### 🛠️ Cartridge 02: Workbench (Technician L1/L2/L3 Terminal)
* **Route:** `/?tab=workbench`
* **Purpose:** High-density command interface for CCIT network engineers, system admins, and hostel technicians.
* **Capabilities:** Live countdown SLA chronometers, optimistic concurrency conflict shields, multi-filter ticket matrices, inline resolution notes, and SLA cryo-stasis toggles.

### 🛰️ Cartridge 03: Command (NOC Admin & Real-Time Topology)
* **Route:** `/?tab=admin`
* **Purpose:** Central executive NOC for CCIT leadership and dispatch controllers.
* **Capabilities:** $O(V^3)$ Kuhn-Munkres auto-dispatch matrix, 40-ticket outage storm simulation, 19-node campus dependency DAG visualizer, and 3D procedural server blade telemetry.

### 📜 Cartridge 04: Specs (Engineering Blueprint & Verification)
* **Route:** `/?tab=specs`
* **Purpose:** Interactive live audit terminal for architectural verification.
* **Capabilities:** Interactive REST API catalog runner, SHA-256 cryptographic audit chain tamper verification, ArchUnit compliance verification, and 8-user persona switcher.

![Section Divider](assets/divider.svg)

## 3. Compiler-Guarded 10-State FSM & Cryo-Stasis

Every incident ticket in Incident-Zero traverses a rigorous, mathematically verified 10-state Finite State Machine. A brute-force transition matrix test verifies all **520,036 potential transition paths**, guaranteeing that illegal state jumps (such as jumping from `REPORTED` directly to `RESOLVED`) throw an immutable `IllegalStateTransitionException`.

![10-State Finite State Machine](assets/lifecycle.svg)

### ❄️ The SLA "Cryo-Stasis" Innovation (`PENDING_USER`)
In standard IT systems, SLA timers continue running while technicians wait days for a student to reply with their hostel room number or MAC address, causing artificial SLA breaches.
* When a ticket enters `PENDING_USER`, the domain `SlaClock` enters **Cryo-Stasis**—the elapsed countdown freezes.
* When the user submits the requested clarification, the ticket returns to `INVESTIGATING` and the SLA chronometer seamlessly resumes with zero penalty.
* If the user fails to respond within 5 business days, the auto-close watchdog archives the ticket without affecting CCIT technician metrics.

```java
// edu.campus.iitsm.incident.domain.Incident
public void pauseSla(Instant now, String reason) {
    if (this.status != IncidentStatus.INVESTIGATING) {
        throw new DomainRuleException("SLA can only be paused while investigating");
    }
    this.status = IncidentStatus.PENDING_USER;
    this.slaClock = this.slaClock.freeze(now);
    recordAuditEntry("SLA_PAUSED", reason, now);
}
```

![Section Divider](assets/divider.svg)

## 4. AI Proposes, Deterministic Core Disposes

Incident-Zero implements a strict **Zero-Hallucination Safety Pattern**: Local Large Language Models (via Ollama) and heuristic intelligence classifiers are treated as **untrusted advisory subsystems**.

![AI Proposes Deterministic Disposes](assets/ai-proposes.svg)

1. **Advisory Generation:** The AI analyzes raw unstructured text (*"LMS quiz won't load from Budh Bhawan Wi-Fi"*), generating an advisory JSON proposal:
   ```json
   {
     "suggestedService": "APP-LMS",
     "category": "SOFTWARE",
     "urgency": "HIGH",
     "confidence": 0.942,
     "duplicateClusterId": "CLUST-2026-08"
   }
   ```
2. **Deterministic Validation Boundary:** The proposal is routed into the Domain Core where hardcoded, deterministic rules validate:
   * Does the suggested service code exist in the 19-node campus topology?
   * Does the reporter have permissions for this tier?
   * Does the cluster violate active master-child containment rules?
3. **Core Disposes:** The Domain Core commits the action only if all invariants pass; otherwise, it falls back to deterministic rule-based classifiers (`RuleBasedFallbackService.java`) with zero crash risk.

![Section Divider](assets/divider.svg)

## 5. Immutable SHA-256 Cryptographic Audit Ledger

To satisfy stringent institutional accountability and prevent internal database tampering, every action performed on an incident is permanently committed to an internal **Cryptographic Hash Chain**.

![Immutable Cryptographic Hash Chain](assets/hash-chain.svg)

Each audit entry calculates its hash using SHA-256 over its predecessor's hash, sequence number, timestamp, action type, actor ID, and payload hash:

$$\text{Hash}_n = \text{SHA-256}\left(\text{Hash}_{n-1} \,\|\, n \,\|\, \text{Timestamp} \,\|\, \text{Action} \,\|\, \text{ActorId} \,\|\, \text{SHA-256}(\text{Payload})\right)$$

* **Genesis Block:** Initialized with a deterministic campus seed hash `0000000000000000000000000000000000000000000000000000000000000000`.
* **Tamper Verification:** The endpoint `GET /api/v1/incidents/{id}/audit/verify` recalculates the cryptographic spine from Genesis to head. If even a single character in the resolution notes or timestamp was edited directly via SQL, the chain breaks and reports the exact corrupted sequence index.

![Section Divider](assets/divider.svg)

## 6. Kuhn-Munkres $O(V^3)$ Optimal Technician Dispatch

When an incident wave strikes, manual assignment causes queue bottlenecks and technician burnout. Incident-Zero implements the **Kuhn-Munkres (Hungarian) Algorithm** for optimal bipartite matching.

$$\min \sum_{i=1}^{n} \sum_{j=1}^{m} C_{i,j} \cdot X_{i,j} \quad \text{subject to} \quad \sum_{i} X_{i,j} \le 1, \; \sum_{j} X_{i,j} \le 1$$

### Dynamic Cost Matrix Calculation
The edge weight $C_{i,j}$ between Ticket $i$ and Technician $j$ is computed deterministically:
$$C_{i,j} = w_{\text{skill}} \cdot (1 - \text{SkillOverlap}) + w_{\text{dist}} \cdot \text{QuadrantDistance}(i, j) + w_{\text{load}} \cdot \frac{\text{ActiveTickets}_j}{\text{MaxCapacity}_j} + w_{\text{sla}} \cdot \text{RemainingSlaRatio}_i$$

* **Skill Vector Overlap:** Matches network certifications, hardware repair skills, or ERP domain knowledge.
* **Physical Distance:** Computes topological walking distance between campus zones (Academic Blocks $\leftrightarrow$ Hostels $\leftrightarrow$ Faculty Quarters).
* **Workload Rebalancing:** Prevents assigning critical incidents to engineers with full active queues.

![Section Divider](assets/divider.svg)

## 7. 19-Node Campus Dependency DAG & Leaf-Safe RCA

The BPHC campus infrastructure is modeled as a Directed Acyclic Graph (DAG) comprising 19 mission-critical nodes across core networks, servers, databases, academic services, and residential hostels.

```mermaid
graph TD
    GW["NET-GATEWAY<br/>(External ISP Gateway)"]
    CORE["NET-CORE<br/>(Core Fiber Backbone)"]
    SW_ACAD["SW-ACAD<br/>(Academic Switch)"]
    SW_HOSTEL["SW-HOSTEL<br/>(Hostel Distribution)"]
    DC["DC-POWER<br/>(Data Center UPS)"]
    
    GW --> CORE
    DC --> CORE
    CORE --> SW_ACAD
    CORE --> SW_HOSTEL
    
    DB_PRI["DB-PRIMARY<br/>(PostgreSQL Cluster)"]
    AUTH["AUTH-LDAP<br/>(Campus SSO / CAS)"]
    
    DC --> DB_PRI
    CORE --> AUTH
    DB_PRI --> AUTH
    
    LMS["APP-LMS<br/>(Moodle Academic LMS)"]
    ERP["SVC-ERP<br/>(Student Records ERP)"]
    WIFI_ACAD["WIFI-ACAD<br/>(Lecture Hall APs)"]
    
    AUTH --> LMS
    DB_PRI --> LMS
    AUTH --> ERP
    SW_ACAD --> WIFI_ACAD
    
    VYAS["HOSTEL-VYAS<br/>(Vyas Bhawan)"]
    BUDH["HOSTEL-BUDH<br/>(Budh Bhawan)"]
    GANDHI["HOSTEL-GANDHI<br/>(Gandhi Bhawan)"]
    VALMIKI["HOSTEL-VALMIKI<br/>(Valmiki Bhawan)"]
    KRISHNA["HOSTEL-KRISHNA<br/>(Krishna Bhawan)"]
    SHANKAR["HOSTEL-SHANKAR<br/>(Shankar Bhawan)"]
    
    SW_HOSTEL --> VYAS
    SW_HOSTEL --> BUDH
    SW_HOSTEL --> GANDHI
    SW_HOSTEL --> VALMIKI
    SW_HOSTEL --> KRISHNA
    SW_HOSTEL --> SHANKAR
```

### 🍃 Leaf-Safe Root Cause Analysis (RCA)
When the core fiber switch `NET-CORE` suffers an outage, hundreds of students report Wi-Fi drops across Vyas, Budh, and Gandhi Bhawans.
* **Alert Cascade Suppression:** Incident-Zero uses topological reverse-traversal to pinpoint that `NET-CORE` is the ancestor root cause.
* **Blast Radius Calculation:** Computes the reachable downstream subgraph in $O(V + E)$ time.
* **Child Ticket Aggregation:** Downstream hostel reports are automatically linked as dependent children to the master `NET-CORE` ticket, preventing dispatching 10 technicians to individual hostels for a single backbone fiber cut.

![Section Divider](assets/divider.svg)

## 8. 40-Ticket Outage Storm & Reciprocal Rank Fusion (RRF)

To test resilience under crisis, Incident-Zero includes a built-in **40-Ticket Outage Storm Simulator**. It generates a massive deluge of concurrent telemetry alerts and student reports over a 3-minute burst.

```
[STORM PHASE 1] Core Fiber Cut -> 15 Network Failure Reports (t = 0s .. 45s)
[STORM PHASE 2] DB Primary Connection Pool Exhaustion -> 15 LMS/ERP Failures (t = 45s .. 110s)
[STORM PHASE 3] Cascading SSO & Hostel Wi-Fi Outage -> 10 Student Reports (t = 110s .. 180s)
```

### ⚡ Hybrid Reciprocal Rank Fusion (RRF)
To cluster incoming storm tickets in real time, Incident-Zero combines Dense Vector Cosine Similarity with Lexical BM25 ranking:

$$\text{RRF\_Score}(d) = \sum_{m \in \{\text{Dense}, \text{Lexical}\}} \frac{1}{k + \text{Rank}_m(d)} \quad (k = 60)$$

Tickets exceeding an RRF threshold of $0.85$ are grouped into an existing master incident cluster within $< 15\text{ms}$, suppressing notification fatigue for CCIT command engineers.

![Section Divider](assets/divider.svg)

## 9. Procedural 3D Weaponized Telemetry (`img2threejs`)

Incident-Zero features **procedural 60 FPS Three.js / WebGL 3D visualizations** constructed strictly via procedural code geometry (zero heavyweight external `.gltf` or `.obj` assets):

### 🖥️ 1. `CampusCoreRack3D` (42U Server Blade Telemetry)
* Interactive 42U data center server rack with individual blade servers representing `APP-LMS`, `AUTH-LDAP`, `DB-PRIMARY`, `SVC-ERP`, and `NET-CORE`.
* Dynamic status beacon LEDs (Green = Healthy, Amber = Warning, Red = Critical Outage).
* **Explode View:** Clicking `Explode View` animates server blades outward along their Z-axis with smooth cubic easing, revealing internal component heat and latency metrics.

### 🌐 2. `TopologyBlastRadius3D` (Orbital Blast-Radius Globe)
* Multi-tiered orbital concentric rings representing Infrastructure Tiers (T1 Core, T2 Distribution, T3 Access).
* Animated glowing energy pulses along connection splines indicating traffic volume and latency spikes.
* Interactive orbital camera controls with raycasted node inspection and blast-radius heat maps.

![Section Divider](assets/divider.svg)

## 10. Web Audio Chiptune Synthesizer & 4 Skies Engine

### 🎵 8-Bit Web Audio Procedural Synthesizer (`sound.ts`)
Incident-Zero contains a custom, zero-dependency procedural chiptune sound engine powered by the browser's native `AudioContext`. Every interaction has distinct tactile audio feedback:

| Sound Method | Waveform | Frequency Modulation | Interaction Trigger |
|:---|:---|:---|:---|
| `sound.power()` | Square / Sine | $110\text{Hz} \to 880\text{Hz}$ sweep | CRT monitor toggle / System boot |
| `sound.slot()` | Noise + Triangle | White noise burst + $440\text{Hz}$ thump | ROM Cartridge swap |
| `sound.pick()` | Square | $520\text{Hz}$ short blip ($20\text{ms}$) | Persona switcher / Button hover |
| `sound.coin()` | Square | $987.77\text{Hz} \to 1318.51\text{Hz}$ two-tone | Incident ticket submitted successfully |
| `sound.warn()` | Sawtooth | $220\text{Hz} \leftrightarrow 440\text{Hz}$ LFO siren | SLA Breach warning / Critical alert |
| `sound.fix()` | Triangle | $440\text{Hz} \to 880\text{Hz}$ major triad arpeggio | Incident resolved / Heart restored |
| `sound.win()` | Sine + Arp | C-E-G-B-C victory fanfare | All tickets cleared / Scoreboard cleared |

---

### 🎨 The Four Atmospheric Skies Theme Matrix
The entire interface adapts across 4 distinct campus atmospheric moods, updating CSS custom properties and swapping brand logos dynamically:

| Theme Token | Mood / Inspiration | Primary Background | Surface Accent | Brand Logo Asset |
|:---|:---|:---|:---|:---|
| `sky-day` | Crisp BPHC Academic Morning | `#F8F9FA` (Warm Alabaster) | `#2563EB` (BITS Blue) | `incident-zero-logo.png` (Navy) |
| `sky-sunset` | Twilight over Rock Garden | `#2A1B18` (Dusk Terracotta) | `#F59E0B` (Amber Gold) | `incident-zero-logo-light.png` (Cream) |
| `sky-night` | Midnight Server Room NOC | `#090A0D` (Carbon Obsidian) | `#10B981` (Emerald Phosphor)| `incident-zero-logo-light.png` (Cream) |
| `sky-monsoon` | Hyderabad Monsoon Rain | `#131B19` (Deep Moss Slate) | `#06B6D4` (Rain Cyan) | `incident-zero-logo-light.png` (Cream) |

![Section Divider](assets/divider.svg)

## 11. 8 Seeded Test Personas & Security RBAC

Incident-Zero includes an **Instant Demo Persona Switcher** in the navigation header, allowing instant one-click authentication without entering credentials:

| Persona | Name | Role & Department | Access Scope |
|:---|:---|:---|:---|
| 🎓 **Student** | Aarav Sharma | 3rd Year CS, Vyas Bhawan | Student Portal, Self-Report, View Own Tickets |
| 👩‍🏫 **Faculty** | Dr. Meera Rao | Professor, Dept of EEE | Faculty Priority Portal, Lab Workstation Tickets |
| 🎧 **L1 Dispatcher** | Rajesh Kumar | CCIT Helpdesk Triage | Triage Queue, Categorization, Reassignment |
| 🌐 **L2 Network** | Suresh Patel | Network Infrastructure Team | Switches, Firewalls, Wi-Fi APs, Fiber Backbone |
| 🖥️ **L2 Systems** | Priya Nair | Systems & Data Center Admin | Server Blades, DB Cluster, Storage, Virtualization |
| 🛡️ **L3 Security** | Vikram Singh | Cyber Security & CCIT Lead | Master Incident Coordination, Outage Storm NOC |
| 👔 **IT Director** | Prof. K. V. Sharma | Dean of Administration & IT | Executive Analytics, MTTR Scorecards, SLA Audits |
| 🔍 **Auditor** | Ananya Sen | Compliance & Quality Assurance | Cryptographic Hash Chain Verifier, Tamper Detection |

![Section Divider](assets/divider.svg)

## 12. Project Layout & Directory Hierarchy

```
OOP Proj/
├── assets/                               # Master architecture diagrams & SVG illustrations
│   ├── banner.svg                        # 8-bit pixel art campus banner
│   ├── architecture.svg                  # Hexagonal architecture & ArchUnit diagram
│   ├── cartridges.svg                    # 5 physical ROM cartridge illustrations
│   ├── lifecycle.svg                     # 10-state FSM lifecycle flow
│   ├── hash-chain.svg                    # Cryptographic SHA-256 blockchain diagram
│   ├── ai-proposes.svg                   # AI Proposes, Core Disposes workflow
│   ├── scoreboard.svg                    # Arcade clearance scorecard
│   ├── divider.svg                       # Scanline pixel divider
│   └── footer.svg                        # Institutional footer badge
├── logo/                                 # Official BITS Pilani I-ITSM logos
│   ├── incident-zero-logo.png            # Navy logo (for Light / Day theme)
│   └── incident-zero-logo-light.png      # Cream logo (for Dark / Night themes)
├── backend/                              # Pure JDK 21 Domain + Spring Boot 3.3.5
│   ├── src/main/java/edu/campus/iitsm/
│   │   ├── incident/                     # Incident Module (Domain Core + Application)
│   │   │   ├── domain/                   # Pure Java FSM, SlaClock, HashChain, Events
│   │   │   ├── application/              # Use Cases, Command Handlers, In-Tx Listeners
│   │   │   └── infrastructure/           # Spring Data JPA, SSE Streaming, PostgreSQL
│   │   ├── dispatch/                     # Kuhn-Munkres Hungarian Dispatch Engine
│   │   ├── topology/                     # 19-Node Campus Dependency Graph & Leaf RCA
│   │   └── intelligence/                 # Ollama LLM Gateway, RRF Clustering, Fallback
│   └── src/test/java/edu/campus/iitsm/   # ArchUnit R1-R9 & 520,036 FSM Transition Tests
├── frontend/                             # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── public/                           # Static assets, landing.html, SVGs
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                   # Pixel CRT Frame, Skies Switcher, Demo Personas
│   │   │   ├── three/                    # CampusCoreRack3D, TopologyBlastRadius3D
│   │   │   └── cartridges/               # ROM Cartridge components
│   │   ├── pages/
│   │   │   ├── portal/                   # Student reporting terminal
│   │   │   ├── workbench/                # Technician triage & SLA chronometers
│   │   │   ├── admin/                    # Hungarian dispatch, Storm sim, Topology
│   │   │   └── specs/                    # ArchUnit runner & Hash verifier
│   │   ├── services/
│   │   │   ├── api.ts                    # Axios client with fallback demo fixtures
│   │   │   └── sound.ts                  # Web Audio 8-bit procedural sound synthesizer
│   │   └── App.tsx                       # Main 5-Cartridge router & HUD
│   └── vite.config.ts                    # Vite config with relative base path
├── docs/                                 # Technical design docs, ADRs, and specs
│   ├── DESIGN.md                         # Complete 9-section Stitch design document
│   └── adr/                              # Architecture Decision Records (ADR 001 - 012)
├── scripts/                              # Verification shell scripts (M1 through M6)
├── upload/                               # Automated deployment & release scripts
│   ├── deploy_gh_pages.sh                # GitHub Pages automated build & push script
│   ├── update_github.sh                  # Main branch version incrementer & git tagger
│   └── VERSION.txt                       # Current semantic release version (e.g. v1.23)
└── landing.html                          # Public pixel-arcade showcase landing page
```

![Section Divider](assets/divider.svg)

## 13. Quickstart & Verification Runbook

### 🚀 Prerequisites
* **Java:** JDK 21 LTS (`java -version`)
* **Node.js:** v18+ or v20+ LTS (`node -v`)
* **Maven:** 3.9+ (`mvn -v`)
* **Git:** Installed with Git Bash (`git --version`)

---

### 💻 Local Development Setup

#### 1. Launch the Backend Service
```bash
# From the repository root
cd backend
mvn clean spring-boot:run
```
* Backend starts at `http://localhost:8080`
* H2 In-Memory DB Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:iitsm_db`)
* Swagger UI / OpenAPI Docs: `http://localhost:8080/swagger-ui.html`

#### 2. Launch the Frontend Application
```bash
# In a separate terminal
cd frontend
npm install
npm run dev
```
* Frontend starts at `http://localhost:5173`
* Pixel-Arcade Showcase: `http://localhost:5173/landing.html`

---

### 🧪 Run the Compiler & Architecture Verification Tests
Incident-Zero ships with automated verification scripts testing each architectural milestone:

```bash
# Verify Milestone 1: Domain Core & FSM Transition Matrix (520,036 states)
bash scripts/verify-m1.sh

# Verify Milestone 2: ArchUnit R1–R9 Strict Modular Compliance
bash scripts/verify-m2.sh

# Verify Milestone 3: Kuhn-Munkres Dispatch & Topological DAG RCA
bash scripts/verify-m3.sh

# Verify Milestone 4: Cryptographic SHA-256 Audit Spine Verification
bash scripts/verify-m4.sh

# Verify Milestone 5: 40-Ticket Outage Storm & RRF Clustering
bash scripts/verify-m5.sh

# Verify Milestone 6: Full End-to-End Persona Journey & SSE Streaming
bash scripts/verify-m6.sh
```

---

<div align="center">

![Arcade Scoreboard](assets/scoreboard.svg)

<br/>

![Scanline Footer](assets/footer.svg)

**Incident-Zero (I-ITSM v2.2) — Engineered with pride for BITS Pilani, Hyderabad Campus**  
*Computer Centre & Information Technology (CCIT) Division*  
All systems nominal. Zero open incidents.

</div>
