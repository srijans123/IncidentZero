# INCIDENT-ZERO — VIDEO SCRIPT (final, beat by beat)

Companion to `ANTIGRAVITY_MASTER_BRIEF.md`. Put both files in the repo root.

This file is the complete script: every act, every scene, every beat, the exact words to speak, the exact thing to show, the exact code lines for every card, and every code trace. You (the agent) do not write or reword narration. You only execute.

---

## 0. HOW TO EXECUTE THIS FILE

### 0.1 Precedence
- For the act list, scene list, beat list, spoken words, code cards, traces, terminal commands and demo data, **this file wins** over the master brief (it replaces brief section C13 and the trace table in C11).
- For everything else (fixes, pipeline, capture method, voice route, render, gates), the master brief wins.

### 0.2 The words are final
- Copy every `SAY:` line into `storyboard.json` character for character, including the emotion tags in square brackets. Do not reword, merge, split, reorder or add sentences.
- You may change a `SAY:` line in only these three cases, and you must list each case in `FINAL_REPORT.md`:
  1. The beat has `REQUIRES: Axx` and that fix is not green at Gate A → delete the beat. If the beat has an `ALT:` line, use the `ALT:` text instead of deleting.
  2. Duration control (0.6).
  3. A fact in the line is false at `PINNED_SHA` (you checked the code and it disagrees) → delete the beat, write the evidence to `BLOCKERS.md`. Do not write a replacement.
- When a beat is deleted for any reason, only its speech and its `POINT`, `HOVER`, `HL`, `NOTE`, `HOLD` steps disappear. Steps that change what is on screen for later beats (`CLICK`, `TYPE`, `PICK`, `USER`, `WAIT`, `GOTO`, `OPEN`, `CLOSE`, `RUN`, "clip resumes") move to the start of the next beat and run silently.
- Speech text: build the spoken form from `SAY:` with the pronunciation table (0.5). Subtitles use the `SAY:` text with tags removed.

### 0.3 Beat format
```
- **aXXbYY** · DO: <what to show>
  SAY: <exact words>
```
Optional extra lines under a beat: `REQUIRES:`, `ALT:`, `CUT:`.
Beat ids are `a<act>b<number>`. Scene headers (`### S03.2 · code · …`) give the scene type and, for code scenes, the card definitions.

### 0.4 DO vocabulary
| Scene type | DO verbs |
|---|---|
| `github` | `GOTO <path>` (address-bar navigation to `https://github.com/srijans123/IncidentZero/<path>`; use `tree/<PINNED_SHA>/…` and `blob/<PINNED_SHA>/…`), `CLICK "<row name>"` (click that folder or file row in the file list; if GitHub shows a collapsed path such as `src/main/java`, click the row whose text ends with that name), `HOVER "<row name>"` (move the cursor onto the row, row highlights), `SCROLL "<text>"` (smooth-scroll until that text is in the middle of the page), `HOLD` |
| `code` | `OPEN <card id>` (card opens over the blurred GitHub frame), `HL "<substring>"` (highlight every card line containing the substring; one or more per beat), `NOTE "<text>"` (margin note pinned to the first highlighted line), `CLOSE` (card closes back to GitHub) |
| `app` | `CLICK "<label>"`, `TYPE <field> "<text>"`, `PICK <field> "<option>"`, `USER "<name>"` (open the user menu in the header and choose that user), `POINT "<thing>"` (move cursor to it, show a ring, no click), `WAIT <condition>` |
| `trace` | `HOP <file> · <symbol> · HL "<substring>"` (one popup snippet of 7 to 11 lines centred on the highlighted line, arrow from the previous hop or from the clicked button) |
| `terminal` | `RUN <command>` (type it, then show its real captured output), `POINT "<substring of output>"` |
| `title` | `TITLE` with the listed text |

`GOTO`, a tab switch, and the start of an `app`, `terminal` or `title` scene always close any open card first, even if no `CLOSE` is written.

Timing inside a beat: the speech starts when the beat starts and the DO steps run at the same time. Exception: when a DO line contains the marker `▶`, do everything before the marker silently first, start the speech at the marker, and do the rest while speaking.

Rules for anchors:
- `FROM` and `TO` in a card definition are exact substrings of the first and last line of the card. Find them in the file at `PINNED_SHA`. If a `TO` anchor is followed by "(+N)", include the next N lines too (closing braces).
- Files under `**/domain/**` and the `V003` migration are not allowed to change, so their anchors will match exactly.
- For files that Phase A edits, the card lists `MUST SHOW` substrings instead. Choose the smallest contiguous block of at most 26 lines inside the named symbol that contains all of them. If a `MUST SHOW` or `HL` substring no longer exists, use the line that now does the same job; if no line does that job, apply rule 0.2 case 3.
- Path shorthands: `{J}` = `backend/src/main/java/edu/campus/iitsm`, `{F}` = `frontend/src`.

### 0.5 Pronunciation table (apply to the spoken form only)
| Written in SAY | Speak as |
|---|---|
| Group 76 | Group seventy-six |
| BITS Pilani | Bits Pilani |
| SLA | S L A |
| JPA | J P A |
| REST | rest |
| URL | U R L |
| HTTP | H T T P |
| HTML | H T M L |
| SHA-256 | shah two fifty six |
| 409 | four oh nine |
| P2 | P two |
| LMS | L M S |
| GitHub | git hub |
| readme | read me |
| doExecute | do execute |
| Any CamelCase identifier (IncidentState, SlaClock, ClockPort, AssignedState, IncidentCommandService …) | the same words separated by spaces (Incident State, S L A Clock, Clock Port …) |

Add a row only when the speech check hears a word wrong.

### 0.6 Duration control (deterministic, no judgement)
After all speech exists, compute the master length.
If it is over 19:30, apply these steps one at a time, in this order, and stop as soon as the length is 19:30 or less:
1. Shorten the gap after every beat from 0.35 s to 0.20 s and the pause after every scene from 0.5 s to 0.3 s.
2. Delete every beat marked `CUT: 1`.
3. Delete every beat marked `CUT: 2`.
4. Delete every beat marked `CUT: 3`.
5. Still over → stop and report to Srijan.

If it is under 15:30, add 0.5 s of hold after every beat. Still under 15:10 → stop and report.
Otherwise change nothing. Any final length from 15:30 to 19:30 is accepted.

### 0.7 Lint overrides for this script
The linter in brief section C7 runs with these changes: total words allowed 2,000 to 2,800; the Gate C duration window becomes 15:30 to 19:30; the numbers and facts listed in section 13 of this file are pre-approved (still verify each against the code and record the evidence in `truth_sheet.md`).

### 0.8 Emotion tags
Exactly 12 tags are used, already placed. Do not add, move or remove any (except when the whole beat is deleted).

---

## 1. ADDENDUM TO PHASE A (found while writing this script)

Add these to the Phase A fix list in the master brief. All are Priority 0.

**A24. Urgency scale is inverted between frontend and backend.** `frontend/src/pages/portal/PortalReport.tsx` sends `1` for "Critical", `2` for "High", `3` for "Standard" (the option list near line 270, default state `3`). The backend treats `3` as the highest: `ItilMatrixPriorityStrategy.MATRIX[impact-1][urgency-1]` gives P1 only for impact 3 and urgency 3. So "Critical" produces the lowest priority and "Standard" the highest. Fix in the frontend only: Critical = `3`, High = `2`, Standard = `1`, default `1`. In `IncidentController.createIncident` change the fallback urgency from `3` to `2`. Add a Gate A case: same ticket text with Standard, High, Critical gives non-decreasing priority.

**A25. Never edit an applied Flyway migration.** `V001`, `V002`, `V003` must stay byte-identical (checksums). Any schema change goes into a new `V004__…sql`. The repeatable seed `R__campus_seed.sql` may be edited.

**A26. Resolve modal must send a root cause.** `InProgressState.resolve` rejects a resolution without `rootCauseCategory` when the priority is P1 or P2. Keep the root-cause field in the modal and make it required.

**A27. Demo seed.** Create `scripts/demo-seed.mjs`. It runs right after `demo-reset` and creates these four tickets through the real API as `diya@bits.campus`, so queues and admin numbers are not empty:
| Title | Description | Service | Urgency |
|---|---|---|---|
| Hostel Wi-Fi drops every few minutes in Vyas Bhawan | The connection to the hostel network disconnects every five minutes since last night. | NET-WIFI-HOSTEL | High |
| Projector in classroom F102 shows no signal | The projector stays on a blue screen with any laptop and any cable we tried. | HW-AV | Standard |
| Cannot print from the department printer | Print jobs stay in the queue and nothing comes out of the printer on the first floor. | HW-PRINT | Standard |
| ERP timetable page is blank after login | After logging in to the ERP the timetable page loads as an empty white page. | APP-ERP | High |

---

## 2. DEMO DATA USED ON CAMERA (use exactly this)

- Student: **Aarav Sharma** (`emp@bits.campus`). Admin: **Suresh Deshmukh** (`admin@bits.campus`). Technician: whoever the ticket is assigned to (read it from the API after creation; with the seed data this is the technician of the team that owns Moodle).
- Ticket title: `Cannot open Moodle quiz, login keeps timing out`
- Ticket description: `Since 9 am the LMS login page loads forever and then shows a gateway timeout. Tried two browsers on hostel Wi-Fi.`
- Affected service: `APP-LMS` (Moodle LMS). If the copilot did not preselect it, pick it in the dropdown.
- Urgency: High.
- Technician's question: `Which browser are you using, and which Wi-Fi network are you on?`
- Student's answer: `Chrome and Firefox, both on the hostel Wi-Fi in Vyas Bhawan.`
- Resolution: code `FIXED`, root cause: the first option in the list, notes `Restarted the Moodle login service and cleared the stuck sessions. Login works again.`
- Rating: 5 stars.
- Expected result to verify before recording: priority **P2** (impact 2 × urgency 2 = P3, plus one level because the text contains "quiz"), SLA policy for tier T1 / P2 = respond in 15 minutes, resolve in 120 minutes, state after creation `ASSIGNED`. If the running app shows anything else, stop and write it to `BLOCKERS.md`.

---

## 3. CHAPTER CHIPS

| Act | Chip text |
|---|---|
| 0 | `0 · INTRO` |
| 1 | `1 · THE REPO` |
| 2 | `2 · MODULES` |
| 3 | `3 · DOMAIN CORE` |
| 4 | `4 · TIME` |
| 5 | `5 · INTAKE PIPELINE` |
| 6 | `6 · COMMANDS` |
| 7 | `7 · INFRASTRUCTURE` |
| 8 | `8 · FRONTEND` |
| 9 | `9 · LIVE DEMO` |
| 10 | `10 · PROOF` |
| 11 | `11 · TEAM` |

---

## ACT 0 — INTRO

### S00.1 · app · the arcade home screen
Start state: app tab active at `http://localhost:3000/app.html?tab=stage`, logged in as Aarav Sharma, sound muted.

- **a00b01** · DO: HOLD on the Campus Stage screen; cursor drifts to the logo
  SAY: Hi, I'm Srijan, and this is Incident-Zero, our Object-Oriented Programming project from Group 76.
- **a00b02** · DO: CLICK "Student Portal"
  SAY: It is a help desk for campus IT at BITS Pilani Hyderabad.
- **a00b03** · DO: POINT "Report New Incident", then POINT the ticket table
  SAY: A student reports a problem, the system sorts it and assigns it, and a technician fixes it.
- **a00b04** · DO: POINT the State column of the table
  SAY: Every step is checked by a state machine and written to a log that cannot be edited.
- **a00b05** · DO: POINT the score counter in the header
  SAY: And yes, it looks like an arcade game. [laughter] That part was just for fun.

### S00.2 · github · first look at the repo
- **a00b06** · DO: switch to the GitHub tab (tab-switch animation); GOTO repo home (plain URL, no SHA)
  SAY: In this video I will walk through the repository, open the important files, and explain what each one does.
- **a00b07** · DO: HOLD
  SAY: Then I will run the app and connect every click back to the code.

---

## ACT 1 — THE REPO

### S01.1 · github · repo home and folders
- **a01b01** · DO: SCROLL "What is Incident-Zero?"
  SAY: This is the repository on GitHub. The readme gives the short version.
- **a01b02** · DO: POINT the three bullets under "It is deliberately small to operate"
  SAY: One Java backend, one React app, and one PostgreSQL database.
- **a01b03** · DO: SCROLL to the line "Report · Classify · Prioritize · Assign · Investigate · Resolve · Verify · Close" near the top
  SAY: A ticket is reported, classified, prioritised, assigned, investigated, resolved, verified, and finally closed.
  CUT: 1
- **a01b04** · DO: scroll back to the file list; HOVER "backend"
  SAY: Let me go through the folders. The backend folder holds the Java code, built with Spring Boot.
- **a01b05** · DO: HOVER "frontend"
  SAY: The frontend folder holds the React app, written in TypeScript.
- **a01b06** · DO: CLICK "docs", CLICK "adr"; HOLD on the list `ADR-001.md … ADR-015.md`
  SAY: Inside docs there are fifteen decision records. Each one explains why we made a design choice.
- **a01b07** · DO: GOTO `tree/<PINNED_SHA>`; HOVER "scripts"
  SAY: The scripts folder has our verification scripts, which I will run at the end.
- **a01b08** · DO: HOVER "deploy"
  SAY: Deploy has the Docker Compose file for the database and the app.
- **a01b09** · DO: HOVER ".github"
  SAY: And the workflows folder runs our checks automatically on every push.
- **a01b10** · DO: move the cursor slowly down the remaining folders without stopping
  SAY: The other folders are tooling, so I will skip them.
  CUT: 3
- **a01b11** · DO: CLICK "backend"
  SAY: The real work is in the backend, so let's start there.

---

## ACT 2 — MODULES

### S02.1 · github · the package and its modules
- **a02b01** · DO: CLICK through to `{J}` (click `src`, `main`, `java`, then the row ending in `iitsm`, using collapsed rows where GitHub shows them); HOLD on the module folder list
  SAY: Under the main package, the code is split into modules, one folder for each responsibility.
- **a02b02** · DO: HOVER "incident"
  SAY: Incident is the biggest one. It owns the ticket and its life cycle.
- **a02b03** · DO: HOVER "assignment", then "sla", then "audit"
  SAY: Assignment picks a technician, SLA handles deadlines, and audit keeps the tamper-evident log.
- **a02b04** · DO: HOVER "identity", then "notification", then "intelligence"
  SAY: Identity handles login, notification pushes live updates, and intelligence holds the suggestion features.
- **a02b05** · DO: HOVER "catalog", then "knowledge", then "shared"
  SAY: Catalog, knowledge and shared hold the calendar, the help articles, and common building blocks.
  CUT: 2
- **a02b06** · DO: CLICK "incident"; HOLD on `api`, `application`, `domain`, `infrastructure`
  SAY: Open the incident module and you see four folders.
- **a02b07** · DO: HOVER "domain"
  SAY: Domain is plain Java. It holds the business rules and knows nothing about Spring or the database.
- **a02b08** · DO: HOVER "application"
  SAY: Application runs the use cases, step by step.
- **a02b09** · DO: HOVER "infrastructure", then "api"
  SAY: Infrastructure talks to the outside world, and api is what other modules are allowed to see.
- **a02b10** · DO: HOLD
  SAY: The rule is simple. Outer layers can depend on inner ones, but never the other way around.
- **a02b11** · DO: HOLD
  SAY: So how do we make sure nobody breaks that rule? [question-en]

### S02.2 · code · the architecture test
CARD **C02-A** · `backend/src/test/java/edu/campus/iitsm/ArchitectureTest.java` · FROM `static final ArchRule R1_domain_has_zero_framework_imports = noClasses()` · TO `"tools.jackson.."` (+1)

- **a02b12** · DO: GOTO `blob/<PINNED_SHA>/backend/src/test/java/edu/campus/iitsm/ArchitectureTest.java`; SCROLL "R1_domain_has_zero_framework_imports"; OPEN C02-A; HL `resideInAPackage("..domain..")`; HL `"org.springframework.."`
  SAY: With a test. This rule says no class in a domain package may depend on Spring, JPA, or Jackson.
- **a02b13** · DO: HL `R1_domain_has_zero_framework_imports`; NOTE "Checked on every build"; then CLOSE
  SAY: If someone adds one such import, the build fails.

---

## ACT 3 — DOMAIN CORE

### S03.1 · github · the domain folder
- **a03b01** · DO: GOTO `tree/<PINNED_SHA>/{J}/incident/domain`
  SAY: Now the domain folder of the incident module. This is the part I built.
- **a03b02** · DO: HOVER "NewState.java", "AssignedState.java", "ResolvedState.java" in turn
  SAY: Notice the file names: NewState, AssignedState, ResolvedState, and so on. I will come back to those.
- **a03b03** · DO: CLICK "Incident.java"; SCROLL "public static Incident createWithNumber"
  SAY: First, the main class, Incident.

### S03.2 · code · Incident.java, creating a ticket
CARD **C03-A** · `{J}/incident/domain/Incident.java` · FROM `public static Incident createWithNumber(UUID id, String number, UUID reporterId, UUID serviceId,` · TO `return i;` (+1)

- **a03b04** · DO: OPEN C03-A; HL `public static Incident createWithNumber(`
  SAY: This factory method is the only way to create a ticket.
- **a03b05** · DO: HL `cleanTitle.length() < 5`
  SAY: The title must be between five and two hundred characters, or it throws an error.
- **a03b06** · DO: HL `cleanDesc.length() < 10`; HL `impact < 1 || impact > 3`; HL `urgency < 1 || urgency > 3`
  SAY: The description needs at least ten characters, and impact and urgency must be one, two, or three.
- **a03b07** · DO: HL `Incident i = new Incident(`; HL `i.pending.add(new IncidentCreated(`
  SAY: Only when everything is valid does it build the object and record an IncidentCreated event.
- **a03b08** · DO: NOTE "Encapsulation"
  SAY: So a broken ticket can never exist. [confirmation-en] The rules live inside the object, and that is encapsulation.

### S03.3 · code · Incident.java, the actions
CARD **C03-B** · `{J}/incident/domain/Incident.java` · FROM `public void acknowledge(UUID actor, Instant now, WorkingTimeCalculator cal) {` · TO `commit(state.close(this, actor, closureNote, now));` (+1)
CARD **C03-C** · `{J}/incident/domain/Incident.java` · FROM `private void commit(TransitionResult r) {` · TO `if (changed) this.version++;` (+1)
CARD **C03-D** · `{J}/incident/domain/Incident.java` · FROM `public List<DomainEvent> pullEvents() {` · TO `return copy;` (+1)

- **a03b09** · DO: OPEN C03-B; HL `public void acknowledge(`; HL `public void resolve(`; HL `public void verify(`; HL `public void close(`
  SAY: These are the actions: acknowledge, resolve, verify, close, and the rest.
- **a03b10** · DO: HL `commit(state.acknowledge(this, actor, now, cal));`
  SAY: Look how short they are. Each one just asks the current state object to do the work.
- **a03b11** · DO: HOLD
  SAY: The Incident itself never checks which state it is in.
- **a03b12** · DO: OPEN C03-C; HL `this.state = r.nextState();`; HL `this.pending.addAll(r.events());`
  SAY: Whatever the state returns goes into commit. It switches to the next state and stores the events.
- **a03b13** · DO: HL `if (changed) this.version++;`
  SAY: It also raises the version number, which helps us catch two people changing the same ticket.
  CUT: 3
- **a03b14** · DO: OPEN C03-D; HL `List<DomainEvent> copy = List.copyOf(pending);`
  SAY: Later, the application layer pulls those events out and publishes them.
  CUT: 1

### S03.4 · code · IncidentState.java
CARD **C03-E** · `{J}/incident/domain/IncidentState.java` · FROM `public sealed interface IncidentState` · TO `throw StateSupport.illegal(inc, status(), CommandType.ACKNOWLEDGE);` (+1)

- **a03b15** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/{J}/incident/domain`; CLICK "IncidentState.java"; OPEN C03-E; HL `public sealed interface IncidentState`
  SAY: So where do the rules live? [question-en] In this interface, IncidentState.
- **a03b16** · DO: HL `permits NewState, ClassifiedState, AssignedState, AcknowledgedState, InProgressState,`; HL `PendingUserState, ResolvedState, VerifiedState, ReopenedState, ClosedState, CancelledState {`
  SAY: It is sealed, and it permits exactly eleven state classes. Nobody can add a twelfth by accident.
- **a03b17** · DO: HL `throw StateSupport.illegal(inc, status(), CommandType.ACKNOWLEDGE);`
  SAY: Every action has a default body, and that default simply throws an illegal transition error.
- **a03b18** · DO: NOTE "Forbidden unless overridden"
  SAY: So by default, nothing is allowed. A state has to override a method to make that move legal.

### S03.5 · code · AssignedState.java
CARD **C03-F** · `{J}/incident/domain/AssignedState.java` · FROM `final class AssignedState implements IncidentState {` · TO `return new TransitionResult(AcknowledgedState.INSTANCE, List.of(new IncidentAcknowledged(inc.id(), now, actor)));` (+1)

- **a03b19** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/{J}/incident/domain`; CLICK "AssignedState.java"; OPEN C03-F; HL `@Override public TransitionResult acknowledge(`
  SAY: Here is AssignedState. It overrides acknowledge.
- **a03b20** · DO: HL `StateSupport.requireAssignee(inc, actor, "acknowledge");`
  SAY: First it checks that the caller is the assigned technician.
- **a03b21** · DO: HL `inc.stopResponse(now, cal, true);`
  SAY: Then it stops the response clock.
- **a03b22** · DO: HL `return new TransitionResult(AcknowledgedState.INSTANCE,`
  SAY: And it returns the next state, Acknowledged, together with an event.
- **a03b23** · DO: NOTE "Polymorphism · State pattern"
  SAY: The same call behaves differently depending on the state object. That is polymorphism, and this is the State pattern.
- **a03b24** · DO: HOLD
  SAY: It replaces a long chain of if-else checks.
  CUT: 3

### S03.6 · code · ResolvedState.java
CARD **C03-G** · `{J}/incident/domain/ResolvedState.java` · FROM `@Override public TransitionResult verify(Incident inc, UUID actor, Integer rating, Instant now) {` · TO `return new TransitionResult(ReopenedState.INSTANCE, events);` (+1)

- **a03b25** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/{J}/incident/domain`; CLICK "ResolvedState.java"; OPEN C03-G; HL `if (!inc.reporterId().equals(actor) && !Actors.SYSTEM.equals(actor)) {`
  SAY: One more example, ResolvedState. Only the person who reported the ticket can verify the fix.
- **a03b26** · DO: HL `if (rating != null && (rating < 1 || rating > 5)) {`
  SAY: And the rating must be between one and five.
- **a03b27** · DO: HL `inc.reopen(now);`; HL `return new TransitionResult(ReopenedState.INSTANCE, events);`
  SAY: If they reject the fix instead, the ticket is reopened.
  CUT: 2

### S03.7 · github + code · the error classes
CARD **C03-H** · `{J}/shared/domain/error/InvalidStateTransitionException.java` · FROM `public final class InvalidStateTransitionException extends ItsmException {` · TO `this.attemptedCommand = attemptedCommand;` (+1)

- **a03b28** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/{J}/shared/domain/error`; move the cursor down the list of exception files; HOVER "InvalidStateTransitionException.java"
  SAY: An illegal move throws this exception. It sits with fourteen other error classes, all extending one base class.
- **a03b29** · DO: CLICK "InvalidStateTransitionException.java"; OPEN C03-H; HL `extends ItsmException`; HL `super("ITSM-4090", 409,`; NOTE "Inheritance"
  SAY: Each error carries its own code and its own HTTP status. That is inheritance doing useful work.

---

## ACT 4 — TIME

### S04.1 · code · SlaClock.java
CARD **C04-A** · `{J}/incident/domain/SlaClock.java` · FROM `public record SlaClock(ClockState state, long consumedMs, Instant lastResumeAt, long targetMs, ClockMode mode) {` · TO `return new SlaClock(ClockState.STOPPED, consumedMs + extra, lastResumeAt, targetMs, mode);` (+1)

- **a04b01** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/{J}/incident/domain`; HOVER "SlaClock.java"
  SAY: Next, time. Every ticket has two deadlines: one to respond, and one to resolve.
- **a04b02** · DO: CLICK "SlaClock.java"; OPEN C04-A; HL `public record SlaClock(`
  SAY: Each deadline is an SlaClock, and it is a record, so it never changes.
- **a04b03** · DO: HL `public SlaClock pause(Instant now, WorkingTimeCalculator cal) {`; HL `return new SlaClock(ClockState.PAUSED, consumedMs + delta, lastResumeAt, targetMs, mode);`
  SAY: Pause does not modify the clock. It returns a new clock with the time used so far.
- **a04b04** · DO: HL `long delta = cal.workingMillisBetween(lastResumeAt, now, mode == ClockMode.CONTINUOUS_24X7);`
  SAY: And it asks a calendar how much working time has passed.

### S04.2 · code · Incident.refreshSla
CARD **C04-B** · `{J}/incident/domain/Incident.java` · FROM `public void refreshSla(Instant now, WorkingTimeCalculator cal) {` · TO `slaStatus = atRisk ? SlaStatus.AT_RISK : SlaStatus.ON_TRACK;` (+2)

- **a04b05** · DO: CLOSE; GOTO `blob/<PINNED_SHA>/{J}/incident/domain/Incident.java`; SCROLL "public void refreshSla"; OPEN C04-B; HL `boolean atRisk = ratio(responseClock, now, cal) >= 0.75 || ratio(resolutionClock, now, cal) >= 0.75;`
  SAY: Back in Incident, this method reads both clocks. At seventy-five percent used, the ticket is marked at risk.
  CUT: 2
- **a04b06** · DO: HL `slaStatus = SlaStatus.BREACHED;`; HL `} else if (slaStatus != SlaStatus.BREACHED) {`
  SAY: Past the target, it is breached, and a breach is permanent. It never goes back to on track.
  CUT: 2

### S04.3 · code · BusinessCalendar.java
CARD **C04-C** · `{J}/catalog/domain/BusinessCalendar.java` · FROM `public boolean isWorkingDay(LocalDate date) {` · TO `return workDays.contains(date.getDayOfWeek()) && !holidays.contains(date);` (+1)
CARD **C04-D** · `{J}/catalog/domain/BusinessCalendar.java` · FROM `while (!cur.toLocalDate().isAfter(stop.toLocalDate())) {` · TO `return totalMs;`

- **a04b07** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/{J}/catalog/domain`; CLICK "BusinessCalendar.java"; OPEN C04-C; HL `return workDays.contains(date.getDayOfWeek()) && !holidays.contains(date);`
  SAY: That calendar is this class. A working day is a day of the work week that is not a holiday.
- **a04b08** · DO: OPEN C04-D; HL `if (isWorkingDay(date)) {`; HL `totalMs += Duration.between(effStart, effEnd).toMillis();`
  SAY: It walks day by day and adds only the hours inside the working window.
- **a04b09** · DO: NOTE "Weekends and holidays do not count"
  SAY: So a low priority ticket raised on Friday evening does not breach over the weekend.

### S04.4 · code · ClockPort and the virtual clock
CARD **C04-E** · `{J}/shared/domain/ClockPort.java` · FROM `public interface ClockPort {` · TO `long realNanosUntil(Instant targetVirtualInstant);` (+1)
CARD **C04-F** · `{J}/shared/domain/VirtualAnchoredClock.java` · FROM `public Instant now() {` · TO `if (onScaleChangeWakeup != null) onScaleChangeWakeup.run();` (+1)

- **a04b10** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/{J}/shared/domain`; HOVER "ClockPort.java"
  SAY: One more trick. The code never asks the computer for the time directly.
- **a04b11** · DO: CLICK "ClockPort.java"; OPEN C04-E; HL `Instant now();`
  SAY: It asks this small interface, ClockPort.
- **a04b12** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/{J}/shared/domain`; CLICK "VirtualAnchoredClock.java"; OPEN C04-F; HL `return a.virtualInstant().plusNanos(elapsedRealNanos * a.scaleFactor());`
  SAY: The real implementation is a virtual clock. It multiplies elapsed time by a scale factor.
- **a04b13** · DO: HL `public void setScaleFactor(int newFactor) {`
  SAY: So in a demo, one real second can count as thirty, and I can watch a deadline approach.
- **a04b14** · DO: NOTE "Abstraction"; then CLOSE
  SAY: That is abstraction. The domain depends on an interface, not on the system clock.

---

## ACT 5 — INTAKE PIPELINE

### S05.1 · github + code · IntakePipeline.java
CARD **C05-A** · `{J}/incident/application/intake/IntakePipeline.java` · FROM `public class IntakePipeline {` · TO `return ctx;` (+2)

- **a05b01** · DO: GOTO `tree/<PINNED_SHA>/{J}/incident/application/intake`; HOLD on the file list
  SAY: Now the application layer. When a ticket comes in, it goes through this folder, the intake pipeline.
- **a05b02** · DO: CLICK "IntakePipeline.java"; OPEN C05-A; HL `.sorted(Comparator.comparingInt(IntakeStep::order))`
  SAY: The pipeline receives every step and sorts them by their order number.
- **a05b03** · DO: HL `for (IntakeStep step : sortedSteps) {`; HL `step.execute(ctx);`
  SAY: Then it runs them one after another, passing the same context object along.

### S05.2 · github · the nine steps
- **a05b04** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/{J}/incident/application/intake`; HOVER "ValidateStep.java", then "SanitizeRedactStep.java"
  SAY: There are nine steps. Validate checks the input. Sanitize strips HTML and hides emails and phone numbers.
- **a05b05** · DO: HOVER "CreateProvisionalIncidentStep.java", then "DuplicateCheckStep.java", then "CategoryAndServiceStep.java"
  SAY: Then we create the incident, link it to a master ticket if there is one, and pick a category.
- **a05b06** · DO: HOVER "EnrichStep.java", then "PriorityAndSlaStep.java", then "AssignStep.java", then "PersistAndPublishStep.java"
  SAY: Enrich looks for exam words, then come priority, assignment, and finally saving to the database.

### S05.3 · code · AbstractIntakeStep.java
CARD **C05-B** · `{J}/incident/application/intake/AbstractIntakeStep.java` · FROM `public final void execute(IntakeContext ctx) {` · TO `protected abstract void doExecute(IntakeContext ctx);`

- **a05b07** · DO: CLICK "AbstractIntakeStep.java"; OPEN C05-B; HL `public final void execute(IntakeContext ctx) {`
  SAY: All nine extend this abstract class. Its execute method is final.
- **a05b08** · DO: HL `log.warn("Error in intake step {}: {}", getClass().getSimpleName(), e.getMessage());`; HL `log.debug("Intake step {} completed in {}ms", getClass().getSimpleName(), duration.toMillis());`
  SAY: It handles timing and error logging the same way for every step.
  CUT: 3
- **a05b09** · DO: HL `protected abstract void doExecute(IntakeContext ctx);`
  SAY: Each step only fills in this one method, doExecute.
- **a05b10** · DO: NOTE "Template Method · Inheritance"
  SAY: The parent fixes the skeleton and the children fill the gap. That is the Template Method pattern.

### S05.4 · code · ValidateStep.java
CARD **C05-C** · `{J}/incident/application/intake/ValidateStep.java` · FROM `protected void doExecute(IntakeContext ctx) {` · TO `throw new InvalidIncidentPayloadException("description", "Description length must be between 10 and 4000 characters");` (+1)

- **a05b11** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/{J}/incident/application/intake`; CLICK "ValidateStep.java"; OPEN C05-C; HL `ctx.rawTitle.trim().length() < 5`
  SAY: For example, step one refuses a title under five characters before anything else happens.
  CUT: 1

### S05.5 · code · PriorityAndSlaStep.java
CARD **C05-D** · `{J}/incident/application/intake/PriorityAndSlaStep.java` · FROM `PriorityResult result = priorityStrategy.calculate(in);` · TO `ctx.incident.declareMajor(Actors.SYSTEM, p1Sla, now, calendar);` (+1)

- **a05b12** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/{J}/incident/application/intake`; CLICK "PriorityAndSlaStep.java"; OPEN C05-D; HL `PriorityResult result = priorityStrategy.calculate(in);`
  SAY: Step seven is the interesting one. It asks a priority strategy to calculate the priority.
- **a05b13** · DO: HL `SlaSnapshot sla = slaPolicyResolver.resolve(tier, result.priority());`
  SAY: Then it looks up the SLA policy for that service tier and priority.
- **a05b14** · DO: HL `ctx.incident.classify(`
  SAY: And it calls classify on the incident, which moves it from New to Classified.

### S05.6 · code · ItilMatrixPriorityStrategy.java
CARD **C05-E** · `{J}/incident/application/priority/ItilMatrixPriorityStrategy.java` · FROM `private static final Priority[][] MATRIX = {` · TO `"Impact " + in.impact() + " x Urgency " + in.urgency() + " -> " + base));`
CARD **C05-F** · same file · FROM `if (in.activeCalendarWindow()) {` · TO the 7th line of that block (the `}` that closes this `if`)

- **a05b15** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/{J}/incident/application/priority`; CLICK "ItilMatrixPriorityStrategy.java"; OPEN C05-E; HL `{Priority.P4, Priority.P4, Priority.P3},`; HL `{Priority.P4, Priority.P3, Priority.P2},`; HL `{Priority.P3, Priority.P2, Priority.P1}`
  SAY: The default strategy is a simple matrix of impact against urgency.
- **a05b16** · DO: OPEN C05-F; HL `if (in.activeCalendarWindow()) {`; HL `"Active exam/registration window (+1)"`
  SAY: After that come the bumps. During an exam window, the priority goes up one level.
- **a05b17** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/{J}/incident/application/priority`; HOVER "ItilMatrixPriorityStrategy.java", "ProductScorePriorityStrategy.java", "WeightedScorePriorityStrategy.java"; then HOVER "PriorityStrategy.java"
  SAY: There are three strategies behind one interface. That is the Strategy pattern.

---

## ACT 6 — COMMANDS

### S06.1 · code · IncidentCommandService.java
CARD **C06-A** · `{J}/incident/application/IncidentCommandService.java` · FROM `private void commitAndPublish(Incident incident) {` · TO the `}` that closes the `acknowledge` method · MUST SHOW `Incident inc = load(incidentId);`, `commandAuthorizer.authorize(inc, CommandType.ACKNOWLEDGE,`, `inc.acknowledge(actorId, now, calendar);`, `eventPublisher.publishEvent(event);`

- **a06b01** · DO: GOTO `tree/<PINNED_SHA>/{J}/incident/application`; CLICK "IncidentCommandService.java"; SCROLL "public void acknowledge"
  SAY: After intake, every action on a ticket goes through this class, IncidentCommandService.
- **a06b02** · DO: OPEN C06-A; HL `Incident inc = load(incidentId);`
  SAY: Every method has the same shape. Load the incident.
- **a06b03** · DO: HL `commandAuthorizer.authorize(inc, CommandType.ACKNOWLEDGE,`
  SAY: Check that this user is allowed.
- **a06b04** · DO: HL `inc.acknowledge(actorId, now, calendar);`
  SAY: Call the domain method we just saw.
- **a06b05** · DO: HL `commitAndPublish(inc);`; HL `incidentRepository.save(incident);`; HL `eventPublisher.publishEvent(event);`
  SAY: Then save it and publish its events, all inside one transaction.
- **a06b06** · DO: HL `@Transactional`
  SAY: If anything fails, nothing is saved.
  CUT: 3

### S06.2 · code · CommandAuthorizer.java
CARD **C06-B** · `{J}/incident/application/CommandAuthorizer.java` · FROM `public void authorize(Incident inc, CommandType cmd, UUID actorId, String role, String supportTier) {` · TO `throw new UnauthorizedOperationException(actorId, cmd.name());` (+2)

- **a06b07** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/{J}/incident/application`; CLICK "CommandAuthorizer.java"; OPEN C06-B; HL `boolean allowed = switch (cmd) {`
  SAY: And who is allowed? [question-en] That is decided here, in one switch.
- **a06b08** · DO: HL `case ACKNOWLEDGE, START_INVESTIGATION, REQUEST_USER_INFO, RESOLVE -> isAssignee;`
  SAY: Only the assigned technician can acknowledge or resolve.
- **a06b09** · DO: HL `case PROVIDE_USER_INFO, VERIFY, REJECT_RESOLUTION -> isReporter;`
  SAY: Only the student who reported it can verify or reject the fix.
- **a06b10** · DO: HL `case ASSIGN, DECLARE_MAJOR -> isTeamLead || isAdmin;`
  SAY: And only a team lead or an admin can declare a major incident.

### S06.3 · github + code · assignment strategies
CARD **C06-C** · `{J}/assignment/domain/AssignmentStrategy.java` · FROM `public interface AssignmentStrategy {` · TO `List<TechnicianCandidate> candidates` (+2)
CARD **C06-D** · `{J}/assignment/application/strategy/LeastLoadedStrategy.java` · FROM `List<TechnicianCandidate> eligible = StrategySupport.filterEligible(ownerTeamId, ticketWeight, requiredSkills, candidates);` · TO `double score = 1.0 - chosen.loadRatio();`

- **a06b11** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/{J}/assignment/domain`; CLICK "AssignmentStrategy.java"; OPEN C06-C; HL `public interface AssignmentStrategy {`
  SAY: Choosing the technician works the same way as priority. One interface, AssignmentStrategy.
- **a06b12** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/{J}/assignment/application/strategy`; move the cursor down the seven strategy files
  SAY: And seven implementations: round robin, least loaded, skill match, experience, and a few more.
- **a06b13** · DO: HOVER "HungarianBatchStrategy.java"
  SAY: There is even one that assigns a whole batch of tickets together.
  CUT: 1
- **a06b14** · DO: CLICK "LeastLoadedStrategy.java"; OPEN C06-D; HL `StrategySupport.filterEligible(`
  SAY: Least loaded first removes anyone who is off shift or already full.
- **a06b15** · DO: HL `.comparingDouble(TechnicianCandidate::loadRatio)`; HL `TechnicianCandidate chosen = eligible.get(0);`
  SAY: Then it sorts by load and takes the least busy person.
- **a06b16** · DO: NOTE "Strategy pattern again"; then CLOSE
  SAY: Because they share one interface, changing the strategy is a setting, not a code change.
  REQUIRES: A16

---

## ACT 7 — INFRASTRUCTURE

### S07.1 · code · IncidentController.java
CARD **C07-A** · `{J}/incident/infrastructure/web/IncidentController.java` · symbol `createIncident` · MUST SHOW `@PostMapping`, `intakeService.createIncident(`
CARD **C07-B** · same file · FROM `switch (command.toLowerCase()) {` · TO the `}` that closes the switch · MUST SHOW `case "acknowledge" -> commandService.acknowledge(`

- **a07b01** · DO: GOTO `tree/<PINNED_SHA>/{J}/incident/infrastructure`; HOVER "persistence", then "web"
  SAY: Now the outer layer, infrastructure. This is where the outside world connects.
- **a07b02** · DO: CLICK "web"; CLICK "IncidentController.java"; OPEN C07-A; HL `@PostMapping`
  SAY: IncidentController is the REST entry point. This method handles a new ticket.
- **a07b03** · DO: HL `intakeService.createIncident(`
  SAY: It reads the request, hands it to the intake service, and returns the created ticket.
- **a07b04** · DO: NOTE "No business rules here"
  SAY: Notice there are no business rules here. The controller only translates.
  CUT: 2
- **a07b05** · DO: OPEN C07-B; HL `switch (command.toLowerCase()) {`
  SAY: The second method takes the action name from the URL.
- **a07b06** · DO: HL `case "acknowledge" -> commandService.acknowledge(`
  SAY: A switch maps each name to the matching service method.
  CUT: 3

### S07.2 · code · JpaIncidentRepositoryAdapter.java
CARD **C07-C** · `{J}/incident/infrastructure/persistence/JpaIncidentRepositoryAdapter.java` · FROM `public Optional<Incident> findById(UUID id) {` · TO `return incident.withPersistedVersion(saved.getVersion());` (+1)

- **a07b07** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/{J}/incident/domain`; HOVER "IncidentRepository.java"
  SAY: For the database we use the same idea. The domain defines an interface called IncidentRepository.
- **a07b08** · DO: GOTO `tree/<PINNED_SHA>/{J}/incident/infrastructure/persistence`; CLICK "JpaIncidentRepositoryAdapter.java"; OPEN C07-C; HL `public Incident save(Incident incident) {`
  SAY: This adapter implements it with JPA.
- **a07b09** · DO: HL `Incident.restore(e.toSnapshot())`; HL `Incident.Snapshot snapshot = toSnapshot(incident);`
  SAY: It converts the incident to a snapshot and back, so the domain class has no database annotations.
- **a07b10** · DO: NOTE "Adapter · Ports and Adapters"
  SAY: This is the Adapter pattern. We could change the database without touching the domain.

### S07.3 · code · the audit ledger
CARD **C07-D** · `{J}/audit/infrastructure/AuditLedgerInTxListener.java` · FROM `@EventListener` · TO the line containing `FOR UPDATE` · MUST SHOW `@Transactional(propagation = Propagation.MANDATORY)`, `FOR UPDATE`
CARD **C07-E** · same file · MUST SHOW the line containing `String prevHash =` and the whole `AuditHasher.computeHash(` call
CARD **C07-F** · `{J}/audit/domain/AuditHasher.java` · FROM `public static String computeHash(` · TO `return HexFormat.of().formatHex(md.digest(raw.getBytes(StandardCharsets.UTF_8)));`
CARD **C07-G** · `backend/src/main/resources/db/migration/V003__audit_timers_ai.sql` · FROM `CREATE OR REPLACE FUNCTION audit_immutable() RETURNS trigger AS $$` · TO `FOR EACH STATEMENT EXECUTE FUNCTION audit_immutable();`

- **a07b11** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/{J}/audit`; CLICK "infrastructure"; HOVER "AuditLedgerInTxListener.java"
  SAY: Now my favourite part, the audit ledger.
- **a07b12** · DO: CLICK "AuditLedgerInTxListener.java"; OPEN C07-D; HL `@EventListener`; HL `@Transactional(propagation = Propagation.MANDATORY)`
  SAY: This listener hears every event, and it runs inside the same transaction as the change.
- **a07b13** · DO: HL `FOR UPDATE`
  SAY: It locks the incident row and reads the hash of the last entry.
- **a07b14** · DO: OPEN C07-E; HL `AuditHasher.computeHash(`
  SAY: Then it computes a new hash that includes that previous hash.
- **a07b15** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/{J}/audit/domain`; CLICK "AuditHasher.java"; OPEN C07-F; HL `String raw = String.join(SEP,`; HL `MessageDigest md = MessageDigest.getInstance("SHA-256");`
  SAY: The hasher joins the previous hash, the time, the actor, the action and the payload, then runs SHA-256.
- **a07b16** · DO: HL `prevHash != null ? prevHash : GENESIS_HASH,`; NOTE "Each entry is chained to the one before"
  SAY: So every entry is chained to the one before. Change one old row, and every later hash stops matching.
- **a07b17** · DO: CLOSE; HOLD on the GitHub file view
  SAY: But what stops someone from quietly editing the table itself? [question-en]
- **a07b18** · DO: GOTO `tree/<PINNED_SHA>/backend/src/main/resources/db/migration`; CLICK "V003__audit_timers_ai.sql"; OPEN C07-G; HL `CREATE TRIGGER audit_no_change BEFORE UPDATE OR DELETE OR TRUNCATE ON audit_record`
  SAY: The database itself refuses to update or delete audit rows. This trigger blocks it.

### S07.4 · code · SecurityConfig.java
CARD **C07-H** · `{J}/identity/infrastructure/security/SecurityConfig.java` · FROM `public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {` · TO `.build();` (+1) · MUST SHOW `"/api/v1/auth/login"`, `.requestMatchers("/api/v1/**").authenticated()`

- **a07b19** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/{J}/identity/infrastructure/security`; CLICK "SecurityConfig.java"; OPEN C07-H; HL `"/api/v1/auth/login"`; HL `.requestMatchers("/api/v1/**").authenticated()`
  SAY: Security is configured in one place. Login is open, and everything else needs a token.
- **a07b20** · DO: HL `"/api/v1/admin/**"`
  SAY: And the admin routes need the administrator role.
  REQUIRES: A15

### S07.5 · code · GlobalProblemDetailsHandler.java
CARD **C07-I** · `{J}/shared/infrastructure/web/GlobalProblemDetailsHandler.java` · FROM `@ExceptionHandler(ItsmException.class)` · TO `return ResponseEntity.status(status).body(problem);` (+1)

- **a07b21** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/{J}/shared/infrastructure/web`; CLICK "GlobalProblemDetailsHandler.java"; OPEN C07-I; HL `@ExceptionHandler(ItsmException.class)`
  SAY: Finally, errors. This handler catches any of our exceptions.
- **a07b22** · DO: HL `problem.setProperty("code", ex.code());`
  SAY: It turns them into a standard error response with our own error code.
- **a07b23** · DO: NOTE "Clear reason, no stack trace"; then CLOSE
  SAY: So the frontend always gets a clear reason, never a stack trace.
  CUT: 3

---

## ACT 8 — FRONTEND

### S08.1 · github · frontend folders
- **a08b01** · DO: GOTO `tree/<PINNED_SHA>/frontend/src`
  SAY: The frontend is much simpler. Let me go back and open it.
- **a08b02** · DO: HOVER "services", then "context", then "pages"
  SAY: Services talk to the backend, context holds login and live updates, and pages are the screens.

### S08.2 · code · api.ts
CARD **C08-A** · `{F}/services/api.ts` · symbol `request` · MUST SHOW `...getAuthHeader(),`, `if (!response.ok) {`, `throw err;`

- **a08b03** · DO: CLICK "services"; CLICK "api.ts"; OPEN C08-A; HL `...getAuthHeader(),`
  SAY: Every request goes through this one function. It attaches the login token.
- **a08b04** · DO: HL `if (!response.ok) {`; HL `throw err;`
  SAY: If the server sends an error, it throws it with the server's own message.

### S08.3 · code · AuthContext.tsx
CARD **C08-B** · `{F}/context/AuthContext.tsx` · symbol `switchUser` · MUST SHOW `api.auth.login(`, `localStorage.setItem('iitsm_jwt'`

- **a08b05** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/frontend/src/context`; CLICK "AuthContext.tsx"; OPEN C08-B; HL `api.auth.login(`; HL `localStorage.setItem('iitsm_jwt'`
  SAY: Switching user logs in again and stores the new token.
  CUT: 1

### S08.4 · code · PortalReport.tsx
CARD **C08-C** · `{F}/pages/portal/PortalReport.tsx` · symbol `handleSubmit` · MUST SHOW `api.incidents.create(`

- **a08b06** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/frontend/src/pages/portal`; CLICK "PortalReport.tsx"; SCROLL "const handleSubmit"; OPEN C08-C; HL `api.incidents.create(`
  SAY: This is the submit handler of the report form. It calls create with the title, description and service.

### S08.5 · code · WorkbenchDetail.tsx
CARD **C08-D** · `{F}/pages/workbench/WorkbenchDetail.tsx` · the action-bar block · MUST SHOW the line that tests the allowed list for `ACKNOWLEDGE` and the Acknowledge button's `onClick`

- **a08b07** · DO: CLOSE; GOTO `tree/<PINNED_SHA>/frontend/src/pages/workbench`; CLICK "WorkbenchDetail.tsx"; SCROLL "PERMITTED ACTIONS"; OPEN C08-D; HL the line that tests the allowed list for `ACKNOWLEDGE`
  SAY: And this is the technician screen. A button is drawn only if its action is in the allowed list.
- **a08b08** · DO: NOTE "The backend decides what is legal"
  SAY: That list comes from the state object in the backend. The frontend never decides what is legal.
- **a08b09** · DO: CLOSE; cursor moves up to the browser tabs
  SAY: Okay, enough code. [sigh] Let's actually run it.

---

## ACT 9 — LIVE DEMO

Before recording this act: `demo-reset`, then `demo-seed` (addendum A27). Record the act as one continuous session.

### S09.1 · app · the student reports a problem
- **a09b01** · DO: switch to the app tab; Student Portal home; POINT the user chip "Aarav"
  SAY: I am logged in as Aarav, a student.
- **a09b02** · DO: CLICK "Report New Incident"
  SAY: His Moodle quiz will not open, so he reports it.
- **a09b03** · DO: TYPE title (section 2); TYPE description (section 2); WAIT copilot panel shows a service; make sure the service dropdown shows `APP-LMS`; POINT the service suggestion
  SAY: As I type, the copilot reads the text and suggests the affected service, Moodle LMS.
- **a09b04** · DO: PICK urgency "High"; move the cursor onto "Submit Incident"; CLICK it (event label `T1-submit`)
  SAY: I set the urgency to high, and submit.

### S09.2 · trace · T1-submit (the picture freezes on the frame right after the click)
- **a09b05** · DO: HOP `{F}/pages/portal/PortalReport.tsx` · `handleSubmit` · HL `api.incidents.create(`
  SAY: Pause. This click runs the submit handler I showed you.
- **a09b06** · DO: HOP `{F}/services/api.ts` · `incidents.create` · HL `method: 'POST',`
  SAY: It sends a POST request to the incidents route.
- **a09b07** · DO: HOP `{J}/incident/infrastructure/web/IncidentController.java` · `createIncident` · HL `intakeService.createIncident(`
  SAY: The controller receives it and calls the intake service.
- **a09b08** · DO: HOP `{J}/incident/application/intake/IntakePipeline.java` · `process` · HL `step.execute(ctx);`
  SAY: The pipeline runs its nine steps.
- **a09b09** · DO: HOP `{J}/incident/domain/Incident.java` · `createWithNumber` · HL `i.pending.add(new IncidentCreated(`
  SAY: Step three calls the factory method, which checks the rules and records the event.
- **a09b10** · DO: HOP `{J}/incident/application/intake/PersistAndPublishStep.java` · `doExecute` · HL `incidentRepository.save(ctx.incident);`
  SAY: Step nine saves the ticket and publishes its events.
- **a09b11** · DO: HOP `{J}/audit/infrastructure/AuditLedgerInTxListener.java` · `onDomainEvent` · HL `AuditHasher.computeHash(`
  SAY: And the audit listener writes the first links of the hash chain.

Breadcrumb for T1: `PortalReport.tsx › api.ts › IncidentController › IntakePipeline › Incident › PersistAndPublishStep › AuditLedgerInTxListener`

### S09.3 · app · the result
- **a09b12** · DO: popups close, clip resumes; WAIT ticket page ▶ POINT the state badge `ASSIGNED`; POINT the assignee name
  SAY: And here is the result. [confirmation-en] The ticket is already assigned to a technician.
- **a09b13** · DO: POINT the priority badge `P2`
  SAY: It came out as priority two. The word quiz triggered the exam bump we saw in the matrix.
- **a09b14** · DO: POINT the response and resolution due times
  SAY: For this service and priority, the policy gives fifteen minutes to respond and two hours to resolve.
  CUT: 1
- **a09b15** · DO: SCROLL to the timeline; POINT the first hash pill
  SAY: Below is the timeline, with one hashed entry for each step so far.
  CUT: 3

### S09.4 · app · the technician acknowledges
- **a09b16** · DO: USER "<assignee name>"; CLICK "Workbench"
  SAY: Now I switch to the technician it was assigned to.
- **a09b17** · DO: CLICK the ticket row in "My queue"; POINT the row of action buttons
  SAY: The ticket is in his queue. There is no Resolve button yet, because the state does not allow it.
- **a09b18** · DO: move the cursor onto the Acknowledge button; CLICK it (event label `T2-ack`)
  SAY: He clicks acknowledge.

### S09.5 · trace · T2-ack
- **a09b19** · DO: HOP `{F}/pages/workbench/WorkbenchDetail.tsx` · `runCommand` · HL `api.incidents.command(incidentId,`
  SAY: The button calls runCommand, which posts the action name.
- **a09b20** · DO: HOP `{J}/incident/infrastructure/web/IncidentController.java` · `executeCommand` · HL `case "acknowledge" -> commandService.acknowledge(`
  SAY: The controller's switch picks the acknowledge method.
- **a09b21** · DO: HOP `{J}/incident/application/IncidentCommandService.java` · `acknowledge` · HL `commandAuthorizer.authorize(inc, CommandType.ACKNOWLEDGE,`
  SAY: The service loads the ticket and asks the authorizer.
- **a09b22** · DO: HOP `{J}/incident/application/CommandAuthorizer.java` · `authorize` · HL `case ACKNOWLEDGE, START_INVESTIGATION, REQUEST_USER_INFO, RESOLVE -> isAssignee;`
  SAY: He is the assignee, so it passes.
- **a09b23** · DO: HOP `{J}/incident/domain/AssignedState.java` · `acknowledge` · HL `inc.stopResponse(now, cal, true);`
  SAY: AssignedState stops the response clock and returns the next state.

Breadcrumb for T2: `WorkbenchDetail.tsx › IncidentController › IncidentCommandService › CommandAuthorizer › AssignedState`

### S09.6 · app · investigation and a question for the student
- **a09b24** · DO: popups close, clip resumes ▶ POINT the state badge `ACKNOWLEDGED`
  SAY: The state is now Acknowledged, and the response clock has stopped.
- **a09b25** · DO: CLICK the Start Investigation button; WAIT state `IN_PROGRESS`
  SAY: He starts the investigation, and the state becomes In Progress.
- **a09b26** · DO: CLICK the Request User Info button; TYPE question (section 2) into the modal; CLICK the modal's confirm button (event label `T3-pause`)
  SAY: He needs more details, so he asks the student a question.

### S09.7 · trace · T3-pause
- **a09b27** · DO: HOP `{J}/incident/domain/InProgressState.java` · `requestUserInfo` · HL `inc.pauseResolution(now, cal);`
  SAY: In the code, InProgressState pauses the resolution clock.
- **a09b28** · DO: HOP `{J}/incident/domain/SlaClock.java` · `pause` · HL `return new SlaClock(ClockState.PAUSED, consumedMs + delta, lastResumeAt, targetMs, mode);`
  SAY: That is the pause method from earlier, returning a paused clock.

Breadcrumb for T3: `WorkbenchDetail.tsx › InProgressState › SlaClock`

### S09.8 · app · the student answers
- **a09b29** · DO: popups close, clip resumes ▶ POINT the state badge `PENDING_USER`
  SAY: So while we wait for the student, the technician is not blamed for the delay.
  CUT: 3
- **a09b30** · DO: USER "Aarav Sharma"; CLICK "Student Portal"; CLICK the ticket row; POINT the banner asking for input
  SAY: Back to Aarav. He sees the question and answers it.
- **a09b31** · DO: TYPE answer (section 2); CLICK the send button; WAIT state `IN_PROGRESS` ▶ POINT the state badge
  SAY: The state goes back to In Progress, and the clock runs again.

### S09.9 · app · the technician resolves
- **a09b32** · DO: USER "<assignee name>"; CLICK "Workbench"; CLICK the ticket row; CLICK the Resolve button; fill the modal (section 2)
  SAY: The technician fixes the problem and resolves the ticket with a proper note.
- **a09b33** · DO: POINT the notes field while the text is still visible; then CLICK the modal's confirm button; WAIT state `RESOLVED`
  SAY: The note needs at least twenty characters. A lazy note like "done" is rejected by the domain. [dissatisfaction-hnn]

### S09.10 · app + trace · the student confirms (T4-verify)
- **a09b34** · DO: USER "Aarav Sharma"; CLICK "Student Portal"; CLICK the ticket row; CLICK the fifth star; CLICK the confirm-fix button (event label `T4-verify`)
  SAY: Aarav checks Moodle, gives five stars, and confirms the fix.
- **a09b35** · DO: HOP `{F}/pages/portal/PortalDetail.tsx` · `handleVerifyResolution` · HL the line that sends `'verify'`
  SAY: This sends the verify action with the rating.
- **a09b36** · DO: HOP `{J}/incident/domain/ResolvedState.java` · `verify` · HL `if (!inc.reporterId().equals(actor) && !Actors.SYSTEM.equals(actor)) {`
  SAY: ResolvedState checks that he is the reporter, then moves the ticket to Verified.

Breadcrumb for T4: `PortalDetail.tsx › IncidentController › ResolvedState`

### S09.11 · app · closing the ticket
- **a09b37** · DO: popups close, clip resumes ▶ POINT the state badge `VERIFIED`
  SAY: The ticket is now Verified.
- **a09b38** · DO: USER "<assignee name>"; CLICK "Workbench"; CLICK the ticket row ▶ CLICK the Close button; WAIT state `CLOSED`; POINT the state badge
  SAY: Finally the technician closes it. [confirmation-en] The ticket is closed, and the state allows no further moves.
- **a09b39** · DO: SCROLL to the timeline; move the cursor slowly down the entries
  SAY: And the timeline shows the full story: who did what, when, and the hash of each entry.
  REQUIRES: A14
  ALT: And the timeline shows the full story, step by step, with the hash of each entry.

---

## ACT 10 — PROOF

### S10.1 · terminal · an illegal move
Setup, not shown: log in through the API as the assigned technician and store the token in `TOKEN`; store the demo ticket's id in `ID`.
Shown command:
```
curl -s -X POST http://localhost:8080/api/v1/incidents/$ID/commands/close -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"closureNote":"closing it again"}' | python -m json.tool
```
Expected real output: a JSON problem body with `"status": 409`, `"code": "ITSM-4090"`, `"currentState": "CLOSED"`, `"attemptedCommand": "CLOSE"`.

- **a10b01** · DO: terminal card opens over the app; cursor in the prompt
  SAY: Now let me try to cheat. I will ask the server to close that ticket again.
- **a10b02** · DO: RUN the shown command ▶ POINT `"status": 409`; POINT `"currentState": "CLOSED"`
  SAY: The server says no. [surprise-oh] Error 409, with the current state and the command I tried.
- **a10b03** · DO: POINT `"code": "ITSM-4090"`
  SAY: That is the default method in IncidentState, doing its job.
  CUT: 3

### S10.2 · app + trace · verifying the ledger (T5-ledger)
- **a10b04** · DO: terminal closes; USER "Suresh Deshmukh"; CLICK the admin tab; CLICK "SHA-256 Audit Ledger"; CLICK the verify button (event label `T5-ledger`)
  SAY: Next, the audit ledger. As the admin, I ask the server to verify every chain.
- **a10b05** · DO: HOP `{J}/audit/domain/AuditHasher.java` · `verifyIncidentChain` · HL `if (!recomputed.equals(r.hash())) {`
  SAY: It recomputes every hash and compares it with the stored one.
- **a10b06** · DO: popup closes, clip resumes ▶ POINT the result that says the ledger is valid
  SAY: Every entry is valid.

Breadcrumb for T5: `AdminAudit.tsx › AdminController › AuditVerificationAdapter › AuditHasher`

### S10.3 · terminal · trying to edit the log
Shown command, when the demo database is the Docker one:
```
docker compose -f deploy/docker-compose.yml exec db psql -U itsm_owner -d iitsm -c "UPDATE audit_record SET description = 'edited' WHERE id = 1;"
```
When the demo database is on Neon, the same SQL through `psql "<demo connection string>" -c "…"` with the password hidden in the card.
Expected real output: `ERROR:  audit_record is append-only`.

- **a10b07** · DO: terminal card opens; RUN the shown command
  SAY: Now I try to change an old entry directly in the database.
- **a10b08** · DO: POINT `audit_record is append-only`
  SAY: The database refuses. [laughter] The audit table is append only.

### S10.4 · terminal · the tests
Shown commands, one card each:
```
bash scripts/verify-m1.sh
```
```
mvn -f backend/pom.xml test -Dtest=ArchitectureTest
```
Put Maven's `bin` folder on `PATH` for the session so the command runs exactly as shown.

- **a10b09** · DO: RUN `bash scripts/verify-m1.sh`
  SAY: Last, the tests. This script fires fifty thousand random command sequences at the state machine.
- **a10b10** · DO: POINT the line `SUMMARY: 24 passed, 0 failed (554590 transitions verified)`
  SAY: Twenty-four checks pass, covering more than five hundred and fifty thousand transitions, in a few seconds.
- **a10b11** · DO: RUN `mvn -f backend/pom.xml test -Dtest=ArchitectureTest` ▶ POINT `BUILD SUCCESS`
  SAY: And the architecture rules I showed at the start all pass too.

---

## ACT 11 — TEAM

### S11.1 · title · the team card
TITLE card text (from `02_script/team.json`; shown, not spoken):
```
INCIDENT-ZERO · GROUP 76
Object-Oriented Programming · BITS Pilani, Hyderabad Campus

Srijan Shukla    domain core, incident state machine, audit ledger
Suhani Agarwal   SLA clock, business calendar, SLA policies
Kartikey Negi    service catalogue and dependency data, major-incident flow
Harish Kumar     frontend, REST controllers
```

- **a11b01** · DO: TITLE; names appear one by one in the order they are spoken
  SAY: That is Incident-Zero. It was built by Group 76: Suhani Agarwal, Kartikey Negi, Harish Kumar, and me, Srijan Shukla.

### S11.2 · github · closing shot
- **a11b02** · DO: GitHub tab, repo home (plain URL); slow scroll over the readme banner
  SAY: The object-oriented ideas were not decoration. Encapsulation, inheritance, polymorphism and abstraction each solved a real problem here.
- **a11b03** · DO: scroll back to the top; POINT the address bar
  SAY: The code is on GitHub, at the address on screen. Thank you for watching.

---

## 12. TRACE SUMMARY (for building the overlays)

| Trace | Clicked control | Hops (beats) |
|---|---|---|
| T1-submit | Submit Incident | a09b05 to a09b11 (7 hops) |
| T2-ack | Acknowledge | a09b19 to a09b23 (5 hops) |
| T3-pause | confirm button of the Request User Info modal | a09b27, a09b28 (2 hops) |
| T4-verify | confirm-fix button on the student's ticket page | a09b35, a09b36 (2 hops) |
| T5-ledger | verify button on the audit ledger page | a10b05 (1 hop) |

For every trace: freeze on the first frame after the click, ring on the clicked control, at most two popups visible, breadcrumb as listed, then resume from the frozen frame.

---

## 13. FACTS SPOKEN IN THIS SCRIPT (pre-approved; verify each and copy to `truth_sheet.md`)

| Spoken fact | Where to verify |
|---|---|
| Group 76; four member names | `02_script/team.json` (confirmed by Srijan) |
| One Java backend, one React app, one PostgreSQL database | `README.md`, section "What is Incident-Zero?" |
| Fifteen decision records | `docs/adr/ADR-001.md` … `ADR-015.md` |
| Workflow runs checks on every push | `.github/workflows/ci.yml` (`on: push: branches: ["*"]`) |
| Title 5 to 200 characters; description at least 10; impact and urgency 1 to 3 | `Incident.createWithNumber` |
| Exactly eleven state classes | `permits` clause of `IncidentState` |
| Fourteen other error classes (fifteen concrete in total) | `{J}/shared/domain/error/` (16 files including the abstract base) |
| Rating between one and five; only the reporter verifies | `ResolvedState.verify` |
| At risk at seventy-five percent; breach is permanent | `Incident.refreshSla` |
| One real second can count as thirty | `VirtualAnchoredClock.setScaleFactor`; the header toggle sends `30` (`Header.tsx`, `toggleDemoClock`) |
| Nine intake steps, their order and what each does | `order()` in each file under `{J}/incident/application/intake/` |
| Sanitize strips HTML and hides emails and phone numbers | `SanitizeRedactStep` |
| Enrich looks for exam words | `EnrichStep` (`quiz`, `exam`, `registration`) |
| Step seven is priority; step three creates the incident; step nine saves | `PriorityAndSlaStep.order()`, `CreateProvisionalIncidentStep.order()`, `PersistAndPublishStep.order()` |
| Exam window bumps the priority one level | `ItilMatrixPriorityStrategy`, rule `CALENDAR_WINDOW` |
| Three priority strategies | `{J}/incident/application/priority/` |
| Seven assignment strategies; one assigns a batch | `{J}/assignment/application/strategy/` |
| Who may acknowledge, resolve, verify, reject, declare major | `CommandAuthorizer.authorize` |
| Least loaded removes off-shift or full technicians, then sorts by load | `StrategySupport.filterEligible`, `LeastLoadedStrategy` |
| Hash covers previous hash, time, actor, action, payload; SHA-256 | `AuditHasher.computeHash` |
| Trigger blocks update and delete on audit rows | `V003__audit_timers_ai.sql`, trigger `audit_no_change` |
| Login is open, everything else needs a token; admin routes need the admin role | `SecurityConfig` (admin rule after fix A15) |
| Demo ticket becomes priority two | `MATRIX[1][1]` = P3, plus the `CALENDAR_WINDOW` bump; confirm on the running app |
| Fifteen minutes to respond, two hours to resolve | `R__campus_seed.sql`, `sla_policy` row T1 / P2 (15, 120) |
| Resolution note needs at least twenty characters | `Resolution` record constructor |
| Error 409 with current state and attempted command | `InvalidStateTransitionException`, `GlobalProblemDetailsHandler` |
| Fifty thousand random command sequences | `backend/src/test/java/Verify.java`, fuzzing section |
| Twenty-four checks; more than five hundred and fifty thousand transitions | output of `bash scripts/verify-m1.sh` (`24 passed`, `554590 transitions`) |
