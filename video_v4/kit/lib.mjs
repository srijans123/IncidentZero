// kit/lib.mjs — recorder, cue resolver, card resolver and the director (the thing that performs a take).
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const KIT = path.dirname(fileURLToPath(import.meta.url));
export const V4 = path.resolve(KIT, '..');
export const REPO = path.resolve(V4, '..');
export const W = 1920, H = 992, FPS = 30;
export const sleep = (ms) => new Promise((r) => setTimeout(r, Math.max(0, ms)));
const now = () => Date.now() / 1000;
export const log = (...a) => console.log(new Date().toISOString().slice(11, 23), ...a);

export function loadConfig() {
  const file = path.join(V4, 'config.json');
  const cfg = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  return {
    appUrl: 'http://localhost:3000',
    landingUrl: 'https://srijans123.github.io/IncidentZero/',
    repoUrl: 'https://github.com/srijans123/IncidentZero',
    pinnedSha: '',
    timings: 'video_v3/03_audio/timings.json',
    chrome: process.env.CHROME_PATH || '',
    headless: true,
    ...cfg,
  };
}

// ---------------------------------------------------------------------------------------------- timings and cues
export function loadTimings(cfg) {
  const files = [cfg.timings, 'video_v4/audio/timings_extra.json'].map((f) => path.join(REPO, f)).filter((f) => fs.existsSync(f));
  const beats = {};
  for (const f of files) { const j = JSON.parse(fs.readFileSync(f, 'utf8')); Object.assign(beats, j.beats || j); }
  return beats;
}
const norm = (w) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
const lev1 = (a, b) => { // true when edit distance <= 1
  if (a === b) return true; if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) { if (a[i] === b[j]) { i++; j++; continue; } if (++edits > 1) return false; if (a.length > b.length) i++; else if (a.length < b.length) j++; else { i++; j++; } }
  return edits + (a.length - i) + (b.length - j) <= 1;
};
/** Seconds from the start of the beat at which `phrase` is spoken. Never throws: falls back to text position. */
export function cueTime(beat, phrase, { lead = 0.12, after = 0 } = {}) {
  const dur = beat.duration_seconds ?? beat.duration ?? 3;
  const say = (beat.say || '').replace(/\[[^\]]*\]/g, ' ');
  const want = phrase.split(/\s+/).map(norm).filter(Boolean);
  const words = (beat.words || []).map((w) => ({ t: w.start, n: norm(w.word) })).filter((w) => w.n);
  const eq = (a, b) => a === b || (a.length > 3 && (b.startsWith(a) || a.startsWith(b) || lev1(a, b)));
  for (let i = 0; i < words.length; i++) {
    if (words[i].t < after) continue;
    if (!eq(want[0], words[i].n)) continue;
    let ok = 1; for (let k = 1; k < want.length && i + k < words.length; k++) if (eq(want[k], words[i + k].n)) ok++;
    if (ok >= Math.ceil(want.length * 0.6)) return { t: Math.max(0, words[i].t - lead), how: 'word' };
  }
  const at = say.toLowerCase().indexOf(phrase.toLowerCase());
  if (at >= 0) return { t: Math.max(0, (at / Math.max(1, say.length)) * dur - lead), how: 'text' };
  return { t: 0, how: 'missing' };
}

// ---------------------------------------------------------------------------------------------- git and cards
export function gitShow(sha, file) { return execFileSync('git', ['show', `${sha || 'HEAD'}:${file}`], { cwd: REPO, encoding: 'utf8', maxBuffer: 64e6 }).replace(/\r/g, ''); }
export const expand = (p) => p.replace('{J}', 'backend/src/main/java/edu/campus/iitsm').replace('{F}', 'frontend/src');
/** card def: {path, from, to, plus?, before?}  ->  {id, path, first, lines} */
export function resolveCard(id, def, sha) {
  const file = expand(def.path), lines = gitShow(sha, file).split('\n');
  const a = lines.findIndex((l) => l.includes(def.from));
  if (a < 0) throw new Error(`card ${id}: FROM not found in ${file}: ${def.from}`);
  let b = lines.findIndex((l, i) => i >= a && l.includes(def.to));
  if (b < 0) throw new Error(`card ${id}: TO not found in ${file}: ${def.to}`);
  b = Math.min(lines.length - 1, b + (def.plus || 0));
  const start = Math.max(0, a - (def.before || 0));
  const slice = lines.slice(start, b + 1);
  const indent = Math.min(...slice.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return { id, path: file, first: start + 1, lines: slice.map((l) => l.slice(indent)) };
}
export function lineOf(sha, file, needle) { const i = gitShow(sha, expand(file)).split('\n').findIndex((l) => l.includes(needle)); return i < 0 ? -1 : i + 1; }

// ---------------------------------------------------------------------------------------------- recorder
/** Records the page through the DevTools screencast into a constant-frame-rate mp4 whose clock is wall time. */
export class Recorder {
  constructor(page, outFile) { this.page = page; this.out = outFile; this.frames = 0; this.t0 = 0; this.last = null; this.got = 0; }
  async start() {
    fs.mkdirSync(path.dirname(this.out), { recursive: true });
    this.ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-vf', `scale=${W}:${H}:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14', '-r', String(FPS), this.out], { stdio: ['pipe', 'inherit', 'inherit'] });
    this.ff.stdin.on('error', () => {});
    this.done = new Promise((res) => this.ff.on('close', res));
    this.cdp = await this.page.context().newCDPSession(this.page);
    this.cdp.on('Page.screencastFrame', (f) => {
      this.cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
      this.pump(); this.last = Buffer.from(f.data, 'base64'); this.got++;
      if (!this.t0) { this.t0 = now(); this.pump(); }
    });
    await this.cdp.send('Page.startScreencast', { format: 'jpeg', quality: 95, maxWidth: W, maxHeight: H, everyNthFrame: 1 });
    for (let i = 0; i < 100 && !this.t0; i++) await sleep(50);
    if (!this.t0) throw new Error('screencast produced no frame');
    this.timer = setInterval(() => this.pump(), 10);
  }
  /** write the newest frame as many times as wall time requires, so video time == wall time */
  pump(until = now()) {
    if (!this.t0 || !this.last) return;
    const need = Math.floor((until - this.t0) * FPS) + 1 - this.frames;
    for (let i = 0; i < need; i++) { this.ff.stdin.write(this.last); this.frames++; }
  }
  time() { return this.t0 ? now() - this.t0 : 0; }
  async stop() {
    clearInterval(this.timer); this.pump();
    await this.cdp.send('Page.stopScreencast').catch(() => {});
    this.ff.stdin.end(); await this.done;
    return { seconds: this.frames / FPS, frames: this.frames, distinct: this.got };
  }
}

// ---------------------------------------------------------------------------------------------- director
export class Director {
  constructor({ page, cfg, timings, direction, rec, dry }) {
    Object.assign(this, { page, cfg, timings, direction, rec, dry });
    this.vars = {}; this.marks = []; this.asserts = []; this.warnings = []; this.late = []; this.nav = [];
    this.sha = cfg.pinnedSha || 'HEAD';          // what `git show` reads
    this.ref = cfg.pinnedSha || 'main';          // what GitHub URLs use
    this.pace = cfg.pace ?? 1;                    // 1 = normal; 0.6 = shorter pauses after each navigation
    this.kit = fs.readFileSync(path.join(KIT, 'stagekit.js'), 'utf8');
  }
  t() { return this.rec ? this.rec.time() : now(); }
  warn(msg) { this.warnings.push({ t: +this.t().toFixed(2), beat: this.beatId, msg }); log('  WARN', this.beatId || '', msg); }
  zk(fn, ...args) { return this.page.evaluate(([f, a]) => { const parts = f.split('.'); let o = window.__zk; for (const p of parts.slice(0, -1)) o = o[p]; return o[parts.at(-1)](...a); }, [fn, args]); }
  async inject() { await this.page.evaluate(this.kit).catch(() => {}); }
  sub(s) { return typeof s === 'string' ? s.replace(/\$(\w+)/g, (m, k) => (k in this.vars ? this.vars[k] : m)) : s; }

  // ---- locating things. A target is: a CSS/Playwright selector string, {text:'..'}, {role:'button',name:'..'}, {testid:'..'}, {label:'..'}, {placeholder:'..'}
  loc(target) {
    const p = this.page; let t = target;
    if (typeof t === 'string') return p.locator(this.sub(t)).first();
    if (t.testid) return p.getByTestId(t.testid).first();
    if (t.role) return p.getByRole(t.role, { name: this.sub(t.name), exact: !!t.exact }).first();
    if (t.placeholder) return p.getByPlaceholder(this.sub(t.placeholder)).first();
    if (t.label) return p.getByLabel(this.sub(t.label)).first();
    if (t.text) return (t.within ? p.locator(t.within) : p).getByText(this.sub(t.text), { exact: !!t.exact }).first();
    throw new Error('bad target ' + JSON.stringify(target));
  }
  async box(target, timeout = 8000) {
    const l = this.loc(target);
    await l.waitFor({ state: 'visible', timeout });
    const b = await l.boundingBox(); if (!b) throw new Error('no box for ' + JSON.stringify(target));
    return { x: b.x, y: b.y, w: b.width, h: b.height, cx: b.x + b.width / 2, cy: b.y + b.height / 2 };
  }
  async reveal(target) { // smooth-scroll the element into the middle band if it is outside it (never while zoomed)
    const st = await this.zk('zoom.state'); if (st.p > 0.01) return;
    const l = this.loc(target); await l.waitFor({ state: 'attached', timeout: 8000 });
    const moved = await l.evaluate((e, h) => { const b = e.getBoundingClientRect(); if (b.top >= 110 && b.bottom <= h - 70) return false; e.scrollIntoView({ behavior: 'smooth', block: 'center' }); return true; }, H);
    if (moved) await sleep(650);
  }

  // ---- mouse
  async glide(getPoint, ms) {
    const start = await this.zk('cursor.screen');
    await this.page.mouse.move(start.x, start.y);
    let target = await getPoint();
    const dist = Math.hypot(target.x - start.x, target.y - start.y);
    const dur = ms ?? Math.min(950, Math.max(260, 180 + dist * 0.55));
    const steps = Math.max(8, Math.round(dur / 16)), t0 = Date.now();
    const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
    const bow = Math.min(40, dist * 0.08) * (target.x > start.x ? -1 : 1);
    for (let i = 1; i <= steps; i++) {
      if (i % 5 === 0) target = await getPoint().catch(() => target);
      const u = ease(i / steps), arc = Math.sin(Math.PI * (i / steps)) * bow;
      await this.page.mouse.move(start.x + (target.x - start.x) * u, start.y + (target.y - start.y) * u + arc);
      await sleep(t0 + (i * dur) / steps - Date.now());
    }
    target = await getPoint().catch(() => target);
    await this.page.mouse.move(target.x, target.y);
  }
  async moveTo(target, { at = [0.5, 0.5], ms } = {}) {
    await this.reveal(target);
    await this.glide(async () => { const b = await this.box(target); return { x: b.x + b.w * at[0], y: b.y + b.h * at[1] }; }, ms);
  }
  async settle() { for (let i = 0; i < 40; i++) { const s = await this.zk('zoom.state'); if (!s.busy) return; await sleep(50); } }

  // ---- verbs (every verb is async and finishes when its on-screen effect has finished)
  verbs = {
    wait: async (ms) => sleep(ms),
    goto: async (url, opts = {}) => {
      url = this.sub(url);
      if (url === 'LANDING') url = this.cfg.landingUrl; else if (url.startsWith('APP')) url = this.cfg.appUrl + url.slice(3); else if (url.startsWith('GH')) url = this.cfg.repoUrl + expand(url.slice(2)).replace('<SHA>', this.ref);
      await this.zk('overlay.hide').catch(() => {});
      await this.page.goto(url, { waitUntil: opts.waitUntil || 'load', timeout: 45000 });
      await this.inject(); this.nav.push({ t: +this.t().toFixed(2), url }); await sleep((opts.settle ?? 500) * this.pace);
    },
    nav: async (url) => { await this.inject(); this.nav.push({ t: +this.t().toFixed(2), url: url === 'CURRENT' ? this.page.url() : this.sub(url) }); },
    chip: async (text) => this.zk('chip', text),
    move: async (target, o) => this.moveTo(target, o),
    point: async (target, o = {}) => { await this.moveTo(target, o); const b = await this.box(target); await this.zk('ring.show', { x: b.x, y: b.y, w: b.w, h: b.h }, o.pad ?? 8); if (o.hold !== 0) { await sleep(o.hold ?? 1100); await this.zk('ring.hide'); } },
    unring: async () => this.zk('ring.hide'),
    click: async (target, o = {}) => {
      await this.verbs.ready(); await this.moveTo(target, o); await this.settle();
      const b = await this.box(target); await this.page.mouse.move(b.cx, b.cy); await sleep(140);
      await this.page.mouse.down(); await sleep(70); await this.page.mouse.up(); await sleep(o.after ?? 350);
    },
    press: async (key) => this.page.keyboard.press(key),
    type: async (target, text, o = {}) => {
      await this.verbs.click(target, { after: 150 });
      if (o.clear) { await this.page.keyboard.press('Control+A'); await this.page.keyboard.press('Delete'); await sleep(120); }
      text = this.sub(text);
      const delay = o.ms ? o.ms / text.length : 30;
      await this.page.keyboard.type(text, { delay });
    },
    select: async (target, value) => { await this.moveTo(target); await this.zk('cursor.ripple'); await this.loc(target).selectOption(this.sub(value)); await sleep(250); },
    scrollTo: async (target, o = {}) => { const l = this.loc(target); await l.waitFor({ state: 'attached', timeout: 8000 }); await l.evaluate((e, block) => e.scrollIntoView({ behavior: 'smooth', block }), o.block || 'center'); await sleep(o.ms ?? 900); },
    scrollBy: async (dy, ms = 900) => { await this.page.evaluate((d) => window.scrollBy({ top: d, behavior: 'smooth' }), dy); await sleep(ms); },
    scrollTop: async () => { await this.page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' })); await sleep(700); },
    zoom: async (target, depth = 3, o = {}) => { await this.reveal(target); const l = this.loc(target); await l.waitFor({ state: 'visible', timeout: 8000 }); const h = await l.elementHandle(); const r = await this.page.evaluate((e) => window.__zk.zoom.rectOf(e), h); const ms = await this.zk('zoom.to', r, depth); if (!o.nowait) await sleep(ms); },
    zoomFollow: async (depth = 3) => { const ms = await this.zk('zoom.follow', depth); await sleep(ms * 0.6); },
    zoomOut: async (o = {}) => { const ms = await this.zk('zoom.out'); if (!o.nowait) await sleep(ms); },
    callout: async (text, target, o = {}) => { const b = await this.box(target); await this.zk('callout.show', this.sub(text), Math.min(W - 600, Math.max(20, b.x + (o.dx ?? 0))), Math.max(20, b.y + b.h + (o.dy ?? 16))); },
    uncallout: async () => this.zk('callout.hide'),
    // readiness and facts
    ready: async (timeout = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < timeout) { if (!(await this.zk('spinning').catch(() => false))) return; await sleep(120); } throw new Error('page still shows a loading spinner after ' + timeout + ' ms'); },
    expect: async (text, o = {}) => {
      text = this.sub(text); let ok = false;
      try { await (o.within ? this.page.locator(o.within) : this.page).getByText(text, { exact: !!o.exact }).first().waitFor({ state: 'visible', timeout: o.timeout ?? 8000 }); ok = true; } catch { /* recorded below */ }
      this.asserts.push({ beat: this.beatId, text, ok }); if (!ok) throw new Error(`expected to see "${text}"`);
    },
    remember: async (name, expr) => { this.vars[name] = await this.page.evaluate(expr); log('  var', name, '=', this.vars[name]); if (this.vars[name] == null) throw new Error('remember ' + name + ' got nothing'); },
    // code cards
    card: async (id) => { const def = resolveCard(id, this.direction.cards[id], this.sha); await this.zk('card.open', def); },
    hl: async (...needles) => { const hits = await this.zk('card.hl', needles); if (!hits.length) this.warn('hl matched nothing: ' + needles.join(' | ')); },
    tok: async (text) => { if (!(await this.zk('card.tok', text))) this.warn('tok not found: ' + text); },
    /** mark several pieces of text one after another, spread over `ms` */
    toks: async (list, ms = 2000) => { for (const t of list) { if (!(await this.zk('card.tok', t))) this.warn('tok not found: ' + t); await sleep(ms / list.length); } },
    note: async (text) => this.zk('card.note', text),
    unhl: async () => this.zk('card.clear', true),
    cardClose: async () => this.zk('card.close'),
    // diagrams
    diagram: async (id) => this.zk('diagram.open', this.direction.diagrams[id]),
    step: async (id) => { if (!(await this.zk('diagram.step', id))) this.warn('diagram node not found: ' + id); },
    glow: async (id) => this.zk('diagram.glow', id),
    mark: async (id, tone, sub) => this.zk('diagram.mark', id, tone, this.sub(sub)),
    sweep: async (ids, ms) => this.zk('diagram.sweep', ids, ms),
    cell: async (r, c) => this.zk('diagram.cell', r, c),
    bump: async (from, why, to) => this.zk('diagram.bump', from, why, to),
    diagramClose: async () => this.zk('diagram.close'),
    // terminal and title
    term: async (title) => this.zk('term.open', title),
    termType: async (id, ms = 1500) => this.zk('term.type', this.direction.terminal[id].shown, ms),
    termPrint: async (id, ms = 900) => { const out = fs.readFileSync(path.join(V4, 'terminal', id + '.txt'), 'utf8').replace(/\r/g, '').trimEnd(); await this.zk('term.print', out, ms); },
    termPoint: async (text) => { if (!(await this.zk('term.point', text))) this.warn('terminal text not found: ' + text); },
    termClose: async () => this.zk('term.close'),
    title: async (id) => this.zk('title.open', this.direction.titles[id]),
    reveal: async (key) => this.zk('title.reveal', key),
    titleClose: async () => this.zk('title.close'),
    closeAll: async () => { await this.zk('card.close'); await this.zk('diagram.close'); await this.zk('term.close'); await this.zk('title.close'); await this.zk('overlay.hide'); },
    // app shortcuts
    user: async (name) => { name = this.sub(name); await this.verbs.zoomOut(); await this.verbs.click('[title="Switch BITS Pilani Demo Persona"]'); await this.verbs.click(`button:has(p:text-is("${name}"))`, { after: 900 }); await this.verbs.ready(); },
    tab: async (label) => { await this.verbs.click({ role: 'button', name: label }, { after: 700 }); await this.verbs.ready(); },
    // GitHub
    /** run another verb, but only warn if it fails (for things that are nice to have, never for facts) */
    try: async (verb, ...a) => { try { await this.verbs[verb](...a); } catch (e) { this.warn(`optional step ${verb} skipped: ${e.message.split('\n')[0]}`); } },
    ghGoto: async (p) => { await this.verbs.goto(p ? 'GH/' + p.replace(/^\//, '') : 'GH', { waitUntil: 'domcontentloaded', settle: 1200 }); },
    /** show folder `dir`: go back to it if we just came from it, otherwise load it */
    ghFolder: async (dir) => {
      dir = expand(dir); const treeUrl = `${this.cfg.repoUrl}/tree/${this.ref}/${dir}`, here = this.page.url().split('#')[0];
      if (here === treeUrl) return;
      let back = false;
      if (!this.cfg.directFiles && this.lastTree === treeUrl && here.includes('/blob/')) { try { await this.page.goBack({ waitUntil: 'domcontentloaded', timeout: 8000 }); back = this.page.url().split('#')[0] === treeUrl; } catch { back = false; } }
      if (back) { await sleep(700 * this.pace); await this.inject(); this.nav.push({ t: +this.t().toFixed(2), url: treeUrl }); }
      else await this.verbs.ghGoto(`tree/<SHA>/${dir}`);
      this.lastTree = treeUrl;
    },
    /** open file `name` that lives in folder `dir`: go back to the folder if we just came from it, otherwise load the folder, then click the file */
    ghOpen: async (dir, name, file) => {
      dir = expand(dir); const treeUrl = `${this.cfg.repoUrl}/tree/${this.ref}/${dir}`, blob = `blob/<SHA>/${expand(file || dir + '/' + name)}`;
      if (this.cfg.directFiles) return this.verbs.ghGoto(blob);
      await this.verbs.ghFolder(dir);
      await this.verbs.ghClick(name, { fallback: blob });
    },
    ghRow: async (name, o = {}) => {
      const sel = `a[href$="/${name}"]:visible, a[title="${name}"]:visible, a[aria-label^="${name},"]:visible`;
      const l = this.page.locator('table, [role=grid], main').locator(sel).first();
      try { await l.waitFor({ state: 'visible', timeout: o.timeout ?? 5000 }); } catch { this.warn('GitHub row not found: ' + name); return null; }
      return l;
    },
    ghHover: async (name, hold = 500) => { const l = await this.verbs.ghRow(name); if (!l) return; await l.evaluate((e) => { const b = e.getBoundingClientRect(); if (b.top < 120 || b.bottom > innerHeight - 60) e.scrollIntoView({ behavior: 'smooth', block: 'center' }); }); await sleep(250); await this.glide(async () => { const b = await l.boundingBox(); return { x: b.x + Math.min(b.width * 0.6, 120), y: b.y + b.height / 2 }; }); await sleep(hold); },
    ghClick: async (name, o = {}) => {
      const l = await this.verbs.ghRow(name);
      if (!l) { if (o.fallback) await this.verbs.ghGoto(o.fallback); return; }
      await this.verbs.ghHover(name, 120); const before = this.page.url();
      await this.page.mouse.down(); await sleep(70); await this.page.mouse.up();
      try { await this.page.waitForURL((u) => u.toString() !== before, { timeout: 8000 }); } catch { this.warn('click on ' + name + ' did not navigate'); if (o.fallback) await this.verbs.ghGoto(o.fallback); }
      await sleep((o.settle ?? 1100) * this.pace); await this.inject(); this.nav.push({ t: +this.t().toFixed(2), url: this.page.url() });
    },
    /** scroll a GitHub file view so that `needle` (text of a line in the file) sits about a third down the page */
    ghLine: async (file, needle) => {
      const n = lineOf(this.sha, file, needle); if (n < 0) { this.warn('line not found in file: ' + needle); return -1; }
      for (let i = 0; i < 8; i++) {
        const r = await this.page.evaluate((n) => {
          const pick = (k) => document.querySelector(`#LC${k}`) || document.querySelector(`[data-line-number="${k}"]`);
          const e = pick(n);
          if (e) { const b = e.getBoundingClientRect(); const dy = b.top - innerHeight * 0.32; if (Math.abs(dy) > 40) window.scrollBy({ top: dy, behavior: 'smooth' }); return { found: true, dy }; }
          const any = document.querySelector('[data-line-number]') || document.querySelector('[id^="LC"]'); if (!any) return { found: false, none: true };
          const k = +(any.getAttribute('data-line-number') || any.id.slice(2)); const h = any.getBoundingClientRect().height || 20;
          window.scrollBy({ top: (n - k) * h - innerHeight * 0.3 + any.getBoundingClientRect().top, behavior: 'smooth' }); return { found: false };
        }, n);
        await sleep(600); if (r.none) { this.warn('GitHub code lines not found in the page'); return n; } if (r.found && Math.abs(r.dy) <= 40) break;
      }
      return n;
    },
    /** drag-select whole lines from the line containing `fromText` to the line containing `toText` with the text cursor */
    ghSelect: async (file, fromText, toText, o = {}) => {
      const a = await this.verbs.ghLine(file, fromText);
      if (a < 0) return;
      const src = gitShow(this.sha, expand(file)).split('\n'); let b = a;
      if (toText) { const k = src.findIndex((l, i) => i >= a - 1 && l.includes(toText)); if (k < 0) { this.warn('end line of selection not found: ' + toText); return; } b = Math.min(src.length, k + 1 + (o.plus || 0)); }
      const boxes = await this.page.evaluate(([a, b]) => {
        const rect = (k) => { const code = document.querySelector(`#LC${k}`); const num = document.querySelector(`[data-line-number="${k}"]`); const e = code || num; if (!e) return null; const r = e.getBoundingClientRect(); let x0 = r.left, x1 = r.right;
          if (code) { const rng = document.createRange(); rng.selectNodeContents(code); const t = rng.getBoundingClientRect(); if (t.width > 0) { x0 = t.left; x1 = t.right; } } else { x0 = r.right + 24; x1 = innerWidth - 420; }
          return { x0, x1, y: r.top + r.height / 2, h: r.height }; };
        const A = rect(a); let B = rect(b), last = b; while (!B && last > a) B = rect(--last); return { A, B };
      }, [a, b]);
      if (!boxes.A || !boxes.B) { this.warn('cannot select lines ' + a + '-' + b + ' (line elements not found)'); return; }
      const from = { x: boxes.A.x0 - 2, y: boxes.A.y }, to = { x: Math.min(boxes.B.x1 + 6, W - 60), y: Math.min(boxes.B.y, H - 24) };
      await this.glide(async () => from); await sleep(160);
      await this.page.mouse.down(); await sleep(90);
      const ms = o.ms ?? Math.min(1500, 450 + (b - a) * 90), steps = Math.round(ms / 16), t0 = Date.now();
      for (let i = 1; i <= steps; i++) { const u = i / steps, e = u * u * (3 - 2 * u); await this.page.mouse.move(from.x + (to.x - from.x) * e, from.y + (to.y - from.y) * e); await sleep(t0 + (i * ms) / steps - Date.now()); }
      await sleep(120); await this.page.mouse.up();
      const picked = await this.page.evaluate(() => { const s = String(getSelection() || ''); const ta = document.activeElement; const t = ta && ta.tagName === 'TEXTAREA' ? ta.value.slice(ta.selectionStart, ta.selectionEnd) : ''; return Math.max(s.length, t.length); });
      if (picked < 3) this.warn('drag selection produced no selected text on lines ' + a + '-' + b);
    },
    ghUnselect: async () => { await this.page.evaluate(() => { getSelection()?.removeAllRanges(); const t = document.activeElement; if (t && t.tagName === 'TEXTAREA') t.setSelectionRange(0, 0); }); },
  };

  async run(step) { const [verb, ...args] = step; const fn = this.verbs[verb]; if (!fn) throw new Error('unknown verb ' + verb); return fn(...args); }

  /** Perform one take: an ordered list of beats recorded as one continuous clip. */
  async take(take) {
    this.nav = [{ t: 0, url: this.page.url() }]; this.marks = []; this.asserts = []; this.warnings = []; this.late = [];
    for (const beat of take.beats) {
      this.beatId = beat.id; const tm = this.timings[beat.id];
      const silent = beat.silent || (!tm && beat.optional);
      if (!tm && !silent) throw new Error('no audio timing for beat ' + beat.id);
      for (const s of beat.pre || []) await this.run(s);
      const T = this.t(), D = silent ? beat.silent || 0 : tm.duration_seconds ?? tm.duration;
      this.marks.push({ beat: beat.id, t: +T.toFixed(3), d: +D.toFixed(3), silent: !!silent });
      log(`▶ ${beat.id}  t=${T.toFixed(2)}  d=${D.toFixed(2)}  ${silent ? '(silent)' : (tm.say || '').slice(0, 60)}`);
      let prevAt = 0, afterSlow = false;
      const SLOW_VERBS = new Set(['goto', 'ghGoto', 'ghFolder', 'ghOpen', 'ghClick', 'ghSelect', 'user', 'tab', 'type']);
      for (const [cue, ...step] of beat.cues || []) {
        let at;
        if (typeof cue === 'number') at = cue;
        else if (cue === '@end') at = D;
        else if (cue.startsWith('+')) at = prevAt + parseFloat(cue.slice(1));
        else { const r = cueTime(tm || { say: '', duration_seconds: D }, cue.slice(1), { after: prevAt - 0.3 }); at = r.t; if (r.how === 'missing') this.warn(`cue word not found: ${cue}`); }
        prevAt = at;
        const wait = (T + at - this.t()) * 1000;
        const relative = typeof cue === 'string' && cue.startsWith('+');
        if (wait < -350 && !afterSlow && !relative) this.late.push({ beat: beat.id, cue: String(cue), by: +(-wait / 1000).toFixed(2) });
        if (SLOW_VERBS.has(step[0])) afterSlow = true;
        await sleep(wait); await this.run(step);
      }
      this.marks.at(-1).e = +this.t().toFixed(3);
      await sleep(Math.max(450, (T + D + (beat.hold ?? 0.3) - this.t()) * 1000));
      for (const s of beat.post || []) await this.run(s);
    }
    this.beatId = null;
    return { marks: this.marks, asserts: this.asserts, warnings: this.warnings, late: this.late, nav: this.nav, vars: this.vars };
  }
}
