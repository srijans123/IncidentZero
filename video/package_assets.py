import os
import zipfile

def package_assets():
    zip_path = "video/assets.zip"
    print(f"[*] Packaging all non-video, non-SVG assets into {zip_path}...")

    # Files and folders to package (source_path, arcname_in_zip)
    include_map = [
        # 1. Narration and soundbed audio
        ("video/07_remotion/public/audio/scenes", "audio/scenes"),
        ("video/06_music_sfx", "audio/music_sfx"),

        # 2. Code snippets and terminal outputs
        ("video/07_remotion/public/code_snippets.json", "data/code_snippets.json"),
        ("video/07_remotion/public/terminal_outputs.json", "data/terminal_outputs.json"),
        ("video/07_remotion/public/composition_manifest.json", "data/composition_manifest.json"),

        # 3. Scripts and timings
        ("video/02_script/storyboard.json", "script/storyboard.json"),
        ("video/02_script/narration.md", "script/narration.md"),
        ("video/03_audio/timings.json", "script/timings.json"),

        # 4. Target element bounding boxes for highlights
        ("video/04_capture/boxes", "capture_boxes"),

        # 5. Remotion React components and source templates
        ("video/07_remotion/src", "remotion_src"),

        # 6. Facts, requirements and config
        ("video/config.json", "config/config.json"),
        ("video/01_facts/facts.json", "facts/facts.json"),
        ("video/01_facts/requirements.json", "facts/requirements.json"),
    ]

    count = 0
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for src, arc in include_map:
            if not os.path.exists(src):
                print(f"[-] Skipping missing: {src}")
                continue
            if os.path.isfile(src):
                zf.write(src, arc)
                count += 1
            elif os.path.isdir(src):
                for root, _, files in os.walk(src):
                    for file in files:
                        full_p = os.path.join(root, file)
                        # Omit video and svg files explicitly
                        if full_p.endswith((".mp4", ".webm", ".avi", ".mov", ".svg")):
                            continue
                        rel_p = os.path.relpath(full_p, src)
                        arc_p = os.path.join(arc, rel_p).replace("\\", "/")
                        zf.write(full_p, arc_p)
                        count += 1

    size_mb = os.path.getsize(zip_path) / (1024 * 1024)
    print(f"[✓] Created {zip_path}: {count} files packaged ({size_mb:.1f} MB).")

if __name__ == "__main__":
    package_assets()

