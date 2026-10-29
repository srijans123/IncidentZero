# Product Context & Personas — Incident-Zero (I-ITSM v2.2)

<!-- impeccable:product-schema 1 -->

## Platform

Web Application (React 19 + TypeScript + Vite + Tailwind CSS + Three.js / React Three Fiber + Spring Boot 3.5.3 REST/SSE API).

## Users & Personas

Incident-Zero serves three distinct operational personas across the BITS Pilani campus IT ecosystem:

1. **Hostel & Academic Reporter (`EMPLOYEE` / Student / Faculty — e.g., Aarav Sharma, Diya Nair):**
   - Operating Environment: Mobile and laptop browsers in dormitories, labs, and lecture halls.
   - Needs: Frictionless reporting with zero jargon, instant AI duplicate deflection or resolution suggestions, live status tracking, and one-click satisfaction verification or reopen rejection.
   - Primary Surface: `/portal` (Intake Copilot, My Incidents, Public Timeline).

2. **On-Call CCIT Technician (`TECHNICIAN` — L1, Senior, Team Lead, NOC — e.g., Vikram Rao, Rohan Kulkarni, Priya Menon, Ananya Iyer):**
   - Operating Environment: Multi-monitor CCIT service desk / NOC war rooms and field tablets.
   - Needs: High-density, keyboard-navigable incident queue; live SSE ticket streaming with zero polling; dual pause-aware SLA countdown chronometers; clear visual ITIL transition action bars; AI duplicate cluster links; and automated root-cause guidance.
   - Primary Surface: `/workbench` (Incident Queue, War Room, Major Incident Commander).

3. **IT Governance & Incident Commander (`ADMINISTRATOR` — e.g., Suresh Deshmukh, Prof. Kavita Krishnan):**
   - Operating Environment: Central IT command center, management reviews, and audit compliance boards.
   - Needs: Live campus service dependency topology graph (19 services, 26 edges) with blast-radius projection; automated 40-ticket storm simulation and Leaf-Safe RCA ranking; cryptographic SHA-256 tamper-evident audit ledger verification; and SLA/calendar policy controls.
   - Primary Surface: `/admin` (Command Center, Topology DAG, Cryptographic Audit Ledger, Policy Matrix).

---

## Governing Engineering Principle

> **"AI proposes, the deterministic domain core disposes."**  
> AI models (RRF duplicate detection, ONNX SLA breach prediction, Leaf-Safe RCA graph ranking, PIR draft generation) only generate typed advice and recommendations. The compiler-verified pure-JDK domain core (`IncidentState` 11-state transition matrix, `SlaClock` dual-pause chronometer, `AuditHasher` SHA-256 chain) deterministically enforces all invariants, access control, and transitions.

---

## Brand & Aesthetic Commitments

- **Tone & Personality:** Mission-critical, mathematically exact, refined engineering craft (fusing Linear, Raycast, Sentry, and Vercel design systems).
- **Anti-Slop Guarantee:**
  - Zero generic purple-blue AI gradients.
  - Zero cards nested inside cards.
  - Zero bouncy or sluggish spring animations; strictly fast, deterministic cubic-bezier eases (`cubic-bezier(0.16, 1, 0.3, 1)`).
  - Monospace tabular numerals (`font-variant-numeric: tabular-nums`) for all IDs, timestamps, SLA countdowns, and cryptographic hashes.
  - Color spent strictly on semantic data state (`--signal-ok`, `--signal-warn`, `--signal-crit`, `--signal-accent`).
