/* stagekit.js — injected into every recorded page (GitHub, landing page, the app).
 * Adds, on top of the real page: a visible mouse cursor, click ripples, an
 * OpenScreen-style zoom camera, a blurred backdrop, code cards with line and
 * token highlights, flow diagrams, a priority matrix, a terminal and title cards.
 * Everything is exposed on window.__zk and driven from kit/director.mjs.
 *
 * Zoom maths (scale table, log-space scale, spring easing, transition length,
 * focus clamping, chained pans, distance-adaptive cursor follow) is ported from
 * OpenScreen, MIT licence, https://github.com/getopenscreen/openscreen
 * (src/lib/zoomMath/*, src/lib/ai-edition/timeline/zoom-scale.ts).
 */
(() => {
  if (window.__zk) return;
  const Z = (window.__zk = { version: 1 });
  const INK = '#1B1530', CREAM = '#FFF8DC', YEL = '#FFD84D', HOT = '#FFE14D', RED = '#FF4D3D', GRN = '#43D17A', SKY = '#59C9F5';
  const MONO = '"JetBrains Mono","Cascadia Code",Consolas,ui-monospace,Menlo,monospace';
  const SANS = '"Space Grotesk","Segoe UI",system-ui,-apple-system,sans-serif';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // ------------------------------------------------------------------ host
  let host, backdrop, layer;
  function mount() {
    if (host && host.isConnected) return;
    host = el('div'); host.id = '__zk_host';
    const style = el('style');
    style.textContent = `
#__zk_host{position:fixed;inset:0;z-index:2147483000;pointer-events:none;font-family:${SANS};color:${INK}}
#__zk_host *{box-sizing:border-box}
html.__zk_noscroll::-webkit-scrollbar,html.__zk_on::-webkit-scrollbar,html.__zk_on body::-webkit-scrollbar{display:none}
#__zk_backdrop{position:absolute;inset:0;opacity:0;transition:opacity .35s ease;backdrop-filter:blur(14px) saturate(.75);-webkit-backdrop-filter:blur(14px) saturate(.75);background:rgba(14,10,36,.62)}
#__zk_backdrop.on{opacity:1}
#__zk_layer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
.zk-pop{opacity:0;transform:translateY(18px) scale(.97);transition:opacity .32s ease,transform .38s cubic-bezier(.16,1,.3,1)}
.zk-pop.on{opacity:1;transform:none}
/* cursor */
#__zk_cursor{position:absolute;left:0;top:0;width:34px;height:34px;margin:-3px 0 0 -5px;will-change:transform;filter:drop-shadow(0 2px 2px rgba(0,0,0,.45))}
#__zk_cursor svg{position:absolute;inset:0;display:none}
#__zk_cursor[data-k=arrow] .c-arrow,#__zk_cursor[data-k=hand] .c-hand,#__zk_cursor[data-k=text] .c-text{display:block}
#__zk_cursor[data-k=text]{margin:-17px 0 0 -17px}
#__zk_cursor[data-k=hand]{margin:-2px 0 0 -11px}
.zk-ripple{position:absolute;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;border:3px solid ${RED};background:rgba(255,77,61,.25);animation:zkRip .55s ease-out forwards}
@keyframes zkRip{to{transform:scale(4.2);opacity:0}}
.zk-ring{position:absolute;border:4px solid ${RED};box-shadow:0 0 0 4px rgba(255,77,61,.25),0 0 22px rgba(255,77,61,.6);border-radius:6px;opacity:0;transition:opacity .25s,left .35s,top .35s,width .35s,height .35s;animation:zkPulse 1.1s ease-in-out infinite}
.zk-ring.on{opacity:1}
@keyframes zkPulse{50%{box-shadow:0 0 0 9px rgba(255,77,61,.12),0 0 30px rgba(255,77,61,.75)}}
/* chip, callout */
.zk-chip{position:absolute;left:28px;top:24px;background:${YEL};border:3px solid ${INK};box-shadow:5px 5px 0 ${INK};font:800 22px ${MONO};padding:8px 16px;letter-spacing:.04em}
.zk-callout{position:absolute;background:${CREAM};border:3px solid ${INK};box-shadow:6px 6px 0 ${INK};font:700 22px ${SANS};padding:10px 16px;max-width:560px}
/* code card */
.zk-card{position:relative;width:1560px;max-width:94vw;background:#17122E;border:4px solid ${INK};box-shadow:12px 12px 0 rgba(0,0,0,.55);display:flex;flex-direction:column;overflow:hidden}
.zk-card .bar{display:flex;align-items:center;gap:12px;background:${INK};color:${CREAM};padding:10px 16px;font:700 19px ${MONO};border-bottom:3px solid #0B071E}
.zk-card .bar i{width:14px;height:14px;display:inline-block;border:1px solid #000}
.zk-card .bar .path{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.zk-card .bar .path b{color:${YEL}}
.zk-card .bar .rng{color:${SKY}}
.zk-card .view{position:relative;overflow:hidden;height:var(--h)}
.zk-card .code{position:absolute;left:0;top:0;padding:18px 0;transform-origin:0 0;transition:transform .7s cubic-bezier(.16,1,.3,1);font:500 var(--fs) ${MONO};line-height:1.55;color:#E7E3FF;min-width:100%}
.zk-card .ln{display:flex;white-space:pre;padding:0 26px 0 0;transition:filter .45s,opacity .45s,background .3s}
.zk-card .ln .no{width:78px;flex:none;text-align:right;padding-right:22px;color:#6E67A0;user-select:none}
.zk-card .ln .tx{flex:1}
.zk-card.focus .ln:not(.on){filter:blur(5px);opacity:.28}
.zk-card .ln.on{background:${HOT};color:${INK}}
.zk-card .ln.on .no{color:#5b4a00;background:#F2CF2E}
.zk-card .ln.on .tx *{color:${INK}!important}
.zk-card .tok{background:${RED};color:#fff!important;box-shadow:0 -4px 0 ${RED},0 4px 0 ${RED};animation:zkTok 1s ease-in-out infinite}
.zk-card .ln.on .tx .tok,.zk-card .ln.on .tx .tok *{color:#fff!important}
@keyframes zkTok{50%{background:#FF7466;box-shadow:0 -4px 0 #FF7466,0 4px 0 #FF7466}}
.zk-card .k{color:#FF8AD0}.zk-card .s{color:#9BE28B}.zk-card .c{color:#7D78A8;font-style:italic}.zk-card .n{color:#FFB86B}.zk-card .t{color:#7FD6FA}.zk-card .a{color:${YEL}}.zk-card .f{color:#C9B6FF}
.zk-note{position:absolute;right:30px;top:66px;z-index:3;background:${YEL};border:3px solid ${INK};box-shadow:6px 6px 0 ${INK};font:800 26px ${SANS};padding:10px 18px;transform:rotate(2deg) scale(.6);opacity:0;transition:transform .4s cubic-bezier(.16,1.4,.3,1),opacity .25s}
.zk-note.on{transform:rotate(2deg) scale(1);opacity:1}
/* diagrams */
.zk-dia{background:${CREAM};border:4px solid ${INK};box-shadow:12px 12px 0 ${INK};padding:26px 34px 30px;max-width:95vw}
.zk-dia h2{margin:0 0 6px;font:800 34px ${SANS};letter-spacing:-.01em}
.zk-dia .subt{font:600 19px ${MONO};color:#5A4F86;margin-bottom:22px}
.zk-flow{position:relative;display:grid;gap:34px 46px}
.zk-node{position:relative;background:#fff;border:3px solid ${INK};box-shadow:5px 5px 0 ${INK};padding:14px 16px;min-height:96px;display:flex;flex-direction:column;justify-content:center;transition:transform .3s cubic-bezier(.16,1.4,.3,1),background .25s,opacity .3s,box-shadow .25s;opacity:.5}
.zk-node .num{position:absolute;left:-14px;top:-14px;width:34px;height:34px;background:${INK};color:${CREAM};font:800 18px ${MONO};display:flex;align-items:center;justify-content:center}
.zk-node .lab{font:800 22px ${SANS};line-height:1.15}
.zk-node .sub{font:600 15.5px ${MONO};color:#5A4F86;margin-top:6px;line-height:1.3}
.zk-node.done{opacity:1;background:#DDF7E6}
.zk-node.done::after{content:"✓";position:absolute;right:8px;top:4px;font:800 20px ${SANS};color:#17803D}
.zk-node.on{opacity:1;background:${HOT};transform:scale(1.07);box-shadow:5px 5px 0 ${INK},0 0 0 5px rgba(255,77,61,.9),0 0 34px rgba(255,77,61,.65);z-index:2;animation:zkNode 1.2s ease-in-out infinite}
@keyframes zkNode{50%{box-shadow:5px 5px 0 ${INK},0 0 0 8px rgba(255,77,61,.55),0 0 44px rgba(255,77,61,.8)}}
.zk-node.warn{background:#FFD2A8}.zk-node.bad{background:#FFB3AB}.zk-node.good{background:#BDF0CE}
.zk-flow svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
.zk-flow svg path[data-e]{fill:none;stroke:${INK};stroke-width:4;opacity:.35;transition:opacity .3s,stroke .3s}
.zk-flow svg path[data-e].lit{opacity:1;stroke:${RED}}
.zk-detail{margin-top:24px;background:#17122E;color:#E7E3FF;border:3px solid ${INK};padding:12px 16px;font:600 19px ${MONO};min-height:76px;transition:opacity .25s}
.zk-detail .file{color:${YEL};font-weight:800;margin-bottom:5px}
.zk-detail .line{white-space:pre-wrap;word-break:break-word}
.zk-matrix{border-collapse:separate;border-spacing:8px;font:800 24px ${SANS}}
.zk-matrix th{font:700 17px ${MONO};color:#5A4F86;padding:6px 10px;text-align:center}
.zk-matrix td{width:150px;height:84px;text-align:center;background:#fff;border:3px solid ${INK};box-shadow:4px 4px 0 ${INK};transition:all .3s;opacity:.55}
.zk-matrix td.on{opacity:1;background:${HOT};transform:scale(1.1);box-shadow:4px 4px 0 ${INK},0 0 0 5px rgba(255,77,61,.9),0 0 30px rgba(255,77,61,.65)}
.zk-bump{display:flex;align-items:center;gap:18px;margin-top:22px;font:800 24px ${SANS};opacity:0;transform:translateY(10px);transition:all .4s}
.zk-bump.on{opacity:1;transform:none}
.zk-bump .pill{background:#fff;border:3px solid ${INK};box-shadow:4px 4px 0 ${INK};padding:8px 16px}
.zk-bump .pill.res{background:${RED};color:#fff;font-size:30px}
.zk-bump .why{font:700 19px ${MONO};background:${YEL};border:3px solid ${INK};padding:6px 12px}
/* terminal */
.zk-term{width:1500px;max-width:94vw;background:#0B0A14;border:4px solid ${INK};box-shadow:12px 12px 0 rgba(0,0,0,.55)}
.zk-term .bar{background:${INK};color:${CREAM};font:700 18px ${MONO};padding:9px 16px;display:flex;gap:10px;align-items:center}
.zk-term .bar i{width:14px;height:14px;display:inline-block;border:1px solid #000}
.zk-term pre{margin:0;padding:20px 24px;height:640px;overflow:hidden;font:500 21px/1.5 ${MONO};color:#C8F5D2;white-space:pre-wrap;word-break:break-all}
.zk-term .cmd{color:#fff}.zk-term .ps{color:${GRN};font-weight:800}
.zk-term .caret{display:inline-block;width:12px;height:24px;background:#C8F5D2;vertical-align:-4px;animation:zkBlink 1s steps(1) infinite}
@keyframes zkBlink{50%{opacity:0}}
.zk-term .hit{background:${HOT};color:${INK};box-shadow:0 0 0 3px ${HOT},0 0 20px rgba(255,225,77,.7)}
/* title */
.zk-title{background:${CREAM};border:4px solid ${INK};box-shadow:14px 14px 0 ${INK};padding:44px 60px;min-width:1100px}
.zk-title h1{margin:0;font:800 60px ${SANS};letter-spacing:-.02em}
.zk-title .tag{font:700 24px ${MONO};color:#5A4F86;margin:8px 0 30px}
.zk-title .row{display:flex;gap:26px;align-items:baseline;padding:12px 0;border-top:3px solid rgba(27,21,48,.15);opacity:.18;transform:translateX(-12px);transition:all .45s cubic-bezier(.16,1,.3,1)}
.zk-title .row.on{opacity:1;transform:none}
.zk-title .row b{font:800 34px ${SANS};width:360px;flex:none}
.zk-title .row span{font:600 22px ${MONO};color:#3d3466}
`;
    host.appendChild(style);
    backdrop = el('div'); backdrop.id = '__zk_backdrop'; host.appendChild(backdrop);
    layer = el('div'); layer.id = '__zk_layer'; host.appendChild(layer);
    const cur = el('div'); cur.id = '__zk_cursor'; cur.dataset.k = 'arrow';
    cur.innerHTML = `
<svg class="c-arrow" viewBox="0 0 34 34"><path d="M5 3 L5 27 L11.5 21 L16 31 L20 29.2 L15.6 19.5 L24.5 19.5 Z" fill="#111" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>
<svg class="c-hand" viewBox="0 0 34 34"><path d="M12 3c1.6 0 2.6 1.1 2.6 2.7V14l1-.2c.3-1 1.2-1.6 2.3-1.6 1.200 0 2.100.7 2.400 1.800l.6-.1c1.400 0 2.400 1 2.500 2.300 1.400.1 2.400 1.200 2.400 2.700v4.300c0 4.300-3 7.800-7.500 7.800h-2.600c-2.600 0-4.400-1.200-5.900-3.300L5.300 21.600c-.8-1.200-.5-2.700.6-3.500 1.100-.7 2.400-.5 3.300.5l.2.3V5.700C9.400 4.100 10.400 3 12 3Z" fill="#fff" stroke="#111" stroke-width="1.8" stroke-linejoin="round"/></svg>
<svg class="c-text" viewBox="0 0 34 34"><path d="M11 5h5c.6 0 1 .4 1 1 0-.6.4-1 1-1h5M11 29h5c.6 0 1-.4 1-1 0 .6.4 1 1 1h5M17 6v22" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M11 5h5c.6 0 1 .4 1 1 0-.6.4-1 1-1h5M11 29h5c.6 0 1-.4 1-1 0 .6.4 1 1 1h5M17 6v22" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round"/></svg>`;
    host.appendChild(cur);
    document.documentElement.appendChild(host);
    document.documentElement.classList.add('__zk_on');
  }
  Z.mount = mount;

  // ------------------------------------------------------------------ camera (OpenScreen zoom maths)
  const DEPTH = { 1: 1.25, 2: 1.5, 3: 1.8, 4: 2.2, 5: 3.5, 6: 5.0 };
  const transitionMs = (scale) => 600 + 550 * Math.log(Math.max(1, scale));
  const SPRING_W = 7, SPRING_END = 1 - (1 + SPRING_W) * Math.exp(-SPRING_W);
  const easeSpring = (t) => { const x = SPRING_W * clamp(t, 0, 1); return (1 - (1 + x) * Math.exp(-x)) / SPRING_END; };
  function bezier(x1, y1, x2, y2, t) { // cubic-bezier(x1,y1,x2,y2) solved for x=t
    const fx = (a1, a2, u) => 3 * a1 * (1 - u) * (1 - u) * u + 3 * a2 * (1 - u) * u * u + u * u * u;
    let lo = 0, hi = 1, u = t;
    for (let i = 0; i < 24; i++) { u = (lo + hi) / 2; if (fx(x1, x2, u) < t) lo = u; else hi = u; }
    return fx(y1, y2, u);
  }
  const easePan = (t) => bezier(0.1, 0.0, 0.2, 1.0, clamp(t, 0, 1));
  const FOLLOW = { min: 0.10, max: 0.25, ramp: 0.15, refMs: 25 };
  const PAN_MS = 1000;

  const cam = { S: 1, p: 0, fx: 0.5, fy: 0.5, anim: null, pan: null, follow: false, tx: 0, ty: 0, s: 1, stage: null, last: performance.now() };
  const stage = () => cam.stage || (cam.stage = document.querySelector('#root') || document.body);
  const vw = () => window.innerWidth, vh = () => window.innerHeight;
  function clampFocus() {
    const m = Math.min(0.5, 1 / (2 * cam.S));
    cam.fx = clamp(cam.fx, m, 1 - m); cam.fy = clamp(cam.fy, m, 1 - m);
  }
  // cursor position in un-zoomed viewport pixels ("logical"); the sprite is drawn at toScreen(L)
  const cursor = { lx: vw() * 0.5, ly: vh() * 0.45, kind: 'arrow', hidden: false };
  const toScreen = (lx, ly) => ({ x: cam.tx + cam.s * lx, y: cam.ty + cam.s * ly });
  const toLogical = (x, y) => ({ x: (x - cam.tx) / cam.s, y: (y - cam.ty) / cam.s });

  function tick(now) {
    const dt = Math.min(100, now - cam.last); cam.last = now;
    if (cam.anim) {
      const u = (now - cam.anim.t0) / cam.anim.ms;
      cam.p = cam.anim.from + (cam.anim.to - cam.anim.from) * easeSpring(u); // spring rise in, spring fall out
      if (u >= 1) { cam.p = cam.anim.to; cam.anim = null; if (cam.p === 0) { cam.S = 1; cam.follow = false; } }
    }
    if (cam.pan) {
      const u = (now - cam.pan.t0) / cam.pan.ms, e = easePan(u);
      cam.fx = cam.pan.x0 + (cam.pan.x1 - cam.pan.x0) * e; cam.fy = cam.pan.y0 + (cam.pan.y1 - cam.pan.y0) * e;
      if (cam.pan.S0 !== cam.pan.S1) cam.S = cam.pan.S0 * Math.pow(cam.pan.S1 / cam.pan.S0, e);
      if (u >= 1) cam.pan = null;
    } else if (cam.follow && cam.p > 0) {
      const rx = cursor.lx / vw(), ry = cursor.ly / vh();
      const d = Math.hypot(rx - cam.fx, ry - cam.fy);
      const base = FOLLOW.min + (FOLLOW.max - FOLLOW.min) * Math.min(1, d / FOLLOW.ramp);
      const k = 1 - Math.pow(1 - base, dt / FOLLOW.refMs);
      cam.fx += (rx - cam.fx) * k; cam.fy += (ry - cam.fy) * k;
    }
    clampFocus();
    cam.vel = Math.hypot(cam.fx - (cam.pfx ?? cam.fx), cam.fy - (cam.pfy ?? cam.fy)); cam.pfx = cam.fx; cam.pfy = cam.fy;
    const st = stage();
    if (cam.p > 0.0005) {
      const s = Math.pow(cam.S, cam.p);               // scaleLerp(1,S,p): log-space
      const Fx = cam.fx * vw(), Fy = cam.fy * vh();
      cam.s = s;
      cam.tx = Fx + (vw() / 2 - Fx) * cam.p - Fx * s;  // focus travels to the centre linearly
      cam.ty = Fy + (vh() / 2 - Fy) * cam.p - Fy * s;
      const r = st === document.body ? { left: -scrollX, top: -scrollY } : st.__zk0 || (st.__zk0 = (() => { const b = st.getBoundingClientRect(); return { left: b.left + scrollX, top: b.top + scrollY, doc: true }; })());
      const ox = r.doc ? r.left - scrollX : r.left, oy = r.doc ? r.top - scrollY : r.top; // stage origin in un-zoomed viewport px
      st.style.transformOrigin = '0 0';
      st.style.transform = `translate(${cam.tx + ox * (s - 1)}px,${cam.ty + oy * (s - 1)}px) scale(${s})`;
      st.style.willChange = 'transform';
    } else if (cam.s !== 1 || st.style.transform) {
      cam.s = 1; cam.tx = 0; cam.ty = 0; st.style.transform = ''; st.style.willChange = ''; st.__zk0 = null;
    }
    const c = host && host.querySelector('#__zk_cursor');
    if (c) {
      const p = toScreen(cursor.lx, cursor.ly);
      c.style.transform = `translate(${p.x}px,${p.y}px)`;
      c.style.opacity = cursor.hidden ? 0 : 1;
      c.dataset.k = cursor.kind;
    }
    requestAnimationFrame(tick);
  }

  Z.zoom = {
    /** Zoom so that `rect` (un-zoomed viewport px: {x,y,w,h}) is centred. depth 1..6 or a scale. */
    to(rect, depth = 3) {
      const S = DEPTH[depth] || depth;
      const fx = (rect.x + rect.w / 2) / vw(), fy = (rect.y + rect.h / 2) / vh();
      const now = performance.now();
      cam.follow = false;
      if (cam.p > 0.05) { // already zoomed: chained pan instead of out-and-in
        cam.anim = cam.p < 1 ? { t0: now, ms: transitionMs(S), from: cam.p, to: 1 } : null;
        cam.pan = { t0: now, ms: PAN_MS, x0: cam.fx, y0: cam.fy, x1: fx, y1: fy, S0: cam.S, S1: S };
        return PAN_MS;
      }
      cam.S = S; cam.fx = fx; cam.fy = fy; cam.pan = null;
      cam.anim = { t0: now, ms: transitionMs(S), from: cam.p, to: 1 };
      return cam.anim.ms;
    },
    /** Zoom in on the cursor and keep following it. */
    follow(depth = 3) {
      const S = DEPTH[depth] || depth, now = performance.now();
      if (cam.p <= 0.05) { cam.S = S; cam.fx = cursor.lx / vw(); cam.fy = cursor.ly / vh(); }
      else cam.S = S;
      cam.pan = null; cam.follow = true;
      cam.anim = { t0: now, ms: transitionMs(S), from: cam.p, to: 1 };
      return cam.anim.ms;
    },
    out() {
      if (cam.p <= 0) return 0;
      cam.pan = null;
      cam.anim = { t0: performance.now(), ms: transitionMs(cam.S), from: cam.p, to: 0 };
      return cam.anim.ms;
    },
    state: () => ({ p: cam.p, s: cam.s, tx: cam.tx, ty: cam.ty, busy: !!(cam.anim || cam.pan) || (cam.vel || 0) > 0.0004, S: cam.S }),
    /** element -> rect in un-zoomed viewport px */
    rectOf(e) { const b = e.getBoundingClientRect(); const a = toLogical(b.left, b.top); return { x: a.x, y: a.y, w: b.width / cam.s, h: b.height / cam.s }; },
  };

  // ------------------------------------------------------------------ cursor
  let shapeAt = 0;
  function onMove(e) {
    const L = toLogical(e.clientX, e.clientY); cursor.lx = L.x; cursor.ly = L.y;
    const now = performance.now();
    if (now - shapeAt > 40) {
      shapeAt = now;
      const t = document.elementFromPoint(e.clientX, e.clientY);
      let k = 'arrow';
      if (t) {
        const cs = getComputedStyle(t).cursor;
        if (cs === 'pointer' || t.closest('a,button,[role=button],select,summary,label[for]')) k = 'hand';
        else if (cs === 'text' || /^(INPUT|TEXTAREA)$/.test(t.tagName) || t.isContentEditable) k = 'text';
      }
      if (!cursor.lock) cursor.kind = k;
    }
  }
  function ripple() {
    mount();
    const p = toScreen(cursor.lx, cursor.ly), r = el('div', 'zk-ripple');
    r.style.left = p.x + 'px'; r.style.top = p.y + 'px'; host.appendChild(r); setTimeout(() => r.remove(), 600);
  }
  Z.cursor = {
    screen: () => toScreen(cursor.lx, cursor.ly),
    logical: () => ({ x: cursor.lx, y: cursor.ly }),
    toScreen, toLogical, ripple,
    set(x, y) { const L = toLogical(x, y); cursor.lx = L.x; cursor.ly = L.y; },
    hide(v = true) { cursor.hidden = v; },
    shape(k) { cursor.lock = !!k; if (k) cursor.kind = k; },
  };
  let ring;
  Z.ring = {
    show(rect, pad = 8) { // rect in screen px
      mount();
      if (!ring) { ring = el('div', 'zk-ring'); host.appendChild(ring); }
      Object.assign(ring.style, { left: rect.x - pad + 'px', top: rect.y - pad + 'px', width: rect.w + pad * 2 + 'px', height: rect.h + pad * 2 + 'px' });
      requestAnimationFrame(() => ring.classList.add('on'));
    },
    hide() { if (ring) ring.classList.remove('on'); },
  };

  // ------------------------------------------------------------------ overlay plumbing
  let current = null; // {kind, node}
  async function show(kind, node) {
    mount();
    if (current) await hide();
    node.classList.add('zk-pop'); layer.appendChild(node);
    backdrop.classList.add('on'); cursor.hidden = kind !== 'card' ? true : cursor.hidden;
    current = { kind, node };
    await sleep(30); node.classList.add('on'); await sleep(330);
  }
  async function hide() {
    if (!current) return;
    const { node } = current; current = null;
    node.classList.remove('on'); backdrop.classList.remove('on'); cursor.hidden = false;
    await sleep(340); node.remove();
  }
  Z.overlay = { hide, kind: () => (current ? current.kind : null) };

  Z.chip = async (text, ms = 2600) => { mount(); const c = el('div', 'zk-chip zk-pop', esc(text)); host.appendChild(c); await sleep(30); c.classList.add('on'); setTimeout(() => { c.classList.remove('on'); setTimeout(() => c.remove(), 400); }, ms); };
  let callout;
  Z.callout = {
    async show(text, x, y) { mount(); Z.callout.hide(); callout = el('div', 'zk-callout zk-pop', esc(text)); callout.style.left = x + 'px'; callout.style.top = y + 'px'; host.appendChild(callout); await sleep(30); callout.classList.add('on'); },
    hide() { if (callout) { const c = callout; callout = null; c.classList.remove('on'); setTimeout(() => c.remove(), 350); } },
  };

  // ------------------------------------------------------------------ syntax colouring (small, language-agnostic)
  const KW = new Set('abstract assert async await boolean break case catch class const continue default do else enum export extends final finally for from function if implements import in instanceof interface let new null of package private protected public record return sealed permits static super switch this throw throws try typeof var void while yield true false non-sealed default CREATE OR REPLACE FUNCTION RETURNS TRIGGER AS BEGIN END RAISE EXCEPTION BEFORE UPDATE DELETE TRUNCATE ON FOR EACH STATEMENT EXECUTE LANGUAGE int long double short byte char'.split(' '));
  function colour(line, st) {
    let out = '', i = 0;
    const push = (cls, txt) => { out += cls ? `<span class="${cls}">${esc(txt)}</span>` : esc(txt); };
    while (i < line.length) {
      if (st.block) { const j = line.indexOf('*/', i); const end = j < 0 ? line.length : j + 2; push('c', line.slice(i, end)); i = end; if (j >= 0) st.block = false; continue; }
      const rest = line.slice(i); let m;
      if (rest.startsWith('//') || rest.startsWith('--')) { push('c', rest); break; }
      if (rest.startsWith('/*')) { st.block = true; continue; }
      if ((m = /^"(?:[^"\\]|\\.)*"?|^'(?:[^'\\]|\\.)*'?|^`[^`]*`?/.exec(rest))) { push('s', m[0]); i += m[0].length; continue; }
      if ((m = /^@[A-Za-z_]\w*/.exec(rest))) { push('a', m[0]); i += m[0].length; continue; }
      if ((m = /^\d[\d_.]*[LlFf]?/.exec(rest))) { push('n', m[0]); i += m[0].length; continue; }
      if ((m = /^[A-Za-z_$][\w$]*/.exec(rest))) {
        const w = m[0], after = rest[w.length];
        push(KW.has(w) ? 'k' : /^[A-Z]/.test(w) ? 't' : after === '(' ? 'f' : '', w); i += w.length; continue;
      }
      push('', rest[0]); i++;
    }
    return out;
  }

  // ------------------------------------------------------------------ code card
  let card = null;
  function wrapRange(lineEl, start, len, cls) { // wrap characters [start,start+len) of a line's text in spans
    const tx = lineEl.querySelector('.tx'); const walker = document.createTreeWalker(tx, NodeFilter.SHOW_TEXT);
    let pos = 0, n; const todo = [];
    while ((n = walker.nextNode())) {
      const a = Math.max(start, pos), b = Math.min(start + len, pos + n.data.length);
      if (a < b) todo.push([n, a - pos, b - pos]);
      pos += n.data.length;
    }
    for (const [node, a, b] of todo) { const r = document.createRange(); r.setStart(node, a); r.setEnd(node, b); const s = el('span', cls); r.surroundContents(s); }
  }
  Z.card = {
    /** def: {id, path, first (line number of first line), lines:[text], lang} */
    async open(def) {
      const n = def.lines.length, fs = n <= 14 ? 25 : n <= 20 ? 22 : n <= 26 ? 19.5 : 17.5;
      const node = el('div', 'zk-card');
      const parts = def.path.split('/'); const file = parts.pop();
      node.innerHTML = `<div class="bar"><i style="background:${RED}"></i><i style="background:${YEL}"></i><i style="background:${GRN}"></i><span class="path">${esc(parts.slice(-3).join('/'))}/<b>${esc(file)}</b></span><span class="rng">lines ${def.first}–${def.first + n - 1}</span></div><div class="view"><div class="code"></div></div>`;
      const code = node.querySelector('.code'); const st = { block: false };
      node.style.setProperty('--fs', fs + 'px'); node.style.setProperty('--h', Math.min(860, Math.round(n * fs * 1.55 + 36)) + 'px');
      def.lines.forEach((t, i) => { const ln = el('div', 'ln'); ln.innerHTML = `<span class="no">${def.first + i}</span><span class="tx">${colour(t, st) || ' '}</span>`; ln.dataset.raw = t; code.appendChild(ln); });
      // shrink the type until the longest line fits, so nothing is cut off on the right
      mount(); node.style.visibility = 'hidden'; layer.appendChild(node);
      const view = node.querySelector('.view');
      if (code.scrollWidth > view.clientWidth) {
        const fit = Math.max(12.5, fs * (view.clientWidth / code.scrollWidth) * 0.985);
        node.style.setProperty('--fs', fit + 'px'); node.style.setProperty('--h', Math.min(860, Math.round(n * fit * 1.55 + 36)) + 'px');
      }
      node.style.visibility = '';
      card = { node, code, def, note: null };
      await show('card', node);
    },
    /** Highlight every line containing one of `needles`; zoom to them; blur the rest. Returns matched line numbers. */
    hl(needles) {
      if (!card) return [];
      Z.card.clear(true);
      const lines = [...card.code.children], hits = lines.filter((l) => needles.some((s) => l.dataset.raw.includes(s)));
      if (!hits.length) return [];
      hits.forEach((l) => l.classList.add('on')); card.node.classList.add('focus');
      const view = card.node.querySelector('.view'), V = { w: view.clientWidth, h: view.clientHeight };
      const top = hits[0].offsetTop, bot = hits[hits.length - 1].offsetTop + hits[hits.length - 1].offsetHeight;
      let wMax = 0; hits.forEach((l) => { wMax = Math.max(wMax, l.querySelector('.tx').firstChild ? (() => { const r = document.createRange(); r.selectNodeContents(l.querySelector('.tx')); return r.getBoundingClientRect().width + 110; })() : 0); });
      const scale = clamp(Math.min((V.w * 0.94) / Math.max(wMax, 300), (V.h * 0.62) / Math.max(bot - top, 30)), 1, 2.1);
      const ty = clamp(V.h / 2 - ((top + bot) / 2) * scale, V.h - card.code.offsetHeight * scale, 0);
      card.code.style.transform = `translate(0px,${scale > 1.02 ? ty : 0}px) scale(${scale})`;
      return hits.map((l) => +l.querySelector('.no').textContent);
    },
    /** Mark exact text inside the card (first occurrence; highlighted lines are searched first). */
    tok(text) {
      if (!card) return false;
      card.code.querySelectorAll('.tok').forEach((s) => s.replaceWith(...s.childNodes)); card.code.normalize();
      const lines = [...card.code.children], order = [...lines.filter((l) => l.classList.contains('on')), ...lines.filter((l) => !l.classList.contains('on'))];
      for (const l of order) { const i = l.dataset.raw.indexOf(text); if (i >= 0) { wrapRange(l, i, text.length, 'tok'); return true; } }
      return false;
    },
    note(text) { if (!card) return; if (card.note) card.note.remove(); card.note = el('div', 'zk-note', esc(text)); card.node.appendChild(card.note); requestAnimationFrame(() => requestAnimationFrame(() => card.note.classList.add('on'))); },
    clear(keepNote) {
      if (!card) return;
      card.code.querySelectorAll('.tok').forEach((s) => s.replaceWith(...s.childNodes)); card.code.normalize();
      [...card.code.children].forEach((l) => l.classList.remove('on')); card.node.classList.remove('focus'); card.code.style.transform = '';
      if (!keepNote && card.note) { card.note.remove(); card.note = null; }
    },
    async close() { if (!card) return; card = null; await hide(); },
    isOpen: () => !!card, id: () => (card ? card.def.id : null),
  };

  // ------------------------------------------------------------------ diagrams
  let dia = null;
  function drawEdges() {
    if (!dia || dia.def.kind !== 'flow') return;
    const svg = dia.node.querySelector('svg'), box = dia.node.querySelector('.zk-flow').getBoundingClientRect(); let d = '';
    const nodes = dia.def.nodes, edges = dia.def.edges || nodes.slice(1).map((n, i) => [nodes[i].id, n.id]);
    svg.innerHTML = `<defs><marker id="zkA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="context-stroke" stroke="none"/></marker></defs>`;
    for (const [a, b] of edges) {
      const A = dia.map[a].getBoundingClientRect(), B = dia.map[b].getBoundingClientRect(); let p;
      const sameRow = Math.abs(A.top - B.top) < 20;
      if (sameRow) { const y = A.top + A.height / 2 - box.top; const x1 = (A.left < B.left ? A.right : A.left) - box.left, x2 = (A.left < B.left ? B.left - 6 : B.right + 6) - box.left; p = `M${x1} ${y}L${x2} ${y}`; }
      else if (Math.abs(A.left - B.left) < 20) { const x = A.left + A.width / 2 - box.left; p = `M${x} ${A.bottom - box.top}L${x} ${B.top - 6 - box.top}`; }
      else { const x1 = A.left + A.width / 2 - box.left, y1 = A.bottom - box.top, x2 = B.left + B.width / 2 - box.left, y2 = B.top - 6 - box.top, my = (y1 + y2) / 2; p = `M${x1} ${y1}L${x1} ${my}L${x2} ${my}L${x2} ${y2}`; }
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); path.setAttribute('d', p); path.setAttribute('marker-end', 'url(#zkA)'); path.dataset.e = a + '>' + b; svg.appendChild(path);
    }
  }
  Z.diagram = {
    /** def.kind 'flow': {title, sub, cols, numbered, nodes:[{id,label,sub,file,code}], edges?}
     *  def.kind 'matrix': {title, sub, rowTitle, colTitle, rows:[..], cols:[..], cells:[[..]]} */
    async open(def) {
      const node = el('div', 'zk-dia'); node.innerHTML = `<h2>${esc(def.title)}</h2>` + (def.sub ? `<div class="subt">${esc(def.sub)}</div>` : '<div style="height:14px"></div>');
      dia = { def, node, map: {}, active: null };
      if (def.kind === 'matrix') {
        let h = `<table class="zk-matrix"><tr><th></th>${def.cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr>`;
        def.rows.forEach((r, i) => { h += `<tr><th style="text-align:right">${esc(r)}</th>${def.cells[i].map((c, j) => `<td data-rc="${i},${j}">${esc(c)}</td>`).join('')}</tr>`; });
        node.insertAdjacentHTML('beforeend', h + '</table><div class="zk-bump"></div>');
      } else {
        const cols = def.cols || Math.min(def.nodes.length, 5), w = def.nodeWidth || (cols >= 5 ? 268 : cols === 4 ? 310 : 350);
        const flow = el('div', 'zk-flow'); flow.style.gridTemplateColumns = `repeat(${cols}, ${w}px)`;
        def.nodes.forEach((n, i) => {
          const b = el('div', 'zk-node', (def.numbered ? `<div class="num">${n.num ?? i + 1}</div>` : '') + `<div class="lab">${esc(n.label)}</div>` + (n.sub ? `<div class="sub">${esc(n.sub)}</div>` : ''));
          if (n.col) b.style.gridColumn = n.col; if (n.row) b.style.gridRow = n.row;
          if (def.allLit) b.style.opacity = 1;
          flow.appendChild(b); dia.map[n.id] = b;
        });
        flow.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'svg')); node.appendChild(flow);
        if (def.nodes.some((n) => n.code || n.file)) node.appendChild(el('div', 'zk-detail', '<div class="file">&nbsp;</div><div class="line">&nbsp;</div>'));
      }
      await show('diagram', node); drawEdges();
    },
    /** Light one node (flow) — earlier active node becomes "done". */
    step(id) {
      if (!dia || !dia.map[id]) return false;
      if (dia.active && dia.active !== id) { dia.map[dia.active].classList.remove('on'); dia.map[dia.active].classList.add('done'); }
      dia.node.querySelectorAll('svg path[data-e]').forEach((p) => p.classList.toggle('lit', p.dataset.e.endsWith('>' + id)));
      dia.map[id].classList.remove('done'); dia.map[id].classList.add('on'); dia.active = id;
      const n = dia.def.nodes.find((x) => x.id === id), d = dia.node.querySelector('.zk-detail');
      if (d) { d.querySelector('.file').textContent = n.file || ' '; d.querySelector('.line').textContent = n.code || ' '; }
      return true;
    },
    /** Light a node without marking the others done (for "one of these" lists). */
    glow(id) { if (!dia) return false; Object.values(dia.map).forEach((b) => b.classList.remove('on')); if (id && dia.map[id]) { dia.map[id].classList.add('on'); dia.map[id].style.opacity = 1; } dia.active = null; return !!dia.map[id]; },
    mark(id, tone, sub) { if (!dia || !dia.map[id]) return false; const b = dia.map[id]; b.classList.remove('warn', 'bad', 'good'); if (tone) b.classList.add(tone); b.style.opacity = 1; if (sub != null) { let s = b.querySelector('.sub'); if (!s) { s = el('div', 'sub'); b.appendChild(s); } s.textContent = sub; } return true; },
    async sweep(ids, totalMs) { const each = totalMs / ids.length; for (const id of ids) { Z.diagram.step(id); await sleep(each); } },
    cell(r, c) { if (!dia) return false; dia.node.querySelectorAll('td').forEach((t) => t.classList.toggle('on', t.dataset.rc === r + ',' + c)); return true; },
    bump(from, why, to) { if (!dia) return; const b = dia.node.querySelector('.zk-bump'); b.innerHTML = `<span class="pill">${esc(from)}</span><span>→</span><span class="why">${esc(why)}</span><span>→</span><span class="pill res">${esc(to)}</span>`; requestAnimationFrame(() => b.classList.add('on')); },
    async close() { if (!dia) return; dia = null; await hide(); },
    isOpen: () => !!dia,
  };

  // ------------------------------------------------------------------ terminal
  let term = null;
  Z.term = {
    async open(title) { const node = el('div', 'zk-term'); node.innerHTML = `<div class="bar"><i style="background:${RED}"></i><i style="background:${YEL}"></i><i style="background:${GRN}"></i><span>${esc(title || 'Terminal')}</span></div><pre><span class="ps">$ </span><span class="cmd"></span><span class="caret"></span></pre>`; term = { node, pre: node.querySelector('pre') }; await show('term', node); },
    async type(cmd, ms = 1400) { if (!term) return; const c = term.pre.querySelector('.cmd:last-of-type') || term.pre.querySelector('.cmd'); const each = ms / Math.max(1, cmd.length); for (const ch of cmd) { c.textContent += ch; await sleep(each); } },
    async print(text, ms = 900) {
      if (!term) return; const caret = term.pre.querySelector('.caret'); const lines = String(text).replace(/\r/g, '').split('\n'); const each = ms / Math.max(1, lines.length);
      caret.insertAdjacentText('beforebegin', '\n');
      for (const l of lines) { const s = el('span', 'out'); s.textContent = l + '\n'; caret.before(s); term.pre.scrollTop = term.pre.scrollHeight; await sleep(each); }
      const ps = el('span', 'ps'); ps.textContent = '$ '; const cmd = el('span', 'cmd'); caret.before(ps, cmd);
      while (term.pre.scrollHeight > term.pre.clientHeight + 4 && term.pre.firstChild) term.pre.firstChild.remove();
    },
    point(text) { if (!term) return false; term.pre.querySelectorAll('.hit').forEach((h) => h.classList.remove('hit')); const s = [...term.pre.querySelectorAll('.out')].reverse().find((o) => o.textContent.includes(text)); if (s) s.classList.add('hit'); return !!s; },
    async close() { if (!term) return; term = null; await hide(); },
  };

  // ------------------------------------------------------------------ title card
  let title = null;
  Z.title = {
    async open(def) { const node = el('div', 'zk-title'); node.innerHTML = `<h1>${esc(def.title)}</h1><div class="tag">${esc(def.tag || '')}</div>` + def.rows.map((r) => `<div class="row" data-k="${esc(r.key)}"><b>${esc(r.name)}</b><span>${esc(r.what || '')}</span></div>`).join(''); title = node; await show('title', node); },
    reveal(key) { if (!title) return false; const r = title.querySelector(`.row[data-k="${key}"]`); if (r) r.classList.add('on'); return !!r; },
    async close() { if (!title) return; title = null; await hide(); },
  };

  // ------------------------------------------------------------------ helpers used by the director
  Z.find = {
    /** rect (screen px) of the first visible element whose own text contains `text` */
    text(text, sel = '*') {
      const all = document.querySelectorAll(sel); let best = null;
      for (const e of all) {
        if (e.closest('#__zk_host')) continue;
        const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.data).join(' ');
        if (!own.includes(text) && !(e.children.length === 0 && e.textContent.includes(text))) continue;
        const b = e.getBoundingClientRect(); if (b.width < 2 || b.height < 2) continue;
        if (!best || b.width * b.height < best.w * best.h) best = { x: b.left, y: b.top, w: b.width, h: b.height };
      }
      return best;
    },
  };
  Z.spinning = () => [...document.querySelectorAll('.animate-spin')].some((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && !e.closest('button'); }) || /SYNCHRONIZING LIVE|CONNECTING TO CCIT|ENGAGING TECHNICIAN/.test(document.body.innerText);

  const boot = () => { mount(); window.addEventListener('mousemove', onMove, true); window.addEventListener('mousedown', ripple, true); requestAnimationFrame(tick); };
  if (document.documentElement) boot(); else document.addEventListener('DOMContentLoaded', boot);
  new MutationObserver(() => { if (host && !host.isConnected) document.documentElement.appendChild(host); }).observe(document, { childList: true, subtree: false });
})();
