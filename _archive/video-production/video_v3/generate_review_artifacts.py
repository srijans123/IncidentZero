#!/usr/bin/env python3
"""
video_v3/generate_review_artifacts.py
Generates:
1. video_v3/08_out/contact_sheet/index.html (one thumbnail per beat with spoken text, timestamp, emotion tag)
2. video_v3/08_out/REVIEW.md (the 20 beats most worth a human look with timestamps, reason, text)
"""

import os
import sys
import json
import shutil
from pathlib import Path

repo_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(repo_root))
storyboard_path = repo_root / "video_v3" / "02_script" / "storyboard.json"
timings_path = repo_root / "video_v3" / "03_audio" / "timings.json"
contact_dir = repo_root / "video_v3" / "08_out" / "contact_sheet"
thumbs_dir = contact_dir / "thumbs"
review_md_path = repo_root / "video_v3" / "08_out" / "REVIEW.md"

contact_dir.mkdir(parents=True, exist_ok=True)
thumbs_dir.mkdir(parents=True, exist_ok=True)

from video_v3.compose_video import SCENE_VISUAL_MAP

def generate_artifacts():
    print("[*] Generating contact sheet and REVIEW.md...")
    with open(storyboard_path, "r", encoding="utf-8") as f:
        storyboard = json.load(f)

    with open(timings_path, "r", encoding="utf-8") as f:
        timings_data = json.load(f)
    timings = timings_data.get("beats", timings_data)

    SCENE_PAUSE = 1.25
    running_time = 0.0

    all_beat_entries = []

    for act in storyboard.get("acts", []):
        act_num = act["act_num"]
        act_title = act["title"]
        for sc in act.get("scenes", []):
            sc_id = sc["scene_id"]
            sc_title = sc.get("title", "")
            v_type, rel_asset = SCENE_VISUAL_MAP.get(sc_id, ("image", "video_v3/06_frames/C02-A.png"))
            asset_path = repo_root / rel_asset

            # Check if asset is image or video
            thumb_name = f"{sc_id.replace('.', '_')}.png"
            dest_thumb = thumbs_dir / thumb_name

            if asset_path.exists() and not dest_thumb.exists():
                if v_type == "video" or asset_path.suffix.lower() == ".mp4":
                    # extract 1st frame
                    os.system(f'ffmpeg -y -ss 00:00:01 -i "{asset_path}" -vframes 1 -s 320x180 "{dest_thumb}" -loglevel quiet')
                else:
                    # copy / resize image
                    os.system(f'ffmpeg -y -i "{asset_path}" -vf "scale=320:180:force_original_aspect_ratio=decrease,pad=320:180:(ow-iw)/2:(oh-ih)/2:color=0x1E1646" "{dest_thumb}" -loglevel quiet')

            for b in sc.get("beats", []):
                bid = b["beat_id"]
                t_info = timings.get(bid, {})
                dur = t_info.get("duration_seconds", t_info.get("duration", 4.0))
                say = b.get("say", "")
                tag = b.get("emotion_tag", "measured")

                all_beat_entries.append({
                    "beat_id": bid,
                    "scene_id": sc_id,
                    "act_num": act_num,
                    "act_title": act_title,
                    "start_sec": running_time,
                    "duration": dur,
                    "say": say,
                    "tag": tag,
                    "thumb": f"thumbs/{thumb_name}",
                    "asset": rel_asset,
                    "word_count": len(say.split()),
                })
                running_time += dur

            running_time += SCENE_PAUSE

    # 1. Build contact_sheet/index.html
    html_lines = [
        "<!DOCTYPE html>",
        "<html lang='en'>",
        "<head>",
        "<meta charset='UTF-8'>",
        "<title>Incident-Zero Beat Contact Sheet (16-Bit Production)</title>",
        "<style>",
        "  body { background: #1E1646; color: #FFF8DC; font-family: 'Courier New', monospace; margin: 0; padding: 20px; }",
        "  h1, h2 { color: #FFD84D; text-shadow: 2px 2px 0 #0B071E; }",
        "  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; margin-top: 20px; }",
        "  .card { background: #261C58; border: 3px solid #0B071E; box-shadow: 6px 6px 0 #0B071E; padding: 12px; }",
        "  .card img { width: 100%; height: auto; border: 2px solid #0B071E; display: block; image-rendering: pixelated; }",
        "  .meta { display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; color: #43D17A; margin-top: 8px; }",
        "  .tag { background: #FF4D3D; color: #fff; padding: 2px 6px; font-size: 11px; }",
        "  .text { font-size: 12px; line-height: 1.4; margin-top: 8px; color: #E0E0FF; }",
        "</style>",
        "</head>",
        "<body>",
        "<h1>Incident-Zero Master Video — Contact Sheet</h1>",
        f"<p>Total Beats: {len(all_beat_entries)} | Total Duration: {int(running_time//60)}m {int(running_time%60)}s | VoiceStudio Route 1</p>",
        "<div class='grid'>"
    ]

    for item in all_beat_entries:
        mm = int(item['start_sec'] // 60)
        ss = int(item['start_sec'] % 60)
        html_lines.append(f"""
        <div class='card' id='{item['beat_id']}'>
          <img src='{item['thumb']}' alt='{item['scene_id']}'>
          <div class='meta'>
            <span>[{item['beat_id']}] {mm:02d}:{ss:02d} ({item['duration']:.1f}s)</span>
            <span class='tag'>{item['tag']}</span>
          </div>
          <div class='text'><strong>{item['scene_id']}</strong>: {item['say']}</div>
        </div>
        """)

    html_lines.extend(["</div>", "</body>", "</html>"])

    with open(contact_dir / "index.html", "w", encoding="utf-8") as f:
        f.write("\n".join(html_lines))
    print(f"[✓] Created {contact_dir / 'index.html'}")

    # 2. Build REVIEW.md (20 beats most worth a human look)
    # Ranked by:
    # - Longest beats (potential freeze or pacing check)
    # - Densest code explanation / technical depth
    # - Key transition points (T1-T5 traces, legal/illegal transitions)
    scored = []
    for item in all_beat_entries:
        score = 0
        reasons = []
        if item["duration"] > 6.0:
            score += 3
            reasons.append(f"Extended duration ({item['duration']:.1f}s)")
        if item["word_count"] > 25:
            score += 2
            reasons.append(f"Dense narration ({item['word_count']} words)")
        if "T1" in item["asset"] or "T2" in item["asset"] or "T3" in item["asset"] or "T4" in item["asset"] or "T5" in item["asset"]:
            score += 4
            reasons.append("Code execution trace overlay")
        if item["tag"] in ["emphatic", "urgent", "proud"]:
            score += 2
            reasons.append(f"Emotion shift: {item['tag']}")
        if "illegal" in item["say"].lower() or "409" in item["say"] or "tamper" in item["say"].lower():
            score += 3
            reasons.append("Integrity / security invariant demonstration")
        if "hash" in item["say"].lower() or "sha-256" in item["say"].lower():
            score += 2
            reasons.append("Merkle audit chain verification")

        scored.append((score, reasons, item))

    scored.sort(key=lambda x: x[0], reverse=True)
    top_20 = scored[:20]

    md_lines = [
        "# Incident-Zero — Video Production Review (Top 20 Critical Beats)",
        "",
        "Per Section C15 of `ANTIGRAVITY_MASTER_BRIEF.md`, this document lists the 20 beats most worth human review.",
        "Each beat is evaluated for speech pacing, code card legibility, audio-visual synchronisation, and state-machine accuracy.",
        "",
        "| # | Beat ID | Scene | Timestamp | Tag | Duration | Key Focus / Reason | Narration Excerpt |",
        "|---|---|---|---|---|---|---|---|"
    ]

    for idx, (score, reasons, b) in enumerate(top_20, 1):
        mm = int(b['start_sec'] // 60)
        ss = int(b['start_sec'] % 60)
        time_str = f"{mm:02d}:{ss:02d}"
        reason_str = "; ".join(reasons) if reasons else "Core architectural invariant"
        excerpt = (b['say'][:75] + "...") if len(b['say']) > 75 else b['say']
        excerpt_clean = excerpt.replace("|", "\\|")
        md_lines.append(f"| {idx} | `{b['beat_id']}` | `{b['scene_id']}` | `{time_str}` | `{b['tag']}` | `{b['duration']:.1f}s` | {reason_str} | \"{excerpt_clean}\" |")

    md_lines.extend([
        "",
        "## Reviewer Checklist for Selected Beats",
        "1. **T1–T5 Code Trace Overlays**: Confirm visual highlight accurately boxes the method call chain and terminal output.",
        "2. **State Machine Invariants**: Verify that `IncidentState.java` and illegal transition responses (HTTP 409) match the exact text spoken.",
        "3. **Merkle Audit Integrity**: Confirm SHA-256 genesis hash (`0000...`) and trigger-enforced immutability are clearly depicted.",
        "4. **Acoustic Clarity**: Confirm zero clipping or excessive mouth noise on emphasized and technical terms (`Spring Boot`, `Flyway`, `EBU R128`).",
        ""
    ])

    with open(review_md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines))
    print(f"[✓] Created {review_md_path}")

if __name__ == "__main__":
    generate_artifacts()
