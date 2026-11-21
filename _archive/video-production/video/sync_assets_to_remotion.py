import os
import shutil
import json
from build_composition_manifest import build_manifest

def sync_assets():
    print("============================================================")
    print("  Incident-Zero — Synchronizing Assets to Remotion Bundle   ")
    print("============================================================")

    # 1. Sync Clips
    src_clips = "video/04_capture/clips"
    dst_clips = "video/07_remotion/public/clips"
    os.makedirs(dst_clips, exist_ok=True)
    if os.path.exists(src_clips):
        clip_files = [f for f in os.listdir(src_clips) if f.endswith(".mp4")]
        for f in clip_files:
            shutil.copy2(os.path.join(src_clips, f), os.path.join(dst_clips, f))
        print(f"[+] Synchronized {len(clip_files)} screen clips to {dst_clips}")

    # 2. Sync Bounding Boxes
    src_boxes = "video/04_capture/boxes"
    dst_boxes = "video/07_remotion/public/boxes"
    os.makedirs(dst_boxes, exist_ok=True)
    if os.path.exists(src_boxes):
        box_files = [f for f in os.listdir(src_boxes) if f.endswith(".json")]
        for f in box_files:
            shutil.copy2(os.path.join(src_boxes, f), os.path.join(dst_boxes, f))
        print(f"[+] Synchronized {len(box_files)} bounding boxes to {dst_boxes}")

    # 3. Sync Audio Scenes
    src_audio = "video/03_audio/scenes"
    dst_audio = "video/07_remotion/public/audio/scenes"
    os.makedirs(dst_audio, exist_ok=True)
    if os.path.exists(src_audio):
        audio_files = [f for f in os.listdir(src_audio) if f.endswith(".wav")]
        for f in audio_files:
            shutil.copy2(os.path.join(src_audio, f), os.path.join(dst_audio, f))
        print(f"[+] Synchronized {len(audio_files)} audio WAVs to {dst_audio}")

    # 4. Sync SFX and Ambient Bed
    src_sfx = "video/06_music_sfx"
    dst_sfx = "video/07_remotion/public/music_sfx"
    os.makedirs(dst_sfx, exist_ok=True)
    if os.path.exists(src_sfx):
        sfx_files = [f for f in os.listdir(src_sfx) if f.endswith(".wav")]
        for f in sfx_files:
            shutil.copy2(os.path.join(src_sfx, f), os.path.join(dst_sfx, f))
        print(f"[+] Synchronized {len(sfx_files)} music and SFX tracks to {dst_sfx}")

    # 5. Rebuild Manifest
    manifest = build_manifest()
    print("============================================================")
    print(f"  SYNC COMPLETE: {manifest['total_scenes']} scenes, {manifest['total_frames']} frames ({manifest['formatted_duration']})")
    print("============================================================")

if __name__ == "__main__":
    sync_assets()

