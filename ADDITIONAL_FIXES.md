# ADDITIONAL FIXES — finishing the checks that were cut short, and what to do after each one

For: the Antigravity agent. Use together with `ROUND2_PACKAGE_v2.zip`, `ROUND2_FIX.md` (v2), `STORYBOARD.md` and `apply_additional_fixes.mjs`.
`ROUND2_FIX.md` is still the task list. This file adds five parts to it. Where the two differ, this file wins.

| Part | When to do it | What it is |
|---|---|---|
| A | right after step R1 of `ROUND2_FIX.md` | run one script: four small kit changes and one new tool |
| B | at step V2b | finish the card and diagram check that was stopped half way |
| C | after every take (steps V4, V5, V6) | one picture per narration line, and exactly what each must show |
| D | at step V8, only for a gate line that prints FAIL | the one repair allowed for each line |
| E | whenever something not covered appears | how to decide, in order |

---

## Part A — do this right after step R1

Four small changes to the recording kit, and one new tool. A script applies them exactly.

### A1. Run the script
Put the attached file `apply_additional_fixes.mjs` in the repository root (the folder that contains `ROUND2_FIX.md`). Then:
```
node apply_additional_fixes.mjs
```
Expected output (each of the first four lines starts with `PATCHED` or `ALREADY`):
```
ALREADY  1 card text fits the card
PATCHED  2 lateness counted only for word-timed cues
PATCHED  3 lateness rule
PATCHED  4 final picture of each beat is held and its time saved
WRITTEN  video_v4/kit/frames.mjs

ADDITIONAL FIXES: ALL APPLIED
```
Paste the printed lines into `PROGRESS.md`.

What the changes are, so you know what you are running:

| # | File | Change | Why |
|---|---|---|---|
| 1 | `kit/stagekit.js` | A code card shrinks its text until its longest line fits | 14 cards had a line cut off on the right. Already in v2; the script only checks it. |
| 2, 3 | `kit/lib.mjs` | A cue is counted as "late" only if it is tied to a spoken word or a clock time, and only if no page change came before it in the same line | A line that opens a new file browses GitHub while the sentence is spoken; its first highlight is allowed to land just after the sentence. Without this the gate "no highlight more than 4 s behind the voice" fails for every such line. |
| 4 | `kit/lib.mjs` | Every line keeps its final picture for at least 0.45 s after its last cue, and saves that time | A highlight that finished late is still seen, and the picture tool can photograph the finished state. |
| 5 | `kit/frames.mjs` (new) | Saves one picture per narration line | Used in Part C. |

### A2. Only if the script prints `FAIL` for a line: do that one change by hand
- `FAIL … lib.mjs not found` → you are not in the repository root, or the v2 zip is not unpacked. Fix that and run again.
- `FAIL 1 …` → open `video_v4/kit/stagekit.js`. Inside `Z.card = {` → `async open(def) {` find the two lines
  `card = { node, code, def, note: null };` and `await show('card', node);`. Put these seven lines directly **above** them:
  ```js
        // shrink the type until the longest line fits, so nothing is cut off on the right
        mount(); node.style.visibility = 'hidden'; layer.appendChild(node);
        const view = node.querySelector('.view');
        if (code.scrollWidth > view.clientWidth) {
          const fit = Math.max(12.5, fs * (view.clientWidth / code.scrollWidth) * 0.985);
          node.style.setProperty('--fs', fit + 'px'); node.style.setProperty('--h', Math.min(860, Math.round(n * fit * 1.55 + 36)) + 'px');
        }
        node.style.visibility = '';
  ```
- `FAIL 2 …` or `FAIL 3 …` → open `video_v4/kit/lib.mjs`, find `async take(take) {`. In it:
  - change `let prevAt = 0;` to `let prevAt = 0, afterSlow = false;` and add on the next line
    `const SLOW_VERBS = new Set(['goto', 'ghGoto', 'ghFolder', 'ghOpen', 'ghClick', 'ghSelect', 'user', 'tab', 'type']);`
  - replace the line that starts `if (wait < -350) this.late.push(` with these three lines:
    ```js
            const relative = typeof cue === 'string' && cue.startsWith('+');
            if (wait < -350 && !afterSlow && !relative) this.late.push({ beat: beat.id, cue: String(cue), by: +(-wait / 1000).toFixed(2) });
            if (SLOW_VERBS.has(step[0])) afterSlow = true;
    ```
- `FAIL 4 …` → in the same function replace the line `await sleep((T + D + (beat.hold ?? 0.3) - this.t()) * 1000);` with:
  ```js
        this.marks.at(-1).e = +this.t().toFixed(3);
        await sleep(Math.max(450, (T + D + (beat.hold ?? 0.3) - this.t()) * 1000));
  ```
- `FAIL syntax error …` → the hand edit broke a bracket. Unpack that one file again from `ROUND2_PACKAGE_v2.zip` and run the script again.

Run `node apply_additional_fixes.mjs` again until its last line is `ADDITIONAL FIXES: ALL APPLIED`.

### A3. Check and commit
```
node video_v4/kit/cli.mjs validate
```
Expected: `0 errors`. Then `git add -A` and commit with the message `chore: round 2 additional kit fixes`. Continue with step R2 of `ROUND2_FIX.md`.

---

## Part B — step V2b in full (the check that was stopped half way)

What was already seen before the stop: all 13 diagrams, all 3 title cards and the terminal fit the page. 14 code cards had their longest line cut off on the right; after the fix (change 1 in Part A), the first 23 cards were drawn again and all fit. **The other 17 cards have not been drawn since the fix. You finish it.**

### B1. Run it
```
node video_v4/kit/cli.mjs gallery
```
Expected last line: `gallery: 97 pictures in video_v4/out/gallery — 0 problems` (the number of pictures may differ by a few).

### B2. If it prints a `PROBLEM` line, apply exactly this

| Line starts with | Meaning | Fix |
|---|---|---|
| `PROBLEM card C…: … lines do not fit the card (…px too tall)` | too many lines | In `video_v4/direction/cards.mjs`, find that card. Lower `plus` by the number of lines needed (each line is about 30 px). If `plus` is already 0 or absent, change `to` to the text of a line that is that many lines higher in the same file. Then run `node video_v4/kit/cli.mjs validate`. If `validate` now says a highlight is "not in card", the line you removed is needed: undo, and instead split the card: copy the card entry, give the copy the id with `2` added (for example `C04-A2`), set its `from` to the first line you cut and keep the old `to`; then in `video_v4/direction/code.mjs`, in the beat `validate` named, add `['card', '<new id>']` as a `pre` step. |
| `PROBLEM card C…: longest line is …px wider than the card` | change 1 of Part A is missing or the line is extremely long | Run `node apply_additional_fixes.mjs` again; line 1 must say `ALREADY` or `PATCHED`. If the problem stays, in `video_v4/kit/stagekit.js` change `12.5` to `11` in the line `const fit = Math.max(12.5, …` and run `gallery` again. |
| `PROBLEM diagram …: …x… does not fit the 1920x992 page` | diagram too wide or tall | In `video_v4/direction/diagrams.mjs`, for that diagram set `nodeWidth: 240`. If it still does not fit, lower `cols` by 1. |

Repeat B1 until it prints `0 problems`.

### B3. Look at these pictures (open each one)
All are in `video_v4/out/gallery/`.

| Picture | It must show |
|---|---|
| `card_C03-A_1_plain.png` | Title bar `iitsm/incident/domain/Incident.java` (file name yellow) and `lines 90–114`; 25 numbered lines; the right end of the longest line is inside the card |
| `card_C03-A_2_focus.png` | Only the line `public static Incident createWithNumber(` is yellow; every other line is blurred and faint |
| `card_C03-H_1_plain.png`, `card_C05-C_1_plain.png`, `card_C06-D_1_plain.png` | These had the longest lines. Each line must end inside the card, and the text must still be readable |
| `card_C07-G_1_plain.png` | SQL: `CREATE OR REPLACE FUNCTION audit_immutable()` at the top, `CREATE TRIGGER audit_no_change` near the bottom |
| `card_C08-D_2_focus.png` | The line `{allowed.includes('ACKNOWLEDGE') && (` is yellow |
| `diagram_pipeline.png` | Nine numbered boxes in two rows (5 + 4); box 1 green with a tick, box 2 yellow with a red glow; a dark strip under the boxes |
| `diagram_strategies.png` | `AssignmentStrategy` on the top row, seven strategy boxes under it |
| `diagram_matrix.png` | 3×3 grid; the middle cell (`P3`) yellow; under it `P3 → the text says "quiz" → exam window, one level up → P2` with `P2` in red |
| `diagram_ackFlow.png` | Eight boxes in two rows of four, numbered, the first shows `▶` |
| `title_team.png` | `Incident-Zero`, the group line, and four names with their roles |
| `terminal.png` | `$ bash scripts/verify-m1.sh`, three output lines, the `SUMMARY` line on a yellow bar |

Compare the look with `video_v4/reference/gallery/*.jpg` and `video_v4/reference/templates/*.svg`. If a picture shows the right content but in a different style, that is fine. If content is missing or cut off, apply B2.

Write in `PROGRESS.md`: the last line `gallery` printed, and the names of the pictures you opened.

---

## Part C — after every take: one picture per line, and what it must show

### C1. Make the pictures
After each `record` command prints `=== take Txx OK`:
```
node video_v4/kit/frames.mjs Txx
```
It prints `Txx: N/N pictures`. The pictures are `video_v4/out/frames/<beat id>.png`, one for each narration line, taken when everything that line shows is on screen: just before its voice ends, or just after its last cue finished, whichever is later.

### C2. Rules for every picture
1. The top of the picture is a web page, a code card, a diagram, a terminal or a title card. Never a blank page, never an error page.
2. If there is no diagram, terminal or title card, a mouse cursor is visible.
3. Behind a card, diagram, terminal or title card the page is dark and blurred.
4. An app page never shows `CONNECTING TO CCIT`, `SYNCHRONIZING LIVE` or `ENGAGING TECHNICIAN`.
5. At most one diagram box glows red. At most one piece of code is marked red.

### C3. Pictures you must open, and what each must show
"Yellow" = yellow line background on a code card. "Red" = the red mark on exact characters. "Cursor on X" = the mouse cursor sits on X (the red ring that pointed at it may already have faded).

| Take | Picture | Must show |
|---|---|---|
| T00 | `a00b01.png` | The landing page, top part, big pixel title |
| T00 | `a00b04.png` | Landing page section with the buttons `Verify ledger`, `Mutate 1 byte`, `Repair chain` |
| T00 | `a00b05.png` | Bottom of the landing page, cursor on `Launch Full App (React)` |
| T00 | `a00b06.png` | The React app: header with `Campus Stage`, `Student Portal`, `Workbench`; cursor on the `Workbench` tab |
| T00 | `a00b07.png` | Student Portal page, cursor on `Report New Incident` |
| T01 | `a01b02.png` | GitHub README, cursor on `It is deliberately small to operate` |
| T01 | `a01b05.png` | GitHub file list, hand cursor on the `frontend` row |
| T01 | `a01b06.png` | GitHub folder `docs/adr`, files `ADR-001.md` … visible |
| T02 | `a02b05.png` | GitHub module folders; cursor on `shared` |
| T02 | `a02b10.png` | Diagram "Inside every module: four layers"; `domain` box green with `depends on nothing outside` |
| T02 | `a02b12.png` | Card `ArchitectureTest.java`; yellow on the line with `"tools.jackson.."`; that text red |
| T02 | `a02b13.png` | Same card; yellow on the `R1_domain_has_zero_framework_imports` line; note `Checked on every build` |
| T03 | `a03b03.png` | GitHub `Incident.java`; about 25 lines selected in blue; text cursor at the end of the selection |
| T03 | `a03b05.png` | Card `Incident.java`; yellow on `if (cleanTitle.length() < 5 …` and the `throw` line under it; red on `throw new InvalidIncidentPayloadException("title"` |
| T03 | `a03b06.png` | Yellow on the `impact` and `urgency` checks; red on `urgency < 1 \|\| urgency > 3` |
| T03 | `a03b08.png` | No yellow lines; note `Encapsulation` |
| T03 | `a03b13.png` | Card with `private void commit(`; yellow on `if (changed) this.version++;`; red on `this.version++` |
| T03 | `a03b16.png` | Card `IncidentState.java`; the two `permits …` lines yellow; red on `CancelledState` |
| T03 | `a03b22.png` | Card `AssignedState.java`; yellow on the `return new TransitionResult(AcknowledgedState.INSTANCE, …` line; red on `new IncidentAcknowledged(inc.id(), now, actor)` |
| T03 | `a03b28.png` | Diagram "One base class, fifteen errors"; `ItsmException` box glowing |
| T03 | `a03b29.png` | Card `InvalidStateTransitionException.java`; first line yellow; red on `extends ItsmException`; note `Inheritance` |
| T04 | `a04b03.png` | Card `SlaClock.java`; yellow on the `pause(` line and its `return new SlaClock(ClockState.PAUSED, …` line; red on `consumedMs + delta` |
| T04 | `a04b06.png` | Yellow on `} else if (slaStatus != SlaStatus.BREACHED) {`; red on `slaStatus != SlaStatus.BREACHED` |
| T04 | `a04b12.png` | Card `VirtualAnchoredClock.java`; red on `elapsedRealNanos * a.scaleFactor()` |
| T04 | `a04b14.png` | Note `Abstraction` |
| T05 | `a05b06.png` | GitHub folder `intake`; cursor on `PersistAndPublishStep.java` |
| T05 | `a05b09.png` | Card `AbstractIntakeStep.java`; yellow on `protected abstract void doExecute(IntakeContext ctx);`; red on `doExecute` |
| T05 | `a05b15.png` | Card `ItilMatrixPriorityStrategy.java`; the three `{Priority.P…}` rows yellow |
| T05 | `a05b16.png` | Yellow on `if (in.activeCalendarWindow()) {` and the line with `Active exam/registration window (+1)`; red on `cur.bumpOneLevel()` |
| T06 | `a06b05.png` | Card with `private void commitAndPublish(`; yellow on `incidentRepository.save(incident);` and `eventPublisher.publishEvent(event);` |
| T06 | `a06b08.png` | Card `CommandAuthorizer.java`; yellow on the `case ACKNOWLEDGE, START_INVESTIGATION, …` line; red on `isAssignee` |
| T06 | `a06b12.png` | Diagram "Seven ways to pick a technician"; exactly one strategy box glowing |
| T06 | `a06b13.png` | Same diagram; `HungarianBatchStrategy` glowing |
| T06 | `a06b15.png` | Card `LeastLoadedStrategy.java`; yellow on `TechnicianCandidate chosen = eligible.get(0);` |
| T07 | `a07b03.png` | Card `IncidentController.java`; yellow on the `IncidentDtos.IncidentDetailResponse detail = queryPort.findIncidentDetail(` line |
| T07 | `a07b13.png` | Card `AuditLedgerInTxListener.java`; yellow on the `FOR UPDATE` line; red on `last_audit_hash` |
| T07 | `a07b15.png` | Card `AuditHasher.java`; yellow on the `MessageDigest.getInstance("SHA-256")` line; red on `"SHA-256"` |
| T07 | `a07b18.png` | Card `V003__audit_timers_ai.sql`; yellow on the `CREATE TRIGGER audit_no_change …` line |
| T07 | `a07b20.png` | Card `SecurityConfig.java`; yellow on the `"/api/v1/admin/**"` line; red on `hasRole("ADMINISTRATOR")` |
| T08 | `a08b04.png` | Card `api.ts`; yellow on the `const err = new Error(…` line and `throw err;`; red on `errBody.detail` |
| T08 | `a08b07.png` | Card `WorkbenchDetail.tsx`; yellow on `{allowed.includes('ACKNOWLEDGE') && (` |
| T09 | `a09b02.png` | The report form: `Report a Campus IT Issue` |
| T09 | `a09b03.png` | Diagram "What the copilot does while I type"; box 4 `Suggested service · APP-LMS · Moodle LMS` glowing; boxes 1–3 green |
| T09 | `a09b07.png` | Diagram "What one click on Submit does"; `IntakePipeline` glowing |
| T09 | `a09b08.png` | Diagram "The intake pipeline: nine steps"; boxes 1–8 green, box 9 glowing |
| T09 | `a09b09.png` | Same diagram; box 3 `Create incident` glowing; strip shows `Incident.java · createWithNumber` |
| T09 | `a09b11.png` | Diagram with `GENESIS`, `Entry 1`, `Entry 2`, `Entry 3`; `Entry 3` glowing |
| T09 | `a09b12.png` | Aarav's ticket page; state `ASSIGNED`, priority `P2`; cursor on the `Current State:` line |
| T09 | `a09b13.png` | Diagram "Why this ticket is P2"; middle cell yellow; bump row `P3 → … → P2` |
| T09 | `a09b14.png` | Zoomed-in `PRIORITY & SLA` panel; `Respond within 15 min`, `Resolve within 2 hours`; cursor on the Resolve row |
| T09 | `a09b17.png` | Technician's ticket page; red ring around `PERMITTED ACTIONS:`; a button `Acknowledge (Stop Response Clock)`; **no** `Resolve Incident` button |
| T09 | `a09b22.png` | Diagram "What one click on Acknowledge does"; box `CommandAuthorizer` green with `isAssignee = true ✓` |
| T09 | `a09b23.png` | Same diagram; last box `Next state · ACKNOWLEDGED` glowing |
| T09 | `a09b25.png` | Technician's ticket page; state `IN_PROGRESS`, cursor on it |
| T09 | `a09b28.png` | Diagram "Asking the student pauses the clock"; last box orange with `PAUSED` |
| T09 | `a09b29.png` | Zoomed-in chip `RESOLUTION CLOCK PAUSED · WAITING FOR THE REPORTER` |
| T09 | `a09b31.png` | Aarav's ticket page zoomed on the SLA panel; state `IN_PROGRESS`; cursor on the Resolve row |
| T09 | `a09b33.png` | Diagram "A lazy note is refused by the domain"; third box red: `Rejected · ITSM-4220 · HTTP 422` |
| T09 | `a09b36.png` | Diagram "What Confirm It Is Fixed does"; last box `Next state · VERIFIED` glowing |
| T09 | `a09b37.png` | Aarav's ticket page; state `VERIFIED`, cursor on it |
| T09 | `a09b38.png` | Technician's ticket page; state `CLOSED`; cursor on `PERMITTED ACTIONS:` with no action buttons after it |
| T10 | `a10b02.png` | Terminal with a JSON answer; yellow bar on the line `"attemptedCommand": "CLOSE"` |
| T10 | `a10b06.png` | Admin audit page; text ending `HASH BLOCKS SECURE`, cursor on it |
| T10 | `a10b08.png` | Terminal; yellow bar on the line containing `audit_record is append-only` |
| T10 | `a10b10.png` | Terminal; yellow bar on `SUMMARY: 24 passed, 0 failed (554590 transitions verified)` |
| T10 | `a10b11.png` | Terminal; yellow bar on the line containing `BUILD SUCCESS` |
| T11 | `a11b01.png` | Title card `Incident-Zero`; all four names fully visible |
| T11 | `a11b03.png` | Title card `github.com/srijans123/IncidentZero`; both rows visible |

### C4. If a picture is wrong

| What you see | Cause | Fix |
|---|---|---|
| The card or diagram named in the table is not there; the page under it is | a step before it failed or was skipped | Open `video_v4/out/takes/Txx.json` and read `warnings` for that beat; fix the named string or selector (step V2 or V3 of `ROUND2_FIX.md`). If there is no warning, confirm Part A printed `ALL APPLIED` (change 4 is what keeps the final picture on screen). Re-record the take. |
| The right card, but yellow is on a different line than the table says | this line's cue did not find its text | `Txx.json` → `warnings`; fix as step V2 of `ROUND2_FIX.md` says. Re-record. |
| The right card, no yellow at all | the highlight text was not found | `Txx.json` → `warnings` names it; fix as step V2 of `ROUND2_FIX.md` says |
| GitHub page, no blue selected lines in `a03b03.png` | selection failed | step V3 of `ROUND2_FIX.md`, row "drag selection produced no selected text" |
| App page with a loading message | recording did not wait | In that beat add `['ready']` then `['wait', 800]` before the step that shows the page. Re-record. |
| No cursor on a page picture | kit not injected after a page change | In `video_v4/kit/lib.mjs`, in the verb that changed the page, add `await this.inject();` after the navigation. Re-record. |
| A different technician name than you expected | not an error: assignment is least-loaded | nothing |
| `P3` instead of `P2` on `a09b12.png` | urgency or exam rule wrong in the app | This is an app bug. Run `node video_v4/kit/probe.mjs --url "/app.html?tab=portal"` after creating a ticket by hand and read `lastTicket`. Fix the app, then redo steps R2, R6, R8. |

Write in `PROGRESS.md`, for each take: the line `frames.mjs` printed and `C3 pictures checked: all match` or the list of pictures that did not match and what you did.

---

## Part D — step V8: the one repair allowed for each gate line that fails

Run `node video_v4/kit/cli.mjs gates`. For each line that prints `FAIL`:

| Gate line | Repair |
|---|---|
| `every take recorded` | Record the missing take. |
| `every beat performed` | A take stopped early. Re-record that take. |
| `on-screen facts seen while recording` | Open `video_v4/out/takes/*.json`, find `asserts` with `"ok": false`. Use section 5 of `ROUND2_FIX.md`, row `expected to see`. |
| `no highlight, cue or GitHub warnings` | The detail column lists `take/beat: message`. `hl matched nothing` / `tok not found` → fix the string (step V2). `GitHub row not found` → fix the name. `optional step … skipped` → open the `…_FAILED` or frame picture; if the thing is really not on the page, delete that one `['…','try', …]` cue and write it in `PROGRESS.md`. `drag selection produced no selected text` → step V3 table. Re-record the take. |
| `no highlight more than 4 s behind the voice` | First confirm Part A printed `ALL APPLIED` (changes 2 and 3). If it did and the line still fails, the detail column lists `beat cue +seconds`: in that beat, the step **before** the late cue is too slow. If that step is a `point` with a `hold`, halve the `hold`. If it is a `click` or `type`, move it into the `pre` list of the same beat (so it happens before the voice). Re-record that take. |
| `no page errors during recording` | The detail column shows the error text. If it mentions `fonts.gstatic.com`, `favicon` or `ResizeObserver`, it is harmless: in `video_v4/kit/cli.mjs` change `page.on('pageerror', (e) => errs.push(String(e).slice(0, 300)));` to `page.on('pageerror', (e) => { const m = String(e); if (!/fonts\.gstatic|favicon|ResizeObserver/.test(m)) errs.push(m.slice(0, 300)); });` and re-record that take. Any other error is an app bug: fix the app, redo R2, R6, R8. |
| `length between 15:30 and 19:30` | Step V9 of `ROUND2_FIX.md`. |
| `1920x1080 at 30 fps` | Re-run `assemble`. If it fails again, a take was recorded with a different window size: check `"headless": true` in config and re-record all takes. |
| `no frozen picture longer than 8 s` | The detail column lists `N s at M:SS`. Find the beat: open `video_v4/out/cues.json`, take the last entry whose `start` is not after that time. In that beat add one cue at the end of its `cues`: `['+2.5', 'move', '#__zk_layer', { at: [0.35, 0.62] }]` (the cursor glides to another spot). If that beat already has this cue, use `{ at: [0.6, 0.4] }`. If the frozen stretch is inside a diagram (the cursor is hidden there), add instead `['+2.5', 'mark', '<id of the box that is glowing>', 'good']`. Re-record that take, `assemble`, `gates`. |
| `picture moves for at least 85% of the video` | Same repair as the line above, for the three longest frozen stretches listed. |
| `loudness -16 LUFS ±1` | Re-run `assemble`. If it prints `no audio`: the wav files were not found; check that `video_v3/03_audio/beats/a00b01.wav` exists and that `"timings"` in config points at round one's `timings.json`. |
| `one subtitle cue per spoken beat` | Re-run `assemble` after every take is recorded. |

After a repair: re-record only the takes you changed, then `assemble`, then `gates`. Never edit `GATE_V.json` or the printed table.

---

## Part E — anything not covered

Decide in this order and stop at the first that applies:
1. A command printed an error → find that text in `ROUND2_FIX.md` section 5, then `video_v4/reference/KIT_GUIDE.md` section 7, then Part C4 and Part D here. Apply that fix only.
2. A page does not show a control the direction clicks → run `node video_v4/kit/probe.mjs` with the options that reach that page; copy the exact label from its `buttons` list into the direction.
3. The app behaves differently from the narration → the app is wrong. Fix the app so the narration is true. Do not change the narration and do not remove the check.
4. A tool in `video_v4/kit/` throws inside its own code (a line number in `lib.mjs`, `cli.mjs` or `stagekit.js`) → fix only that line, write `file:line old → new` in `PROGRESS.md`, run `node video_v4/kit/smoke.mjs`, and re-record.
5. None of the above, three attempts made → `BLOCKERS.md` (command, last 20 printed lines, picture path), continue with the next independent step, report it.

---

## What to add to the final report (section 7 of `ROUND2_FIX.md`)

7. The lines printed by `apply_additional_fixes.mjs`.
8. The last line printed by `gallery`.
9. For each take, the line printed by `frames.mjs` and the result of the C3 check.
10. Every Part D repair you applied, as `gate line → beat → cue added or changed`.
