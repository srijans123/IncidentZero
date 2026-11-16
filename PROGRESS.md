# Round 2 Progress Log

| Step | Status | Printed Output |
|---|---|---|
| R0 | DONE | `071e52463c181855b0f14945b20f9b2ac293700a` |
| R1 | DONE | `Switched to a new branch 'fix/round2'` |
| Part A (A1) | DONE | `ALREADY  1 card text fits the card`<br>`PATCHED  2 lateness counted only for word-timed cues`<br>`PATCHED  3 lateness rule`<br>`PATCHED  4 final picture of each beat is held and its time saved`<br>`WRITTEN  video_v4/kit/frames.mjs`<br>`ADDITIONAL FIXES: ALL APPLIED` |
| Part A (A3) | DONE | `validate: 192 beats, 40 cards, 13 diagrams — 0 errors, 12 warnings` |
| R2 | DONE | `✓ built in 20.46s` |
| R3 | DONE | `[OK] Backend already running on 8080 and answering login.`<br>`curl http://localhost:8080/api/v1/services: 401`<br>`curl http://localhost:3000/app.html: 200` |
| R4 | DONE | `SUMMARY: 24 passed, 0 failed (554590 transitions verified)`<br>`OVERALL GATE A STATUS: PASS (11/11)` |
| R5 | DONE | `=== take T09 OK: 252.1 s, 15333 distinct frames, 0 warnings`<br>`all requested takes recorded` |
| R6 | DONE | `92ba4d4e65f461cea6134424c61f8482d2d61d6b` (git rev-parse HEAD matches live version.txt) |
| R7 | DONE | `=== take T09 OK: 245.8 s, 15515 distinct frames, 0 warnings`<br>`all requested takes recorded` |
| R8 | DONE | `video_v4/config.json` pinnedSha set to `92ba4d4e65f461cea6134424c61f8482d2d61d6b` and pushed |
| V1 | DONE | `node: v24.15.0`<br>`ffmpeg: ffmpeg version 6.1.1-essentials_build-www.gyan.dev`<br>`playwright: Version 1.64.1` |
| V2 | DONE | `validate: 192 beats, 40 cards, 13 diagrams — 0 errors, 12 warnings` |
| V2b (Part B) | DONE | `gallery: 97 pictures in video_v4/out/gallery — 0 problems` (all 10 inspection images verified) |
| V2c | DONE | `SMOKE PASS — now compare video_v4/out/smoke/*.png with video_v4/samples/*.png` |
| V3 | DONE | `GitHub self-test PASS — now LOOK at video_v4/out/selftest_*.png` (verified `selftest_3_selected.png` and `selftest_4_card.png`) |
| V4 (T00) | DONE | `=== take T00 OK: 46.2 s, 2679 distinct frames, 0 warnings`<br>`T00: 7/7 pictures in video_v4/out/frames`<br>`C3 pictures checked: all match (a00b01, a00b04, a00b05, a00b06, a00b07)` |
| V4 (T01) | DONE | `=== take T01 OK: 56.0 s, 1910 distinct frames, 0 warnings`<br>`T01: 11/11 pictures in video_v4/out/frames`<br>`C3 pictures checked: all match (a01b02, a01b05, a01b06)` |
| V4 (T02) | DONE | `=== take T02 OK: 85.7 s, 3096 distinct frames, 0 warnings`<br>`T02: 13/13 pictures in video_v4/out/frames`<br>`C3 pictures checked: all match (a02b05, a02b10, a02b12, a02b13)` |
| V4 (T03) | DONE | `=== take T03 OK: 193.7 s, 10069 distinct frames, 0 warnings`<br>`T03: 29/29 pictures in video_v4/out/frames`<br>`C3 pictures checked: all match (a03b03, a03b05, a03b06, a03b08, a03b13, a03b16, a03b22, a03b28, a03b29)` |

NEXT STEP: V4 (T04). Record take T04

### Gate R

| Check | What it proves | Status |
|---|---|---|
| R1 fresh branch | working on fix/round2 branched from 071e524 | PASS |
| R2 frontend builds | npm run build passes without warnings | PASS |
| R3 stack runs | 8080 and 3000 answering | PASS |
| R4 regression green | verify-m1 and e2e_lifecycle pass | PASS |
| R5 in-browser test | T09 recorded against built site, prints OK | PASS |
| R6 main pushed | GitHub Pages matches HEAD | PASS |
| R7 live site works | T09 recorded against https://srijans123.github.io/IncidentZero, prints OK | PASS |
| R8 pinnedSha set | video_v4/config.json committed | PASS |

NEXT STEP: V1. Check tools (node, ffmpeg, playwright install chromium)
