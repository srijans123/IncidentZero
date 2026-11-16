// frontend/src/services/demoBackend.ts
//
// In-browser backend used when no Java server is reachable (GitHub Pages, or
// localhost with the backend switched off). It is a faithful TypeScript port of
// the rules in the Java domain, so the same clicks give the same results:
//
//   - transitions and allowed commands   -> incident/domain/*State.java
//   - who may run which command          -> incident/application/CommandAuthorizer.java
//   - priority                           -> incident/application/priority/ItilMatrixPriorityStrategy.java
//   - SLA targets                        -> db/migration/R__campus_seed.sql (sla_policy)
//   - payload rules                      -> Incident.createWithNumber, Resolution, StateSupport
//   - audit chain                        -> audit/domain/AuditHasher.java (SHA-256, previous hash chained)
//
// Known simplifications (shown in the header badge as "DEMO MODE"):
//   - every SLA clock counts all hours (the Java BusinessCalendar is not ported)
//   - assignment is always "least loaded" over three technicians
//   - data lives in this browser's localStorage only
//
// Errors are thrown in the same shape api.ts produces for the real server:
//   err.status (HTTP status), err.body.code (ITSM-xxxx), err.body.detail, err.message

import { Incident, IntakeAdvice, AuditVerificationResult, RcaResult, User, TimelineItem } from '../types';

// ---------------------------------------------------------------- mode switch
// Build-time default: demo on any host that is not localhost, unless a real API
// origin was configured. main.tsx may switch it on at runtime when localhost has
// no backend (see probeBackend in api.ts).
const BUILD_TIME_DEMO =
  !import.meta.env.VITE_API_BASE_URL &&
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1';

let demoMode = BUILD_TIME_DEMO;
export const isDemoMode = () => demoMode;
export const setDemoMode = (on: boolean) => {
  demoMode = on;
};
/** @deprecated kept for old imports; prefer isDemoMode() */
export const IS_DEMO_MODE = BUILD_TIME_DEMO;

// ---------------------------------------------------------------- local event bus (replaces SSE)
type DemoEvent = { type: 'incident.created' | 'incident.updated'; data: { id: string } };
const listeners = new Set<(e: DemoEvent) => void>();
export const demoEvents = {
  subscribe(fn: (e: DemoEvent) => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};
function emit(type: DemoEvent['type'], id: string) {
  const evt: DemoEvent = { type, data: { id } };
  setTimeout(() => listeners.forEach((fn) => fn(evt)), 0);
}

// ---------------------------------------------------------------- reference data
const KEY_INCIDENTS = 'iitsm_demo_incidents_v2';
const KEY_AUDIT = 'iitsm_demo_audit_v2';
const GENESIS_HASH = '0'.repeat(64);
const SYSTEM = '00000000-0000-0000-0000-000000000000';

export const PREDEFINED_USERS: User[] = [
  { id: '019299a0-0000-7000-8000-000000000001', name: 'Aarav Sharma', email: 'emp@bits.campus', role: 'EMPLOYEE' },
  { id: '019299a0-0000-7000-8000-000000000002', name: 'Diya Nair', email: 'diya@bits.campus', role: 'EMPLOYEE' },
  { id: '019299a0-0000-7000-8000-000000000003', name: 'Vikram Rao', email: 'tech.vikram@bits.campus', role: 'TECHNICIAN', supportTier: 'L1', teamId: 'SD', teamName: 'Campus Service Desk' },
  { id: '019299a0-0000-7000-8000-000000000004', name: 'Priya Menon', email: 'lead.priya@bits.campus', role: 'TECHNICIAN', supportTier: 'TEAM_LEAD', teamId: 'APP', teamName: 'Applications Team' },
  { id: '019299a0-0000-7000-8000-000000000005', name: 'Rohan Kulkarni', email: 'tech.rohan@bits.campus', role: 'TECHNICIAN', supportTier: 'SENIOR', teamId: 'INFRA', teamName: 'Infrastructure & ERP' },
  { id: '019299a0-0000-7000-8000-000000000006', name: 'Ananya Iyer', email: 'tech.ananya@bits.campus', role: 'TECHNICIAN', supportTier: 'L1', teamId: 'NOC', teamName: 'Network Ops (NOC)' },
  { id: '019299a0-0000-7000-8000-000000000007', name: 'Suresh Deshmukh', email: 'admin@bits.campus', role: 'ADMINISTRATOR' },
  { id: '019299a0-0000-7000-8000-000000000008', name: 'Prof. Kavita Krishnan', email: 'manager@bits.campus', role: 'ADMINISTRATOR' },
];

export const PREDEFINED_SERVICES = [
  { id: '30000000-0000-0000-0000-000000000001', code: 'NET-CORE', name: 'Campus Core Fiber & Backbone Switch', tier: 'T0' },
  { id: '30000000-0000-0000-0000-000000000002', code: 'AUTH-LDAP', name: 'Central LDAP & Campus SSO', tier: 'T0' },
  { id: '30000000-0000-0000-0000-000000000003', code: 'DB-PRIMARY', name: 'Primary PostgreSQL/Oracle DB Cluster', tier: 'T0' },
  { id: '30000000-0000-0000-0000-000000000004', code: 'NET-DNS', name: 'Campus DNS & DHCP Cluster', tier: 'T0' },
  { id: '30000000-0000-0000-0000-000000000005', code: 'FAC-HVAC', name: 'Data Center Power & Cooling', tier: 'T1' },
  { id: '30000000-0000-0000-0000-000000000006', code: 'APP-ERP', name: 'Student ERP & Course Registration Portal', tier: 'T1' },
  { id: '30000000-0000-0000-0000-000000000007', code: 'APP-LMS', name: 'Moodle LMS', tier: 'T1' },
  { id: '30000000-0000-0000-0000-000000000008', code: 'APP-MAIL', name: 'Campus Email & Google Workspace Bridge', tier: 'T1' },
  { id: '30000000-0000-0000-0000-000000000009', code: 'NET-WIFI-HOSTEL', name: 'Hostel Bhawan Aruba Wi-Fi Controllers', tier: 'T1' },
  { id: '30000000-0000-0000-0000-000000000010', code: 'NET-LAN-ACAD', name: 'Academic Block Wired LAN & Wi-Fi', tier: 'T1' },
  { id: '30000000-0000-0000-0000-000000000011', code: 'APP-MESS-PAY', name: 'SWD Mess & Fee Payment Gateway', tier: 'T1' },
  { id: '30000000-0000-0000-0000-000000000012', code: 'APP-LIB', name: 'Digital Library EZProxy & Journals', tier: 'T2' },
  { id: '30000000-0000-0000-0000-000000000013', code: 'APP-SWD', name: 'Student Welfare Division (SWD) Intranet', tier: 'T2' },
  { id: '30000000-0000-0000-0000-000000000014', code: 'APP-MESS-BIO', name: 'Biometric Mess Attendance Terminals', tier: 'T2' },
  { id: '30000000-0000-0000-0000-000000000015', code: 'FAC-CCTV', name: 'Campus IP CCTV Surveillance Grid', tier: 'T2' },
  { id: '30000000-0000-0000-0000-000000000016', code: 'NET-VPN', name: 'Remote Access Campus VPN', tier: 'T2' },
  { id: '30000000-0000-0000-0000-000000000017', code: 'HW-AV', name: 'Smart Classroom AV & LTC Projectors', tier: 'T3' },
  { id: '30000000-0000-0000-0000-000000000018', code: 'HW-LAB', name: 'IPC Computing Lab Workstations', tier: 'T3' },
  { id: '30000000-0000-0000-0000-000000000019', code: 'HW-PRINT', name: 'Department Network Printers & Scanners', tier: 'T3' },
];

// sla_policy rows from R__campus_seed.sql: [response minutes, resolution minutes]
const SLA_POLICY: Record<string, Record<string, [number, number]>> = {
  T0: { P1: [5, 30], P2: [10, 90], P3: [30, 360], P4: [120, 960] },
  T1: { P1: [5, 30], P2: [15, 120], P3: [60, 480], P4: [240, 1440] },
  T2: { P1: [10, 60], P2: [30, 240], P3: [120, 720], P4: [480, 2880] },
  T3: { P1: [15, 120], P2: [60, 480], P3: [240, 1440], P4: [480, 4320] },
};

// ItilMatrixPriorityStrategy.MATRIX[impact-1][urgency-1]
const MATRIX = [
  ['P4', 'P4', 'P3'],
  ['P4', 'P3', 'P2'],
  ['P3', 'P2', 'P1'],
];
const bump = (p: string) => (p === 'P4' ? 'P3' : p === 'P3' ? 'P2' : 'P1');

// CategorizationAdapter keyword rules (first match wins)
const KEYWORD_RULES: [string[], string, string][] = [
  [['moodle', 'lms', 'quiz'], 'APP-LMS', 'SOFTWARE'],
  [['erp', 'timetable', 'registration'], 'APP-ERP', 'SOFTWARE'],
  [['wi-fi', 'wifi', 'hostel network'], 'NET-WIFI-HOSTEL', 'NETWORK'],
  [['vpn'], 'NET-VPN', 'NETWORK'],
  [['mail', 'gmail'], 'APP-MAIL', 'SOFTWARE'],
  [['projector', 'classroom'], 'HW-AV', 'HARDWARE'],
  [['printer', 'print'], 'HW-PRINT', 'HARDWARE'],
  [['lab computer', 'workstation'], 'HW-LAB', 'HARDWARE'],
  [['mess', 'fee payment'], 'APP-MESS-PAY', 'SOFTWARE'],
  [['library', 'journal'], 'APP-LIB', 'SOFTWARE'],
  [['login', 'sso', 'password'], 'AUTH-LDAP', 'ACCESS'],
];
function classify(text: string): { serviceCode: string; category: string; matched: string | null } {
  const t = text.toLowerCase();
  for (const [words, serviceCode, category] of KEYWORD_RULES) {
    const hit = words.find((w) => t.includes(w));
    if (hit) return { serviceCode, category, matched: hit };
  }
  return { serviceCode: 'APP-ERP', category: 'SOFTWARE', matched: null };
}

// Technicians that auto-assignment may pick (team leads are not auto-assigned)
const ASSIGNABLE = ['019299a0-0000-7000-8000-000000000003', '019299a0-0000-7000-8000-000000000005', '019299a0-0000-7000-8000-000000000006'];
const CAPACITY_POINTS = 8;
const WEIGHT: Record<string, number> = { P1: 4, P2: 3, P3: 2, P4: 1 };

// ---------------------------------------------------------------- stored record
type ClockState = 'RUNNING' | 'PAUSED' | 'STOPPED';
interface Clock {
  state: ClockState;
  consumedMs: number;
  lastResumeAt: number;
  targetMs: number;
}
interface Rec {
  id: string;
  number: string;
  title: string;
  description: string;
  serviceCode: string;
  serviceTier: string;
  category: string;
  impact: number;
  urgency: number;
  state: string;
  priority: string;
  steps: { rule: string; before: string | null; after: string; reason: string }[];
  reporterId: string;
  assigneeId?: string;
  createdAt: string;
  respondedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  reopenCount: number;
  major: boolean;
  breached: boolean;
  rating?: number;
  closureNote?: string;
  resolution?: { code: string; notes: string; rootCauseCategory?: string };
  question?: string;
  response: Clock;
  resolutionClock: Clock;
  version: number;
}
interface AuditEntry {
  id: string;
  incidentId: string;
  incidentNumber: string;
  chainIndex: number;
  eventType: string;
  summary: string;
  previousHash: string;
  hash: string;
  actorId: string;
  actorType: string;
  actorName: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

// ---------------------------------------------------------------- errors (same shape as the server's problem details)
function fail(status: number, code: string, detail: string, extra: Record<string, unknown> = {}): never {
  const err: any = new Error(detail);
  err.status = status;
  err.body = { status, code, title: code, detail, ...extra };
  throw err;
}
const illegal = (r: Rec, command: string): never =>
  fail(409, 'ITSM-4090', `Illegal transition: ${command} is not allowed in state ${r.state}`, {
    currentState: r.state,
    attemptedCommand: command,
  });
const forbidden = (actorId: string, op: string): never =>
  fail(403, 'ITSM-4030', `Actor ${actorId} is not authorized to perform ${op}`);
const invalid = (field: string, reason: string): never => fail(422, 'ITSM-4220', `Invalid field '${field}': ${reason}`);
const requireText = (field: string, value: unknown): string => {
  if (typeof value !== 'string' || !value.trim()) invalid(field, 'must not be blank');
  return (value as string).trim();
};

// ---------------------------------------------------------------- storage
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: keep working in memory for this call */
  }
}
const loadAudit = () => read<AuditEntry[]>(KEY_AUDIT, []);

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
const hashInput = (e: Omit<AuditEntry, 'hash' | 'id' | 'summary' | 'incidentNumber' | 'actorName'>) =>
  [e.previousHash, e.incidentId, e.chainIndex, e.timestamp, e.actorType, e.actorId, e.eventType, JSON.stringify(e.payload)].join('|');

async function audit(r: Rec, eventType: string, actor: User | null, summary: string, payload: Record<string, unknown> = {}) {
  const all = loadAudit();
  const chain = all.filter((a) => a.incidentId === r.id);
  const last = chain[chain.length - 1];
  const base = {
    incidentId: r.id,
    chainIndex: last ? last.chainIndex + 1 : 1,
    eventType,
    previousHash: last ? last.hash : GENESIS_HASH,
    actorId: actor ? actor.id : SYSTEM,
    actorType: actor ? actor.role : 'SYSTEM',
    timestamp: new Date().toISOString(),
    payload,
  };
  const hash = await sha256Hex(hashInput(base));
  all.push({ ...base, hash, id: `${r.number}-${base.chainIndex}`, summary, incidentNumber: r.number, actorName: actor ? actor.name : 'System' });
  write(KEY_AUDIT, all);
}

// ---------------------------------------------------------------- clocks (SlaClock.java, continuous time)
const newClock = (targetMin: number, now: number): Clock => ({ state: 'RUNNING', consumedMs: 0, lastResumeAt: now, targetMs: targetMin * 60000 });
const used = (c: Clock, now: number) => c.consumedMs + (c.state === 'RUNNING' ? now - c.lastResumeAt : 0);
function halt(c: Clock, now: number, to: 'PAUSED' | 'STOPPED') {
  if (c.state === 'RUNNING') c.consumedMs += now - c.lastResumeAt;
  if (c.state !== 'STOPPED') c.state = to;
}
function resume(c: Clock, now: number) {
  if (c.state === 'PAUSED') {
    c.state = 'RUNNING';
    c.lastResumeAt = now;
  }
}
function slaStatus(r: Rec, now: number): 'ON_TRACK' | 'AT_RISK' | 'BREACHED' {
  const ratio = Math.max(used(r.response, now) / r.response.targetMs, used(r.resolutionClock, now) / r.resolutionClock.targetMs);
  if (r.breached || ratio >= 1) return 'BREACHED'; // a breach is permanent (Incident.refreshSla)
  return ratio >= 0.75 ? 'AT_RISK' : 'ON_TRACK';
}

// ---------------------------------------------------------------- state machine (the eleven *State.java classes)
const ALLOWED: Record<string, string[]> = {
  NEW: ['CLASSIFY', 'CANCEL', 'LINK_AS_CHILD'],
  CLASSIFIED: ['CANCEL', 'ASSIGN', 'LINK_AS_CHILD', 'DECLARE_MAJOR', 'REPRIORITIZE'],
  ASSIGNED: ['ACKNOWLEDGE', 'REASSIGN', 'LINK_AS_CHILD', 'CANCEL', 'DECLARE_MAJOR', 'REPRIORITIZE'],
  ACKNOWLEDGED: ['START_INVESTIGATION', 'REASSIGN', 'LINK_AS_CHILD', 'CANCEL', 'DECLARE_MAJOR', 'REPRIORITIZE'],
  IN_PROGRESS: ['REQUEST_USER_INFO', 'RESOLVE', 'REASSIGN', 'LINK_AS_CHILD', 'CANCEL', 'DECLARE_MAJOR', 'REPRIORITIZE'],
  PENDING_USER: ['PROVIDE_USER_INFO', 'CANCEL'],
  RESOLVED: ['VERIFY', 'REJECT_RESOLUTION'],
  REOPENED: ['START_INVESTIGATION', 'REASSIGN'],
  VERIFIED: ['CLOSE'],
  CLOSED: [],
  CANCELLED: [],
};
const SLUG_TO_COMMAND: Record<string, string> = {
  acknowledge: 'ACKNOWLEDGE',
  start: 'START_INVESTIGATION',
  start_investigation: 'START_INVESTIGATION',
  'request-info': 'REQUEST_USER_INFO',
  'provide-info': 'PROVIDE_USER_INFO',
  resolve: 'RESOLVE',
  verify: 'VERIFY',
  reject: 'REJECT_RESOLUTION',
  close: 'CLOSE',
  cancel: 'CANCEL',
  reassign: 'REASSIGN',
  'declare-major': 'DECLARE_MAJOR',
};

// CommandAuthorizer.authorize
function mayRun(r: Rec, cmd: string, u: User): boolean {
  const isAdmin = u.role === 'ADMINISTRATOR';
  const isTech = u.role === 'TECHNICIAN';
  const isLead = isTech && u.supportTier === 'TEAM_LEAD';
  const isReporter = r.reporterId === u.id;
  const isAssignee = !!r.assigneeId && r.assigneeId === u.id;
  switch (cmd) {
    case 'CLASSIFY':
    case 'CLOSE':
    case 'LINK_AS_CHILD':
    case 'REPRIORITIZE':
      return isTech || isAdmin;
    case 'ASSIGN':
    case 'DECLARE_MAJOR':
      return isLead || isAdmin;
    case 'REASSIGN':
      return isLead || isAdmin || isAssignee;
    case 'ACKNOWLEDGE':
    case 'START_INVESTIGATION':
    case 'REQUEST_USER_INFO':
    case 'RESOLVE':
      return isAssignee;
    case 'PROVIDE_USER_INFO':
    case 'VERIFY':
    case 'REJECT_RESOLUTION':
      return isReporter;
    case 'CANCEL':
      return isReporter || isAdmin;
    default:
      return false;
  }
}

// ---------------------------------------------------------------- views
const userById = (id?: string) => PREDEFINED_USERS.find((u) => u.id === id);
function currentUser(): User {
  const email = (localStorage.getItem('iitsm_user_email') || 'emp@bits.campus').toLowerCase();
  return PREDEFINED_USERS.find((u) => u.email.toLowerCase() === email) || PREDEFINED_USERS[0];
}
function view(r: Rec, u: User, all: Rec[]): Incident {
  const now = Date.now();
  const dueAt = (c: Clock) => (c.state === 'RUNNING' ? new Date(now + Math.max(0, c.targetMs - used(c, now))).toISOString() : undefined);
  return {
    id: r.id,
    number: r.number,
    title: r.title,
    description: r.description,
    state: r.state as Incident['state'],
    priority: r.priority as Incident['priority'],
    impact: r.impact,
    urgency: r.urgency,
    category: r.category,
    serviceCode: r.serviceCode,
    reporterId: r.reporterId,
    reporterName: userById(r.reporterId)?.name,
    reporterEmail: userById(r.reporterId)?.email,
    assigneeId: r.assigneeId,
    assigneeName: userById(r.assigneeId)?.name,
    createdAt: r.createdAt,
    respondedAt: r.respondedAt,
    resolvedAt: r.resolvedAt,
    closedAt: r.closedAt,
    reopenCount: r.reopenCount,
    isMajor: r.major,
    childCount: 0,
    slaStatus: slaStatus(r, now),
    responseDueAt: dueAt(r.response),
    resolutionDueAt: dueAt(r.resolutionClock),
    allowedCommands: (ALLOWED[r.state] || []).filter((c) => mayRun(r, c, u) && (c !== 'START_INVESTIGATION' || !!r.assigneeId)),
    priorityExplanation: r.steps,
    assignmentExplanation: { strategy: 'LEAST_LOADED', pool: all.length },
    sla: {
      policyTier: r.serviceTier,
      responseTimeMinutes: r.response.targetMs / 60000,
      resolutionTimeMinutes: r.resolutionClock.targetMs / 60000,
      // same keys the Java API sends
      ...({
        clockMode: 'CONTINUOUS_24X7',
        responseTargetMinutes: r.response.targetMs / 60000,
        resolutionTargetMinutes: r.resolutionClock.targetMs / 60000,
        responseClock: r.response.state,
        resolutionClock: r.resolutionClock.state,
      } as object),
    },
    resolution: r.resolution,
    rating: r.rating,
    closureNote: r.closureNote,
    version: r.version,
    ...({ pendingQuestion: r.state === 'PENDING_USER' ? r.question : undefined } as object),
  };
}

// ---------------------------------------------------------------- intake (the nine steps of IntakePipeline, in order)
function loadPoints(all: Rec[], techId: string) {
  return all
    .filter((r) => r.assigneeId === techId && !['RESOLVED', 'VERIFIED', 'CLOSED', 'CANCELLED'].includes(r.state))
    .reduce((sum, r) => sum + (WEIGHT[r.priority] || 1), 0);
}

async function intake(
  all: Rec[],
  reporter: User,
  input: { title: string; description: string; serviceCode?: string; urgency?: number; impactOverride?: number },
  createdAtMs = Date.now(),
): Promise<Rec> {
  // 1 Validate (ValidateStep, Incident.createWithNumber)
  const title = requireText('title', input.title);
  const description = requireText('description', input.description);
  if (title.length < 5 || title.length > 200) invalid('title', 'must be between 5 and 200 characters');
  if (description.length < 10 || description.length > 4000) invalid('description', 'must be between 10 and 4000 characters');
  const urgency = input.urgency ?? 2;
  const impact = input.impactOverride ?? 2;
  if (impact < 1 || impact > 3) invalid('impact', 'must be between 1 and 3');
  if (urgency < 1 || urgency > 3) invalid('urgency', 'must be between 1 and 3');
  // 2 Sanitize (SanitizeRedactStep): strip tags, hide emails and phone numbers
  const clean = (s: string) =>
    s
      .replace(/<[^>]*>/g, '')
      .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[email hidden]')
      .replace(/\b\d{10}\b/g, '[phone hidden]');
  // 3 Create the provisional incident
  const text = `${title} ${description}`;
  // 4 Duplicate check is skipped in demo mode (needs the vector index)
  // 5 Category and service
  const guess = classify(text);
  const service = PREDEFINED_SERVICES.find((s) => s.code === input.serviceCode) || PREDEFINED_SERVICES.find((s) => s.code === guess.serviceCode);
  if (!service) fail(404, 'ITSM-4042', `IT Service not found: ${input.serviceCode}`);
  // 6 Enrich (EnrichStep): exam window words
  const examWindow = /quiz|exam|registration/i.test(text);
  // 7 Priority and SLA (ItilMatrixPriorityStrategy)
  const steps: Rec['steps'] = [];
  let priority = MATRIX[impact - 1][urgency - 1];
  steps.push({ rule: 'ITIL_MATRIX_BASE', before: null, after: priority, reason: `Impact ${impact} x Urgency ${urgency} -> ${priority}` });
  let bumps = 0;
  const applyBump = (rule: string, reason: string) => {
    const next = bumps === 0 ? bump(priority) : priority;
    bumps++;
    steps.push({ rule, before: priority, after: next, reason: bumps === 1 ? reason : 'Capped at +1 total modifier bump' });
    priority = next;
  };
  if (service!.tier === 'T0' && impact >= 2) applyBump('TIER_T0_BUMP', 'T0 core service with impact >= 2 (+1)');
  if (examWindow) applyBump('CALENDAR_WINDOW', 'Active exam/registration window (+1)');
  const major = service!.tier === 'T0' && impact === 3;
  if (major) {
    steps.push({ rule: 'MAJOR_OVERRIDE', before: priority, after: 'P1', reason: 'Major incident threshold triggered' });
    priority = 'P1';
  }
  const [respMin, resoMin] = SLA_POLICY[service!.tier][priority];
  const seq = all.reduce((max, r) => Math.max(max, Number(r.number.slice(-6))), 100) + 1;
  const r: Rec = {
    id: crypto.randomUUID(),
    number: `INC-2026-${String(seq).padStart(6, '0')}`,
    title: clean(title),
    description: clean(description),
    serviceCode: service!.code,
    serviceTier: service!.tier,
    category: guess.category,
    impact,
    urgency,
    state: 'CLASSIFIED',
    priority,
    steps,
    reporterId: reporter.id,
    createdAt: new Date(createdAtMs).toISOString(),
    reopenCount: 0,
    major,
    breached: false,
    response: newClock(respMin, createdAtMs),
    resolutionClock: newClock(resoMin, createdAtMs),
    version: 2,
  };
  await audit(r, 'IncidentCreated', reporter, `Reported by ${reporter.name}`, { title: r.title, service: r.serviceCode });
  await audit(r, 'IncidentClassified', null, `Classified as ${priority} (${steps.map((s) => s.rule).join(' + ')})`, { priority, category: r.category });
  // 8 Assign (LeastLoadedStrategy): drop anyone already full, then take the least busy
  const weight = WEIGHT[priority] || 1;
  const eligible = ASSIGNABLE.map((id) => ({ id, load: loadPoints(all, id) }))
    .filter((c) => c.load + weight <= CAPACITY_POINTS)
    .sort((a, b) => a.load - b.load);
  if (eligible.length) {
    r.assigneeId = eligible[0].id;
    r.state = 'ASSIGNED';
    r.version++;
    await audit(r, 'IncidentAssigned', null, `Assigned to ${userById(r.assigneeId)?.name} by LEAST_LOADED`, { assigneeId: r.assigneeId, strategy: 'LEAST_LOADED' });
  }
  // 9 Persist and publish
  all.unshift(r);
  return r;
}

let seeding: Promise<Rec[]> | null = null;
async function loadAll(): Promise<Rec[]> {
  const stored = read<Rec[] | null>(KEY_INCIDENTS, null);
  if (stored) return stored;
  if (!seeding) {
    seeding = (async () => {
      const all: Rec[] = [];
      const diya = PREDEFINED_USERS[1];
      const t = Date.now();
      // same four tickets as scripts/demo-seed.mjs
      const seed: [string, string, string, number, number][] = [
        ['Hostel Wi-Fi drops every few minutes in Vyas Bhawan', 'The connection to the hostel network disconnects every five minutes since last night.', 'NET-WIFI-HOSTEL', 2, 50],
        ['Projector in classroom F102 shows no signal', 'The projector stays on a blue screen with any laptop and any cable we tried.', 'HW-AV', 1, 38],
        ['Cannot print from the department printer', 'Print jobs stay in the queue and nothing comes out of the printer on the first floor.', 'HW-PRINT', 1, 25],
        ['ERP timetable page is blank after login', 'After logging in to the ERP the timetable page loads as an empty white page.', 'APP-ERP', 2, 12],
      ];
      write(KEY_AUDIT, []);
      for (const [title, description, serviceCode, urgency, minutesAgo] of seed) {
        await intake(all, diya, { title, description, serviceCode, urgency }, t - minutesAgo * 60000);
      }
      write(KEY_INCIDENTS, all);
      return all;
    })();
  }
  return seeding.finally(() => {
    seeding = null;
  });
}
const save = (all: Rec[]) => write(KEY_INCIDENTS, all);

/** Wipe the browser copy and start again from the four seed tickets. */
export async function resetDemoData() {
  localStorage.removeItem(KEY_INCIDENTS);
  localStorage.removeItem(KEY_AUDIT);
  await loadAll();
}

// ---------------------------------------------------------------- API (same surface as realApi in api.ts)
export const demoBackendApi = {
  auth: {
    login: async (email: string, _password?: string) => {
      const user = PREDEFINED_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) fail(401, 'ITSM-4010', 'Invalid email or password');
      return { accessToken: `demo.${user!.id}.${Date.now()}`, expiresInSeconds: 86400 };
    },
    getMe: async (): Promise<User> => currentUser(),
    issueStreamTicket: async () => ({ ticket: 'demo', expiresInSeconds: 30 }),
  },

  incidents: {
    list: async (params?: { status?: string; priority?: string; q?: string; limit?: number; parentId?: string; mine?: boolean }) => {
      const all = await loadAll();
      const u = currentUser();
      let rows = all;
      // same rule as IncidentQueryAdapter: "mine" means reported by me (student) or assigned to me (technician)
      if (params?.mine && u.role === 'EMPLOYEE') rows = rows.filter((r) => r.reporterId === u.id);
      if (params?.mine && u.role === 'TECHNICIAN') rows = rows.filter((r) => r.assigneeId === u.id);
      if (params?.parentId) rows = [];
      if (params?.status) rows = rows.filter((r) => r.state === params.status);
      if (params?.priority) rows = rows.filter((r) => r.priority === params.priority);
      if (params?.q) {
        const q = params.q.toLowerCase();
        rows = rows.filter((r) => r.title.toLowerCase().includes(q) || r.number.toLowerCase().includes(q) || r.serviceCode.toLowerCase().includes(q));
      }
      return { items: rows.slice(0, params?.limit || 60).map((r) => view(r, u, all)), nextCursor: undefined as string | undefined };
    },

    get: async (id: string): Promise<Incident> => {
      const all = await loadAll();
      const r = all.find((x) => x.id === id);
      if (!r) fail(404, 'ITSM-4041', `Incident not found: ${id}`);
      return view(r!, currentUser(), all);
    },

    create: async (data: { title: string; description: string; serviceCode?: string; serviceId?: string; urgency?: number; impactOverride?: number }): Promise<Incident> => {
      const all = await loadAll();
      const u = currentUser();
      const r = await intake(all, u, data);
      save(all);
      emit('incident.created', r.id);
      return view(r, u, all);
    },

    command: async (id: string, slug: string, body: Record<string, any> = {}): Promise<Incident> => {
      const all = await loadAll();
      const r = all.find((x) => x.id === id);
      if (!r) fail(404, 'ITSM-4041', `Incident not found: ${id}`);
      const rec = r!;
      const u = currentUser();
      const cmd = SLUG_TO_COMMAND[slug.toLowerCase()];
      if (!cmd) fail(400, 'ITSM-4000', `Unknown command: ${slug}`);
      // order matches IncidentCommandService: authorize, then let the state decide
      if (!mayRun(rec, cmd, u)) forbidden(u.id, cmd);
      if (!(ALLOWED[rec.state] || []).includes(cmd)) illegal(rec, cmd);
      const now = Date.now();
      const iso = new Date(now).toISOString();
      const requireAssignee = (op: string) => {
        if (rec.assigneeId !== u.id) forbidden(u.id, op);
      };
      let event = '';
      let summary = '';
      let payload: Record<string, unknown> = {};

      switch (cmd) {
        case 'ACKNOWLEDGE':
          requireAssignee('acknowledge');
          halt(rec.response, now, 'STOPPED');
          rec.respondedAt = iso;
          rec.state = 'ACKNOWLEDGED';
          event = 'IncidentAcknowledged';
          summary = `Acknowledged by ${u.name}; response clock stopped`;
          break;
        case 'START_INVESTIGATION':
          if (!rec.assigneeId) illegal(rec, cmd);
          requireAssignee('startInvestigation');
          halt(rec.response, now, 'STOPPED');
          rec.respondedAt = rec.respondedAt || iso;
          rec.state = 'IN_PROGRESS';
          event = 'InvestigationStarted';
          summary = `Investigation started by ${u.name}`;
          break;
        case 'REQUEST_USER_INFO': {
          requireAssignee('requestUserInfo');
          const question = requireText('question', body.question);
          halt(rec.resolutionClock, now, 'PAUSED');
          rec.question = question;
          rec.state = 'PENDING_USER';
          event = 'UserInfoRequested';
          summary = `${u.name} asked: ${question}`;
          payload = { question };
          break;
        }
        case 'PROVIDE_USER_INFO':
          resume(rec.resolutionClock, now);
          rec.state = 'IN_PROGRESS';
          event = 'UserInfoProvided';
          summary = `${u.name} answered; resolution clock running again`;
          payload = { answer: String(body.answer ?? body.info ?? '').slice(0, 500) };
          break;
        case 'RESOLVE': {
          requireAssignee('resolve');
          const code = requireText('resolution.code', body.resolutionCode ?? body.code);
          const notes = String(body.resolutionNotes ?? body.notes ?? '').trim();
          if (notes.length < 20) invalid('resolution.notes', 'must be at least 20 characters');
          const rootCauseCategory = String(body.rootCauseCategory ?? '').trim() || undefined;
          if ((rec.priority === 'P1' || rec.priority === 'P2') && !rootCauseCategory) invalid('resolution.rootCauseCategory', 'is mandatory for P1 and P2');
          rec.resolution = { code, notes, rootCauseCategory };
          halt(rec.resolutionClock, now, 'STOPPED');
          rec.resolvedAt = iso;
          rec.state = 'RESOLVED';
          event = 'IncidentResolved';
          summary = `Resolved by ${u.name} (${code})`;
          payload = { code, rootCauseCategory: rootCauseCategory ?? null };
          break;
        }
        case 'VERIFY': {
          const rating = body.rating == null ? undefined : Number(body.rating);
          if (rating !== undefined && (rating < 1 || rating > 5)) invalid('rating', 'must be between 1 and 5');
          rec.rating = rating;
          rec.state = 'VERIFIED';
          event = 'ResolutionVerified';
          summary = `${u.name} confirmed the fix${rating ? ` (${rating}/5)` : ''}`;
          payload = { rating: rating ?? null };
          break;
        }
        case 'REJECT_RESOLUTION': {
          const reason = requireText('reason', body.reason);
          rec.reopenCount++;
          rec.resolution = undefined;
          rec.resolvedAt = undefined;
          rec.resolutionClock.state = 'RUNNING';
          rec.resolutionClock.lastResumeAt = now;
          rec.state = 'REOPENED';
          event = 'ResolutionRejected';
          summary = `${u.name} rejected the fix: ${reason}`;
          payload = { reason };
          break;
        }
        case 'CLOSE': {
          const note = requireText('closureNote', body.closureNote);
          rec.closureNote = note;
          rec.closedAt = iso;
          rec.state = 'CLOSED';
          event = 'IncidentClosed';
          summary = `Closed by ${u.name}`;
          payload = { closureNote: note };
          break;
        }
        case 'CANCEL': {
          const reason = requireText('reason', body.reason);
          halt(rec.response, now, 'STOPPED');
          halt(rec.resolutionClock, now, 'STOPPED');
          rec.state = 'CANCELLED';
          event = 'IncidentCancelled';
          summary = `Cancelled by ${u.name}: ${reason}`;
          payload = { reason };
          break;
        }
        case 'REASSIGN': {
          const next = body.technicianId ?? body.newAssigneeId;
          if (!next) invalid('newAssigneeId', 'is required');
          const reason = requireText('reason', body.reason);
          if (next === rec.assigneeId) invalid('newAssigneeId', 'must differ from the current assignee');
          if (!userById(next)) invalid('newAssigneeId', 'unknown technician');
          const previous = rec.assigneeId;
          rec.assigneeId = next;
          rec.state = 'ASSIGNED';
          event = 'IncidentReassigned';
          summary = `Reassigned from ${userById(previous)?.name ?? 'nobody'} to ${userById(next)?.name}: ${reason}`;
          payload = { previous: previous ?? null, next, reason };
          break;
        }
        case 'DECLARE_MAJOR': {
          if (!rec.major) {
            const before = rec.priority;
            rec.steps = [...rec.steps, { rule: 'MAJOR_OVERRIDE', before, after: 'P1', reason: `declared by ${u.name}` }];
            rec.priority = 'P1';
            rec.major = true;
            const [respMin, resoMin] = SLA_POLICY[rec.serviceTier].P1;
            rec.response.targetMs = respMin * 60000;
            rec.resolutionClock.targetMs = resoMin * 60000;
          }
          event = 'MajorIncidentDeclared';
          summary = `Declared a major incident by ${u.name}`;
          break;
        }
        default:
          illegal(rec, cmd);
      }

      if (slaStatus(rec, now) === 'BREACHED') rec.breached = true;
      rec.version++;
      save(all);
      await audit(rec, event, u, summary, payload);
      emit('incident.updated', rec.id);
      return view(rec, u, all);
    },

    timeline: async (id: string): Promise<TimelineItem[]> =>
      loadAudit()
        .filter((a) => a.incidentId === id)
        .map((a) => ({ id: a.id, action: a.eventType, actor: a.actorName, actorType: a.actorType, description: a.summary, payload: a.payload, hash: a.hash, ts: a.timestamp })),

    ai: async (_id: string) => ({ advice: 'Suggestions need the Java backend. Demo mode shows the rule-based parts only.' }),
    rca: async (id: string): Promise<RcaResult> => ({
      incidentId: id,
      rootCauseCandidate: '',
      confidence: 0,
      explanation: 'Root cause ranking needs the Java backend and its service dependency graph.',
      rankedNodes: [],
    }),
    pir: async (_id: string) => ({ status: 'UNAVAILABLE', summary: 'Post-incident review drafts need the Java backend.' }),
    nlSearch: async (query: string) => (await demoBackendApi.incidents.list({ q: query })).items,
  },

  intake: {
    getAdvice: async (data: { title: string; description: string; urgency?: number }): Promise<IntakeAdvice> => {
      const guess = classify(`${data.title} ${data.description}`);
      return {
        suggestedCategory: guess.category,
        suggestedService: guess.serviceCode,
        suggestedImpact: 2,
        suggestedUrgency: data.urgency ?? 2,
        confidence: guess.matched ? 0.9 : 0.4,
        priorityRationale: guess.matched ? `Keyword rule matched "${guess.matched}"` : 'No keyword rule matched; default service',
        matchedKbs: [],
        potentialDuplicates: [],
      };
    },
  },

  admin: {
    getMetrics: async () => {
      const all = await loadAll();
      const now = Date.now();
      const count = (pred: (r: Rec) => boolean) => all.filter(pred).length;
      const done = all.filter((r) => r.resolvedAt);
      const within = done.filter((r) => !r.breached).length;
      const mttr = done.length ? done.reduce((s, r) => s + (Date.parse(r.resolvedAt!) - Date.parse(r.createdAt)), 0) / done.length / 60000 : 0;
      const states = ['ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'PENDING_USER', 'RESOLVED', 'VERIFIED', 'CLOSED', 'CANCELLED', 'REOPENED'];
      return {
        totalVolume: all.length,
        activeMajorP1: count((r) => r.major && !['CLOSED', 'CANCELLED'].includes(r.state)),
        slaCompliance: done.length ? `${((within / done.length) * 100).toFixed(1)}%` : 'n/a',
        mttrMinutes: done.length ? `${mttr.toFixed(1)} min` : 'n/a',
        statusBreakdown: states.map((status) => ({ status, count: count((r) => r.state === status) })).filter((s) => s.count > 0),
        priorityBreakdown: ['P1', 'P2', 'P3', 'P4'].map((priority) => ({ priority, count: count((r) => r.priority === priority) })),
        ...({ breachedNow: count((r) => slaStatus(r, now) === 'BREACHED') } as object),
      };
    },

    getAudit: async (params?: { incidentId?: string; limit?: number }) => {
      let rows = loadAudit();
      if (params?.incidentId) rows = rows.filter((a) => a.incidentId === params.incidentId);
      return rows
        .slice(-(params?.limit || 50))
        .reverse()
        .map((a) => ({ ...a, action: a.eventType, actor: a.actorName, prevHash: a.previousHash }));
    },

    getSlaPolicies: async () =>
      Object.entries(SLA_POLICY).flatMap(([tier, byPriority]) =>
        Object.entries(byPriority).map(([priority, [responseTargetMin, resolutionTargetMin]]) => ({
          id: `${tier}-${priority}`,
          tier,
          priority,
          responseTargetMin,
          resolutionTargetMin,
          mode: 'CONTINUOUS_24X7',
        })),
      ),

    getServices: async () => PREDEFINED_SERVICES,
    getCategories: async () => [
      { id: '1', code: 'SOFTWARE', name: 'Software Applications & Portals' },
      { id: '2', code: 'NETWORK', name: 'Network Connectivity & Wi-Fi' },
      { id: '3', code: 'HARDWARE', name: 'Lab Hardware & AV' },
      { id: '4', code: 'ACCESS', name: 'Accounts & Access' },
    ],
    getUsers: async () => PREDEFINED_USERS,

    simulateStorm: async (_data: { scenario?: string; reportCount?: number } = {}): Promise<{ scenario: string; totalInjected: number; masterCount: number; childCount: number; rootCandidateService: string }> =>
      fail(501, 'ITSM-5010', 'The storm simulator needs the Java backend. Start it with start.bat and try again.'),

    setDemoClock: async (scaleFactor: number) => ({ scaleFactor: 1, virtualNow: new Date().toISOString(), requested: scaleFactor }),

    verifyAuditLedger: async (): Promise<AuditVerificationResult> => {
      const byIncident = new Map<string, AuditEntry[]>();
      for (const a of loadAudit()) byIncident.set(a.incidentId, [...(byIncident.get(a.incidentId) || []), a]);
      let checked = 0;
      for (const chain of byIncident.values()) {
        let expectedPrev = GENESIS_HASH;
        for (const e of chain.sort((a, b) => a.chainIndex - b.chainIndex)) {
          const recomputed = await sha256Hex(hashInput(e));
          if (e.previousHash !== expectedPrev || recomputed !== e.hash) {
            return {
              valid: false,
              totalRecordsChecked: checked,
              tamperedRowId: e.id,
              expectedHash: recomputed,
              actualHash: e.hash,
              message: `Chain broken at ${e.id}: stored hash does not match the recomputed hash`,
            };
          }
          expectedPrev = e.hash;
          checked++;
        }
      }
      return { valid: true, totalRecordsChecked: checked, message: `Ledger intact: ${checked} entries verified with SHA-256` };
    },
  },

  services: {
    list: async () => PREDEFINED_SERVICES,
    getTopology: async () => {
      const all = await loadAll();
      const open = (code: string) => all.filter((r) => r.serviceCode === code && !['RESOLVED', 'VERIFIED', 'CLOSED', 'CANCELLED'].includes(r.state));
      return {
        nodes: PREDEFINED_SERVICES.map((s) => {
          const tickets = open(s.code);
          return {
            id: s.id,
            code: s.code,
            name: s.name,
            tier: s.tier,
            team: 'CCIT',
            openIncidents: tickets.length,
            status: (tickets.some((r) => r.major) ? 'OUTAGE' : tickets.length ? 'DEGRADED' : 'HEALTHY') as 'HEALTHY' | 'DEGRADED' | 'OUTAGE',
          };
        }),
        edges: [
          { from: 'NET-CORE', to: 'AUTH-LDAP', type: 'DEPENDS_ON' },
          { from: 'AUTH-LDAP', to: 'APP-LMS', type: 'DEPENDS_ON' },
          { from: 'AUTH-LDAP', to: 'APP-ERP', type: 'DEPENDS_ON' },
          { from: 'DB-PRIMARY', to: 'APP-LMS', type: 'DEPENDS_ON' },
          { from: 'DB-PRIMARY', to: 'APP-ERP', type: 'DEPENDS_ON' },
          { from: 'NET-CORE', to: 'NET-WIFI-HOSTEL', type: 'DEPENDS_ON' },
        ],
      };
    },
  },

  technicians: {
    list: async () => {
      const all = await loadAll();
      return PREDEFINED_USERS.filter((u) => u.role === 'TECHNICIAN').map((u) => ({
        id: u.id,
        name: u.name,
        supportTier: u.supportTier || 'L1',
        teamId: u.teamId || '',
        teamCode: u.teamId || '',
        loadPoints: loadPoints(all, u.id),
        capacity: CAPACITY_POINTS,
      }));
    },
  },
};
