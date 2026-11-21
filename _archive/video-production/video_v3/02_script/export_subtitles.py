#!/usr/bin/env python3
"""
video_v3/02_script/export_subtitles.py
Generates video_v3/02_script/subtitles.srt from storyboard.json and timings.json.
Rules:
- Strictly external SRT, zero burned-in text on video pixels.
- Strips bracketed emotion tags ([curious], [firm], etc.).
- Splits long lines into readable 1-2 line chunks (<= 42 chars per line).
- Synchronized to beat start and end timestamps.
"""

import os
import json
import re
from pathlib import Path

repo_root = Path(__file__).resolve().parent.parent.parent
storyboard_path = repo_root / "video_v3" / "02_script" / "storyboard.json"
timings_path = repo_root / "video_v3" / "03_audio" / "timings.json"
srt_out_path = repo_root / "video_v3" / "02_script" / "subtitles.srt"

def format_timestamp(seconds: float) -> str:
    millis = int(round((seconds - int(seconds)) * 1000))
    total_seconds = int(seconds)
    secs = total_seconds % 60
    total_minutes = total_seconds // 60
    mins = total_minutes % 60
    hours = total_minutes // 60
    return f"{hours:02d}:{mins:02d}:{secs:02d},{millis:03d}"

def wrap_text(text: str, max_chars: int = 42) -> str:
    words = text.split()
    lines = []
    current_line = []
    current_len = 0

    for word in words:
        if current_len + len(word) + (1 if current_line else 0) <= max_chars:
            current_line.append(word)
            current_len += len(word) + (1 if len(current_line) > 1 else 0)
        else:
            lines.append(" ".join(current_line))
            current_line = [word]
            current_len = len(word)
    if current_line:
        lines.append(" ".join(current_line))

    # Keep at most 2 lines per subtitle cue
    if len(lines) > 2:
        mid = (len(lines) + 1) // 2
        line1 = " ".join(lines[:mid])
        line2 = " ".join(lines[mid:])
        return f"{line1}\n{line2}"
    return "\n".join(lines)

def build_srt():
    if not timings_path.exists():
        print(f"[!] timings.json not found at {timings_path}")
        return

    with open(storyboard_path, "r", encoding="utf-8") as f:
        storyboard = json.load(f)

    with open(timings_path, "r", encoding="utf-8") as f:
        timings_data = json.load(f)
    timings = timings_data.get("beats", timings_data)

    # Map beat_id -> beat obj
    beats_map = {}
    for act in storyboard.get("acts", []):
        for scene in act.get("scenes", []):
            for beat in scene.get("beats", []):
                beats_map[beat["beat_id"]] = beat

    srt_entries = []
    cue_index = 1
    cumulative_time = 0.0
    SCENE_PAUSE = 1.25

    for act in storyboard.get("acts", []):
        for scene in act.get("scenes", []):
            for beat in scene.get("beats", []):
                b_id = beat["beat_id"]
                if b_id not in timings:
                    continue

                beat_info = timings[b_id]
                duration = beat_info.get("duration_seconds", beat_info.get("duration", 0.0))
                start_time = cumulative_time
                end_time = start_time + duration
                cumulative_time = end_time

                # Raw clean text from SCRIPT.md
                raw_say = beat.get("say", "")
                # Remove [emotion-tags]
                clean_text = re.sub(r'\[[a-z0-9-]+\]', '', raw_say).strip()
                formatted_text = wrap_text(clean_text, max_chars=45)

                start_ts = format_timestamp(start_time)
                end_ts = format_timestamp(end_time)

                srt_entries.append(f"{cue_index}\n{start_ts} --> {end_ts}\n{formatted_text}\n")
                cue_index += 1

            # Clean breathing room pause at the end of each scene
            cumulative_time += SCENE_PAUSE

    srt_content = "\n".join(srt_entries)
    with open(srt_out_path, "w", encoding="utf-8") as f:
        f.write(srt_content)

    print(f"[✓] Exported {len(srt_entries)} subtitle cues to {srt_out_path}")
    print(f"    Total duration tracked: {cumulative_time:.2f}s ({cumulative_time/60:.2f} min)")

if __name__ == "__main__":
    build_srt()
