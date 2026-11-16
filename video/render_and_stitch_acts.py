import os
import sys
import time
import shutil
import subprocess

def main():
    print("============================================================")
    print("  Incident-Zero — Act-by-Act Master Render & Stitch Pipeline")
    print("============================================================")

    acts_dir = "video/08_out/acts"
    os.makedirs(acts_dir, exist_ok=True)

    final_master_path = "video/08_out/76_OOP_S1_2025-2026_Project_DRAFT_no_member_clips.mp4"
    remotion_dir = "video/07_remotion"

    # Parse arguments
    force_all = "--force" in sys.argv
    target_acts = None
    for arg in sys.argv:
        if arg.startswith("--acts="):
            target_acts = [int(x.strip()) for x in arg.split("=")[1].split(",")]

    # Render Acts 0 to 10
    for act_num in range(11):
        if target_acts is not None and act_num not in target_acts:
            continue
        act_out = os.path.join(acts_dir, f"act_{act_num}.mp4")
        if not force_all and os.path.exists(act_out) and os.path.getsize(act_out) > 1000000:
            print(f"[✓] Act {act_num} already rendered ({os.path.getsize(act_out)/1024/1024:.1f} MB)")
            continue
        if os.path.exists(act_out):
            try:
                os.remove(act_out)
            except Exception:
                pass

        print(f"\n[*] Rendering Act {act_num} (1080p, 30fps)...")
        rel_out = f"../08_out/acts/act_{act_num}.mp4"
        cmd = [
            "npx", "remotion", "render",
            "src/index.js",
            f"Act{act_num}",
            rel_out,
            "--concurrency=6",
            "--gl=angle"
        ]

        success = False
        for attempt in range(1, 4):
            t0 = time.time()
            res = subprocess.run(cmd, cwd=remotion_dir, shell=True)
            if res.returncode == 0 and os.path.exists(act_out) and os.path.getsize(act_out) > 500000:
                print(f"[✓] Act {act_num} rendered successfully in {time.time()-t0:.1f}s ({os.path.getsize(act_out)/1024/1024:.1f} MB)")
                success = True
                break
            else:
                print(f"[!] Act {act_num} attempt {attempt} failed (code {res.returncode}). Retrying...")
                time.sleep(3)

        if not success:
            print(f"[X] Critical error: Act {act_num} failed to render after 3 attempts.")
            sys.exit(1)

    print("\n============================================================")
    print("  All 11 Acts Rendered Successfully! Stitching Master...    ")
    print("============================================================")

    # Generate ffmpeg concat list
    concat_file = os.path.join(acts_dir, "concat_list.txt")
    with open(concat_file, "w", encoding="utf-8") as f:
        for act_num in range(11):
            f.write(f"file 'act_{act_num}.mp4'\n")

    # Stitch using FFmpeg concat protocol (stream copy, lossless, instantaneous)
    stitch_cmd = [
        "ffmpeg", "-y", "-v", "error",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_file,
        "-c", "copy",
        final_master_path
    ]
    subprocess.run(stitch_cmd, check=True)
    print(f"[✓] Final Master Video stitched to: {final_master_path}")

    # Copy act_0 to act0_preview.mp4 for rapid preview
    act0_src = os.path.join(acts_dir, "act_0.mp4")
    act0_preview = "video/08_out/act0_preview.mp4"
    if os.path.exists(act0_src):
        shutil.copy2(act0_src, act0_preview)
        print(f"[✓] Synced Act 0 to preview: {act0_preview}")

    # Inspect final file via ffprobe
    probe_cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration,size",
        "-show_entries", "stream=width,height,r_frame_rate,codec_name",
        "-of", "json",
        final_master_path
    ]
    probe_res = subprocess.run(probe_cmd, capture_output=True, text=True, check=True)
    print("[*] Master Video FFprobe Analysis:")
    print(probe_res.stdout)

if __name__ == "__main__":
    main()

