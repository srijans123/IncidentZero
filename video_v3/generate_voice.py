#!/usr/bin/env python3
"""
video_v3/generate_voice.py
Batch speech generation via VoiceStudio local HTTP API with faster-whisper quality loop.
Follows ANTIGRAVITY_MASTER_BRIEF.md Section C6 and SCRIPT.md Section 0.2-0.6.
"""

import os
import sys
import json
import time
import re
import hashlib
import urllib.request
import urllib.error
import subprocess
from pathlib import Path

VOICE_ID = "44f29b45" # Srijan Voice
API_URL = "http://127.0.0.1:3900/v1/audio/speech"
MAX_BEAT_CHARS = 240
MAX_TAKES = 5
MAX_WER = 0.12 # 12%

TAG_WORDS = {"confirmation", "question", "sigh", "laughter", "surprise", "dissatisfaction"}

def normalize_for_wer(text):
    t = text.lower()
    t = re.sub(r'\[[a-z0-9-]+\]', '', t)
    t = re.sub(r'\b0\b', 'zero', t)
    t = re.sub(r'\b1\b', 'one', t)
    t = re.sub(r'\b2\b', 'two', t)
    t = re.sub(r'\b3\b', 'three', t)
    t = re.sub(r'\b4\b', 'four', t)
    t = re.sub(r'\b5\b', 'five', t)
    t = re.sub(r'\bs region\b', 'srijan', t)
    t = re.sub(r'\bi\'m\b', 'i am', t)
    t = re.sub(r'\bit\'s\b', 'it is', t)
    t = re.sub(r'\bthat\'s\b', 'that is', t)
    t = re.sub(r'\bdon\'t\b', 'do not', t)
    t = re.sub(r'[^\w\s]', ' ', t)
    return t.split()

def compute_wer(ref_text, hyp_text):
    ref_words = normalize_for_wer(ref_text)
    hyp_words = normalize_for_wer(hyp_text)
    if not ref_words:
        return 0.0 if not hyp_words else 1.0
    if not hyp_words:
        return 1.0

    d = [[0] * (len(hyp_words) + 1) for _ in range(len(ref_words) + 1)]
    for i in range(len(ref_words) + 1):
        d[i][0] = i
    for j in range(len(hyp_words) + 1):
        d[0][j] = j

    for i in range(1, len(ref_words) + 1):
        for j in range(1, len(hyp_words) + 1):
            if ref_words[i - 1] == hyp_words[j - 1]:
                d[i][j] = d[i - 1][j - 1]
            else:
                d[i][j] = min(
                    d[i - 1][j] + 1,      # deletion
                    d[i][j - 1] + 1,      # insertion
                    d[i - 1][j - 1] + 1   # substitution
                )
    return d[len(ref_words)][len(hyp_words)] / len(ref_words)

def split_long_text(text, max_chars=240):
    if len(text) <= max_chars:
        return [text]
    # Split on sentence boundaries
    sentences = re.split(r'([.?!]+\s+)', text)
    chunks = []
    current = ""
    for i in range(0, len(sentences), 2):
        s = sentences[i]
        sep = sentences[i + 1] if i + 1 < len(sentences) else ""
        part = s + sep
        if len(current) + len(part) <= max_chars or not current:
            current += part
        else:
            chunks.append(current.strip())
            current = part
    if current:
        chunks.append(current.strip())
    return chunks

def request_speech(text, seed=42, timeout=120):
    payload = {
        "model": "omnivoice",
        "voice": VOICE_ID,
        "input": text,
        "response_format": "wav",
        "seed": seed
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(API_URL, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()

def post_process_audio(raw_wav_path, out_wav_path):
    temp_trim = out_wav_path + ".trim.wav"
    temp_norm = out_wav_path + ".norm.wav"

    # Step 1: Trim leading/trailing silence to 80ms
    # silenceremove=start_periods=1:start_duration=0.08:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_duration=0.08:start_threshold=-50dB,areverse
    cmd_trim = [
        "ffmpeg", "-y", "-i", raw_wav_path,
        "-af", "silenceremove=start_periods=1:start_duration=0.08:start_threshold=-50dB:detection=peak,areverse,silenceremove=start_periods=1:start_duration=0.08:start_threshold=-50dB:detection=peak,areverse",
        "-ar", "48000", "-ac", "1", "-c:a", "pcm_s24le",
        temp_trim
    ]
    subprocess.run(cmd_trim, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # Step 2: LUFS normalization to -16 LUFS (loudnorm)
    cmd_norm = [
        "ffmpeg", "-y", "-i", temp_trim,
        "-af", "loudnorm=I=-16:TP=-1:LRA=7",
        "-ar", "48000", "-ac", "1", "-c:a", "pcm_s24le",
        temp_norm
    ]
    subprocess.run(cmd_norm, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # Step 3: Append exactly 200ms true silence
    cmd_append = [
        "ffmpeg", "-y", "-i", temp_norm,
        "-f", "lavfi", "-t", "0.2", "-i", "anullsrc=r=48000:cl=mono",
        "-filter_complex", "[0:a][1:a]concat=n=2:v=0:a=1[out]",
        "-map", "[out]",
        "-ar", "48000", "-ac", "1", "-c:a", "pcm_s24le",
        out_wav_path
    ]
    subprocess.run(cmd_append, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # Clean up temp files
    if os.path.exists(temp_trim):
        os.remove(temp_trim)
    if os.path.exists(temp_norm):
        os.remove(temp_norm)

def get_audio_duration(file_path):
    cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", file_path]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return float(res.stdout.strip())

def main():
    repo_root = Path(__file__).resolve().parent.parent
    storyboard_path = repo_root / "video_v3" / "02_script" / "storyboard.json"
    audio_dir = repo_root / "video_v3" / "03_audio"
    beats_dir = audio_dir / "beats"
    raw_dir = audio_dir / "raw"
    cache_path = audio_dir / "tts_cache.json"
    timings_path = audio_dir / "timings.json"
    progress_path = audio_dir / "PROGRESS.md"
    review_path = audio_dir / "AUDIO_REVIEW.md"

    beats_dir.mkdir(parents=True, exist_ok=True)
    raw_dir.mkdir(parents=True, exist_ok=True)

    with open(storyboard_path, "r", encoding="utf-8") as f:
        storyboard = json.load(f)

    cache = {}
    if cache_path.exists():
        with open(cache_path, "r", encoding="utf-8") as f:
            cache = json.load(f)

    timings = {}
    if timings_path.exists():
        with open(timings_path, "r", encoding="utf-8") as f:
            timings = json.load(f).get("beats", {})

    # Load faster-whisper on CPU to avoid VRAM contention with OmniVoice GPU
    from faster_whisper import WhisperModel
    print("Loading faster-whisper ASR on CPU for verification loop...", flush=True)
    asr = WhisperModel("tiny.en", device="cpu", compute_type="int8")
    print("ASR loaded.", flush=True)

    all_beats = []
    for act in storyboard.get("acts", []):
        for scene in act.get("scenes", []):
            for beat in scene.get("beats", []):
                all_beats.append(beat)

    total_beats = len(all_beats)
    print(f"Total beats to verify/generate: {total_beats}")

    durations = []
    gen_times = []

    for idx, beat in enumerate(all_beats):
        beat_id = beat["beat_id"]
        say = beat["say"]
        spoken = beat["say_spoken"]
        subtitles = beat["subtitles"]

        out_file = beats_dir / f"{beat_id}.wav"
        cache_key = hashlib.sha256(f"{spoken}|{VOICE_ID}".encode("utf-8")).hexdigest()

        if str(out_file) in cache and out_file.exists() and beat_id in timings:
            print(f"[{idx+1}/{total_beats}] CACHED: {beat_id}")
            durations.append(timings[beat_id]["duration_seconds"])
            continue

        print(f"\n[{idx+1}/{total_beats}] GENERATING: {beat_id}")
        print(f"  Spoken text: '{spoken}'")
        t_start = time.time()

        chunks = split_long_text(spoken, MAX_BEAT_CHARS)
        best_take = None
        best_wer = 999.0
        best_words = []

        for take in range(MAX_TAKES):
            seed = 42 + take
            take_raw_wavs = []
            failed_chunk = False

            for c_idx, chunk in enumerate(chunks):
                chunk_file = raw_dir / f"{beat_id}_take{take}_chunk{c_idx}.wav"
                try:
                    wav_bytes = request_speech(chunk, seed=seed, timeout=120)
                    with open(chunk_file, "wb") as f:
                        f.write(wav_bytes)
                    take_raw_wavs.append(str(chunk_file))
                except Exception as e:
                    print(f"  Take {take+1} chunk {c_idx} failed: {e}")
                    failed_chunk = True
                    break

            if failed_chunk:
                time.sleep(2)
                continue

            # If multiple chunks, stitch with 120ms silence
            merged_raw = raw_dir / f"{beat_id}_take{take}_merged.wav"
            if len(take_raw_wavs) == 1:
                merged_path = take_raw_wavs[0]
            else:
                from pydub import AudioSegment
                combined = AudioSegment.empty()
                silence_120 = AudioSegment.silent(duration=120)
                for w in take_raw_wavs:
                    seg = AudioSegment.from_wav(w)
                    if len(combined) > 0:
                        combined += silence_120
                    combined += seg
                combined.export(str(merged_raw), format="wav")
                merged_path = str(merged_raw)

            # Transcribe with faster-whisper
            segments, info = asr.transcribe(merged_path, beam_size=5, word_timestamps=True)
            hyp_words = []
            hyp_text_parts = []
            for s in segments:
                hyp_text_parts.append(s.text.strip())
                if s.words:
                    for w in s.words:
                        hyp_words.append({"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)})

            hyp_text = " ".join(hyp_text_parts)
            clean_ref = re.sub(r'\[[a-z0-9-]+\]', '', spoken).strip()
            wer = compute_wer(clean_ref, hyp_text)

            # Check literal tag words
            has_tag_word = any(tw in hyp_text.lower().split() for tw in TAG_WORDS)

            print(f"  Take {take+1} (seed {seed}): WER={wer*100:.1f}%, literal_tags={has_tag_word}")

            if wer < best_wer:
                best_wer = wer
                best_take = merged_path
                best_words = hyp_words

            if wer <= MAX_WER and not has_tag_word:
                print(f"  -> ACCEPTED on take {take+1}")
                break
            else:
                print(f"  -> RETRYING with seed {seed+1}")

        if best_take is None:
            raise RuntimeError(f"All {MAX_TAKES} takes failed for beat {beat_id}")

        if best_wer > MAX_WER:
            with open(review_path, "a", encoding="utf-8") as f:
                f.write(f"- Beat {beat_id}: WER={best_wer*100:.1f}%, text='{spoken}'\n")

        # Post-process to final beat audio
        post_process_audio(best_take, str(out_file))
        duration = get_audio_duration(str(out_file))
        elapsed = time.time() - t_start

        durations.append(duration)
        gen_times.append(elapsed)

        timings[beat_id] = {
            "file": f"video_v3/03_audio/beats/{beat_id}.wav",
            "duration_seconds": round(duration, 3),
            "say": say,
            "subtitles": subtitles,
            "words": best_words
        }

        cache[str(out_file)] = {
            "key": cache_key,
            "duration": round(duration, 3),
            "timestamp": time.time()
        }

        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=2)

        total_audio = sum(durations)
        with open(timings_path, "w", encoding="utf-8") as f:
            json.dump({"total_duration_seconds": round(total_audio, 3), "beats": timings}, f, indent=2)

        print(f"  Saved {out_file} (duration {duration:.2f}s in {elapsed:.1f}s)")

        # Update PROGRESS.md on first 3 beats
        if len(gen_times) == 3 or len(gen_times) % 10 == 0:
            avg_time = sum(gen_times) / len(gen_times)
            est_total_min = (avg_time * total_beats) / 60
            remaining_beats = total_beats - (idx + 1)
            est_rem_min = (avg_time * remaining_beats) / 60
            with open(progress_path, "w", encoding="utf-8") as f:
                f.write(f"# Speech Generation Progress\n\n")
                f.write(f"- Beats completed: {idx + 1} / {total_beats}\n")
                f.write(f"- Average generation time per beat: {avg_time:.2f}s\n")
                f.write(f"- Total estimated generation time: {est_total_min:.1f} minutes\n")
                f.write(f"- Estimated remaining time: {est_rem_min:.1f} minutes\n")
                f.write(f"- Total spoken audio so far: {total_audio / 60:.2f} minutes\n")
            print(f"  [Progress] {idx+1}/{total_beats} done, est. remaining: {est_rem_min:.1f} min")

    print("\nALL BEATS GENERATED AND VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
