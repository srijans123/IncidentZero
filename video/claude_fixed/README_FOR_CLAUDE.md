# Incident-Zero (I-ITSM v2.2) — 16-Bit Pixel Visual Asset Pack (Fixed for Antigravity)

This archive contains the complete, regenerated 16-bit pixel visual presentation asset pack (`1920x1080` widescreen) for **Incident-Zero (Group 76, BITS Pilani Hyderabad Campus)**, styled to match the official repository ([`srijans123/IncidentZero`](https://github.com/srijans123/IncidentZero)) and live operational console ([`srijans123.github.io/IncidentZero`](https://srijans123.github.io/IncidentZero/)).

---

## 1. Summary of Fixes Applied

1. **Authentic IncidentZero 16-Bit Pixel Styling Across All 67 SVGs & 7 Remotion Components**:
   - Replaced all generic blurred gradients (`feGaussianBlur`, `linearGradient`, rounded `rx="14..24"` corners, and macOS circle traffic lights) with the exact **IncidentZero 16-Bit Retro Arcade / Pixel UI** design language from `index.css` and `DESIGN.md`:
     - Strict `0px` corners (`rx="0"`) and `shape-rendering="crispEdges"` across every window, card, badge, and button.
     - Signature **24×24 Checkerboard Dither Canvas** (`#1E1646` Night Sky & `#261C58` contrast tiles) + subtle 2px **CRT Scanline Overlay**.
     - Thick `#0B071E` / `#1B1530` ink borders (`3px–6px`) paired with **Zero-Blur Hard Offset Pixel Drop Shadows** (`6px 6px 0 #0B071E`, `8px 8px 0 #0B071E`) and `.pixel-card-offset` multi-layer shadows.
     - Chunky 16-bit window headers with three square pixel control buttons (`#FF4D3D` Ketchup Red, `#FFD84D` Butter Yellow, `#43D17A` Resolved Green), high-contrast Cream cards (`#FFF8DC`), and rotated/stepped butter-gold badges (`#FFD84D`).
2. **Fixed All 35 Broken Code Card SVGs (`02_34_code_cards/*.svg`)**:
   - **Root Cause Fixed**: The original generator script iterated over the `lines` range string (e.g., `"20-45"`) character-by-character instead of `code.splitlines()`, causing every SVG to only display 4–7 vertical characters (`2`, `0`, `-`, `4`, `5`) and a fake file path (`src/actX_sceneY.java`).
   - **Fix**: All 35 code card SVGs now render the full, syntax-highlighted Java/SQL source code from each JSON specification, with accurate starting line numbers parsed from `lines` (e.g., `20..45`), real repository file paths (`display_file`), intelligent continuation line-wrapping (`↳`), and an explicit `<clipPath>` guard.
   - **Fixed Empty `act4_scene7.json` (`WorkingTimeCalculator.java`)**: Populated `act4_scene7.json` and `code_snippets_master.json` with the complete `edu.campus.iitsm.shared.domain.WorkingTimeCalculator` outbound port interface (`lines: "1-22"`).
3. **Eliminated All Text Overflow & Fixed Malformed XML Across All 15 Diagrams (`01_15_diagrams/*.svg`)**:
   - **Fixed Invalid XML (`ParseError`)**: Escaped all raw `&`, `<`, and `>` characters across `hexagonal_architecture.svg`, `modulith_boundaries.svg`, `outage_crisis.svg`, `service_dag_topology.svg`, `tech_report_summary.svg`, and `test_matrix_breakdown.svg`. Every SVG now passes strict XML (`ElementTree`) validation.
   - **Fixed Box Text Overflows**:
     - `exception_hierarchy.svg`: Widened all 5 branch cards to `336px` and wrapped descriptions to `<= 28` chars/line (fixing the old `624px`-wide unwrapped lines inside `270px` boxes).
     - `solid_principles.svg`: Widened all 5 S-O-L-I-D columns to `340px` (`300px` inner cards) and wrapped all text blocks (fixing the old `586px`-wide unwrapped lines inside `260px` boxes).
     - `test_matrix_breakdown.svg`: Replaced narrow sloped triangles (where labels overflowed the triangle edges) with a **Stepped 16-Bit Pixel Pyramid** paired with `888px`-wide specification cards.
     - `outage_crisis.svg`, `seven_routing_strategies.svg`, `hexagonal_architecture.svg`, `clock_modes_comparison.svg`: Widened cards and wrapped all descriptions so zero text touches or crosses any border.
   - **Added `01_15_diagrams/diagram_svgs.json`**: Pre-compiled JSON map of all 15 diagram SVGs required by `06_remotion_components/DiagramScene.jsx`.
4. **Fixed Copy-Pasted Deliverables in Member Slot Cards (`05_04_member_slots/*.svg`)**:
   - Each team member (`Srijan Shukla`, `Suhani Agarwal`, `Kartikey Negi`, `Hairsh Kumar`) now has their individualized role, player slot (`PLAYER 01–04`), BITS ID badge, and 4 specific engineering deliverables matching `MemberCard.jsx`.

---

## 2. Directory Structure

```text
.
├── README.md                          # Quick-start & Antigravity integration guide
├── README_FOR_ANTIGRAVITY.md          # Complete technical specification for Antigravity
├── README_FOR_CLAUDE.md               # Legacy reference file (updated with 16-bit tokens)
├── 01_15_diagrams/                    # 15 16-bit pixel architecture & domain SVGs + diagram_svgs.json
│   ├── clock_modes_comparison.svg
│   ├── dual_clock_architecture.svg
│   ├── exception_hierarchy.svg
│   ├── hexagonal_architecture.svg
│   ├── hnsw_vector_search.svg
│   ├── merkle_audit_chain.svg
│   ├── modulith_boundaries.svg
│   ├── outage_crisis.svg
│   ├── priority_matrix_calc.svg
│   ├── service_dag_topology.svg
│   ├── seven_routing_strategies.svg
│   ├── solid_principles.svg
│   ├── system_interaction_flow.svg
│   ├── tech_report_summary.svg
│   ├── test_matrix_breakdown.svg
│   └── diagram_svgs.json
├── 02_34_code_cards/                  # 35 16-bit pixel IDE code card SVGs + JSON specs + master JSON
│   ├── act2_scene1.{svg,json} ... act10_scene3.{svg,json}
│   └── code_snippets_master.json
├── 03_07_terminals/                   # 7 16-bit pixel CRT terminal SVGs + JSON specs + master JSON
│   ├── act2_scene5.{svg,json} ... act9_scene6.{svg,json}
│   └── terminal_outputs_master.json
├── 04_06_title_cards/                 # 6 16-bit pixel hero title card SVGs + JSON specs
│   └── act0_scene4.{svg,json} ... act10_scene6.{svg,json}
├── 05_04_member_slots/                # 4 16-bit pixel player profile / webcam slot SVGs + JSON specs
│   └── act1_scene2.{svg,json} ... act1_scene5.{svg,json}
└── 06_remotion_components/            # 7 React/Remotion JSX components updated to 16-bit pixel styling
    ├── Captions.jsx
    ├── CodeCard.jsx
    ├── DiagramScene.jsx
    ├── LowerThird.jsx
    ├── MemberCard.jsx
    ├── TerminalCard.jsx
    └── TitleCard.jsx
```

---

## 3. IncidentZero 16-Bit Pixel Design Tokens Used

| Token Role | Hex Code | Usage in SVGs & Remotion Components |
| :--- | :--- | :--- |
| **Night Canvas (`--bg`)** | `#1E1646` | Base 24×24 checkerboard tile 1 |
| **Checker Contrast (`--chk`)** | `#261C58` | Base 24×24 checkerboard tile 2 |
| **CRT Outer Bezel** | `#120C2C` | Terminal screen, IDE canvas, and outer bezel |
| **Arcade Card Surface** | `#1B1530` / `#2B2060` | Primary and elevated pixel window surfaces |
| **Cream Contrast Card (`--card`)** | `#FFF8DC` | High-contrast callout banners, formulas, and KPI displays |
| **Ink Border & Shadow (`--line`)** | `#0B071E` / `#1B1530` | `3px–6px` solid borders and `6px 6px 0` hard drop shadows |
| **Butter Gold (`--yellow`)** | `#FFD84D` | Primary badges, P2 warnings, Java types, and highlights |
| **Telemetry Sky (`--sky`)** | `#59C9F5` | Inbound ports, P2/P3 accents, and Java/SQL keywords |
| **Ketchup Red (`--red`)** | `#FF4D3D` | P1 critical outages, root exceptions, and tamper alerts |
| **Resolved Green (`--grn`)** | `#43D17A` / `#7CE356` | Passing checks, domain core borders, and string literals |
| **Crypto Purple (`--grp`)** | `#7C5CFF` | Outbound adapters, Merkle hash links, and grid accents |

### Typography Stack
- **Display & Headers**: `'Pixelify Sans', 'Silkscreen', 'JetBrains Mono', 'DejaVu Sans Mono', monospace`
- **Arcade Badges & Labels**: `'Silkscreen', 'JetBrains Mono', 'DejaVu Sans Mono', monospace`
- **Code, Timers & Hashes**: `'JetBrains Mono', 'DejaVu Sans Mono', 'Liberation Mono', monospace`

---

## 4. Antigravity Integration Instructions

1. **Drop-In SVG Replacement (Static / FFmpeg / Remotion Pipeline)**:
   - Copy `01_15_diagrams/`, `02_34_code_cards/`, `03_07_terminals/`, `04_06_title_cards/`, and `05_04_member_slots/` directly into your video pipeline's asset directory.
   - Every `.svg` is a self-contained, valid XML document with an explicit `viewBox="0 0 1920 1080" width="1920" height="1080"` and `shape-rendering="crispEdges"`.
2. **Remotion Component Integration**:
   - Copy `06_remotion_components/*.jsx` into your Remotion `src/components/` folder.
   - Copy `01_15_diagrams/diagram_svgs.json` to `public/diagram_svgs.json` (or keep relative to `01_15_diagrams/diagram_svgs.json` as imported in `DiagramScene.jsx`).
   - Load Google Fonts (`Pixelify Sans`, `Silkscreen`, `JetBrains Mono`) in your Remotion root `index.html` or `@remotion/google-fonts` for pixel-identical browser rendering; all SVGs also include safe fallback metrics for `DejaVu Sans Mono` so text never overflows in headless offline Linux containers.
