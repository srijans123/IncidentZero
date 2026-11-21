// direction/code.mjs — Acts 0 to 8: the landing page, then the repository on GitHub, file by file.
// One beat per narration line (same ids as SCRIPT.md and the audio files).
//
// A beat:  { id, pre:[steps run silently before the voice starts], cues:[[when, verb, ...args]], hold, post:[steps after the voice] }
//   when = seconds from the start of the voice | '@word' = when that word is spoken | '+0.4' = after the previous cue | '@end'
// Steps in `cues` run one after another; if one is still busy when the next is due, the next simply starts late.
import { cards } from './cards.mjs';

const J = '{J}';
const DOM = `${J}/incident/domain`, APP = `${J}/incident/application`, INTAKE = `${APP}/intake`, PRIO = `${APP}/priority`;
const INFRA = `${J}/incident/infrastructure`, SHARED = `${J}/shared/domain`, STRAT = `${J}/assignment/application/strategy`;

/** With the text cursor, drag-select the card's lines on the GitHub page, then open the card over them. */
const sel = (id) => { const c = cards[id]; return [['ghSelect', c.path, c.from, c.to, { plus: c.plus || 0 }], ['wait', 250], ['card', id]]; };
/** Open file `name` in folder `dir` on GitHub (back to the folder, click the file), select the card's lines, open the card. */
const file = (id, dir, name) => [['cardClose'], ['wait', 400], ['ghOpen', dir, name, cards[id].path], ...sel(id)];
/** Another card from the file that is already open. */
const next = (id) => [['cardClose'], ['ghUnselect'], ...sel(id)];
/** Turn a list of steps into cues that start at second 0 and run back to back. */
const now = (steps) => steps.map((s, i) => [i ? '+0' : 0, ...s]);
const hover = (word, name, hold = 600) => [`@${word}`, 'ghHover', name, hold];

// =================================================================================================== ACT 0
export const act0 = {
  id: 'T00', title: 'Act 0 · landing page, then the app', retries: 3,
  beats: [
    { id: 'a00b01', pre: [['goto', 'LANDING', { settle: 1800 }], ['expect', 'Incident-Zero']], cues: [[0.4, 'move', 'h1'], ['@Incident-Zero', 'scrollBy', 260, 1600]] },
    { id: 'a00b02', cues: [[0, 'scrollBy', 420, 1800]] },
    { id: 'a00b03', cues: [[0, 'scrollTo', '#carts', { ms: 1400 }], ['@technician', 'scrollTo', '#deck', { ms: 1200 }]] },
    { id: 'a00b04', cues: [['@log', 'scrollTo', '#ledger', { ms: 1200 }], ['+0', 'try', 'click', '#ver']] },
    { id: 'a00b05', cues: [[0, 'scrollTo', '#statsSection', { ms: 1200 }], ['@That', 'scrollTo', '.call', { ms: 1000 }], ['+0', 'point', { within: '.call', text: 'Launch Full App (React)' }, { hold: 900 }]], hold: 0.2 },
    { id: 'a00b06',
      pre: [['click', { within: '.call', text: 'Launch Full App (React)' }, { after: 1500 }], ['nav', 'CURRENT'], ['ready'], ['expect', 'Workbench']],
      cues: [[0.3, 'move', { role: 'button', name: 'Campus Stage' }], ['@repository', 'move', { role: 'button', name: 'Student Portal' }], ['@explain', 'move', { role: 'button', name: 'Workbench' }]] },
    { id: 'a00b07', cues: [['@run', 'click', { role: 'button', name: 'Student Portal' }], ['+0', 'ready'], ['@click', 'point', { text: 'Report New Incident' }, { hold: 900 }]] },
  ],
};

// =================================================================================================== ACT 1
export const act1 = {
  id: 'T01', title: 'Act 1 · the repository', chip: '1 · THE REPO', retries: 3,
  setup: [['ghGoto', 'tree/<SHA>']],
  beats: [
    { id: 'a01b01', cues: [[0.3, 'ghHover', 'README.md', 500], ['@readme', 'scrollTo', { text: 'What is Incident-Zero?' }, { block: 'start', ms: 1300 }]] },
    { id: 'a01b02', cues: [[0, 'point', { text: 'It is deliberately small to operate' }, { hold: 2600 }]] },
    { id: 'a01b03', cues: [[0, 'scrollTo', { text: 'Report · Classify · Prioritize' }, { ms: 1100 }], ['+0', 'point', { text: 'Report · Classify · Prioritize' }, { hold: 3800 }]] },
    { id: 'a01b04', cues: [[0, 'scrollTop'], ['@backend', 'ghHover', 'backend', 1600], ['+2.5', 'move', '#__zk_layer', { at: [0.35, 0.62] }]] },
    { id: 'a01b05', cues: [[0, 'ghHover', 'frontend', 1600]] },
    { id: 'a01b06', cues: [[0, 'ghClick', 'docs', { fallback: 'tree/<SHA>/docs' }], ['+0', 'ghClick', 'adr', { fallback: 'tree/<SHA>/docs/adr' }], ['@Each', 'ghHover', 'ADR-001.md', 400], ['+0', 'ghHover', 'ADR-004.md', 400]] },
    { id: 'a01b07', cues: [[0, 'ghGoto', 'tree/<SHA>'], ['+0', 'ghHover', 'scripts', 1400]] },
    { id: 'a01b08', cues: [[0, 'ghHover', 'deploy', 1400]] },
    { id: 'a01b09', cues: [[0, 'ghHover', '.github/workflows', 1400]] },
    { id: 'a01b10', cues: [[0, 'ghHover', 'tools', 450], ['+0', 'ghHover', 'upload', 450]] },
    { id: 'a01b11', cues: [['@backend', 'ghClick', 'backend', { fallback: 'tree/<SHA>/backend' }]] },
  ],
};

// =================================================================================================== ACT 2
export const act2 = {
  id: 'T02', title: 'Act 2 · modules and layers', chip: '2 · MODULES', retries: 3,
  setup: [['ghGoto', 'tree/<SHA>/backend']],
  beats: [
    { id: 'a02b01', cues: [[0, 'ghClick', 'src', { fallback: 'tree/<SHA>/backend/src' }], ['+0', 'ghClick', 'main', { fallback: 'tree/<SHA>/backend/src/main' }], ['+0', 'ghClick', 'iitsm', { fallback: `tree/<SHA>/${J}` }]] },
    { id: 'a02b02', cues: [[0, 'ghHover', 'incident', 1500]] },
    { id: 'a02b03', cues: [hover('Assignment', 'assignment'), hover('SLA', 'sla'), hover('audit', 'audit', 900)] },
    { id: 'a02b04', cues: [hover('Identity', 'identity'), hover('notification', 'notification'), hover('intelligence', 'intelligence', 900)] },
    { id: 'a02b05', cues: [hover('Catalog', 'catalog', 350), ['+0', 'ghHover', 'knowledge', 350], ['+0', 'ghHover', 'shared', 900]] },
    { id: 'a02b06', cues: [[0, 'ghClick', 'incident', { fallback: `tree/<SHA>/${J}/incident` }]] },
    { id: 'a02b07', cues: [[0, 'ghHover', 'domain', 1800]] },
    { id: 'a02b08', cues: [[0, 'ghHover', 'application', 1200]] },
    { id: 'a02b09', cues: [[0, 'ghHover', 'infrastructure', 900], ['@api', 'ghHover', 'api', 1200]] },
    { id: 'a02b10', cues: [[0, 'diagram', 'layers'], ['@Outer', 'glow', 'infra'], ['@inner', 'glow', 'domain'], ['@never', 'mark', 'domain', 'good', 'depends on nothing outside']] },
    { id: 'a02b11', cues: [[0.2, 'glow', 'app'], ['+0.8', 'glow', 'infra']], post: [['diagramClose']] },
    { id: 'a02b12',
      pre: [['ghGoto', 'blob/<SHA>/backend/src/test/java/edu/campus/iitsm/ArchitectureTest.java'], ...sel('C02-A')],
      cues: [
        ['@domain', 'hl', 'resideInAPackage("..domain..")'], ['@Spring', 'hl', '"org.springframework.."'], ['+0', 'tok', '"org.springframework.."'], ['@JPA', 'hl', '"jakarta.persistence.."'], ['+0', 'tok', '"jakarta.persistence.."'], ['@Jackson', 'hl', '"tools.jackson.."'], ['+0', 'tok', '"tools.jackson.."']] },
    { id: 'a02b13', cues: [[0, 'hl', 'R1_domain_has_zero_framework_imports'], ['@build', 'note', 'Checked on every build']], hold: 0.6, post: [['cardClose']] },
  ],
};

// =================================================================================================== ACT 3
export const act3 = {
  id: 'T03', title: 'Act 3 · the domain core', chip: '3 · DOMAIN CORE', retries: 3,
  setup: [['ghGoto', `tree/<SHA>/${J}/incident`]],
  beats: [
    { id: 'a03b01', cues: [[0.2, 'ghClick', 'domain', { fallback: `tree/<SHA>/${DOM}` }]] },
    { id: 'a03b02', cues: [hover('NewState', 'NewState.java', 350), hover('AssignedState', 'AssignedState.java', 350), hover('ResolvedState', 'ResolvedState.java', 500)] },
    { id: 'a03b03', cues: [[0, 'ghOpen', DOM, 'Incident.java'], ...sel('C03-A').slice(0, 1).map((s) => ['+0', ...s])] },
    // -------- Incident.createWithNumber
    { id: 'a03b04', pre: [['card', 'C03-A']], cues: [[0, 'hl', 'public static Incident createWithNumber('], ['@factory', 'tok', 'createWithNumber']] },
    { id: 'a03b05', cues: [[0, 'hl', 'if (cleanTitle.length() < 5 || cleanTitle.length() > 200) {', 'throw new InvalidIncidentPayloadException("title", "must be between 5 and 200 characters");'], ['@five', 'tok', 'cleanTitle.length() < 5 || cleanTitle.length() > 200'], ['@throws', 'tok', 'throw new InvalidIncidentPayloadException("title"']] },
    { id: 'a03b06', cues: [[0, 'hl', 'if (cleanDesc.length() < 10 || cleanDesc.length() > 4000) {'], ['@ten', 'tok', 'cleanDesc.length() < 10'], ['@impact', 'hl', 'if (impact < 1 || impact > 3)', 'if (urgency < 1 || urgency > 3)'], ['+0', 'tok', 'impact < 1 || impact > 3'], ['@urgency', 'tok', 'urgency < 1 || urgency > 3']] },
    { id: 'a03b07', cues: [['@build', 'hl', 'Incident i = new Incident('], ['@record', 'hl', 'i.pending.add(new IncidentCreated('], ['+0', 'tok', 'new IncidentCreated(']] },
    { id: 'a03b08', cues: [[0, 'unhl'], ['@encapsulation', 'note', 'Encapsulation']], hold: 0.6 },
    // -------- the actions, commit, pullEvents
    { id: 'a03b09', pre: next('C03-B'), cues: [['@acknowledge', 'hl', 'public void acknowledge('], ['@resolve', 'hl', 'public void resolve('], ['@verify', 'hl', 'public void verify('], ['@close', 'hl', 'public void close(']] },
    { id: 'a03b10', cues: [['@asks', 'hl', 'commit(state.acknowledge(this, actor, now, cal));'], ['@state', 'tok', 'state.acknowledge(this, actor, now, cal)']] },
    { id: 'a03b11', cues: [[0, 'unhl'], ['@never', 'note', 'No if-else on the state']] },
    { id: 'a03b12', pre: next('C03-C'), cues: [['@commit', 'hl', 'private void commit(TransitionResult r) {'], ['@switches', 'hl', 'this.state = r.nextState();'], ['@stores', 'hl', 'this.pending.addAll(r.events());']] },
    { id: 'a03b13', cues: [[0, 'hl', 'if (changed) this.version++;'], ['@version', 'tok', 'this.version++']] },
    { id: 'a03b14', pre: next('C03-D'), cues: [[0, 'hl', 'List<DomainEvent> copy = List.copyOf(pending);'], ['@pulls', 'tok', 'pullEvents']], hold: 0.5 },
    // -------- IncidentState
    { id: 'a03b15', cues: [...now(file('C03-E', DOM, 'IncidentState.java')), ['+0', 'hl', 'public sealed interface IncidentState']] },
    { id: 'a03b16', cues: [['@sealed', 'tok', 'sealed'], ['@permits', 'hl', 'permits NewState, ClassifiedState, AssignedState, AcknowledgedState, InProgressState,', 'PendingUserState, ResolvedState, VerifiedState, ReopenedState, ClosedState, CancelledState {'],
        ['@eleven', 'toks', ['NewState', 'ClassifiedState', 'AssignedState', 'AcknowledgedState', 'InProgressState', 'PendingUserState', 'ResolvedState', 'VerifiedState', 'ReopenedState', 'ClosedState', 'CancelledState'], 2600]] },
    { id: 'a03b17', cues: [[0, 'hl', 'default TransitionResult acknowledge(', 'throw StateSupport.illegal(inc, status(), CommandType.ACKNOWLEDGE);'], ['@default', 'tok', 'default'], ['@throws', 'tok', 'throw StateSupport.illegal']] },
    { id: 'a03b18', cues: [[0, 'note', 'Forbidden unless overridden']], hold: 0.5 },
    // -------- AssignedState
    { id: 'a03b19', cues: [...now(file('C03-F', DOM, 'AssignedState.java')), ['+0', 'hl', '@Override public TransitionResult acknowledge(']] },
    { id: 'a03b20', cues: [[0, 'hl', 'StateSupport.requireAssignee(inc, actor, "acknowledge");'], ['@assigned', 'tok', 'requireAssignee']] },
    { id: 'a03b21', cues: [[0, 'hl', 'inc.stopResponse(now, cal, true);'], ['@stops', 'tok', 'stopResponse']] },
    { id: 'a03b22', cues: [[0, 'hl', 'return new TransitionResult(AcknowledgedState.INSTANCE,'], ['@Acknowledged', 'tok', 'AcknowledgedState.INSTANCE'], ['@event', 'tok', 'new IncidentAcknowledged(inc.id(), now, actor)']] },
    { id: 'a03b23', cues: [[0, 'unhl'], ['@polymorphism', 'note', 'Polymorphism · State pattern']] },
    { id: 'a03b24', cues: [[0.3, 'hl', 'final class AssignedState implements IncidentState {']], hold: 0.5 },
    // -------- ResolvedState
    { id: 'a03b25', cues: [...now(file('C03-G', DOM, 'ResolvedState.java')), ['@Only', 'hl', 'if (!inc.reporterId().equals(actor) && !Actors.SYSTEM.equals(actor)) {'], ['+0', 'tok', 'inc.reporterId().equals(actor)']] },
    { id: 'a03b26', cues: [[0, 'hl', 'if (rating != null && (rating < 1 || rating > 5)) {'], ['@one', 'tok', 'rating < 1 || rating > 5']] },
    { id: 'a03b27', cues: [[0, 'hl', 'inc.reopen(now);', 'return new TransitionResult(ReopenedState.INSTANCE, events);'], ['@reopened', 'tok', 'ReopenedState.INSTANCE']], hold: 0.5 },
    // -------- the error classes
    { id: 'a03b28', cues: [[0, 'cardClose'], ['+0', 'ghGoto', `tree/<SHA>/${J}/shared/domain/error`], ['+0', 'ghHover', 'InvalidStateTransitionException.java', 500], ['@fourteen', 'diagram', 'errors'], ['@base', 'glow', 'base']], hold: 0.5 },
    { id: 'a03b29',
      pre: [['diagramClose'], ['ghClick', 'InvalidStateTransitionException.java', { fallback: `blob/<SHA>/${cards['C03-H'].path}` }], ...sel('C03-H')],
      cues: [[0, 'hl', 'super("ITSM-4090", 409,'], ['@code', 'tok', '"ITSM-4090"'], ['@status', 'tok', '409'], ['@inheritance', 'hl', 'public final class InvalidStateTransitionException extends ItsmException {'], ['+0', 'tok', 'extends ItsmException'], ['+0', 'note', 'Inheritance']],
      hold: 0.8, post: [['cardClose']] },
  ],
};

// =================================================================================================== ACT 4
export const act4 = {
  id: 'T04', title: 'Act 4 · time', chip: '4 · TIME', retries: 3,
  setup: [['ghGoto', `tree/<SHA>/${DOM}`]],
  beats: [
    { id: 'a04b01', cues: [['@deadlines', 'ghHover', 'SlaClock.java', 1200]] },
    { id: 'a04b02', cues: [...now(file('C04-A', DOM, 'SlaClock.java')), ['+0', 'hl', 'public record SlaClock('], ['+0', 'tok', 'record']] },
    { id: 'a04b03', cues: [[0, 'hl', 'public SlaClock pause(Instant now, WorkingTimeCalculator cal) {', 'return new SlaClock(ClockState.PAUSED, consumedMs + delta, lastResumeAt, targetMs, mode);'], ['@returns', 'tok', 'new SlaClock(ClockState.PAUSED'], ['@time', 'tok', 'consumedMs + delta']] },
    { id: 'a04b04', cues: [[0, 'hl', 'long delta = cal.workingMillisBetween(lastResumeAt, now, mode == ClockMode.CONTINUOUS_24X7);'], ['@calendar', 'tok', 'cal.workingMillisBetween']], hold: 0.5 },
    { id: 'a04b05', cues: [...now(file('C04-B', DOM, 'Incident.java')), ['@seventy-five', 'hl', 'boolean atRisk = ratio(responseClock, now, cal) >= 0.75 || ratio(resolutionClock, now, cal) >= 0.75;'], ['+0', 'tok', '>= 0.75']] },
    { id: 'a04b06', cues: [[0, 'hl', 'slaStatus = SlaStatus.BREACHED;'], ['@permanent', 'hl', '} else if (slaStatus != SlaStatus.BREACHED) {'], ['+0', 'tok', 'slaStatus != SlaStatus.BREACHED']], hold: 0.5 },
    { id: 'a04b07', cues: [...now(file('C04-C', `${J}/catalog/domain`, 'BusinessCalendar.java')), ['@working', 'hl', 'return workDays.contains(date.getDayOfWeek()) && !holidays.contains(date);'], ['@week', 'tok', 'workDays.contains(date.getDayOfWeek())'], ['@holiday', 'tok', '!holidays.contains(date)']] },
    { id: 'a04b08', pre: next('C04-D'), cues: [[0, 'hl', 'while (!cur.toLocalDate().isAfter(stop.toLocalDate())) {'], ['@adds', 'hl', 'if (isWorkingDay(date)) {', 'totalMs += Duration.between(effStart, effEnd).toMillis();'], ['+0', 'tok', 'totalMs += Duration.between(effStart, effEnd).toMillis()']] },
    { id: 'a04b09', cues: [[0, 'note', 'Weekends and holidays do not count']], hold: 0.5 },
    { id: 'a04b10', cues: [[0, 'cardClose'], ['+0', 'ghGoto', `tree/<SHA>/${SHARED}`], ['+0', 'ghHover', 'ClockPort.java', 900]] },
    { id: 'a04b11', cues: [...now(file('C04-E', SHARED, 'ClockPort.java')), ['+0', 'hl', 'Instant now();']] },
    { id: 'a04b12', cues: [...now(file('C04-F', SHARED, 'VirtualAnchoredClock.java')), ['@multiplies', 'hl', 'return a.virtualInstant().plusNanos(elapsedRealNanos * a.scaleFactor());'], ['+0', 'tok', 'elapsedRealNanos * a.scaleFactor()']] },
    { id: 'a04b13', cues: [[0, 'hl', 'public void setScaleFactor(int newFactor) {'], ['@thirty', 'tok', 'setScaleFactor']] },
    { id: 'a04b14', cues: [[0, 'unhl'], ['+0.1', 'note', 'Abstraction']], hold: 0.7, post: [['cardClose']] },
  ],
};

// =================================================================================================== ACT 5
export const act5 = {
  id: 'T05', title: 'Act 5 · the intake pipeline', chip: '5 · INTAKE PIPELINE', retries: 3,
  setup: [['ghGoto', `tree/<SHA>/${APP}`]],
  beats: [
    { id: 'a05b01', cues: [['@folder', 'ghClick', 'intake', { fallback: `tree/<SHA>/${INTAKE}` }]] },
    { id: 'a05b02', cues: [...now(file('C05-A', INTAKE, 'IntakePipeline.java')), ['@sorts', 'hl', '.sorted(Comparator.comparingInt(IntakeStep::order))'], ['+0', 'tok', 'IntakeStep::order']] },
    { id: 'a05b03', cues: [[0, 'hl', 'for (IntakeStep step : sortedSteps) {', 'step.execute(ctx);'], ['@context', 'tok', 'step.execute(ctx)']], hold: 0.5 },
    { id: 'a05b04', cues: [[0, 'cardClose'], ['+0', 'ghFolder', INTAKE], hover('Validate', 'ValidateStep.java', 700), hover('Sanitize', 'SanitizeRedactStep.java', 900)] },
    { id: 'a05b05', cues: [hover('create', 'CreateProvisionalIncidentStep.java'), hover('link', 'DuplicateCheckStep.java'), hover('pick', 'CategoryAndServiceStep.java', 800)] },
    { id: 'a05b06', cues: [hover('Enrich', 'EnrichStep.java', 500), hover('priority', 'PriorityAndSlaStep.java', 350), hover('assignment', 'AssignStep.java', 350), hover('saving', 'PersistAndPublishStep.java', 800)] },
    { id: 'a05b07', cues: [...now(file('C05-B', INTAKE, 'AbstractIntakeStep.java')), ['+0', 'hl', 'public final void execute(IntakeContext ctx) {'], ['@final', 'tok', 'final']] },
    { id: 'a05b08', cues: [[0, 'hl', 'log.warn("Error in intake step {}: {}", getClass().getSimpleName(), e.getMessage());', 'log.debug("Intake step {} completed in {}ms", getClass().getSimpleName(), duration.toMillis());']] },
    { id: 'a05b09', cues: [[0, 'hl', 'protected abstract void doExecute(IntakeContext ctx);'], ['@doExecute', 'tok', 'doExecute']] },
    { id: 'a05b10', cues: [[0, 'unhl'], ['@Template', 'note', 'Template Method · Inheritance']], hold: 0.6 },
    { id: 'a05b11', cues: [...now(file('C05-C', INTAKE, 'ValidateStep.java')), ['+0', 'hl', 'ctx.rawTitle.trim().length() < 5'], ['+0', 'tok', 'ctx.rawTitle.trim().length() < 5']], hold: 0.5 },
    { id: 'a05b12', cues: [...now(file('C05-D', INTAKE, 'PriorityAndSlaStep.java')), ['@asks', 'hl', 'PriorityResult result = priorityStrategy.calculate(in);'], ['+0', 'tok', 'priorityStrategy.calculate(in)']] },
    { id: 'a05b13', cues: [[0, 'hl', 'SlaSnapshot sla = slaPolicyResolver.resolve(tier, result.priority());'], ['@policy', 'tok', 'slaPolicyResolver.resolve(tier, result.priority())']] },
    { id: 'a05b14', cues: [[0, 'hl', 'ctx.incident.classify('], ['@classify', 'tok', 'ctx.incident.classify']], hold: 0.5 },
    { id: 'a05b15', cues: [...now(file('C05-E', PRIO, 'ItilMatrixPriorityStrategy.java')), ['@matrix', 'hl', '{Priority.P4, Priority.P4, Priority.P3},', '{Priority.P4, Priority.P3, Priority.P2},', '{Priority.P3, Priority.P2, Priority.P1}']] },
    { id: 'a05b16', pre: next('C05-F'), cues: [[0, 'hl', 'if (in.activeCalendarWindow()) {', 'Active exam/registration window (+1)'], ['@exam', 'tok', 'in.activeCalendarWindow()'], ['@up', 'tok', 'cur.bumpOneLevel()']], hold: 0.5 },
    { id: 'a05b17', cues: [[0, 'cardClose'], ['+0', 'ghFolder', PRIO], hover('three', 'ItilMatrixPriorityStrategy.java', 300), ['+0', 'ghHover', 'ProductScorePriorityStrategy.java', 300], ['+0', 'ghHover', 'WeightedScorePriorityStrategy.java', 300], hover('interface', 'PriorityStrategy.java', 1200)] },
  ],
};

// =================================================================================================== ACT 6
export const act6 = {
  id: 'T06', title: 'Act 6 · commands and assignment', chip: '6 · COMMANDS', retries: 3,
  setup: [['ghGoto', `tree/<SHA>/${APP}`]],
  beats: [
    { id: 'a06b01', cues: [['@class', 'ghOpen', APP, 'IncidentCommandService.java'], ...sel('C06-A').slice(0, 1).map((s) => ['+0', ...s])] },
    { id: 'a06b02', pre: [['card', 'C06-A']], cues: [['@Load', 'hl', 'Incident inc = load(incidentId);'], ['+0', 'tok', 'load(incidentId)']] },
    { id: 'a06b03', cues: [[0, 'hl', 'commandAuthorizer.authorize(inc, CommandType.ACKNOWLEDGE,'], ['+0.2', 'tok', 'commandAuthorizer.authorize']] },
    { id: 'a06b04', cues: [[0, 'hl', 'inc.acknowledge(actorId, now, calendar);'], ['+0.2', 'tok', 'inc.acknowledge']] },
    { id: 'a06b05', cues: [[0, 'hl', 'commitAndPublish(inc);'], ['@publish', 'card', 'C06-A2'], ['+0', 'hl', 'incidentRepository.save(incident);', 'eventPublisher.publishEvent(event);']] },
    { id: 'a06b06', cues: [[0, 'card', 'C06-A'], ['+0', 'hl', '@Transactional'], ['+0', 'tok', '@Transactional']], hold: 0.6 },
    { id: 'a06b07', cues: [...now(file('C06-B', APP, 'CommandAuthorizer.java')), ['+0', 'hl', 'boolean allowed = switch (cmd) {'], ['+0', 'tok', 'switch (cmd)']] },
    { id: 'a06b08', cues: [[0, 'hl', 'case ACKNOWLEDGE, START_INVESTIGATION, REQUEST_USER_INFO, RESOLVE -> isAssignee;'], ['@assigned', 'tok', 'isAssignee']] },
    { id: 'a06b09', cues: [[0, 'hl', 'case PROVIDE_USER_INFO, VERIFY, REJECT_RESOLUTION -> isReporter;'], ['@student', 'tok', 'isReporter']] },
    { id: 'a06b10', cues: [[0, 'hl', 'case ASSIGN, DECLARE_MAJOR -> isTeamLead || isAdmin;'], ['@team', 'tok', 'isTeamLead || isAdmin']], hold: 0.5 },
    { id: 'a06b11', cues: [...now(file('C06-C', `${J}/assignment/domain`, 'AssignmentStrategy.java')), ['+0', 'hl', 'public interface AssignmentStrategy {']] },
    { id: 'a06b12', cues: [[0, 'diagram', 'strategies'], ['+0', 'glow', 'iface'], ['@round', 'glow', 'rr'], ['@least', 'glow', 'll'], ['@skill', 'glow', 'sm'], ['@experience', 'glow', 'ex'], ['@few', 'glow', 'pa'], ['+0.35', 'glow', 'hw']] },
    { id: 'a06b13', cues: [[0.2, 'glow', 'hb']], hold: 0.5 },
    { id: 'a06b14', cues: [[0, 'glow', 'll'], ['+0.5', 'diagramClose'], ['+0', 'ghOpen', STRAT, 'LeastLoadedStrategy.java', cards['C06-D'].path], ...sel('C06-D').map((s) => ['+0', ...s]), ['+0', 'hl', 'StrategySupport.filterEligible('], ['+0', 'tok', 'StrategySupport.filterEligible']] },
    { id: 'a06b15', cues: [[0, 'hl', '.comparingDouble(TechnicianCandidate::loadRatio)'], ['@takes', 'hl', 'TechnicianCandidate chosen = eligible.get(0);'], ['+0', 'tok', 'eligible.get(0)']] },
    { id: 'a06b16', cues: [[0, 'unhl'], ['+0.1', 'note', 'Strategy pattern again']], hold: 0.7, post: [['cardClose']] },
  ],
};

// =================================================================================================== ACT 7
export const act7 = {
  id: 'T07', title: 'Act 7 · infrastructure', chip: '7 · INFRASTRUCTURE', retries: 3,
  setup: [['ghGoto', `tree/<SHA>/${INFRA}`]],
  beats: [
    { id: 'a07b01', cues: [['@infrastructure', 'ghHover', 'persistence', 600], ['@outside', 'ghHover', 'web', 900]] },
    { id: 'a07b02', cues: [...now(file('C07-A', `${INFRA}/web`, 'IncidentController.java')), ['+0', 'hl', '@PostMapping', 'public ResponseEntity<IncidentDtos.IncidentDetailResponse> createIncident(']] },
    { id: 'a07b03', cues: [[0, 'hl', '@RequestBody IncidentDtos.CreateIncidentRequest req,'], ['@hands', 'card', 'C07-A2'], ['+0', 'hl', 'Incident created = intakeService.createIncident('], ['@returns', 'hl', 'IncidentDtos.IncidentDetailResponse detail = queryPort.findIncidentDetail(created.id())']] },
    { id: 'a07b04', cues: [[0, 'unhl'], ['+0.2', 'note', 'No business rules here']], hold: 0.5 },
    { id: 'a07b05', pre: next('C07-B'), cues: [[0, 'hl', 'switch (command.toLowerCase()) {'], ['@name', 'tok', 'command.toLowerCase()']] },
    { id: 'a07b06', cues: [[0, 'hl', 'case "acknowledge" -> commandService.acknowledge('], ['+0.9', 'hl', 'case "start" -> commandService.startInvestigation('], ['+0.9', 'hl', 'case "request-info" -> commandService.requestUserInfo(']], hold: 0.5 },
    { id: 'a07b07', cues: [[0, 'cardClose'], ['+0', 'ghGoto', `tree/<SHA>/${DOM}`], ['+0', 'ghHover', 'IncidentRepository.java', 1300]] },
    { id: 'a07b08', cues: [...now(file('C07-C', `${INFRA}/persistence`, 'JpaIncidentRepositoryAdapter.java')), ['+0', 'hl', 'public Incident save(Incident incident) {']] },
    { id: 'a07b09', cues: [['@snapshot', 'hl', 'toSnapshot(incident)'], ['@back', 'hl', 'Incident.restore(']] },
    { id: 'a07b10', cues: [[0, 'unhl'], ['+0.2', 'note', 'Adapter · Ports and Adapters']], hold: 0.6 },
    { id: 'a07b11', cues: [[0, 'cardClose'], ['+0', 'ghGoto', `tree/<SHA>/${J}/audit/infrastructure`], ['+0', 'ghHover', 'AuditLedgerInTxListener.java', 700]] },
    { id: 'a07b12', cues: [...now(file('C07-D', `${J}/audit/infrastructure`, 'AuditLedgerInTxListener.java')), ['+0', 'hl', '@EventListener'], ['@transaction', 'hl', '@Transactional(propagation = Propagation.MANDATORY)'], ['+0', 'tok', 'Propagation.MANDATORY']] },
    { id: 'a07b13', cues: [[0, 'hl', 'FOR UPDATE'], ['@locks', 'tok', 'FOR UPDATE'], ['@hash', 'tok', 'last_audit_hash']] },
    { id: 'a07b14', pre: next('C07-E'), cues: [[0, 'hl', 'String hash = AuditHasher.computeHash(', 'prevHash, incidentId, nextIndex, now, actorType, effectiveActorId,'], ['@previous', 'tok', 'prevHash']], hold: 0.5 },
    { id: 'a07b15', cues: [...now(file('C07-F', `${J}/audit/domain`, 'AuditHasher.java')), ['+0', 'hl', 'String raw = String.join(SEP,'], ['@SHA-256', 'hl', 'MessageDigest md = MessageDigest.getInstance("SHA-256");'], ['+0', 'tok', '"SHA-256"']] },
    { id: 'a07b16', cues: [[0, 'hl', 'prevHash != null ? prevHash : GENESIS_HASH,'], ['+0.2', 'tok', 'prevHash != null ? prevHash : GENESIS_HASH'], ['@Change', 'note', 'Each entry is chained to the one before']] },
    { id: 'a07b17', cues: [[0, 'cardClose'], ['+0.2', 'ghUnselect'], ['+0', 'scrollBy', 260, 1600]] },
    { id: 'a07b18', cues: [...now(file('C07-G', 'backend/src/main/resources/db/migration', 'V003__audit_timers_ai.sql')), ['+0', 'hl', 'CREATE TRIGGER audit_no_change BEFORE UPDATE OR DELETE OR TRUNCATE ON audit_record'], ['+0', 'tok', 'BEFORE UPDATE OR DELETE OR TRUNCATE']], hold: 0.6 },
    { id: 'a07b19', cues: [...now(file('C07-H', `${J}/identity/infrastructure/security`, 'SecurityConfig.java')), ['+0', 'hl', '.requestMatchers(HttpMethod.POST, "/api/v1/auth/login", "/api/v1/auth/refresh").permitAll()'], ['@everything', 'hl', '.requestMatchers("/api/v1/**").authenticated()'], ['+0', 'tok', 'authenticated()']] },
    { id: 'a07b20', cues: [[0, 'hl', '.requestMatchers("/api/v1/admin/**").hasRole("ADMINISTRATOR")'], ['+0.2', 'tok', 'hasRole("ADMINISTRATOR")']], hold: 0.5 },
    { id: 'a07b21', cues: [...now(file('C07-I', `${J}/shared/infrastructure/web`, 'GlobalProblemDetailsHandler.java')), ['+0', 'hl', '@ExceptionHandler(ItsmException.class)']] },
    { id: 'a07b22', cues: [[0, 'hl', 'problem.setProperty("code", ex.code());'], ['@code', 'tok', 'ex.code()']] },
    { id: 'a07b23', cues: [[0, 'unhl'], ['+0.1', 'note', 'Clear reason, no stack trace']], hold: 0.7, post: [['cardClose']] },
  ],
};

// =================================================================================================== ACT 8
export const act8 = {
  id: 'T08', title: 'Act 8 · the frontend', chip: '8 · FRONTEND', retries: 3,
  setup: [['ghGoto', 'tree/<SHA>/frontend']],
  beats: [
    { id: 'a08b01', cues: [['@open', 'ghClick', 'src', { fallback: 'tree/<SHA>/frontend/src' }]] },
    { id: 'a08b02', cues: [hover('Services', 'services'), hover('context', 'context'), hover('pages', 'pages', 900)] },
    { id: 'a08b03', cues: [...now(file('C08-A', '{F}/services', 'api.ts')), ['@attaches', 'hl', '...getAuthHeader(),'], ['+0', 'tok', 'getAuthHeader()']] },
    { id: 'a08b04', cues: [[0, 'hl', 'if (!response.ok) {'], ['@throws', 'hl', 'const err = new Error(errBody.detail || errBody.title || `HTTP error ${response.status}`);', 'throw err;'], ['+0', 'tok', 'errBody.detail']], hold: 0.5 },
    { id: 'a08b05', cues: [...now(file('C08-B', '{F}/context', 'AuthContext.tsx')), ['+0', 'hl', 'const activeToken = await performLogin(user);'], ['+0', 'tok', 'performLogin(user)']], hold: 0.5 },
    { id: 'a08b06', cues: [...now(file('C08-C', '{F}/pages/portal', 'PortalReport.tsx')), ['@calls', 'hl', 'const res = await api.incidents.create({', 'title: title.trim(),', 'description: description.trim(),', 'serviceCode: serviceCode || advice?.suggestedService || undefined,'], ['+0', 'tok', 'api.incidents.create']], hold: 0.5 },
    { id: 'a08b07', cues: [...now(file('C08-D', '{F}/pages/workbench', 'WorkbenchDetail.tsx')), ['@only', 'hl', "{allowed.includes('ACKNOWLEDGE') && ("], ['+0', 'tok', "allowed.includes('ACKNOWLEDGE')"]] },
    { id: 'a08b08', cues: [[0, 'hl', "onClick={() => runCommand('acknowledge')}"], ['@never', 'note', 'The backend decides what is legal']] },
    { id: 'a08b09', cues: [[0, 'cardClose'], ['+0.3', 'ghUnselect'], ['+0', 'scrollTop']], hold: 0.6 },
  ],
};
