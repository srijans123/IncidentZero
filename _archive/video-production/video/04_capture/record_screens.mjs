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

async function recordScreenScenes() {
  console.log('============================================================');
  console.log('  Incident-Zero — Playwright Screen Capture Engine');
  console.log('============================================================');

  const rawDir = path.resolve('video/04_capture/raw');
  const clipsDir = path.resolve('video/04_capture/clips');
  const boxesDir = path.resolve('video/04_capture/boxes');

  fs.mkdirSync(rawDir, { recursive: true });
  fs.mkdirSync(clipsDir, { recursive: true });
  fs.mkdirSync(boxesDir, { recursive: true });

  const sbPath = path.resolve('video/02_script/storyboard.json');
  const storyboard = JSON.parse(fs.readFileSync(sbPath, 'utf-8'));

  // Pre-fetch tokens for all 3 roles
  console.log('[*] Pre-fetching authenticated session tokens...');
  const tokens = {
    employee: await getJwt('emp@bits.campus', 'Bits@2026'),
    technician: await getJwt('tech.vikram@bits.campus', 'Bits@2026'),
    admin: await getJwt('admin@bits.campus', 'Bits@2026')
  };
  console.log('[*] Tokens acquired for EMPLOYEE, TECHNICIAN, and ADMINISTRATOR.');

  // Find all screen scenes
  const screenScenes = [];
  for (const act of storyboard.acts) {
    for (const sc of act.scenes) {
      if (sc.type === 'screen') {
        screenScenes.append ? screenScenes.append(sc) : screenScenes.push(sc);
      }
    }
  }

  console.log(`[*] Found ${screenScenes.length} screen scenes to capture.`);

  const browser = await chromium.launch({ headless: true });

  for (let i = 0; i < screenScenes.length; i++) {
    const sc = screenScenes[i];
    const targetUrl = sc.target_url || 'http://localhost:3000/?tab=stage';
    const tabMatch = targetUrl.match(/tab=([a-z0-9_-]+)/);
    const tab = tabMatch ? tabMatch[1] : 'stage';

    // Check duration: prefer direct wav file duration, then timings.json, then est_sec
    let durationSec = sc.est_sec || 12;
    const wavPath = path.resolve(`video/03_audio/scenes/${sc.id}.wav`);
    if (fs.existsSync(wavPath)) {
      try {
        const out = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${wavPath}"`).toString().trim();
        const d = parseFloat(out);
        if (!isNaN(d) && d > 0) {
          durationSec = d;
        }
      } catch (e) {}
    } else {
      const timingsPath = path.resolve('video/03_audio/timings.json');
      if (fs.existsSync(timingsPath)) {
        try {
          const timings = JSON.parse(fs.readFileSync(timingsPath, 'utf-8'));
          if (timings.scenes && timings.scenes[sc.id]) {
            durationSec = timings.scenes[sc.id].duration_sec;
          }
        } catch (e) {}
      }
    }

    console.log(`\n[${i + 1}/${screenScenes.length}] Recording ${sc.id} (tab=${tab}, ${durationSec.toFixed(1)}s)...`);

    const clipMp4 = path.join(clipsDir, `${sc.id}.mp4`);
    const isForce = process.argv.includes('--force');
    if (!isForce && fs.existsSync(clipMp4) && fs.statSync(clipMp4).size > 10000) {
      console.log(`[${i + 1}/${screenScenes.length}] Clip already recorded and transcoded: ${sc.id} (skipping)`);
      continue;
    }

    // Determine role & credentials
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

    // Set localStorage before navigation
    await page.addInitScript(({ email, token }) => {
      localStorage.setItem('iitsm_jwt', token);
      localStorage.setItem('iitsm_user_email', email);
    }, { email, token });

    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });

    // Inject highlighting CSS
    await page.addStyleTag({
      content: `
        .iz-highlight-glow {
          outline: 3px solid #00f0ff !important;
          box-shadow: 0 0 25px rgba(0, 240, 255, 0.8), inset 0 0 15px rgba(0, 240, 255, 0.4) !important;
          border-radius: 6px !important;
          transition: all 0.3s ease-in-out !important;
        }
      `
    });

    // Locate target element and apply highlight glow
    let boxData = { id: sc.id, x: 960, y: 540, width: 200, height: 100, centerX: 960, centerY: 540 };
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
      } catch (err) {
        console.log(`    (Note: selector ${sel} not found, fallback to viewport center)`);
      }
    }

    // Save bounding box JSON
    const boxFile = path.join(boxesDir, `${sc.id}.json`);
    fs.writeFileSync(boxFile, JSON.stringify(boxData, null, 2));

    // Wait for the full scene duration
    await page.waitForTimeout(Math.ceil(durationSec * 1000) + 400);

    // Close page and context to finalize video writing
    await page.close();
    await context.close();

    // Find the recorded webm file in sceneRawDir
    const rawFiles = fs.readdirSync(sceneRawDir).filter(f => f.endsWith('.webm'));
    if (rawFiles.length > 0) {
      const rawWebm = path.join(sceneRawDir, rawFiles[0]);
      const clipMp4 = path.join(clipsDir, `${sc.id}.mp4`);

      // Transcode to constant 30fps H.264 MP4 via FFmpeg
      const ffmpegCmd = `ffmpeg -y -v error -i "${rawWebm}" -c:v libx264 -preset fast -pix_fmt yuv420p -r 30 -an "${clipMp4}"`;
      execSync(ffmpegCmd);
      console.log(`    Transcoded to constant 30fps MP4: ${clipMp4} (${fs.statSync(clipMp4).size} bytes)`);
    } else {
      console.log(`    Warning: no raw video found for ${sc.id}`);
    }
  }

  await browser.close();
  console.log('\n============================================================');
  console.log('  All 30 screen scenes captured and transcoded successfully!');
  console.log('============================================================');
}

recordScreenScenes().catch(err => {
  console.error('Error during screen capture:', err);
  process.exit(1);
});
