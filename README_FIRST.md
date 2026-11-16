# README FIRST — what is in this bundle and the order to use it

Unzip this bundle into the root of the `IncidentZero` repository (overwrite). It mirrors the repository layout.

## Read, in this order
1. `README_FIRST.md` (this file)
2. `ROUND2_FIX.md` — **the task list. Do exactly this, step by step.**
3. `video_v4/reference/PLAYBOOK.md` — how to work so results are real
4. `video_v4/reference/KIT_GUIDE.md` — manual for the tools
5. Only when needed: `video_v4/reference/ZOOM_LOGIC.md`, `video_v4/reference/VISUAL_SPEC.md`, `video_v4/STORYBOARD.md`

## What each folder is

| Path | What | You should |
|---|---|---|
| `ROUND2_FIX.md` | Numbered steps, expected output, allowed fixes | follow it |
| `round2_app.patch` | The app changes as one patch (alternative to the overlay files) | use only for method B in step R1 |
| `frontend/src/**` | Fixed app files (in-browser backend, 3D safety wrapper, real SLA panel, runtime backend check) | build and deploy, do not rewrite |
| `scripts/deploy-pages.mjs`, `.github/workflows/deploy-pages.yml` | Publish the site to the `gh-pages` branch | run in step R6 |
| `scripts/demo-up.ps1` | Start-up script with the login check fixed | run in step R3 |
| `video_v4/kit/` | The tools: `cli.mjs`, `lib.mjs`, `stagekit.js`, `terminal.mjs`, `smoke.mjs`, `probe.mjs`, `chrome.html` | run them; edit only where `ROUND2_FIX.md` names a function |
| `video_v4/direction/` | The whole video as data: 192 beats, 40 code cards, 13 diagrams, demo text, terminal commands, title cards | edit only a selector, a wait, or an anchor string |
| `video_v4/config.json` | URLs and knobs | set `pinnedSha` in step R8 |
| `video_v4/STORYBOARD.md` | The direction in plain sentences | read to understand a beat |
| `video_v4/samples/` | Real frames and a real 15 s clip from this kit | compare your frames with these |
| `video_v4/reference/templates/*.svg` | Reference pictures of every overlay type and the cursors | compare only; the video never uses still images |
| `video_v4/reference/gallery/*.jpg` | Real renders of code cards, plain and highlighted | compare only |
| `video_v4/reference/openscreen/` | Original OpenScreen zoom source (MIT) | read only |
| `video_v4/terminal/` | Where real command output is saved for Act 10 | filled by `kit/terminal.mjs` |
| `docs_round1/` | Round-one brief and script | reference; `ROUND2_FIX.md` wins where they differ |

## The whole job in twelve lines
```
unzip → build frontend → start stack → verify-m1 + e2e_lifecycle
record T09 on the preview server (proves the in-browser backend)
commit → push main → node scripts/deploy-pages.mjs → check version.txt
record T09 on the live site → set pinnedSha
validate → gallery → smoke → selftest-github
record T00 … T08 (look at frames after each)
record T09 (real backend) → terminal.mjs → record T10, T11
assemble → gates → contact sheet → report
```

## Three things that must never happen again
1. A video made of still images. (`gates` fails any picture frozen for more than 8 seconds.)
2. An app frame showing "CONNECTING…" or "SYNCHRONIZING…". (`ready` and `expect` run before every app step.)
3. A PASS written without the printed line that proves it.
