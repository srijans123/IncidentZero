# Environment & Smoke Test Record (Phase 0 GATE)

## System & Toolchain Versions

- **Operating System:** Windows 11 (64-bit)
- **GPU:** NVIDIA GeForce RTX 4050 Laptop GPU, 6141 MiB total VRAM (5920 MiB free), Driver 610.78, CUDA 12.8 / 13.3
- **Node.js:** v24.15.0 (Requirement: >= 20.0.0) — **PASS**
- **Python:** 3.11.9 / 3.12.12 (Requirement: >= 3.10) — **PASS**
- **FFmpeg:** 6.1.1-essentials_build-www.gyan.dev (H.264, AAC, x264, yuv420p) — **PASS**
- **Playwright:** 1.58.0 (Chromium 1254 installed at `%LOCALAPPDATA%\ms-playwright\chromium-1254`) — **PASS**
- **Remotion:** 4.0.407 with `@remotion/cli` & Chromium Headless Shell — **PASS**
- **TTS Engines:**
  - Primary: `kokoro-onnx` 0.6.1 + `onnxruntime` 1.31.1 (Offline CPU-friendly) — **PASS**
  - Offline Fallback: `pyttsx3` 2.98 (SAPI5 native Windows TTS) — **PASS**

## Smoke Test Artifacts Verification

1. **TTS Speech Generation:**
   - Artifact: `video/03_audio/smoke_test.wav`
   - Duration: 2.49s (22.05 kHz PCM 16-bit mono)
   - Status: **VERIFIED**

2. **Playwright Screen Capture:**
   - Artifact: `video/04_capture/smoke_capture.mp4`
   - Duration: 2.00s (1920x1080 @ 30fps H.264 yuv420p)
   - Target: `landing.html` over local HTTP server
   - Status: **VERIFIED**

3. **Remotion Composition & Render:**
   - Artifact: `video/08_out/smoke_remotion.mp4`
   - Duration: 2.01s (60 frames @ 30fps, 1920x1080 H.264 + AAC 48kHz stereo)
   - Components Tested: `<OffthreadVideo>`, `<Audio>`, React DOM overlays, `@remotion/cli` bundler
   - Status: **VERIFIED**

**Phase 0 GATE: PASSED**

