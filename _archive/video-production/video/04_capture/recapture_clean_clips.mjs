import { chromium } from '../../frontend/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function getJwt(email, password) {
  const resp = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!resp.ok) {
    throw new Error(`Login failed for ${email}: ${resp.status}`);
  }
  const data = await resp.json();
  return data.accessToken;
}

async function recaptureCleanClips() {
  console.log('============================================================');
  console.log('  Incident-Zero — Precision Screen Capture (Zero White Frames)');
  console.log('============================================================');

  const rawDir = path.resolve('video/04_capture/raw_clean');
  const clipsDir = path.resolve('video/04_capture/clips');
  const boxesDir = path.resolve('video/04_capture/boxes');
  const publicClipsDir = path.resolve('video/07_remotion/public/clips');

  fs.mkdirSync(rawDir, { recursive: true });
  fs.mkdirSync(clipsDir, { recursive: true });
  fs.mkdirSync(boxesDir, { recursive: true });
  fs.mkdirSync(publicClipsDir, { recursive: true });

  const sbPath = path.resolve('video/02_script/storyboard.json');
  const storyboard = JSON.parse(fs.readFileSync(sbPath, 'utf-8'));

  const timingsPath = path.resolve('video/03_audio/timings.json');
  const timings = JSON.parse(fs.readFileSync(timingsPath, 'utf-8'));

  console.log('[*] Acquiring JWT session tokens for campus personas...');
  const tokens = {
    employee: await getJwt('emp@bits.campus', 'Bits@2026'),
    technician: await getJwt('tech.vikram@bits.campus', 'Bits@2026'),
    admin: await getJwt('admin@bits.campus', 'Bits@2026')
  };

  const screenScenes = [];
  const targetSceneArg = process.argv.find((a, i) => i > 0 && process.argv[i-1] === '--scene');

  for (const act of storyboard.acts) {
    for (const sc of act.scenes) {
      if (sc.type === 'screen') {
        if (!targetSceneArg || sc.id === targetSceneArg) {
          screenScenes.push(sc);
        }
      }
    }
  }

  console.log(`[*] Recapturing ${screenScenes.length} screen clips with dark cyber theme & exact timings...`);

  const browser = await chromium.launch({ headless: true });

  for (let i = 0; i < screenScenes.length; i++) {
    const sc = screenScenes[i];
    const targetUrl = sc.target_url || 'http://localhost:3000/?tab=stage';
    const tabMatch = targetUrl.match(/tab=([a-z0-9_-]+)/);
    const tab = tabMatch ? tabMatch[1] : 'stage';

    const timingEntry = timings.scenes[sc.id] || {};
    const durationSec = timingEntry.duration_sec || sc.est_sec || 12.0;

    let email = 'admin@bits.campus';
    let token = tokens.admin;
    if (tab === 'portal') {
      email = 'emp@bits.campus';
      token = tokens.employee;
    } else if (tab === 'workbench') {
      email = 'tech.vikram@bits.campus';
      token = tokens.technician;
    }

    const sceneRawDir = path.join(rawDir, sc.id);
    fs.mkdirSync(sceneRawDir, { recursive: true });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
      recordVideo: {
        dir: sceneRawDir,
        size: { width: 1920, height: 1080 }
      }
    });

    const page = await context.newPage();
    const tBrowserStart = Date.now();

    // Force night theme and credentials prior to page evaluation
    await page.addInitScript(({ email, token }) => {
      localStorage.setItem('iitsm_jwt', token);
      localStorage.setItem('iitsm_user_email', email);
      localStorage.setItem('iitsm_sky_theme', 'night');
      document.documentElement.setAttribute('data-sky', 'night');
    }, { email, token });

    // Navigate with domcontentloaded (SSE stream keeps network active indefinitely)
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Wait for fonts to be ready
    await page.evaluate(() => document.fonts.ready);

    // Wait for main content selector so no white loading frame exists
    try {
      await page.waitForSelector('main, .retro-container, table, .specs-container, button', { timeout: 8000 });
    } catch (e) {}

    // Ensure dark theme is applied to documentElement
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-sky', 'night');
    });

    // Settle for 200ms
    await page.waitForTimeout(200);

    // Inject CSS glow
    await page.addStyleTag({
      content: `
        .iz-highlight-glow {
          outline: 3px solid #00f0ff !important;
          box-shadow: 0 0 25px rgba(0, 240, 255, 0.9), inset 0 0 15px rgba(0, 240, 255, 0.4) !important;
          border-radius: 6px !important;
          transition: all 0.3s ease-in-out !important;
        }
      `
    });

    // Locate target element and apply highlight glow
    let boxData = { id: sc.id, x: 960, y: 540, width: 240, height: 120, centerX: 960, centerY: 540 };
    const sel = sc.highlight;
    if (sel) {
      try {
        const el = page.locator(sel).first();
        if (await el.count() > 0) {
          await el.evaluate(node => node.classList.add('iz-highlight-glow'));
          const bb = await el.boundingBox();
          if (bb) {
            boxData = {
              id: sc.id,
              x: Math.round(bb.x),
              y: Math.round(bb.y),
              width: Math.round(bb.width),
              height: Math.round(bb.height),
              centerX: Math.round(bb.x + bb.width / 2),
              centerY: Math.round(bb.y + bb.height / 2)
            };
          }
        }
      } catch (err) {}
    }

    // Save bounding box JSON
    const boxFile = path.join(boxesDir, `${sc.id}.json`);
    fs.writeFileSync(boxFile, JSON.stringify(boxData, null, 2));

    // Timestamp when content is 100% loaded and ready
    const tContentReady = Date.now();
    const trimOffsetSec = Math.max(0.1, (tContentReady - tBrowserStart) / 1000.0);

    // Record for required duration + 0.6s tail
    const recordWaitMs = Math.ceil((durationSec + 0.6) * 1000);
    await page.waitForTimeout(recordWaitMs);

    await page.close();
    await context.close();

    // Find recorded webm
    const rawFiles = fs.readdirSync(sceneRawDir).filter(f => f.endsWith('.webm'));
    if (rawFiles.length > 0) {
      const rawWebm = path.join(sceneRawDir, rawFiles[0]);
      const clipMp4 = path.join(clipsDir, `${sc.id}.mp4`);
      const pubMp4 = path.join(publicClipsDir, `${sc.id}.mp4`);

      // Transcode trimming the page load offset, clamping to exact duration + 0.5s tail
      const targetDur = (durationSec + 0.5).toFixed(3);
      const ffmpegCmd = `ffmpeg -y -v error -ss ${trimOffsetSec.toFixed(3)} -i "${rawWebm}" -t ${targetDur} -c:v libx264 -preset fast -pix_fmt yuv420p -r 30 -an "${clipMp4}"`;
      execSync(ffmpegCmd);

      // Copy to Remotion public dir
      fs.copyFileSync(clipMp4, pubMp4);
      console.log(`[${i + 1}/${screenScenes.length}] Captured ${sc.id}: trimOffset=${trimOffsetSec.toFixed(2)}s, dur=${targetDur}s (${fs.statSync(clipMp4).size} B)`);
    } else {
      console.log(`[${i + 1}/${screenScenes.length}] Warning: no webm found for ${sc.id}`);
    }
  }

  await browser.close();
  console.log('============================================================');
  console.log('  Screen Clips Recapture Complete! Zero Page-Load Whiteout.');
  console.log('============================================================');
}

recaptureCleanClips().catch(err => {
  console.error('Error during screen capture:', err);
  process.exit(1);
});

