# Visual specification — every overlay, in numbers

All of this is already implemented in `kit/stagekit.js`. Use this file to **check** a frame, not to rebuild anything.
Live versions of every card and diagram: `node video_v4/kit/cli.mjs gallery` → `video_v4/out/gallery/`. Reference pictures: `reference/templates/*.svg`, `reference/gallery/*.jpg`, `samples/*.png`.

## Frame
- Final video 1920×1080, 30 fps. Top 88 px: browser bar (`kit/chrome.html`: tab strip 42 px + address bar 46 px, background `#202124` / `#35363A`). Below it: the recorded page, 1920×992.
- No subtitles in the picture. Subtitles are only in `subtitles.srt`.

## Colours
| Name | Hex | Used for |
|---|---|---|
| ink | `#1B1530` | borders, hard shadows, text |
| cream | `#FFF8DC` | diagram and title backgrounds |
| yellow | `#FFD84D` | chips, notes |
| hot yellow | `#FFE14D` | highlighted code lines, active diagram box |
| red | `#FF4D3D` | exact-token mark, glow ring, click ripple, result pill |
| green | `#43D17A` | terminal prompt; "done" boxes use `#DDF7E6` |
| sky | `#59C9F5` | line-range label |
| card background | `#17122E` | code card and code strip |
| backdrop | `rgba(14,10,36,.62)` + `blur(14px) saturate(.75)` | behind every overlay |

## Fonts
- Code: `"JetBrains Mono","Cascadia Code",Consolas,ui-monospace,Menlo,monospace`.
- Labels: `"Space Grotesk","Segoe UI",system-ui,sans-serif`, weight 800 for titles.

## Cursor
- 34×34 px sprite, drop shadow `0 2px 2px rgba(0,0,0,.45)`. Three shapes: arrow (default), hand (links, buttons, selects), I-beam (text, inputs, code). Shape is chosen from the element under the pointer.
- Movement: eased (cubic in-out), slightly bowed path, duration `180 + 0.55·distance` ms, limited to 260–950 ms.
- Click: red ring ripple, 16 px growing ×4.2 over 550 ms.
- `point`: red rounded rectangle 4 px, pulsing glow, 8 px outside the element.

## Code card
- Width 1560 px, centred. Border 4 px ink, shadow 12 px 12 px. Title bar: three squares (red, yellow, green), last three folders + file name (file name yellow), `lines A–B` on the right in sky.
- Code size by line count: ≤14 lines 25 px, ≤20 lines 22 px, ≤26 lines 19.5 px, more 17.5 px; then shrunk until the longest line fits. Line height 1.55. Real line numbers in a 78 px gutter.
- Syntax colours: keyword `#FF8AD0`, string `#9BE28B`, comment `#7D78A8` italic, number `#FFB86B`, Type `#7FD6FA`, annotation yellow, call `#C9B6FF`.
- **Focus state (`hl`)**: spoken lines get a hot-yellow background with ink text; every other line gets `blur(5px)` and 28% opacity; the code scales up (max 2.1×) so the yellow lines fill up to 94% of the width and 62% of the height, in 0.7 s.
- **Token (`tok`)**: exact characters get a red background and white text, pulsing once a second. Only one token mark at a time.
- **Note (`note`)**: yellow chip, 26 px bold, top right, rotated 2°, pops in.
- `unhl` or the next `hl` clears the previous state.

## Flow diagram
- Cream panel, 4 px ink border, 12 px shadow, title 34 px, subtitle 19 px mono.
- Boxes: white, 3 px border, 5 px shadow, label 22 px bold, sub-label 15.5 px mono, optional numbered tab top-left. Arrows 4 px ink at 35% opacity.
- States: not yet reached 50% opacity · **current** hot yellow, scaled 1.07, red glow that pulses, incoming arrow red · **done** green tint with a tick.
- Strip under the chart (dark): yellow file path · white exact code line of the current box.
- `step` moves "current" forward and ticks the previous box. `glow` lights one box without ticking others (for lists). `mark` recolours a box (`good` green, `warn` orange, `bad` red) and can change its sub-label. `sweep` runs `step` over a list in a given time.

## Matrix
- 3×3 cells 150×84 px, 8 px gaps; lit cell hot yellow, scaled 1.1, red glow. Bump row below: `P3 → reason chip → P2` with the result in a red pill.

## Terminal
- 1500 px wide, 640 px text area, background `#0B0A14`, text `#C8F5D2` 21 px mono, green `$ ` prompt, blinking block caret. `termPoint` puts a hot-yellow bar on the line that contains the given text.

## Title card
- Cream panel, title 60 px, tag line 24 px mono, rows of name (34 px bold, 360 px column) + role (22 px mono). Rows start at 18% opacity and slide in on `reveal`.

## Chapter chip
- Yellow chip top-left, 22 px mono bold, shown for 2.6 s at the start of each act.

## What a good frame looks like
1. A cursor is visible unless a diagram, terminal or title card covers the page.
2. At most one thing is "hot" at a time: one glowing box, or one set of yellow lines with one red token.
3. Behind any overlay the page is blurred and dark; with no overlay the page is sharp.
4. An app frame never shows "CONNECTING…", "SYNCHRONIZING…" or "ENGAGING…".
