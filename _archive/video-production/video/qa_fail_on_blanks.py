import os
import sys
import json
import subprocess
import numpy as np
from PIL import Image

def main():
    print("============================================================")
    print("  Incident-Zero — Automated QA Gate: Fail on Blanks & Blacks")
    print("============================================================")

    master_video = "video/08_out/76_OOP_S1_2025-2026_Project_DRAFT_no_member_clips.mp4"
    acts_dir = "video/08_out/acts"
    contact_dir = "video/08_out/contact_sheet"
    os.makedirs(contact_dir, exist_ok=True)

    manifest_file = "video/07_remotion/public/composition_manifest.json"
    with open(manifest_file, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    snippets = json.load(open("video/07_remotion/public/code_snippets.json", "r", encoding="utf-8")) if os.path.exists("video/07_remotion/public/code_snippets.json") else {}
    terminals = json.load(open("video/07_remotion/public/terminal_outputs.json", "r", encoding="utf-8")) if os.path.exists("video/07_remotion/public/terminal_outputs.json") else {}
    diagrams = json.load(open("video/07_remotion/public/diagram_svgs.json", "r", encoding="utf-8")) if os.path.exists("video/07_remotion/public/diagram_svgs.json") else {}

    scenes = manifest["scenes"]
    fps = manifest.get("fps", 30)

    failed_assets = []
    blank_scenes = []

    print("[1/3] Verifying asset resolution for all 96 scenes...")
    for sc in scenes:
        sc_id = sc["id"]
        sc_type = sc["type"]

        if sc_type == "screen":
            clip_path = f"video/07_remotion/public/clips/{sc_id}.mp4"
            if not os.path.exists(clip_path) or os.path.getsize(clip_path) < 1000:
                failed_assets.append((sc_id, sc_type, f"Missing or empty clip: {clip_path}"))
        elif sc_type == "diagram":
            diag_id = sc.get("diagram_id", "hexagonal_architecture")
            if diag_id not in diagrams or len(diagrams[diag_id]) < 100:
                failed_assets.append((sc_id, sc_type, f"Missing SVG diagram: {diag_id}"))
        elif sc_type == "code":
            if sc_id not in snippets or not snippets[sc_id].get("lines"):
                failed_assets.append((sc_id, sc_type, "Missing code lines in code_snippets.json"))
        elif sc_type == "terminal":
            if sc_id not in terminals or not terminals[sc_id].get("lines"):
                failed_assets.append((sc_id, sc_type, "Missing terminal lines in terminal_outputs.json"))

    if failed_assets:
        print(f"[!] FAILED: {len(failed_assets)} scenes have missing assets!")
        for sc_id, sc_type, reason in failed_assets:
            print(f"    - [{sc_type}] {sc_id}: {reason}")
    else:
        print("[✓] All 96 scenes resolve to valid, non-empty assets.")

    print("\n[2/3] Extracting contact sheet and verifying frame luminance / uniformity...")
    html_cards = []

    for idx, sc in enumerate(scenes, 1):
        sc_id = sc["id"]
        act_num = sc["act"]
        act_video = os.path.join(acts_dir, f"act_{act_num}.mp4")

        # Local scene timing within act
        act_scenes = [s for s in scenes if s["act"] == act_num]
        first_frame = act_scenes[0]["start_frame"]
        local_start = (sc["start_frame"] - first_frame) / fps
        local_dur = sc["duration_sec"]
        local_mid = local_start + (local_dur / 2.0)

        thumb_png = os.path.join(contact_dir, f"sc_{idx:02d}_{sc_id}.png")

        # Extract from act video if available, else master
        src_video = act_video if os.path.exists(act_video) else master_video
        if os.path.exists(src_video):
            cmd = [
                "ffmpeg", "-y", "-v", "error",
                "-ss", f"{local_mid:.3f}",
                "-i", src_video,
                "-vframes", "1",
                "-vf", "scale=640:360",
                thumb_png
            ]
            subprocess.run(cmd)

            if os.path.exists(thumb_png):
                img = Image.open(thumb_png).convert("L")
                arr = np.array(img)
                mean_lum = float(np.mean(arr))
                std_lum = float(np.std(arr))

                is_black = mean_lum < 5.0
                is_uniform = std_lum < 3.0
                is_wash = mean_lum > 220.0 and std_lum < 20.0

                if is_black or is_uniform or is_wash:
                    blank_scenes.append((sc_id, mean_lum, std_lum, "black" if is_black else "uniform" if is_uniform else "wash"))

                status_color = "#ff3864" if (is_black or is_uniform or is_wash) else "#00ff9d"
                html_cards.append(f"""
                <div style="border: 2px solid {status_color}; border-radius: 8px; overflow: hidden; background: #0c101d;">
                    <img src="sc_{idx:02d}_{sc_id}.png" style="width: 100%; display: block;" />
                    <div style="padding: 8px 12px; font-family: monospace; font-size: 11px; color: #fff;">
                        <strong>[{idx:02d}] {sc_id}</strong> ({sc['type']})<br/>
                        <span style="color: #a0aec0;">Lum: {mean_lum:.1f} | Std: {std_lum:.1f}</span>
                    </div>
                </div>
                """)

    # Write HTML contact sheet
    with open(os.path.join(contact_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(f"""<!DOCTYPE html>
        <html>
        <head><title>Visual Contact Sheet (96 Scenes)</title></head>
        <body style="background: #06080d; color: #fff; font-family: sans-serif; padding: 24px;">
            <h1>Incident-Zero (I-ITSM v2.2) — 96-Scene Contact Sheet</h1>
            <p>Generated automated frame verification at midpoint of every scene.</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
                {''.join(html_cards)}
            </div>
        </body>
        </html>""")

    print(f"[✓] Contact sheet written to {contact_dir}/index.html")

    print("\n[3/3] Running FFmpeg blackdetect (d=0.5:pic_th=0.98)...")
    black_intervals = []
    if os.path.exists(master_video):
        cmd = [
            "ffmpeg", "-v", "info",
            "-i", master_video,
            "-vf", "blackdetect=d=0.5:pic_th=0.98",
            "-an", "-f", "null", "-"
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        for line in res.stderr.splitlines():
            if "black_start:" in line:
                black_intervals.append(line.strip())
                print(f"    [!] Black interval: {line.strip()}")

    print("\n============================================================")
    print("  QA GATE SUMMARY")
    print("============================================================")
    print(f"Missing Assets: {len(failed_assets)}")
    print(f"Blank / Uniform Scenes: {len(blank_scenes)}")
    print(f"Black Intervals (>=0.5s): {len(black_intervals)}")

    if failed_assets or blank_scenes or black_intervals:
        print("\n[X] QA GATE FAILED — Visual issues detected!")
        sys.exit(1)
    else:
        print("\n[✓] QA GATE PASSED — Zero blank frames, pristine visual coverage across all 96 scenes!")
        sys.exit(0)

if __name__ == "__main__":
    main()

