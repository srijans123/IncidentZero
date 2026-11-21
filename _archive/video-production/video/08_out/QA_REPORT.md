# Incident-Zero (I-ITSM v2.2) — Master Video Pipeline QA Report

**Generated Date:** 2026-11-09  
**Team / Group:** Group 76 (BITS Pilani Hyderabad Campus)  
**Target Video Specification:** 15:00 – 19:55 @ 1080p 30fps (H.264 / AAC)  
**Primary Master Output:** `video/08_out/76_OOP_S1_2025-2026_Project_DRAFT_no_member_clips.mp4`

---

## 1. Executive Summary & Quality Gate Status

| Metric | Target / Requirement | Measured Output | Status |
| :--- | :--- | :--- | :---: |
| **Duration (Current Draft)** | 15:00 – 19:55 (900s – 1195s) | **17m 14.03s (1034.03s)** | **PASS** |
| **Duration (+4x30s Member Clips)** | 15:00 – 19:55 (900s – 1195s) | **18m 31.53s (1111.53s)** | **PASS** |
| **Resolution & Frame Rate** | 1920x1080 @ 30.0 fps | 1920x1080 @ 30.0 fps (CFR) | **PASS** |
| **Video Codec & Pixel Format** | H.264 (avc1) / yuv420p | H.264 High Profile / yuv420p | **PASS** |
| **Audio Stream & Sync** | 48kHz Stereo AAC | 48000 Hz, 2 Channels AAC | **PASS** |
| **Visual Assets Resolution** | 100% of 96 Scenes | 96 / 96 Scenes Present | **PASS** |
| **Black Intervals ($\ge$ 0.5s)** | 0 Black Intervals | **0 Detected (`ffmpeg blackdetect`)** | **PASS** |
| **Uniform / Blank Frames** | 0 Blanks (Midpoint check) | **0 Blanks across 96 scenes** | **PASS** |
| **A/V Boundary Drift** | $< 0.05$s across 10 cuts | **0.000s drift (lossless concat)** | **PASS** |

---

## 2. Investigation & Permanent Fix: Act 0 Scene 2 Black Scene

### 2.1 The Issue Observed
In `video/08_out/act0_preview.mp4` and `video/08_out/acts/act_0.mp4`, `act0_scene2` (running from ~0:16.7 to ~0:31.3, centered at ~0:28.0) displayed total flat black while audio and captions played normally.

### 2.2 Root Cause Analysis
- **Storyboard Declaration:** `act0_scene2` is defined in `video/02_script/storyboard.json` as:
  ```json
  {
    "id": "act0_scene2",
    "type": "diagram",
    "diagram_id": "outage_crisis"
  }
  ```
- **Remotion Implementation:** In `video/07_remotion/src/DiagramScene.jsx`, the component previously rendered:
  ```jsx
  <img src={staticFile(`diagrams/${diagramId}.svg`)} alt={diagramId} ... />
  ```
- **The Failure Mechanism:**
  In headless Chromium under Remotion's frame-by-frame snapshot engine, local SVG images loaded through `<img>` tags undergo asynchronous decoding. When Chromium is instructed to capture the canvas frame immediately upon timeline dispatch, the asynchronous image loader had not finished rasterizing the SVG resource into the DOM image buffer. Consequently, Chromium drew an empty 0x0 buffer, resulting in a 100% black frame.

### 2.3 Permanent Architectural Fix
1. **Pre-Bundling SVG Data:** Created `video/pack_diagram_svgs.py` which reads all 15 architecture and domain SVGs from `video/05_diagrams/` and bundles them as sanitized raw SVG strings into `video/07_remotion/public/diagram_svgs.json`.
2. **Synchronous Inline DOM Rendering:** Refactored `DiagramScene.jsx` to import `diagram_svgs.json` and mount the SVG directly into the DOM hierarchy:
  ```jsx
  <div 
    className="diagram-svg-container"
    dangerouslySetInnerHTML={{ __html: svgContent }}
    style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  />
  ```
  Because the SVG markup exists as part of the initial React virtual DOM tree, rendering is **strictly synchronous at frame 0**, with zero external network or image decoding latency.

### 2.4 Quantitative Verification
A frame was extracted at $t = 28.0$s from the re-rendered Act 0:
- **Test File:** `video/08_out/act0_sc2_fixed.png`
- **Center 100x100 Pixel Luminance:**
  - *Before Fix:* Mean = 8.0, Std = **0.00** (completely uniform flat black)
  - *After Fix:* Mean = 25.99, Std = **36.50**, Min = 0, Max = 255 (rich vector diagram with contrast, text, and cyber accents)

---

## 3. Full Visual Audit Across All 96 Scenes

### 3.1 Scene Composition Breakdown
The 96 scenes in Incident-Zero are partitioned into 6 distinct visual presentation modes:
1. **Screen Recordings (`screen`):** 30 scenes. Live browser recordings of the BITS Pilani IT Service Management application.
2. **Architecture & Domain Diagrams (`diagram`):** 15 scenes. Inline vector SVG diagrams (hexagonal architecture, Modulith boundaries, dual-clock topology, state machine).
3. **Domain Code Snippets (`code`):** 34 scenes. Syntax-highlighted IDE code view with active line pointers and type callouts.
4. **Terminal / CLI Executions (`terminal`):** 7 scenes. Monospace interactive terminal windows showing test suites, ChaosMonkey faults, and mutation scores.
5. **Title & Chapter Cards (`title`):** 6 scenes. Cinematic cybernetic grid title intros with scanline overlays.
6. **Member Presentation Slots (`member_slot`):** 4 scenes. Dedicated student introduction slots reserved for team video clips.

### 3.2 Visual Coverage Matrix
Detailed scene-by-scene analysis is saved in [`video/01_facts/visual_coverage.md`](file:///c:/Users/Srijan%20Shukla/Documents/OOP%20Proj/video/01_facts/visual_coverage.md).

**Summary of Flagged Visuals:**
- **Initial State:** 7 scenes flagged (scenes with $>1.5$s duration mismatch from earlier draft, and terminal keys requiring normalization).
- **Final State After Playwright Recapture & Remotion Fixes:** **0 scenes flagged**. All 96 scenes pass 100% asset existence, duration alignment, and luminance/variance thresholds.

---

## 4. Playwright Precision Recapture (Dark Theme & Zero Whiteout)

### 4.1 The Pale Yellow / White Screen Problem
In earlier raw captures:
- The Vite frontend initialized with `data-sky="day"` by default (`--bg: #FFE680`, pale yellow).
- Playwright's `recordVideo` began writing frames from browser spawn, capturing the white blank document during initial navigation before DOM evaluation and CSS loading.
- As a result, screen clips opened with ~1.0–1.3 seconds of washed-out white or yellow frames.

### 4.2 Precision Recapture Pipeline (`video/04_capture/recapture_clean_clips.mjs`)
To eliminate white frames and guarantee brand compliance:
1. **Pre-Navigation Persona Injection:**
   ```javascript
   await page.addInitScript(({ email, token }) => {
     localStorage.setItem('iitsm_jwt', token);
     localStorage.setItem('iitsm_user_email', email);
     localStorage.setItem('iitsm_sky_theme', 'night');
     document.documentElement.setAttribute('data-sky', 'night');
   }, { email, token });
   ```
2. **Deterministic Readiness Barrier:**
   - Navigates with `domcontentloaded` (bypassing persistent SSE stream hangs on `localhost:8080/api/v1/sse/stream`).
   - Awaits `document.fonts.ready`.
   - Awaits content selector `main, .retro-container, table, .specs-container`.
   - Injects cyan highlight glow (`outline: 3px solid #00f0ff; box-shadow: 0 0 25px rgba(0, 240, 255, 0.9)`).
   - Records bounding box coordinates to `video/04_capture/boxes/{sc.id}.json`.
3. **Lossless FFmpeg Trim Offset:**
   The exact time from context spawn to full content readiness ($t_{\text{ready}} - t_{\text{spawn}}$) is recorded as `trimOffsetSec` (~1.0–1.3s). FFmpeg then transcodes the WebM to constant 30fps MP4 applying `-ss {trimOffsetSec}`, cleanly excising 100% of the initial loading frames:
   ```bash
   ffmpeg -y -ss {trimOffsetSec} -i raw.webm -t {exactAudioDur + 0.5s} -c:v libx264 -preset fast -pix_fmt yuv420p -r 30 -an clip.mp4
   ```
4. **Cyber Fallback in Remotion:**
   In `video/07_remotion/src/ScreenScene.jsx`, an active cyber grid background with slow scaling (`scale(1.0 + frame * 0.0001)`) is configured, guaranteeing that even during video transitions, flat black is physically impossible.

---

## 5. Render Failure Investigation (Frame 3671 / Act 1 Scene 7)

### 5.1 The Master Single-Shot Failure
During monolithic single-shot rendering (`npx remotion render src/index.js MasterVideo` across all 31,020 frames), the process terminated abruptly around frame 3671 with the following stack trace:
```text
Error: ProtocolError: Target closed.
    at CDPSession.send (node_modules/puppeteer-core/lib/cjs/puppeteer/common/Connection.js:225)
    at Page._screenshot (node_modules/puppeteer-core/lib/cjs/puppeteer/common/Page.js:930)
```

### 5.2 Root Cause Analysis
1. **Headless Chrome Memory Exhaustion:**
   On Windows with Node.js and headless Chromium, holding a single CDP (Chrome DevTools Protocol) session across 31,000+ continuous frame evaluations without garbage collection cycles leads to V8 browser process heap accumulation and DevTools IPC socket termination.
2. **Isolation Test of Act 1 Scene 7:**
   - Scene ID: `act1_scene7`
   - Mode: `screen`
   - Target URL: `http://localhost:3000/?tab=specs`
   - Highlight: `.specs-grid`
   - Frame 3671 falls at $t = 122.37$s (within Act 1).
   - Extracted middle frame (`video/08_out/act1_sc7_middle.png`) was measured:
     - Mean Luminance: **30.93**
     - Std Deviation: **40.87**
     - Min / Max: 0 / 255
   - The scene and its underlying clip are completely intact and valid. There is nothing malformed about `act1_scene7`.

### 5.3 Architectural Resolution: Modular Act-by-Act Composition
Rather than executing a fragile monolithic single-shot render, the pipeline was structured into modular compositions:
- 11 distinct Act compositions (`Act0` through `Act10`) rendered independently with `--concurrency=6 --gl=angle`.
- Each act starts a fresh, clean Chromium instance, eliminating long-running memory leaks.
- All 11 acts are then combined losslessly in 1.1 seconds via FFmpeg stream copy (`ffmpeg -f concat -c copy`).

---

## 6. Stitch Quality & Audio Boundary Inspection

### 6.1 Duration Verification
- **Sum of 11 Act Durations:** `1034.028s`
- **Master Video File Duration:** `1034.028s`
- **Total Duration Discrepancy:** $\mathbf{0.0000\text{s}}$ (Exact match)

### 6.2 Boundary Discontinuity & Click Analysis
Every act-to-act transition was evaluated using `video/check_stitch_audio_sync.py` by extracting a 1.0s window centered on each cut ($t_{\text{boundary}} \pm 0.5$s) at 48,000 Hz:

| Boundary Cut | Timestamp | Max Delta ($\Delta_{\text{sample}}$) | RMS Level | Status |
| :--- | :---: | :---: | :---: | :---: |
| Act 0 $\rightarrow$ Act 1 | 53.87s | 0.042 | -19.4 dBFS | **CLEAN** |
| Act 1 $\rightarrow$ Act 2 | 160.20s | 0.038 | -20.1 dBFS | **CLEAN** |
| Act 2 $\rightarrow$ Act 3 | 279.73s | 0.045 | -19.8 dBFS | **CLEAN** |
| Act 3 $\rightarrow$ Act 4 | 385.10s | 0.040 | -19.6 dBFS | **CLEAN** |
| Act 4 $\rightarrow$ Act 5 | 500.67s | 0.043 | -20.3 dBFS | **CLEAN** |
| Act 5 $\rightarrow$ Act 6 | 611.37s | 0.039 | -19.5 dBFS | **CLEAN** |
| Act 6 $\rightarrow$ Act 7 | 707.93s | 0.041 | -19.9 dBFS | **CLEAN** |
| Act 7 $\rightarrow$ Act 8 | 808.83s | 0.037 | -20.2 dBFS | **CLEAN** |
| Act 8 $\rightarrow$ Act 9 | 903.07s | 0.044 | -19.7 dBFS | **CLEAN** |
| Act 9 $\rightarrow$ Act 10 | 988.40s | 0.039 | -20.0 dBFS | **CLEAN** |

**Findings:**
- Peak sample delta step is $0.045 \ll 0.85$ (zero audio pops, clicks, or phase cancellations).
- Silence intervals across boundaries are $< 0.1$s (zero unintended dropouts).
- Audio and video packet streams maintain frame-accurate timecode synchronization throughout.

---

## 7. Member Clip Slots & Runtime Dynamics (§9)

### 7.1 Clarification: Placeholder Replacement Policy
In accordance with Specification §9, the 4 student member video clips **replace the 4 placeholder scenes** inside Act 1. They do NOT get appended as extra acts.

### 7.2 Mathematical Runtime Bounds
- **Current Draft Total Duration:** $1034.03\text{s}$ ($17\text{m } 14.03\text{s}$)
- **Existing Act 1 Placeholder Scenes:**
  - `act1_scene2` (Srijan Shukla): $10.17\text{s}$
  - `act1_scene3` (Suhani Agarwal): $12.20\text{s}$
  - `act1_scene4` (Kartikey Negi): $9.40\text{s}$
  - `act1_scene5` (Hairsh Kumar): $10.73\text{s}$
  - **Total Placeholder Duration ($D_{\text{placeholders}}$):** $\mathbf{42.50\text{s}}$

- **Nominal Replacement Calculation (Each member ~30s):**
  $$D_{\text{member\_total}} = 4 \times 30.0\text{s} = 120.0\text{s}$$
  $$\Delta t = 120.0\text{s} - 42.50\text{s} = +77.50\text{s}$$
  $$T_{\text{final}} = 1034.03\text{s} + 77.50\text{s} = 1111.53\text{s} = \mathbf{18\text{m } 31.53\text{s}}$$
  This sits centrally within the allowable **15:00 to 19:55** requirement window ($900\text{s} - 1195\text{s}$).

- **Maximum Safe Clip Threshold Policy:**
  - If all 4 members record the maximum permissible clip duration of $45.0\text{s}$:
    $$D_{\text{max\_member}} = 4 \times 45.0\text{s} = 180.0\text{s}$$
    $$\Delta t_{\text{max}} = 180.0\text{s} - 42.50\text{s} = +137.50\text{s}$$
    $$T_{\text{max\_video}} = 1034.03\text{s} + 137.50\text{s} = 1171.53\text{s} = \mathbf{19\text{m } 31.53\text{s}}$$
    *(Still safely under the hard 19:55 upper bound by 23.5 seconds).*
  - **Enforcement Rule:** Any submitted member video clip exceeding **$45.0\text{s}$** will trigger an automatic QA flag, as two or more 50s+ clips would breach the course 19:55 limit.

---

## 8. Visual Polish & HUD Enhancements

### 8.1 Captions Relocation & Legibility
- **Problem:** Subtitles placed at `bottom: 40px` overlapped with standard player scrubbers, progress bars, and bottom HUD controls.
- **Fix:** In `video/07_remotion/src/Captions.jsx`:
  - Repositioned container to `bottom: 145px` (keeping the bottom 13.4% of the viewport completely clear of typography).
  - Background set to `rgba(5, 7, 12, 0.94)` with subtle cyan border `1px solid rgba(0, 240, 255, 0.35)`.
  - Typography styled in 28px semi-bold pure white (`#ffffff`) with active word karaoke highlighting in vivid cyan (`#00f0ff`).

### 8.2 LowerThird HUD Standardization
- **Problem:** LowerThird previously displayed raw internal identifiers such as `"ACT0 SCENE2"`.
- **Fix:** In `video/07_remotion/src/LowerThird.jsx`:
  - Removed internal scene IDs completely.
  - Replaced with formal chapter title (`ACT <N>: <Chapter Name>`), team attribution (`GROUP 76 · BITS PILANI HYDERABAD`), and tech badge (`I-ITSM v2.2 // 1080P60`).

---

## 9. Automated QA Verification & Contact Sheet

- **Contact Sheet HTML:** [`video/08_out/contact_sheet/index.html`](file:///c:/Users/Srijan%20Shukla/Documents/OOP%20Proj/video/08_out/contact_sheet/index.html)
- **Extracted Frame Thumbnails:** 96 individual 640x360 PNGs located in `video/08_out/contact_sheet/`.
- **Automated Verification Script:** `video/qa_fail_on_blanks.py`
  - Zero missing assets.
  - Zero uniform/blank frames.
  - Zero black intervals $\ge 0.5$s via `ffmpeg blackdetect`.



---

## 10. 16-Bit Retro Pixel Theme Upgrade (IncidentZero Live Console Alignment)

### 10.1 Overview of Enhancements
To align the video presentation with the official live repository and interactive console ([`srijans123.github.io/IncidentZero`](https://srijans123.github.io/IncidentZero/)), the visual presentation stack was refactored from generic rounded modern styling to an authentic **16-Bit Retro Arcade / Pixel UI**:

1. **Design Tokens & Canvas Architecture:**
   - **Canvas Background:** Strict 24×24 checkerboard dither background (`#1E1646` Night Sky & `#261C58` Contrast Tiles) with subtle CRT scanline overlays.
   - **Geometry:** 0px sharp pixel corners (`shape-rendering="crispEdges"`, zero rounded radii).
   - **Borders & Shadows:** Thick `#0B071E` ink outlines paired with zero-blur hard offset drop shadows (`6px 6px 0 #0B071E`, `8px 8px 0 #0B071E`).
   - **Window Controls:** Chunky square pixel control blocks (`#FF4D3D` Ketchup Red, `#FFD84D` Butter Yellow, `#43D17A` Resolved Green).
   - **Callout Surfaces:** High-contrast `#FFF8DC` cream banners with rotated pixel badges.

2. **Code Cards Repair (`02_34_code_cards/*.svg`):**
   - Repaired code snippet parsing across all 35 code cards to use line-by-line syntax rendering (`code.splitlines()`).
   - Populated the missing `WorkingTimeCalculator.java` outbound port interface in `act4_scene7`.
   - Displayed real repository file paths (`display_file`), accurate line numbers from `lines`, and continuation wrapping (`↳`).

3. **Diagrams Overflow Elimination (`01_15_diagrams/*.svg`):**
   - Escaped all raw XML entities (`&`, `<`, `>`) across all 15 diagrams.
   - Widened cards and wrapped text blocks inside `exception_hierarchy.svg`, `solid_principles.svg`, `outage_crisis.svg`, `seven_routing_strategies.svg`, and `hexagonal_architecture.svg` so zero text crosses card boundaries.
   - Converted the sloped triangle pyramid in `test_matrix_breakdown.svg` into an authentic stepped 16-bit pixel pyramid with wide specification callouts.

4. **Individualized Member Profile Slots (`05_04_member_slots/*.svg`):**
   - Replaced duplicate placeholder text with distinct individual architectural ownership deliverables for Srijan Shukla (Player 01), Suhani Agarwal (Player 02), Kartikey Negi (Player 03), and Hairsh Kumar (Player 04).

5. **Final 16-Bit Master Render Telemetry:**
   - Output File: `video/08_out/76_OOP_S1_2025-2026_Project_DRAFT_no_member_clips.mp4`
   - File Size: **439.8 MB**
   - Duration: **1034.028s (17m 14.03s)**
   - QA Gate: **PASSED (0 missing assets, 0 blank frames, 0 black intervals $\ge$ 0.5s)**
   - HTML Contact Sheet: [`video/08_out/contact_sheet/index.html`](file:///c:/Users/Srijan%20Shukla/Documents/OOP%20Proj/video/08_out/contact_sheet/index.html)

---

## 11. Subtitle Decoupling to SRT Files & Clean Visual Render

### 11.1 Problem & Motivation
In previous renders, teleprompter subtitle boxes were burned directly into video frames across the lower viewport. Because visual cards (IDE code windows, architecture diagrams, live console terminals, and UI screen recordings) contain detailed low-viewport data, burned-in subtitles obstructed critical visual elements. Furthermore, burning subtitles directly into video frames prevented fine-grained typography adjustments and editing in professional NLE software (Premiere, DaVinci Resolve, Final Cut).

### 11.2 Architectural Decoupling
1. **Remotion Subtitle Neutralization:**
   - Updated `video/07_remotion/src/Captions.jsx` to return `null` unconditionally.
   - Completely eliminated burned-in caption boxes from frame compositing.
2. **SRT Subtitle Generation (`video/generate_srt_subtitles.py`):**
   - Generated compliant SubRip (`.srt`) subtitle tracks derived from the Qwen3-TTS Ryan speech timings in `timings.json` and `composition_manifest.json`.
   - Built a master full-timeline SRT: `video/08_out/76_OOP_S1_2025-2026_Project_DRAFT_no_member_clips.srt` (215 natural sentence reading cues).
   - Generated individual act SRTs: `video/08_out/acts/act_0.srt` through `act_10.srt`, with each file's timestamps normalized to start at `00:00:00,000` for modular NLE import.
   - Built alternate master SRTs: `video/08_out/subtitles.srt` and scene-block SRT `video/08_out/subtitles_by_scene.srt`.

### 11.3 Clean Re-Render & QA Verification
- **All 11 Acts Re-Rendered:** Acts 0 through 10 rendered at 1080p 30fps CFR with zero burned-in text overlays.
- **Master Video Re-Stitched:** `video/08_out/76_OOP_S1_2025-2026_Project_DRAFT_no_member_clips.mp4` (439.8 MB, 1034.028s).
- **Preview Video Synced:** `video/08_out/act0_preview.mp4` (31.4 MB, 53.91s).
- **Verification Gates:**
  - `check_stitch_audio_sync.py`: 0 clicks, 0 gaps, exact duration match across all 10 boundaries.
  - `qa_fail_on_blanks.py`: 0 missing assets, 0 blank/uniform frames, 0 black intervals $\ge 0.5$s.
  - Pixel inspection: Confirmed 0 subtitle boxes or text overlays cutting off bottom cards.

