import os
import sys
import subprocess
import soundfile as sf
import numpy as np

def get_duration(file_path):
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        file_path
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return float(res.stdout.strip())

def main():
    print("============================================================")
    print("  Incident-Zero — Stitch Quality & Audio Boundary Inspection")
    print("============================================================")

    master_path = "video/08_out/76_OOP_S1_2025-2026_Project_DRAFT_no_member_clips.mp4"
    acts_dir = "video/08_out/acts"

    if not os.path.exists(master_path):
        print(f"[!] Master video not yet generated at {master_path}")
        return

    act_files = [os.path.join(acts_dir, f"act_{i}.mp4") for i in range(11)]
    missing = [f for f in act_files if not os.path.exists(f)]
    if missing:
        print(f"[!] Missing act files: {missing}")
        return

    act_durations = [get_duration(f) for f in act_files]
    sum_durations = sum(act_durations)
    master_dur = get_duration(master_path)
    diff = master_dur - sum_durations

    print(f"[*] Sum of 11 Act Durations: {sum_durations:.3f}s")
    print(f"[*] Stitched Master Duration: {master_dur:.3f}s")
    print(f"[*] Discrepancy: {diff:+.4f}s")

    # Boundary analysis
    current_time = 0.0
    boundaries = []
    for i in range(10):
        current_time += act_durations[i]
        boundaries.append((i, i + 1, current_time))

    tmp_wav = "video/08_out/boundary_check_tmp.wav"
    clicks_detected = []
    gaps_detected = []

    print("\n[*] Inspecting 10 Act boundaries for clicks, pops, and silent gaps...")
    for from_act, to_act, b_time in boundaries:
        start_t = max(0.0, b_time - 0.5)
        # Extract 1.0s window around boundary
        cmd = [
            "ffmpeg", "-y", "-v", "error",
            "-ss", f"{start_t:.3f}",
            "-t", "1.0",
            "-i", master_path,
            "-ar", "48000",
            "-ac", "2",
            tmp_wav
        ]
        subprocess.run(cmd, check=True)

        data, sr = sf.read(tmp_wav)
        # Check for discontinuities / sharp clicks: max sample delta
        deltas = np.abs(np.diff(data, axis=0))
        max_delta = np.max(deltas)
        # Check RMS
        rms = np.sqrt(np.mean(data**2))
        rms_db = 20 * np.log10(max(1e-9, rms))

        # Check for zero audio silence
        silent_samples = np.sum(np.abs(data) < 1e-4) / (sr * 2)

        has_click = max_delta > 0.85
        has_gap = silent_samples > 0.8

        status = "CLEAN"
        if has_click:
            status = "CLICK DETECTED"
            clicks_detected.append((from_act, to_act, b_time, max_delta))
        elif has_gap:
            status = "GAP DETECTED"
            gaps_detected.append((from_act, to_act, b_time, silent_samples))

        print(f"    Boundary Act {from_act} -> Act {to_act} @ {b_time:7.2f}s | RMS: {rms_db:6.1f} dBFS | MaxDelta: {max_delta:.3f} | [{status}]")

    if os.path.exists(tmp_wav):
        try: os.remove(tmp_wav)
        except Exception: pass

    print("\n============================================================")
    print("  AUDIO STITCH INTEGRITY SUMMARY")
    print("============================================================")
    print(f"Total Duration Match: {'EXACT' if abs(diff) < 0.05 else 'DRIFT DETECTED'}")
    print(f"Clicks / Pops Detected: {len(clicks_detected)}")
    print(f"Unintended Audio Gaps: {len(gaps_detected)}")

    if clicks_detected or gaps_detected:
        print("[!] Audio boundary flaws detected. Continuous audio remux recommended.")
        return False
    else:
        print("[✓] Audio stream is continuous, synchronous, and pop-free across all act boundaries.")
        return True

if __name__ == "__main__":
    main()

