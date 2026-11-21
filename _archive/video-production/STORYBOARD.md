# Storyboard (generated from video_v4/direction — do not edit by hand)

Regenerate with `node video_v4/kit/cli.mjs storyboard`.

## T00 — Act 0 · landing page, then the app

**a00b01** (6.3 s) — “Hi, I'm Srijan, and this is Incident-Zero, our Object-Oriented Programming project from Group 76.”
- before the voice: `goto` LANDING · {"settle":1800}
- before the voice: `expect` Launch Full App (React)
- 0.4 s in: `move` h1
- on the word “Incident-Zero”: `scrollBy` 260 · 1600

**a00b02** (3.5 s) — “It is a help desk for campus IT at BITS Pilani Hyderabad.”
- as the voice starts: `scrollBy` 420 · 1800

**a00b03** (5.6 s) — “A student reports a problem, the system sorts it and assigns it, and a technician fixes it.”
- as the voice starts: `scrollTo` #carts · {"ms":1400}
- on the word “technician”: `scrollTo` #deck · {"ms":1200}

**a00b04** (5.3 s) — “Every step is checked by a state machine and written to a log that cannot be edited.”
- on the word “log”: `scrollTo` #ledger · {"ms":1200}
- then: `try` click · #ver

**a00b05** (4.7 s) — “And yes, it looks like an arcade game. That part was just for fun.”
- as the voice starts: `scrollTo` #statsSection · {"ms":1200}
- on the word “That”: `scrollTo` .call · {"ms":1000}
- then: `point` Launch Full App (React) · {"hold":900}

**a00b06** (6.5 s) — “In this video I will walk through the repository, open the important files, and explain what each one does.”
- before the voice: `click` Launch Full App (React) · {"after":1500}
- before the voice: `nav` CURRENT
- before the voice: `ready` 
- before the voice: `expect` Workbench
- 0.3 s in: `move` Campus Stage
- on the word “repository”: `move` Student Portal
- on the word “explain”: `move` Workbench

**a00b07** (4.0 s) — “Then I will run the app and connect every click back to the code.”
- on the word “run”: `click` Student Portal
- then: `ready` 
- on the word “click”: `point` Report New Incident · {"hold":900}

## T01 — Act 1 · the repository

Before recording starts: `ghGoto` tree/<SHA>

**a01b01** (4.4 s) — “This is the repository on GitHub. The readme gives the short version.”
- 0.3 s in: `ghHover` README.md · 500
- on the word “readme”: `scrollTo` What is Incident-Zero? · {"block":"start","ms":1300}

**a01b02** (3.8 s) — “One Java backend, one React app, and one PostgreSQL database.”
- as the voice starts: `point` It is deliberately small to operate · {"hold":2600}

**a01b03** (7.0 s) — “A ticket is reported, classified, prioritised, assigned, investigated, resolved, verified, and finally closed.”
- as the voice starts: `scrollTo` Report · Classify · Prioritize · {"ms":1100}
- then: `point` Report · Classify · Prioritize · {"hold":3800}

**a01b04** (5.5 s) — “Let me go through the folders. The backend folder holds the Java code, built with Spring Boot.”
- as the voice starts: `scrollTop` 
- on the word “backend”: `ghHover` backend · 1600

**a01b05** (4.0 s) — “The frontend folder holds the React app, written in TypeScript.”
- as the voice starts: `ghHover` frontend · 1600

**a01b06** (6.0 s) — “Inside docs there are fifteen decision records. Each one explains why we made a design choice.”
- as the voice starts: `ghClick` docs · {"fallback":"tree/<SHA>/docs"}
- then: `ghClick` adr · {"fallback":"tree/<SHA>/docs/adr"}
- on the word “Each”: `ghHover` ADR-001.md · 400
- then: `ghHover` ADR-004.md · 400

**a01b07** (4.8 s) — “The scripts folder has our verification scripts, which I will run at the end.”
- as the voice starts: `ghGoto` tree/<SHA>
- then: `ghHover` scripts · 1400

**a01b08** (4.0 s) — “Deploy has the Docker Compose file for the database and the app.”
- as the voice starts: `ghHover` deploy · 1400

**a01b09** (4.2 s) — “And the workflows folder runs our checks automatically on every push.”
- as the voice starts: `ghHover` .github · 1400

**a01b10** (3.1 s) — “The other folders are tooling, so I will skip them.”
- as the voice starts: `ghHover` tools · 450
- then: `ghHover` upload · 450

**a01b11** (3.2 s) — “The real work is in the backend, so let's start there.”
- on the word “backend”: `ghClick` backend · {"fallback":"tree/<SHA>/backend"}

## T02 — Act 2 · modules and layers

Before recording starts: `ghGoto` tree/<SHA>/backend

**a02b01** (5.6 s) — “Under the main package, the code is split into modules, one folder for each responsibility.”
- as the voice starts: `ghClick` src · {"fallback":"tree/<SHA>/backend/src"}
- then: `ghClick` main · {"fallback":"tree/<SHA>/backend/src/main"}
- then: `ghClick` iitsm · {"fallback":"tree/<SHA>/{J}"}

**a02b02** (4.1 s) — “Incident is the biggest one. It owns the ticket and its life cycle.”
- as the voice starts: `ghHover` incident · 1500

**a02b03** (5.7 s) — “Assignment picks a technician, SLA handles deadlines, and audit keeps the tamper-evident log.”
- on the word “Assignment”: `ghHover` assignment · 600
- on the word “SLA”: `ghHover` sla · 600
- on the word “audit”: `ghHover` audit · 900

**a02b04** (7.0 s) — “Identity handles login, notification pushes live updates, and intelligence holds the suggestion features.”
- on the word “Identity”: `ghHover` identity · 600
- on the word “notification”: `ghHover` notification · 600
- on the word “intelligence”: `ghHover` intelligence · 900

**a02b05** (5.8 s) — “Catalog, knowledge and shared hold the calendar, the help articles, and common building blocks.”
- on the word “Catalog”: `ghHover` catalog · 350
- then: `ghHover` knowledge · 350
- then: `ghHover` shared · 900

**a02b06** (3.1 s) — “Open the incident module and you see four folders.”
- as the voice starts: `ghClick` incident · {"fallback":"tree/<SHA>/{J}/incident"}

**a02b07** (5.8 s) — “Domain is plain Java. It holds the business rules and knows nothing about Spring or the database.”
- as the voice starts: `ghHover` domain · 1800

**a02b08** (2.8 s) — “Application runs the use cases, step by step.”
- as the voice starts: `ghHover` application · 1200

**a02b09** (5.8 s) — “Infrastructure talks to the outside world, and api is what other modules are allowed to see.”
- as the voice starts: `ghHover` infrastructure · 900
- on the word “api”: `ghHover` api · 1200

**a02b10** (5.5 s) — “The rule is simple. Outer layers can depend on inner ones, but never the other way around.”
- as the voice starts: `diagram` layers
- on the word “Outer”: `glow` infra
- on the word “inner”: `glow` domain
- on the word “never”: `mark` domain · good · depends on nothing outside

**a02b11** (3.8 s) — “So how do we make sure nobody breaks that rule? ”
- 0.2 s in: `glow` app
- then, 0.8 s later: `glow` infra
- after the voice: `diagramClose` 

**a02b12** (5.8 s) — “With a test. This rule says no class in a domain package may depend on Spring, JPA, or Jackson.”
- as the voice starts: `ghGoto` blob/<SHA>/backend/src/test/java/edu/campus/iitsm/ArchitectureTest.java
- then: `ghSelect` backend/src/test/java/edu/campus/iitsm/ArchitectureTest.java · static final ArchRule R1_domain_has_zero_framework_imports = noClasses() · "tools.jackson.." · {"plus":1}
- then: `wait` 250
- then: `card` C02-A
- on the word “domain”: `hl` resideInAPackage("..domain..")
- on the word “Spring”: `hl` "org.springframework.."
- then: `tok` "org.springframework.."
- on the word “JPA”: `hl` "jakarta.persistence.."
- then: `tok` "jakarta.persistence.."
- on the word “Jackson”: `hl` "tools.jackson.."
- then: `tok` "tools.jackson.."

**a02b13** (3.1 s) — “If someone adds one such import, the build fails.”
- as the voice starts: `hl` R1_domain_has_zero_framework_imports
- on the word “build”: `note` Checked on every build
- after the voice: `cardClose` 

## T03 — Act 3 · the domain core

Before recording starts: `ghGoto` tree/<SHA>/{J}/incident

**a03b01** (4.4 s) — “Now the domain folder of the incident module. This is the part I built.”
- 0.2 s in: `ghClick` domain · {"fallback":"tree/<SHA>/{J}/incident/domain"}

**a03b02** (6.0 s) — “Notice the file names: NewState, AssignedState, ResolvedState, and so on. I will come back to those.”
- on the word “NewState”: `ghHover` NewState.java · 350
- on the word “AssignedState”: `ghHover` AssignedState.java · 350
- on the word “ResolvedState”: `ghHover` ResolvedState.java · 500

**a03b03** (2.0 s) — “First, the main class, Incident.”
- as the voice starts: `ghOpen` {J}/incident/domain · Incident.java
- then: `ghSelect` {J}/incident/domain/Incident.java · public static Incident createWithNumber(UUID id, String number, UUID reporterId, UUID serviceId, · return i; · {"plus":1}

**a03b04** (3.4 s) — “This factory method is the only way to create a ticket.”
- before the voice: `card` C03-A
- as the voice starts: `hl` public static Incident createWithNumber(
- on the word “factory”: `tok` createWithNumber

**a03b05** (5.1 s) — “The title must be between five and two hundred characters, or it throws an error.”
- as the voice starts: `hl` if (cleanTitle.length() < 5 || cleanTitle.length() > 200) { · throw new InvalidIncidentPayloadException("title", "must be between 5 and 200 characters");
- on the word “five”: `tok` cleanTitle.length() < 5 || cleanTitle.length() > 200
- on the word “throws”: `tok` throw new InvalidIncidentPayloadException("title"

**a03b06** (5.8 s) — “The description needs at least ten characters, and impact and urgency must be one, two, or three.”
- as the voice starts: `hl` if (cleanDesc.length() < 10 || cleanDesc.length() > 4000) {
- on the word “ten”: `tok` cleanDesc.length() < 10
- on the word “impact”: `hl` if (impact < 1 || impact > 3) · if (urgency < 1 || urgency > 3)
- then: `tok` impact < 1 || impact > 3
- on the word “urgency”: `tok` urgency < 1 || urgency > 3

**a03b07** (5.8 s) — “Only when everything is valid does it build the object and record an IncidentCreated event.”
- on the word “build”: `hl` Incident i = new Incident(
- on the word “record”: `hl` i.pending.add(new IncidentCreated(
- then: `tok` new IncidentCreated(

**a03b08** (6.9 s) — “So a broken ticket can never exist. The rules live inside the object, and that is encapsulation.”
- as the voice starts: `unhl` 
- on the word “encapsulation”: `note` Encapsulation

**a03b09** (4.5 s) — “These are the actions: acknowledge, resolve, verify, close, and the rest.”
- before the voice: `cardClose` 
- before the voice: `ghUnselect` 
- before the voice: `ghSelect` {J}/incident/domain/Incident.java · public void acknowledge(UUID actor, Instant now, WorkingTimeCalculator cal) { · commit(state.close(this, actor, closureNote, now)); · {"plus":1}
- before the voice: `wait` 250
- before the voice: `card` C03-B
- on the word “acknowledge”: `hl` public void acknowledge(
- on the word “resolve”: `hl` public void resolve(
- on the word “verify”: `hl` public void verify(
- on the word “close”: `hl` public void close(

**a03b10** (5.2 s) — “Look how short they are. Each one just asks the current state object to do the work.”
- on the word “asks”: `hl` commit(state.acknowledge(this, actor, now, cal));
- on the word “state”: `tok` state.acknowledge(this, actor, now, cal)

**a03b11** (3.4 s) — “The Incident itself never checks which state it is in.”
- as the voice starts: `unhl` 
- on the word “never”: `note` No if-else on the state

**a03b12** (5.8 s) — “Whatever the state returns goes into commit. It switches to the next state and stores the events.”
- before the voice: `cardClose` 
- before the voice: `ghUnselect` 
- before the voice: `ghSelect` {J}/incident/domain/Incident.java · private void commit(TransitionResult r) { · if (changed) this.version++; · {"plus":1}
- before the voice: `wait` 250
- before the voice: `card` C03-C
- on the word “commit”: `hl` private void commit(TransitionResult r) {
- on the word “switches”: `hl` this.state = r.nextState();
- on the word “stores”: `hl` this.pending.addAll(r.events());

**a03b13** (5.8 s) — “It also raises the version number, which helps us catch two people changing the same ticket.”
- as the voice starts: `hl` if (changed) this.version++;
- on the word “version”: `tok` this.version++

**a03b14** (4.4 s) — “Later, the application layer pulls those events out and publishes them.”
- before the voice: `cardClose` 
- before the voice: `ghUnselect` 
- before the voice: `ghSelect` {J}/incident/domain/Incident.java · public List<DomainEvent> pullEvents() { · return copy; · {"plus":1}
- before the voice: `wait` 250
- before the voice: `card` C03-D
- as the voice starts: `hl` List<DomainEvent> copy = List.copyOf(pending);
- on the word “pulls”: `tok` pullEvents

**a03b15** (4.7 s) — “So where do the rules live? In this interface, IncidentState.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {J}/incident/domain · IncidentState.java · {J}/incident/domain/IncidentState.java
- then: `ghSelect` {J}/incident/domain/IncidentState.java · public sealed interface IncidentState · throw StateSupport.illegal(inc, status(), CommandType.ACKNOWLEDGE); · {"plus":1}
- then: `wait` 250
- then: `card` C03-E
- then: `hl` public sealed interface IncidentState

**a03b16** (6.0 s) — “It is sealed, and it permits exactly eleven state classes. Nobody can add a twelfth by accident.”
- on the word “sealed”: `tok` sealed
- on the word “permits”: `hl` permits NewState, ClassifiedState, AssignedState, AcknowledgedState, InProgressState, · PendingUserState, ResolvedState, VerifiedState, ReopenedState, ClosedState, CancelledState {
- on the word “eleven”: `toks` [NewState, ClassifiedState, AssignedState, AcknowledgedState, InProgressState, PendingUserState, ResolvedState, VerifiedState, ReopenedState, ClosedState, CancelledState] · 2600

**a03b17** (5.6 s) — “Every action has a default body, and that default simply throws an illegal transition error.”
- as the voice starts: `hl` default TransitionResult acknowledge( · throw StateSupport.illegal(inc, status(), CommandType.ACKNOWLEDGE);
- on the word “default”: `tok` default
- on the word “throws”: `tok` throw StateSupport.illegal

**a03b18** (5.7 s) — “So by default, nothing is allowed. A state has to override a method to make that move legal.”
- as the voice starts: `note` Forbidden unless overridden

**a03b19** (3.2 s) — “Here is AssignedState. It overrides acknowledge.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {J}/incident/domain · AssignedState.java · {J}/incident/domain/AssignedState.java
- then: `ghSelect` {J}/incident/domain/AssignedState.java · final class AssignedState implements IncidentState { · return new TransitionResult(AcknowledgedState.INSTANCE, List.of(new IncidentAcknowledged(inc.id(), now, actor))); · {"plus":1}
- then: `wait` 250
- then: `card` C03-F
- then: `hl` @Override public TransitionResult acknowledge(

**a03b20** (3.8 s) — “First it checks that the caller is the assigned technician.”
- as the voice starts: `hl` StateSupport.requireAssignee(inc, actor, "acknowledge");
- on the word “assigned”: `tok` requireAssignee

**a03b21** (2.1 s) — “Then it stops the response clock.”
- as the voice starts: `hl` inc.stopResponse(now, cal, true);
- on the word “stops”: `tok` stopResponse

**a03b22** (4.3 s) — “And it returns the next state, Acknowledged, together with an event.”
- as the voice starts: `hl` return new TransitionResult(AcknowledgedState.INSTANCE,
- on the word “Acknowledged”: `tok` AcknowledgedState.INSTANCE
- on the word “event”: `tok` new IncidentAcknowledged(inc.id(), now, actor)

**a03b23** (7.3 s) — “The same call behaves differently depending on the state object. That is polymorphism, and this is the State pattern.”
- as the voice starts: `unhl` 
- on the word “polymorphism”: `note` Polymorphism · State pattern

**a03b24** (2.7 s) — “It replaces a long chain of if-else checks.”
- 0.3 s in: `hl` final class AssignedState implements IncidentState {

**a03b25** (5.7 s) — “One more example, ResolvedState. Only the person who reported the ticket can verify the fix.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {J}/incident/domain · ResolvedState.java · {J}/incident/domain/ResolvedState.java
- then: `ghSelect` {J}/incident/domain/ResolvedState.java · @Override public TransitionResult verify(Incident inc, UUID actor, Integer rating, Instant now) { · return new TransitionResult(ReopenedState.INSTANCE, events); · {"plus":1}
- then: `wait` 250
- then: `card` C03-G
- on the word “Only”: `hl` if (!inc.reporterId().equals(actor) && !Actors.SYSTEM.equals(actor)) {
- then: `tok` inc.reporterId().equals(actor)

**a03b26** (2.7 s) — “And the rating must be between one and five.”
- as the voice starts: `hl` if (rating != null && (rating < 1 || rating > 5)) {
- on the word “one”: `tok` rating < 1 || rating > 5

**a03b27** (3.4 s) — “If they reject the fix instead, the ticket is reopened.”
- as the voice starts: `hl` inc.reopen(now); · return new TransitionResult(ReopenedState.INSTANCE, events);
- on the word “reopened”: `tok` ReopenedState.INSTANCE

**a03b28** (7.0 s) — “An illegal move throws this exception. It sits with fourteen other error classes, all extending one base class.”
- as the voice starts: `cardClose` 
- then: `ghGoto` tree/<SHA>/{J}/shared/domain/error
- then: `ghHover` InvalidStateTransitionException.java · 500
- on the word “fourteen”: `diagram` errors
- on the word “base”: `glow` base

**a03b29** (6.0 s) — “Each error carries its own code and its own HTTP status. That is inheritance doing useful work.”
- before the voice: `diagramClose` 
- before the voice: `ghClick` InvalidStateTransitionException.java · {"fallback":"blob/<SHA>/{J}/shared/domain/error/InvalidStateTransitionException.java"}
- before the voice: `ghSelect` {J}/shared/domain/error/InvalidStateTransitionException.java · public final class InvalidStateTransitionException extends ItsmException { · this.attemptedCommand = attemptedCommand; · {"plus":1}
- before the voice: `wait` 250
- before the voice: `card` C03-H
- as the voice starts: `hl` super("ITSM-4090", 409,
- on the word “code”: `tok` "ITSM-4090"
- on the word “status”: `tok` 409
- on the word “inheritance”: `hl` public final class InvalidStateTransitionException extends ItsmException {
- then: `tok` extends ItsmException
- then: `note` Inheritance
- after the voice: `cardClose` 

## T04 — Act 4 · time

Before recording starts: `ghGoto` tree/<SHA>/{J}/incident/domain

**a04b01** (4.8 s) — “Next, time. Every ticket has two deadlines: one to respond, and one to resolve.”
- on the word “deadlines”: `ghHover` SlaClock.java · 1200

**a04b02** (4.3 s) — “Each deadline is an SlaClock, and it is a record, so it never changes.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {J}/incident/domain · SlaClock.java · {J}/incident/domain/SlaClock.java
- then: `ghSelect` {J}/incident/domain/SlaClock.java · public record SlaClock(ClockState state, long consumedMs, Instant lastResumeAt, long targetMs, ClockMode mode) { · return new SlaClock(ClockState.STOPPED, consumedMs + extra, lastResumeAt, targetMs, mode); · {"plus":1}
- then: `wait` 250
- then: `card` C04-A
- then: `hl` public record SlaClock(
- then: `tok` record

**a04b03** (5.0 s) — “Pause does not modify the clock. It returns a new clock with the time used so far.”
- as the voice starts: `hl` public SlaClock pause(Instant now, WorkingTimeCalculator cal) { · return new SlaClock(ClockState.PAUSED, consumedMs + delta, lastResumeAt, targetMs, mode);
- on the word “returns”: `tok` new SlaClock(ClockState.PAUSED
- on the word “time”: `tok` consumedMs + delta

**a04b04** (3.5 s) — “And it asks a calendar how much working time has passed.”
- as the voice starts: `hl` long delta = cal.workingMillisBetween(lastResumeAt, now, mode == ClockMode.CONTINUOUS_24X7);
- on the word “calendar”: `tok` cal.workingMillisBetween

**a04b05** (6.8 s) — “Back in Incident, this method reads both clocks. At seventy-five percent used, the ticket is marked at risk.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {J}/incident/domain · Incident.java · {J}/incident/domain/Incident.java
- then: `ghSelect` {J}/incident/domain/Incident.java · public void refreshSla(Instant now, WorkingTimeCalculator cal) { · slaStatus = atRisk ? SlaStatus.AT_RISK : SlaStatus.ON_TRACK; · {"plus":2}
- then: `wait` 250
- then: `card` C04-B
- on the word “seventy-five”: `hl` boolean atRisk = ratio(responseClock, now, cal) >= 0.75 || ratio(resolutionClock, now, cal) >= 0.75;
- then: `tok` >= 0.75

**a04b06** (5.3 s) — “Past the target, it is breached, and a breach is permanent. It never goes back to on track.”
- as the voice starts: `hl` slaStatus = SlaStatus.BREACHED;
- on the word “permanent”: `hl` } else if (slaStatus != SlaStatus.BREACHED) {
- then: `tok` slaStatus != SlaStatus.BREACHED

**a04b07** (5.5 s) — “That calendar is this class. A working day is a day of the work week that is not a holiday.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {J}/catalog/domain · BusinessCalendar.java · {J}/catalog/domain/BusinessCalendar.java
- then: `ghSelect` {J}/catalog/domain/BusinessCalendar.java · public boolean isWorkingDay(LocalDate date) { · return workDays.contains(date.getDayOfWeek()) && !holidays.contains(date); · {"plus":1}
- then: `wait` 250
- then: `card` C04-C
- on the word “working”: `hl` return workDays.contains(date.getDayOfWeek()) && !holidays.contains(date);
- on the word “week”: `tok` workDays.contains(date.getDayOfWeek())
- on the word “holiday”: `tok` !holidays.contains(date)

**a04b08** (4.1 s) — “It walks day by day and adds only the hours inside the working window.”
- before the voice: `cardClose` 
- before the voice: `ghUnselect` 
- before the voice: `ghSelect` {J}/catalog/domain/BusinessCalendar.java · while (!cur.toLocalDate().isAfter(stop.toLocalDate())) { · return totalMs; · {"plus":0}
- before the voice: `wait` 250
- before the voice: `card` C04-D
- as the voice starts: `hl` while (!cur.toLocalDate().isAfter(stop.toLocalDate())) {
- on the word “adds”: `hl` if (isWorkingDay(date)) { · totalMs += Duration.between(effStart, effEnd).toMillis();
- then: `tok` totalMs += Duration.between(effStart, effEnd).toMillis()

**a04b09** (4.9 s) — “So a low priority ticket raised on Friday evening does not breach over the weekend.”
- as the voice starts: `note` Weekends and holidays do not count

**a04b10** (4.3 s) — “One more trick. The code never asks the computer for the time directly.”
- as the voice starts: `cardClose` 
- then: `ghGoto` tree/<SHA>/{J}/shared/domain
- then: `ghHover` ClockPort.java · 900

**a04b11** (2.6 s) — “It asks this small interface, ClockPort.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {J}/shared/domain · ClockPort.java · {J}/shared/domain/ClockPort.java
- then: `ghSelect` {J}/shared/domain/ClockPort.java · public interface ClockPort { · long realNanosUntil(Instant targetVirtualInstant); · {"plus":1}
- then: `wait` 250
- then: `card` C04-E
- then: `hl` Instant now();

**a04b12** (5.4 s) — “The real implementation is a virtual clock. It multiplies elapsed time by a scale factor.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {J}/shared/domain · VirtualAnchoredClock.java · {J}/shared/domain/VirtualAnchoredClock.java
- then: `ghSelect` {J}/shared/domain/VirtualAnchoredClock.java · public Instant now() { · if (onScaleChangeWakeup != null) onScaleChangeWakeup.run(); · {"plus":1}
- then: `wait` 250
- then: `card` C04-F
- on the word “multiplies”: `hl` return a.virtualInstant().plusNanos(elapsedRealNanos * a.scaleFactor());
- then: `tok` elapsedRealNanos * a.scaleFactor()

**a04b13** (5.2 s) — “So in a demo, one real second can count as thirty, and I can watch a deadline approach.”
- as the voice starts: `hl` public void setScaleFactor(int newFactor) {
- on the word “thirty”: `tok` setScaleFactor

**a04b14** (5.0 s) — “That is abstraction. The domain depends on an interface, not on the system clock.”
- as the voice starts: `unhl` 
- then, 0.1 s later: `note` Abstraction
- after the voice: `cardClose` 

## T05 — Act 5 · the intake pipeline

Before recording starts: `ghGoto` tree/<SHA>/{J}/incident/application

**a05b01** (6.0 s) — “Now the application layer. When a ticket comes in, it goes through this folder, the intake pipeline.”
- on the word “folder”: `ghClick` intake · {"fallback":"tree/<SHA>/{J}/incident/application/intake"}

**a05b02** (4.5 s) — “The pipeline receives every step and sorts them by their order number.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {J}/incident/application/intake · IntakePipeline.java · {J}/incident/application/intake/IntakePipeline.java
- then: `ghSelect` {J}/incident/application/intake/IntakePipeline.java · public class IntakePipeline { · return ctx; · {"plus":2}
- then: `wait` 250
- then: `card` C05-A
- on the word “sorts”: `hl` .sorted(Comparator.comparingInt(IntakeStep::order))
- then: `tok` IntakeStep::order

**a05b03** (4.6 s) — “Then it runs them one after another, passing the same context object along.”
- as the voice starts: `hl` for (IntakeStep step : sortedSteps) { · step.execute(ctx);
- on the word “context”: `tok` step.execute(ctx)

**a05b04** (6.6 s) — “There are nine steps. Validate checks the input. Sanitize strips HTML and hides emails and phone numbers.”
- as the voice starts: `cardClose` 
- then: `ghFolder` {J}/incident/application/intake
- on the word “Validate”: `ghHover` ValidateStep.java · 700
- on the word “Sanitize”: `ghHover` SanitizeRedactStep.java · 900

**a05b05** (5.4 s) — “Then we create the incident, link it to a master ticket if there is one, and pick a category.”
- on the word “create”: `ghHover` CreateProvisionalIncidentStep.java · 600
- on the word “link”: `ghHover` DuplicateCheckStep.java · 600
- on the word “pick”: `ghHover` CategoryAndServiceStep.java · 800

**a05b06** (5.8 s) — “Enrich looks for exam words, then come priority, assignment, and finally saving to the database.”
- on the word “Enrich”: `ghHover` EnrichStep.java · 500
- on the word “priority”: `ghHover` PriorityAndSlaStep.java · 350
- on the word “assignment”: `ghHover` AssignStep.java · 350
- on the word “saving”: `ghHover` PersistAndPublishStep.java · 800

**a05b07** (4.1 s) — “All nine extend this abstract class. Its execute method is final.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {J}/incident/application/intake · AbstractIntakeStep.java · {J}/incident/application/intake/AbstractIntakeStep.java
- then: `ghSelect` {J}/incident/application/intake/AbstractIntakeStep.java · public final void execute(IntakeContext ctx) { · protected abstract void doExecute(IntakeContext ctx); · {"plus":0}
- then: `wait` 250
- then: `card` C05-B
- then: `hl` public final void execute(IntakeContext ctx) {
- on the word “final”: `tok` final

**a05b08** (4.0 s) — “It handles timing and error logging the same way for every step.”
- as the voice starts: `hl` log.warn("Error in intake step {}: {}", getClass().getSimpleName(), e.getMessage()); · log.debug("Intake step {} completed in {}ms", getClass().getSimpleName(), duration.toMillis());

**a05b09** (3.3 s) — “Each step only fills in this one method, doExecute.”
- as the voice starts: `hl` protected abstract void doExecute(IntakeContext ctx);
- on the word “doExecute”: `tok` doExecute

**a05b10** (6.0 s) — “The parent fixes the skeleton and the children fill the gap. That is the Template Method pattern.”
- as the voice starts: `unhl` 
- on the word “Template”: `note` Template Method · Inheritance

**a05b11** (5.7 s) — “For example, step one refuses a title under five characters before anything else happens.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {J}/incident/application/intake · ValidateStep.java · {J}/incident/application/intake/ValidateStep.java
- then: `ghSelect` {J}/incident/application/intake/ValidateStep.java · protected void doExecute(IntakeContext ctx) { · throw new InvalidIncidentPayloadException("description", "Description length must be between 10 and 4000 characters"); · {"plus":1}
- then: `wait` 250
- then: `card` C05-C
- then: `hl` ctx.rawTitle.trim().length() < 5
- then: `tok` ctx.rawTitle.trim().length() < 5

**a05b12** (5.7 s) — “Step seven is the interesting one. It asks a priority strategy to calculate the priority.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {J}/incident/application/intake · PriorityAndSlaStep.java · {J}/incident/application/intake/PriorityAndSlaStep.java
- then: `ghSelect` {J}/incident/application/intake/PriorityAndSlaStep.java · PriorityResult result = priorityStrategy.calculate(in); · ctx.incident.declareMajor(Actors.SYSTEM, p1Sla, now, calendar); · {"plus":1}
- then: `wait` 250
- then: `card` C05-D
- on the word “asks”: `hl` PriorityResult result = priorityStrategy.calculate(in);
- then: `tok` priorityStrategy.calculate(in)

**a05b13** (4.2 s) — “Then it looks up the SLA policy for that service tier and priority.”
- as the voice starts: `hl` SlaSnapshot sla = slaPolicyResolver.resolve(tier, result.priority());
- on the word “policy”: `tok` slaPolicyResolver.resolve(tier, result.priority())

**a05b14** (4.7 s) — “And it calls classify on the incident, which moves it from New to Classified.”
- as the voice starts: `hl` ctx.incident.classify(
- on the word “classify”: `tok` ctx.incident.classify

**a05b15** (4.2 s) — “The default strategy is a simple matrix of impact against urgency.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {J}/incident/application/priority · ItilMatrixPriorityStrategy.java · {J}/incident/application/priority/ItilMatrixPriorityStrategy.java
- then: `ghSelect` {J}/incident/application/priority/ItilMatrixPriorityStrategy.java · private static final Priority[][] MATRIX = { · "Impact " + in.impact() + " x Urgency " + in.urgency() + " -> " + base)); · {"plus":0}
- then: `wait` 250
- then: `card` C05-E
- on the word “matrix”: `hl` {Priority.P4, Priority.P4, Priority.P3}, · {Priority.P4, Priority.P3, Priority.P2}, · {Priority.P3, Priority.P2, Priority.P1}

**a05b16** (5.0 s) — “After that come the bumps. During an exam window, the priority goes up one level.”
- before the voice: `cardClose` 
- before the voice: `ghUnselect` 
- before the voice: `ghSelect` {J}/incident/application/priority/ItilMatrixPriorityStrategy.java · if (in.activeCalendarWindow()) { · cur = next; · {"plus":1}
- before the voice: `wait` 250
- before the voice: `card` C05-F
- as the voice starts: `hl` if (in.activeCalendarWindow()) { · Active exam/registration window (+1)
- on the word “exam”: `tok` in.activeCalendarWindow()
- on the word “up”: `tok` cur.bumpOneLevel()

**a05b17** (4.7 s) — “There are three strategies behind one interface. That is the Strategy pattern.”
- as the voice starts: `cardClose` 
- then: `ghFolder` {J}/incident/application/priority
- on the word “three”: `ghHover` ItilMatrixPriorityStrategy.java · 300
- then: `ghHover` ProductScorePriorityStrategy.java · 300
- then: `ghHover` WeightedScorePriorityStrategy.java · 300
- on the word “interface”: `ghHover` PriorityStrategy.java · 1200

## T06 — Act 6 · commands and assignment

Before recording starts: `ghGoto` tree/<SHA>/{J}/incident/application

**a06b01** (5.7 s) — “After intake, every action on a ticket goes through this class, IncidentCommandService.”
- on the word “class”: `ghOpen` {J}/incident/application · IncidentCommandService.java
- then: `ghSelect` {J}/incident/application/IncidentCommandService.java · public void acknowledge(UUID incidentId, UUID actorId, String role, String supportTier) { · commitAndPublish(inc); · {"plus":1}

**a06b02** (3.2 s) — “Every method has the same shape. Load the incident.”
- before the voice: `card` C06-A
- on the word “Load”: `hl` Incident inc = load(incidentId);
- then: `tok` load(incidentId)

**a06b03** (2.0 s) — “Check that this user is allowed.”
- as the voice starts: `hl` commandAuthorizer.authorize(inc, CommandType.ACKNOWLEDGE,
- then, 0.2 s later: `tok` commandAuthorizer.authorize

**a06b04** (2.2 s) — “Call the domain method we just saw.”
- as the voice starts: `hl` inc.acknowledge(actorId, now, calendar);
- then, 0.2 s later: `tok` inc.acknowledge

**a06b05** (4.0 s) — “Then save it and publish its events, all inside one transaction.”
- as the voice starts: `hl` commitAndPublish(inc);
- on the word “publish”: `card` C06-A2
- then: `hl` incidentRepository.save(incident); · eventPublisher.publishEvent(event);

**a06b06** (2.3 s) — “If anything fails, nothing is saved.”
- as the voice starts: `card` C06-A
- then: `hl` @Transactional
- then: `tok` @Transactional

**a06b07** (4.1 s) — “And who is allowed? That is decided here, in one switch.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {J}/incident/application · CommandAuthorizer.java · {J}/incident/application/CommandAuthorizer.java
- then: `ghSelect` {J}/incident/application/CommandAuthorizer.java · public void authorize(Incident inc, CommandType cmd, UUID actorId, String role, String supportTier) { · throw new UnauthorizedOperationException(actorId, cmd.name()); · {"plus":2}
- then: `wait` 250
- then: `card` C06-B
- then: `hl` boolean allowed = switch (cmd) {
- then: `tok` switch (cmd)

**a06b08** (3.4 s) — “Only the assigned technician can acknowledge or resolve.”
- as the voice starts: `hl` case ACKNOWLEDGE, START_INVESTIGATION, REQUEST_USER_INFO, RESOLVE -> isAssignee;
- on the word “assigned”: `tok` isAssignee

**a06b09** (3.9 s) — “Only the student who reported it can verify or reject the fix.”
- as the voice starts: `hl` case PROVIDE_USER_INFO, VERIFY, REJECT_RESOLUTION -> isReporter;
- on the word “student”: `tok` isReporter

**a06b10** (3.8 s) — “And only a team lead or an admin can declare a major incident.”
- as the voice starts: `hl` case ASSIGN, DECLARE_MAJOR -> isTeamLead || isAdmin;
- on the word “team”: `tok` isTeamLead || isAdmin

**a06b11** (5.8 s) — “Choosing the technician works the same way as priority. One interface, AssignmentStrategy.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {J}/assignment/domain · AssignmentStrategy.java · {J}/assignment/domain/AssignmentStrategy.java
- then: `ghSelect` {J}/assignment/domain/AssignmentStrategy.java · public interface AssignmentStrategy { · List<TechnicianCandidate> candidates · {"plus":2}
- then: `wait` 250
- then: `card` C06-C
- then: `hl` public interface AssignmentStrategy {

**a06b12** (5.9 s) — “And seven implementations: round robin, least loaded, skill match, experience, and a few more.”
- as the voice starts: `diagram` strategies
- then: `glow` iface
- on the word “round”: `glow` rr
- on the word “least”: `glow` ll
- on the word “skill”: `glow` sm
- on the word “experience”: `glow` ex
- on the word “few”: `glow` pa
- then, 0.35 s later: `glow` hw

**a06b13** (4.1 s) — “There is even one that assigns a whole batch of tickets together.”
- 0.2 s in: `glow` hb

**a06b14** (4.2 s) — “Least loaded first removes anyone who is off shift or already full.”
- as the voice starts: `glow` ll
- then, 0.5 s later: `diagramClose` 
- then: `ghOpen` {J}/assignment/application/strategy · LeastLoadedStrategy.java · {J}/assignment/application/strategy/LeastLoadedStrategy.java
- then: `ghSelect` {J}/assignment/application/strategy/LeastLoadedStrategy.java · List<TechnicianCandidate> eligible = StrategySupport.filterEligible(ownerTeamId, ticketWeight, requiredSkills, candidates); · double score = 1.0 - chosen.loadRatio(); · {"plus":0}
- then: `wait` 250
- then: `card` C06-D
- then: `hl` StrategySupport.filterEligible(
- then: `tok` StrategySupport.filterEligible

**a06b15** (3.4 s) — “Then it sorts by load and takes the least busy person.”
- as the voice starts: `hl` .comparingDouble(TechnicianCandidate::loadRatio)
- on the word “takes”: `hl` TechnicianCandidate chosen = eligible.get(0);
- then: `tok` eligible.get(0)

**a06b16** (5.4 s) — “Because they share one interface, changing the strategy is a setting, not a code change.”
- as the voice starts: `unhl` 
- then, 0.1 s later: `note` Strategy pattern again
- after the voice: `cardClose` 

## T07 — Act 7 · infrastructure

Before recording starts: `ghGoto` tree/<SHA>/{J}/incident/infrastructure

**a07b01** (4.8 s) — “Now the outer layer, infrastructure. This is where the outside world connects.”
- on the word “infrastructure”: `ghHover` persistence · 600
- on the word “outside”: `ghHover` web · 900

**a07b02** (4.7 s) — “IncidentController is the REST entry point. This method handles a new ticket.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {J}/incident/infrastructure/web · IncidentController.java · {J}/incident/infrastructure/web/IncidentController.java
- then: `ghSelect` {J}/incident/infrastructure/web/IncidentController.java · public ResponseEntity<IncidentDtos.IncidentDetailResponse> createIncident( · int impact = req.impactOverride() != null ? req.impactOverride() : 2; · {"plus":0}
- then: `wait` 250
- then: `card` C07-A
- then: `hl` @PostMapping · public ResponseEntity<IncidentDtos.IncidentDetailResponse> createIncident(

**a07b03** (5.3 s) — “It reads the request, hands it to the intake service, and returns the created ticket.”
- as the voice starts: `hl` @RequestBody IncidentDtos.CreateIncidentRequest req,
- on the word “hands”: `card` C07-A2
- then: `hl` Incident created = intakeService.createIncident(
- on the word “returns”: `hl` IncidentDtos.IncidentDetailResponse detail = queryPort.findIncidentDetail(created.id())

**a07b04** (4.4 s) — “Notice there are no business rules here. The controller only translates.”
- as the voice starts: `unhl` 
- then, 0.2 s later: `note` No business rules here

**a07b05** (3.4 s) — “The second method takes the action name from the URL.”
- before the voice: `cardClose` 
- before the voice: `ghUnselect` 
- before the voice: `ghSelect` {J}/incident/infrastructure/web/IncidentController.java · switch (command.toLowerCase()) { · case "request-info" -> commandService.requestUserInfo( · {"plus":0}
- before the voice: `wait` 250
- before the voice: `card` C07-B
- as the voice starts: `hl` switch (command.toLowerCase()) {
- on the word “name”: `tok` command.toLowerCase()

**a07b06** (3.5 s) — “A switch maps each name to the matching service method.”
- as the voice starts: `hl` case "acknowledge" -> commandService.acknowledge(
- then, 0.9 s later: `hl` case "start" -> commandService.startInvestigation(
- then, 0.9 s later: `hl` case "request-info" -> commandService.requestUserInfo(

**a07b07** (6.3 s) — “For the database we use the same idea. The domain defines an interface called IncidentRepository.”
- as the voice starts: `cardClose` 
- then: `ghGoto` tree/<SHA>/{J}/incident/domain
- then: `ghHover` IncidentRepository.java · 1300

**a07b08** (2.4 s) — “This adapter implements it with JPA.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {J}/incident/infrastructure/persistence · JpaIncidentRepositoryAdapter.java · {J}/incident/infrastructure/persistence/JpaIncidentRepositoryAdapter.java
- then: `ghSelect` {J}/incident/infrastructure/persistence/JpaIncidentRepositoryAdapter.java · public Optional<Incident> findById(UUID id) { · return incident.withPersistedVersion(saved.getVersion()); · {"plus":1}
- then: `wait` 250
- then: `card` C07-C
- then: `hl` public Incident save(Incident incident) {

**a07b09** (6.1 s) — “It converts the incident to a snapshot and back, so the domain class has no database annotations.”
- on the word “snapshot”: `hl` toSnapshot(incident)
- on the word “back”: `hl` Incident.restore(

**a07b10** (5.0 s) — “This is the Adapter pattern. We could change the database without touching the domain.”
- as the voice starts: `unhl` 
- then, 0.2 s later: `note` Adapter · Ports and Adapters

**a07b11** (2.5 s) — “Now my favourite part, the audit ledger.”
- as the voice starts: `cardClose` 
- then: `ghGoto` tree/<SHA>/{J}/audit/infrastructure
- then: `ghHover` AuditLedgerInTxListener.java · 700

**a07b12** (5.5 s) — “This listener hears every event, and it runs inside the same transaction as the change.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {J}/audit/infrastructure · AuditLedgerInTxListener.java · {J}/audit/infrastructure/AuditLedgerInTxListener.java
- then: `ghSelect` {J}/audit/infrastructure/AuditLedgerInTxListener.java · @EventListener · FOR UPDATE · {"plus":0}
- then: `wait` 250
- then: `card` C07-D
- then: `hl` @EventListener
- on the word “transaction”: `hl` @Transactional(propagation = Propagation.MANDATORY)
- then: `tok` Propagation.MANDATORY

**a07b13** (3.8 s) — “It locks the incident row and reads the hash of the last entry.”
- as the voice starts: `hl` FOR UPDATE
- on the word “locks”: `tok` FOR UPDATE
- on the word “hash”: `tok` last_audit_hash

**a07b14** (3.8 s) — “Then it computes a new hash that includes that previous hash.”
- before the voice: `cardClose` 
- before the voice: `ghUnselect` 
- before the voice: `ghSelect` {J}/audit/infrastructure/AuditLedgerInTxListener.java · String hash = AuditHasher.computeHash( · ); · {"plus":0}
- before the voice: `wait` 250
- before the voice: `card` C07-E
- as the voice starts: `hl` String hash = AuditHasher.computeHash( · prevHash, incidentId, nextIndex, now, actorType, effectiveActorId,
- on the word “previous”: `tok` prevHash

**a07b15** (6.9 s) — “The hasher joins the previous hash, the time, the actor, the action and the payload, then runs SHA-256.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {J}/audit/domain · AuditHasher.java · {J}/audit/domain/AuditHasher.java
- then: `ghSelect` {J}/audit/domain/AuditHasher.java · public static String computeHash( · return HexFormat.of().formatHex(md.digest(raw.getBytes(StandardCharsets.UTF_8))); · {"plus":0}
- then: `wait` 250
- then: `card` C07-F
- then: `hl` String raw = String.join(SEP,
- on the word “SHA-256”: `hl` MessageDigest md = MessageDigest.getInstance("SHA-256");
- then: `tok` "SHA-256"

**a07b16** (6.1 s) — “So every entry is chained to the one before. Change one old row, and every later hash stops matching.”
- as the voice starts: `hl` prevHash != null ? prevHash : GENESIS_HASH,
- then, 0.2 s later: `tok` prevHash != null ? prevHash : GENESIS_HASH
- on the word “Change”: `note` Each entry is chained to the one before

**a07b17** (3.8 s) — “But what stops someone from quietly editing the table itself? ”
- as the voice starts: `cardClose` 
- then, 0.2 s later: `ghUnselect` 
- then: `scrollBy` 260 · 1600

**a07b18** (5.1 s) — “The database itself refuses to update or delete audit rows. This trigger blocks it.”
- as the voice starts: `cardClose` 
- then: `ghOpen` backend/src/main/resources/db/migration · V003__audit_timers_ai.sql · backend/src/main/resources/db/migration/V003__audit_timers_ai.sql
- then: `ghSelect` backend/src/main/resources/db/migration/V003__audit_timers_ai.sql · CREATE OR REPLACE FUNCTION audit_immutable() RETURNS trigger AS $$ · FOR EACH STATEMENT EXECUTE FUNCTION audit_immutable(); · {"plus":0}
- then: `wait` 250
- then: `card` C07-G
- then: `hl` CREATE TRIGGER audit_no_change BEFORE UPDATE OR DELETE OR TRUNCATE ON audit_record
- then: `tok` BEFORE UPDATE OR DELETE OR TRUNCATE

**a07b19** (5.4 s) — “Security is configured in one place. Login is open, and everything else needs a token.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {J}/identity/infrastructure/security · SecurityConfig.java · {J}/identity/infrastructure/security/SecurityConfig.java
- then: `ghSelect` {J}/identity/infrastructure/security/SecurityConfig.java · .authorizeHttpRequests(auth -> auth · .build(); · {"plus":0}
- then: `wait` 250
- then: `card` C07-H
- then: `hl` .requestMatchers(HttpMethod.POST, "/api/v1/auth/login", "/api/v1/auth/refresh").permitAll()
- on the word “everything”: `hl` .requestMatchers("/api/v1/**").authenticated()
- then: `tok` authenticated()

**a07b20** (3.1 s) — “And the admin routes need the administrator role.”
- as the voice starts: `hl` .requestMatchers("/api/v1/admin/**").hasRole("ADMINISTRATOR")
- then, 0.2 s later: `tok` hasRole("ADMINISTRATOR")

**a07b21** (3.8 s) — “Finally, errors. This handler catches any of our exceptions.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {J}/shared/infrastructure/web · GlobalProblemDetailsHandler.java · {J}/shared/infrastructure/web/GlobalProblemDetailsHandler.java
- then: `ghSelect` {J}/shared/infrastructure/web/GlobalProblemDetailsHandler.java · @ExceptionHandler(ItsmException.class) · return ResponseEntity.status(status).body(problem); · {"plus":1}
- then: `wait` 250
- then: `card` C07-I
- then: `hl` @ExceptionHandler(ItsmException.class)

**a07b22** (4.3 s) — “It turns them into a standard error response with our own error code.”
- as the voice starts: `hl` problem.setProperty("code", ex.code());
- on the word “code”: `tok` ex.code()

**a07b23** (3.8 s) — “So the frontend always gets a clear reason, never a stack trace.”
- as the voice starts: `unhl` 
- then, 0.1 s later: `note` Clear reason, no stack trace
- after the voice: `cardClose` 

## T08 — Act 8 · the frontend

Before recording starts: `ghGoto` tree/<SHA>/frontend

**a08b01** (3.5 s) — “The frontend is much simpler. Let me go back and open it.”
- on the word “open”: `ghClick` src · {"fallback":"tree/<SHA>/frontend/src"}

**a08b02** (5.7 s) — “Services talk to the backend, context holds login and live updates, and pages are the screens.”
- on the word “Services”: `ghHover` services · 600
- on the word “context”: `ghHover` context · 600
- on the word “pages”: `ghHover` pages · 900

**a08b03** (4.7 s) — “Every request goes through this one function. It attaches the login token.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {F}/services · api.ts · {F}/services/api.ts
- then: `ghSelect` {F}/services/api.ts · async function request<T>(path: string, options: RequestInit = {}): Promise<T> { · throw err; · {"plus":1}
- then: `wait` 250
- then: `card` C08-A
- on the word “attaches”: `hl` ...getAuthHeader(),
- then: `tok` getAuthHeader()

**a08b04** (4.5 s) — “If the server sends an error, it throws it with the server's own message.”
- as the voice starts: `hl` if (!response.ok) {
- on the word “throws”: `hl` const err = new Error(errBody.detail || errBody.title || `HTTP error ${response.status}`); · throw err;
- then: `tok` errBody.detail

**a08b05** (3.4 s) — “Switching user logs in again and stores the new token.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {F}/context · AuthContext.tsx · {F}/context/AuthContext.tsx
- then: `ghSelect` {F}/context/AuthContext.tsx · const switchUser = async (user: PredefinedUser) => { · setIsLoading(false); · {"plus":2}
- then: `wait` 250
- then: `card` C08-B
- then: `hl` const activeToken = await performLogin(user);
- then: `tok` performLogin(user)

**a08b06** (6.4 s) — “This is the submit handler of the report form. It calls create with the title, description and service.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {F}/pages/portal · PortalReport.tsx · {F}/pages/portal/PortalReport.tsx
- then: `ghSelect` {F}/pages/portal/PortalReport.tsx · const handleSubmit = async (e: React.FormEvent) => { · onSubmitSuccess(res.id); · {"plus":1}
- then: `wait` 250
- then: `card` C08-C
- on the word “calls”: `hl` const res = await api.incidents.create({ · title: title.trim(), · description: description.trim(), · serviceCode: serviceCode || advice?.suggestedService || undefined,
- then: `tok` api.incidents.create

**a08b07** (5.5 s) — “And this is the technician screen. A button is drawn only if its action is in the allowed list.”
- as the voice starts: `cardClose` 
- then: `ghOpen` {F}/pages/workbench · WorkbenchDetail.tsx · {F}/pages/workbench/WorkbenchDetail.tsx
- then: `ghSelect` {F}/pages/workbench/WorkbenchDetail.tsx · {allowed.includes('ACKNOWLEDGE') && ( · Acknowledge (Stop Response Clock) · {"plus":2}
- then: `wait` 250
- then: `card` C08-D
- on the word “only”: `hl` {allowed.includes('ACKNOWLEDGE') && (
- then: `tok` allowed.includes('ACKNOWLEDGE')

**a08b08** (6.0 s) — “That list comes from the state object in the backend. The frontend never decides what is legal.”
- as the voice starts: `hl` onClick={() => runCommand('acknowledge')}
- on the word “never”: `note` The backend decides what is legal

**a08b09** (2.9 s) — “Okay, enough code. Let's actually run it.”
- as the voice starts: `cardClose` 
- then, 0.3 s later: `ghUnselect` 
- then: `scrollTop` 

## T09 — Act 9 · live demo

Before recording starts: `goto` APP/app.html?tab=portal; `ready` ; `expect` Aarav Sharma; `expect` Report New Incident

**a09b01** (2.1 s) — “I am logged in as Aarav, a student.”
- as the voice starts: `point` [title="Switch BITS Pilani Demo Persona"] · {"hold":1300}

**a09b02** (2.9 s) — “His Moodle quiz will not open, so he reports it.”
- on the word “reports”: `click` Report New Incident
- then: `expect` Report a Campus IT Issue

**a09b03** (5.3 s) — “As I type, the copilot reads the text and suggests the affected service, Moodle LMS.”
- before the voice: `zoom` e.g. Cannot open Moodle quiz · 2
- before the voice: `type` e.g. Cannot open Moodle quiz · Cannot open Moodle quiz, login keeps timing out · {"ms":1500}
- before the voice: `zoom` Provide error codes · 2
- as the voice starts: `type` Provide error codes · Since 9 am the LMS login page loads forever and then shows a gateway timeout. Tried two browsers on hostel Wi-Fi. · {"ms":2200}
- on the word “suggests”: `zoomOut` {"nowait":true}
- then: `diagram` copilot
- then: `step` c1
- then, 0.35 s later: `step` c2
- then, 0.45 s later: `step` c3
- on the word “Moodle”: `step` c4
- after the voice: `diagramClose` 
- after the voice: `expect` Copilot suggests: APP-LMS
- after the voice: `point` Copilot suggests: APP-LMS · {"hold":900}

**a09b04** (2.3 s) — “I set the urgency to high, and submit.”
- before the voice: `move` Self-Reported Urgency
- before the voice: `zoomFollow` 2
- as the voice starts: `click` High Priority
- on the word “submit”: `zoomOut` 
- then: `click` Submit Incident Report · {"after":500}

**a09b05** (3.5 s) — “Pause. This click runs the submit handler I showed you.”
- before the voice: `diagram` submitFlow
- before the voice: `step` btn
- on the word “submit”: `step` n1

**a09b06** (2.9 s) — “It sends a POST request to the incidents route.”
- on the word “POST”: `step` n2

**a09b07** (3.4 s) — “The controller receives it and calls the intake service.”
- on the word “controller”: `step` n3
- on the word “intake”: `step` n4

**a09b08** (2.1 s) — “The pipeline runs its nine steps.”
- before the voice: `diagram` pipeline
- as the voice starts: `sweep` [s1, s2, s3, s4, s5, s6, s7, s8, s9] · 1900

**a09b09** (5.2 s) — “Step three calls the factory method, which checks the rules and records the event.”
- 0.3 s in: `glow` s3
- then: `step` s3

**a09b10** (3.3 s) — “Step nine saves the ticket and publishes its events.”
- 0.3 s in: `glow` s9
- then: `step` s9

**a09b11** (4.0 s) — “And the audit listener writes the first links of the hash chain.”
- before the voice: `diagram` chain
- before the voice: `step` g
- on the word “audit”: `step` h1
- on the word “first”: `step` h2
- on the word “hash”: `step` h3
- after the voice: `diagramClose` 

**a09b12** (5.3 s) — “And here is the result. The ticket is already assigned to a technician.”
- before the voice: `ready` 
- before the voice: `expect` INCIDENT TELEMETRY DOSSIER
- before the voice: `remember` TICKET · window.__izLast && window.__izLast.number
- before the voice: `remember` TECH · window.__izLast && window.__izLast.assigneeName
- before the voice: `expect` ASSIGNED · {"exact":true}
- before the voice: `expect` P2 · {"exact":true}
- on the word “result”: `point` ASSIGNED · {"hold":1200}
- on the word “assigned”: `point` Current State: · {"hold":1400}

**a09b13** (5.2 s) — “It came out as priority two. The word quiz triggered the exam bump we saw in the matrix.”
- as the voice starts: `point` P2 · {"hold":1500}
- on the word “word”: `diagram` matrix
- on the word “quiz”: `cell` 1 · 1
- on the word “bump”: `bump` P3 · the text says "quiz" → exam window, one level up · P2
- after the voice: `diagramClose` 

**a09b14** (6.2 s) — “For this service and priority, the policy gives fifteen minutes to respond and two hours to resolve.”
- as the voice starts: `scrollTo` sla-priority-panel
- then: `zoom` sla-targets · 2
- on the word “fifteen”: `point` sla-respond · {"hold":1300}
- on the word “two”: `point` sla-resolve · {"hold":1200}
- after the voice: `zoomOut` 

**a09b15** (4.1 s) — “Below is the timeline, with one hashed entry for each step so far.”
- as the voice starts: `scrollTo` PUBLIC TIMELINE · {"block":"start","ms":800}
- on the word “hashed”: `point` button[title^="Click to copy full SHA-256"] >> nth=1 · {"hold":1400}

**a09b16** (3.1 s) — “Now I switch to the technician it was assigned to.”
- as the voice starts: `scrollTop` 
- then: `user` $TECH
- then: `tab` Workbench

**a09b17** (5.6 s) — “The ticket is in his queue. There is no Resolve button yet, because the state does not allow it.”
- before the voice: `expect` $TICKET
- as the voice starts: `point` $TICKET · {"hold":1500}
- on the word “there”: `click` $TICKET · {"after":600}
- then: `ready` 
- then: `expect` PERMITTED ACTIONS:
- then: `point` PERMITTED ACTIONS: · {"hold":0,"pad":14}
- after the voice: `unring` 

**a09b18** (1.7 s) — “He clicks acknowledge.”
- 0.2 s in: `click` Acknowledge · {"after":300}

**a09b19** (3.5 s) — “The button calls runCommand, which posts the action name.”
- before the voice: `diagram` ackFlow
- before the voice: `step` a0
- on the word “runCommand”: `step` a1
- on the word “posts”: `step` a2

**a09b20** (3.5 s) — “The controller's switch picks the acknowledge method.”
- on the word “controller”: `step` a3

**a09b21** (3.4 s) — “The service loads the ticket and asks the authorizer.”
- on the word “service”: `step` a4
- on the word “authorizer”: `step` a5

**a09b22** (2.0 s) — “He is the assignee, so it passes.”
- on the word “assignee”: `mark` a5 · good · isAssignee = true ✓

**a09b23** (4.0 s) — “AssignedState stops the response clock and returns the next state.”
- as the voice starts: `step` a6
- on the word “returns”: `step` a7
- after the voice: `diagramClose` 

**a09b24** (4.2 s) — “The state is now Acknowledged, and the response clock has stopped.”
- before the voice: `ready` 
- before the voice: `expect` ACKNOWLEDGED · {"exact":true}
- as the voice starts: `point` ACKNOWLEDGED · {"hold":1400}
- on the word “response”: `zoom` sla-targets · 2
- then: `point` sla-respond · {"hold":1200}
- after the voice: `zoomOut` 
- after the voice: `scrollTop` 

**a09b25** (4.0 s) — “He starts the investigation, and the state becomes In Progress.”
- on the word “starts”: `click` Start Investigation
- then: `expect` IN_PROGRESS · {"exact":true}
- then: `point` IN_PROGRESS · {"hold":1200}

**a09b26** (3.5 s) — “He needs more details, so he asks the student a question.”
- as the voice starts: `click` Request User Info
- then: `type` [role=dialog] textarea · Which browser are you using, and which Wi-Fi network are you on? · {"clear":true,"ms":1900}
- then, 0.2 s later: `click` Send Request & Pause Clock · {"after":500}

**a09b27** (3.8 s) — “In the code, InProgressState pauses the resolution clock.”
- before the voice: `diagram` pauseFlow
- before the voice: `step` p0
- on the word “InProgressState”: `step` p1

**a09b28** (4.0 s) — “That is the pause method from earlier, returning a paused clock.”
- as the voice starts: `step` p2
- on the word “returning”: `step` p3
- then, 0.2 s later: `mark` p3 · warn · PAUSED
- after the voice: `diagramClose` 

**a09b29** (4.6 s) — “So while we wait for the student, the technician is not blamed for the delay.”
- before the voice: `ready` 
- before the voice: `expect` PENDING_USER · {"exact":true}
- as the voice starts: `point` PENDING_USER · {"hold":1300}
- on the word “technician”: `zoom` sla-paused · 2
- after the voice: `zoomOut` 
- after the voice: `scrollTop` 

**a09b30** (3.1 s) — “Back to Aarav. He sees the question and answers it.”
- as the voice starts: `user` Aarav Sharma
- then: `tab` Student Portal
- then: `click` $TICKET · {"after":600}
- then: `ready` 
- then: `point` TECHNICIAN AWAITING YOUR INPUT · {"hold":1200}

**a09b31** (3.5 s) — “The state goes back to In Progress, and the clock runs again.”
- before the voice: `zoom` e.g. Cleared browser cookies · 2
- before the voice: `type` e.g. Cleared browser cookies · Chrome and Firefox, both on the hostel Wi-Fi in Vyas Bhawan. · {"ms":1700}
- before the voice: `zoomOut` 
- before the voice: `click` Send Diagnostic Reply · {"after":600}
- before the voice: `ready` 
- before the voice: `expect` IN_PROGRESS · {"exact":true}
- before the voice: `scrollTop` 
- as the voice starts: `point` IN_PROGRESS · {"hold":1200}
- on the word “clock”: `zoom` sla-targets · 2
- then: `point` sla-resolve · {"hold":1100}
- after the voice: `zoomOut` 
- after the voice: `scrollTop` 

**a09b32** (4.6 s) — “The technician fixes the problem and resolves the ticket with a proper note.”
- as the voice starts: `user` $TECH
- then: `tab` Workbench
- then: `click` $TICKET · {"after":600}
- then: `ready` 
- then: `click` Resolve Incident
- then: `type` [role=dialog] textarea · Restarted the Moodle login service and cleared the stuck sessions. Login works again. · {"clear":true,"ms":2400}

**a09b33** (6.8 s) — “The note needs at least twenty characters. A lazy note like "done" is rejected by the domain. ”
- as the voice starts: `point` Resolution Notes · {"hold":1500}
- on the word “lazy”: `diagram` noteRule
- then: `step` r1
- on the word “rejected”: `step` r2
- then, 0.6 s later: `step` r3
- then: `mark` r3 · bad
- after the voice: `diagramClose` 
- after the voice: `click` Confirm Resolution · {"after":600}
- after the voice: `ready` 
- after the voice: `expect` RESOLVED · {"exact":true}

**a09b34** (3.8 s) — “Aarav checks Moodle, gives five stars, and confirms the fix.”
- as the voice starts: `user` Aarav Sharma
- then: `tab` Student Portal
- then: `click` $TICKET · {"after":600}
- then: `ready` 
- then: `zoom` TECHNICIAN HAS RESOLVED YOUR ISSUE · 1
- then: `click` button:has(svg.lucide-star) >> nth=4
- then: `expect` Rating: 5/5
- then, 0.3 s later: `zoomOut` 
- then: `click` Confirm It Is Fixed · {"after":500}

**a09b35** (2.9 s) — “This sends the verify action with the rating.”
- before the voice: `diagram` verifyFlow
- before the voice: `step` v0
- 0.4 s in: `step` v1

**a09b36** (5.1 s) — “ResolvedState checks that he is the reporter, then moves the ticket to Verified.”
- as the voice starts: `step` v2
- on the word “reporter”: `mark` v2 · good · he is the reporter ✓
- on the word “moves”: `step` v3
- after the voice: `diagramClose` 

**a09b37** (1.9 s) — “The ticket is now Verified.”
- before the voice: `ready` 
- before the voice: `expect` VERIFIED · {"exact":true}
- before the voice: `scrollTop` 
- as the voice starts: `point` VERIFIED · {"hold":1300}

**a09b38** (6.9 s) — “Finally the technician closes it. The ticket is closed, and the state allows no further moves.”
- before the voice: `user` $TECH
- before the voice: `tab` Workbench
- before the voice: `click` $TICKET · {"after":600}
- before the voice: `ready` 
- before the voice: `expect` Close Incident
- on the word “closes”: `click` Close Incident
- then: `expect` CLOSED · {"exact":true}
- on the word “closed”: `point` CLOSED · {"hold":1300}
- on the word “no”: `point` PERMITTED ACTIONS: · {"hold":1400,"pad":14}

**a09b39** (5.2 s) — “And the timeline shows the full story: who did what, when, and the hash of each entry.”
- as the voice starts: `scrollTo` CRYPTOGRAPHIC AUDIT LEDGER · {"block":"start","ms":900}
- on the word “who”: `move` button[title^="Click to copy full SHA-256"] >> nth=1
- then: `scrollBy` 520 · 2600

## T10 — Act 10 · proof

Before recording starts: `goto` APP/app.html?tab=workbench; `ready` 

**a10b01** (4.5 s) — “Now let me try to cheat. I will ask the server to close that ticket again.”
- before the voice: `term` Terminal — IncidentZero
- on the word “ask”: `termType` illegal · 2000

**a10b02** (6.0 s) — “The server says no. Error 409, with the current state and the command I tried.”
- as the voice starts: `termPrint` illegal · 700
- on the word “409”: `termPoint` "status": 409
- on the word “current”: `termPoint` "currentState": "CLOSED"
- on the word “command”: `termPoint` "attemptedCommand": "CLOSE"

**a10b03** (3.5 s) — “That is the default method in IncidentState, doing its job.”
- as the voice starts: `termPoint` "code": "ITSM-4090"
- after the voice: `termClose` 

**a10b04** (4.7 s) — “Next, the audit ledger. As the admin, I ask the server to verify every chain.”
- as the voice starts: `user` Suresh Deshmukh
- then: `tab` Command DAG
- then: `click` SHA-256 Audit Ledger · {"after":700}
- then: `ready` 
- then: `click` VERIFY LEDGER · {"after":600}

**a10b05** (3.6 s) — “It recomputes every hash and compares it with the stored one.”
- before the voice: `diagram` ledgerCheck
- before the voice: `step` l1
- on the word “recomputes”: `step` l2
- on the word “compares”: `step` l3

**a10b06** (1.7 s) — “Every entry is valid.”
- before the voice: `step` l4
- before the voice: `mark` l4 · good · all match ✓
- before the voice: `wait` 500
- before the voice: `diagramClose` 
- before the voice: `expect` HASH BLOCKS SECURE
- as the voice starts: `point` HASH BLOCKS SECURE · {"hold":1300}

**a10b07** (3.5 s) — “Now I try to change an old entry directly in the database.”
- before the voice: `term` Terminal — demo database
- 0.3 s in: `termType` psql · 2200

**a10b08** (4.0 s) — “The database refuses. The audit table is append only.”
- as the voice starts: `termPrint` psql · 400
- on the word “append”: `termPoint` append-only
- after the voice: `termClose` 

**a10b09** (6.2 s) — “Last, the tests. This script fires fifty thousand random command sequences at the state machine.”
- before the voice: `term` Terminal — IncidentZero
- on the word “script”: `termType` m1 · 900
- then, 0.2 s later: `termPrint` m1 · 2400

**a10b10** (6.5 s) — “Twenty-four checks pass, covering more than five hundred and fifty thousand transitions, in a few seconds.”
- as the voice starts: `termPoint` SUMMARY: 24 passed, 0 failed

**a10b11** (3.9 s) — “And the architecture rules I showed at the start all pass too.”
- as the voice starts: `termType` arch · 900
- then, 0.1 s later: `termPrint` arch · 900
- on the word “pass”: `termPoint` BUILD SUCCESS
- after the voice: `termClose` 

## T11 — Act 11 · the team

Before recording starts: `goto` APP/app.html?tab=stage; `ready` 

**a11b01** (7.5 s) — “That is Incident-Zero. It was built by Group 76: Suhani Agarwal, Kartikey Negi, Harish Kumar, and me, Srijan Shukla.”
- before the voice: `title` team
- on the word “Suhani”: `reveal` suhani
- on the word “Kartikey”: `reveal` kartikey
- on the word “Harish”: `reveal` harish
- on the word “me”: `reveal` srijan

**a11b02** (8.6 s) — “The object-oriented ideas were not decoration. Encapsulation, inheritance, polymorphism and abstraction each solved a real problem here.”
- before the voice: `title` oop
- on the word “Encapsulation”: `reveal` enc
- on the word “inheritance”: `reveal` inh
- on the word “polymorphism”: `reveal` poly
- on the word “abstraction”: `reveal` abs

**a11b03** (4.4 s) — “The code is on GitHub, at the address on screen. Thank you for watching.”
- before the voice: `title` end
- on the word “address”: `reveal` live
- on the word “Thank”: `reveal` thanks
