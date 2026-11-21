// direction/diagrams.mjs — every flow chart and matrix shown in the video.
// Text here is shown on screen, so every label must stay true to the code it names.
const J = 'backend/src/main/java/edu/campus/iitsm';

export const diagrams = {
  // ---- Act 2 --------------------------------------------------------------------------------------------
  layers: {
    kind: 'flow', title: 'Inside every module: four layers', sub: 'Arrows show who is allowed to depend on whom', cols: 4, allLit: true,
    nodes: [
      { id: 'infra', label: 'infrastructure', sub: 'REST controllers, database adapters' },
      { id: 'app', label: 'application', sub: 'use cases, step by step' },
      { id: 'domain', label: 'domain', sub: 'plain Java business rules' },
      { id: 'api', label: 'api', sub: 'what other modules may see' },
    ],
    edges: [['infra', 'app'], ['app', 'domain']],
  },
  // ---- Act 3 --------------------------------------------------------------------------------------------
  errors: {
    kind: 'flow', title: 'One base class, fifteen errors', sub: `${J.split('/').slice(-1)}/shared/domain/error`, cols: 5, allLit: true, nodeWidth: 262,
    nodes: [
      { id: 'base', label: 'ItsmException', sub: 'abstract base: code + HTTP status', col: '3', row: '1' },
      { id: 'e1', label: 'InvalidStateTransition', sub: 'ITSM-4090 · 409', row: '2' },
      { id: 'e2', label: 'UnauthorizedOperation', sub: 'ITSM-4030 · 403', row: '2' },
      { id: 'e3', label: 'InvalidIncidentPayload', sub: 'ITSM-4220 · 422', row: '2' },
      { id: 'e4', label: 'IncidentNotFound', sub: 'ITSM-4041 · 404', row: '2' },
      { id: 'e5', label: '… and eleven more', sub: 'each with its own code', row: '2' },
    ],
    edges: [['base', 'e1'], ['base', 'e2'], ['base', 'e3'], ['base', 'e4'], ['base', 'e5']],
  },
  // ---- Act 6 --------------------------------------------------------------------------------------------
  strategies: {
    kind: 'flow', title: 'Seven ways to pick a technician', sub: 'All seven implement one interface: AssignmentStrategy', cols: 4, allLit: true,
    nodes: [
      { id: 'iface', label: 'AssignmentStrategy', sub: 'interface · assign(…)', col: '2 / span 2', row: '1' },
      { id: 'rr', label: 'RoundRobinStrategy', sub: 'take turns', row: '2' },
      { id: 'll', label: 'LeastLoadedStrategy', sub: 'least busy first', row: '2' },
      { id: 'sm', label: 'SkillMatchStrategy', sub: 'best skill overlap', row: '2' },
      { id: 'ex', label: 'ExperienceStrategy', sub: 'most experienced', row: '2' },
      { id: 'pa', label: 'PriorityAwareStrategy', sub: 'priority decides', row: '3' },
      { id: 'hw', label: 'HybridWeightedStrategy', sub: 'weighted mix', row: '3' },
      { id: 'hb', label: 'HungarianBatchStrategy', sub: 'assigns a whole batch', row: '3' },
    ],
    edges: [],
  },
  // ---- Act 9: the copilot ---------------------------------------------------------------------------------
  copilot: {
    kind: 'flow', title: 'What the copilot does while I type', sub: 'IntakeController.getAdvice', cols: 4, numbered: true,
    nodes: [
      { id: 'c1', label: 'Title + description', sub: '"Cannot open Moodle quiz…"', file: 'frontend/src/pages/portal/PortalReport.tsx', code: 'const res = await api.intake.getAdvice({' },
      { id: 'c2', label: 'POST /intake/advice', sub: 'sent 450 ms after I stop typing', file: `${J}/incident/infrastructure/web/IntakeController.java`, code: 'categorizationPort.classify(title, desc)' },
      { id: 'c3', label: 'Keyword rules', sub: '"moodle" → APP-LMS', file: `${J}/intelligence/infrastructure/classification/CategorizationAdapter.java`, code: 'fullText.contains("moodle") || fullText.contains("lms")' },
      { id: 'c4', label: 'Suggested service', sub: 'APP-LMS · Moodle LMS', file: 'frontend/src/pages/portal/PortalReport.tsx', code: 'setServiceCode(advice.suggestedService);' },
    ],
  },
  // ---- Act 9: T1 submit -------------------------------------------------------------------------------------
  submitFlow: {
    kind: 'flow', title: 'What one click on Submit does', sub: 'Every box is a file I opened earlier', cols: 4, numbered: true,
    nodes: [
      { id: 'btn', label: 'Submit button', sub: 'the click', num: '▶' },
      { id: 'n1', label: 'PortalReport.tsx', sub: 'handleSubmit', file: 'frontend/src/pages/portal/PortalReport.tsx · handleSubmit', code: 'const res = await api.incidents.create({' },
      { id: 'n2', label: 'api.ts', sub: 'POST /api/v1/incidents', file: 'frontend/src/services/api.ts · incidents.create', code: "method: 'POST'," },
      { id: 'n3', label: 'IncidentController', sub: 'createIncident', file: `${J}/incident/infrastructure/web/IncidentController.java`, code: 'intakeService.createIncident(' },
      { id: 'n4', label: 'IntakePipeline', sub: 'nine steps, in order', file: `${J}/incident/application/intake/IntakePipeline.java`, code: 'step.execute(ctx);' },
    ],
  },
  pipeline: {
    kind: 'flow', title: 'The intake pipeline: nine steps', sub: 'IntakePipeline runs them in order, passing one context along', cols: 5, numbered: true, nodeWidth: 262,
    nodes: [
      { id: 's1', label: 'Validate', sub: 'title 5–200, description ≥ 10', file: 'ValidateStep.java', code: 'ctx.rawTitle.trim().length() < 5' },
      { id: 's2', label: 'Sanitize', sub: 'strip HTML, hide emails', file: 'SanitizeRedactStep.java', code: 'strips HTML, hides emails and phone numbers' },
      { id: 's3', label: 'Create incident', sub: 'the factory method', file: `${J}/incident/domain/Incident.java · createWithNumber`, code: 'i.pending.add(new IncidentCreated(id, now, reporterId, serviceId, provisional));' },
      { id: 's4', label: 'Duplicate check', sub: 'link to a master ticket', file: 'DuplicateCheckStep.java', code: 'links the ticket to a master ticket if there is one' },
      { id: 's5', label: 'Category + service', sub: 'pick a category', file: 'CategoryAndServiceStep.java', code: 'picks the category and the service' },
      { id: 's6', label: 'Enrich', sub: 'exam words', file: 'EnrichStep.java', code: 'fullText.contains("quiz") || fullText.contains("exam") || fullText.contains("registration")' },
      { id: 's7', label: 'Priority + SLA', sub: 'matrix, then SLA policy', file: 'PriorityAndSlaStep.java', code: 'PriorityResult result = priorityStrategy.calculate(in);' },
      { id: 's8', label: 'Assign', sub: 'pick a technician', file: 'AssignStep.java', code: 'asks the assignment strategy for a technician' },
      { id: 's9', label: 'Persist + publish', sub: 'save, then events', file: `${J}/incident/application/intake/PersistAndPublishStep.java`, code: 'incidentRepository.save(ctx.incident);' },
    ],
  },
  chain: {
    kind: 'flow', title: 'The audit listener writes the first links', sub: 'Each entry stores the hash of the one before it', cols: 4,
    nodes: [
      { id: 'g', label: 'GENESIS', sub: '0000…0000' },
      { id: 'h1', label: 'Entry 1', sub: 'hash( GENESIS + entry 1 )', file: `${J}/audit/infrastructure/AuditLedgerInTxListener.java`, code: 'AuditHasher.computeHash(' },
      { id: 'h2', label: 'Entry 2', sub: 'hash( hash 1 + entry 2 )', file: `${J}/audit/domain/AuditHasher.java`, code: 'prevHash != null ? prevHash : GENESIS_HASH,' },
      { id: 'h3', label: 'Entry 3', sub: 'hash( hash 2 + entry 3 )', file: `${J}/audit/domain/AuditHasher.java`, code: 'MessageDigest md = MessageDigest.getInstance("SHA-256");' },
    ],
  },
  matrix: {
    kind: 'matrix', title: 'Why this ticket is P2', sub: 'ItilMatrixPriorityStrategy: impact against urgency, then the bumps',
    rows: ['Impact 1', 'Impact 2', 'Impact 3'], cols: ['Urgency 1 · Standard', 'Urgency 2 · High', 'Urgency 3 · Critical'],
    cells: [['P4', 'P4', 'P3'], ['P4', 'P3', 'P2'], ['P3', 'P2', 'P1']],
  },
  // ---- Act 9: T2 acknowledge ------------------------------------------------------------------------------
  ackFlow: {
    kind: 'flow', title: 'What one click on Acknowledge does', sub: 'Same files, same order as in the code walk-through', cols: 4, numbered: true,
    nodes: [
      { id: 'a0', label: 'Acknowledge button', sub: 'the click', num: '▶' },
      { id: 'a1', label: 'WorkbenchDetail.tsx', sub: 'runCommand', file: 'frontend/src/pages/workbench/WorkbenchDetail.tsx · runCommand', code: 'await api.incidents.command(incidentId, commandSlug, payload);' },
      { id: 'a2', label: 'POST …/commands/acknowledge', sub: 'the action name is in the URL', file: 'frontend/src/services/api.ts · incidents.command', code: '`/incidents/${id}/commands/${command}`' },
      { id: 'a3', label: 'IncidentController', sub: 'the switch', file: `${J}/incident/infrastructure/web/IncidentController.java · executeCommand`, code: 'case "acknowledge" -> commandService.acknowledge(' },
      { id: 'a4', label: 'IncidentCommandService', sub: 'load · check · call · save', file: `${J}/incident/application/IncidentCommandService.java · acknowledge`, code: 'Incident inc = load(incidentId);' },
      { id: 'a5', label: 'CommandAuthorizer', sub: 'is this user allowed?', file: `${J}/incident/application/CommandAuthorizer.java · authorize`, code: 'case ACKNOWLEDGE, START_INVESTIGATION, REQUEST_USER_INFO, RESOLVE -> isAssignee;' },
      { id: 'a6', label: 'AssignedState', sub: 'acknowledge', file: `${J}/incident/domain/AssignedState.java · acknowledge`, code: 'inc.stopResponse(now, cal, true);' },
      { id: 'a7', label: 'Next state', sub: 'ACKNOWLEDGED', file: `${J}/incident/domain/AssignedState.java · acknowledge`, code: 'return new TransitionResult(AcknowledgedState.INSTANCE, List.of(new IncidentAcknowledged(inc.id(), now, actor)));' },
    ],
  },
  // ---- Act 9: T3 pause --------------------------------------------------------------------------------------
  pauseFlow: {
    kind: 'flow', title: 'Asking the student pauses the clock', sub: 'The resolution clock, not the technician, waits', cols: 4, numbered: true,
    nodes: [
      { id: 'p0', label: 'Send request', sub: 'the click', num: '▶' },
      { id: 'p1', label: 'InProgressState', sub: 'requestUserInfo', file: `${J}/incident/domain/InProgressState.java · requestUserInfo`, code: 'inc.pauseResolution(now, cal);' },
      { id: 'p2', label: 'SlaClock.pause', sub: 'returns a new clock', file: `${J}/incident/domain/SlaClock.java · pause`, code: 'return new SlaClock(ClockState.PAUSED, consumedMs + delta, lastResumeAt, targetMs, mode);' },
      { id: 'p3', label: 'Resolution clock', sub: 'RUNNING', file: `${J}/incident/domain/InProgressState.java · requestUserInfo`, code: 'return new TransitionResult(PendingUserState.INSTANCE, List.of(new UserInfoRequested(inc.id(), now, actor, q)));' },
    ],
  },
  noteRule: {
    kind: 'flow', title: 'A lazy note is refused by the domain', sub: 'The rule lives in the Resolution record, not in the form', cols: 3, numbered: true,
    nodes: [
      { id: 'r1', label: 'Note: "done"', sub: '4 characters', file: 'what a lazy technician would type', code: 'new Resolution("FIXED", "done", "CONFIG_ERROR")' },
      { id: 'r2', label: 'Resolution', sub: 'the record constructor', file: `${J}/incident/domain/Resolution.java`, code: 'if (notes == null || notes.strip().length() < 20) {' },
      { id: 'r3', label: 'Rejected', sub: 'ITSM-4220 · HTTP 422', file: `${J}/incident/domain/Resolution.java`, code: 'throw new InvalidIncidentPayloadException("resolution.notes", "must be at least 20 characters");' },
    ],
  },
  // ---- Act 9: T4 verify -------------------------------------------------------------------------------------
  verifyFlow: {
    kind: 'flow', title: 'What Confirm It Is Fixed does', sub: 'Only the reporter can take this step', cols: 4, numbered: true,
    nodes: [
      { id: 'v0', label: 'Confirm button', sub: 'the click', num: '▶' },
      { id: 'v1', label: 'PortalDetail.tsx', sub: 'handleVerifyResolution', file: 'frontend/src/pages/portal/PortalDetail.tsx · handleVerifyResolution', code: "await api.incidents.command(incidentId, 'verify', {" },
      { id: 'v2', label: 'ResolvedState', sub: 'verify', file: `${J}/incident/domain/ResolvedState.java · verify`, code: 'if (!inc.reporterId().equals(actor) && !Actors.SYSTEM.equals(actor)) {' },
      { id: 'v3', label: 'Next state', sub: 'VERIFIED', file: `${J}/incident/domain/ResolvedState.java · verify`, code: 'return new TransitionResult(VerifiedState.INSTANCE, List.of(new ResolutionVerified(inc.id(), now, actor, rating)));' },
    ],
  },
  // ---- Act 10 -------------------------------------------------------------------------------------------
  ledgerCheck: {
    kind: 'flow', title: 'Verifying the ledger', sub: 'AuditHasher.verifyIncidentChain', cols: 4, numbered: true,
    nodes: [
      { id: 'l1', label: 'Read the entries', sub: 'oldest first' },
      { id: 'l2', label: 'Recompute each hash', sub: 'from the stored fields', file: `${J}/audit/domain/AuditHasher.java · verifyIncidentChain`, code: 'String recomputed = computeHash(' },
      { id: 'l3', label: 'Compare', sub: 'recomputed = stored ?', file: `${J}/audit/domain/AuditHasher.java · verifyIncidentChain`, code: 'if (!recomputed.equals(r.hash())) {' },
      { id: 'l4', label: 'Result', sub: 'every entry must match' },
    ],
  },
};
