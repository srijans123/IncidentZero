# Zoom logic (ported from OpenScreen, MIT)

Source files, copied unchanged into `reference/openscreen/`: `constants.ts`, `mathUtils.ts`, `zoomTransform.ts`, `focusUtils.ts`, `cursorFollowUtils.ts`, `zoomRegionUtils.ts`, `zoom-scale.ts`.
The port lives in `kit/stagekit.js`, section "camera". **Do not rewrite it. This file explains it so you can read it.**

## The seven rules

| # | Rule | Formula | OpenScreen source | In `stagekit.js` |
|---|---|---|---|---|
| 1 | Zoom depth is one of six scales | depth 1..6 → 1.25, 1.5, 1.8, 2.2, 3.5, 5.0 | `zoom-scale.ts` `ZOOM_DEPTH_SCALES` | `DEPTH` |
| 2 | Transition length grows with the scale | `ms = 600 + 550 · ln(scale)` (723 ms at 1.25×, 823 ms at 1.5×, 923 ms at 1.8×) | `zoom-scale.ts` `zoomTransitionMs` | `transitionMs` |
| 3 | Progress eases like a critically damped spring | `ease(t) = (1 − (1 + 7t)·e^(−7t)) / (1 − 8·e^(−7))`, t in 0..1 | `mathUtils.ts` `easeSpring` | `easeSpring` |
| 4 | Scale is interpolated in log space | `s = S^p` where S is the target scale and p the eased progress | `mathUtils.ts` `scaleLerp` | `cam.s = Math.pow(cam.S, cam.p)` |
| 5 | The focus point travels to the centre of the frame | `tx = Fx + (W/2 − Fx)·p − Fx·s`, same for y; F = focus in px | `zoomTransform.ts` `computeZoomTransform` | `cam.tx`, `cam.ty` in `tick` |
| 6 | The focus is clamped so the page edge never shows | `margin = 1 / (2·S)`; focus stays in `[margin, 1 − margin]` | `focusUtils.ts` `clampFocusToDepth` | `clampFocus` |
| 7 | Two zooms in a row pan instead of zooming out and in | pan for 1000 ms with `cubic-bezier(0.1, 0, 0.2, 1)` | `constants.ts` `CHAINED_ZOOM_PAN_DURATION_MS`, `zoomRegionUtils.ts` | `Z.zoom.to` when `cam.p > 0.05`, `easePan` |

## Following the cursor

`zoomFollow(depth)` keeps the focus moving toward the cursor every animation frame:

```
d      = distance between focus and cursor (both as fractions of the page, 0..1)
base   = 0.10 + (0.25 − 0.10) · min(1, d / 0.15)        // far away → faster
k      = 1 − (1 − base)^(dt / 25)                       // dt = ms since last frame
focus += (cursor − focus) · k
```
Source: `cursorFollowUtils.ts` (`ADAPTIVE_SMOOTHING_MIN/MAX/RAMP_DISTANCE`, `SMOOTHING_REFERENCE_FRAME_MS`). In `stagekit.js`: the `FOLLOW` constant and the `else if (cam.follow …)` branch of `tick`.

## What is different from OpenScreen, and why

OpenScreen zooms a finished video. This kit zooms the **live page** with a CSS transform on the app's `#root` element, so text stays sharp at 2×.

1. **Cursor position is stored in un-zoomed page pixels** (`cursor.lx`, `cursor.ly`). When the camera moves, the cursor sprite is redrawn at `toScreen(lx, ly)`, so it stays on the element it was on. Without this, following the screen position of a still mouse makes the camera run away.
2. **The director waits for the camera before clicking** (`settle()` in `kit/lib.mjs` polls `zoom.state().busy`, which is true during a transition, a pan, or while the follow camera is still moving).
3. **The stage is `#root`, not `body`.** The app's pop-ups are portalled into `body`, so they are never zoomed. Rule for the direction files: call `zoomOut` before any click that opens a pop-up, submits a form, or changes page. The shipped direction already does.
4. **Scrolling while zoomed is compensated** each frame (`ox * (s − 1)` term), so the zoomed picture stays put if the page scrolls.

## The three verbs

| Verb | Example | Effect |
|---|---|---|
| `zoom` | `['zoom', { placeholder: 'Provide error codes' }, 2]` | centre that element at depth 2 (1.5×); chained pan if already zoomed |
| `zoomFollow` | `['zoomFollow', 2]` | zoom to the cursor at depth 2 and keep following it |
| `zoomOut` | `['zoomOut']` | spring back to 1× (add `{ nowait: true }` to continue immediately) |
