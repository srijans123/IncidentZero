// direction/demo.mjs — Act 9 (live demo) and Act 10 (proof). One beat per narration line.
// Format of a beat:  { id, pre:[steps run silently before the voice], cues:[[when, verb, ...args]], hold: seconds after the voice, post:[steps] }
// "when" is seconds from the start of the voice, or '@word' = the moment that word is spoken, or '+0.4' = after the previous cue, or '@end'.
export const DEMO = {
  title: 'Cannot open Moodle quiz, login keeps timing out',
  description: 'Since 9 am the LMS login page loads forever and then shows a gateway timeout. Tried two browsers on hostel Wi-Fi.',
  question: 'Which browser are you using, and which Wi-Fi network are you on?',
  answer: 'Chrome and Firefox, both on the hostel Wi-Fi in Vyas Bhawan.',
  notes: 'Restarted the Moodle login service and cleared the stuck sessions. Login works again.',
};
const USER_CHIP = '[title="Switch BITS Pilani Demo Persona"]';
const TITLE = { placeholder: 'e.g. Cannot open Moodle quiz' };
const DESC = { placeholder: 'Provide error codes' };
const BADGE = (state) => ({ text: state, exact: true });
const BTN = (name) => ({ role: 'button', name });
const ROW = { text: '$TICKET', exact: true };
const DIALOG = '[role=dialog]';

export const act9 = {
  id: 'T09', title: 'Act 9 · live demo', chip: '9 · LIVE DEMO', retries: 3,
  // run before every attempt, so each attempt starts from the same data
  before: ['powershell -ExecutionPolicy Bypass -File scripts/demo-reset.ps1', 'node scripts/demo-seed.mjs'],
  setup: [['goto', 'APP/app.html?tab=portal'], ['ready'], ['expect', 'Aarav Sharma'], ['expect', 'Report New Incident']],
  beats: [
    // ---------------------------------------------------------------- S09.1 the student reports a problem
    { id: 'a09b01', cues: [[0, 'point', USER_CHIP, { hold: 1300 }]] },
    { id: 'a09b02', cues: [['@reports', 'click', { text: 'Report New Incident' }], ['+0', 'expect', 'Report a Campus IT Issue']] },
    { id: 'a09b03',
      pre: [['zoom', TITLE, 2], ['type', TITLE, DEMO.title, { ms: 1500 }], ['zoom', DESC, 2]],
      cues: [[0, 'type', DESC, DEMO.description, { ms: 2200 }], ['@suggests', 'zoomOut', { nowait: true }], ['+0', 'diagram', 'copilot'], ['+0', 'step', 'c1'], ['+0.35', 'step', 'c2'], ['+0.45', 'step', 'c3'], ['@Moodle', 'step', 'c4']],
      hold: 0.9,
      post: [['diagramClose'], ['expect', 'Copilot suggests: APP-LMS'], ['point', { text: 'Copilot suggests: APP-LMS' }, { hold: 900 }]] },
    { id: 'a09b04',
      pre: [['move', { text: 'Self-Reported Urgency' }], ['zoomFollow', 2]],
      cues: [[0, 'click', { text: 'High Priority' }], ['@submit', 'zoomOut'], ['+0', 'click', BTN('Submit Incident Report'), { after: 500 }]] },
    // ---------------------------------------------------------------- S09.2 what that click did (T1)
    { id: 'a09b05', pre: [['diagram', 'submitFlow'], ['step', 'btn']], cues: [['@submit', 'step', 'n1']] },
    { id: 'a09b06', cues: [['@POST', 'step', 'n2']] },
    { id: 'a09b07', cues: [['@controller', 'step', 'n3'], ['@intake', 'step', 'n4']] },
    { id: 'a09b08', pre: [['diagram', 'pipeline']], cues: [[0, 'sweep', ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9'], 1900]], hold: 0.2 },
    { id: 'a09b09', cues: [[0.3, 'glow', 's3'], ['+0', 'step', 's3']] },
    { id: 'a09b10', cues: [[0.3, 'glow', 's9'], ['+0', 'step', 's9']] },
    { id: 'a09b11', pre: [['diagram', 'chain'], ['step', 'g']], cues: [['@audit', 'step', 'h1'], ['@first', 'step', 'h2'], ['@hash', 'step', 'h3']], hold: 0.6, post: [['diagramClose']] },
    // ---------------------------------------------------------------- S09.3 the result
    { id: 'a09b12',
      pre: [['ready'], ['expect', 'INCIDENT TELEMETRY DOSSIER'], ['remember', 'TICKET', 'window.__izLast && window.__izLast.number'], ['remember', 'TECH', 'window.__izLast && window.__izLast.assigneeName'], ['expect', 'ASSIGNED', { exact: true }], ['expect', 'P2', { exact: true }]],
      cues: [['@result', 'point', BADGE('ASSIGNED'), { hold: 1200 }], ['@assigned', 'point', { text: 'Current State:' }, { hold: 1400 }]] },
    { id: 'a09b13',
      cues: [[0, 'point', BADGE('P2'), { hold: 1500 }], ['@word', 'diagram', 'matrix'], ['@quiz', 'cell', 1, 1], ['@bump', 'bump', 'P3', 'the text says "quiz" → exam window, one level up', 'P2']],
      hold: 1.0, post: [['diagramClose']] },
    { id: 'a09b14',
      cues: [[0, 'scrollTo', { testid: 'sla-priority-panel' }], ['+0', 'zoom', { testid: 'sla-targets' }, 2], ['@fifteen', 'point', { testid: 'sla-respond' }, { hold: 1300 }], ['@two', 'point', { testid: 'sla-resolve' }, { hold: 1200 }]],
      post: [['zoomOut']] },
    { id: 'a09b15', cues: [[0, 'scrollTo', { text: 'PUBLIC TIMELINE' }, { block: 'start', ms: 800 }], ['@hashed', 'point', 'button[title^="Click to copy full SHA-256"] >> nth=1', { hold: 1400 }]] },
    // ---------------------------------------------------------------- S09.4 the technician acknowledges
    { id: 'a09b16', cues: [[0, 'scrollTop'], ['+0', 'user', '$TECH'], ['+0', 'tab', 'Workbench']] },
    { id: 'a09b17',
      pre: [['expect', '$TICKET']],
      cues: [[0, 'point', ROW, { hold: 1500 }], ['@there', 'click', ROW, { after: 600 }], ['+0', 'ready'], ['+0', 'expect', 'PERMITTED ACTIONS:'], ['+0', 'point', { text: 'PERMITTED ACTIONS:' }, { hold: 0, pad: 14 }]],
      post: [['unring']] },
    { id: 'a09b18', cues: [[0.2, 'click', BTN('Acknowledge'), { after: 300 }]] },
    // ---------------------------------------------------------------- S09.5 what that click did (T2)
    { id: 'a09b19', pre: [['diagram', 'ackFlow'], ['step', 'a0']], cues: [['@runCommand', 'step', 'a1'], ['@posts', 'step', 'a2']] },
    { id: 'a09b20', cues: [['@controller', 'step', 'a3']] },
    { id: 'a09b21', cues: [['@service', 'step', 'a4'], ['@authorizer', 'step', 'a5']] },
    { id: 'a09b22', cues: [['@assignee', 'mark', 'a5', 'good', 'isAssignee = true ✓']] },
    { id: 'a09b23', cues: [[0, 'step', 'a6'], ['@returns', 'step', 'a7']], hold: 0.6, post: [['diagramClose']] },
    // ---------------------------------------------------------------- S09.6 investigation and a question
    { id: 'a09b24',
      pre: [['ready'], ['expect', 'ACKNOWLEDGED', { exact: true }]],
      cues: [[0, 'point', BADGE('ACKNOWLEDGED'), { hold: 1400 }], ['@response', 'zoom', { testid: 'sla-targets' }, 2], ['+0', 'point', { testid: 'sla-respond' }, { hold: 1200 }]],
      post: [['zoomOut'], ['scrollTop']] },
    { id: 'a09b25', cues: [['@starts', 'click', BTN('Start Investigation')], ['+0', 'expect', 'IN_PROGRESS', { exact: true }], ['+0', 'point', BADGE('IN_PROGRESS'), { hold: 1200 }]] },
    { id: 'a09b26',
      cues: [[0, 'click', BTN('Request User Info')], ['+0', 'type', `${DIALOG} textarea`, DEMO.question, { clear: true, ms: 1900 }], ['+0.2', 'click', BTN('Send Request & Pause Clock'), { after: 500 }]] },
    // ---------------------------------------------------------------- S09.7 what that click did (T3)
    { id: 'a09b27', pre: [['diagram', 'pauseFlow'], ['step', 'p0']], cues: [['@InProgressState', 'step', 'p1']] },
    { id: 'a09b28', cues: [[0, 'step', 'p2'], ['@returning', 'step', 'p3'], ['+0.2', 'mark', 'p3', 'warn', 'PAUSED']], hold: 0.7, post: [['diagramClose']] },
    // ---------------------------------------------------------------- S09.8 the student answers
    { id: 'a09b29',
      pre: [['ready'], ['expect', 'PENDING_USER', { exact: true }]],
      cues: [[0, 'point', BADGE('PENDING_USER'), { hold: 1300 }], ['@technician', 'zoom', { testid: 'sla-paused' }, 2]],
      hold: 0.5, post: [['zoomOut'], ['scrollTop']] },
    { id: 'a09b30',
      cues: [[0, 'user', 'Aarav Sharma'], ['+0', 'tab', 'Student Portal'], ['+0', 'click', ROW, { after: 600 }], ['+0', 'ready'], ['+0', 'point', { text: 'TECHNICIAN AWAITING YOUR INPUT' }, { hold: 1200 }]] },
    { id: 'a09b31',
      pre: [['zoom', { placeholder: 'e.g. Cleared browser cookies' }, 2], ['type', { placeholder: 'e.g. Cleared browser cookies' }, DEMO.answer, { ms: 1700 }], ['zoomOut'], ['click', BTN('Send Diagnostic Reply'), { after: 600 }], ['ready'], ['expect', 'IN_PROGRESS', { exact: true }], ['scrollTop']],
      cues: [[0, 'point', BADGE('IN_PROGRESS'), { hold: 1200 }], ['@clock', 'zoom', { testid: 'sla-targets' }, 2], ['+0', 'point', { testid: 'sla-resolve' }, { hold: 1100 }]],
      post: [['zoomOut'], ['scrollTop']] },
    // ---------------------------------------------------------------- S09.9 the technician resolves
    { id: 'a09b32',
      cues: [[0, 'user', '$TECH'], ['+0', 'tab', 'Workbench'], ['+0', 'click', ROW, { after: 600 }], ['+0', 'ready'], ['+0', 'click', BTN('Resolve Incident')], ['+0', 'type', `${DIALOG} textarea`, DEMO.notes, { clear: true, ms: 2400 }]] },
    { id: 'a09b33',
      cues: [[0, 'point', { text: 'Resolution Notes' }, { hold: 1500 }], ['@lazy', 'diagram', 'noteRule'], ['+0', 'step', 'r1'], ['@rejected', 'step', 'r2'], ['+0.6', 'step', 'r3'], ['+0', 'mark', 'r3', 'bad']],
      hold: 0.9, post: [['diagramClose'], ['click', BTN('Confirm Resolution'), { after: 600 }], ['ready'], ['expect', 'RESOLVED', { exact: true }]] },
    // ---------------------------------------------------------------- S09.10 the student confirms (T4)
    { id: 'a09b34',
      cues: [[0, 'user', 'Aarav Sharma'], ['+0', 'tab', 'Student Portal'], ['+0', 'click', ROW, { after: 600 }], ['+0', 'ready'], ['+0', 'zoom', { text: 'TECHNICIAN HAS RESOLVED YOUR ISSUE' }, 1], ['+0', 'click', 'button:has(svg.lucide-star) >> nth=4'], ['+0', 'expect', 'Rating: 5/5'], ['+0.3', 'zoomOut'], ['+0', 'click', BTN('Confirm It Is Fixed'), { after: 500 }]] },
    { id: 'a09b35', pre: [['diagram', 'verifyFlow'], ['step', 'v0']], cues: [[0.4, 'step', 'v1']] },
    { id: 'a09b36', cues: [[0, 'step', 'v2'], ['@reporter', 'mark', 'v2', 'good', 'he is the reporter ✓'], ['@moves', 'step', 'v3']], hold: 0.7, post: [['diagramClose']] },
    // ---------------------------------------------------------------- S09.11 closing the ticket
    { id: 'a09b37', pre: [['ready'], ['expect', 'VERIFIED', { exact: true }], ['scrollTop']], cues: [[0, 'point', BADGE('VERIFIED'), { hold: 1300 }]] },
    { id: 'a09b38',
      pre: [['user', '$TECH'], ['tab', 'Workbench'], ['click', ROW, { after: 600 }], ['ready'], ['expect', 'Close Incident']],
      cues: [['@closes', 'click', BTN('Close Incident')], ['+0', 'expect', 'CLOSED', { exact: true }], ['@closed', 'point', BADGE('CLOSED'), { hold: 1300 }], ['@no', 'point', { text: 'PERMITTED ACTIONS:' }, { hold: 1400, pad: 14 }]] },
    { id: 'a09b39', cues: [[0, 'scrollTo', { text: 'CRYPTOGRAPHIC AUDIT LEDGER' }, { block: 'start', ms: 900 }], ['@who', 'move', 'button[title^="Click to copy full SHA-256"] >> nth=1'], ['+0', 'scrollBy', 520, 2600]], hold: 0.8 },
  ],
};

// =================================================================================================== ACT 10
// Terminal text is typed on screen, then the REAL saved output of that command is printed (video_v4/terminal/<id>.txt).
export const terminal = {
  illegal: { shown: 'curl -s -X POST localhost:8080/api/v1/incidents/$ID/commands/close -H "Authorization: Bearer $TOKEN" -d \'{"closureNote":"closing it again"}\'' },
  psql: { shown: 'psql "$DEMO_DB" -c "UPDATE audit_record SET description = \'edited\' WHERE chain_index = 1;"' },
  m1: { shown: 'bash scripts/verify-m1.sh' },
  arch: { shown: 'mvn -f backend/pom.xml test -Dtest=ArchitectureTest' },
};

export const act10 = {
  id: 'T10', title: 'Act 10 · proof', chip: '10 · PROOF', retries: 3,
  setup: [['goto', 'APP/app.html?tab=workbench'], ['ready']],
  beats: [
    { id: 'a10b01', pre: [['term', 'Terminal — IncidentZero']], cues: [['@ask', 'termType', 'illegal', 2000]] },
    { id: 'a10b02', cues: [[0, 'termPrint', 'illegal', 700], ['@409', 'termPoint', '"status": 409'], ['@current', 'termPoint', '"currentState": "CLOSED"'], ['@command', 'termPoint', '"attemptedCommand": "CLOSE"']] },
    { id: 'a10b03', cues: [[0, 'termPoint', '"code": "ITSM-4090"']], hold: 0.6, post: [['termClose']] },
    { id: 'a10b04', cues: [[0, 'user', 'Suresh Deshmukh'], ['+0', 'tab', 'Command DAG'], ['+0', 'click', { text: 'SHA-256 Audit Ledger', exact: true }, { after: 700 }], ['+0', 'ready'], ['+0', 'click', BTN('VERIFY LEDGER'), { after: 600 }]] },
    { id: 'a10b05', pre: [['diagram', 'ledgerCheck'], ['step', 'l1']], cues: [['@recomputes', 'step', 'l2'], ['@compares', 'step', 'l3']] },
    { id: 'a10b06', pre: [['step', 'l4'], ['mark', 'l4', 'good', 'all match ✓'], ['wait', 500], ['diagramClose'], ['expect', 'HASH BLOCKS SECURE']], cues: [[0, 'point', { text: 'HASH BLOCKS SECURE' }, { hold: 1300 }]], hold: 0.5 },
    { id: 'a10b07', pre: [['term', 'Terminal — demo database']], cues: [[0.3, 'termType', 'psql', 2200]] },
    { id: 'a10b08', cues: [[0, 'termPrint', 'psql', 400], ['@append', 'termPoint', 'append-only']], hold: 0.7, post: [['termClose']] },
    { id: 'a10b09', pre: [['term', 'Terminal — IncidentZero']], cues: [['@script', 'termType', 'm1', 900], ['+0.2', 'termPrint', 'm1', 2400]] },
    { id: 'a10b10', cues: [[0, 'termPoint', 'SUMMARY: 24 passed, 0 failed']], hold: 0.4 },
    { id: 'a10b11', cues: [[0, 'termType', 'arch', 900], ['+0.1', 'termPrint', 'arch', 900], ['@pass', 'termPoint', 'BUILD SUCCESS']], hold: 0.8, post: [['termClose']] },
  ],
};

// =================================================================================================== ACT 11
export const titles = {
  team: { title: 'Incident-Zero', tag: 'Group 76 · Object-Oriented Programming · BITS Pilani, Hyderabad Campus',
    rows: [
      { key: 'suhani', name: 'Suhani Agarwal', what: 'SLA clock, business calendar, SLA policies' },
      { key: 'kartikey', name: 'Kartikey Negi', what: 'service catalogue, major-incident flow' },
      { key: 'harish', name: 'Harish Kumar', what: 'frontend, REST controllers' },
      { key: 'srijan', name: 'Srijan Shukla', what: 'domain core, state machine, audit ledger' },
    ] },
  oop: { title: 'Four ideas, four real problems', tag: 'where each one lives in the code',
    rows: [
      { key: 'enc', name: 'Encapsulation', what: 'Incident.createWithNumber: a broken ticket cannot exist' },
      { key: 'inh', name: 'Inheritance', what: 'ItsmException, AbstractIntakeStep' },
      { key: 'poly', name: 'Polymorphism', what: 'eleven state classes, one call' },
      { key: 'abs', name: 'Abstraction', what: 'ClockPort, IncidentRepository' },
    ] },
  end: { title: 'github.com/srijans123/IncidentZero', tag: 'the code, the tests and this video’s scripts',
    rows: [
      { key: 'live', name: 'Try it', what: 'srijans123.github.io/IncidentZero' },
      { key: 'thanks', name: 'Thank you', what: 'for watching' },
    ] },
};

export const act11 = {
  id: 'T11', title: 'Act 11 · the team', retries: 3,
  setup: [['goto', 'APP/app.html?tab=stage'], ['ready']],
  beats: [
    { id: 'a11b01', pre: [['title', 'team']], cues: [['@Suhani', 'reveal', 'suhani'], ['@Kartikey', 'reveal', 'kartikey'], ['@Harish', 'reveal', 'harish'], ['@me', 'reveal', 'srijan']], hold: 0.6 },
    { id: 'a11b02', pre: [['title', 'oop']], cues: [['@Encapsulation', 'reveal', 'enc'], ['@inheritance', 'reveal', 'inh'], ['@polymorphism', 'reveal', 'poly'], ['@abstraction', 'reveal', 'abs']], hold: 0.6 },
    { id: 'a11b03', pre: [['title', 'end']], cues: [['@address', 'reveal', 'live'], ['@Thank', 'reveal', 'thanks']], hold: 1.6 },
  ],
};
