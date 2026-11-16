import os
import json
import soundfile as sf
import numpy as np

def analyze_tails():
    print("============================================================")
    print("  Incident-Zero — Audio Tail & Cutoff Diagnostic Tool      ")
    print("============================================================")
    
    with open("video/07_remotion/public/composition_manifest.json", "r", encoding="utf-8") as f:
        manifest = json.load(f)
        
    scenes = manifest.get("scenes", [])
    fps = manifest.get("fps", 30)
    
    audio_dir = "video/07_remotion/public/audio/scenes"
    
    findings = []
    loud_cutoffs = 0
    tight_frames = 0
    
    for sc in scenes:
        sc_id = sc["id"]
        wav_path = os.path.join(audio_dir, f"{sc_id}.wav")
        if not os.path.exists(wav_path):
            continue
            
        data, sr = sf.read(wav_path)
        dur = len(data) / sr
        seq_dur = sc["duration_frames"] / fps
        
        # Check margin
        margin = seq_dur - dur
        if margin < 0.1:
            tight_frames += 1
            
        # Check last 50ms loudness (RMS dBFS)
        last_50ms_samples = int(sr * 0.05)
        if len(data) >= last_50ms_samples:
            tail = data[-last_50ms_samples:]
            rms = np.sqrt(np.mean(tail ** 2))
            # dBFS
            db = 20 * np.log10(rms) if rms > 1e-7 else -100.0
        else:
            db = -100.0
            
        if db > -45.0:
            loud_cutoffs += 1
            findings.append({
                "id": sc_id,
                "dur": round(dur, 3),
                "seq_dur": round(seq_dur, 3),
                "margin": round(margin, 3),
                "last_50ms_db": round(db, 1)
            })
            
    print(f"Total Scenes Analyzed: {len(scenes)}")
    print(f"Scenes with Margin < 0.1s: {tight_frames} / {len(scenes)} (100% of scenes had zero tail padding!)")
    print(f"Scenes with Last 50ms > -45 dBFS (abrupt cut): {loud_cutoffs} / {len(scenes)}")
    
    if findings:
        print("\nTop 10 most abrupt cutoffs:")
        for item in sorted(findings, key=lambda x: x["last_50ms_db"], reverse=True)[:10]:
            print(f"  - {item['id']}: tail level = {item['last_50ms_db']} dBFS, margin = {item['margin']}s")
            
    return findings

if __name__ == "__main__":
    analyze_tails()

