"""Generates the pixel-art SVGs used by the Incident-Zero README.

Run:  python3 tools/readme-art/build.py   (writes into docs/readme-assets/)
Pure stdlib. Text is drawn from a 5x7 bitmap font as <path> rects, so the SVGs
need no web fonts and render identically everywhere (GitHub, VS Code, browsers).
"""
import os, random
from px import *

OUT = os.environ.get("OUT", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "docs", "readme-assets"))
os.makedirs(OUT, exist_ok=True)


def write(name, s):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        f.write(s)
    print(f"{name:20s} {len(s)/1024:6.1f} KB")


def anim_t(kind, values, dur, begin="0s"):
    return (f'<animateTransform attributeName="transform" type="{kind}" values="{values}" '
            f'dur="{dur}s" begin="{begin}" repeatCount="indefinite"/>')


def tog(vals, dur, begin="0s", kt=None):
    n = len(vals.split(";"))
    kt = kt or ";".join(f"{i/(n-1):.3f}" for i in range(n))
    return (f'<animate attributeName="opacity" values="{vals}" keyTimes="{kt}" calcMode="discrete" '
            f'dur="{dur}s" begin="{begin}" repeatCount="indefinite"/>')


def twinkle(el, rnd):
    return (f'<g>{tog("1;0.2;1", rnd.choice([1.6, 2.4, 3.2, 4.0]), f"{rnd.random()*3:.1f}s")}{el}</g>')


def starfield(W, H, rnd, n, y_max=None, cols=(NTXT, SKY, PINK), dim=False):
    out = []
    for _ in range(n):
        el = R(rnd.randrange(8, W - 8, 2), rnd.randrange(8, (y_max or H) - 8, 2), rnd.choice([2, 2, 2, 4]),
               2, "#4A3F8B" if dim else rnd.choice(cols))
        out.append(twinkle(el, rnd) if (not dim and rnd.random() < 0.6) else el)
    return "".join(out)


def walker_bug(color, sc=3, speed=0.35):
    legsA = sprite(BUG_LEGS_A, {"d": INK}, 0, 7 * sc, sc)
    legsB = sprite(BUG_LEGS_B, {"d": INK}, 0, 7 * sc, sc)
    body = sprite(BUG_BODY, {"d": INK, "b": color, "w": CREAM, "k": INK}, 0, 0, sc)
    return f'<g><g>{tog("1;0;1", speed)}{legsA}</g><g>{tog("0;1;0", speed)}{legsB}</g>{body}</g>'


# ====================================================================== BANNER
def banner():
    W, H = 900, 372
    b = []
    bands = [(0, 70, "#1E1646"), (70, 130, "#231A52"), (130, 185, "#291F5E"), (185, 235, "#2F2468"), (235, 290, "#32266E")]
    for y0, y1, c in bands:
        b.append(R(0, y0, W, y1 - y0, c))
    for i in range(1, len(bands)):                       # retro dither between sky bands
        y, c = bands[i][0], bands[i][2]
        b.append(f'<path fill="{c}" d="{"".join(f"M{x} {y-6}h6v6h-6z" for x in range(0, W, 12))}"/>')
    rnd = random.Random(11)
    for _ in range(70):
        el = R(rnd.randrange(8, W - 8, 2), rnd.randrange(8, 200, 2), rnd.choice([2, 2, 2, 4]),
               2, rnd.choice([NTXT, NTXT, SKY, PINK, CHK]))
        el = el.replace('height="2"', 'height="%d"' % (4 if 'width="4"' in el else 2))
        b.append(twinkle(el, rnd) if rnd.random() < 0.65 else el)
    for (x, y) in [(262, 22), (330, 40), (610, 30), (868, 26)]:      # plus-shaped stars
        b.append(f'<g>{tog("1;0.2;1", 2.8, f"{rnd.random()*2:.1f}s")}{R(x-2,y-6,4,14,NTXT)}{R(x-6,y-2,14,4,NTXT)}</g>')
    mx, my, cell, rr = 770, 62, 6, 5                                  # moon
    craters = {(-2, -1), (1, 2), (2, -2), (-1, 3)}
    for dy in range(-rr, rr + 1):
        for dx in range(-rr, rr + 1):
            if dx * dx + dy * dy <= rr * rr + 1:
                b.append(R(mx + dx * cell, my + dy * cell, cell, cell, "#E6D48C" if (dx, dy) in craters else NTXT))

    gy = 272

    def win(x, y, w, h, cols, rows, seed, lit="#FFE680", dark="#1E1646", p=0.55):
        r_ = random.Random(seed)
        out = []
        cw, ch = w / cols, h / rows
        ww, wh = max(4, int(cw * 0.5) // 2 * 2), max(4, int(ch * 0.5) // 2 * 2)
        for r in range(rows):
            for c in range(cols):
                wx = int(x + c * cw + (cw - ww) / 2) // 2 * 2
                wy = int(y + r * ch + (ch - wh) / 2) // 2 * 2
                on = r_.random() < p
                el = R(wx, wy, ww, wh, lit if on else dark)
                if on and r_.random() < 0.22:
                    el = f'<g>{tog("1;0.2;1", r_.choice([2.2, 3.1, 4.3]), f"{r_.random()*3:.1f}s")}{el}</g>'
                out.append(el)
        return "".join(out)

    # campus landmarks (Auditorium, F-Block, Valmiki Bhawan, Block-G Library)
    ax, aw, ah = 22, 170, 50
    b.append(R(ax, gy - ah, aw, ah, "#7A3550") + R(ax, gy - ah, aw, 6, "#8E4262"))
    for i in range(6):
        w_ = aw - i * 28
        b.append(R(ax + (aw - w_) // 2, gy - ah - 6 * (i + 1), w_, 6, "#6B2F4A" if i % 2 else "#7A3550"))
    b.append(win(ax + 8, gy - ah + 10, aw - 16, ah - 20, 7, 2, 3) + R(ax + aw // 2 - 8, gy - 18, 16, 18, DEEP))
    fx, fw, fh = 222, 200, 58
    b.append(R(fx, gy - fh, fw, fh, "#8A5A3C") + R(fx, gy - fh, fw, 6, "#A06A46"))
    b.append(R(fx + fw // 2 - 24, gy - fh - 18, 48, 18 + fh, "#E8D6A0"))
    for i in range(3):
        w_ = 48 - i * 14
        b.append(R(fx + fw // 2 - w_ // 2, gy - fh - 18 - 6 * (i + 1), w_, 6, "#E8D6A0" if i < 2 else "#C9B57A"))
    b.append(win(fx + 6, gy - fh + 12, fw // 2 - 36, fh - 22, 3, 2, 5) + win(fx + fw // 2 + 30, gy - fh + 12, fw // 2 - 36, fh - 22, 3, 2, 6))
    b.append(R(fx + fw // 2 - 8, gy - 22, 16, 22, DEEP))
    vx, vw, vh = 452, 170, 74
    b.append(R(vx, gy - vh, vw, vh, "#5B6C9A") + R(vx, gy - vh, vw, 6, "#7486B4"))
    for fl in range(1, 4):
        b.append(R(vx, gy - vh + fl * 18, vw, 2, "#4A5A86"))
    b.append(win(vx + 6, gy - vh + 8, vw - 12, vh - 14, 8, 4, 8, p=0.5))

    def tree(x):
        t = R(x + 8, gy - 10, 4, 10, "#4B3320")
        for i, w_ in enumerate([8, 16, 24]):
            t += R(x + 10 - w_ // 2, gy - 34 + i * 8, w_, 8, "#2E7D4F" if i % 2 == 0 else "#3A9460")
        return t
    b.append(tree(432) + tree(628))
    lx, lw, lh = 656, 222, 54
    b.append(R(lx, gy - lh, lw, lh, "#B08A5A") + R(lx, gy - lh, lw, 6, "#C49C68"))
    for px_ in range(lx + 14, lx + lw - 10, 38):
        b.append(R(px_, gy - lh + 6, 10, lh - 6, "#D0603A"))
    for i, w_ in enumerate([150, 110, 70]):
        b.append(R(lx + (lw - w_) // 2, gy - lh - 8 * (i + 1), w_, 8, "#C0583A" if i % 2 == 0 else "#D0703F"))
    b.append(win(lx + 26, gy - lh + 10, lw - 52, lh - 24, 6, 2, 9, p=0.5) + R(lx + lw // 2 - 10, gy - 20, 20, 20, DEEP))

    # ground
    b.append(R(0, gy, W, 8, GRN))
    b.append(f'<path fill="{LIME}" d="{"".join(f"M{x} {gy}h6v4h-6z" for x in range(0, W, 24))}"/>')
    tiles = "".join(f"M{i*20} {gy+8+j*20}h20v20h-20z" for j in range(3) for i in range(W // 20) if (i + j) % 2)
    b.append(R(0, gy + 8, W, 60, "#2A1F5C") + f'<path fill="{SLATE}" d="{tiles}"/>')

    # title
    sc = 9
    x0 = (W - tw("REACH ZERO", sc)) // 2
    zx = x0 + 6 * 6 * sc
    b.append(text("REACH", x0 + 9, 61, sc, DEEP) + text("ZERO", zx + 9, 61, sc, DEEP))
    b.append(text("REACH", x0, 52, sc, BUTTER) + text("ZERO", zx, 52, sc, GRN))
    s1, s2, sc2 = "AI PROPOSES", "THE DOMAIN DISPOSES", 3
    gap = 30
    sx = (W - (tw(s1, sc2) + gap * 2 + 6 + tw(s2, sc2))) // 2
    b.append(text(s1, sx + 3, 133, sc2, DEEP) + text(s1, sx, 130, sc2, SKY))
    dx = sx + tw(s1, sc2) + gap
    b.append(R(dx, 136, 6, 6, NTXT))
    x3 = dx + 6 + gap
    b.append(text(s2, x3 + 3, 133, sc2, DEEP) + text(s2, x3, 130, sc2, GRN))
    b.append(blink(ctext("PRESS START", W // 2, 166, 3, NTXT), 1.1))
    b.append(heart(W // 2 - 140, 166, 3) + heart(W // 2 + 119, 166, 3))

    # HUD
    b.append(text("HI-SCORE", 24, 14, 2, RED) + text("554590", 24, 34, 3, NTXT) + text("OPEN BUGS 03", 24, 66, 2, SKY))
    b.append(text("SLA", 640, 14, 2, PINK))
    for i in range(5):
        h_ = heart(640 + i * 28, 34, 3)
        b.append(blink(h_, 0.7) if i == 4 else h_)

    # critters
    base = 330
    tsc = 4
    legsA, legsB = sprite(TECH_LEGS_A, TECH_PAL, 0, 10 * tsc, tsc), sprite(TECH_LEGS_B, TECH_PAL, 0, 10 * tsc, tsc)
    wrench = sprite(WRENCH, WRENCH_PAL, -2 * 3, -7 * 3, 3)
    tech = (f'<g transform="translate(0,{base - 13*tsc})"><g>'
            f'<g>{tog("1;0;1", 0.3)}{legsA}</g><g>{tog("0;1;0", 0.3)}{legsB}</g>{sprite(TECH, TECH_PAL, 0, 0, tsc)}'
            f'<g transform="translate(34,28)"><g>{anim_t("rotate", "-70;40;-70", 0.6)}{wrench}</g></g>'
            f'{anim_t("translate", "0,0;0,-3;0,0", 0.3)}</g></g>')
    b.append(f'<g>{anim_t("translate", "-70,0;960,0", 14)}{tech}</g>')
    b.append(f'<g transform="translate(520,{base - 24})"><g>{tog("1;0;1", 14, kt="0;0.52;0.96")}{walker_bug(RED)}</g></g>')
    b.append(f'<g transform="translate(518,{base - 11})"><g>{tog("0;1;0", 14, kt="0;0.52;0.60")}'
             f'{sprite(BUG_BODY[3:6], {"d": INK, "b": RED, "w": CREAM, "k": INK}, 0, 0, 3)}</g></g>')
    b.append(f'<g><g>{tog("0;1;0", 14, kt="0;0.52;0.66")}{text("+100", 512, base - 76, 2, LIME)}</g></g>')
    for col, y, dur, d, beg in [(RED, base - 22, 17, -1, -3), (SKY, base - 18, 21, 1, -9), (PURP, base - 26, 25, -1, -15)]:
        vals = "960,0;-60,0" if d < 0 else "-60,0;960,0"
        b.append(f'<g transform="translate(0,{y})"><g>{anim_t("translate", vals, dur, f"{beg}s")}{walker_bug(col)}</g></g>')

    # marquee
    b.append(R(0, 340, W, 32, DEEP) + R(0, 340, W, 2, GRN))
    msg = "CAMPUS IT SERVICE DESK  \u00b7  BITS PILANI HYDERABAD  \u00b7  REPORT > CLASSIFY > PRIORITIZE > ASSIGN > INVESTIGATE > RESOLVE > VERIFY > CLOSE  \u00b7  "
    mw = tw(msg, 2) + 12
    defs = f'<defs><g id="mq">{text(msg, 0, 351, 2, NTXT)}</g></defs>'
    b.append(f'<g>{anim_t("translate", f"0,0;-{mw},0", 38)}<use href="#mq" xlink:href="#mq"/><use href="#mq" xlink:href="#mq" x="{mw}"/></g>')
    b.append(frame(W, H, BUTTER, 4))
    return svg(W, H, "".join(b), "Incident-Zero pixel-art banner: a technician squashes bugs over the campus at night", defs)


# ====================================================================== SCOREBOARD
def scoreboard():
    W, H = 900, 404
    b = [R(0, 0, W, H, NIGHT), starfield(W, H, random.Random(2), 40, dim=True)]
    b.append(ctext("- SCOREBOARD -", W // 2, 20, 3, BUTTER))
    tiles = [("10", "LIFECYCLE", "STATES", GRN, INK), ("7", "ASSIGNMENT", "STRATEGIES", SKY, INK),
             ("6", "AI FEATURES", "IN TIER A", PINK, INK), ("19", "CAMPUS", "SERVICES", ORANGE, INK),
             ("9", "ARCHUNIT", "RULES R1-R9", PURP, CREAM), ("15", "DECISION", "RECORDS", CHK, INK)]
    tw_, th_, gx, gy_ = 270, 100, 15, 15
    for i, (n, l1, l2, col, tc) in enumerate(tiles):
        cx, cy = 30 + (i % 3) * (tw_ + gx), 64 + (i // 3) * (th_ + gy_)
        b.append(box(cx, cy, tw_, th_, col, INK, 4, 6, DEEP))
        b.append(text(n, cx + 20, cy + 22, 8, tc))
        nx = cx + 20 + tw(n, 8) + 22
        b.append(R(nx - 11, cy + 14, 3, th_ - 28, tc, ' opacity="0.35"'))
        b.append(text(l1, nx, cy + 32, 2, tc) + text(l2, nx, cy + 54, 2, tc))
    by = 64 + 2 * (th_ + gy_)
    b.append(box(30, by, 840, 84, DEEP, BUTTER, 4, 6, "#000000"))
    b.append(text("554,590", 56, by + 22, 6, GRN))
    b.append(R(56 + tw("554,590", 6) + 18, by + 16, 3, 52, BUTTER, ' opacity="0.5"'))
    lx = 56 + tw("554,590", 6) + 40
    b.append(text("STATE TRANSITIONS VERIFIED", lx, by + 22, 2, NTXT))
    b.append(text("24 CHECKS PASSED", lx, by + 44, 2, GRN) + text("0 FAILED", lx + tw("24 CHECKS PASSED  ", 2), by + 44, 2, NTXT))
    b.append(blink(text("HI-SCORE", 752, by + 14, 2, RED), 1.2) + text("VERIFY-M1", 752, by + 40, 2, SKY))
    b.append(frame(W, H, BUTTER, 4))
    return svg(W, H, "".join(b), "Incident-Zero scoreboard of key project numbers")


# ====================================================================== AI PROPOSES / DOMAIN DISPOSES
def ai_proposes():
    W, H = 900, 350
    b = [checker(W, H, BUTTER, CHK, 20)]
    b.append(box(30, 36, 300, 200, SKY, INK, 4, 8, INK) + text("AI PROPOSES", 46, 52, 3, INK))
    for i, l in enumerate(["CANDIDATE VALUE", "+ CONFIDENCE", "+ PROVENANCE", "+ RULES FALLBACK"]):
        b.append(text(l, 46, 108 + i * 24, 2, INK))
    b.append(f'<g>{anim_t("translate", "0,0;0,-6;0,0", 1.2)}{sprite(ROBOT, {"d": INK, "b": CREAM, "w": CREAM, "k": INK}, 262, 150, 5)}</g>')
    b.append(box(570, 36, 300, 200, GRN, INK, 4, 8, INK) + text("DOMAIN DISPOSES", 586, 52, 3, INK))
    for i, l in enumerate(["LIFECYCLE STATE", "PRIORITY + SLA MATH", "AUTHORIZATION", "THE AUDIT LOG"]):
        b.append(text(l, 586, 108 + i * 24, 2, INK))
    b.append(f'<g>{anim_t("translate", "0,0;0,-4;0,0", 1.6)}{sprite(SHIELD, {"d": INK, "G": CREAM, "k": INK}, 806, 156, 5)}</g>')
    b.append(R(336, 142, 228, 4, INK, ' opacity="0.25"'))
    b.append(f'<g>{anim_t("translate", "342,128;502,128", 2.2)}{R(0,0,60,30,INK)}{R(4,4,52,22,CREAM)}{text("SUG", 13, 8, 2, INK)}</g>')
    b.append(ctext("SUGGESTION<T>", 450, 184, 2, INK) + ctext("NEVER A COMMAND", 450, 206, 2, SOFT))
    b.append(ctext("EVERY INTELLIGENT FEATURE SHIPS WITH", W // 2, 262, 2, INK))
    chips = [("RULES BASELINE", CREAM), ("AI UPGRADE", SKY), ("AUTO FALLBACK", ORANGE), ("A METRIC", LIME)]
    cw = 190
    for i, (l, col) in enumerate(chips):
        x = 31 + i * (cw + 26)
        b.append(box(x, 288, cw, 40, col, INK, 4, 4, INK) + ctext(l, x + cw // 2, 301, 2, INK))
        if i < 3:
            b.append(arrow_r(x + cw + 4, 306, 4, INK, 2))
    b.append(frame(W, H, INK, 6))
    return svg(W, H, "".join(b), "AI proposes, the deterministic domain core disposes")


# ====================================================================== CARTRIDGES
def cartridges():
    W, H = 900, 330
    b = [R(0, 0, W, H, NIGHT), starfield(W, H, random.Random(5), 46)]
    b.append(ctext("INSERT A CARTRIDGE", W // 2, 14, 3, BUTTER))
    carts = [("ROM 00", "STAGE", "/STAGE", SKY, "bug"), ("ROM 01", "PORTAL", "/PORTAL", GRN, "bubble"),
             ("ROM 02", "WORKBENCH", "/WORKBENCH", PURP, "gear"), ("ROM 03", "ADMIN", "/ADMIN", ORANGE, "shield"),
             ("ROM 04", "SPECS", "/SPECS", PINK, "scroll")]
    cw, ch, gap = 150, 208, 22
    for i, (rom, name, route, col, ic) in enumerate(carts):
        x, y = 31 + i * (cw + gap), 60
        g = [R(x + 8, y + 8, cw, ch, DEEP), R(x, y, cw, ch, DEEP), R(x + 4, y + 4, cw - 8, ch - 8, col)]
        for k in range(3):                                      # chamfered top corners
            g.append(R(x, y + k * 4, (3 - k) * 4, 4, NIGHT) + R(x + cw - (3 - k) * 4, y + k * 4, (3 - k) * 4, 4, NIGHT))
        g += [R(x + 16, y + 12 + r * 8, 48, 4, DEEP, ' opacity="0.35"') for r in range(4)]
        g += [R(x + 14, y + 52, cw - 28, 100, DEEP), R(x + 18, y + 56, cw - 36, 92, CREAM), ctext(rom, x + cw // 2, y + 64, 2, SOFT)]
        icon = {"bug": (BUG_BODY + BUG_LEGS_A, 9), "bubble": (BUBBLE, 9), "gear": (GEAR, 8), "shield": (SHIELD, 10), "scroll": (SCROLL, 9)}[ic]
        pal = {"d": INK, "b": col, "w": CREAM, "k": INK, "g": col} if ic != "shield" else {"d": INK, "G": GRN, "k": INK}
        g.append(sprite(icon[0], pal, x + cw // 2 - icon[1] * 2, y + 86, 4))
        g.append(ctext(name, x + cw // 2, y + 128, 2, INK))
        g.append(R(x + 20, y + ch - 30, cw - 40, 26, DEEP))
        g += [R(x + 26 + p * 10, y + ch - 24, 6, 18, CHK) for p in range(10)]
        b.append(f'<g>{anim_t("translate", "0,0;0,-8;0,0", 2.4, f"{i*0.35:.2f}s")}{"".join(g)}</g>')
        b.append(ctext(route, x + cw // 2, y + ch + 22, 2, NTXT))
    b.append(frame(W, H, BUTTER, 4))
    return svg(W, H, "".join(b), "Five swappable ROM cartridges: Stage, Portal, Workbench, Admin, Specs")


# ====================================================================== LIFECYCLE
def lifecycle():
    W, H = 900, 520
    b = [checker(W, H, BUTTER, CHK, 20), ctext("THE 10-STATE LEVEL MAP", W // 2, 20, 3, INK)]
    nw, nh = 180, 66
    c = [30, 250, 470, 690]
    r1, r2, r3 = 76, 216, 368
    N = {"NEW": (c[0], r1, RED, INK), "CLASSIFIED": (c[1], r1, ORANGE, INK), "ASSIGNED": (c[2], r1, CHK, INK),
         "ACKNOWLEDGED": (c[3], r1, SKY, INK), "IN_PROGRESS": (c[3], r2, PURP, CREAM), "RESOLVED": (c[2], r2, LIME, INK),
         "VERIFIED": (c[1], r2, GRN, INK), "CLOSED": (c[0], r2, INK, CREAM),
         "PENDING_USER": (c[3], r3, PINK, INK), "REOPENED": (c[2], r3, RED, INK)}
    A = []
    for i in range(3):                                           # row 1  ->
        A.append(arrow_r(c[i] + nw + 6, r1 + nh // 2 - 2, 4, INK, 4))
    A.append(arrow_d(c[3] + nw // 2 - 2, r1 + nh + 8, 4, INK, 11))   # ACK -> IN_PROGRESS
    for i in (3, 2, 1):                                          # row 2  <-
        A.append(arrow_l(c[i] - 34, r2 + nh // 2 - 2, 4, INK, 4))
    A.append(arrow_d(c[2] + 32, r2 + nh + 8, 4, INK, 14))        # RESOLVED -> REOPENED
    ey = r2 + nh + 40
    A.append(R(c[2] + nw - 36, ey, 4, r3 - ey, INK) + R(c[2] + nw - 36, ey, c[3] + 34 - (c[2] + nw - 36) + 4, 4, INK))
    A.append(arrow_u(c[3] + 34, r2 + nh + 6, 4, INK, 6))         # REOPENED -> IN_PROGRESS
    A.append(arrow_d(c[3] + 76, r2 + nh + 8, 4, INK, 14))        # IN_PROGRESS <-> PENDING_USER
    A.append(arrow_u(c[3] + 126, r2 + nh + 8, 4, INK, 14))
    b.append("".join(A))
    for name, (x, y, col, tc) in N.items():
        b.append(box(x, y, nw, nh, col, INK, 4, 6, INK) + ctext(name, x + nw // 2, y + 12, 2, tc))
    order = ["NEW", "CLASSIFIED", "ASSIGNED", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "VERIFIED", "CLOSED"]
    for i, n in enumerate(order):
        x, y = N[n][0], N[n][1]
        b.append(R(x - 2, y - 14, 38, 20, INK) + text(f"{i+1:02d}", x + 3, y - 10, 2, CHK))
    b.append(text("REPORTER REJECTS", c[2], r3 + nh + 14, 2, SOFT) + text("PAUSES THE CLOCK", c[3], r3 + nh + 14, 2, SOFT))
    b.append(box(30, r3 - 8, 400, 120, CREAM, INK, 4, 6, INK))
    b.append(text("ILLEGAL MOVE?", 46, r3 + 6, 2, RED) + text("HTTP 409 + ALLOWEDCOMMANDS", 46, r3 + 30, 2, INK))
    for i, l in enumerate(["UI BUTTONS ARE BUILT FROM", "THE ALLOWED LIST. NO BUTTON,", "NO ILLEGAL ACTION."]):
        b.append(text(l, 46, r3 + 54 + i * 18, 2, SOFT))
    bx = lambda i: c[i] + nw // 2 - 13
    path = f"M{bx(0)},{r1+34} L{bx(3)},{r1+34} L{bx(3)},{r2+34} L{bx(0)},{r2+34}"
    b.append(f'<g><animateMotion path="{path}" dur="10s" repeatCount="indefinite" calcMode="linear"/>'
             f'<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.9;0.93;1" dur="10s" repeatCount="indefinite"/>'
             f'{walker_bug(RED, 3)}</g>')
    cx_, cy_ = N["CLOSED"][0], N["CLOSED"][1]
    b.append(f'<g>{tog("0;1;0", 10, kt="0;0.93;1")}{sprite(STAR, {"d": INK, "y": CHK}, cx_ + nw - 48, cy_ + 32, 4)}{text("CLEAR!", cx_ + 20, cy_ + 38, 2, CHK)}</g>')
    b.append(frame(W, H, INK, 6))
    return svg(W, H, "".join(b), "Incident lifecycle as a game level map with ten states")


# ====================================================================== ARCHITECTURE
def architecture():
    W, H = 900, 746
    b = [checker(W, H, BUTTER, CHK, 20), ctext("HEXAGONAL MODULAR MONOLITH", W // 2, 20, 3, INK)]
    LX, LW = 30, 500
    b.append(box(LX, 62, LW, 64, SKY, INK, 4, 6, INK) + text("REACT 19 PWA", LX + 16, 86, 2, INK))
    cx = LX + 176
    for t in ["/PORTAL", "/WORKBENCH", "/ADMIN"]:
        w = tw(t, 2) + 16
        b.append(R(cx, 80, w, 28, INK) + R(cx + 3, 83, w - 6, 22, CREAM) + text(t, cx + 8, 87, 2, INK))
        cx += w + 8
    mid = LX + LW // 2 - 2
    b.append(arrow_d(mid, 134, 4, INK, 4) + text("REST + SSE", mid + 24, 142, 2, SOFT))
    b.append(box(LX, 168, LW, 62, CREAM, INK, 4, 6, INK) + text("INFRASTRUCTURE.WEB", LX + 16, 182, 2, INK)
             + text("CONTROLLERS \u00b7 SSE HUB \u00b7 SECURITY", LX + 16, 204, 2, SOFT))
    b.append(arrow_d(mid, 240, 4, INK, 4))
    b.append(box(LX, 272, LW, 62, CREAM, INK, 4, 6, INK) + text("APPLICATION", LX + 16, 286, 2, INK)
             + text("USE CASES \u00b7 INTAKE PIPELINE \u00b7 STRATEGIES", LX + 16, 308, 2, SOFT))
    b.append(arrow_d(mid, 344, 4, INK, 4))
    b.append(box(LX, 376, LW, 150, GRN, INK, 6, 8, INK) + text("DOMAIN", LX + 20, 394, 4, INK))
    b.append(f'<g>{anim_t("translate", "0,0;0,-4;0,0", 1.6)}{sprite(SHIELD, {"d": INK, "G": CREAM, "k": INK}, LX + LW - 76, 388, 5)}</g>')
    b.append(text("AGGREGATES \u00b7 SEALED STATES", LX + 20, 436, 2, INK) + text("VALUE OBJECTS \u00b7 EVENTS \u00b7 PORTS", LX + 20, 458, 2, INK))
    b.append(R(LX + 20, 484, LW - 40, 28, INK) + ctext("ZERO FRAMEWORK IMPORTS (ARCHUNIT)", LX + LW // 2, 491, 2, LIME))
    RX, RW = 620, 250
    b.append(box(RX, 272, RW, 254, CREAM, INK, 4, 6, INK) + text("ADAPTERS", RX + 16, 286, 3, INK))
    for i, (l, col) in enumerate([("JPA + PGVECTOR", SKY), ("SMTP \u00b7 PUSH \u00b7 SSE", PINK), ("AI: ONNX + LLM", PURP), ("TIMERS + OUTBOX", ORANGE)]):
        y = 326 + i * 48
        b.append(R(RX + 16, y, RW - 32, 36, INK) + R(RX + 20, y + 4, RW - 40, 28, col)
                 + ctext(l, RX + RW // 2, y + 11, 2, CREAM if col == PURP else INK))
    b.append(arrow_l(544, 446, 4, INK, 15) + text("PORTS", 556, 420, 2, INK))
    b.append(ctext("DEPENDENCIES POINT INWARD", W // 2, 552, 2, INK))
    b.append(ctext("11 BOUNDED CONTEXTS \u00b7 SPRING MODULITH VERIFIED IN CI", W // 2, 590, 2, INK))
    mods = ["IDENTITY", "CATALOG", "INCIDENT", "SLA", "ASSIGNMENT", "INTAKE", "INTELLIGENCE", "KNOWLEDGE", "NOTIFICATION", "AUDIT", "REPORTING"]
    cols_ = [SKY, LIME, RED, ORANGE, CHK, PINK, PURP, GRN, SKY, CHK, LIME]
    cw, chh = 200, 28
    for i, m in enumerate(mods):
        r_, c_ = divmod(i, 4)
        x, y = 29 + c_ * (cw + 14), 620 + r_ * (chh + 8)
        b.append(R(x, y, cw, chh, INK) + R(x + 3, y + 3, cw - 6, chh - 6, CREAM) + R(x + 3, y + 3, 10, chh - 6, cols_[i]) + text(m, x + 24, y + 7, 2, INK))
    b.append(frame(W, H, INK, 6))
    return svg(W, H, "".join(b), "Hexagonal architecture: web, application, domain core, adapters, and eleven modules")


# ====================================================================== HASH CHAIN
def hashchain():
    W, H = 900, 330
    b = [R(0, 0, W, H, NIGHT), starfield(W, H, random.Random(9), 40, dim=True)]
    b.append(ctext("TAMPER-EVIDENT AUDIT LEDGER", W // 2, 18, 3, BUTTER))
    bw, gap, y0, bh = 140, 40, 108, 124
    hashes = ["7F3A", "C91E", "52B0", "A07D", "E4C6"]
    bx = [20 + i * (bw + gap) for i in range(5)]
    for i, x in enumerate(bx):
        bad, broken = i == 2, i >= 3
        g = box(x, y0, bw, bh, CREAM, RED if bad else BUTTER, 4, 6, DEEP)
        g += R(x + 4, y0 + 4, bw - 8, 26, RED if bad else SOFT) + ctext(f"BLOCK {i+1:02d}", x + bw // 2, y0 + 11, 2, CREAM)
        g += text("PREV", x + 14, y0 + 44, 2, SOFT) + text(hashes[i - 1] if i else "0000", x + 74, y0 + 44, 2, INK)
        g += text("DATA", x + 14, y0 + 66, 2, SOFT) + R(x + 74, y0 + 68, 40, 8, INK, ' opacity="0.5"')
        g += text("HASH", x + 14, y0 + 88, 2, SOFT) + text("????" if bad else hashes[i], x + 74, y0 + 88, 2, RED if bad else ORANGE if broken else GRN)
        b.append(f'<g>{tog("1;0.45;1", 0.9)}{g}</g>' if bad else g)
        if i < 4:
            lx = x + bw + 4
            if i < 2:
                b.append(R(lx, y0 + 56, gap - 8, 8, GRN) + R(lx + 4, y0 + 52, 8, 16, GRN) + R(lx + gap - 20, y0 + 52, 8, 16, GRN))
            else:
                b.append(f'<g>{tog("1;0;1", 0.9)}{R(lx, y0 + 56, 8, 8, RED)}{R(lx + gap - 16, y0 + 56, 8, 8, RED)}</g>')
    vals = ";".join(f"{x + bw // 2 - 42},{y0 - 52}" for x in bx[:3])
    b.append(f'<g><animateTransform attributeName="transform" type="translate" values="{vals}" keyTimes="0;0.2;0.4" '
             f'calcMode="discrete" dur="6s" repeatCount="indefinite"/>'
             f'{R(0,0,84,26,SKY)}{R(3,3,78,20,DEEP)}{text("VERIFY",6,6,2,SKY)}'
             f'{R(32,26,20,4,SKY)}{R(36,30,12,4,SKY)}{R(40,34,4,4,SKY)}</g>')
    b.append(blink(text("TAMPERED!", bx[2] + 14, y0 + bh + 18, 2, RED), 0.9) + text("BROKEN CHAIN", bx[3] + 6, y0 + bh + 18, 2, ORANGE))
    b.append(box(20, 276, 860, 40, DEEP, BUTTER, 4, 0, DEEP))
    b.append(text("HASH = SHA-256(PREV + DATA)", 36, 288, 2, NTXT) + text("ROW-LOCKED INDEX \u00b7 OFF-DB ANCHOR", 420, 288, 2, GRN))
    b.append(frame(W, H, BUTTER, 4))
    return svg(W, H, "".join(b), "SHA-256 hash-chained audit ledger where tampering with one block breaks the chain")


# ====================================================================== DIVIDER
def divider():
    W, H = 900, 40
    d1 = "".join(f"M{x} 22h12v12h-12z" for x in range(0, W, 24))
    d2 = "".join(f"M{x} 22h12v12h-12z" for x in range(12, W, 24))
    b = [f'<path fill="{PURP}" d="{d1}"/><path fill="{SKY}" d="{d2}"/>',
         f'<path fill="{INK}" opacity="0.25" d="{"".join(f"M{x} 34h12v4h-12z" for x in range(0, W, 12))}"/>',
         f'<g transform="translate(0,-2)">{anim_t("translate", "-40,0;930,0", 9)}{walker_bug(RED, 2, 0.3)}</g>',
         f'<g transform="translate(0,-2)">{anim_t("translate", "930,0;-40,0", 13, "-5s")}{walker_bug(SKY, 2, 0.3)}</g>']
    return svg(W, H, "".join(b), "pixel divider with crawling bugs")


# ====================================================================== FOOTER
def footer():
    W, H = 900, 190
    b = [R(0, 0, W, H, NIGHT), starfield(W, H, random.Random(21), 40)]
    sc = 6
    x = (W - tw("OPEN BUGS 00", sc)) // 2
    b.append(text("OPEN BUGS 00", x + 6, 42, sc, DEEP) + text("OPEN BUGS ", x, 36, sc, BUTTER))
    b.append(text("00", x + tw("OPEN BUGS ", sc) + sc, 36, sc, GRN))
    b += [heart(W // 2 - 75 + i * 30, 100, 4) for i in range(5)]
    b.append(blink(ctext("THANKS FOR PLAYING \u00b7 INSERT COIN TO CONTINUE", W // 2, 150, 2, NTXT), 1.2))
    b.append(frame(W, H, BUTTER, 4))
    return svg(W, H, "".join(b), "Open bugs: zero. Thanks for playing.")


if __name__ == "__main__":
    for n, f in [("banner", banner), ("scoreboard", scoreboard), ("ai-proposes", ai_proposes), ("cartridges", cartridges),
                 ("lifecycle", lifecycle), ("architecture", architecture), ("hash-chain", hashchain),
                 ("divider", divider), ("footer", footer)]:
        write(f"{n}.svg", f())
