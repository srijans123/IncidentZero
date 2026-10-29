# Incident-Zero (I-ITSM v2.2) — Production Stitch Design System

Fusing **Linear**, **Raycast**, **Sentry**, and **Vercel** design standards for a mission-critical campus IT service management platform.

---

## 1. Visual Theme & Atmosphere

Incident-Zero embodies the quiet, focused power of an aerospace flight controller or mission-critical NOC terminal. The visual atmosphere is built upon **Carbon-Obsidian** depths (`#090A0D`), crisp **1px hairline geometry** (`rgba(255, 255, 255, 0.07)`), and **calibrated semantic illumination**. Color is treated as a scarce, precious currency—spent solely on operational reality: healthy systems, warning thresholds, SLA breach alerts, and precision telemetry data conduits.

---

## 2. Color Palette & Semantic Roles

### 2.1 Surface Elevation Ladder
| Token | Hex / Value | Role |
| :--- | :--- | :--- |
| `--bg-canvas` | `#090A0D` | Deep carbon-slate viewport foundation |
| `--bg-surface-1` | `#101217` | Base container with `1px solid rgba(255, 255, 255, 0.07)` |
| `--bg-surface-2` | `#161920` | Elevated panel with `inset 0 1px 0 0 rgba(255, 255, 255, 0.09)` |
| `--bg-surface-3` | `#1D212A` | Interactive hover & active drawer surface |
| `--hairline-soft` | `rgba(255, 255, 255, 0.07)` | Standard hairline separator |
| `--hairline-strong`| `rgba(255, 255, 255, 0.14)` | Focused control & active card border |

### 2.2 Ink & Contrast Tokens
| Token | Hex / Value | Contrast Ratio |
| :--- | :--- | :--- |
| `--ink-primary` | `#F3F4F6` | $\ge 15:1$ against canvas (Headings, primary values) |
| `--ink-secondary` | `#9BA1AE` | $\ge 7:1$ against canvas (Labels, metadata, column titles) |
| `--ink-muted` | `#646B7A` | $\ge 4.6:1$ against canvas (Timestamps, hashes, borders) |

### 2.3 Semantic Signal Currency
| State | Core Hex | Surface Tint | Hairline Border | Text Ink |
| :--- | :--- | :--- | :--- | :--- |
| **`--signal-ok`** (Healthy / Closed) | `#10B981` | `rgba(16, 185, 129, 0.10)` | `rgba(16, 185, 129, 0.28)` | `#6EE7B7` |
| **`--signal-warn`** (At Risk / Paused) | `#F59E0B` | `rgba(245, 158, 11, 0.10)` | `rgba(245, 158, 11, 0.28)` | `#FCD34D` |
| **`--signal-crit`** (Breached / P1) | `#F43F5E` | `rgba(244, 63, 94, 0.12)` | `rgba(244, 63, 94, 0.35)` | `#FDA4AF` |
| **`--signal-accent`** (Telemetry Cyan)| `#38BDF8` | `rgba(56, 189, 248, 0.12)` | `rgba(56, 189, 248, 0.35)` | `#7DD3FC` |

---

## 3. Typography Rules

### 3.1 Type Families
- **UI & Display Sans:** `Plus Jakarta Sans`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`.
- **Editorial Accent:** `Instrument Serif`, `Georgia`, `serif` (used in italics for milestone summaries and KPI impact deltas).
- **Tabular Numeric & Monospace:** `JetBrains Mono`, `ui-monospace`, `monospace` with `font-variant-numeric: tabular-nums` for all incident numbers (`INC-2026-000142`), SLA clocks (`04:12.8`), SHA-256 hashes, and coordinates.

### 3.2 Scale Ladder
- `display-xl`: `32px` / `line-height: 1.15` / `font-weight: 600` / `letter-spacing: -0.03em`
- `heading-lg`: `20px` / `line-height: 1.25` / `font-weight: 600` / `letter-spacing: -0.02em`
- `heading-md`: `16px` / `line-height: 1.35` / `font-weight: 600` / `letter-spacing: -0.01em`
- `body-base`: `14px` / `line-height: 1.50` / `font-weight: 400` / `letter-spacing: 0`
- `caption-sm`: `12px` / `line-height: 1.40` / `font-weight: 500` / `letter-spacing: 0.01em`
- `mono-code`: `12px` / `line-height: 1.40` / `font-family: JetBrains Mono` / `tabular-nums`

---

## 4. Component Stylings

### 4.1 Precision Status Dot (`<StatusDot />`)
- Geometry: Fixed `8px x 8px`, `border-radius: 9999px; flex-shrink: 0; display: inline-block;`.
- Halos: Subtle radial ring `box-shadow: 0 0 0 3px rgba(...)` only on active `P1`/`BREACHED` or active `SSE CONNECTED` states. Container always maintains $\ge 4px$ internal clearance.

### 4.2 Standard Control Ladder
- **Compact Badge / Pill:** `height: 22px; padding: 0 8px; font-size: 11px; font-weight: 500; border-radius: 4px;`
- **Filter / Action Button:** `height: 32px; padding: 0 12px; font-size: 13px; font-weight: 500; border-radius: 6px;`
- **Primary Command CTA:** `height: 36px; padding: 0 16px; font-size: 13px; font-weight: 600; border-radius: 6px;`
- **Icon Alignment:** `display: inline-flex; align-items: center; justify-content: center; gap: 6px;` with icons locked to `14px x 14px; flex-shrink: 0;`.

### 4.3 Command Bar & War Room Toolbar
- Dedicated horizontal flex container with `flex-wrap: wrap; gap: 8px; align-items: center;`.
- Never overlaps incident titles or overflows screen edges horizontally.

### 4.4 Data Tables & Hash Pills
- Strict tabular data grid: right-aligned numeric cells, monospace IDs, and `<HashPill />` truncation (`abc1234f...9e81c02d`) with copy tooltip.
- Row hover: subtle background transition to `--bg-surface-3` with zero layout jump.

### 4.5 3D Viewport Chrome
- Fixed or aspect-ratio locked container (`min-height: 320px`, `overflow: hidden`, `border: 1px solid rgba(255, 255, 255, 0.08)`).
- Semi-transparent HUD overlay anchors on top edges with live metrics and camera controls.

---

## 5. Layout Principles

- **Spatial Grid:** 8pt spatial grid with 4pt half-steps (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`).
- **Fixed Header:** `56px` (`h-14`) sticky top bar with backdrop blur (`backdrop-blur-md`).
- **Zero Nested Cards:** Content lives in flat, hairline-partitioned surface panels. No cards nested inside cards.
- **Zero Horizontal Overflow:** Guaranteed `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.

---

## 6. Depth & Elevation

- **Hairline Geometry:** `1px solid rgba(255, 255, 255, 0.07)` provides structural boundaries without muddy drop shadows.
- **Top Specular Highlight:** Panels feature a subtle `inset 0 1px 0 0 rgba(255, 255, 255, 0.09)` simulating light grazing an anodized aluminum bezel.
- **Backdrop Blur:** Modals and sticky navigation bars utilize `backdrop-filter: blur(12px)`.

---

## 7. Do's and Don'ts (Anti-Slop Manifesto)

### DO:
- Use `Plus Jakarta Sans` or `Geist` for crisp, professional typography.
- Use `JetBrains Mono` with `tabular-nums` for all countdowns, incident codes, and coordinates.
- Spend color strictly on semantic state (`ON_TRACK`, `AT_RISK`, `BREACHED`).
- Provide instant keyboard navigability and clear visual affordance.

### DON'T:
- Do NOT use Inter, Arial, Roboto, or generic default sans-serifs.
- Do NOT use purple-to-blue SaaS gradients or neon cyberpunk particle soups.
- Do NOT nest cards inside cards.
- Do NOT use elastic/spring bounce animations that delay user interaction.
- Do NOT use un-truncated 64-character hashes that push table cells off-screen.

---

## 8. Responsive Behavior

- **Desktop Widescreen (`1920x1080`):** 3-column split view (Navigation/Queue, War Room Canvas, AI Provenance Inspector).
- **Laptop Standard (`1440x900`):** 2-column view with collapsible right-hand AI copilot panel.
- **Mobile Handheld (`390x844`):** Single-column stacked view with sticky bottom navigation tabs and touch targets $\ge 44px$.

---

## 9. Agent Prompt Guide

When authoring or modifying any component in `frontend/src/`:
1. Always import tokens from standard CSS variables or Tailwind utility mappings.
2. Ensure every button has explicit height and non-shrinking icon wrappers.
3. Validate all tables for horizontal clipping and numeric alignment.
4. Keep all 3D canvas wrappers inside robust error-boundary and aspect-ratio containers.
