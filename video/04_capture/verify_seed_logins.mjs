import { chromium } from '../../frontend/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';

async function getJwt(email, password) {
  const resp = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!resp.ok) {
    throw new Error(`Login failed for ${email}: ${resp.status} ${resp.statusText}`);
  }
  const data = await resp.json();
  return data.accessToken;
}

async function verifyLogins() {
  const shotsDir = path.resolve('video/04_capture/shots');
  fs.mkdirSync(shotsDir, { recursive: true });

  const roles = [
    {
      role: 'EMPLOYEE',
      email: 'emp@bits.campus',
      tab: 'portal',
      shot: 'seed_employee.png',
      desc: 'Student/Faculty Self-Service Portal'
    },
    {
      role: 'TECHNICIAN',
      email: 'tech.vikram@bits.campus',
      tab: 'workbench',
      shot: 'seed_technician.png',
      desc: 'Technician Incident Triage & SLA Queue'
    },
    {
      role: 'ADMINISTRATOR',
      email: 'admin@bits.campus',
      tab: 'admin',
      shot: 'seed_admin.png',
      desc: 'Campus IT Operations & Audit Ledger Console'
    }
  ];

  console.log('Connecting to Playwright Chromium headless (1920x1080)...');
  const browser = await chromium.launch({ headless: true });

  for (const r of roles) {
    console.log(`\n--- Verifying ${r.role} (${r.email}) ---`);
    const token = await getJwt(r.email, 'Bits@2026');
    console.log(`JWT acquired: ${token.substring(0, 24)}...`);

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1
    });

    const page = await context.newPage();

    // Pre-populate localStorage with auth tokens
    await page.addInitScript(({ email, token }) => {
      localStorage.setItem('iitsm_jwt', token);
      localStorage.setItem('iitsm_user_email', email);
    }, { email: r.email, token });

    const targetUrl = `http://localhost:3000/?tab=${r.tab}`;
    console.log(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000); // Allow react components and 3D canvas to render

    const outPath = path.join(shotsDir, r.shot);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`Screenshot captured: ${outPath} (${fs.statSync(outPath).size} bytes)`);

    await context.close();
  }

  await browser.close();
  console.log('\nAll 3 role logins verified and screenshots captured successfully!');
}

verifyLogins().catch(err => {
  console.error('Login verification failed:', err);
  process.exit(1);
});
