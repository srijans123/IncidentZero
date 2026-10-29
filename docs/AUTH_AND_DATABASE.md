# Authentication and Database Specification: Better Auth & NeonDB

## 1. Database Architecture: NeonDB Serverless PostgreSQL
Incident-Zero leverages **NeonDB Serverless PostgreSQL** with native extensions for high-dimensional vector search and fuzzy text matching.

### 1.1 Connection & Pooling Configuration
- **Connection URI Format**:
  ```
  jdbc:postgresql://${DB_HOST}/${DB_NAME}?sslmode=require&prepareThreshold=0
  ```
- **PgBouncer Compatibility**: `prepareThreshold=0` is strictly configured on the JDBC connection string to prevent prepared statement cache collisions on Neon `-pooler` connection pooling endpoints.
- **Enabled Extensions**:
  - `vector`: Stores dense embeddings for duplicate ticket detection and semantic resolution search.
  - `pg_trgm`: Enables trigram-based fuzzy text matching for fast lexical similarity queries.

### 1.2 Migration Hierarchy (Flyway)
1. `V001__reference_tables.sql`:
   - Reference entities: `team`, `app_user`, `technician_profile`, `skill`, `technician_skill`, `it_service`, `service_dependency`, `category`, `sla_policy`.
   - Managed role guard handles NeonDB non-superuser role permissions cleanly.
2. `V002__incident_core.sql`:
   - Core domain tables: `incident`, `incident_tag`, `incident_attachment`, `incident_comment`.
   - Indexes on status, priority, category, and assignee.
3. `V003__audit_timers_ai.sql`:
   - Immutable audit ledger: `audit_record` with SHA-256 chain and `audit_no_change` tamper prevention trigger.
   - Intelligent feature support: `sla_timer_event`, `duplicate_cluster`, `notification`, `ledger_anchor`, `idempotency_key`, `event_publication`.
4. `R__campus_seed.sql`:
   - Repeatable seed provisioning 19 campus services, 26 dependency edges, 16 SLA policies, and 8 standard demo users.

---

## 2. Authentication & Authorization: Better Auth + Spring Security Bridge

### 2.1 Better Auth Configuration
- **Shared Secret**: Derived from `BETTER_AUTH_SECRET` in `.env` (HMAC-SHA256 signature).
- **Session Tokens**: Signed JSON Web Tokens (JWT) containing standard claims and domain attributes:
  - `sub`: User UUID.
  - `email`: Institutional email address (`@bits.campus`).
  - `role`: Role string (`EMPLOYEE`, `TECHNICIAN`, `ADMINISTRATOR`).
  - `supportTier`: `L1`, `SENIOR`, or `TEAM_LEAD` (for technicians).
  - `teamId`: Assigned team UUID.

### 2.2 Seeded BITS Campus Demo Accounts
All 8 campus accounts are seeded with password **`Bits@2026`** (hashed using RFC-9106 Argon2id):

| Email | User Role | Tier / Sub-Role | Assigned Department / Team |
| :--- | :--- | :--- | :--- |
| `emp@bits.campus` | `EMPLOYEE` | Standard Reporter | Computer Science & Eng |
| `diya@bits.campus` | `EMPLOYEE` | Standard Reporter | Electrical & Electronics |
| `tech.vikram@bits.campus` | `TECHNICIAN` | `L1` | Campus Network Operations |
| `lead.priya@bits.campus` | `TECHNICIAN` | `TEAM_LEAD` | Core Infrastructure |
| `tech.rohan@bits.campus` | `TECHNICIAN` | `SENIOR` | Academic Computing |
| `tech.ananya@bits.campus` | `TECHNICIAN` | `L1` | Hostels & Facilities IT |
| `admin@bits.campus` | `ADMINISTRATOR` | `SYSTEM_ADMIN` | Campus Central IT |
| `manager@bits.campus` | `ADMINISTRATOR` | `IT_MANAGER` | IT Governance & Service Quality |

### 2.3 Spring Security Integration
- **`JwtAuthenticationFilter`**: Intercepts inbound HTTP requests, validates the signature against `BETTER_AUTH_SECRET`, and populates the `SecurityContext`.
- **`CommandAuthorizer`**: Enforces method-level domain permissions:
  - Employees can only view and comment on their own incidents.
  - Technicians can update incidents assigned to them or their team.
  - Administrators have full supervisory access.
- **30-Second Single-Use SSE Stream Ticket**:
  - `POST /api/v1/auth/stream-ticket` validates the JWT and returns an opaque, single-use ticket stored in a 30-second Caffeine cache.
  - Browser `EventSource` connects via `GET /api/v1/stream?ticket=<ticket>`, bypassing standard header limitations.
