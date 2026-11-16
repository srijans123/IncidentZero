import os
import json
import math
import subprocess
import soundfile as sf
import numpy as np
import sys
sys.path.append("video")
from build_composition_manifest import build_manifest

def fix_all_audio_tails():
    print("============================================================")
    print("  Incident-Zero — Fixing Audio Tails & Sequence Padding     ")
    print("============================================================")

    src_dir = "video/03_audio/scenes"
    storyboard_file = "video/02_script/storyboard.json"
    timings_file = "video/03_audio/timings.json"

    with open(storyboard_file, "r", encoding="utf-8") as f:
        sb = json.load(f)

    with open(timings_file, "r", encoding="utf-8") as f:
        timings = json.load(f)

    fps = 30

    # Identify last scene of each act
    act_last_scenes = set()
    for act in sb["acts"]:
        if act["scenes"]:
            act_last_scenes.add(act["scenes"][-1]["id"])

    scenes_timings = timings.get("scenes", {})

    all_scene_files = [f for f in os.listdir(src_dir) if f.endswith(".wav") and not f.startswith("temp_")]
    print(f"[*] Processing {len(all_scene_files)} audio files with fade-out and silence padding...")

    updated_durations = {}

    for f in all_scene_files:
        sc_id = f.replace(".wav", "")
        wav_path = os.path.join(src_dir, f)
        temp_path = os.path.join(src_dir, f"tmp_pad_{f}")

        # Get original duration
        info = sf.info(wav_path)
        orig_dur = info.duration

        # 1. Apply 100ms fade-out at end of speech and append 200ms silence
        # st for fade is orig_dur - 0.1
        st_fade = max(0.0, orig_dur - 0.1)
        cmd = [
            "ffmpeg", "-y", "-v", "error",
            "-i", wav_path,
            "-af", f"afade=t=out:st={st_fade:.3f}:d=0.1,apad=pad_dur=0.2",
            "-ar", "24000",
            temp_path
        ]
        subprocess.run(cmd, check=True)

        # Replace original
        os.replace(temp_path, wav_path)

        # Measure new duration
        new_info = sf.info(wav_path)
        new_dur = new_info.duration
        updated_durations[sc_id] = new_dur

        # Check last 50ms loudness
        data, sr = sf.read(wav_path)
        last_50ms = data[-int(sr * 0.05):]
        rms = np.sqrt(np.mean(last_50ms ** 2))
        db = 20 * np.log10(rms) if rms > 1e-7 else -100.0

        if db > -45.0:
            print(f"Warning: {sc_id} last 50ms still {db:.1f} dBFS")

    print("[*] Recomputing Scene durations and frame boundaries...")

    current_frame = 0
    current_time = 0.0

    for act in sb["acts"]:
        for sc in act["scenes"]:
            sc_id = sc["id"]
            audio_dur = updated_durations.get(sc_id, sc.get("est_sec", 10.0))

            # Tail: 0.8s for act ends, 0.5s for normal scenes (guaranteed > 0.4s)
            tail = 0.8 if sc_id in act_last_scenes else 0.5

            scene_dur = audio_dur + tail
            frames = int(math.ceil(scene_dur * fps))
            actual_scene_dur = frames / fps

            # Verification: audio_end <= scene_end - 0.3s
            margin = actual_scene_dur - audio_dur
            assert margin >= 0.3, f"Margin violation in {sc_id}: margin={margin:.3f}s < 0.3s"

            if sc_id in scenes_timings:
                scenes_timings[sc_id]["duration_sec"] = round(actual_scene_dur, 3)
                scenes_timings[sc_id]["duration_frames"] = frames
                scenes_timings[sc_id]["audio_duration_sec"] = round(audio_dur, 3)
                scenes_timings[sc_id]["tail_sec"] = round(tail, 3)
                scenes_timings[sc_id]["start_frame"] = current_frame
                scenes_timings[sc_id]["end_frame"] = current_frame + frames
                scenes_timings[sc_id]["start_sec"] = round(current_time, 3)
                scenes_timings[sc_id]["end_sec"] = round(current_time + actual_scene_dur, 3)

            current_frame += frames
            current_time += actual_scene_dur

    timings["total_duration_sec"] = round(current_time, 3)
    timings["total_frames"] = current_frame

    with open(timings_file, "w", encoding="utf-8") as f:
        json.dump(timings, f, indent=2)

    print(f"[✓] Timings updated. Total duration: {current_time/60:.2f} mins ({current_frame} frames).")

    # Rebuild Manifest and sync to Remotion
    print("[*] Rebuilding Remotion composition manifest...")
    manifest = build_manifest()
    
    # Sync files to Remotion public/
    import shutil
    dst_audio = "video/07_remotion/public/audio/scenes"
    os.makedirs(dst_audio, exist_ok=True)
    for f in all_scene_files:
        shutil.copy2(os.path.join(src_dir, f), os.path.join(dst_audio, f))

    print(f"[✓] All {len(all_scene_files)} WAVs synchronized to Remotion with clean tails.")
    print(f"[✓] New Manifest: {manifest['total_scenes']} scenes, {manifest['total_frames']} frames ({manifest['formatted_duration']})")

if __name__ == "__main__":
    fix_all_audio_tails()
