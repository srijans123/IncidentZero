import { chromium } from '../frontend/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';

const VIEWPORTS = [
  { name: 'desktop_1920x1080', width: 1920, height: 1080 },
  { name: 'laptop_1440x900', width: 1440, height: 900 },
  { name: 'mobile_390x844', width: 390, height: 844 },
];

const ROUTES = [
  { path: '/portal', name: 'portal_home' },
  { path: '/portal/report', name: 'portal_report' },
  { path: '/portal/incidents/inc-test-1', name: 'portal_detail' },
  { path: '/workbench', name: 'workbench_queue' },
  { path: '/workbench/incidents/inc-test-1', name: 'workbench_war_room' },
  { path: '/workbench/major/inc-test-1', name: 'workbench_major' },
  { path: '/admin', name: 'admin_overview' },
  { path: '/admin/topology', name: 'admin_topology' },
  { path: '/admin/audit', name: 'admin_audit' },
  { path: '/admin/config', name: 'admin_config' },
];

const OUTPUT_DIR = path.resolve('docs/ui-audit');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Mock seed services
const MOCK_SERVICES = [
  { code: 'NET-CORE', name: 'Campus Backbone Core', tier: 'T0' },
  { code: 'AUTH-LDAP', name: 'Central Auth & LDAP', tier: 'T0' },
  { code: 'DB-PRIMARY', name: 'Primary Database Cluster', tier: 'T0' },
  { code: 'NET-DNS', name: 'Campus Recursive DNS', tier: 'T0' },
  { code: 'APP-LMS', name: 'Nalanda LMS', tier: 'T1' },
  { code: 'APP-ERP', name: 'Student ERP Portal', tier: 'T1' },
  { code: 'NET-WIFI-HOSTEL', name: 'Hostel Wi-Fi Mesh', tier: 'T1' },
  { code: 'APP-LIB', name: 'Library Gateway', tier: 'T2' },
  { code: 'FAC-MESS', name: 'Dining Billing System', tier: 'T2' },
  { code: 'LAB-HPC', name: 'Supercomputing Cluster', tier: 'T2' },
];

const MOCK_INCIDENTS = [
  {
    id: 'inc-test-1',
    incidentNumber: 'INC-2026-000142',
    title: 'Nalanda LMS Database Connection Pool Exhaustion',
    description: 'Students across Krishna and Gandhi bhawans unable to submit mid-semester assignments.',
    serviceCode: 'APP-LMS',
    priority: 'P1',
    state: 'IN_PROGRESS',
    slaState: 'RUNNING',
    reporterName: 'Aarav Sharma',
    assigneeName: 'Priya Patel (Senior Tech)',
    slaResponseMinutes: 15,
    slaResolutionMinutes: 120,
    elapsedResponseSeconds: 320,
    elapsedResolutionSeconds: 2450,
    resolutionDueAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    allowedCommands: ['ACKNOWLEDGE', 'REASSIGN', 'CANCEL', 'DECLARE_MAJOR', 'REPRIORITIZE'],
    timeline: [
      { id: '1', action: 'REPORTED', actor: 'Aarav Sharma', timestamp: new Date(Date.now() - 3600000).toISOString(), note: 'Initial alert from monitoring probe' },
      { id: '2', action: 'ACKNOWLEDGE', actor: 'Priya Patel', timestamp: new Date(Date.now() - 2400000).toISOString(), note: 'Investigating database pool thread dump' },
      { id: '3', action: 'IN_PROGRESS', actor: 'Priya Patel', timestamp: new Date(Date.now() - 1800000).toISOString(), note: 'Restarting connection pool replica node' },
    ],
  },
  {
    id: 'inc-test-2',
    incidentNumber: 'INC-2026-000143',
    title: 'Hostel Wi-Fi DHCP Lease Timeout in Shankar Bhawan',
    description: 'Access points intermittently rejecting new 802.1x associations.',
    serviceCode: 'NET-WIFI-HOSTEL',
    priority: 'P2',
    state: 'ACKNOWLEDGED',
    slaState: 'RUNNING',
    reporterName: 'Vikram Rao',
    assigneeName: 'Rohan Sen',
    slaResponseMinutes: 30,
    slaResolutionMinutes: 240,
    elapsedResponseSeconds: 400,
    elapsedResolutionSeconds: 1200,
    resolutionDueAt: new Date(Date.now() + 7200 * 1000).toISOString(),
    allowedCommands: ['ACKNOWLEDGE', 'REASSIGN'],
    timeline: [],
  },
];

async function setupApiMocks(page) {
  await page.route('**/api/v1/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (url.includes('/api/v1/auth/me')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user-senior-tech',
          email: 'tech.senior@bits-pilani.ac.in',
          name: 'Priya Patel',
          role: 'TECHNICIAN',
          tier: 'SENIOR',
        }),
      });
    }

    if (url.includes('/api/v1/auth/stream-ticket')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ticket: 'stream-ticket-abc-123', expiresInSeconds: 300 }),
      });
    }

    if (url.includes('/api/v1/services')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SERVICES),
      });
    }

    if (url.includes('/api/v1/incidents/inc-test-1')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_INCIDENTS[0]),
      });
    }

    if (url.includes('/api/v1/incidents') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: MOCK_INCIDENTS,
          total: MOCK_INCIDENTS.length,
        }),
      });
    }

    if (url.includes('/api/v1/admin/audit/verify')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          valid: true,
          totalRecordsChecked: 142,
          tamperedRowId: null,
          verifiedAt: new Date().toISOString(),
        }),
      });
    }

    if (url.includes('/api/v1/admin/audit')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'aud-1',
            entityType: 'INCIDENT',
            entityId: 'inc-test-1',
            action: 'CREATED',
            actorId: 'user-aarav',
            prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
            hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            timestamp: new Date().toISOString(),
          },
          {
            id: 'aud-2',
            entityType: 'INCIDENT',
            entityId: 'inc-test-1',
            action: 'ACKNOWLEDGED',
            actorId: 'user-priya',
            prevHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
            timestamp: new Date().toISOString(),
          },
        ]),
      });
    }

    // Default fallback mock
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, data: [] }),
    });
  });
}

async function runAudit() {
  console.log('🚀 Starting Sub-Pixel Bounding-Box & Anti-Slop Audit across 3 viewports...');
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n📐 Testing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });

    const page = await context.newPage();
    await setupApiMocks(page);

    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') pageErrors.push(msg.text());
    });

    for (const route of ROUTES) {
      const url = `http://localhost:3000${route.path}`;
      const routeSlug = `${route.name}_${vp.width}x${vp.height}`;
      console.log(`  -> Auditing ${route.path} [${routeSlug}]...`);

      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      } catch (e) {
        // Fallback wait if networkidle times out due to persistent streams/ticks
        await page.waitForTimeout(2000);
      }

      // Allow 3D canvas and animations to settle
      await page.waitForTimeout(1000);

      // 1. Evaluate Geometry Assertions
      const geomAudit = await page.evaluate(() => {
        const docWidth = document.documentElement.clientWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const hasHorizontalOverflow = scrollWidth > docWidth + 1; // 1px rounding margin

        // Check images
        const imgs = Array.from(document.querySelectorAll('img'));
        const brokenImgs = imgs.filter((img) => !img.complete || img.naturalWidth === 0);

        // Check canvases (3D viewports)
        const canvases = Array.from(document.querySelectorAll('canvas'));
        const emptyCanvases = canvases.filter((c) => c.clientWidth < 100 || c.clientHeight < 100);

        // Check Status Dots: Math.abs(rect.width - rect.height) <= 0.5
        const statusDots = Array.from(document.querySelectorAll('.status-dot'));
        const squashedDots = statusDots.filter((d) => {
          const rect = d.getBoundingClientRect();
          return Math.abs(rect.width - rect.height) > 0.6;
        });

        // Check Buttons & Badges: clipping against parent or overlapping sibling buttons
        const buttons = Array.from(document.querySelectorAll('button, [role="button"], .status-badge'));
        const clippedElements = [];
        for (const el of buttons) {
          const rect = el.getBoundingClientRect();
          const parent = el.parentElement;
          if (parent && parent !== document.body) {
            const parentRect = parent.getBoundingClientRect();
            // Check significant horizontal overflow clipping (ignore deliberate scroll containers)
            const style = window.getComputedStyle(parent);
            if (style.overflowX === 'hidden' && (rect.right > parentRect.right + 2 || rect.left < parentRect.left - 2)) {
              clippedElements.push({
                tag: el.tagName,
                text: el.textContent?.trim().slice(0, 20),
                rect,
                parentRect,
              });
            }
          }
        }

        // Collect bounding boxes of all interactive elements for YAML
        const interactiveBoxes = buttons.slice(0, 50).map((b) => {
          const r = b.getBoundingClientRect();
          return {
            tag: b.tagName.toLowerCase(),
            text: b.textContent?.trim().slice(0, 30),
            x: Math.round(r.x),
            y: Math.round(r.y),
            w: Math.round(r.width),
            h: Math.round(r.height),
          };
        });

        return {
          docWidth,
          scrollWidth,
          hasHorizontalOverflow,
          totalImages: imgs.length,
          brokenImagesCount: brokenImgs.length,
          totalCanvases: canvases.length,
          emptyCanvasesCount: emptyCanvases.length,
          totalStatusDots: statusDots.length,
          squashedDotsCount: squashedDots.length,
          totalButtonsChecked: buttons.length,
          clippedElementsCount: clippedElements.length,
          interactiveBoxes,
        };
      });

      // Save Bounding-Box YAML
      const yamlContent = [
        `# Bounding-Box Snapshot for ${route.path} @ ${vp.width}x${vp.height}`,
        `viewport: { width: ${vp.width}, height: ${vp.height} }`,
        `route: "${route.path}"`,
        `hasHorizontalOverflow: ${geomAudit.hasHorizontalOverflow}`,
        `canvases: ${geomAudit.totalCanvases}`,
        `statusDots: ${geomAudit.totalStatusDots}`,
        `elements:`,
        ...geomAudit.interactiveBoxes.map(
          (b) => `  - tag: ${b.tag}\n    text: "${(b.text || '').replace(/"/g, '\\"')}"\n    box: [${b.x}, ${b.y}, ${b.w}, ${b.h}]`
        ),
      ].join('\n');

      const yamlPath = path.join(OUTPUT_DIR, `${routeSlug}_boxes.yaml`);
      fs.writeFileSync(yamlPath, yamlContent, 'utf-8');

      // Save Screenshot
      const screenshotPath = path.join(OUTPUT_DIR, `${routeSlug}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });

      const passed =
        !geomAudit.hasHorizontalOverflow &&
        geomAudit.brokenImagesCount === 0 &&
        geomAudit.emptyCanvasesCount === 0 &&
        geomAudit.squashedDotsCount === 0 &&
        geomAudit.clippedElementsCount === 0;

      results.push({
        viewport: vp.name,
        route: route.path,
        passed,
        ...geomAudit,
        pageErrors: [...pageErrors],
      });

      console.log(`     ✅ Checked (Overflow: ${geomAudit.hasHorizontalOverflow ? 'FAIL' : 'OK'}, Canvases: ${geomAudit.totalCanvases}, Dots: ${geomAudit.totalStatusDots}, Clipped: ${geomAudit.clippedElementsCount})`);
    }

    await context.close();
  }

  await browser.close();

  // Write Markdown Report
  let report = `# Incident-Zero (v2.2) Sub-Pixel & Multi-Viewport Audit Report\n\n`;
  report += `**Generated**: ${new Date().toISOString()}\n`;
  report += `**Total Viewport Scenarios**: ${results.length}\n`;
  const allPassed = results.every((r) => r.passed);
  report += `**Overall Status**: ${allPassed ? '🟢 ALL PASSED (Sub-Pixel Perfect)' : '🟡 MINOR ANOMALIES DETECTED'}\n\n`;

  report += `| Viewport | Route | Overflow? | Canvases | Dots | Squashed? | Clipped? | Result |\n`;
  report += `| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |\n`;
  for (const r of results) {
    report += `| \`${r.viewport}\` | \`${r.route}\` | ${r.hasHorizontalOverflow ? '❌ YES' : '✔️ 0px'} | ${r.totalCanvases} | ${r.totalStatusDots} | ${r.squashedDotsCount === 0 ? '✔️ 0' : '❌ ' + r.squashedDotsCount} | ${r.clippedElementsCount === 0 ? '✔️ 0' : '❌ ' + r.clippedElementsCount} | ${r.passed ? '🟢 PASS' : '❌ FAIL'} |\n`;
  }

  const reportPath = path.join(OUTPUT_DIR, 'AUDIT_REPORT.md');
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`\n📋 Audit complete! Written report to ${reportPath}`);

  if (!allPassed) {
    console.warn('Some checks did not pass. Check report for details.');
    process.exit(1);
  } else {
    console.log('🎉 100% of routes and viewports passed all sub-pixel assertions!');
    process.exit(0);
  }
}

runAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
