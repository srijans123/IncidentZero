#!/usr/bin/env node
// kit/terminal.mjs — runs the four proof commands FOR REAL and saves their output to video_v4/terminal/<id>.txt.
// The video types the command text and then prints these saved files, so nothing on screen is invented.
// Run it AFTER take T09 is recorded (it needs the closed demo ticket) and with the backend still running.
//   node video_v4/kit/terminal.mjs            all four
//   node video_v4/kit/terminal.mjs m1 arch    only those
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { REPO, V4 } from './lib.mjs';

const OUT = path.join(V4, 'terminal'); fs.mkdirSync(OUT, { recursive: true });
const API = process.env.API_BASE_URL || 'http://localhost:8080/api/v1';
const PASSWORD = process.env.DEMO_PASSWORD || 'Bits@2026';
const DEMO_TITLE = 'Cannot open Moodle quiz, login keeps timing out';
const EMAIL = { 'Vikram Rao': 'tech.vikram@bits.campus', 'Priya Menon': 'lead.priya@bits.campus', 'Rohan Kulkarni': 'tech.rohan@bits.campus', 'Ananya Iyer': 'tech.ananya@bits.campus' };
const save = (id, text, mustContain) => {
  for (const m of mustContain) if (!text.includes(m)) { console.log(`FAIL ${id}: real output does not contain ${JSON.stringify(m)}\n----\n${text.slice(-1500)}\n----`); return false; }
  fs.writeFileSync(path.join(OUT, id + '.txt'), text.trimEnd() + '\n'); console.log(`OK   ${id}: ${text.trimEnd().split('\n').length} lines saved`); return true;
};
const sh = (cmd) => { const r = spawnSync(cmd, { cwd: REPO, shell: true, encoding: 'utf8', maxBuffer: 64e6 }); return (r.stdout || '') + (r.stderr || ''); };
const login = async (email) => { const r = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: PASSWORD }) }); if (!r.ok) throw new Error(`login ${email} -> ${r.status}`); return (await r.json()).accessToken; };

const jobs = {
  // 1. closing an already closed ticket must answer 409
  async illegal() {
    const admin = await login('admin@bits.campus');
    const list = await (await fetch(`${API}/incidents?limit=60`, { headers: { Authorization: `Bearer ${admin}` } })).json();
    const t = (list.items || list).find((i) => i.title === DEMO_TITLE && (i.status || i.state) === 'CLOSED');
    if (!t) { console.log('FAIL illegal: no CLOSED ticket titled "' + DEMO_TITLE + '". Record take T09 first.'); return false; }
    const detail = await (await fetch(`${API}/incidents/${t.id}`, { headers: { Authorization: `Bearer ${admin}` } })).json();
    const name = detail.assignee?.name || detail.assigneeName; const email = EMAIL[name];
    if (!email) { console.log('FAIL illegal: do not know the email of assignee ' + name); return false; }
    const tech = await login(email);
    const r = await fetch(`${API}/incidents/${t.id}/commands/close`, { method: 'POST', headers: { Authorization: `Bearer ${tech}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ closureNote: 'closing it again' }) });
    const body = await r.json(); delete body.traceId;
    return save('illegal', JSON.stringify(body, null, 2), ['"status": 409', '"code": "ITSM-4090"', '"currentState": "CLOSED"', '"attemptedCommand": "CLOSE"']);
  },
  // 2. editing an audit row must be refused by the database trigger
  async psql() {
    const py = fs.existsSync(path.join(REPO, 'video/.venv/Scripts/python.exe')) ? 'video\\.venv\\Scripts\\python' : 'python';
    const code = [
      'import sys; sys.path.insert(0, "scripts")', 'from demo_db_helper import get_demo_conn', 'c = get_demo_conn(); c.autocommit = True; cur = c.cursor()',
      'try:', '    cur.execute("UPDATE audit_record SET description = \'edited\' WHERE chain_index = 1")', '    print("UPDATE", cur.rowcount)',
      'except Exception as e:', '    print("ERROR:  " + str(e).strip().splitlines()[0])',
    ].join('\n');
    const f = path.join(OUT, '_psql.py'); fs.writeFileSync(f, code); const out = sh(`${py} "${f}"`); fs.rmSync(f, { force: true });
    return save('psql', out, ['audit_record is append-only']);
  },
  // 3. the randomised state-machine harness
  async m1() { const out = sh('bash scripts/verify-m1.sh'); return save('m1', out.trimEnd().split('\n').slice(-14).join('\n'), ['SUMMARY: 24 passed, 0 failed']); },
  // 4. the architecture rules
  async arch() {
    const out = sh('mvn -f backend/pom.xml test -Dtest=ArchitectureTest');
    const keep = out.split('\n').filter((l) => /Running .*ArchitectureTest|Tests run:|BUILD (SUCCESS|FAILURE)|Total time/.test(l)).slice(-7).join('\n');
    return save('arch', keep, ['BUILD SUCCESS', 'Failures: 0']);
  },
};
const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(jobs); let ok = true;
for (const id of want) { try { ok = (await jobs[id]()) && ok; } catch (e) { console.log(`FAIL ${id}: ${e.message}`); ok = false; } }
process.exit(ok ? 0 : 1);
