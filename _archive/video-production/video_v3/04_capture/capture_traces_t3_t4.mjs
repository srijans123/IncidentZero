// video_v3/04_capture/capture_traces_t3_t4.mjs
// Captures T3_pause_frozen.png and T4_verify_frozen.png from live app

import { chromium } from '../../frontend/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../');
const clipsDir = path.join(repoRoot, 'video_v3/04_capture/clips');

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

async function postCommand(id, command, body = {}) {
  const token = await getJwt('admin@bits.campus', 'Bits@2026');
  const resp = await fetch(`${API_URL}/incidents/${id}/commands/${command}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  const text = await resp.text();
  console.log(`Command ${command} on ${id} -> status ${resp.status}: ${text.slice(0, 100)}`);
  return resp.ok;
}

async function run() {
  console.log('Capturing T3 and T4 traces...');
  const browser = await chromium.launch({ headless: true });

  // 1. Get latest incident
  const adminToken = await getJwt('admin@bits.campus', 'Bits@2026');
  const listResp = await fetch(`${API_URL}/incidents`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const listData = await listResp.json();
  const inc = listData.items[0];
  console.log(`Using incident ${inc.id} (${inc.number}), current status: ${inc.status}`);

  const incId = inc.id;

  // Progress the incident to assigned/acknowledged/in_progress
  if (inc.status === 'CLASSIFIED') {
    await postCommand(incId, 'assign', { technicianId: '019299a0-0000-7000-8000-000000000003' });
    await postCommand(incId, 'acknowledge');
  } else if (inc.status === 'ASSIGNED') {
    await postCommand(incId, 'acknowledge');
  }

  // Tech workbench context
  const techToken = await getJwt('tech.vikram@bits.campus', 'Bits@2026');
  const context = await browser.newContext({
    viewport: { width: 1920, height: 992 },
    deviceScaleFactor: 1,
    colorScheme: 'dark'
  });
  const page = await context.newPage();
  await page.addInitScript(({ token }) => {
    localStorage.setItem('iitsm_jwt', token);
    localStorage.setItem('iitsm_user_email', 'tech.vikram@bits.campus');
    localStorage.setItem('iitsm_sky_theme', 'night');
    document.documentElement.setAttribute('data-sky', 'night');
  }, { token: techToken });

  // Open Workbench detail for this ticket
  await page.goto(`${APP_URL}/app.html?tab=workbench`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Click on the incident in the list
  const ticketRow = page.locator(`text="${inc.number}"`).first();
  if (await ticketRow.isVisible().catch(() => false)) {
    await ticketRow.click();
    await page.waitForTimeout(600);
  }

  // T3_pause_frozen.png: Capture hold/pending or paused state
  await page.screenshot({ path: path.join(clipsDir, 'T3_pause_frozen.png') });
  console.log('[✓] Saved T3_pause_frozen.png');

  // Advance ticket to RESOLVED: investigation -> resolve
  await postCommand(incId, 'start_investigation').catch(() => {});
  await postCommand(incId, 'resolve', { resolutionNotes: 'Restored quiz access via server pool reset.' }).catch(() => {});

  // Student context for T4
  const studentToken = await getJwt('emp@bits.campus', 'Bits@2026');
  const sContext = await browser.newContext({
    viewport: { width: 1920, height: 992 },
    deviceScaleFactor: 1,
    colorScheme: 'dark'
  });
  const sPage = await sContext.newPage();
  await sPage.addInitScript(({ token }) => {
    localStorage.setItem('iitsm_jwt', token);
    localStorage.setItem('iitsm_user_email', 'emp@bits.campus');
    localStorage.setItem('iitsm_sky_theme', 'night');
    document.documentElement.setAttribute('data-sky', 'night');
  }, { token: studentToken });

  await sPage.goto(`${APP_URL}/app.html?tab=portal`, { waitUntil: 'domcontentloaded' });
  await sPage.waitForTimeout(1000);

  // Click on the incident in student portal
  const sTicket = sPage.locator(`text="${inc.number}"`).first();
  if (await sTicket.isVisible().catch(() => false)) {
    await sTicket.click();
    await sPage.waitForTimeout(800);
  }

  // T4_verify_frozen.png
  await sPage.screenshot({ path: path.join(clipsDir, 'T4_verify_frozen.png') });
  console.log('[✓] Saved T4_verify_frozen.png');

  await browser.close();
  console.log('Trace capture done!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
