// video_v3/rasterize_svgs.mjs
// Rasterizes all SVGs (code cards, diagrams, terminals, titles, member slots) into 1920x1080 PNGs
// using Playwright Chromium with crispEdges rendering.

import { chromium } from '../frontend/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const outDir = path.join(repoRoot, 'video_v3/06_frames');
fs.mkdirSync(outDir, { recursive: true });

async function rasterizeAll() {
  console.log('Rasterizing all visual SVG assets into 1920x1080 PNGs...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

  const svgDirs = [
    { dir: path.join(repoRoot, 'video_v3/05_cards'), prefix: '' },
    { dir: path.join(repoRoot, 'video/claude_fixed/01_15_diagrams'), prefix: '' },
    { dir: path.join(repoRoot, 'video/claude_fixed/03_07_terminals'), prefix: '' },
    { dir: path.join(repoRoot, 'video/claude_fixed/04_06_title_cards'), prefix: '' },
    { dir: path.join(repoRoot, 'video/claude_fixed/05_04_member_slots'), prefix: '' },
  ];

  let count = 0;
  for (const { dir, prefix } of svgDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));
    for (const file of files) {
      const baseName = path.basename(file, '.svg');
      const svgPath = path.join(dir, file);
      const outPng = path.join(outDir, `${prefix}${baseName}.png`);

      const rawSvg = fs.readFileSync(svgPath, 'utf8');
      const html = `<!DOCTYPE html><html><head><style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { width: 1920px; height: 1080px; overflow: hidden; background: #1E1646; }
        svg { width: 1920px; height: 1080px; display: block; shape-rendering: crispEdges; }
      </style></head><body>${rawSvg}</body></html>`;

      await page.setContent(html);
      await page.screenshot({ path: outPng });
      count++;
      process.stdout.write(`\rRasterized [${count}] ${baseName}.png`);
    }
  }

  await browser.close();
  console.log(`\n[✓] Successfully rasterized all ${count} SVGs into ${outDir}`);
}

rasterizeAll().catch(err => {
  console.error('Error rasterizing SVGs:', err);
  process.exit(1);
});
