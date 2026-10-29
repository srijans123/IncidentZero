# Technology Stack Specification — Incident-Zero (I-ITSM v2.2)

## 1. Locked Version Matrix

| Layer | Technology | Locked Version | Purpose / Architectural Role |
| :--- | :--- | :--- | :--- |
| **JDK / Language** | Java (OpenJDK / Corretto) | **21 / 25 LTS** | Pure-domain business core, hexagonal module boundaries |
| **Application Framework** | Spring Boot | **3.5.3 / 4.1.x** | Inversion of control, REST APIs, JPA persistence, event bus |
| **Monolith Governance** | Spring Modulith | **1.3.x** | Architectural boundary enforcement, module event publications |
| **Architecture Verification** | ArchUnit | **1.3.x** | Automated verification of domain layer isolation (Rules R1–R9) |
| **Primary Database** | NeonDB Serverless PostgreSQL | **PostgreSQL 16+** | Serverless relational store with `pgvector` & `pg_trgm` |
| **Authentication Engine** | Better Auth | **1.1.x / JWT bridge** | Auth tokens, sessions, role claims (`EMPLOYEE`, `TECHNICIAN`, `ADMINISTRATOR`) |
| **AI Runtime** | ONNX Runtime | **1.20.0** | In-process, zero-Python-dependency SLA risk estimation & embeddings |
| **Resilience & Fault Tolerance** | Resilience4j | **2.2.0** | Circuit breakers, retry policies, rate limiters for AI & external APIs |
| **Rate Limiting** | Bucket4j | **8.10.x** | Token-bucket rate limiting for authentication and ticket intake |
| **In-Memory Caching** | Caffeine | **3.1.x** | High-performance semantic cache and prompt template cache |
| **Frontend Framework** | React | **19.0.x** | Modern component rendering, React Server Components compatibility |
| **Frontend Language** | TypeScript | **5.7.x** | Strict static type checking for client-side API contracts |
| **Build Tooling** | Vite | **6.x** | Ultra-fast development server and optimized bundle generation |
| **Styling & Design System** | Tailwind CSS & CSS Modules | **4.x / 3.4.x** | Fluid dark-mode typography, glassmorphism, responsive UI |
| **DAG & Graph Visualization**| `@xyflow/react` (React Flow) | **12.x** | 19-service campus dependency DAG with leaf-safe path rendering |
| **Analytics & Telemetry Charts**| Recharts | **2.15.x** | Real-time SLA compliance curves, ticket volume histograms |

---

## 2. Module Boundary Contracts
Spring Modulith modules adhere to explicit package isolation:
```
edu.campus.iitsm
├── shared.domain          <-- (OPEN) Common value objects, ClockPort, DomainEvent, exceptions
├── incident               <-- Aggregate root, state machine, SLA clocks
│   ├── domain             <-- Zero-dependency domain models
│   ├── application        <-- Use cases, commands, handlers
│   ├── infrastructure     <-- JPA entities, repositories, REST controllers
│   └── api                <-- Exposed module contract (@NamedInterface("api"))
├── intake                 <-- 9-step intake pipeline orchestrator
├── assignment             <-- Hungarian algorithm, least loaded, round-robin strategies
├── sla                    <-- Working calendar calculations, timer events
├── audit                  <-- SHA-256 hash-chain ledger, tampering detection
├── intelligence           <-- RRF duplicate detection, ONNX inference, RAG
├── catalog                <-- Service dependency DAG, categories, SLA policies
└── notification           <-- SSE hub, email simulator
```
