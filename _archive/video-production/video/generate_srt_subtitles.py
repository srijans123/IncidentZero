import os
import json

def format_timestamp(seconds):
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int(round((seconds - int(seconds)) * 1000))
    if millis >= 1000:
        secs += 1
        millis = 0
    return f"{hrs:02d}:{mins:02d}:{secs:02d},{millis:03d}"

def split_text_into_cues(text, start_sec, dur_sec, max_words=10):
    words = text.strip().split()
    if len(words) <= max_words:
        return [(start_sec, start_sec + dur_sec, text.strip())]
    
    # Split into chunks of ~8-10 words
    chunks = []
    curr = []
    for w in words:
        curr.append(w)
        if len(curr) >= max_words and not w.endswith((",", ";", ":")):
            chunks.append(" ".join(curr))
            curr = []
    if curr:
        chunks.append(" ".join(curr))
    
    total_words = len(words)
    cues = []
    t = start_sec
    for ch in chunks:
        ch_word_count = len(ch.split())
        ch_dur = dur_sec * (ch_word_count / total_words)
        cues.append((t, t + ch_dur, ch))
        t += ch_dur
    return cues

def generate_srts():
    manifest_path = "video/07_remotion/public/composition_manifest.json"
    timings_path = "video/03_audio/timings.json"
    
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)
    
    timings = {}
    if os.path.exists(timings_path):
        timings = json.load(open(timings_path, "r", encoding="utf-8")).get("scenes", {})
        
    scenes = manifest["scenes"]
    fps = manifest.get("fps", 30)

    # 1. Master SRT (Full 17m14s timeline)
    master_srt_path = "video/08_out/76_OOP_S1_2025-2026_Project_DRAFT_no_member_clips.srt"
    alt_srt_path = "video/08_out/subtitles.srt"
    by_scene_srt_path = "video/08_out/subtitles_by_scene.srt"

    master_cues = []
    scene_cues = []
    
    act_cues = {i: [] for i in range(11)}

    cue_idx = 1
    scene_idx = 1
    
    for sc in scenes:
        sc_id = sc["id"]
        act_num = sc["act"]
        text = sc["text"].strip()
        
        # Exact timeline offsets
        start_sec = sc["start_frame"] / fps
        timing_entry = timings.get(sc_id, {})
        # Actual spoken duration is slightly less than scene frame duration (excluding tail)
        speech_dur = timing_entry.get("audio_duration_sec") or timing_entry.get("duration_sec") or sc["duration_sec"]
        
        # Master single block per scene
        scene_cues.append(f"{scene_idx}\n{format_timestamp(start_sec)} --> {format_timestamp(start_sec + speech_dur)}\n{text}\n")
        scene_idx += 1
        
        # Phrased cues for master
        phrased = split_text_into_cues(text, start_sec, speech_dur)
        for t_start, t_end, cue_text in phrased:
            master_cues.append(f"{cue_idx}\n{format_timestamp(t_start)} --> {format_timestamp(t_end)}\n{cue_text}\n")
            cue_idx += 1
            
        # Local act timing
        act_scenes = [s for s in scenes if s["act"] == act_num]
        act_first_frame = act_scenes[0]["start_frame"]
        local_start_sec = (sc["start_frame"] - act_first_frame) / fps
        
        local_phrased = split_text_into_cues(text, local_start_sec, speech_dur)
        for t_start, t_end, cue_text in local_phrased:
            act_cues[act_num].append((t_start, t_end, cue_text))

    # Write Master Phrased SRT
    with open(master_srt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(master_cues))
    with open(alt_srt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(master_cues))
    with open(by_scene_srt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(scene_cues))
        
    print(f"[✓] Generated Master SRT: {master_srt_path} ({len(master_cues)} cues)")
    print(f"[✓] Generated Alternate SRT: {alt_srt_path}")
    print(f"[✓] Generated Scene-level SRT: {by_scene_srt_path} ({len(scene_cues)} cues)")

    # Write per-act SRTs
    acts_dir = "video/08_out/acts"
    os.makedirs(acts_dir, exist_ok=True)
    for act_num, cues_list in act_cues.items():
        act_srt = os.path.join(acts_dir, f"act_{act_num}.srt")
        with open(act_srt, "w", encoding="utf-8") as f:
            for idx, (t_start, t_end, cue_text) in enumerate(cues_list, 1):
                f.write(f"{idx}\n{format_timestamp(t_start)} --> {format_timestamp(t_end)}\n{cue_text}\n\n")
        print(f"    - Act {act_num} SRT: {act_srt} ({len(cues_list)} cues)")

if __name__ == "__main__":
    generate_srts()

