# Installation Log — IncidentZero Video Pipeline

This log records every package, virtual environment, binary, browser, and model cache installed or downloaded during this video build run.

---

## 1. Phase 0 Reconstructed Installs

| Item / Package | Version | Type | Install Path | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Playwright Chromium** | 1254 | Browser | `%LOCALAPPDATA%\ms-playwright\chromium-1254` | Headless screen recording |
| **FFmpeg** | 6.1.1 (Gyan) | Binary | `C:\Users\Srijan Shukla\.local\bin\ffmpeg.exe` | Video encoding, concatenation, audio mix |
| **ffprobe** | 4.0.2 | Binary | `C:\Users\Srijan Shukla\.local\bin\ffprobe.exe` (from `node_modules/ffprobe-static`) | Media stream inspection |
| **kokoro-onnx** | 0.6.1 | Python (pip) | `C:\Users\Srijan Shukla\AppData\Local\Programs\Python\Python311\Lib\site-packages` | Offline CPU TTS engine |
| **onnxruntime** | 1.31.1 | Python (pip) | `C:\Users\Srijan Shukla\AppData\Local\Programs\Python\Python311\Lib\site-packages` | In-process ONNX model inference |
| **espeakng-loader** | 0.2.4 | Python (pip) | `C:\Users\Srijan Shukla\AppData\Local\Programs\Python\Python311\Lib\site-packages` | Phonemization support for Kokoro |
| **phonemizer** | 3.6.0 | Python (pip) | `C:\Users\Srijan Shukla\AppData\Local\Programs\Python\Python311\Lib\site-packages` | G2P text conversion |
| **pyttsx3** | 2.98 | Python (pip) | `C:\Users\Srijan Shukla\AppData\Local\Programs\Python\Python311\Lib\site-packages` | Offline SAPI5 Windows TTS fallback |
| **edge-tts** | 7.2.8 | Python (pip) | `C:\Users\Srijan Shukla\AppData\Local\Programs\Python\Python311\Lib\site-packages` | Online TTS fallback |
| **Remotion** | 4.0.407 | npm package | `video/07_remotion/node_modules/remotion` | Video composition framework |
| **@remotion/cli** | 4.0.407 | npm package | `video/07_remotion/node_modules/@remotion/cli` | CLI bundler & renderer |
| **Chrome Headless Shell (Remotion)** | 158.0.8127.2 | Browser binary | Downloaded via Remotion cache | Fast frame rendering in Remotion |

---

## 2. Autonomous Overnight Run Installs (Active Log)

| Item / Package | Version | Type | Install Path | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Python Virtual Environment** | 3.11.9 | Venv | `video/.venv` | Isolated execution sandbox for voice and capture pipeline |
| **PyTorch (CUDA 12.8)** | 2.11.0+cu128 | Python (pip) | `video/.venv/Lib/site-packages` | GPU acceleration for Qwen3-TTS / Whisper on RTX 4050 |
| **torchaudio (CUDA 12.8)** | 2.11.0+cu128 | Python (pip) | `video/.venv/Lib/site-packages` | Audio tensor manipulation |
| **transformers** | 4.57.3 | Python (pip) | `video/.venv/Lib/site-packages` | Hugging Face model loading |
| **accelerate** | 1.12.0 | Python (pip) | `video/.venv/Lib/site-packages` | Device mapping (`device_map="cuda:0"`) |
| **qwen-tts** | 0.1.1 | Python (pip) | `video/.venv/Lib/site-packages` | Qwen3-TTS CustomVoice model pipeline |
| **soundfile** | 0.14.0 | Python (pip) | `video/.venv/Lib/site-packages` | Audio file I/O (.wav) |
| **scipy** | 1.17.1 | Python (pip) | `video/.venv/Lib/site-packages` | Scientific processing / audio math |
| **sox / soxr** | 1.5.0 / 1.1.0 | Python (pip) | `video/.venv/Lib/site-packages` | Resampling and audio processing |
| **librosa** | 0.11.0 | Python (pip) | `video/.venv/Lib/site-packages` | Audio analysis & spectral feature extraction |
| **gradio** | 6.17.3 | Python (pip) | `video/.venv/Lib/site-packages` | Qwen TTS interface dependencies |
| **faster-whisper** | 1.2.1 | Python (pip) | `video/.venv/Lib/site-packages` | Word-level audio timestamp alignment |
| **ctranslate2** | 4.8.5 | Python (pip) | `video/.venv/Lib/site-packages` | Fast Whisper inference backend |
| **av** | 18.1.0 | Python (pip) | `video/.venv/Lib/site-packages` | Audio decoding for Whisper |
| **psycopg2-binary** | 2.9.13 | Python (pip) | `video/.venv/Lib/site-packages` | PostgreSQL driver for seed.py / reset.py |
| **Qwen3-TTS-12Hz-0.6B-CustomVoice** | 12Hz-0.6B | Model weights | `%USERPROFILE%\.cache\huggingface\hub\models--Qwen--Qwen3-TTS-12Hz-0.6B-CustomVoice` | Selected GPU TTS voice model |
| **faster-whisper-base** | base | Model weights | `%USERPROFILE%\.cache\huggingface\hub\models--Systran--faster-whisper-base` | Whisper alignment model |
| **piper-tts** | 1.8.0 | Python (pip) | `video/.venv/Lib/site-packages` | Offline neural TTS engine |
| **pathvalidate** | 3.3.1 | Python (pip) | `video/.venv/Lib/site-packages` | Piper TTS dependency |
| **en_US-ryan-high (ONNX)** | High (22kHz) | Voice Model | `video/03_audio/models/piper/en_US-ryan-high.onnx` | American English "Ryan" voice model (~115 MB) |
| **Qwen3-TTS-12Hz-1.7B-CustomVoice** | 12Hz-1.7B (1.92B params) | Model weights | `%USERPROFILE%\.cache\huggingface\hub\models--Qwen--Qwen3-TTS-12Hz-1.7B-CustomVoice` | Upgraded final GPU TTS model (Ryan) |
