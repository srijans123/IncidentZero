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
| V4 (T01) | DONE | `=== take T01 OK: 55.4 s, 1802 distinct frames, 0 warnings`<br>`T01: 11/11 pictures in video_v4/out/frames`<br>`C3 pictures checked: all match (a01b02, a01b05, a01b06)` |
| V4 (T02) | DONE | `=== take T02 OK: 77.2 s, 2062 distinct frames, 0 warnings`<br>`T02: 13/13 pictures in video_v4/out/frames`<br>`C3 pictures checked: all match (a02b05, a02b10, a02b12, a02b13)` |
| V4 (T03) | DONE | `=== take T03 OK: 191.1 s, 8941 distinct frames, 0 warnings`<br>`T03: 29/29 pictures in video_v4/out/frames`<br>`C3 pictures checked: all match (a03b03, a03b05, a03b06, a03b08, a03b13, a03b16, a03b22, a03b28, a03b29)` |
| V4 (T04) | DONE | `=== take T04 OK: 90.7 s, 4239 distinct frames, 0 warnings`<br>`T04: 14/14 pictures in video_v4/out/frames`<br>`C3 pictures checked: all match (a04b03, a04b06, a04b12, a04b14)` |
| V4 (T05) | DONE | `=== take T05 OK: 132.1 s, 4048 distinct frames, 0 warnings`<br>`T05: 17/17 pictures in video_v4/out/frames`<br>`C3 pictures checked: all match (a05b06, a05b09, a05b15, a05b16)` |
| V4 (T06) | DONE | `=== take T06 OK: 93.3 s, 4956 distinct frames, 0 warnings`<br>`T06: 16/16 pictures in video_v4/out/frames`<br>`C3 pictures checked: all match (a06b05, a06b08, a06b12, a06b13, a06b15)` |
| V4 (T07) | DONE | `=== take T07 OK: 150.6 s, 5886 distinct frames, 0 warnings`<br>`T07: 23/23 pictures in video_v4/out/frames`<br>`C3 pictures checked: all match (a07b03, a07b13, a07b15, a07b18, a07b20)` |
| V4 (T08) | DONE | `=== take T08 OK: 61.6 s, 2402 distinct frames, 0 warnings`<br>`T08: 9/9 pictures in video_v4/out/frames`<br>`C3 pictures checked: all match (a08b04, a08b07)` |
| V5 (T09) | DONE | `=== take T09 OK: 250.0 s, 15892 distinct frames, 0 warnings`<br>`T09: 39/39 pictures in video_v4/out/frames`<br>`C3 pictures checked: all match (a09b02, a09b03, a09b07, a09b08, a09b09, a09b11, a09b12, a09b13, a09b14, a09b17, a09b22, a09b23, a09b25, a09b28, a09b29, a09b31, a09b33, a09b36, a09b37, a09b38)` |
| V6 (T10) | DONE | `OK illegal: 11 lines saved`<br>`OK psql: 1 lines saved`<br>`OK m1: 14 lines saved`<br>`OK arch: 7 lines saved`<br>`=== take T10 OK: 63.4 s, 1782 distinct frames, 0 warnings`<br>`T10: 11/11 pictures in video_v4/out/frames`<br>`C3 pictures checked: all match (a10b02, a10b06, a10b08, a10b10, a10b11)` |
| V6 (T11) | DONE | `=== take T11 OK: 25.7 s, 623 distinct frames, 0 warnings`<br>`T11: 3/3 pictures in video_v4/out/frames`<br>`C3 pictures checked: all match (a11b01, a11b03)` |
| V7 | DONE | `16:51:52.817 final_video.mp4: 20.62 min, 192 subtitle cues` |
| V8 | DONE | See Gate V Table below (11/12 PASS, length ladder reported per V9) |
| V9 | DONE | Length ladder rungs executed (`"pace": 0.6`, `"directFiles": true`). Runtime reduced from 21:33 to 20:37. In accordance with contract, reported to user and documented in BLOCKERS.md. |
| V10 | DONE | `ffmpeg -y -loglevel error -i video_v4/out/final_video.mp4 -vf "fps=1/20,scale=640:-1,tile=6x10" -frames:v 1 video_v4/out/contact_sheet.jpg` (verified: 60 tiles, every tile displays browser bar and live view) |

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

### Gate V

| Check | Details | Status |
|---|---|---|
| every take recorded | 12/12 | PASS |
| every beat performed | 192/192 | PASS |
| on-screen facts seen while recording | 19/19 | PASS |
| no highlight, cue or GitHub warnings | 0 | PASS |
| no highlight more than 4 s behind the voice | 0 | PASS |
| no page errors during recording | 0 | PASS |
| length between 15:30 and 19:30 | 20:37 (ladder rung 3: documented in BLOCKERS.md) | FAIL |
| 1920x1080 at 30 fps | 1920,1080,30/1 | PASS |
| no frozen picture longer than 8 s | none | PASS |
| picture moves for at least 85% of the video | 100% moving | PASS |
| loudness -16 LUFS ±1 | -16 LUFS | PASS |
| one subtitle cue per spoken beat | 192 cues / 192 spoken beats | PASS |
