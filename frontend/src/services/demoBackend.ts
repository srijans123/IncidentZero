// frontend/src/services/demoBackend.ts
// In-browser mock backend for GitHub Pages deployment (D2)
// Runs fully in-memory / persisted in localStorage with real Web Crypto SHA-256 audit chaining.

import { Incident, IntakeAdvice, AuditVerificationResult, RcaResult, User, TimelineItem, IncidentState } from '../types';

export const IS_DEMO_MODE =
  !import.meta.env.VITE_API_BASE_URL &&
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1';

const STORAGE_KEY_INCIDENTS = 'iitsm_demo_incidents';
const STORAGE_KEY_AUDIT = 'iitsm_demo_audit';
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export const PREDEFINED_USERS: User[] = [
  { id: '019299a0-0000-7000-8000-000000000001', name: 'Aarav Sharma', email: 'emp@bits.campus', role: 'EMPLOYEE' },
  { id: '019299a0-0000-7000-8000-000000000002', name: 'Diya Nair', email: 'diya@bits.campus', role: 'EMPLOYEE' },
  { id: '019299a0-0000-7000-8000-000000000003', name: 'Vikram Rao', email: 'tech.vikram@bits.campus', role: 'TECHNICIAN', supportTier: 'SENIOR', teamId: 'NET', teamName: 'Network Ops' },
  { id: '019299a0-0000-7000-8000-000000000004', name: 'Priya Menon', email: 'lead.priya@bits.campus', role: 'TECHNICIAN', supportTier: 'TEAM_LEAD', teamId: 'NET', teamName: 'Network Ops' },
  { id: '019299a0-0000-7000-8000-000000000005', name: 'Rohan Kulkarni', email: 'tech.rohan@bits.campus', role: 'TECHNICIAN', supportTier: 'L1', teamId: 'SYS', teamName: 'Systems' },
  { id: '019299a0-0000-7000-8000-000000000006', name: 'Ananya Iyer', email: 'tech.ananya@bits.campus', role: 'TECHNICIAN', supportTier: 'L1', teamId: 'SYS', teamName: 'Systems' },
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
  { id: '30000000-0000-0000-0000-000000000019', code: 'HW-PRINT', name: 'Department Network Printers & Scanners', tier: 'T3' }
];

interface AuditEntry {
  id: string;
  incidentId: string;
  auditIndex: number;
  eventType: string;
  previousHash: string;
  hash: string;
  actorId: string;
  actorType: string;
  timestamp: string;
  payload: any;
}

async function sha256Hex(str: string): Promise<string> {
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(str));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function loadIncidents(): Incident[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INCIDENTS);
    return raw ? JSON.parse(raw) : getInitialIncidents();
  } catch {
    return getInitialIncidents();
  }
}

function saveIncidents(list: Incident[]) {
  try {
    localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(list));
  } catch {}
}

function loadAudit(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAudit(list: AuditEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(list));
  } catch {}
}

function getInitialIncidents(): Incident[] {
  return [
    {
      id: '01a1e182-0000-7000-8000-000000000001',
      number: 'INC-2026-000101',
      title: 'Moodle quiz opens as blank page in mid-sem exam',
      description: 'When I click start attempt on the CS F213 quiz it shows a blank white page.',
      serviceCode: 'APP-LMS',
      category: 'APPLICATION',
      state: 'RESOLVED',
      priority: 'P2',
      slaStatus: 'ON_TRACK',
      reporterId: '019299a0-0000-7000-8000-000000000001',
      reporterName: 'Aarav Sharma',
      assigneeId: '019299a0-0000-7000-8000-000000000003',
      assigneeName: 'Vikram Rao',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      allowedCommands: ['VERIFY', 'CLOSE', 'REOPEN'],
      version: 4,
      isMajor: false,
      childCount: 0,
      reopenCount: 0
    }
  ];
}

async function recordAudit(incidentId: string, eventType: string, actorId: string, actorType: string, payload: any): Promise<string> {
  const audits = loadAudit();
  const incAudits = audits.filter(a => a.incidentId === incidentId).sort((a, b) => a.auditIndex - b.auditIndex);
  const last = incAudits[incAudits.length - 1];
  const nextIndex = last ? last.auditIndex + 1 : 1;
  const prevHash = last ? last.hash : GENESIS_HASH;
  const now = new Date().toISOString();

  const rawForHash = `${prevHash}|${incidentId}|${nextIndex}|${now}|${actorType}|${actorId}|${eventType}|${JSON.stringify(payload)}`;
  const hash = await sha256Hex(rawForHash);

  const entry: AuditEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    incidentId,
    auditIndex: nextIndex,
    eventType,
    previousHash: prevHash,
    hash,
    actorId,
    actorType,
    timestamp: now,
    payload
  };

  audits.push(entry);
  saveAudit(audits);
  return hash;
}

export const demoBackendApi = {
  auth: {
    login: async (email: string) => {
      const user = PREDEFINED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || PREDEFINED_USERS[0];
      const token = `demo-jwt-${user.id}-${Date.now()}`;
      return { accessToken: token, expiresInSeconds: 86400 };
    },
    getMe: async (): Promise<User> => {
      const email = localStorage.getItem('iitsm_user_email') || 'emp@bits.campus';
      return PREDEFINED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || PREDEFINED_USERS[0];
    },
    issueStreamTicket: async () => ({ ticket: 'demo-ticket', expiresInSeconds: 300 })
  },

  incidents: {
    list: async (params?: { status?: string; priority?: string; q?: string }) => {
      let items = loadIncidents();
      if (params?.status) items = items.filter(i => i.state === (params.status as IncidentState));
      if (params?.priority) items = items.filter(i => i.priority === params.priority);
      if (params?.q) {
        const q = params.q.toLowerCase();
        items = items.filter(i => i.title.toLowerCase().includes(q) || i.number.toLowerCase().includes(q));
      }
      return { items, nextCursor: null };
    },

    get: async (id: string): Promise<Incident> => {
      const items = loadIncidents();
      const inc = items.find(i => i.id === id);
      if (!inc) throw new Error(`Incident not found: ${id}`);
      return inc;
    },

    create: async (data: { title: string; description: string; serviceCode?: string; urgency?: number }): Promise<Incident> => {
      const items = loadIncidents();
      const currentUser = await demoBackendApi.auth.getMe();
      const numSeq = 100 + items.length + 1;
      const id = `01a1e182-${Date.now()}-7000-8000-${Math.random().toString(16).slice(2, 14).padEnd(12, '0')}`;
      const now = new Date().toISOString();

      const priority = data.urgency === 3 ? 'P1' : data.urgency === 2 ? 'P2' : 'P3';

      const newInc: Incident = {
        id,
        number: `INC-2026-${numSeq.toString().padStart(6, '0')}`,
        title: data.title,
        description: data.description,
        serviceCode: data.serviceCode || 'APP-LMS',
        category: 'APPLICATION',
        state: 'ASSIGNED',
        priority: priority as any,
        slaStatus: 'ON_TRACK',
        reporterId: currentUser.id,
        reporterName: currentUser.name,
        assigneeId: '019299a0-0000-7000-8000-000000000003',
        assigneeName: 'Vikram Rao',
        createdAt: now,
        allowedCommands: ['ACKNOWLEDGE', 'LINK_AS_CHILD', 'DECLARE_MAJOR', 'CANCEL'],
        version: 1,
        isMajor: priority === 'P1',
        childCount: 0,
        reopenCount: 0
      };

      items.unshift(newInc);
      saveIncidents(items);
      await recordAudit(id, 'INCIDENT_CREATED', currentUser.id, currentUser.role, { title: data.title, priority });
      return newInc;
    },

    command: async (id: string, command: string, envelope: Record<string, any> = {}): Promise<Incident> => {
      const items = loadIncidents();
      const inc = items.find(i => i.id === id);
      if (!inc) throw new Error(`Incident not found: ${id}`);
      const currentUser = await demoBackendApi.auth.getMe();

      switch (command.toLowerCase()) {
        case 'acknowledge':
          inc.state = 'ACKNOWLEDGED';
          inc.allowedCommands = ['START_INVESTIGATION', 'REQUEST_USER_INFO', 'RESOLVE', 'CANCEL'];
          break;
        case 'start_investigation':
          inc.state = 'IN_PROGRESS';
          inc.allowedCommands = ['REQUEST_USER_INFO', 'RESOLVE', 'REASSIGN', 'CANCEL'];
          break;
        case 'request_user_info':
          inc.state = 'PENDING_USER';
          inc.allowedCommands = ['PROVIDE_USER_INFO', 'RESOLVE', 'CANCEL'];
          break;
        case 'provide_user_info':
          inc.state = 'IN_PROGRESS';
          inc.allowedCommands = ['RESOLVE', 'REQUEST_USER_INFO', 'CANCEL'];
          break;
        case 'resolve':
          inc.state = 'RESOLVED';
          inc.allowedCommands = ['VERIFY', 'CLOSE', 'REOPEN'];
          break;
        case 'verify':
          if ((envelope.rating && envelope.rating <= 2) || envelope.reopen) {
            inc.state = 'REOPENED';
            inc.reopenCount = (inc.reopenCount || 0) + 1;
            inc.allowedCommands = ['START_INVESTIGATION', 'RESOLVE', 'CANCEL'];
          } else {
            inc.state = 'CLOSED';
            inc.allowedCommands = [];
          }
          break;
        case 'close':
          inc.state = 'CLOSED';
          inc.allowedCommands = [];
          break;
        case 'declare_major':
          inc.isMajor = true;
          inc.priority = 'P1';
          break;
        default:
          break;
      }

      inc.version = (inc.version || 0) + 1;
      saveIncidents(items);

      await recordAudit(id, `COMMAND_${command.toUpperCase()}`, currentUser.id, currentUser.role, envelope);
      return inc;
    },

    timeline: async (id: string): Promise<TimelineItem[]> => {
      const audits = loadAudit().filter(a => a.incidentId === id);
      return audits.map(a => ({
        id: a.id,
        action: a.eventType,
        description: `${a.eventType} by ${a.actorType}`,
        actorType: a.actorType,
        payload: a.payload,
        hash: a.hash,
        ts: a.timestamp
      }));
    },

    ai: async () => ({ advice: 'Check database connection pools and SSO authentication bridge.' }),
    rca: async () => ({
      incidentId: '01a1e182-demo',
      rootCauseCandidate: 'Campus Core Switch S1 Packet Drop',
      confidence: 0.94,
      explanation: 'Packet loss observed on switch trunk correlates with LMS timeout.',
      rankedNodes: [
        { serviceCode: 'APP-LMS', score: 0.94, blastRadius: 3, isLeafSafe: false },
        { serviceCode: 'NET-CORE', score: 0.88, blastRadius: 12, isLeafSafe: false }
      ]
    }),
    pir: async () => ({ status: 'DRAFT', summary: 'Incident completed within SLA.' }),
    nlSearch: async (query: string) => {
      const list = await demoBackendApi.incidents.list({ q: query });
      return list.items;
    }
  },

  intake: {
    getAdvice: async (_data: { title: string; description: string }) => ({
      suggestedCategory: 'APPLICATION',
      suggestedService: 'APP-LMS',
      suggestedImpact: 2,
      suggestedUrgency: 2,
      confidence: 0.92,
      priorityRationale: 'Keywords match campus LMS and mid-term exam schedule.',
      matchedKbs: [],
      potentialDuplicates: []
    })
  },

  admin: {
    getMetrics: async () => {
      const items = loadIncidents();
      return {
        totalVolume: items.length,
        activeMajorP1: items.filter(i => i.isMajor && i.state !== 'CLOSED').length,
        slaCompliance: '98.4%',
        mttrMinutes: '14.2 min',
        statusBreakdown: [
          { status: 'RESOLVED', count: items.filter(i => i.state === 'RESOLVED').length },
          { status: 'IN_PROGRESS', count: items.filter(i => i.state === 'IN_PROGRESS').length },
          { status: 'CLOSED', count: items.filter(i => i.state === 'CLOSED').length }
        ],
        priorityBreakdown: [
          { priority: 'P1', count: items.filter(i => i.priority === 'P1').length },
          { priority: 'P2', count: items.filter(i => i.priority === 'P2').length },
          { priority: 'P3', count: items.filter(i => i.priority === 'P3').length },
          { priority: 'P4', count: items.filter(i => i.priority === 'P4').length }
        ]
      };
    },

    getAudit: async (params?: { incidentId?: string; limit?: number }) => {
      let list = loadAudit();
      if (params?.incidentId) list = list.filter(a => a.incidentId === params.incidentId);
      return list.slice(0, params?.limit || 50);
    },

    getSlaPolicies: async () => [
      { id: '1', tier: 'T0', priority: 'P1', responseTargetMin: 15, resolutionTargetMin: 60, mode: 'CALENDAR_24X7' },
      { id: '2', tier: 'T1', priority: 'P2', responseTargetMin: 30, resolutionTargetMin: 120, mode: 'CALENDAR_BUSINESS' },
      { id: '3', tier: 'T2', priority: 'P3', responseTargetMin: 60, resolutionTargetMin: 240, mode: 'CALENDAR_BUSINESS' }
    ],

    getServices: async () => PREDEFINED_SERVICES,
    getCategories: async () => [
      { id: '1', code: 'APPLICATION', name: 'Software Applications & Portals' },
      { id: '2', code: 'NETWORK', name: 'Network Connectivity & Wi-Fi' },
      { id: '3', code: 'HARDWARE', name: 'Lab Hardware & AV' }
    ],
    getUsers: async () => PREDEFINED_USERS,

    simulateStorm: async () => ({
      scenario: 'EXAM_STORM',
      totalInjected: 12,
      masterCount: 1,
      childCount: 11,
      rootCandidateService: 'NET-CORE'
    }),

    setDemoClock: async (scaleFactor: number) => ({
      scaleFactor,
      virtualNow: new Date().toISOString()
    }),

    verifyAuditLedger: async (): Promise<AuditVerificationResult> => {
      const audits = loadAudit();
      const byIncident: Record<string, AuditEntry[]> = {};
      for (const a of audits) {
        if (!byIncident[a.incidentId]) byIncident[a.incidentId] = [];
        byIncident[a.incidentId].push(a);
      }

      let totalVerified = 0;
      let valid = true;
      let errorDetail = '';

      for (const incId of Object.keys(byIncident)) {
        const chain = byIncident[incId].sort((a, b) => a.auditIndex - b.auditIndex);
        let expectedPrev = GENESIS_HASH;

        for (const entry of chain) {
          if (entry.previousHash !== expectedPrev) {
            valid = false;
            errorDetail = `Broken chain at index ${entry.auditIndex} for incident ${incId}`;
            break;
          }
          const raw = `${entry.previousHash}|${entry.incidentId}|${entry.auditIndex}|${entry.timestamp}|${entry.actorType}|${entry.actorId}|${entry.eventType}|${JSON.stringify(entry.payload)}`;
          const recomputed = await sha256Hex(raw);
          if (recomputed !== entry.hash) {
            valid = false;
            errorDetail = `Hash mismatch at index ${entry.auditIndex} for incident ${incId}`;
            break;
          }
          expectedPrev = entry.hash;
          totalVerified++;
        }
        if (!valid) break;
      }

      return {
        valid,
        totalRecordsChecked: totalVerified,
        message: valid ? `Ledger intact: ${totalVerified} entries verified with SHA-256` : errorDetail
      };
    }
  },

  services: {
    list: async () => PREDEFINED_SERVICES,
    getTopology: async () => ({
      nodes: PREDEFINED_SERVICES.map(s => ({
        id: s.id,
        code: s.code,
        name: s.name,
        tier: s.tier,
        team: 'CCIT',
        openIncidents: s.code === 'APP-LMS' ? 1 : 0,
        status: (s.code === 'APP-LMS' ? 'DEGRADED' : 'HEALTHY') as any
      })),
      edges: [
        { from: 'NET-CORE', to: 'AUTH-LDAP', type: 'DEPENDS_ON' },
        { from: 'AUTH-LDAP', to: 'APP-LMS', type: 'DEPENDS_ON' },
        { from: 'DB-PRIMARY', to: 'APP-LMS', type: 'DEPENDS_ON' }
      ]
    })
  },

  technicians: {
    list: async () => [
      { id: '019299a0-0000-7000-8000-000000000003', name: 'Vikram Rao', supportTier: 'TIER_2', teamId: '1', teamCode: 'NET', loadPoints: 2, capacity: 10 },
      { id: '019299a0-0000-7000-8000-000000000004', name: 'Priya Menon', supportTier: 'TIER_3', teamId: '1', teamCode: 'NET', loadPoints: 1, capacity: 10 },
      { id: '019299a0-0000-7000-8000-000000000005', name: 'Rohan Kulkarni', supportTier: 'TIER_1', teamId: '2', teamCode: 'SYS', loadPoints: 0, capacity: 10 }
    ]
  }
};
