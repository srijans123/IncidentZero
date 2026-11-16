#!/usr/bin/env node
// apply_additional_fixes.mjs — put this file in the repository root (next to ROUND2_FIX.md) and run:
//     node apply_additional_fixes.mjs
// It makes four small, exact changes to the recording kit that came in ROUND2_PACKAGE_v2.zip and adds one tool.
// It is safe to run more than once. It never touches the app, the direction files or the audio.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const KIT = path.join(process.cwd(), 'video_v4', 'kit');
if (!fs.existsSync(path.join(KIT, 'lib.mjs'))) { console.log('FAIL  video_v4/kit/lib.mjs not found. Run this from the repository root, after unzipping ROUND2_PACKAGE_v2.zip.'); process.exit(1); }
let failed = 0;
/** replace `oldText` with `newText` in `file`, exactly once; `marker` is text that only exists after the change */
function patch(name, file, marker, oldText, newText) {
  const p = path.join(KIT, file); let s = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
  if (s.includes(marker)) { console.log(`ALREADY  ${name}`); return; }
  if (!s.includes(oldText)) { console.log(`FAIL     ${name}: the text to replace was not found in video_v4/kit/${file} (see ADDITIONAL_FIXES.md, Part A, "by hand")`); failed++; return; }
  fs.writeFileSync(p, s.replace(oldText, newText)); console.log(`PATCHED  ${name}`);
}

// 1. A code card shrinks its text until its longest line fits (already in v2; applied here only if missing).
patch('1 card text fits the card', 'stagekit.js', 'shrink the type until the longest line fits',
`      card = { node, code, def, note: null };
      await show('card', node);`,
`      // shrink the type until the longest line fits, so nothing is cut off on the right
      mount(); node.style.visibility = 'hidden'; layer.appendChild(node);
      const view = node.querySelector('.view');
      if (code.scrollWidth > view.clientWidth) {
        const fit = Math.max(12.5, fs * (view.clientWidth / code.scrollWidth) * 0.985);
        node.style.setProperty('--fs', fit + 'px'); node.style.setProperty('--h', Math.min(860, Math.round(n * fit * 1.55 + 36)) + 'px');
      }
      node.style.visibility = '';
      card = { node, code, def, note: null };
      await show('card', node);`);

// 2. "Late" is only counted for cues tied to a spoken word or a clock time, and not for cues that follow a page change
//    in the same beat. (A beat that opens a new file is allowed to finish its highlights after the sentence.)
patch('2 lateness counted only for word-timed cues', 'lib.mjs', 'const SLOW_VERBS',
`      let prevAt = 0;
      for (const [cue, ...step] of beat.cues || []) {`,
`      let prevAt = 0, afterSlow = false;
      const SLOW_VERBS = new Set(['goto', 'ghGoto', 'ghFolder', 'ghOpen', 'ghClick', 'ghSelect', 'user', 'tab', 'type']);
      for (const [cue, ...step] of beat.cues || []) {`);
patch('3 lateness rule', 'lib.mjs', '!afterSlow && !relative',
`        if (wait < -350) this.late.push({ beat: beat.id, cue: String(cue), by: +(-wait / 1000).toFixed(2) });`,
`        const relative = typeof cue === 'string' && cue.startsWith('+');
        if (wait < -350 && !afterSlow && !relative) this.late.push({ beat: beat.id, cue: String(cue), by: +(-wait / 1000).toFixed(2) });
        if (SLOW_VERBS.has(step[0])) afterSlow = true;`);

// 3. Every beat keeps its final picture on screen for at least 0.45 s after its last cue, and the time is saved,
//    so a highlight that finished late is still seen, and frames.mjs can photograph the finished state.
patch('4 final picture of each beat is held and its time saved', 'lib.mjs', 'this.marks.at(-1).e =',
`      await sleep((T + D + (beat.hold ?? 0.3) - this.t()) * 1000);`,
`      this.marks.at(-1).e = +this.t().toFixed(3);
      await sleep(Math.max(450, (T + D + (beat.hold ?? 0.3) - this.t()) * 1000));`);

// 4. The per-line picture tool.
fs.writeFileSync(path.join(KIT, 'frames.mjs'), `#!/usr/bin/env node
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
for (const f of fs.readdirSync(takes).filter((x) => /^T\\d+\\.json$/.test(x)).sort()) {
  const id = f.replace('.json', '');
  if (want.length && !want.includes(id)) continue;
  const meta = JSON.parse(fs.readFileSync(path.join(takes, f), 'utf8'));
  let saved = 0;
  for (const k of meta.marks) {
    const t = Math.max(k.t + Math.max(0.2, k.d - 0.15), (k.e ?? 0) + 0.2);
    const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', t.toFixed(2), '-i', path.join(takes, id + '.mp4'), '-frames:v', '1', '-vf', 'scale=1280:-2', path.join(out, k.beat + '.png')]);
    if (r.status === 0) saved++;
  }
  console.log(\`\${id}: \${saved}/\${meta.marks.length} pictures in video_v4/out/frames\`);
}
`);
console.log('WRITTEN  video_v4/kit/frames.mjs');

for (const f of ['lib.mjs', 'cli.mjs', 'frames.mjs', 'smoke.mjs', 'probe.mjs', 'terminal.mjs']) {
  const r = spawnSync(process.execPath, ['--check', path.join(KIT, f)], { encoding: 'utf8' });
  if (r.status !== 0) { console.log(`FAIL     syntax error in video_v4/kit/${f}:\n${r.stderr.slice(0, 600)}`); failed++; }
}
console.log(failed ? `\nADDITIONAL FIXES: ${failed} FAILED` : '\nADDITIONAL FIXES: ALL APPLIED');
process.exit(failed ? 1 : 0);
