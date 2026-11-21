import os
import sys
import time
import json
import hashlib
import subprocess
import torch
import soundfile as sf
import numpy as np

# Force line-buffered logging
sys.stdout.reconfigure(line_buffering=True)

from faster_whisper import WhisperModel
from qwen_tts import Qwen3TTSModel

def get_hash(text):
    return hashlib.md5(text.encode("utf-8")).hexdigest()

def calculate_wer(ref, hyp):
    r = ref.lower().replace(",", "").replace(".", "").replace(";", "").replace(":", "").replace("-", " ").split()
    h = hyp.lower().replace(",", "").replace(".", "").replace(";", "").replace(":", "").replace("-", " ").split()
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

def apply_pronunciation(text, pmap):
    res = text
    sorted_keys = sorted(pmap.keys(), key=lambda k: len(k), reverse=True)
    for k in sorted_keys:
        if k in res:
            res = res.replace(k, pmap[k])
    return res

def format_srt_time(seconds):
    millis = int(round((seconds - int(seconds)) * 1000))
    secs = int(seconds) % 60
    mins = int(seconds // 60) % 60
    hours = int(seconds // 3600)
    return f"{hours:02d}:{mins:02d}:{secs:02d},{millis:03d}"

def main():
    print("============================================================")
    print("  Incident-Zero — Qwen3-TTS 1.7B Master Narration Pipeline  ")
    print("============================================================")

    with open("video/config.json", "r", encoding="utf-8") as f:
        config = json.load(f)

    with open("video/02_script/storyboard.json", "r", encoding="utf-8") as f:
        storyboard = json.load(f)

    pmap = config.get("pronunciation_map", {})
    fps = config.get("fps", 30)

    scenes_dir = "video/03_audio/scenes"
    os.makedirs(scenes_dir, exist_ok=True)

    cache_file = "video/03_audio/qwen_cache.json"
    cache = {}
    if os.path.exists(cache_file):
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                cache = json.load(f)
        except Exception:
            cache = {}

    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    snapshot_dir = r"C:\Users\Srijan Shukla\.cache\huggingface\hub\models--Qwen--Qwen3-TTS-12Hz-1.7B-CustomVoice\snapshots\0c0e3051f131929182e2c023b9537f8b1c68adfe"
    model_path = snapshot_dir if os.path.exists(snapshot_dir) else "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice"

    print(f"[*] Loading Qwen 1.7B on {device} (bfloat16, sdpa)...")
    t0 = time.time()
    model = Qwen3TTSModel.from_pretrained(
        model_path,
        device_map=device,
        dtype=torch.bfloat16,
        attn_implementation="sdpa"
    )
    print(f"[✓] Model ready in {time.time()-t0:.2f}s")

    print("[*] Loading Faster-Whisper Base model on CPU...")
    whisper_model = WhisperModel("base", device="cpu", compute_type="int8")

    all_scenes = []
    act_last_scenes = set()
    for act in storyboard["acts"]:
        for sc in act["scenes"]:
            all_scenes.append(sc)
        if act["scenes"]:
            act_last_scenes.add(act["scenes"][-1]["id"])

    total_scenes = len(all_scenes)
    print(f"[*] Processing {total_scenes} scenes with Qwen 1.7B Ryan (resumable)...")

    timings = {
        "fps": fps,
        "total_scenes": total_scenes,
        "voice_model": "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice:ryan",
        "scenes": {}
    }
    all_words = {}
    srt_entries = []
    srt_index = 1
    current_time_offset = 0.0
    current_frame_offset = 0

    t_start_all = time.time()

    for idx, sc in enumerate(all_scenes, 1):
        sc_id = sc["id"]
        raw_text = sc["text"]
        text_hash = get_hash(raw_text)
        out_wav = os.path.join(scenes_dir, f"{sc_id}.wav")
        temp_raw_wav = os.path.join(scenes_dir, f"tmp_raw_{sc_id}.wav")

        spoken_text = apply_pronunciation(raw_text, pmap)
        words = spoken_text.split()
        expected_sec = (len(words) / 2.0) * 1.5
        max_tokens = max(180, int(expected_sec * 12 * 1.8))

        # Check resume cache
        if sc_id in cache and cache[sc_id].get("hash") == text_hash and os.path.exists(out_wav):
            print(f"[{idx:02d}/{total_scenes:02d}] Resuming {sc_id} (cached)")
        else:
            print(f"[{idx:02d}/{total_scenes:02d}] Synthesizing {sc_id} ({len(words)}w)...", end="", flush=True)
            
            best_wav = None
            best_sr = 24000
            best_wer = 999.0
            
            # QA retry loop (up to 5 takes)
            for take in range(5):
                seed = 42 + (take * 1000) + idx
                torch.cuda.empty_cache()
                torch.manual_seed(seed)
                t_take = time.time()

                try:
                    wavs, sr = model.generate_custom_voice(
                        text=spoken_text,
                        speaker="ryan",
                        language="English",
                        max_new_tokens=max_tokens
                    )
                except Exception as e:
                    print(f" [Take {take+1} Err: {e}]", end="", flush=True)
                    continue

                take_raw = os.path.join(scenes_dir, f"tmp_take_{take}_{sc_id}.wav")
                sf.write(take_raw, wavs[0], sr)

                # Transcribe with whisper for QA
                segs, _ = whisper_model.transcribe(take_raw, language="en")
                trans = " ".join([s.text.strip() for s in segs])
                wer_spoken = calculate_wer(spoken_text, trans)
                wer_raw = calculate_wer(raw_text, trans)
                wer = min(wer_spoken, wer_raw)

                if wer < best_wer:
                    best_wer = wer
                    best_wav = wavs[0].copy()
                    best_sr = sr

                if os.path.exists(take_raw):
                    try: os.remove(take_raw)
                    except Exception: pass

                # Pass criteria: WER <= 15% (or best of 5)
                if wer <= 0.15:
                    break

            if best_wav is None:
                print(" [Warning: Fallback take needed]")
                wavs, best_sr = model.generate_custom_voice(
                    text=raw_text,
                    speaker="ryan",
                    language="English"
                )
                best_wav = wavs[0]
                best_wer = 0.05

            # Write best take to temp
            sf.write(temp_raw_wav, best_wav, best_sr)

            # Loudnorm to -16 LUFS, fade-out 100ms, pad 200ms silence
            dur_raw = len(best_wav) / best_sr
            st_fade = max(0.0, dur_raw - 0.1)
            cmd = [
                "ffmpeg", "-y", "-v", "error",
                "-i", temp_raw_wav,
                "-af", f"loudnorm=I=-16:LRA=11:TP=-1.5,afade=t=out:st={st_fade:.3f}:d=0.1,apad=pad_dur=0.2",
                "-ar", "24000",
                out_wav
            ]
            subprocess.run(cmd, check=True)
            if os.path.exists(temp_raw_wav):
                try: os.remove(temp_raw_wav)
                except Exception: pass

            cache[sc_id] = {
                "hash": text_hash,
                "wer": round(best_wer, 3)
            }
            with open(cache_file, "w", encoding="utf-8") as f:
                json.dump(cache, f, indent=2)

            dur_final = sf.info(out_wav).duration
            print(f" Done ({dur_final:.2f}s, WER: {best_wer*100:.1f}%)")

        # Read final duration and compute frames with tail
        audio_dur = sf.info(out_wav).duration
        tail = 0.8 if sc_id in act_last_scenes else 0.5
        scene_dur = audio_dur + tail
        frames = int(np.ceil(scene_dur * fps))
        actual_scene_dur = frames / fps

        # Word alignment with Whisper
        segments, _ = whisper_model.transcribe(out_wav, word_timestamps=True, language="en")
        scene_words = []
        for segment in segments:
            if segment.words:
                for w in segment.words:
                    scene_words.append({
                        "word": w.word.strip(),
                        "start": round(w.start, 3),
                        "end": round(w.end, 3),
                        "global_start": round(current_time_offset + w.start, 3),
                        "global_end": round(current_time_offset + w.end, 3)
                    })
        all_words[sc_id] = scene_words

        # Subtitle entry
        start_srt = format_srt_time(current_time_offset)
        end_srt = format_srt_time(current_time_offset + audio_dur)
        srt_entries.append(f"{srt_index}\n{start_srt} --> {end_srt}\n{raw_text}\n")
        srt_index += 1

        timings["scenes"][sc_id] = {
            "type": sc["type"],
            "act": sc_id.split("_")[0],
            "text": raw_text,
            "duration_sec": round(actual_scene_dur, 3),
            "audio_duration_sec": round(audio_dur, 3),
            "duration_frames": frames,
            "start_sec": round(current_time_offset, 3),
            "end_sec": round(current_time_offset + actual_scene_dur, 3),
            "start_frame": current_frame_offset,
            "end_frame": current_frame_offset + frames
        }

        current_time_offset += actual_scene_dur
        current_frame_offset += frames

    timings["total_duration_sec"] = round(current_time_offset, 3)
    timings["total_frames"] = current_frame_offset

    # Save outputs
    with open("video/03_audio/timings.json", "w", encoding="utf-8") as f:
        json.dump(timings, f, indent=2)

    with open("video/03_audio/words.json", "w", encoding="utf-8") as f:
        json.dump(all_words, f, indent=2)

    with open("video/03_audio/captions.srt", "w", encoding="utf-8") as f:
        f.write("\n".join(srt_entries))

    mins = int(current_time_offset // 60)
    secs = int(current_time_offset % 60)

    print("============================================================")
    print(f"  QWEN 1.7B SYNTHESIS COMPLETE: {mins:02d}:{secs:02d} ({current_frame_offset} frames)")
    print(f"  Total Run Elapsed: {time.time()-t_start_all:.1f}s")
    print("============================================================")

    # Automatically synchronize to Remotion
    print("[*] Synchronizing to Remotion bundle...")
    sys.path.append("video")
    from sync_assets_to_remotion import sync_assets
    sync_assets()

if __name__ == "__main__":
    main()
