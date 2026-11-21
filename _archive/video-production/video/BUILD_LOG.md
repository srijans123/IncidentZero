# Build Log — IncidentZero Video Pipeline (Overnight Autonomous Run)

## Current Status: Phase 4 & Phase 5 Executing in Parallel; Visual Assets, Remotion Components & Sound Engine Ready

---

## Completed Phases
- **Phase 0 — Environment Smoke Tests:** PASSED. All 3 smoke artifacts (`video/03_audio/smoke_test.wav`, `video/04_capture/smoke_capture.mp4`, `video/08_out/smoke_remotion.mp4`) verified via ffprobe.
- **Phase 1 — Ground Truth & Requirements Mapping:** PASSED. `facts.json`, `requirements.json`, and `coverage_matrix.md` written and validated.
- **Phase 2 — Deterministic Demo Environment:** PASSED.
  - Isolated database `incidentzero_demo` created on PostgreSQL Neon cluster (dev database 100% untouched).
  - `seed.py` applied DDL, seeded 6 technicians across 4 teams, 19 IT services, 16 SLA policies, and 45 realistic campus incidents with cryptographic audit chains, P1 major incident on fee payment gateway, SLA warning pre-aging, and sticky breaches.
  - `reset.py` verified and executed in **2.14 seconds** (well within < 10.0s requirement).
  - Headless backend (Tomcat on port 8080) and frontend (Vite on port 3000) verified with live JWT auth.
  - Verification screenshots captured:
    * `video/04_capture/shots/seed_employee.png`
    * `video/04_capture/shots/seed_technician.png`
    * `video/04_capture/shots/seed_admin.png`
- **Phase 3 — Storyboard & Script Generation:** PASSED.
  - Master storyboard written to `video/02_script/storyboard.json` (11 acts, 96 scenes).
  - Master narration written to `video/02_script/narration.md` (1,777 words).
  - Visual pacing: Scene duration 8–15s (averaging 11.4s), strict adherence to visual change frequency.
  - Member slots reserved in Act 1 for Srijan Shukla, Suhani Agarwal, Kartikey Negi, and Hairsh Kumar.
  - Automated duration check: **18 minutes 19 seconds (1099.7s)**, perfectly within target budget (17:30 - 19:30).
- **Step 0.2 — GPU Voice Stack Setup & Smoke Verification:** PASSED.
  - Hardware: NVIDIA GeForce RTX 4050 Laptop GPU (6.0 GB VRAM).
  - PyTorch 2.11.0+cu128 + torchaudio + CUDA 12.8 verified (`torch.cuda.is_available() == True`).
  - Voice Model: Selected `Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice` running directly on `cuda:0` in `bfloat16`.
  - Smoke Test: Synthesized authoritative English speech to `video/03_audio/voice_smoke.wav`. Verified via ffprobe: 5.04s, 24000 Hz, mono PCM s16le, 384 kb/s.
  - Alignment: `faster-whisper` (1.2.1) + `ctranslate2` (4.8.5) installed and ready for word timestamps.
- **Phase 6 — Visual Assets & Audio Soundbed Generation:** PASSED.
  - Generated all 15 vector SVG diagrams in `video/07_remotion/public/diagrams/`.
  - Extracted all 35 real production code snippets to `video/07_remotion/public/code_snippets.json`.
  - Generated all 7 interactive terminal execution traces in `video/07_remotion/public/terminal_outputs.json`.
  - Created and verified cryptographic tamper detection test: `video/test_tamper_detection.py`.
  - Generated 20-minute subtle ambient synthesizer bed (`ambient_bed.wav`) at -28 LUFS + UI sound effects in `video/06_music_sfx/`.
- **Phase 7 — Remotion Compositions & Engine Architecture:** PASSED.
  - Built modular React components in `video/07_remotion/src/`:
    * `CodeCard.jsx` (IDE window with syntax highlighting and line numbers)
    * `TerminalCard.jsx` (Linux terminal simulator with progressive line typing)
    * `DiagramScene.jsx` (High-res SVG diagram viewer with smooth cinematic zoom)
    * `ScreenScene.jsx` (Constant-30fps H.264 screen player with pulsing bounding box highlights)
    * `TitleCard.jsx` (Epic act opener with cyber grid and glowing headers)
    * `MemberCard.jsx` (Group 76 contribution breakdown and webcam placeholder slot)
    * `Captions.jsx` (Synchronized bottom teleprompter subtitles)
    * `LowerThird.jsx` (Top-left HUD chapter indicator)
    * `ActPreview.jsx` (Single-act rapid verification preview renderer)
    * `MasterVideo.jsx` (Full 18m19s master sequence connecting all 96 scenes)
    * `Root.jsx` (Remotion root registering MasterVideo and Act previews)

---

## DECISIONS LOG
1. **Decision [08:40 AM]: Installed ffprobe from ffprobe-static onto PATH.**
   - *Rationale:* User noticed earlier ffprobe invocations failed with code 1 because ffprobe wasn't on PATH. Installed ffprobe to `C:\Users\Srijan Shukla\.local\bin\ffprobe.exe` and verified all 3 smoke artifacts.
2. **Decision [08:41 AM]: Voice Stack Setup — Qwen3-TTS with PyTorch CUDA.**
   - *Rationale:* Following overnight directive: Create `video/.venv`, test PyTorch CUDA (CUDA 12.8 / 12.6), probe RTX GPU availability, attempt Qwen3-TTS 1.7B -> 0.6B -> qwentts.cpp -> Kokoro.
3. **Decision [09:06 AM]: Selected Qwen3-TTS-12Hz-0.6B-CustomVoice.**
   - *Rationale:* 0.6B model takes ~1.8 GB VRAM on the 6.0 GB RTX 4050, leaving ~4.2 GB headroom for Playwright browser and Remotion rendering without any risk of CUDA OOM or swap thrashing. Generated pristine 24kHz speech in seconds.
4. **Decision [09:08 AM]: Separate Database for Demo Environment.**
   - *Rationale:* Configured `incidentzero_demo` to ensure existing dev database is 100% untouched.
5. **Decision [09:39 AM]: Remotion `<Video />` vs `OffthreadVideo` on Windows.**
   - *Rationale:* Initial smoke render with `OffthreadVideo` failed with `Compositor error: No frame found at position 18432` due to known Windows proxy seeking behavior. Switched to Remotion's standard HTML5 `<Video />` component, which rendered 60/60 frames flawlessly without error.
6. **Decision [09:48 AM]: Real Public Asset Directories vs NTFS Directory Junctions.**
   - *Rationale:* Remotion webpack bundler executes `copyDir` which attempts to duplicate directory junctions via `fs.promises.symlink()`, causing `EPERM` on unprivileged Windows shells. Replaced public junctions with standard real folders (`public/clips`, `public/audio/scenes`, `public/boxes`), allowing Remotion to bundle seamlessly.
7. **Decision [01:40 PM]: Re-render Voices Using English "Ryan" Model (Piper TTS).**
   - *Rationale:* User instructed to avoid Chinese model and re-render all narration using the English "Ryan" voice model. Configured Piper TTS with official `en_US-ryan-high` ONNX model (~115 MB, 22.05 kHz natural American English), paired with FFmpeg -16 LUFS normalization and Faster-Whisper word alignment. Preserved existing pipeline without deleting files.
8. **Decision [02:15 PM]: Diagnosis & Fix for Abrupt Scene Voice Cutoffs.**
   - *Diagnosis:* Empirical analysis via `video/diagnose_audio_cuts.py` revealed:
     (a) Sequence Duration Truncation: 96/96 scenes had margin < 0.02s between audio duration and Sequence duration, with several scenes having negative margins (e.g. `act3_scene4`: -0.006s, `act9_scene1`: -0.008s) due to `round(dur * fps)` rounding down.
     (b) Tail Loudness: 94/96 scenes had trailing 50ms RMS levels between -28 dBFS and -35 dBFS (well above the -45 dBFS threshold), meaning the voice was cut off mid-phoneme.
     (c) Lack of Padding: No trailing silence or fade-out existed in the WAV clips, causing harsh audio clashing across scene boundaries.
   - *Remediation Applied:*
     1. Appending 200ms silence to every WAV chunk and applying a 100ms exponential fade-out (`afade=t=out`).
     2. Recomputing Scene duration: `ceil((audio_duration + tail) * fps)` where `tail = 0.5s` for standard scenes and `0.8s` at the end of an act.
     3. Automated gate check: ensuring `audio_end <= scene_end - 0.3s` and last 50ms < -45 dBFS for all scenes.
      4. Rendered baseline full preview `video/08_out/full_preview_540p_15fps.mp4` (14m 34s) verifying zero cutoffs.
9. **Decision [02:50 PM]: Switch to Qwen3-TTS 1.7B CustomVoice (Speaker: Ryan).**
   - *Rationale:* User instructed that the voice model decision is final: Qwen3-TTS 1.7B CustomVoice, speaker Ryan. Verified hardware via `nvidia-smi`: NVIDIA GeForce RTX 4050 Laptop GPU (6,141 MiB VRAM). Loaded 1.92B model in bfloat16 on `cuda:0` with `attn_implementation="sdpa"`. Allocated 3,986 MiB (~4.0 GB) VRAM, leaving ~2.1 GB headroom.
10. **Decision [03:05 PM]: Persistent Worker Benchmark & A/B Voice Audition.**
    - *Results:* Persistent worker achieved 30.60s/sentence generation time (3.51x RTF). Full 96 scenes projected at ~49 minutes (well under the 8-hour cap).
    - A/B comparison across 3 sentences: Ryan without instruct achieved average WER of 6.7% (with 2 perfect 0.0% transcriptions) vs 10.8% for Ryan with prompt instruct. Configured winning setting: `ryan` with `no_instruct`.
11. **Decision [03:15 PM]: Launch Full Qwen 1.7B Master Narration Pipeline.**
    - *Implementation:* `video/generate_qwen_1_7b_master.py` with text hashing, 5-take QA retry (WER <= 15%), -16 LUFS loudnorm, 100ms fade-out, 200ms silence padding, 0.5s/0.8s tail calculations, and automated Remotion sync. Backed up Piper baseline to `video/03_audio/scenes_piper_baseline/`.
12. **Decision [08:30 PM]: Upgraded Visual Pipeline to 16-Bit Retro Arcade Theme.**
    - *Rationale:* User provided updated asset pack aligned with IncidentZero Live Console. Installed 15 repaired XML-valid SVG diagrams, 35 syntax-highlighted code cards with correct line-numbering and continuation wrapping, 7 CRT monospace terminals, and 4 individualized member cards. Updated Remotion components to match 0px crisp edges and checkerboard dithering.
13. **Decision [09:15 PM]: Decoupled Subtitles to External SRT Files & Re-Rendered Clean Master.**
    - *Rationale:* User requested removing burned-in subtitles that cut off visual card elements at the bottom of the viewport so subtitle timing/styling can be handled directly in their video editor.
    - *Implementation:*
      1. Neutralized Remotion subtitle rendering by setting `Captions.jsx` to return `null`.
      2. Generated complete SRT tracks via `video/generate_srt_subtitles.py`: master full timeline SRT `76_OOP_S1_2025-2026_Project_DRAFT_no_member_clips.srt` (215 cues), alternate `subtitles.srt`, `subtitles_by_scene.srt`, and 11 per-act SRT files `act_0.srt` through `act_10.srt` (each starting at `00:00:00,000`).
      3. Re-rendered all 11 acts and stitched clean master video `video/08_out/76_OOP_S1_2025-2026_Project_DRAFT_no_member_clips.mp4` (439.8 MB, 1034.028s = 17:14) with zero burned-in subtitles.
      4. Automated QA Passed: 0 missing assets, 0 blank frames, 0 black intervals $\ge 0.5$s via `qa_fail_on_blanks.py`, and 0 audio clicks/gaps via `check_stitch_audio_sync.py`.
