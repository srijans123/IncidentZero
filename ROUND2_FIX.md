# ROUND 2 (v2) — fix the app for real, then re-shoot the video as a screen recording

For: the Antigravity agent. Repository: `srijans123/IncidentZero`. Machine: Windows, PowerShell.
This file replaces Phase C and Phase D of `ANTIGRAVITY_MASTER_BRIEF.md`. The narration in `SCRIPT.md` and the 192 audio files from round one stay exactly as they are.

Read in this order, once: `README_FIRST.md` → this file → `video_v4/reference/PLAYBOOK.md` → `video_v4/reference/KIT_GUIDE.md`. Then do section 3, then section 4, in order, one numbered step at a time.

Changes in v2 of the package: two kit bugs fixed (the browser bar lost its address at the start of each take; line selection on GitHub picked the wrong end line), code cards now shrink their type so the longest line fits, and the bundle now carries the manual, the zoom maths, the visual specification, SVG templates, reference stills, a smoke test, a page probe and the round-one documents.

---

## 0. Rules for this round

1. **You do not design anything.** Every picture decision is already written as data in `video_v4/direction/`. Every tool is already written in `video_v4/kit/`. Your job is to run the commands below, read what they print, and apply the fix this file names for that exact message.
2. **A step is done only when its command printed the expected line.** Copy that printed line into `PROGRESS.md`. Never write PASS from memory or from reasoning. Round one's report said "100% PASS" for a video made of 52 still images; that must not happen again.
3. **Do not touch:** any `SAY` line, any file in `video_v3/03_audio/`, any `..domain..` Java file, any applied Flyway migration (`V001`–`V003`), `landing.html`.
4. **Do not regenerate audio.** No VoiceStudio, no TTS, no Whisper in this round. The word timings already exist in `video_v3/03_audio/timings.json`.
5. **Do not use** `video_v3/compose_video.py`, `scripts/run_ui_audit.mjs`, or any `window.__setShow…` hook. They are retired.
6. **What you may edit in `video_v4/direction/`** (and nothing else there): a selector or visible-text string that no longer matches the page; a `wait` you add before a step; a code anchor, moved to the line that does the same job. You may not reorder beats, remove an `expect`, remove a beat, or change diagram wording (unless a diagram label is false, in which case fix the label to match the code and log it).
7. **Three-strike rule** from the brief still applies: same failure three times → write it to `BLOCKERS.md` with the printed error and the screenshot path, then continue with the next independent step.
8. **Quota:** no `/goal`. On a 429 or `RESOURCE_EXHAUSTED`, stop at once. After every numbered step, commit and add one line to `PROGRESS.md`, and keep a `NEXT STEP:` line at the bottom of that file.

---

## 1. What was actually wrong after round one (verified in the code, not guessed)

| # | What Srijan saw | Real cause | Fixed by |
|---|---|---|---|
| 1 | The live site still says "Check backend connection" | `https://srijans123.github.io/IncidentZero/` is served from the **`gh-pages` branch**, last built on 9 Nov 2026. Every fix was pushed to `main` only. The Actions workflow uploads a Pages artifact that the site does not use. | Step R6 (`scripts/deploy-pages.mjs`) |
| 2 | Video shows "CONNECTING TO CCIT DISPATCH STREAM…" and "SYNCHRONIZING…" for minutes | `compose_video.py` shows **one PNG per scene**. The demo PNGs were captured before the lists finished loading. Nothing was ever clicked on camera. | Section 4 (real recording, with `ready` and `expect` before every app step) |
| 3 | No cursor, no selection, no highlights that follow the voice | Same: stills. | `video_v4/kit/stagekit.js` + word-timed cues |
| 4 | Technician page: clicking "Request User Info", "Resolve Incident", "Reassign" does nothing in an automated browser | The 3D clock (`SlaChronometerAndLedger3D`, react-three-fiber) suspends while drei's `<Text>` font loads, and passes that suspension to the whole page. With no `Suspense` boundary React can never commit the modal. Round one hid this with `window.__setShowResolveModal` hooks. With WebGL off the whole page crashed. | `frontend/src/components/three/Safe3D.tsx` wraps all three 3D widgets |
| 5 | Even after a deploy, the Pages app would not behave like the video | `demoBackend.ts` was a rough fake: priority from urgency only, no SLA, `verify` jumped straight to CLOSED, any user could run any command, "Resolve" was offered in ACKNOWLEDGED. | New `demoBackend.ts`, a port of the Java rules |
| 6 | Student portal lists other students' tickets | `PortalHome` called `list()` without `mine: true`. | One-line fix in `PortalHome.tsx` |
| 7 | Made-up numbers on demo screens | "Hungarian Capacity 0.0 / 8.0 PTS (Multi-Pass Engine)", "ONNX SLA BREACH PREDICTOR … 14%", "MERKLE" were hard-coded text. | Replaced by `SlaPriorityPanel.tsx` (real priority steps and SLA targets) and real counts |
| 8 | `scripts/demo-up.ps1` waits 90 s and fails | It checks `$res.token`; the API returns `accessToken`. | Fixed in the script |

---

## 2. What is in the round-two package

Unpack `ROUND2_PACKAGE.zip` over the repository root. It mirrors the repository layout.

**App (all type-checked and built; lifecycle clicked through in a browser against the in-browser backend):**

| File | Status | What it is |
|---|---|---|
| `frontend/src/services/demoBackend.ts` | replaced | In-browser backend with the same state machine, authorizer, priority matrix, SLA table, validation errors and SHA-256 chain as the Java code |
| `frontend/src/services/api.ts` | edited | `probeBackend()`: if no Java server answers, switch to the in-browser backend instead of failing; `api` picks the backend per call; last ticket kept on `window.__izLast` |
| `frontend/src/main.tsx` | replaced | Runs `probeBackend()` before the first render |
| `frontend/src/context/SseContext.tsx` | edited | No `EventSource` in demo mode; listens to a local event bus |
| `frontend/src/components/Header.tsx` | edited | Demo badge reads the runtime flag |
| `frontend/src/components/three/Safe3D.tsx` | new | Suspense + error boundary for 3D widgets |
| `frontend/src/components/three/*3D.tsx` (3 files) | edited | `<Canvas>` wrapped in `<Safe3D>` |
| `frontend/src/components/SlaPriorityPanel.tsx` | new | "PRIORITY & SLA" panel: real priority steps, targets, due times, paused chip. Has `data-testid`s the video uses |
| `frontend/src/pages/portal/PortalDetail.tsx`, `pages/workbench/WorkbenchDetail.tsx` | edited | Show the panel; fake predictor card and debug hooks removed |
| `frontend/src/pages/workbench/WorkbenchHome.tsx`, `pages/portal/PortalHome.tsx`, `pages/admin/AdminAudit.tsx` | edited | Real open-ticket count; `mine: true`; "SHA-256 HASH CHAIN" |
| `frontend/src/components/ui/ActionButton.tsx`, `ui/Modal.tsx` | edited | Debug `console.log` lines removed |
| `scripts/deploy-pages.mjs` | new | Build and push to `gh-pages`, any OS |
| `.github/workflows/deploy-pages.yml` | replaced | Runs that script on every push to `main` |
| `scripts/demo-up.ps1`, `.gitignore` | edited | Login check; ignore `video_v4/out/` |

**Video (`video_v4/`):**

| File | What it is |
|---|---|
| `kit/stagekit.js` | Injected into every page: visible cursor (arrow / hand / I-beam), click ripple, zoom camera (OpenScreen maths), blurred backdrop, code card, flow diagrams, matrix, terminal, title cards |
| `kit/lib.mjs` | Recorder (DevTools screencast → 30 fps mp4), word-cue resolver, card resolver (reads code from git), the director and all its verbs |
| `kit/cli.mjs` | `validate`, `record`, `assemble`, `gates`, `selftest-github`, `storyboard` |
| `kit/terminal.mjs` | Runs the four proof commands for real and saves their output |
| `kit/chrome.html` | The browser tab/address bar drawn above the page |
| `kit/smoke.mjs` | 20-second check of zoom, typing, card, diagram, matrix and recorder on the running app |
| `kit/probe.mjs` | Prints what is on a page (buttons, inputs, test ids, last ticket, errors) and saves a screenshot |
| `direction/code.mjs` | Acts 0–8, beat by beat |
| `direction/demo.mjs` | Acts 9–11, beat by beat, plus demo text, terminal commands, title cards |
| `direction/cards.mjs`, `direction/diagrams.mjs` | 40 code cards, 13 diagrams |
| `config.json` | URLs and knobs |
| `STORYBOARD.md` | The direction printed as plain sentences, for people |
| `samples/` | Four real frames and one 15 s clip made by this kit. **This is the look to match.** |
| `reference/KIT_GUIDE.md` | The manual: every command, every verb, the beat format, debugging recipes |
| `reference/PLAYBOOK.md` | How to work: prove with printed output, look at frames, find the cause first |
| `reference/ZOOM_LOGIC.md` + `reference/openscreen/` | The seven zoom rules with formulas, and the original OpenScreen source files (MIT) they were ported from |
| `reference/VISUAL_SPEC.md` | Every overlay in numbers: sizes, colours, fonts, states |
| `reference/templates/*.svg` | Reference pictures of the code card, flow diagram, matrix, terminal, title card and the three cursors. **Pictures to compare against only: the video never uses SVG or PNG stills.** |
| `reference/gallery/*.jpg` | 46 real renders of code cards (plain and highlighted) |

Also in the bundle root: `README_FIRST.md` (index), `docs_round1/ANTIGRAVITY_MASTER_BRIEF.md` and `docs_round1/SCRIPT.md` (round-one documents, for reference; this file wins where they differ).

**Honest test status. Read this.**
- Run and passing in a Linux sandbox: frontend type-check and build; the in-browser backend from "create" to "resolved" through real clicks; modals with and without WebGL; `deploy-pages.mjs --dry`; `cli.mjs validate` (192 beats, 40 cards, every highlight string found in the code at commit `071e524`); the steps of `smoke.mjs` (zoom, typing, card, diagram, matrix, recorder: see `samples/`); `gallery` once in full (all 13 diagrams, 3 title cards and the terminal fit; 14 cards had a line cut off on the right, which the card now fixes by shrinking its type) and once more for the first 23 cards after that fix (all fit).
- **Not run yet:** any full take; the GitHub verbs (the sandbox browser had no internet); anything against the Java backend; `terminal.mjs`; `probe.mjs` (syntax-checked only); `assemble`; `gates`. Expect to fix selectors or waits there. Section 5 and `reference/KIT_GUIDE.md` section 7 say exactly how.

---

## 3. PHASE R — repair and deploy the app

Run every command from the repository root in PowerShell.

### R0. Check the starting point
```
git status --short
git rev-parse HEAD
```
Expected: no modified tracked files, and HEAD `071e52463c181855b0f14945b20f9b2ac293700a`.
- If files are modified: `git stash -u`, continue, and say so in `PROGRESS.md`.
- If HEAD is newer: continue, but in R1 use method B.

### R1. Put the package in place
- **Method A (HEAD is `071e524`):** extract `ROUND2_PACKAGE.zip` into the repository root and overwrite.
- **Method B (HEAD is newer):** extract only `video_v4/`, `ROUND2_FIX.md` and `round2_app.patch`; then `git apply --3way --ignore-whitespace round2_app.patch` (the patch also creates the new files). Resolve any conflict by keeping **both** changes.

Then:
```
git checkout -b fix/round2
git status --short
```
Expected: about 20 changed or new paths under `frontend/src`, `scripts`, `.github`, plus `video_v4/`.

### R2. Build
```
npm --prefix frontend ci
npm --prefix frontend run build
```
Expected last lines contain `✓ built in`. Any TypeScript error: fix only that line, do not remove features.

### R3. Start the real stack
```
powershell -ExecutionPolicy Bypass -File scripts/demo-up.ps1
```
Expected: a line saying the backend answered login, and Vite on `http://localhost:3000`. Then:
```
curl.exe -s -o NUL -w "%{http_code}" http://localhost:8080/api/v1/services
curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/app.html
```
Expected: `401` and `200`.

### R4. Backend regression
```
bash scripts/verify-m1.sh
node scripts/e2e_lifecycle.mjs
```
Expected: `SUMMARY: 24 passed, 0 failed` and the lifecycle script exiting with code 0.

### R5. Prove the in-browser backend (what GitHub Pages will run)
Open a **second** terminal:
```
npm --prefix frontend run preview -- --port 4173 --host 127.0.0.1
```
Back in the first terminal:
```
node video_v4/kit/cli.mjs validate
node video_v4/kit/cli.mjs record T09 --fresh --no-setup --app http://127.0.0.1:4173
```
- `validate` expected: `0 errors`.
- `record` expected: `=== take T09 OK:` and `all requested takes recorded`. This take clicks through the whole ticket life (report → acknowledge → investigate → ask → answer → resolve → verify → close) and checks the visible state after every step with `expect`. If it stops, use section 5.
- Then stop the preview server.

### R6. Commit, push, deploy the site
```
git add -A
git commit -m "fix: round 2 — faithful in-browser backend, modal fix, real SLA panel, gh-pages deploy"
git checkout main
git merge --no-ff fix/round2 -m "merge round 2 fixes"
git push origin main
node scripts/deploy-pages.mjs
```
Wait 90 seconds, then:
```
curl.exe -s https://srijans123.github.io/IncidentZero/version.txt
git rev-parse HEAD
```
Expected: the first line of `version.txt` equals HEAD. If it does not after 5 minutes: run `git ls-remote origin gh-pages` and check the Pages setting says "Deploy from a branch: gh-pages / root"; write what you find to `BLOCKERS.md` and tell Srijan. Never push without credentials: if the push asks for a password, stop and ask Srijan.

### R7. Prove the live site
```
node video_v4/kit/cli.mjs record T09 --fresh --no-setup --app https://srijans123.github.io/IncidentZero
```
Expected: `=== take T09 OK`. This is the proof that a ticket can be created and worked on the public site.

### R8. Pin the commit
Put the output of `git rev-parse HEAD` into `"pinnedSha"` in `video_v4/config.json`. Commit that file and push. From now on, **no code changes** until the video is done. If you must change code, redo R6 and R8 and re-record every take.

### GATE R — print this table with the real printed values
| Check | Expected |
|---|---|
| `npm run build` | `✓ built in` |
| `verify-m1.sh` | `SUMMARY: 24 passed, 0 failed` |
| `e2e_lifecycle.mjs` | exit code 0 |
| T09 on preview (in-browser backend) | `take T09 OK` |
| `version.txt` on the live site | equals HEAD |
| T09 on the live site | `take T09 OK` |

---

## 4. PHASE V — record the video

### How it works (so you know what the commands do)
- A **take** is one continuous screen recording of a real browser (1920×992 page + 88 px browser bar = 1920×1080).
- A take is a list of **beats**. One beat = one narration line = one audio file. For each beat the director runs the `pre` steps silently, notes the time, then runs each `cue` at the moment its word is spoken, then waits for the audio length.
- The audio is laid onto the recording afterwards at the noted times. Sound and picture cannot drift.
- Every highlight string and code card is read from git at `pinnedSha`, so the video cannot show code that is not in the repository.

### V1. Tools
```
node -v
ffmpeg -version
npx --prefix frontend playwright install chromium
```
Node 20 or newer; ffmpeg present. If Google Chrome is not installed, delete the `"channel": "chrome"` line from `video_v4/config.json`.

### V2. Validate
```
node video_v4/kit/cli.mjs validate
```
Expected: `0 errors`. Warnings that say "timed from text position" are fine. For any `ERROR … text not in card` or `not in <file>`: open that file at `pinnedSha`, find the line that does the same job, and paste its exact text into the direction file. Nothing else.

### V2b. Gallery: look at every card and diagram before recording
```
node video_v4/kit/cli.mjs gallery
```
Expected: `gallery: 97 pictures … — 0 problems` (the count can differ by a few). Open at least ten pictures from `video_v4/out/gallery/` and compare them with `video_v4/reference/gallery/` and `video_v4/reference/templates/`. For a `PROBLEM card … too tall` line: move that card's `to` anchor up in `direction/cards.mjs` so the card has fewer lines, then run `validate` and `gallery` again.

### V2c. Smoke test (the real stack from R3 must be running)
```
node video_v4/kit/smoke.mjs
```
Expected: `SMOKE PASS`. Open the four pictures in `video_v4/out/smoke/` and compare them with `video_v4/samples/1_…png` to `4_…png`: same zoom on the title field, same yellow lines and red token, same lit step 3, same matrix. If it prints `SMOKE FAIL`, fix that before any take (section 5).

### V3. GitHub self-test (do this before any GitHub take)
```
node video_v4/kit/cli.mjs selftest-github
```
Expected: `GitHub self-test PASS`. Then **open and look at** `video_v4/out/selftest_3_selected.png` (lines of `AssignedState.java` must be selected in blue, with an I-beam cursor at the end of the selection) and `selftest_4_card.png` (code card with one yellow line and `stopResponse` marked red).

If it fails, fix **only** the named function in `video_v4/kit/lib.mjs`:

| Printed | Fix |
|---|---|
| `rowBackend: false` | In `ghRow`, the selector does not match GitHub's file rows. Open `selftest_1_hover.png`, inspect one folder link in a real browser, and add its selector to the `sel` string (keep the existing ones). |
| `clickNavigated: false` | In `ghClick`, raise the `waitForURL` timeout to 15000. |
| `lineElements: { LC: 0, dataLine: 0 }` | GitHub changed its code view. In a real browser, inspect one code line and one line number; add those selectors inside `pick` (in `ghLine`) and `rect` (in `ghSelect`). |
| warning `drag selection produced no selected text` | In `ghSelect`, change `from.x` to `boxes.A.x0 + 4` and add `await sleep(200)` after `mouse.down()`. |
| still failing after three tries | Set `"directFiles": true` in config, log it in `BLOCKERS.md`, continue. Selection warnings will then fail one gate line; report it honestly. |

### V4. Record the code acts
The real stack from R3 must be running. Then, one at a time, in this order:
```
node video_v4/kit/cli.mjs record T00 --fresh
node video_v4/kit/cli.mjs record T01
node video_v4/kit/cli.mjs record T02
node video_v4/kit/cli.mjs record T03
node video_v4/kit/cli.mjs record T04
node video_v4/kit/cli.mjs record T05
node video_v4/kit/cli.mjs record T06
node video_v4/kit/cli.mjs record T07
node video_v4/kit/cli.mjs record T08
```
Each must print `=== take Txx OK` with `0 warnings`. Each take already retries itself three times. After each take, extract one frame every 10 seconds and **look at them**:
```
ffmpeg -y -loglevel error -i video_v4/out/takes/T03.mp4 -vf "fps=1/10,scale=960:-1" video_v4/out/takes/T03_%03d.png
```
What you must see (compare with `video_v4/samples/`): a cursor in every frame that has no overlay; on GitHub file pages, blue selected lines; on cards, yellow lines with the rest blurred and a red mark on the exact words; no frame that is only a blank or half-loaded page. If a take is `OK` but a frame is wrong, treat it as a failure and use section 5.

If the landing page is not reachable in T00, record it from the local copy instead: `node video_v4/kit/cli.mjs record T00 --fresh --landing http://localhost:3000/landing.html` and note it in `PROGRESS.md`.

### V5. Record the live demo (real Java backend)
```
node video_v4/kit/cli.mjs record T09 --fresh
```
Before each attempt the take itself runs `scripts/demo-reset.ps1` and `node scripts/demo-seed.mjs`, so every attempt starts from the same four seed tickets. Expected: `take T09 OK`, `0 warnings`. Frames to check by eye: the ticket row is in the queue (never "CONNECTING…" or "SYNCHRONIZING…"), the form zooms in while text is typed, each diagram has exactly one glowing box, and the state badge changes after each click.

### V6. Capture the real terminal output, then record the proof and the team card
The closed ticket from V5 must still be in the database (do not reset between V5 and V6).
```
node video_v4/kit/terminal.mjs
node video_v4/kit/cli.mjs validate
node video_v4/kit/cli.mjs record T10
node video_v4/kit/cli.mjs record T11
```
`terminal.mjs` must print four `OK` lines. If it prints `FAIL`, the real output did not contain the fact the narration states. Do not edit the saved text. Fix the cause (for example the backend is not running, or Maven is not on `PATH`) and run it again. If `mvn` is not found, add Maven's `bin` folder to `PATH` for the session.

### V7. Assemble
```
node video_v4/kit/cli.mjs assemble
```
Writes `video_v4/out/final_video.mp4`, `subtitles.srt` (external only, never burned in) and `cues.json`.

### V8. Gate V
```
node video_v4/kit/cli.mjs gates
```
Paste the printed table into `PROGRESS.md` exactly as printed. The lines are:

| Line | Meaning |
|---|---|
| every take recorded / every beat performed | 12 takes, 192 beats |
| on-screen facts seen while recording | every `expect` found its text in the live page |
| no highlight, cue or GitHub warnings | nothing was skipped silently |
| no highlight more than 4 s behind the voice | sync |
| length between 15:30 and 19:30 | course limit is 19:55 |
| 1920x1080 at 30 fps | format |
| **no frozen picture longer than 8 s** | this is the line a slideshow cannot pass |
| picture moves for at least 85% of the video | same |
| loudness -16 LUFS ±1 | audio |
| one subtitle cue per spoken beat | 192 |

### V9. Length ladder (only if the length line fails)
- Longer than 19:30 → set `"pace": 0.6` in config, re-record T01–T08, assemble, gates.
- Still longer → also set `"directFiles": true`, re-record T03–T08, assemble, gates.
- Still longer → stop and report the measured length to Srijan. Do not cut narration.
- Shorter than 15:30 cannot happen (the audio alone is 14:31 plus pauses); if it does, a take lost beats: check "every beat performed".

### V10. Final look
```
ffmpeg -y -loglevel error -i video_v4/out/final_video.mp4 -vf "fps=1/20,scale=640:-1,tile=6x10" -frames:v 1 video_v4/out/contact_sheet.jpg
```
Open the image. Every tile must show a browser bar on top and a page, card, diagram or terminal below. Then report.

---

## 5. When a take fails: the only allowed fixes

The recorder prints `=== take T09 FAILED at beat a09b17: <message>` and saves `video_v4/out/takes/T09_FAILED_<n>.png`. Open the screenshot first. If the screenshot does not explain it, print what is on that page:
```
node video_v4/kit/probe.mjs --url "/app.html?tab=workbench" --user "Vikram Rao" --tab Workbench --row first
```
(`--user`, `--tab`, `--row`, `--click "<button text>"` are optional; `--github` adds GitHub row and line counts.) It lists every visible button label, input, test id, the last ticket's state and allowed commands, and any console or API error. Copy labels from that list, never from memory. Then:

| Message contains | Cause | Fix (in `video_v4/direction/…` unless stated) |
|---|---|---|
| `waiting for getByText('…')` / `getByRole` / `locator('…')` … `to be visible` | The text or selector is not on the page | Look at the screenshot. If the page shows the control with different wording, copy the exact visible text from the React source file into the target. If the page is the wrong page, the **previous** step did not finish: add `['ready']` then `['wait', 600]` after it. |
| `expected to see "…"` | A fact check failed | The app is wrong or slow, not the direction. Screenshot shows a spinner → add `['wait', 1500]` before the `expect`. Screenshot shows a different value (for example `P3` instead of `P2`, or an error toast) → this is an app bug: read the toast, fix the app, redo R2, R6, R8. Never delete the `expect`. |
| `page still shows a loading spinner` | Backend slow or down | Check `curl.exe http://localhost:8080/api/v1/services` gives `401`. Restart with `scripts/demo-up.ps1`. |
| `remember TICKET got nothing` | `window.__izLast` not set | The create call failed; look for a red toast in the screenshot and fix that. |
| `no audio timing for beat` | `timings.json` path wrong | Set `"timings"` in config to the real path of round one's `timings.json`. |
| `screencast produced no frame` | Browser did not start | Remove `"channel"` from config; run `npx --prefix frontend playwright install chromium`. |
| warning `hl matched nothing` / `tok not found` | Card text changed | Run `validate`; fix the string as in V2. |
| warning `GitHub row not found: X` | Folder or file is not on that page | Check the name in the repository at `pinnedSha`; fix the name. If GitHub's markup changed, fix `ghRow` as in V3. |
| click lands on the wrong thing while zoomed | Camera still moving | Add `['wait', 500]` before that click. |
| a modal does not open | — | Confirm `Safe3D.tsx` is imported in all three `*3D.tsx` files and rebuild. Do not add window hooks. |

Direction verbs you will see (all defined in `kit/lib.mjs`, `verbs = { … }`):
`goto, wait, ready, expect, remember, move, point, click, type, select, scrollTo, scrollBy, scrollTop, zoom, zoomFollow, zoomOut, callout, user, tab` (app) ·
`ghGoto, ghFolder, ghOpen, ghClick, ghHover, ghLine, ghSelect, ghUnselect` (GitHub) ·
`card, hl, tok, toks, note, unhl, cardClose` (code cards) ·
`diagram, step, glow, mark, sweep, cell, bump, diagramClose` (diagrams) ·
`term, termType, termPrint, termPoint, termClose, title, reveal, titleClose` ·
`try` (runs another verb but only warns on failure; used for decoration, never for facts).

A target is a CSS selector string, or `{ text }`, `{ role, name }`, `{ placeholder }`, `{ testid }`.
A cue time is a number of seconds, `'@word'` (when that word is spoken), `'+0.4'` (after the previous cue) or `'@end'`.

---

## 6. What the picture must look like (Srijan's six points, and where each is implemented)

1. **Code is selected and highlighted as it is spoken.**
   - On the GitHub file page the I-beam cursor drags over the exact lines the card will show (`ghSelect`): real blue browser selection.
   - The card opens over a blurred page. `hl` turns the spoken lines yellow, zooms the code so they fill the card, and blurs every other line. `tok` marks the exact expression in red at its word. Example, beat `a03b05`: lines `if (cleanTitle.length() < 5 || …` and the `throw` go yellow at second 0; on "five" the expression `cleanTitle.length() < 5 || cleanTitle.length() > 200` goes red; on "throws" the red moves to `throw new InvalidIncidentPayloadException("title"`.
   - Lists are diagrams whose boxes light on their word. Example, `a06b12`: the box `RoundRobinStrategy` glows on "round", `LeastLoadedStrategy` on "least", `SkillMatchStrategy` on "skill", `ExperienceStrategy` on "experience".
   - `unhl` / the next `hl` returns the card to normal.
2. **The video opens on the landing page** `https://srijans123.github.io/IncidentZero/`: it loads, scrolls through the sections to the bottom, the cursor clicks **Launch Full App (React)**, and the app opens (take `T00`).
3. **The demo shows a cursor and real clicks.** While typing, the camera zooms to the field (`zoom`), and around the urgency buttons it follows the mouse (`zoomFollow`). Zoom uses OpenScreen's rules, ported in `stagekit.js`: scale steps 1.25 / 1.5 / 1.8 / 2.2 / 3.5 / 5.0; transition length `600 + 550·ln(scale)` ms; spring easing; scale interpolated in log space; focus clamped so the page edge never shows; consecutive zooms pan in 1 s instead of zooming out and in; follow speed 0.10–0.25 depending on distance.
4. **Every sentence about the backend shows a flow chart over a blurred page**, with the current box glowing, earlier boxes ticked, and a strip under the chart naming the file and the exact line. The copilot (`a09b03`), the submit chain (`a09b05`–`07`), the nine-step pipeline lit 1→9 (`a09b08`), step 3 and step 9 (`a09b09`–`10`), the hash chain (`a09b11`), the priority matrix with the exam bump (`a09b13`), the acknowledge chain (`a09b19`–`23`), the paused clock (`a09b27`–`28`), the 20-character rule (`a09b33`), verify (`a09b35`–`36`), the ledger check (`a10b05`). When the chart closes, the picture is back on the app page where the result is pointed at.
5. **Nothing is described that does not happen on screen.** Each app step is preceded by `ready` (no spinner) and followed by `expect` (the new state is visible). A take cannot finish if the ticket is not in the queue.
6. **The queue shows real tickets**: four seeded by Diya plus the one Aarav creates on camera.

`video_v4/STORYBOARD.md` lists all 192 beats in plain sentences.

---

## 7. Final report (write it only from printed output)

1. Gate R table (section 3) with the printed values.
2. Gate V table exactly as `cli.mjs gates` printed it.
3. `pinnedSha`, the first line of the live `version.txt`, video length, file size.
4. Every line of `BLOCKERS.md`.
5. Every edit you made inside `video_v4/direction/` and `video_v4/kit/`, as `file: old → new`, one line each.
6. Paths: `video_v4/out/final_video.mp4`, `video_v4/out/subtitles.srt`, `video_v4/out/contact_sheet.jpg`.

Do not write "100%", "zero blockers" or "all PASS" anywhere unless every line of both tables printed PASS.

---

## 8. Left for Srijan to decide (do not act on these)

- `landing.html` says "10-state" in several places; the code and the narration say eleven state classes. The video scrolls past that card without stopping. Changing the wording is Srijan's call.
- `landing.html` shows `POST /api/v1/tickets`; the real route is `/api/v1/incidents`.
- `SystemSpecs.tsx` still describes assignment as "Hungarian min-cost"; the default strategy used in the demo is least-loaded.
