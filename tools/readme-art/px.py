"""Tiny pixel-art SVG toolkit: 5x7 bitmap font rendered as rects, sprites, boxes."""
import random

# ---- Incident-Zero palette (from DESIGN.md) ----
INK = "#1B1530"; SOFT = "#4A3F6B"; BUTTER = "#FFE680"; CHK = "#FFDD5E"; CREAM = "#FFF8DC"
RED = "#FF4D3D"; SKY = "#59C9F5"; GRN = "#43D17A"; LIME = "#7CE356"; PURP = "#7C5CFF"
ORANGE = "#FF9F43"; PINK = "#FF8AD0"
NIGHT = "#1E1646"; SLATE = "#32266E"; NTXT = "#FFF3C4"; DEEP = "#0B0722"

# ---------------------------------------------------------------- font
_F = {}
def _g(ch, *rows):
    _F[ch] = rows

_g(' ', ".....", ".....", ".....", ".....", ".....", ".....", ".....")
_g('A', ".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#")
_g('B', "####.", "#...#", "#...#", "####.", "#...#", "#...#", "####.")
_g('C', ".###.", "#...#", "#....", "#....", "#....", "#...#", ".###.")
_g('D', "####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####.")
_g('E', "#####", "#....", "#....", "####.", "#....", "#....", "#####")
_g('F', "#####", "#....", "#....", "####.", "#....", "#....", "#....")
_g('G', ".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".###.")
_g('H', "#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#")
_g('I', ".###.", "..#..", "..#..", "..#..", "..#..", "..#..", ".###.")
_g('J', "..###", "...#.", "...#.", "...#.", "...#.", "#..#.", ".##..")
_g('K', "#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#")
_g('L', "#....", "#....", "#....", "#....", "#....", "#....", "#####")
_g('M', "#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#")
_g('N', "#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#")
_g('O', ".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###.")
_g('P', "####.", "#...#", "#...#", "####.", "#....", "#....", "#....")
_g('Q', ".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#")
_g('R', "####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#")
_g('S', ".####", "#....", "#....", ".###.", "....#", "....#", "####.")
_g('T', "#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#..")
_g('U', "#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###.")
_g('V', "#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#..")
_g('W', "#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#")
_g('X', "#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#")
_g('Y', "#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#..")
_g('Z', "#####", "....#", "...#.", "..#..", ".#...", "#....", "#####")
_g('0', ".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###.")
_g('1', "..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###.")
_g('2', ".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####")
_g('3', "####.", "....#", "....#", ".###.", "....#", "....#", "####.")
_g('4', "...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#.")
_g('5', "#####", "#....", "####.", "....#", "....#", "#...#", ".###.")
_g('6', ".###.", "#....", "#....", "####.", "#...#", "#...#", ".###.")
_g('7', "#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#...")
_g('8', ".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###.")
_g('9', ".###.", "#...#", "#...#", ".####", "....#", "....#", ".###.")
_g('.', ".....", ".....", ".....", ".....", ".....", ".##..", ".##..")
_g(',', ".....", ".....", ".....", ".....", "..#..", "..#..", ".#...")
_g(':', ".....", ".##..", ".##..", ".....", ".##..", ".##..", ".....")
_g('-', ".....", ".....", ".....", "#####", ".....", ".....", ".....")
_g('_', ".....", ".....", ".....", ".....", ".....", ".....", "#####")
_g('/', "....#", "....#", "...#.", "..#..", ".#...", "#....", "#....")
_g('%', "##..#", "##..#", "...#.", "..#..", ".#...", "#..##", "#..##")
_g('+', ".....", "..#..", "..#..", "#####", "..#..", "..#..", ".....")
_g('!', "..#..", "..#..", "..#..", "..#..", "..#..", ".....", "..#..")
_g('?', ".###.", "#...#", "....#", "...#.", "..#..", ".....", "..#..")
_g('>', "#....", ".#...", "..#..", "...#.", "..#..", ".#...", "#....")
_g('<', "....#", "...#.", "..#..", ".#...", "..#..", "...#.", "....#")
_g('=', ".....", ".....", "#####", ".....", "#####", ".....", ".....")
_g('#', ".#.#.", ".#.#.", "#####", ".#.#.", "#####", ".#.#.", ".#.#.")
_g('(', "...#.", "..#..", ".#...", ".#...", ".#...", "..#..", "...#.")
_g(')', ".#...", "..#..", "...#.", "...#.", "...#.", "..#..", ".#...")
_g('*', ".....", "#.#.#", ".###.", "#####", ".###.", "#.#.#", ".....")
_g("'", "..#..", "..#..", ".#...", ".....", ".....", ".....", ".....")
_g('\u00b7', ".....", ".....", ".....", "..#..", ".....", ".....", ".....")


def tw(s, sc, gap=1):
    """pixel width of a string"""
    return len(s) * (5 + gap) * sc - gap * sc


def text(s, x, y, sc, fill, gap=1, extra=""):
    s = s.upper()
    W = len(s) * (5 + gap)
    grid = [[0] * W for _ in range(7)]
    for i, ch in enumerate(s):
        g = _F.get(ch, _F['?'])
        for r in range(7):
            for c in range(5):
                if g[r][c] == '#':
                    grid[r][i * (5 + gap) + c] = 1
    d = []
    for r in range(7):
        c = 0
        while c < W:
            if grid[r][c]:
                c0 = c
                while c < W and grid[r][c]:
                    c += 1
                d.append(f"M{x + c0 * sc} {y + r * sc}h{(c - c0) * sc}v{sc}h-{(c - c0) * sc}z")
            else:
                c += 1
    return f'<path fill="{fill}" d="{"".join(d)}"{extra}/>'


def ctext(s, cx, y, sc, fill, gap=1, extra=""):
    return text(s, int(cx - tw(s, sc, gap) / 2), y, sc, fill, gap, extra)


def stext(s, x, y, sc, fill, shadow=DEEP, off=None, gap=1):
    """text with hard drop shadow"""
    off = off or max(1, sc // 2) if sc >= 2 else 1
    o = off if off else sc
    return text(s, x + o, y + o, sc, shadow, gap) + text(s, x, y, sc, fill, gap)


def sctext(s, cx, y, sc, fill, shadow=DEEP, gap=1):
    return stext(s, int(cx - tw(s, sc, gap) / 2), y, sc, fill, shadow, None, gap)


# ---------------------------------------------------------------- shapes
def R(x, y, w, h, fill, extra=""):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}"{extra}/>'


def box(x, y, w, h, fill, border=INK, bw=4, shadow=6, shcol=INK):
    s = ""
    if shadow:
        s += R(x + shadow, y + shadow, w, h, shcol)
    s += R(x, y, w, h, border) + R(x + bw, y + bw, w - 2 * bw, h - 2 * bw, fill)
    return s


def frame(W, H, col, bw=6):
    return R(0, 0, W, bw, col) + R(0, H - bw, W, bw, col) + R(0, 0, bw, H, col) + R(W - bw, 0, bw, H, col)


def checker(W, H, c1, c2, size=20):
    d = []
    for j in range(H // size + 1):
        for i in range(W // size + 1):
            if (i + j) % 2:
                d.append(f"M{i * size} {j * size}h{size}v{size}h-{size}z")
    return R(0, 0, W, H, c1) + f'<path fill="{c2}" d="{"".join(d)}"/>'


def sprite(rows, pal, x, y, sc):
    by = {}
    for r, row in enumerate(rows):
        c = 0
        while c < len(row):
            ch = row[c]
            if pal.get(ch):
                c0 = c
                while c < len(row) and row[c] == ch:
                    c += 1
                by.setdefault(pal[ch], []).append(
                    f"M{x + c0 * sc} {y + r * sc}h{(c - c0) * sc}v{sc}h-{(c - c0) * sc}z")
            else:
                c += 1
    return "".join(f'<path fill="{col}" d="{"".join(d)}"/>' for col, d in by.items())


def blink(inner, dur=1.0, begin="0s"):
    return (f'<g><animate attributeName="opacity" values="1;0;1" keyTimes="0;0.5;1" '
            f'calcMode="discrete" dur="{dur}s" begin="{begin}" repeatCount="indefinite"/>{inner}</g>')


def svg(W, H, body, title, defs=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
            f'viewBox="0 0 {W} {H}" width="{W}" height="{H}" shape-rendering="crispEdges" '
            f'role="img" aria-label="{title}"><title>{title}</title>{defs}{body}</svg>')


# ---------------------------------------------------------------- sprites
BUG_BODY = [
    ".d.....d.",
    "..d...d..",
    "..ddddd..",
    ".dbbbbbd.",
    "dbwkbwkbd",
    ".dbbbbbd.",
    "..dbbbd..",
]
BUG_LEGS_A = ["d.d...d.d", ".d.d.d.d."]
BUG_LEGS_B = [".d.d.d.d.", "d.d...d.d"]


def bug(color, x, y, sc, frame_a=True):
    pal = {'d': INK, 'b': color, 'w': CREAM, 'k': INK}
    legs = BUG_LEGS_A if frame_a else BUG_LEGS_B
    return sprite(BUG_BODY + legs, pal, x, y, sc)


HEART = [
    ".rr.rr.",
    "rwrrrrr",
    "rrrrrrr",
    ".rrrrr.",
    "..rrr..",
    "...r...",
]


def heart(x, y, sc, col=RED, hi=CREAM):
    return sprite(HEART, {'r': col, 'w': hi}, x, y, sc)


TECH = [
    "..hhhh..",
    ".hhhhhh.",
    "hhhhhhhh",
    ".ssssss.",
    ".skssks.",
    ".ssssss.",
    "..gggg..",
    ".gggggg.",
    "sgggggg.",
    ".gggggg.",
]
TECH_LEGS_A = ["..nnnn..", "..n..n..", ".cc..cc."]
TECH_LEGS_B = ["..nnnn..", ".n....n.", "cc....cc"]
TECH_PAL = {'h': CHK, 's': "#FFC9A0", 'k': INK, 'g': GRN, 'n': PURP, 'c': CREAM}

WRENCH = ["dd.dd", "dwwwd", ".dwd.", ".dwd.", ".dwd.", ".dwd.", ".ddd."]
WRENCH_PAL = {'d': INK, 'w': "#D9D4EE"}

ROBOT = [
    "....dd....",
    "....dd....",
    ".dddddddd.",
    "dbbbbbbbbd",
    "dbwwbbwwbd",
    "dbwkbbwkbd",
    "dbbbbbbbbd",
    "dbdbdbdbbd",
    ".dddddddd.",
    "..d....d..",
]

SHIELD = [
    ".dddddddd.",
    "dGGGGGGGGd",
    "dGGGGGGkkd",
    "dGGGGGkkGd",
    "dGkGGkkGGd",
    "dGGkkkGGGd",
    "dGGGkGGGGd",
    ".dGGGGGGd.",
    "..dGGGGd..",
    "...dddd...",
]

BUBBLE = [
    "ddddddddd",
    "dwwwwwwwd",
    "dwkwkwkwd",
    "dwwwwwwwd",
    "ddddddddd",
    ".dwd.....",
    ".dd......",
]

GEAR = [
    "..d..d..",
    ".dddddd.",
    "ddggggdd",
    ".dg..gd.",
    ".dg..gd.",
    "ddggggdd",
    ".dddddd.",
    "..d..d..",
]

SCROLL = [
    "dddddddd.",
    "dwwwwwwdd",
    "dwkkkkwwd",
    "dwwwwwwwd",
    "dwkkkkkwd",
    "dwwwwwwwd",
    "dwkkkwwwd",
    "dwwwwwwwd",
    "ddddddddd",
]

PLAY = [
    "dd......",
    "dGdd....",
    "dGGGdd..",
    "dGGGGGdd",
    "dGGGGGdd",
    "dGGGdd..",
    "dGdd....",
    "dd......",
]

STAR = [
    "...d...",
    "..dyd..",
    ".ddyyd.",
    "dyyyyyd",
    ".dyyyd.",
    ".dyddd.",
    "dd...dd",
]


def arrow_r(x, cy, sc, col=INK, length=5):
    """right arrow; shaft top edge at cy, total span (length+3)*sc"""
    hx = x + length * sc
    return (R(x, cy, length * sc, sc, col) + R(hx, cy - 2 * sc, sc, 5 * sc, col)
            + R(hx + sc, cy - sc, sc, 3 * sc, col) + R(hx + 2 * sc, cy, sc, sc, col))


def arrow_l(x, cy, sc, col=INK, length=5):
    return (R(x, cy, sc, sc, col) + R(x + sc, cy - sc, sc, 3 * sc, col)
            + R(x + 2 * sc, cy - 2 * sc, sc, 5 * sc, col) + R(x + 3 * sc, cy, length * sc, sc, col))


def arrow_d(cx, y, sc, col=INK, length=5):
    """down arrow; cx = left edge of the shaft"""
    hy = y + length * sc
    return (R(cx, y, sc, length * sc, col) + R(cx - 2 * sc, hy, 5 * sc, sc, col)
            + R(cx - sc, hy + sc, 3 * sc, sc, col) + R(cx, hy + 2 * sc, sc, sc, col))


def arrow_u(cx, y, sc, col=INK, length=5):
    return (R(cx, y, sc, sc, col) + R(cx - sc, y + sc, 3 * sc, sc, col)
            + R(cx - 2 * sc, y + 2 * sc, 5 * sc, sc, col) + R(cx, y + 3 * sc, sc, length * sc, col))
