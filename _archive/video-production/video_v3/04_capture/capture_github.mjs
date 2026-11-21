// video_v3/04_capture/capture_github.mjs
// Playwright automation to capture GitHub navigation and freeze frames per Section C8

import { chromium } from '../../frontend/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startRecorder } from './lib/recorder.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../');

const shaFile = path.join(repoRoot, 'video_v3/01_facts/PINNED_SHA.txt');
let PINNED_SHA = 'daf3e1d11f8a89d04095eeab068719e7651506e5';
if (fs.existsSync(shaFile)) {
  PINNED_SHA = fs.readFileSync(shaFile, 'utf-8').replace(/^\uFEFF/, '').trim();
}

const clipsDir = path.join(repoRoot, 'video_v3/04_capture/clips');
fs.mkdirSync(clipsDir, { recursive: true });

const REPO_BASE = 'https://github.com/srijans123/IncidentZero';

async function setupPage(browser) {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 992 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    reducedMotion: 'no-preference'
  });
  const page = await context.newPage();

  // Hide GitHub banners/prompts
  await page.addInitScript(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .logged-out-modal, #js-cookie-consent-form, .signup-prompt,
      .js-notice, .flash, .Header-old { display: none !important; }
    `;
    document.head?.appendChild(style);
  });

  return { context, page };
}

async function captureGithubScenes() {
  console.log(`Starting GitHub captures with PINNED_SHA=${PINNED_SHA}...`);
  const browser = await chromium.launch({ headless: true });
  const { context, page } = await setupPage(browser);

  // 1. Repo home (unpinned for intro scene S00.2 / S01.1)
  console.log('[*] Navigating to Repo Home (unpinned)...');
  await page.goto(REPO_BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Capture S01.1 repo home clip
  const rec01 = await startRecorder(page, path.join(clipsDir, 'S01_1_github'));
  rec01.mark('scroll_readme');
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(800);
  await rec01.stop();
  console.log('Saved S01_1_github clip.');

  // 2. Click through to backend/src/main/java/edu/campus/iitsm
  console.log('[*] Navigating to tree at PINNED_SHA...');
  const treeUrl = `${REPO_BASE}/tree/${PINNED_SHA}/backend/src/main/java/edu/campus/iitsm`;
  await page.goto(treeUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Save background frame for ArchitectureTest (S02.2)
  const archUrl = `${REPO_BASE}/blob/${PINNED_SHA}/backend/src/test/java/edu/campus/iitsm/ArchitectureTest.java#L20-L45`;
  await page.goto(archUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(clipsDir, 'S02_2_bg.png') });
  console.log('Saved S02_2_bg.png.');

  // 3. Domain folder: incident/domain
  const domainUrl = `${REPO_BASE}/tree/${PINNED_SHA}/backend/src/main/java/edu/campus/iitsm/incident/domain`;
  await page.goto(domainUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(clipsDir, 'S03_1_bg.png') });

  // Incident.java
  const incidentUrl = `${REPO_BASE}/blob/${PINNED_SHA}/backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java`;
  await page.goto(incidentUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(clipsDir, 'S03_2_bg.png') });
  await page.screenshot({ path: path.join(clipsDir, 'S03_3_bg.png') });
  console.log('Saved S03_2_bg.png and S03_3_bg.png.');

  // SlaClock & Calendar
  const slaUrl = `${REPO_BASE}/blob/${PINNED_SHA}/backend/src/main/java/edu/campus/iitsm/incident/domain/SlaClock.java`;
  await page.goto(slaUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(clipsDir, 'S04_1_bg.png') });

  // IntakePipeline
  const intakeUrl = `${REPO_BASE}/blob/${PINNED_SHA}/backend/src/main/java/edu/campus/iitsm/incident/application/intake/IntakePipeline.java`;
  await page.goto(intakeUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(clipsDir, 'S05_1_bg.png') });

  // IncidentController
  const controllerUrl = `${REPO_BASE}/blob/${PINNED_SHA}/backend/src/main/java/edu/campus/iitsm/incident/infrastructure/web/IncidentController.java`;
  await page.goto(controllerUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(clipsDir, 'S07_1_bg.png') });

  // Audit listener
  const auditUrl = `${REPO_BASE}/blob/${PINNED_SHA}/backend/src/main/java/edu/campus/iitsm/audit/infrastructure/AuditLedgerInTxListener.java`;
  await page.goto(auditUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(clipsDir, 'S07_3_bg.png') });

  // Closing shot
  await page.goto(REPO_BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(clipsDir, 'S11_2_bg.png') });
  console.log('Saved S11_2_bg.png.');

  await browser.close();
  console.log('GitHub captures complete!');
}

captureGithubScenes().catch(err => {
  console.error('GitHub capture error:', err);
  process.exit(1);
});
