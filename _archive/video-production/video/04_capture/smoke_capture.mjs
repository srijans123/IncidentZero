import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const SCRIPT_DIR = path.dirname(__filename);
const ROOT_DIR = path.resolve(SCRIPT_DIR, '..', '..');
const OUT_DIR = SCRIPT_DIR;
const HTML_FILE = path.join(ROOT_DIR, 'landing.html');

// Simple static server for landing.html
const srv = http.createServer((req, res) => {
  const cleanUrl = decodeURIComponent((req.url || '/').split('?')[0]).replace(/^\/+/, '');
  const searchPaths = [
    path.join(ROOT_DIR, cleanUrl || 'landing.html'),
    path.join(ROOT_DIR, 'frontend', 'public', cleanUrl || 'landing.html')
  ];
  let found = null;
  for (const p of searchPaths) {
    if (fs.existsSync(p) && !fs.statSync(p).isDirectory()) {
      found = p;
      break;
    }
  }
  if (!found) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const ext = path.extname(found).toLowerCase();
  const mime = { '.html': 'text/html', '.png': 'image/png', '.svg': 'image/svg+xml', '.js': 'application/javascript', '.css': 'text/css' };
  res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
  fs.createReadStream(found).pipe(res);
});

srv.listen(0, '127.0.0.1', async () => {
  const port = srv.address().port;
  console.log(`Smoke server listening on port ${port}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: path.join(OUT_DIR, 'raw_smoke'),
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${port}/landing.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2200);

  const video = page.video();
  await context.close();
  await browser.close();
  srv.close();

  const rawPath = await video.path();
  const mp4Path = path.join(OUT_DIR, 'smoke_capture.mp4');
  execSync(`ffmpeg -y -i "${rawPath.replace(/\\/g, '/')}" -t 2 -c:v libx264 -pix_fmt yuv420p -r 30 "${mp4Path.replace(/\\/g, '/')}"`, { stdio: 'ignore' });
  console.log(`Saved smoke capture MP4: ${mp4Path}`);
  process.exit(0);
});

