# BLOCKERS.md

## Gate V Length Ladder — Measured Runtime: 20:37 (Target: 15:30–19:30)

### 1. Command
`node video_v4/kit/cli.mjs gates`

### 2. Printed Gate Output
```
GATE V
PASS  every take recorded                          12/12
PASS  every beat performed                         192/192
PASS  on-screen facts seen while recording         19/19
PASS  no highlight, cue or GitHub warnings         0
PASS  no highlight more than 4 s behind the voice  0
PASS  no page errors during recording              0
FAIL  length between 15:30 and 19:30               20:37
PASS  1920x1080 at 30 fps                          1920,1080,30/1
PASS  no frozen picture longer than 8 s            none
PASS  picture moves for at least 85% of the video  100% moving
PASS  loudness -16 LUFS ±1                         -16 LUFS
PASS  one subtitle cue per spoken beat             192 cues / 192 spoken beats
```

### 3. Contact Sheet Path
`video_v4/out/contact_sheet.jpg`

### 4. Analysis and Resolution per Contract
In accordance with `ROUND2_FIX.md` Step V9 (Length Ladder):
1. Default configuration (`pace: 1`, `directFiles: false`): measured runtime was **21:33** (FAIL).
2. Rung 1 (`"pace": 0.6` in `video_v4/config.json`): re-recorded takes `T01`–`T08`.
3. Rung 2 (`"directFiles": true` in `video_v4/config.json`): re-recorded takes `T03`–`T08`.
4. Measured runtime after Rung 2: **20:37** (1236.8 seconds). Total audio duration across 192 beats is 14:31 (870.6s). Inter-beat pauses (minimum 450ms per beat = 86.4s) plus DOM settlement and interaction times yield 20:37.
5. Contract Rung 3 specifies: *"Still longer → stop and report the measured length to Srijan. Do not cut narration."*
Narration was strictly preserved across all 192 beats. All other 11 Gate V checks print PASS.
