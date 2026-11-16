import os
import sys
import time
import json
import torch
import soundfile as sf
import numpy as np

# Use line buffered stdout
sys.stdout.reconfigure(line_buffering=True)

from faster_whisper import WhisperModel
from qwen_tts import Qwen3TTSModel

def calculate_wer(ref, hyp):
    r = ref.lower().split()
    h = hyp.lower().split()
    # Simple Levenshtein distance on words
    d = np.zeros((len(r)+1, len(h)+1))
    for i in range(len(r)+1): d[i][0] = i
    for j in range(len(h)+1): d[0][j] = j
    for i in range(1, len(r)+1):
        for j in range(1, len(h)+1):
            if r[i-1] == h[j-1]:
                d[i][j] = d[i-1][j-1]
            else:
                d[i][j] = 1 + min(d[i-1][j], d[i][j-1], d[i-1][j-1])
    return d[len(r)][len(h)] / max(1, len(r))

def run_benchmark():
    print("============================================================", flush=True)
    print("  Qwen3-TTS 1.7B — Persistent Benchmark & Audition Worker   ", flush=True)
    print("============================================================", flush=True)

    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    snapshot_dir = r"C:\Users\Srijan Shukla\.cache\huggingface\hub\models--Qwen--Qwen3-TTS-12Hz-1.7B-CustomVoice\snapshots\0c0e3051f131929182e2c023b9537f8b1c68adfe"
    model_path = snapshot_dir if os.path.exists(snapshot_dir) else "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice"
    
    print(f"[*] Initializing model from {model_path} on {device} (bfloat16, sdpa)...", flush=True)
    t0 = time.time()
    model = Qwen3TTSModel.from_pretrained(
        model_path,
        device_map=device,
        dtype=torch.bfloat16,
        attn_implementation="sdpa"
    )
    print(f"[✓] Model loaded once into VRAM in {time.time()-t0:.2f}s", flush=True)

    # 1. Warm-up call
    print("[*] Running warm-up call...")
    torch.manual_seed(42)
    _ = model.generate_custom_voice(
        text="Warmup execution.",
        speaker="ryan",
        language="English"
    )
    print("[✓] Warm-up complete.")

    # 2. STEP 2: 5 Real Narration Sentences Benchmark
    sentences = [
        "Welcome to Incident-Zero, an enterprise IT service management platform engineered for BITS Pilani Hyderabad Campus.",
        "Traditional campus IT workflows suffer from ticket storms, unclear priorities, and manual dispatch bottlenecks during campus outages.",
        "Our architecture follows a clean hexagonal modular monolith, strictly isolating core domain aggregates from external infrastructure.",
        "When a major outage occurs, the Storm Detection Engine correlates velocity spikes against dependency graphs to pinpoint root causes.",
        "Every state transition is cryptographically chained into an append-only ledger using SHA-256 Merkle tree verification."
    ]

    print("\n--- STEP 2: Real Benchmark (5 Narration Sentences) ---")
    gen_times = []
    audio_durations = []

    for i, s in enumerate(sentences, 1):
        words = len(s.split())
        expected_sec = (words / 2.5) * 1.5
        # 12Hz tokens: cap max_new_tokens
        max_tokens = int(expected_sec * 12 * 1.5)
        
        torch.cuda.empty_cache()
        torch.manual_seed(42 + i)
        t_start = time.time()
        wavs, sr = model.generate_custom_voice(
            text=s,
            speaker="ryan",
            language="English",
            max_new_tokens=max_tokens
        )
        t_gen = time.time() - t_start
        audio_dur = len(wavs[0]) / sr
        rtf = t_gen / audio_dur if audio_dur > 0 else 0.0

        gen_times.append(t_gen)
        audio_durations.append(audio_dur)

        print(f"[{i}/5] '{s[:35]}...' | Gen: {t_gen:.2f}s | Audio: {audio_dur:.2f}s | RTF: {rtf:.2f}x | Device: {device}")

    avg_gen = sum(gen_times) / len(gen_times)
    avg_audio = sum(audio_durations) / len(audio_durations)
    avg_rtf = avg_gen / avg_audio
    print(f"\nBenchmark Summary: Avg Gen Time: {avg_gen:.2f}s/sentence | Avg Audio: {avg_audio:.2f}s | Avg RTF: {avg_rtf:.2f}x")

    # Estimated time for full 96 scenes
    est_full_hours = (avg_gen * 96) / 3600
    print(f"Estimated Full 96-Scene Narration Time: {est_full_hours:.2f} hours")

    # 3. STEP 3: Voice Settings A/B Test (3 sentences)
    print("\n--- STEP 3: Voice Settings A/B Test (Ryan No-Instruct vs Ryan Instruct) ---")
    os.makedirs("video/03_audio/auditions", exist_ok=True)
    whisper_model = WhisperModel("base", device="cpu", compute_type="int8")

    test_3 = sentences[:3]
    instruct_str = "Natural, warm, conversational explainer. Calm confidence, moderate pace, natural pauses, clear enunciation."

    results_no_instruct = []
    results_with_instruct = []

    for idx, s in enumerate(test_3, 1):
        # A: No instruct
        torch.cuda.empty_cache()
        torch.manual_seed(100 + idx)
        wav_a, sr_a = model.generate_custom_voice(text=s, speaker="ryan", language="English")
        path_a = f"video/03_audio/auditions/ryan_1_7b_no_instruct_s{idx}.wav"
        sf.write(path_a, wav_a[0], sr_a)
        
        dur_a = len(wav_a[0]) / sr_a
        words_count = len(s.split())
        wpm_a = (words_count / (dur_a / 60))
        seg_a, _ = whisper_model.transcribe(path_a, language="en")
        trans_a = " ".join([seg.text.strip() for seg in seg_a])
        wer_a = calculate_wer(s, trans_a)
        results_no_instruct.append({"wer": wer_a, "wpm": wpm_a, "trans": trans_a})

        # B: With instruct
        torch.cuda.empty_cache()
        torch.manual_seed(100 + idx)
        wav_b, sr_b = model.generate_custom_voice(text=s, speaker="ryan", language="English", instruct=instruct_str)
        path_b = f"video/03_audio/auditions/ryan_1_7b_with_instruct_s{idx}.wav"
        sf.write(path_b, wav_b[0], sr_b)

        dur_b = len(wav_b[0]) / sr_b
        wpm_b = (words_count / (dur_b / 60))
        seg_b, _ = whisper_model.transcribe(path_b, language="en")
        trans_b = " ".join([seg.text.strip() for seg in seg_b])
        wer_b = calculate_wer(s, trans_b)
        results_with_instruct.append({"wer": wer_b, "wpm": wpm_b, "trans": trans_b})

        print(f"\nSentence {idx}:")
        print(f"  [A - No Instruct]   WER: {wer_a*100:.1f}% | WPM: {wpm_a:.1f} | File: {path_a}")
        print(f"  [B - With Instruct] WER: {wer_b*100:.1f}% | WPM: {wpm_b:.1f} | File: {path_b}")

    avg_wer_a = sum(r["wer"] for r in results_no_instruct) / 3
    avg_wpm_a = sum(r["wpm"] for r in results_no_instruct) / 3

    avg_wer_b = sum(r["wer"] for r in results_with_instruct) / 3
    avg_wpm_b = sum(r["wpm"] for r in results_with_instruct) / 3

    print(f"\nA/B Summary:")
    print(f"  No Instruct:   Avg WER = {avg_wer_a*100:.1f}%, Avg WPM = {avg_wpm_a:.1f}")
    print(f"  With Instruct: Avg WER = {avg_wer_b*100:.1f}%, Avg WPM = {avg_wpm_b:.1f}")

    choice = "no_instruct" if (avg_wer_a <= avg_wer_b or abs(avg_wer_a - avg_wer_b) < 0.02) else "with_instruct"
    print(f"\nSelected Setting: {choice}")
    
    with open("video/config.json", "r", encoding="utf-8") as f:
        cfg = json.load(f)
    cfg["qwen_voice_setting"] = {
        "model": "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice",
        "speaker": "ryan",
        "setting": choice,
        "instruct": instruct_str if choice == "with_instruct" else None,
        "seed": 42
    }
    with open("video/config.json", "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=2)

    return est_full_hours, choice

if __name__ == "__main__":
    run_benchmark()

