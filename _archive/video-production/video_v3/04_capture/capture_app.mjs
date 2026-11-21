// video_v3/04_capture/capture_app.mjs
// Playwright automation to capture app scenes & frozen frames for trace popups per Section C9 & C11

import { chromium } from '../../frontend/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startRecorder } from './lib/recorder.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../');
const clipsDir = path.join(repoRoot, 'video_v3/04_capture/clips');
fs.mkdirSync(clipsDir, { recursive: true });

const APP_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:8080/api/v1';

async function getJwt(email, password) {
  const resp = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!resp.ok) {
    throw new Error(`Login failed for ${email}: ${resp.status}`);
  }
  const data = await resp.json();
  return data.accessToken || data.token;
}

async function createAuthContext(browser, email, password) {
  const token = await getJwt(email, password);
  const context = await browser.newContext({
    viewport: { width: 1920, height: 992 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    reducedMotion: 'no-preference'
  });
  const page = await context.newPage();
  await page.addInitScript(({ email, token }) => {
    localStorage.setItem('iitsm_jwt', token);
    localStorage.setItem('iitsm_user_email', email);
    localStorage.setItem('iitsm_sky_theme', 'night');
    document.documentElement.setAttribute('data-sky', 'night');
  }, { email, token });

  return { context, page };
}

async function captureAppScenes() {
  console.log('Starting app captures against http://localhost:3000...');
  const browser = await chromium.launch({ headless: true });

  // 1. S00.1 - The arcade home screen
  console.log('[*] Capturing S00.1 (Arcade Home Screen)...');
  const { page: p0 } = await createAuthContext(browser, 'emp@bits.campus', 'Bits@2026');
  await p0.goto(`${APP_URL}/app.html?tab=stage`, { waitUntil: 'domcontentloaded' });
  await p0.waitForTimeout(600);
  
  const rec00 = await startRecorder(p0, path.join(clipsDir, 'S00_1_app'));
  rec00.mark('hold_stage');
  await p0.waitForTimeout(2000);
  rec00.mark('click_student_portal');
  await p0.click('text="Student Portal"').catch(() => {});
  await p0.waitForTimeout(1500);
  rec00.mark('point_report');
  await p0.waitForTimeout(1500);
  await rec00.stop();
  console.log('Saved S00_1_app clip.');
  await p0.context().close();

  // 2. S09.1 - Student reports incident (Moodle quiz)
  console.log('[*] Capturing S09.1 (Student Reports Incident)...');
  const { page: p9 } = await createAuthContext(browser, 'emp@bits.campus', 'Bits@2026');
  await p9.goto(`${APP_URL}/app.html?tab=portal`, { waitUntil: 'domcontentloaded' });
  await p9.waitForTimeout(500);

  const rec09 = await startRecorder(p9, path.join(clipsDir, 'S09_1_app'));
  rec09.mark('click_report_button');
  await p9.click('text="Report New Incident"').catch(() => {});
  await p9.waitForTimeout(600);

  rec09.mark('type_title');
  await p9.fill('form input[type="text"]', 'Moodle quiz opens as blank page in mid-sem exam').catch(() => {});
  await p9.waitForTimeout(600);

  rec09.mark('type_description');
  await p9.fill('form textarea', 'When I click start attempt on the CS F213 quiz it shows a blank white page.').catch(() => {});
  await p9.waitForTimeout(600);

  rec09.mark('pick_urgency_high');
  await p9.click('button:has-text("High")').catch(() => {});
  await p9.waitForTimeout(600);

  // Freeze frame T1-submit
  await p9.screenshot({ path: path.join(clipsDir, 'T1_submit_frozen.png') });
  console.log('Saved T1_submit_frozen.png');

  rec09.mark('submit');
  await p9.click('button[type="submit"]').catch(() => {});
  await p9.waitForTimeout(1500);
  await rec09.stop();
  console.log('Saved S09_1_app clip.');

  // Save S09_3 result view
  await p9.screenshot({ path: path.join(clipsDir, 'S09_3_bg.png') });

  // 3. S09.4 - Technician Acknowledges
  console.log('[*] Capturing S09.4 (Technician Acknowledges)...');
  const { page: pTech } = await createAuthContext(browser, 'tech.vikram@bits.campus', 'Bits@2026');
  await pTech.goto(`${APP_URL}/app.html?tab=workbench`, { waitUntil: 'domcontentloaded' });
  await pTech.waitForTimeout(800);

  // Freeze frame T2-ack
  await pTech.screenshot({ path: path.join(clipsDir, 'T2_ack_frozen.png') });
  console.log('Saved T2_ack_frozen.png');
  await pTech.context().close();

  // 4. S10.2 - Admin Ledger Verification
  console.log('[*] Capturing S10.2 (Audit Ledger Verification)...');
  const { page: pAdmin } = await createAuthContext(browser, 'admin@bits.campus', 'Bits@2026');
  await pAdmin.goto(`${APP_URL}/app.html?tab=audit`, { waitUntil: 'domcontentloaded' });
  await pAdmin.waitForTimeout(800);

  // Freeze frame T5-ledger
  await pAdmin.screenshot({ path: path.join(clipsDir, 'T5_ledger_frozen.png') });
  console.log('Saved T5_ledger_frozen.png');
  await pAdmin.context().close();

  await browser.close();
  console.log('App captures complete!');
}

captureAppScenes().catch(err => {
  console.error('App capture error:', err);
  process.exit(1);
});
