# Playbook — how to work on this task so the result is right the first time

These are the habits that produced this package. Follow them literally.

## 1. Trust printed output, not your expectation
- Before saying anything works, run the command that proves it and read the last lines.
- A file existing is not proof. A command exiting is not proof. The expected line being printed is proof.
- Round one failed here: the report said the app and video passed while the public site still ran a week-old build and the video was 52 still images.

## 2. Look at pictures
- After every take: `ffmpeg -y -loglevel error -i video_v4/out/takes/T03.mp4 -vf "fps=1/10,scale=960:-1" video_v4/out/takes/T03_%03d.png` and open the images.
- Compare with `video_v4/samples/` and `video_v4/reference/gallery/`. Ask of each frame: is there a cursor, is one thing highlighted, is the page fully loaded?
- A loading spinner in a frame means the take is wrong even if it printed OK.

## 3. Find the cause before changing anything
How the real causes in this project were found. Use the same moves.

| Question | Command that answered it |
|---|---|
| Why does the live site still show the old error? | `git ls-remote --heads origin` → a `gh-pages` branch exists; `git log -1 origin/gh-pages` → last built 9 Nov; `cat upload/deploy_gh_pages.sh` → the site is pushed there by hand |
| Is the fix in the build that is live? | download the live JS and search it for a string only the new code has (`grep -o "iitsm_demo_incidents"`) |
| Why does a pop-up not open? | click the button in a headless browser, count `[role=dialog]`; then remove one suspect component, rebuild, repeat. Removing the 3D clock made the pop-up appear → the 3D widget blocks rendering |
| Does the page crash without WebGL? | launch Chrome with `--disable-3d-apis` and load the page |
| Do the highlight strings still exist in the code? | `node video_v4/kit/cli.mjs validate` (searches git at the pinned commit) |
| Do cards and diagrams fit the screen? | `node video_v4/kit/cli.mjs gallery` (this found 14 cards whose longest line was cut off; the card now shrinks its type to fit) |

## 4. Change one thing, then re-run the smallest check
- Selector fix → re-run that one take.
- Card fix → `validate`, then `gallery`.
- App fix → `npm --prefix frontend run build`, then the take that showed the bug; then redo deploy and pin (R6, R8) because the code changed.

## 5. Never hide a failure
- Do not delete an `expect`. Do not replace a click with a JavaScript call. Do not add `window.__…` hooks. Do not edit saved terminal output. Do not swap a recording for a screenshot.
- If the app is wrong, fix the app. If you cannot, write the exact printed error to `BLOCKERS.md` and say so in the report.

## 6. Order of trust when two things disagree
1. The code in git at `pinnedSha`.
2. What a command printed today.
3. `ROUND2_FIX.md`.
4. `video_v4/direction/`.
5. Older reports (`FINAL_REPORT.md`, `PROGRESS.md` from round one): treat as unverified.

## 7. Words on screen must be true
- Diagram labels, card titles and terminal output are claims. Each must match the code or a real command output.
- Hash chain, not "Merkle tree". Eleven state classes. Keyword rules, not "AI model", for the copilot's service suggestion. Least-loaded assignment in the demo.

## 8. When stuck for more than three attempts
Stop. Write to `BLOCKERS.md`: the command, the last 20 printed lines, the screenshot path, and what you tried. Continue with the next independent step. Tell Srijan at the end.
