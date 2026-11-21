# Incident-Zero (I-ITSM v2.2) — Visual Asset Enhancement Pack

This asset pack contains all non-video visual presentation cards for the Incident-Zero video pipeline (1920x1080 @ 30fps).

## Directory Structure:
1. `01_15_diagrams/`: 15 Full high-res SVG architecture & domain diagrams (Hexagonal architecture, State machine, Modulith boundaries, Merkle audit chain, etc.).
2. `02_34_code_cards/`: 34 Standalone 1920x1080 SVG code cards with line numbers and highlights + individual JSON specs + `code_snippets_master.json`.
3. `03_07_terminals/`: 7 Standalone 1920x1080 SVG terminal replays + individual JSON specs + `terminal_outputs_master.json`.
4. `04_06_title_cards/`: 6 Standalone 1920x1080 SVG title cards + individual JSON specs.
5. `05_04_member_slots/`: 4 Standalone 1920x1080 SVG student presentation cards with webcam slots + individual JSON specs.
6. `06_remotion_components/`: The React JSX component implementations rendered by Remotion.

## Design Specifications & Color Tokens:
- Canvas Viewport: `1920 x 1080` (16:9 widescreen)
- Background: Deep Void `#06080d` / `#090e19` with subtle radial cyan gradients
- Primary Accent: Neon Cyan `#00f0ff`
- Success Accent: Mint Green `#00ff9d`
- Warning Accent: Cyber Amber `#ffb800`
- Critical Accent: Neon Crimson `#ff3864`
- Body Text: `#ffffff` (Headers), `#cbd5e1` (Subtext), `#94a3b8` (Muted)
- Code / Monospace Font: `'JetBrains Mono', Consolas, monospace`
- UI Font: `'Segoe UI', -apple-system, sans-serif`
