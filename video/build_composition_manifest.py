import os
import json

def build_manifest():
    storyboard_file = "video/02_script/storyboard.json"
    timings_file = "video/03_audio/timings.json"
    snippets_file = "video/07_remotion/public/code_snippets.json"
    terminal_file = "video/07_remotion/public/terminal_outputs.json"
    out_file = "video/07_remotion/public/composition_manifest.json"

    with open(storyboard_file, "r", encoding="utf-8") as f:
        sb = json.load(f)

    timings = {}
    if os.path.exists(timings_file):
        try:
            with open(timings_file, "r", encoding="utf-8") as f:
                timings_data = json.load(f)
                timings = timings_data.get("scenes", {})
        except Exception as e:
            print(f"Warning reading timings: {e}")

    snippets = {}
    if os.path.exists(snippets_file):
        with open(snippets_file, "r", encoding="utf-8") as f:
            snippets = json.load(f)

    terminals = {}
    if os.path.exists(terminal_file):
        with open(terminal_file, "r", encoding="utf-8") as f:
            terminals = json.load(f)

    # Flatten all scenes with exact frames and offsets
    manifest_scenes = []
    current_frame = 0
    fps = 30

    for act in sb["acts"]:
        act_num = act["act"]
        act_title = act["title"]

        for sc in act["scenes"]:
            sc_id = sc["id"]
            
            # Duration in seconds
            dur_sec = sc.get("est_sec", 12.0)
            if sc_id in timings and "duration_sec" in timings[sc_id]:
                dur_sec = timings[sc_id]["duration_sec"]

            frames = int(round(dur_sec * fps))

            scene_entry = {
                "id": sc_id,
                "act": act_num,
                "act_title": act_title,
                "type": sc["type"],
                "text": sc["text"],
                "duration_sec": dur_sec,
                "duration_frames": frames,
                "start_frame": current_frame,
                "end_frame": current_frame + frames
            }

            # Type specific attributes
            if sc["type"] == "screen":
                scene_entry["target_url"] = sc.get("target_url")
                scene_entry["highlight"] = sc.get("highlight")
            elif sc["type"] == "diagram":
                scene_entry["diagram_id"] = sc.get("diagram_id")
            elif sc["type"] == "code":
                scene_entry["code_data"] = snippets.get(sc_id, {})
            elif sc["type"] == "terminal":
                scene_entry["terminal_data"] = terminals.get(sc_id, {})
                scene_entry["command"] = sc.get("command")
            elif sc["type"] == "title":
                scene_entry["title"] = sc.get("title")
                scene_entry["subtitle"] = sc.get("subtitle")
            elif sc["type"] == "member_slot":
                scene_entry["member"] = sc.get("member")
                scene_entry["id_num"] = sc.get("id_num")

            manifest_scenes.append(scene_entry)
            current_frame += frames

    total_duration_sec = current_frame / fps
    mins = int(total_duration_sec // 60)
    secs = int(total_duration_sec % 60)

    manifest = {
        "fps": fps,
        "width": 1920,
        "height": 1080,
        "total_frames": current_frame,
        "total_duration_sec": total_duration_sec,
        "formatted_duration": f"{mins:02d}:{secs:02d}",
        "total_scenes": len(manifest_scenes),
        "scenes": manifest_scenes
    }

    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"Manifest generated: {len(manifest_scenes)} scenes, {current_frame} frames ({mins}:{secs:02d}s)")
    return manifest

if __name__ == "__main__":
    build_manifest()

