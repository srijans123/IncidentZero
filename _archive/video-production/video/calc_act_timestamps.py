import json

m = json.load(open('video/07_remotion/public/composition_manifest.json', 'r', encoding='utf-8'))
acts = {}
for s in m['scenes']:
    a = s['act']
    if a not in acts:
        acts[a] = {'start': s['start_frame'] / 30.0, 'title': s['act_title'], 'end': s['end_frame'] / 30.0}
    else:
        acts[a]['end'] = s['end_frame'] / 30.0

for a in sorted(acts.keys()):
    st_m, st_s = int(acts[a]['start'] // 60), int(acts[a]['start'] % 60)
    en_m, en_s = int(acts[a]['end'] // 60), int(acts[a]['end'] % 60)
    dur = acts[a]['end'] - acts[a]['start']
    print(f"Act {a}: {acts[a]['title']} -> {st_m:02d}:{st_s:02d} - {en_m:02d}:{en_s:02d} ({dur:.1f}s)")

