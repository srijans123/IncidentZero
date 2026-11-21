# Incident-Zero — Frontend Architecture and Design Brief
**BITS Pilani, Hyderabad Campus** · single-file HTML · no build step

## 1. Concept
Incident-Zero is a game you win by reaching zero open tickets. Tickets are pixel bugs on a pixel version of the real campus, the technician is the player, SLAs are hearts, workspaces are game cartridges, and the audit trail is a hash chain you can break with one keystroke. The product is serious underneath; the surface is playful and tactile.

## 2. Look and feel
- **Flat color, thick ink, hard shadows.** 3px ink outlines, offset shadows with no blur, square corners, integer-scaled pixel art (`shape-rendering: crispEdges`).
- **Palette (day):** butter `#FFE680` with checker `#FFDD5E`, cream cards `#FFF8DC`, ink `#1B1530`, ketchup `#FF4D3D`, sky `#59C9F5`, grass `#43D17A`, grape `#7C5CFF`, orange `#FF9F43`, pink `#FF8AD0`.
- **Four skies:** day, sunset, night, monsoon. One switch restyles the page background, cards, borders, shadows, ribbon glow, callout band and footer through per-sky CSS variables, and the browser `theme-color` follows.
- **Type:** Pixelify Sans for headlines and body, Silkscreen for labels, JetBrains Mono for numbers, IDs and `SHA-256`. Z, z and 5 use a clean override so they never read as 2 or 8.
- **Logos:** both official wordmarks (navy for day and sunset, cream for night and monsoon) are embedded as data URIs and swap automatically.

## 3. Page architecture
| Order | Section | What it does |
|---|---|---|
| 0 | **Boot curtain** | Two ink panels with INCIDENT-ZERO and a blinking PRESS START split open on load. CSS only, never blocks clicks, skipped under reduced motion. |
| 1 | **Floating notched nav** | Live OPEN, SCORE, COMBO, BEST counters, combo bar, sky and sound toggles, station menu (Esc closes). |
| 2 | **Hero stage** | Dithered sky, headline "Real campus uptime. Zero open incidents." whose letters ripple in a wave and hop on hover, bonus bugs that parallax at different speeds. |
| 3 | **Campus scene** | Four hand-drawn pixel landmarks at 2× scale: C-Block and Auditorium, F-Block and On The Rocks, Valmiki Bhavan, Block-G Library. Three parallax layers behind them. Each building hosts one live ticket. |
| 4 | **Story path** | A thick glowing green ribbon winds past four offset-backing cards. Four articulated characters (limbs pivot at shoulders and hips) wiggle along it and cheer when you fix a ticket. A mascot walks the ribbon leaving a spark trail. |
| 5 | **Card 1: Rules board** | 10 lifecycle states, one legal move at a time, optional ON HOLD and ESCALATED branches, 409 shake on an illegal move. |
| 6 | **Cards 2 and 3: Cartridges and console** | Click a cartridge: it presses down and slides into the console slot, the CRT powers on. Screens: Student Portal (spawn a ticket), Workbench (boss fight with allowed-moves bar and copilot hint), Command (campus overworld dependency map), System Specs (feature explanations, no self-assigned marks). |
| 7 | **Card 4: Ledger** | Real SHA-256 via Web Crypto (with a built-in fallback for `file://`). Edit any block payload and every later hash changes (avalanche), with status badges flipping to TAMPERED / AVALANCHE. |
| 8 | **Stats, marquee rails, callout, footer** | Tilted count-up cards, two counter-scrolling rails (pause on hover), "Ready when you are", scanline footer. |

## 4. Game feel
- Walk frames, overhead wrench slam, and a flattened bug hit frame before the burst.
- 60 ms hit-stop and screen shake on every squash.
- Three SLA hearts per ticket; a red danger vignette pulses when a ticket is on its last heart.
- Combo multiplier with a filling bar; best score persists for the session.
- Full-screen stamped scorecard with confetti and clipboard share when all outages are cleared.
- Chiptune sound effects for pick, fix, error, slot and win, with a sound toggle.

## 5. Atmosphere
- **Night:** warm window glow in every building, drifting fireflies, star trails modeled on the Auditorium night photo, a lunar arc.
- **Monsoon:** rain sheets, periodic lightning flashes, shimmering puddle reflections under each building.
- **Dependency pulses:** outage pulses travel along each edge of the overworld map with hop-depth delay.

## 6. Polish added in the final pass
- Pixel arrow cursor (ink and white), turning amber over anything clickable.
- Pixel trail that follows the pointer on desktop only.
- Letter wave across the headline every few seconds; hover stops the wave on that letter.
- CRT scanlines and soft vignette over the campus scene.
- Offset backing on each story card pops outward on hover.
- Branded text selection and a chunky ink scrollbar.
- Hero hardening: headline is plain inline text, dithered backgrounds are small image tiles, and a post-load check restores plain text if the heading ever collapses.

## 7. Accessibility and performance
- Every interactive object is a real `button` or link with visible focus; keyboard reaches bugs, blocks, towns and cartridges.
- `prefers-reduced-motion`: boot curtain, letter wave, pointer trail, parallax and character wiggles are switched off.
- State is spelled out in text, never color alone. Text contrast is checked against both the light and dark surfaces.
- One `requestAnimationFrame` loop batches parallax and the ribbon walker; `IntersectionObserver` pauses offscreen animation.
- Only external dependency is Google Fonts; everything else is inline.

## 8. Implementation notes for the real app
- React 19 + Tailwind with the palette as CSS variables per sky; shadcn/ui restyled to 3px ink borders and hard shadows.
- Role guards: `/portal`, `/workbench`, `/admin`, `/blueprint` map to the four cartridges.
- Action bars render from the backend `allowedCommands` set; illegal moves return 409 ProblemDetails and trigger the shake.
- Replace the hand-drawn icon placeholders with the licensed Streamline pixel set once downloaded.
- The pixel landmark sprites are authored as integer matrices, so they can be exported to PNG sprite sheets for the app.
