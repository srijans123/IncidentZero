# Incident-Zero: Reach Zero — Production Design System & Frontend Architecture (v2.2)
**BITS Pilani, Hyderabad Campus** · Hexagonal Modular Monolith · Pixel-Arcade Visual Engine

---

## 1. Concept & Art Direction

Incident-Zero is an incident management command center designed as an arcade experience where uptime is earned and maintained by reaching zero open incidents. Tickets manifest as pixel bugs over real BPHC campus landmarks, the technician is the player, SLAs are represented as ticking hearts, workspaces are swappable ROM cartridges, and the audit trail is an immutable SHA-256 cryptographic hash spine that can be verified or tamper-tested with one keystroke.

The product is enterprise-grade, deterministic, and compiler-verified underneath (520,036 transition matrix paths, zero Spring/JPA imports in domain core, ArchUnit R1–R9 invariants), while the surface is tactile, playful, responsive, and free of generic AI slop.

---

## 2. Visual Theme & Anti-Slop Principles

- **Flat Color, Thick Ink, Hard Shadows:**
  - `3px solid var(--line)` outlines on all interactive elements, cards, and buttons.
  - Hard offset drop shadows with zero blur (`shadow-[5px_5px_0_var(--shadow-col)]` or `3px 3px 0 var(--shadow-col)`).
  - Square corners, crisp integer-scaled SVG matrices (`shape-rendering: crispEdges`).
  - No purple-to-blue generic SaaS gradients, no fuzzy glassmorphism, no cards nested inside cards.

- **Four Skies (Day, Sunset, Night, Monsoon):**
  - Instant theme cross-fading through sky-scoped CSS variables (`data-sky="day"`, `sunset`, `night`, `rain`).
  - Automatic browser `<meta name="theme-color">` synchronization.
  - Automatic brand logo swapping between `logo/incident-zero-logo.png` (navy on day/sunset) and `logo/incident-zero-logo-light.png` (cream on night/monsoon).

- **Typography Ladder:**
  - **Headlines & Body:** `Pixelify Sans`, `cursive`, `sans-serif` (display and arcade headings).
  - **Labels, Badges, & Chips:** `Silkscreen`, `monospace` (arcade labels and status ribbons).
  - **Technical Identifiers & SLA Timers:** `JetBrains Mono` with `tabular-nums` for incident numbers (`INC-2026-000142`), countdown timers (`04:12.8`), SHA-256 hashes, and coordinates.
  - **Clean Z Override:** `.z-chr` with `Space Grotesk` or `JetBrains Mono` so 'Z' and 'z' never read as '2' or '8'.

---

## 3. Sky Tokens & Color Palette

### 3.1 Palette (Day Mode)
| Token | Hex | Role |
| :--- | :--- | :--- |
| `--bg` | `#FFE680` | Butter background canvas |
| `--chk` | `#FFDD5E` | Checkerboard tile contrast |
| `--card` | `#FFF8DC` | Cream card surface |
| `--fg` | `#1B1530` | Deep purple-navy ink text |
| `--soft` | `#4A3F6B` | Secondary label & metadata ink |
| `--line` | `#1B1530` | 3px ink borders and hard shadows |
| `--shadow-col` | `#1B1530` | Hard drop shadow color |
| `--red` / `--ketchup` | `#FF4D3D` | P1 outages, bug hits, critical alerts |
| `--sky` | `#59C9F5` | P2 high priority, network telemetry |
| `--grn` / `--ribbon` | `#43D17A` / `#7CE356` | Resolved tickets, healthy systems, XP ribbon |
| `--grp` | `#7C5CFF` | P3 priority, cryptographic links |
| `--orange` | `#FF9F43` | Active warning, SLA < 75% |
| `--pink` | `#FF8AD0` | Specs, architecture accents |

### 3.2 Four Skies Matrix
- **Day:** Butter `#FFE680`, Cream `#FFF8DC`, Navy Ink `#1B1530`.
- **Sunset:** Warm Peach `#FFB870`, Cream `#FFF2E2`, Deep Plum `#24132E`.
- **Night:** Deep Indigo `#1E1646`, Midnight Slate `#32266E`, Cream Text `#FFF3C4`.
- **Monsoon:** Storm Steel `#2C3B4D`, Wet Slate `#3E5268`, Off-White `#F0F6FC`.

---

## 4. Game Feel & Audio Synthesizer

- **Web Audio 8-bit Synthesizer (`sound.ts`):**
  - Zero external sound asset dependencies; procedural audio synthesized via Web Audio API.
  - `sound.blip()`: 880Hz square beep for hover, keystroke, and navigation.
  - `sound.pick()`: 440Hz -> 660Hz chirp for menu selection and cartridge slotting.
  - `sound.slot()`: 220Hz low square thump for physical cartridge seating.
  - `sound.fix()`: 523Hz -> 659Hz -> 784Hz major triad arpeggio on ticket squash/resolution.
  - `sound.err()`: 130Hz buzzing saw wave on 409 conflict and illegal moves.
  - `sound.win()`: Full 4-note victory fan-fare on stage clear and ledger verification.
  - Full mute toggle synced across user sessions.

- **Tactile Feedback:**
  - 60ms hit-stop and screen shake on bug squash.
  - 409 conflict shake animation on illegal transitions or stale versions.
  - Live ticking SLA hearts with danger flash under 25% threshold.

---

## 5. Swappable ROM Cartridge Architecture

The frontend application is structured as 5 swappable cartridges:
1. **ROM 00: Campus Stage (`/stage` or `?tab=stage`):**
   Interactive BPHC campus overworld featuring 4 2×-scale pixel landmarks (C-Block & Auditorium, F-Block & On The Rocks, Valmiki Bhavan, Block-G Library), live crawling bugs, walking technician with overhead wrench-slam squash animation, combo multiplier, scorecard modal, 10-state rules board, and Web Crypto SHA-256 live avalanche editor.
2. **ROM 01: Student Portal (`/portal` or `?tab=portal`):**
   Outage reporting intake copilot, voice dictation, urgency selectors, deflection cards, 5-step quest progress bar, SLA stasis banners, and CSAT star ratings.
3. **ROM 02: Technician Workbench (`/workbench` or `?tab=workbench`):**
   Active queue table with Hungarian capacity points telemetry, boss-fight incident detail, dynamic action bars populated strictly by backend `allowedCommands`, 3D SLA chronometer, and PIR post-mortem editor.
4. **ROM 03: Admin Command Center (`/admin` or `?tab=admin`):**
   Executive KPI grid with tilted count-up cards, 19-node service dependency DAG with 3D orbital view and 2D schematic graph, immutable SHA-256 audit ledger with 40-ticket storm simulator, and Kuhn-Munkres hybrid dispatch weight sliders.
5. **ROM 04: System Specs (`/specs` or `?tab=specs`):**
   Formal architecture specification detailing the 10-state machine matrix, OCC row versioning, SLA stasis mechanics, DAG topological sort, and cryptographic hash spine.

---

## 6. Official Brand Logos

- **Light Sky Logo:** `/logo/incident-zero-logo.png` (Navy wordmark, displayed on day and sunset).
- **Dark Sky Logo:** `/logo/incident-zero-logo-light.png` (Cream wordmark, displayed on night and monsoon).
- Automatic swapping handled in `<Header />` via `light-only` and `dark-only` CSS selectors.
