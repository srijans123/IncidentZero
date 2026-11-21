#!/usr/bin/env node
// kit/probe.mjs — "what is on the page right now?" Use it whenever a take fails and the screenshot is not enough.
// It opens a page, optionally switches user and tab and opens a ticket, then prints every visible button,
// every input, the ticket the app last loaded, and any console errors, and saves probe.png.
//   node video_v4/kit/probe.mjs --url "/app.html?tab=workbench" --user "Vikram Rao" --tab Workbench --row first
//   node video_v4/kit/probe.mjs --url https://github.com/srijans123/IncidentZero --github
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { REPO, V4, W, H, loadConfig, sleep } from './lib.mjs';

const require = createRequire(path.join(REPO, 'frontend', 'package.json'));
const { chromium } = require('playwright');
const cfg = loadConfig(); const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; }; const has = (k) => process.argv.includes('--' + k);
let url = arg('url', '/app.html?tab=portal'); if (url.startsWith('/')) url = arg('app', cfg.appUrl) + url;
const out = path.join(V4, 'out'); fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath: cfg.chrome || undefined, channel: cfg.chrome ? undefined : cfg.channel, args: ['--no-sandbox', ...(cfg.chromeArgs || [])] });
const page = await browser.newPage({ viewport: { width: W, height: H } }); const logs = [];
page.on('console', (m) => { if (m.type() === 'error') logs.push('[console error] ' + m.text().slice(0, 200)); });
page.on('pageerror', (e) => logs.push('[page error] ' + String(e).slice(0, 300)));
page.on('response', (r) => { if (r.status() >= 400 && r.url().includes('/api/')) logs.push(`[http ${r.status()}] ${r.request().method()} ${r.url()}`); });
await page.goto(url, { waitUntil: 'load', timeout: 45000 }); await sleep(2500);
if (arg('user')) { await page.locator('[title="Switch BITS Pilani Demo Persona"]').click(); await page.locator(`button:has(p:text-is("${arg('user')}"))`).click(); await sleep(1500); }
if (arg('tab')) { await page.getByRole('button', { name: arg('tab') }).first().click(); await sleep(1500); }
if (arg('row')) { const r = arg('row') === 'first' ? page.locator('tbody tr').first() : page.getByText(arg('row'), { exact: true }).first(); await r.click(); await sleep(2000); }
if (arg('click')) { await page.getByRole('button', { name: arg('click') }).first().click(); await sleep(1200); }
const report = await page.evaluate((github) => {
  const vis = (e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
  const txt = (e) => (e.innerText || e.value || e.getAttribute('aria-label') || e.title || '').replace(/\s+/g, ' ').trim().slice(0, 70);
  return {
    url: location.href, title: document.title,
    spinnerVisible: [...document.querySelectorAll('.animate-spin')].some(vis),
    demoModeBadge: /DEMO MODE/.test(document.body.innerText),
    dialogsOpen: document.querySelectorAll('[role=dialog]').length,
    buttons: [...document.querySelectorAll('button, a.btn')].filter(vis).map(txt).filter(Boolean).slice(0, 60),
    inputs: [...document.querySelectorAll('input, textarea, select')].filter(vis).map((e) => `${e.tagName.toLowerCase()} placeholder="${e.placeholder || ''}" value="${String(e.value || '').slice(0, 40)}"`),
    testids: [...document.querySelectorAll('[data-testid]')].filter(vis).map((e) => e.getAttribute('data-testid')),
    lastTicket: window.__izLast ? { number: window.__izLast.number, state: window.__izLast.state, priority: window.__izLast.priority, assignee: window.__izLast.assigneeName, allowedCommands: window.__izLast.allowedCommands } : null,
    github: github ? { fileRows: [...document.querySelectorAll('a.Link--primary')].filter(vis).map(txt).slice(0, 40), lineIds: document.querySelectorAll('[id^="LC"]').length, lineNumbers: document.querySelectorAll('[data-line-number]').length } : undefined,
    firstText: document.body.innerText.replace(/\n{2,}/g, '\n').slice(0, 900),
  };
}, has('github'));
await page.screenshot({ path: path.join(out, 'probe.png') }); await browser.close();
console.log(JSON.stringify(report, null, 1)); console.log(logs.join('\n') || '(no console or API errors)'); console.log('screenshot: video_v4/out/probe.png');
