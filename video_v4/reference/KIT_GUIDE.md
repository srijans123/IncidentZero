# Kit guide — how the recording kit works and how to change it safely

Read `ROUND2_FIX.md` first; it is the task list. This file is the manual for the tools that list uses.

## 1. The five moving parts

```
video_v4/direction/*.mjs   WHAT happens on each narration line (data only)
        │  read by
video_v4/kit/cli.mjs       the commands you run (validate, gallery, record, assemble, gates …)
        │  uses
video_v4/kit/lib.mjs       Recorder (screen → mp4), Director (runs the verbs), cue timing, card resolver
        │  injects into the page
video_v4/kit/stagekit.js   everything DRAWN on top of the page: cursor, zoom, cards, diagrams, terminal
        │  timed by
video_v3/03_audio/timings.json   length of each narration line + the time of every spoken word
```

## 2. Commands

| Command | Time | What it does | Good output |
|---|---|---|---|
| `node video_v4/kit/cli.mjs validate` | 2 s | Checks every beat has audio, every card anchor and highlight string exists in git, every cue word is in the narration, every diagram code line exists | `0 errors` |
| `node video_v4/kit/cli.mjs gallery` | 1 min | Draws all 40 cards (plain + first highlight), 13 diagrams, 3 title cards, the terminal as stills in `out/gallery/` | `0 problems` |
| `node video_v4/kit/smoke.mjs` | 20 s | Records a short clip on the running app using zoom, typing, card, diagram, matrix | `SMOKE PASS` |
| `node video_v4/kit/cli.mjs selftest-github` | 30 s | Tries folder click, line selection and a card on real GitHub | `GitHub self-test PASS` |
| `node video_v4/kit/cli.mjs record T03` | take length + 20 s | Records one take to `out/takes/T03.mp4` and `T03.json` | `=== take T03 OK` |
| `node video_v4/kit/terminal.mjs` | 1–3 min | Runs the four proof commands and saves real output | four `OK` lines |
| `node video_v4/kit/cli.mjs assemble` | 5–10 min | Adds the browser bar, lays each audio file at its beat time, joins takes, mixes music, writes subtitles | `final_video.mp4: … min, 192 subtitle cues` |
| `node video_v4/kit/cli.mjs gates` | 2 min | Prints the Gate V table | every line `PASS` |
| `node video_v4/kit/probe.mjs …` | 10 s | Prints what is on a page (buttons, inputs, test ids, last ticket, errors) | use when a selector fails |
| `node video_v4/kit/cli.mjs storyboard` | 1 s | Rewrites `STORYBOARD.md` from the direction | — |

Options for `record`: `--fresh` (new browser profile: logged-in user resets to Aarav), `--no-setup` (skip the take's database reset), `--app <url>` (record against another copy of the app), `--landing <url>`.

## 3. `config.json`

| Key | Meaning |
|---|---|
| `appUrl` | where the app runs for the demo (`http://localhost:3000`) |
| `landingUrl` | first page of the video |
| `repoUrl` | GitHub repository |
| `pinnedSha` | commit used for GitHub URLs and for reading code; empty = `main` / `HEAD` |
| `timings` | round one's `timings.json` |
| `musicBed` | quiet background track; skipped if the file is missing |
| `channel` | `"chrome"` uses installed Google Chrome; delete the line to use Playwright's Chromium |
| `headless` | `true`; set `false` to watch the browser while debugging |
| `pace` | 1 = normal pauses after each GitHub navigation; 0.6 = shorter |
| `directFiles` | `true` opens files by URL instead of going back to the folder and clicking |

## 4. Anatomy of a beat

```js
{ id: 'a03b05',                                   // must equal the audio file name
  pre:  [['card', 'C03-A']],                      // optional: steps run silently BEFORE the voice starts
  cues: [                                         // steps run WHILE the voice plays
    [0, 'hl', 'if (cleanTitle.length() < 5 || cleanTitle.length() > 200) {', 'throw new InvalidIncidentPayloadException("title", …'],
    ['@five',   'tok', 'cleanTitle.length() < 5 || cleanTitle.length() > 200'],
    ['@throws', 'tok', 'throw new InvalidIncidentPayloadException("title"'],
  ],
  hold: 0.5,                                      // optional: seconds of silence after the voice (default 0.3)
  post: [['cardClose']] }                         // optional: steps run after the voice
```
Cue time forms: `0` or `1.5` (seconds from the start of the voice) · `'@five'` (when "five" is spoken; taken from the word list, or from its position in the sentence if the recogniser misheard it) · `'+0'`, `'+0.4'` (after the previous cue) · `'@end'`.
Cues run one after another. If one is still busy, the next starts late; lateness over 4 s fails a gate.

Helpers used in `direction/code.mjs`:
- `file('C03-F', DOM, 'AssignedState.java')` → close card, show the folder, click the file, drag-select the card's lines, open the card.
- `next('C03-C')` → another card from the file already open.
- `sel('C02-A')` → only the select-and-open part.
- `now([...])` → turn a list of steps into cues that start at second 0 and run back to back.
- `hover('SLA', 'sla')` → hover that row when the word is spoken.

## 5. Every verb

Targets: a CSS selector string · `{ text: 'visible text' }` (add `exact: true` for whole-text match) · `{ role: 'button', name: 'Acknowledge' }` · `{ placeholder: '…' }` · `{ testid: 'sla-respond' }`. `$TICKET` and `$TECH` inside strings are replaced by remembered values.

**General**
| Verb | Arguments | Does |
|---|---|---|
| `goto` | `'LANDING'` \| `'APP/app.html?tab=portal'` \| `'GH/tree/<SHA>/docs'` \| full URL | load a page |
| `wait` | ms | pause |
| `ready` | — | wait until no loading spinner is visible (fails after 15 s) |
| `expect` | text, `{ exact }` | the text must be visible within 8 s; recorded for the gate; failing stops the take |
| `remember` | name, JS expression | store a page value, e.g. `['remember','TICKET','window.__izLast.number']` |
| `move` | target | glide the cursor there |
| `point` | target, `{ hold, pad }` | glide + red ring for `hold` ms (`hold: 0` keeps the ring until `unring`) |
| `click` | target, `{ after }` | wait ready, glide, wait for the camera, press |
| `type` | target, text, `{ ms, clear }` | click the field, optionally clear it, type the text over `ms` |
| `select` | target, value | choose a `<select>` option |
| `scrollTo` | target, `{ block, ms }` · `scrollBy` dy, ms · `scrollTop` | smooth scrolling |
| `zoom` / `zoomFollow` / `zoomOut` | see `ZOOM_LOGIC.md` | camera |
| `user` | name | switch demo user through the header menu |
| `tab` | label | click a header tab (`'Student Portal'`, `'Workbench'`, `'Command DAG'`) |
| `try` | verb, …args | run a verb but only warn if it fails (decoration only) |

**GitHub**
| Verb | Arguments | Does |
|---|---|---|
| `ghGoto` | path such as `'tree/<SHA>/{J}/incident/domain'` | load a GitHub page (`{J}` = `backend/src/main/java/edu/campus/iitsm`, `{F}` = `frontend/src`) |
| `ghFolder` | folder path | go back to that folder if we just left it, else load it |
| `ghOpen` | folder, file name, file path | `ghFolder` + click the file |
| `ghClick` / `ghHover` | row name, `{ fallback }` / hold ms | click or hover a file-list row |
| `ghLine` | file, text of a line | scroll the code view to that line |
| `ghSelect` | file, first-line text, last-line text, `{ plus }` | drag the I-beam over those lines (real browser selection) |
| `ghUnselect` | — | clear the selection |

**Code card** — `card` id · `hl` text[, text…] · `tok` text · `toks` [texts], ms · `note` text · `unhl` · `cardClose`
**Diagram** — `diagram` id · `step` box · `glow` box · `mark` box, tone, sub-label · `sweep` [boxes], ms · `cell` row, col · `bump` from, why, to · `diagramClose`
**Terminal** — `term` title · `termType` id, ms · `termPrint` id, ms · `termPoint` text · `termClose`
**Title** — `title` id · `reveal` row key · `titleClose`

## 6. Adding or changing things (only when ROUND2_FIX.md tells you to)

- **A highlight string no longer matches** → `validate` names the beat and the card. Open the card's file at `pinnedSha`, copy the exact text of the line that does the same job, paste it. Run `validate` again.
- **A card is too tall or its anchor moved** → edit `from` / `to` / `plus` in `direction/cards.mjs`. `from` = text on the first line, `to` = text on the last line (searched after `from`), `plus` = extra lines after `to`, `before` = extra lines before `from`. Keep cards at 30 lines or fewer. Run `gallery`.
- **A button label changed** → use `probe.mjs` to print the page's buttons; copy the label into the target.
- **A diagram label is false** → fix the label in `direction/diagrams.mjs` to match the code; if a box has `file` and `code`, `code` must be an exact substring of that file (validate checks it).

## 7. Debugging recipes

| Symptom | Do this |
|---|---|
| A take fails and the screenshot is unclear | `node video_v4/kit/probe.mjs --url "/app.html?tab=workbench" --user "Vikram Rao" --tab Workbench --row first` and read `buttons`, `spinnerVisible`, `lastTicket` |
| You want to watch it happen | set `"headless": false`, record the take again |
| The cursor is missing in frames | the page replaced `<html>`; `verbs.goto` and `ghClick` already re-inject; if a new navigation path was added, call `await this.inject()` after it |
| Overlay text is tiny or cut off | run `gallery`; it lists every card or diagram that does not fit |
| Highlights come late | the step before them is slow (a navigation). Move the navigation into the previous beat's `post`, keep the highlight cue where it is |
| Video and voice out of step | they cannot drift within a beat; check `out/takes/<take>.json` → `late` for cues that ran late |
| `SMOKE FAIL` with `screencast produced no frame` | delete `"channel"` from config, run `npx --prefix frontend playwright install chromium` |
| GitHub asks to sign in or rate-limits | wait 10 minutes; keep `pace` at 1; do not log in |

## 8. Files the kit writes

```
video_v4/out/takes/T03.mp4          the raw take, 1920×992
video_v4/out/takes/T03.json         marks (beat start times), asserts, warnings, late cues, addresses, page errors
video_v4/out/takes/T03_FAILED_1.png screenshot at the moment a take failed
video_v4/out/built/T03.mp4          take + browser bar + narration
video_v4/out/final_video.mp4        the deliverable
video_v4/out/subtitles.srt          external subtitles
video_v4/out/GATE_V.json            the gate table as data
video_v4/terminal/*.txt             real command output shown in Act 10
```
