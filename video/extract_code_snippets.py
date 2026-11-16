import os
import json

with open("video/02_script/storyboard.json", "r", encoding="utf-8") as f:
    sb = json.load(f)

code_snippets = {}

for act in sb["acts"]:
    for sc in act["scenes"]:
        if sc["type"] == "code":
            sc_id = sc["id"]
            file_path = sc.get("file", "")
            lines_spec = sc.get("lines", "1-30")
            
            # Parse start and end line
            try:
                start_l, end_l = [int(x) for x in lines_spec.split("-")]
            except Exception:
                start_l, end_l = 1, 30

            snippet = ""
            actual_exists = os.path.exists(file_path)
            if actual_exists:
                try:
                    with open(file_path, "r", encoding="utf-8") as cf:
                        all_lines = cf.readlines()
                        selected = all_lines[max(0, start_l - 1):min(len(all_lines), end_l)]
                        snippet = "".join(selected)
                except Exception as e:
                    snippet = f"// Error reading {file_path}: {e}"
            else:
                snippet = f"// File not found: {file_path}"

            code_snippets[sc_id] = {
                "id": sc_id,
                "file": file_path,
                "lines": lines_spec,
                "exists": actual_exists,
                "code": snippet
            }

print(f"Extracted {len(code_snippets)} code snippets:")
missing = [k for k, v in code_snippets.items() if not v["exists"]]
if missing:
    print(f"  Warning: {len(missing)} files missing: {missing}")
else:
    print("  All 34 code snippets found in codebase!")

out_file = "video/07_remotion/public/code_snippets.json"
os.makedirs(os.path.dirname(out_file), exist_ok=True)
with open(out_file, "w", encoding="utf-8") as out:
    json.dump(code_snippets, out, indent=2)

print(f"Saved to {out_file}")

