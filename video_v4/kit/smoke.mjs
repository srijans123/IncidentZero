#!/usr/bin/env node
// kit/smoke.mjs — a 20-second check that the kit works on THIS machine before any real take.
// It opens the app, zooms on a field while typing, opens a code card with a highlight, a flow chart and the matrix,
// records all of it, and saves four stills. Nothing is submitted to the app.
//   node video_v4/kit/smoke.mjs [--app http://localhost:3000]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { REPO, V4, KIT, W, H, loadConfig, loadTimings, Recorder, Director } from './lib.mjs';

const require = createRequire(path.join(REPO, 'frontend', 'package.json'));
const { chromium } = require('playwright');
const cfg = loadConfig(); { const i = process.argv.indexOf('--app'); if (i > 0) cfg.appUrl = process.argv[i + 1].replace(/\/$/, ''); }
const direction = await import(pathToFileURL(path.join(V4, 'direction', 'index.mjs')).href);
const out = path.join(V4, 'out', 'smoke'); fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: cfg.headless !== false, executablePath: cfg.chrome || undefined, channel: cfg.chrome ? undefined : cfg.channel, args: ['--no-sandbox', ...(cfg.chromeArgs || [])] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, bypassCSP: true });
await ctx.addInitScript({ content: fs.readFileSync(path.join(KIT, 'stagekit.js'), 'utf8') });
const page = await ctx.newPage(); const errs = []; page.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
const rec = new Recorder(page, path.join(out, 'smoke.mp4')); const d = new Director({ page, cfg, timings: loadTimings(cfg), direction, rec });
const TITLE = { placeholder: 'e.g. Cannot open Moodle quiz' };
let ok = false, info = {};
try {
  await d.verbs.goto('APP/app.html?tab=portal'); await d.verbs.ready(); await rec.start();
  await d.verbs.click({ text: 'Report New Incident' });
  await d.verbs.zoom(TITLE, 2); await d.verbs.type(TITLE, 'Cannot open Moodle quiz', { ms: 600 });
  await page.screenshot({ path: path.join(out, '1_zoom.png') }); await d.verbs.zoomOut();
  await d.verbs.card('C03-A');
  await d.verbs.hl('if (cleanTitle.length() < 5 || cleanTitle.length() > 200) {', 'throw new InvalidIncidentPayloadException("title", "must be between 5 and 200 characters");');
  await d.verbs.tok('cleanTitle.length() < 5 || cleanTitle.length() > 200'); await d.verbs.note('Encapsulation'); await d.verbs.wait(900);
  await page.screenshot({ path: path.join(out, '2_card.png') });
  await d.verbs.diagram('pipeline'); await d.verbs.sweep(['s1', 's2', 's3'], 600); await d.verbs.wait(300);
  await page.screenshot({ path: path.join(out, '3_diagram.png') });
  await d.verbs.diagram('matrix'); await d.verbs.cell(1, 1); await d.verbs.bump('P3', 'the text says "quiz" → exam window, one level up', 'P2'); await d.verbs.wait(600);
  await page.screenshot({ path: path.join(out, '4_matrix.png') });
  await d.verbs.diagramClose(); info = await rec.stop(); ok = true;
} catch (e) { console.log('SMOKE ERROR:', e.message.split('\n')[0]); try { await page.screenshot({ path: path.join(out, 'FAILED.png') }); await rec.stop(); } catch { /* nothing to stop */ } }
await browser.close();
console.log(JSON.stringify({ seconds: info.seconds, frames: info.frames, distinctFrames: info.distinct, warnings: d.warnings, pageErrors: errs }));
const pass = ok && info.seconds > 8 && info.distinct > 60 && d.warnings.length === 0 && errs.length === 0;
console.log(pass ? 'SMOKE PASS — now compare video_v4/out/smoke/*.png with video_v4/samples/*.png' : 'SMOKE FAIL — see ROUND2_FIX.md section 5 and video_v4/reference/KIT_GUIDE.md section 7');
process.exit(pass ? 0 : 1);
