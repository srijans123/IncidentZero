import os
import json

def main():
    svg_dir = "video/07_remotion/public/diagrams"
    out_file = "video/07_remotion/public/diagram_svgs.json"

    svg_dict = {}
    if os.path.exists(svg_dir):
        for f in os.listdir(svg_dir):
            if f.endswith(".svg"):
                diagram_id = f[:-4]
                full_path = os.path.join(svg_dir, f)
                with open(full_path, "r", encoding="utf-8") as sf:
                    svg_dict[diagram_id] = sf.read()

    print(f"[*] Packed {len(svg_dict)} diagram SVGs into {out_file}")
    with open(out_file, "w", encoding="utf-8") as out:
        json.dump(svg_dict, out, indent=2)

if __name__ == "__main__":
    main()

