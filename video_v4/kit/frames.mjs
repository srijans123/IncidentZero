#!/usr/bin/env node
// kit/frames.mjs — saves one picture per narration line, taken when everything that line shows is on screen:
// just before its voice ends, or just after its last cue finished, whichever is later.
// Output: video_v4/out/frames/<beat id>.png
//   node video_v4/kit/frames.mjs            every recorded take
//   node video_v4/kit/frames.mjs T03 T09    only those takes
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { V4 } from './lib.mjs';

const takes = path.join(V4, 'out', 'takes'), out = path.join(V4, 'out', 'frames');
fs.mkdirSync(out, { recursive: true });
const want = process.argv.slice(2);
for (const f of fs.readdirSync(takes).filter((x) => /^T\d+\.json$/.test(x)).sort()) {
  const id = f.replace('.json', '');
  if (want.length && !want.includes(id)) continue;
  const meta = JSON.parse(fs.readFileSync(path.join(takes, f), 'utf8'));
  let saved = 0;
  for (const k of meta.marks) {
    const t = Math.max(k.t + Math.max(0.2, k.d - 0.15), (k.e ?? 0) + 0.2);
    const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', t.toFixed(2), '-i', path.join(takes, id + '.mp4'), '-frames:v', '1', '-vf', 'scale=1280:-2', path.join(out, k.beat + '.png')]);
    if (r.status === 0) saved++;
  }
  console.log(`${id}: ${saved}/${meta.marks.length} pictures in video_v4/out/frames`);
}
