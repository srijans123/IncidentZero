#!/usr/bin/env node
/**
 * scripts/demo-seed.mjs
 * Seeds the 4 demo tickets specified in ANTIGRAVITY_MASTER_BRIEF A27 & SCRIPT.md Section 1.
 * Logs in as diya@bits.campus and creates the tickets via the real REST API.
 */

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8080/api/v1';

const TICKETS = [
  {
    title: 'Hostel Wi-Fi drops every few minutes in Vyas Bhawan',
    description: 'The connection to the hostel network disconnects every five minutes since last night.',
    serviceCode: 'NET-WIFI-HOSTEL',
    urgency: 2, // High
  },
  {
    title: 'Projector in classroom F102 shows no signal',
    description: 'The projector stays on a blue screen with any laptop and any cable we tried.',
    serviceCode: 'HW-AV',
    urgency: 1, // Standard
  },
  {
    title: 'Cannot print from the department printer',
    description: 'Print jobs stay in the queue and nothing comes out of the printer on the first floor.',
    serviceCode: 'HW-PRINT',
    urgency: 1, // Standard
  },
  {
    title: 'ERP timetable page is blank after login',
    description: 'After logging in to the ERP the timetable page loads as an empty white page.',
    serviceCode: 'APP-ERP',
    urgency: 2, // High
  },
];

async function seed() {
  console.log(`[*] Authenticating with ${API_BASE}/auth/login as diya@bits.campus...`);

  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'diya@bits.campus',
      password: 'Bits@2026',
    }),
  });

  if (!loginRes.ok) {
    const text = await loginRes.text();
    console.error(`[X] Login failed (${loginRes.status}):`, text);
    process.exit(1);
  }

  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('[✓] Logged in successfully. Creating 4 demo tickets...');

  for (const t of TICKETS) {
    const res = await fetch(`${API_BASE}/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(t),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[X] Failed to create incident "${t.title}":`, errText);
      process.exit(1);
    }

    const created = await res.json();
    console.log(`[✓] Created [${created.number || created.id}] "${created.title}" -> Assignee: ${created.assigneeName || 'Auto-Assigned'}, Priority: ${created.priority}`);
  }

  console.log('[✓] demo-seed completed successfully. All 4 tickets active in live queues.');
}

seed().catch((err) => {
  console.error('[X] Unexpected error during demo-seed:', err);
  process.exit(1);
});
