import os
import sys
import json
import time
import subprocess
import torch
import soundfile as sf
from faster_whisper import WhisperModel
from qwen_tts import Qwen3TTSModel

def apply_pronunciation(text, pmap):
    res = text
    # Replace longer phrases first
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
    print("  Incident-Zero — Voice & Timestamp Pipeline (GPU Accelerated)")
    print("============================================================")

    with open("video/config.json", "r", encoding="utf-8") as f:
        config = json.load(f)

    with open("video/02_script/storyboard.json", "r", encoding="utf-8") as f:
        storyboard = json.load(f)

    pmap = config.get("pronunciation_map", {})
    fps = config.get("fps", 30)

    scenes_dir = "video/03_audio/scenes"
    os.makedirs(scenes_dir, exist_ok=True)

    print("[*] Loading Qwen3-TTS 0.6B CustomVoice on GPU (cuda:0, bfloat16)...")
    tts_model = Qwen3TTSModel.from_pretrained(
        "Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice",
        device_map="cuda:0",
        dtype=torch.bfloat16
    )

    print("[*] Loading Faster-Whisper Base on GPU (cuda:0, float16)...")
    whisper_model = WhisperModel("base", device="cuda", compute_type="float16")

    all_scenes = []
    for act in storyboard["acts"]:
        for sc in act["scenes"]:
            all_scenes.append(sc)

    total_scenes = len(all_scenes)
    print(f"[*] Processing {total_scenes} scenes across 11 acts...")

    timings = {
        "fps": fps,
        "total_scenes": total_scenes,
        "scenes": {}
    }
    all_words = {}
    srt_entries = []
    srt_index = 1
    current_time_offset = 0.0
    current_frame_offset = 0

    t_start = time.time()

    for idx, sc in enumerate(all_scenes, 1):
        sc_id = sc["id"]
        raw_text = sc["text"]
        spoken_text = apply_pronunciation(raw_text, pmap)
        out_wav = os.path.join(scenes_dir, f"{sc_id}.wav")
        temp_wav = os.path.join(scenes_dir, f"temp_{sc_id}.wav")

        print(f"[{idx:02d}/{total_scenes:02d}] Generating {sc_id} ({sc['type']})...", end="", flush=True)

        # 1. Generate speech via Qwen3-TTS
        wavs, sr = tts_model.generate_custom_voice(
            text=spoken_text,
            language="English",
            speaker=sc.get("speaker", "Vivian"),
            instruct="Speak clearly in an authoritative, academic, calm tone."
        )
        sf.write(temp_wav, wavs[0], sr)

        # 2. Normalize loudness to -16 LUFS via FFmpeg loudnorm
        cmd_loudnorm = [
            "ffmpeg", "-y", "-v", "error",
            "-i", temp_wav,
            "-af", "loudnorm=I=-16:LRA=11:TP=-1.5",
            "-ar", "24000",
            out_wav
        ]
        subprocess.run(cmd_loudnorm, check=True)
        if os.path.exists(temp_wav):
            os.remove(temp_wav)

        # 3. Read exact duration of normalized audio
        info = sf.info(out_wav)
        duration_sec = info.duration
        frames = int(round(duration_sec * fps))

        # 4. Transcribe with Whisper for word-level timestamps
        segments, _ = whisper_model.transcribe(out_wav, word_timestamps=True, language="en")
        scene_words = []
        for segment in segments:
            for w in segment.words:
                scene_words.append({
                    "word": w.word.strip(),
                    "start": round(w.start, 3),
                    "end": round(w.end, 3),
                    "global_start": round(current_time_offset + w.start, 3),
                    "global_end": round(current_time_offset + w.end, 3)
                })

        all_words[sc_id] = scene_words

        # 5. Format Subtitles (SRT)
        start_srt = format_srt_time(current_time_offset)
        end_srt = format_srt_time(current_time_offset + duration_sec)
        srt_entries.append(f"{srt_index}\n{start_srt} --> {end_srt}\n{raw_text}\n")
        srt_index += 1

        # 6. Record timings
        timings["scenes"][sc_id] = {
            "type": sc["type"],
            "act": sc_id.split("_")[0],
            "text": raw_text,
            "duration_sec": round(duration_sec, 3),
            "duration_frames": frames,
            "start_sec": round(current_time_offset, 3),
            "end_sec": round(current_time_offset + duration_sec, 3),
            "start_frame": current_frame_offset,
            "end_frame": current_frame_offset + frames
        }

        current_time_offset += duration_sec
        current_frame_offset += frames

        print(f" Done ({duration_sec:.2f}s, {frames}f)")

    timings["total_duration_sec"] = round(current_time_offset, 3)
    timings["total_frames"] = current_frame_offset

    # Save outputs
    with open("video/03_audio/timings.json", "w", encoding="utf-8") as f:
        json.dump(timings, f, indent=2)

    with open("video/03_audio/words.json", "w", encoding="utf-8") as f:
        json.dump(all_words, f, indent=2)

    with open("video/03_audio/captions.srt", "w", encoding="utf-8") as f:
        f.write("\n".join(srt_entries))

    elapsed_all = time.time() - t_start
    mins = int(current_time_offset // 60)
    secs = int(current_time_offset % 60)

    print("============================================================")
    print(f"  Total Audio Track Duration: {mins:02d}:{secs:02d} ({current_time_offset:.2f}s)")
    print(f"  Total Video Frames:         {current_frame_offset} frames @ {fps} fps")
    print(f"  Voice Synthesis & Alignment: {elapsed_all:.1f} seconds total")
    print("  Artifacts Saved:")
    print("    - video/03_audio/scenes/*.wav (96 normalized audio clips)")
    print("    - video/03_audio/timings.json (Frame & boundary map)")
    print("    - video/03_audio/words.json (Word timestamps)")
    print("    - video/03_audio/captions.srt (Synchronized subtitles)")
    print("============================================================")

if __name__ == "__main__":
    main()

