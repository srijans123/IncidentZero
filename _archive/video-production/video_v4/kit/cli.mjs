#!/usr/bin/env node
// kit/cli.mjs — validate | record | assemble | gates | selftest-github
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { REPO, V4, KIT, W, H, FPS, log, sleep, loadConfig, loadTimings, cueTime, resolveCard, expand, gitShow, Recorder, Director } from './lib.mjs';

const require = createRequire(path.join(REPO, 'frontend', 'package.json'));
const cfg = loadConfig();
{ const i = process.argv.indexOf('--app'); if (i > 0) cfg.appUrl = process.argv[i + 1].replace(/\/$/, ''); }      // --app <url>: record against another copy of the app
{ const i = process.argv.indexOf('--landing'); if (i > 0) cfg.landingUrl = process.argv[i + 1]; }
const OUT = path.join(V4, 'out'), TAKES = path.join(OUT, 'takes');
const args = process.argv.slice(2), cmd = args[0], flag = (f) => args.includes(f);
const direction = await import(pathToFileURL(path.join(V4, 'direction', 'index.mjs')).href);
const timings = loadTimings(cfg);
const sha = cfg.pinnedSha || 'HEAD';
const ff = (a, opts = {}) => { const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...a], { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', ...opts }); if (r.status !== 0) throw new Error('ffmpeg failed: ' + (r.stderr || '').slice(-1500)); return r; };
const probe = (f) => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }));
const allBeats = () => direction.takes.flatMap((t) => t.beats.map((b) => ({ ...b, take: t.id })));

// ------------------------------------------------------------------------------------------------ validate
function validate() {
  const errors = [], warns = []; const seen = new Set(), missingTerm = new Set();
  const cardLines = {};
  for (const [id, def] of Object.entries(direction.cards)) { try { cardLines[id] = resolveCard(id, def, sha).lines; if (cardLines[id].length > 30) warns.push(`card ${id} has ${cardLines[id].length} lines (over 30)`); } catch (e) { errors.push(e.message); } }
  for (const t of direction.takes) {
    let card = null, dia = null, term = null;
    for (const b of t.beats) {
      if (seen.has(b.id)) errors.push('duplicate beat ' + b.id); seen.add(b.id);
      const tm = timings[b.id];
      if (!tm && !b.silent && !b.optional) errors.push(`beat ${b.id}: no audio timing (generate the audio or mark the beat optional)`);
      const steps = [...(b.pre || []).map((s) => [null, ...s]), ...(b.cues || []), ...(b.post || []).map((s) => [null, ...s])];
      let prev = 0;
      for (const [cue, verb, ...a] of steps) {
        if (typeof cue === 'string' && cue.startsWith('@') && cue !== '@end' && tm) { const r = cueTime(tm, cue.slice(1), { after: prev - 0.3 }); prev = r.t; if (r.how === 'missing') errors.push(`beat ${b.id}: cue ${cue} is not in the spoken text`); else if (r.how === 'text') warns.push(`beat ${b.id}: cue ${cue} timed from text position (speech recogniser did not hear that word)`); }
        else if (typeof cue === 'number') prev = cue;
        if (verb === 'card') { card = a[0]; if (!direction.cards[card]) errors.push(`beat ${b.id}: unknown card ${card}`); }
        if (verb === 'cardClose' || verb === 'closeAll' || verb === 'ghGoto' || verb === 'goto' || verb === 'diagram') card = null;
        if ((verb === 'hl' || verb === 'tok' || verb === 'toks') && card && cardLines[card]) for (const n of (verb === 'toks' ? a[0] : a)) if (!cardLines[card].some((l) => l.includes(n))) errors.push(`beat ${b.id}: ${verb} text not in card ${card}: ${n}`);
        if ((verb === 'hl' || verb === 'tok' || verb === 'toks' || verb === 'note') && !card) errors.push(`beat ${b.id}: ${verb} used with no card open`);
        if (verb === 'diagram') { dia = a[0]; if (!direction.diagrams[dia]) errors.push(`beat ${b.id}: unknown diagram ${dia}`); }
        if (verb === 'diagramClose' || verb === 'closeAll') dia = null;
        if ((verb === 'step' || verb === 'glow' || verb === 'mark') && dia && direction.diagrams[dia] && a[0] && !(direction.diagrams[dia].nodes || []).some((n) => n.id === a[0])) errors.push(`beat ${b.id}: ${verb} node ${a[0]} not in diagram ${dia}`);
        if (verb === 'sweep' && dia) for (const id of a[0]) if (!direction.diagrams[dia].nodes.some((n) => n.id === id)) errors.push(`beat ${b.id}: sweep node ${id} not in diagram ${dia}`);
        if (verb === 'ghSelect' || verb === 'ghLine') { const src = gitShow(sha, expand(a[0])); for (const n of [a[1], a[2]].filter(Boolean)) if (!src.includes(n)) errors.push(`beat ${b.id}: ${verb} text not in ${a[0]}: ${n}`); }
        if (verb === 'try') { continue; }
        if (verb === 'termType' || verb === 'termPrint') { term = a[0]; if (!direction.terminal[term]) errors.push(`beat ${b.id}: unknown terminal block ${term}`); else if (!fs.existsSync(path.join(V4, 'terminal', term + '.txt'))) missingTerm.add(term); }
        if (verb === 'termPoint' && term && fs.existsSync(path.join(V4, 'terminal', term + '.txt')) && !fs.readFileSync(path.join(V4, 'terminal', term + '.txt'), 'utf8').includes(a[0])) errors.push(`beat ${b.id}: termPoint text not in video_v4/terminal/${term}.txt: ${a[0]}`);
        if (verb === 'ghOpen' && a[2]) { try { gitShow(sha, expand(a[2])); } catch { errors.push(`beat ${b.id}: ghOpen file does not exist at ${sha}: ${a[2]}`); } }
        if (verb === 'title' && !direction.titles[a[0]]) errors.push(`beat ${b.id}: unknown title ${a[0]}`);
      }
    }
  }
  if (missingTerm.size) warns.push(`terminal output not captured yet (run: node video_v4/kit/terminal.mjs): ${[...missingTerm].join(', ')}`);
  // every code line quoted inside a diagram must exist in the file it names
  for (const [id, d] of Object.entries(direction.diagrams)) for (const n of d.nodes || []) { const file = (n.file || '').split(' · ')[0]; if (!n.code || !/^(backend|frontend)\//.test(file)) continue; try { if (!gitShow(sha, file).includes(n.code)) errors.push(`diagram ${id}, box ${n.id}: code line not found in ${file}: ${n.code}`); } catch { errors.push(`diagram ${id}, box ${n.id}: file not found: ${file}`); } }
  const spoken = Object.keys(timings).filter((k) => !seen.has(k));
  if (spoken.length) warns.push(`${spoken.length} beats have audio but are not in the direction: ${spoken.slice(0, 12).join(', ')}${spoken.length > 12 ? ' …' : ''}`);
  warns.forEach((w) => console.log('WARN  ' + w)); errors.forEach((e) => console.log('ERROR ' + e));
  console.log(`\nvalidate: ${seen.size} beats, ${Object.keys(direction.cards).length} cards, ${Object.keys(direction.diagrams).length} diagrams — ${errors.length} errors, ${warns.length} warnings`);
  return errors.length === 0;
}

// ------------------------------------------------------------------------------------------------ record
async function launch() {
  const { chromium } = require('playwright');
  const profile = path.join(OUT, 'profile'); if (flag('--fresh')) fs.rmSync(profile, { recursive: true, force: true });
  const ctx = await chromium.launchPersistentContext(profile, {
    headless: cfg.headless !== false, executablePath: cfg.chrome || undefined, channel: cfg.chrome ? undefined : cfg.channel,
    viewport: { width: W, height: H }, deviceScaleFactor: 1, bypassCSP: true, locale: 'en-GB', colorScheme: 'dark',
    args: ['--no-sandbox', '--force-color-profile=srgb', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required', '--mute-audio', ...(cfg.chromeArgs || [])],
  });
  const kit = fs.readFileSync(path.join(KIT, 'stagekit.js'), 'utf8');
  await ctx.addInitScript({ content: kit });
  const page = ctx.pages()[0] || (await ctx.newPage());
  page.on('dialog', (d) => d.dismiss().catch(() => {}));
  return { ctx, page };
}
async function record(ids) {
  fs.mkdirSync(TAKES, { recursive: true });
  const list = ids[0] === 'all' ? direction.takes : ids.map((id) => { const t = direction.takes.find((x) => x.id === id); if (!t) throw new Error('unknown take ' + id); return t; });
  let failed = 0;
  for (const take of list) {
    const tries = take.retries ?? 3; let ok = false;
    for (let attempt = 1; attempt <= tries && !ok; attempt++) {
      log(`=== take ${take.id} (attempt ${attempt}/${tries}) — ${take.title || ''}`);
      if (take.before && !flag('--no-setup')) for (const c of take.before) { log('  setup:', c); const r = spawnSync(c, { cwd: REPO, shell: true, stdio: 'inherit' }); if (r.status !== 0) log('  setup command failed (continuing):', c); }
      const { ctx, page } = await launch();
      const mp4 = path.join(TAKES, take.id + '.mp4'), rec = new Recorder(page, mp4), dir = new Director({ page, cfg, timings, direction, rec, dry: flag('--dry') });
      const errs = []; page.on('pageerror', (e) => errs.push(String(e).slice(0, 300)));
      try {
        await page.goto('about:blank'); await dir.inject();
        for (const s of take.setup || []) await dir.run(s);          // not recorded
        await rec.start();
        if (take.chip) await dir.zk('chip', take.chip).catch(() => {});
        const res = await dir.take(take);
        await sleep(400);
        const info = await rec.stop();
        fs.writeFileSync(path.join(TAKES, take.id + '.json'), JSON.stringify({ id: take.id, ...info, ...res, pageErrors: errs, recordedAt: new Date().toISOString(), sha }, null, 1));
        log(`=== take ${take.id} OK: ${info.seconds.toFixed(1)} s, ${info.distinct} distinct frames, ${res.warnings.length} warnings`);
        ok = true;
      } catch (e) {
        log(`=== take ${take.id} FAILED at beat ${dir.beatId}: ${e.message}`);
        try { await page.screenshot({ path: path.join(TAKES, `${take.id}_FAILED_${attempt}.png`) }); } catch { /* page gone */ }
        try { await rec.stop(); } catch { /* recorder never started */ }
        fs.rmSync(mp4, { force: true });
      }
      await ctx.close();
    }
    if (!ok) failed++;
  }
  log(failed ? `${failed} take(s) failed` : 'all requested takes recorded');
  return failed === 0;
}

// ------------------------------------------------------------------------------------------------ assemble
const srtTime = (s) => { const ms = Math.round(s * 1000); const p = (n, l = 2) => String(n).padStart(l, '0'); return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`; };
async function assemble() {
  const built = path.join(OUT, 'built'); fs.mkdirSync(built, { recursive: true });
  const { chromium } = require('playwright');
  const br = await chromium.launch({ headless: true, executablePath: cfg.chrome || undefined, args: ['--no-sandbox'] });
  const pg = await br.newPage({ viewport: { width: W, height: 88 } });
  const strip = async (url) => { const f = path.join(built, 'strip_' + Buffer.from(url).toString('base64url').slice(0, 60) + '.png'); if (!fs.existsSync(f)) { await pg.goto(pathToFileURL(path.join(KIT, 'chrome.html')).href + '?u=' + encodeURIComponent(url)); await pg.screenshot({ path: f }); } return f; };
  const parts = [], cues = []; let offset = 0, lastUrl = cfg.repoUrl;
  for (const take of direction.takes) {
    const meta = path.join(TAKES, take.id + '.json'), mp4 = path.join(TAKES, take.id + '.mp4');
    if (!fs.existsSync(meta) || !fs.existsSync(mp4)) throw new Error('take not recorded: ' + take.id);
    const m = JSON.parse(fs.readFileSync(meta, 'utf8')), dur = probe(mp4);
    // browser bar: one strip per address shown during the take
    const navs = [{ t: 0, url: (m.nav[0] && m.nav[0].t < 0.5 ? m.nav[0].url : lastUrl) }, ...m.nav.filter((n) => n.t >= 0.5)];
    const inputs = ['-i', mp4]; let chain = `[0:v]pad=${W}:1080:0:88:color=0x202124[v0]`;
    for (let i = 0; i < navs.length; i++) { const end = i + 1 < navs.length ? navs[i + 1].t : dur + 1; inputs.push('-i', await strip(navs[i].url)); chain += `;[v${i}][${i + 1}:v]overlay=0:0:enable='between(t,${navs[i].t},${end})'[v${i + 1}]`; }
    lastUrl = navs.at(-1).url;
    // narration: every beat's wav placed at the moment its beat started in the recording
    const voiced = m.marks.filter((k) => !k.silent && timings[k.beat] && fs.existsSync(path.join(REPO, timings[k.beat].file)));
    let amap;
    if (voiced.length) {
      voiced.forEach((k) => inputs.push('-i', path.join(REPO, timings[k.beat].file)));
      const base = navs.length + 1;
      chain += ';' + voiced.map((k, i) => `[${base + i}:a]aresample=48000,adelay=${Math.round(k.t * 1000)}:all=1[a${i}]`).join(';') + ';' + voiced.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${voiced.length}:normalize=0:dropout_transition=0,apad=whole_dur=${dur.toFixed(3)}[a]`;
      amap = '[a]';
    } else { inputs.push('-f', 'lavfi', '-t', dur.toFixed(3), '-i', 'anullsrc=r=48000:cl=stereo'); amap = `${navs.length + 1}:a`; }
    const out = path.join(built, take.id + '.mp4');
    ff([...inputs, '-filter_complex', chain, '-map', `[v${navs.length}]`, '-map', amap, '-t', dur.toFixed(3), '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-c:a', 'aac', '-b:a', '192k', '-ac', '2', '-ar', '48000', out]);
    parts.push(out);
    for (const k of m.marks) if (!k.silent && timings[k.beat]) cues.push({ start: offset + k.t, end: offset + k.t + k.d, text: (timings[k.beat].subtitles || timings[k.beat].say || '').replace(/\[[^\]]*\]\s*/g, '').trim(), beat: k.beat });
    offset += probe(out); log(`built ${take.id}: ${dur.toFixed(1)} s, ${voiced.length} voiced beats`);
  }
  await br.close();
  const list = path.join(built, 'concat.txt'); fs.writeFileSync(list, parts.map((p) => `file '${p.replace(/\\/g, '/')}'`).join('\n'));
  const joined = path.join(built, 'joined.mp4'); ff(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', joined]);
  const bed = path.join(REPO, cfg.musicBed || 'video/06_music_sfx/ambient_bed.wav'), final = path.join(OUT, 'final_video.mp4');
  const total = probe(joined);
  if (fs.existsSync(bed)) ff(['-i', joined, '-stream_loop', '-1', '-i', bed, '-filter_complex', `[1:a]volume=0.07,atrim=0:${total.toFixed(3)}[bed];[0:a][bed]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-16:TP=-1.5:LRA=11[a]`, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', final]);
  else ff(['-i', joined, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', final]);
  const wrap = (t) => { if (t.length <= 46) return t; const mid = t.lastIndexOf(' ', Math.ceil(t.length / 2) + 6); return t.slice(0, mid) + '\n' + t.slice(mid + 1); };
  fs.writeFileSync(path.join(OUT, 'subtitles.srt'), cues.map((c, i) => `${i + 1}\n${srtTime(c.start)} --> ${srtTime(Math.min(c.end, i + 1 < cues.length ? cues[i + 1].start : c.end))}\n${wrap(c.text)}\n`).join('\n'));
  fs.writeFileSync(path.join(OUT, 'cues.json'), JSON.stringify(cues, null, 1));
  log(`final_video.mp4: ${(total / 60).toFixed(2)} min, ${cues.length} subtitle cues`);
}

// ------------------------------------------------------------------------------------------------ gates
function gates() {
  const rows = []; const add = (name, ok, detail) => rows.push({ name, ok, detail });
  const final = path.join(OUT, 'final_video.mp4');
  const metas = direction.takes.map((t) => { const f = path.join(TAKES, t.id + '.json'); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null; });
  add('every take recorded', metas.every(Boolean), `${metas.filter(Boolean).length}/${direction.takes.length}`);
  const marked = new Set(metas.filter(Boolean).flatMap((m) => m.marks.map((k) => k.beat)));
  const need = allBeats().filter((b) => !b.optional).map((b) => b.id);
  add('every beat performed', need.every((b) => marked.has(b)), `${need.filter((b) => marked.has(b)).length}/${need.length}`);
  const asserts = metas.filter(Boolean).flatMap((m) => m.asserts);
  add('on-screen facts seen while recording', asserts.length > 0 && asserts.every((a) => a.ok), `${asserts.filter((a) => a.ok).length}/${asserts.length}`);
  const warns = metas.filter(Boolean).flatMap((m) => m.warnings.map((w) => ({ ...w, take: m.id })));
  add('no highlight, cue or GitHub warnings', warns.length === 0, warns.length ? warns.slice(0, 6).map((w) => `${w.take}/${w.beat}: ${w.msg}`).join(' ; ') : '0');
  const pageErrs = metas.filter(Boolean).flatMap((m) => m.pageErrors || []);
  const late = metas.filter(Boolean).flatMap((m) => (m.late || []).filter((l) => l.by > 4).map((l) => `${l.beat} ${l.cue} +${l.by}s`));
  add('no highlight more than 4 s behind the voice', late.length === 0, late.slice(0, 8).join(', ') || '0');
  add('no page errors during recording', pageErrs.length === 0, pageErrs.slice(0, 3).join(' ; ') || '0');
  if (fs.existsSync(final)) {
    const dur = probe(final); add('length between 15:30 and 19:30', dur >= 930 && dur <= 1170, `${Math.floor(dur / 60)}:${String(Math.round(dur % 60)).padStart(2, '0')}`);
    const v = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate', '-of', 'csv=p=0', final], { encoding: 'utf8' }).trim();
    add('1920x1080 at 30 fps', v === '1920,1080,30/1', v);
    // a slideshow has long frozen stretches; a screen recording does not
    const fz = spawnSync('ffmpeg', ['-hide_banner', '-i', final, '-vf', 'freezedetect=n=0.0008:d=8', '-map', '0:v', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
    const freezes = [...fz.matchAll(/freeze_start: ([\d.]+)[\s\S]*?freeze_duration: ([\d.]+)/g)].map((m) => ({ at: +m[1], len: +m[2] }));
    add('no frozen picture longer than 8 s', freezes.length === 0, freezes.length ? freezes.slice(0, 8).map((f) => `${f.len.toFixed(1)} s at ${Math.floor(f.at / 60)}:${String(Math.floor(f.at % 60)).padStart(2, '0')}`).join(', ') : 'none');
    const still = freezes.reduce((s, f) => s + f.len, 0);
    add('picture moves for at least 85% of the video', still / dur <= 0.15, `${(100 - (still / dur) * 100).toFixed(0)}% moving`);
    const ln = spawnSync('ffmpeg', ['-hide_banner', '-i', final, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
    const I = /I:\s+(-?[\d.]+) LUFS/g, all = [...ln.matchAll(I)], lufs = all.length ? +all.at(-1)[1] : NaN;
    add('loudness -16 LUFS ±1', Math.abs(lufs + 16) <= 1, isNaN(lufs) ? 'no audio' : lufs + ' LUFS');
    const srt = path.join(OUT, 'subtitles.srt'), n = fs.existsSync(srt) ? (fs.readFileSync(srt, 'utf8').match(/-->/g) || []).length : 0;
    const spoken = metas.filter(Boolean).flatMap((m) => m.marks).filter((k) => !k.silent).length;
    add('one subtitle cue per spoken beat', n === spoken && n > 0, `${n} cues / ${spoken} spoken beats`);
  } else add('final_video.mp4 exists', false, 'run: node video_v4/kit/cli.mjs assemble');
  const wdt = Math.max(...rows.map((r) => r.name.length));
  console.log('\nGATE V'); rows.forEach((r) => console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name.padEnd(wdt)}  ${r.detail}`));
  fs.writeFileSync(path.join(OUT, 'GATE_V.json'), JSON.stringify(rows, null, 1));
  return rows.every((r) => r.ok);
}

// ------------------------------------------------------------------------------------------------ GitHub self-test
async function selftestGithub() {
  fs.mkdirSync(OUT, { recursive: true });
  const { ctx, page } = await launch(); const dir = new Director({ page, cfg, timings, direction, rec: null });
  const res = {}; const shot = (n) => page.screenshot({ path: path.join(OUT, `selftest_${n}.png`) });
  try {
    await dir.verbs.ghGoto('tree/<SHA>'); res.repoHome = (await page.title()).includes('IncidentZero');
    res.rowBackend = !!(await dir.verbs.ghRow('backend')); await dir.verbs.ghHover('backend'); await shot('1_hover');
    await dir.verbs.ghClick('backend'); res.clickNavigated = /\/backend$/.test(page.url()); await shot('2_backend');
    const file = '{J}/incident/domain/AssignedState.java';
    await dir.verbs.ghGoto(`blob/<SHA>/${file}`);
    res.lineElements = await page.evaluate(() => ({ LC: document.querySelectorAll('[id^="LC"]').length, dataLine: document.querySelectorAll('[data-line-number]').length }));
    const before = dir.warnings.length;
    await dir.verbs.ghSelect(file, '@Override public TransitionResult acknowledge(', 'return new TransitionResult(AcknowledgedState.INSTANCE', { plus: 1 }); await sleep(400); await shot('3_selected');
    res.selectionWorked = dir.warnings.length === before;
    await dir.verbs.card('C03-F'); await dir.verbs.hl('inc.stopResponse(now, cal, true);'); await dir.verbs.tok('stopResponse'); await sleep(900); await shot('4_card');
    res.cardOpened = await dir.zk('card.isOpen');
  } catch (e) { res.error = e.message; await shot('error').catch(() => {}); }
  res.warnings = dir.warnings; await ctx.close();
  console.log(JSON.stringify(res, null, 1));
  const ok = res.repoHome && res.rowBackend && res.clickNavigated && res.selectionWorked && res.cardOpened && !res.error;
  console.log(ok ? '\nGitHub self-test PASS — now LOOK at video_v4/out/selftest_*.png' : '\nGitHub self-test FAIL — see the fix table in ROUND2_FIX.md section V3');
  return ok;
}

// ------------------------------------------------------------------------------------------------ storyboard (for people)
function storyboard() {
  const show = (a) => a.map((x) => (typeof x === 'string' ? x : Array.isArray(x) ? '[' + x.join(', ') + ']' : x && typeof x === 'object' ? (x.text || x.name || x.testid || x.placeholder || JSON.stringify(x)) : String(x))).filter((x) => x !== '{}').join(' · ');
  const when = (c) => (typeof c === 'number' ? (c === 0 ? 'as the voice starts' : `${c} s in`) : c === '@end' ? 'when the voice ends' : c.startsWith('+') ? (c === '+0' ? 'then' : `then, ${c.slice(1)} s later`) : `on the word “${c.slice(1)}”`);
  let md = '# Storyboard (generated from video_v4/direction — do not edit by hand)\n\nRegenerate with `node video_v4/kit/cli.mjs storyboard`.\n';
  for (const t of direction.takes) {
    md += `\n## ${t.id} — ${t.title}\n`;
    if (t.setup) md += `\nBefore recording starts: ${t.setup.map((s) => '`' + s[0] + '` ' + show(s.slice(1))).join('; ')}\n`;
    for (const b of t.beats) {
      const tm = timings[b.id];
      md += `\n**${b.id}** (${tm ? (tm.duration_seconds ?? 0).toFixed(1) + ' s' : 'silent'}) — “${tm ? tm.say.replace(/\[[^\]]*\]\s*/g, '') : ''}”\n`;
      for (const s of b.pre || []) md += `- before the voice: \`${s[0]}\` ${show(s.slice(1))}\n`;
      for (const [c, v, ...a] of b.cues || []) md += `- ${when(c)}: \`${v}\` ${show(a)}\n`;
      for (const s of b.post || []) md += `- after the voice: \`${s[0]}\` ${show(s.slice(1))}\n`;
    }
  }
  fs.writeFileSync(path.join(V4, 'STORYBOARD.md'), md); console.log('wrote video_v4/STORYBOARD.md'); return true;
}

// ------------------------------------------------------------------------------------------------ gallery (every card and diagram as a still, no recording)
async function gallery() {
  const dir = path.join(OUT, 'gallery'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const { chromium } = require('playwright');
  const br = await chromium.launch({ headless: true, executablePath: cfg.chrome || undefined, channel: cfg.chrome ? undefined : cfg.channel, args: ['--no-sandbox'] });
  const page = await br.newPage({ viewport: { width: W, height: H } });
  await page.setContent('<body style="margin:0;height:100vh;background:#FFE680"><h1 style="font:800 80px sans-serif;padding:80px;color:#1B1530">page behind the overlay</h1></body>');
  await page.evaluate(fs.readFileSync(path.join(KIT, 'stagekit.js'), 'utf8'));
  const zk = (fn, ...a) => page.evaluate(([f, a]) => { const p = f.split('.'); let o = window.__zk; for (const k of p.slice(0, -1)) o = o[k]; return o[p.at(-1)](...a); }, [fn, a]);
  const problems = []; let n = 0;
  // the first highlight the direction uses on each card, so the still shows the focus state too
  const firstHl = {}; for (const t of direction.takes) { let card = null; for (const b of t.beats) for (const st of [...(b.pre || []), ...(b.cues || []).map((c) => c.slice(1)), ...(b.post || [])]) { if (st[0] === 'card') card = st[1]; if (st[0] === 'hl' && card && !firstHl[card]) firstHl[card] = st.slice(1); } }
  for (const [id, def] of Object.entries(direction.cards)) {
    const c = resolveCard(id, def, sha); await zk('card.open', c);
    const fit = await page.evaluate(() => { const v = document.querySelector('.zk-card .view'), k = document.querySelector('.zk-card .code'); return { over: k.scrollHeight - v.clientHeight, wide: k.scrollWidth - v.clientWidth }; });
    if (fit.over > 4) problems.push(`card ${id}: ${c.lines.length} lines do not fit the card (${fit.over}px too tall) — shorten the card by moving its "to" anchor up`);
    if (fit.wide > 4) problems.push(`card ${id}: longest line is ${fit.wide}px wider than the card (it is cut off on the right unless highlighted)`);
    await page.screenshot({ path: path.join(dir, `card_${id}_1_plain.png`) }); n++;
    if (firstHl[id]) { await zk('card.hl', firstHl[id]); await sleep(800); await page.screenshot({ path: path.join(dir, `card_${id}_2_focus.png`) }); n++; }
  }
  await zk('card.close');
  for (const [id, d] of Object.entries(direction.diagrams)) {
    await zk('diagram.open', d);
    if (d.kind === 'matrix') { await zk('diagram.cell', 1, 1); await zk('diagram.bump', 'P3', 'the text says "quiz" → exam window, one level up', 'P2'); }
    else { const ids = d.nodes.map((x) => x.id); await zk('diagram.step', ids[0]); if (ids[1]) await zk('diagram.step', ids[1]); }
    await sleep(500);
    const fit = await page.evaluate(() => { const b = document.querySelector('.zk-dia').getBoundingClientRect(); return { w: b.width, h: b.height }; });
    if (fit.w > W - 20 || fit.h > H - 20) problems.push(`diagram ${id}: ${Math.round(fit.w)}x${Math.round(fit.h)} does not fit the 1920x992 page`);
    await page.screenshot({ path: path.join(dir, `diagram_${id}.png`) }); n++;
  }
  await zk('diagram.close');
  for (const [id, t] of Object.entries(direction.titles)) { await zk('title.open', t); for (const r of t.rows) await zk('title.reveal', r.key); await sleep(500); await page.screenshot({ path: path.join(dir, `title_${id}.png`) }); n++; }
  await zk('title.close'); await zk('term.open', 'Terminal — IncidentZero'); await zk('term.type', direction.terminal.m1.shown, 200); await zk('term.print', 'ok   transition table (11 states)\nok   illegal moves rejected\nSUMMARY: 24 passed, 0 failed (554590 transitions verified)', 200); await zk('term.point', 'SUMMARY'); await sleep(300);
  await page.screenshot({ path: path.join(dir, 'terminal.png') }); n++;
  await br.close();
  problems.forEach((p) => console.log('PROBLEM ' + p));
  console.log(`gallery: ${n} pictures in video_v4/out/gallery — ${problems.length} problems`);
  return problems.length === 0;
}

const run = { gallery, storyboard: async () => storyboard(), validate: async () => validate(), record: async () => (validate() || flag('--force')) && record(args.slice(1).filter((a, i, all) => !a.startsWith('--') && !['--app', '--landing'].includes(all[i - 1]))), assemble: async () => { await assemble(); return true; }, gates: async () => gates(), 'selftest-github': selftestGithub };
if (!run[cmd]) { console.log('usage: node video_v4/kit/cli.mjs validate | gallery | storyboard | record <takeId…|all> [--fresh] [--no-setup] [--app <url>] [--landing <url>] | assemble | gates | selftest-github'); process.exit(2); }
process.exit((await run[cmd]()) ? 0 : 1);
