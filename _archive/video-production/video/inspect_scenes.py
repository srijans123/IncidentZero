import json

with open('video/02_script/storyboard.json') as f:
    sb = json.load(f)

for act in sb['acts']:
    print(f"\n=== Act {act['act']}: {act['title']} ===")
    for sc in act['scenes']:
        keys_summary = ", ".join([f"{k}={repr(sc[k])[:30]}" for k in sc if k not in ['text', 'speaker', 'word_count']])
        print(f"  [{sc['id']}] {sc['type']} | {keys_summary}")

