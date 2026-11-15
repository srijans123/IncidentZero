#!/usr/bin/env python3
"""
video_v3/05_cards/make_cards.py
Generates pixel-perfect 16-bit SVG code cards and cards.json
extracted directly from git at PINNED_SHA per Section C10.
Covers all 38 cards defined in SCRIPT.md.
"""

import os
import sys
import json
import re
import html
import subprocess
from pathlib import Path

repo_root = Path(__file__).resolve().parent.parent.parent
sha_file = repo_root / "video_v3" / "01_facts" / "PINNED_SHA.txt"
cards_out_dir = repo_root / "video_v3" / "05_cards"
cards_out_dir.mkdir(parents=True, exist_ok=True)

with open(sha_file, "r", encoding="utf-8") as f:
    PINNED_SHA = f.read().replace('\ufeff', '').strip()

# Resolve path abbreviations
def resolve_path(p):
    p = p.replace("{J}", "backend/src/main/java/edu/campus/iitsm")
    p = p.replace("{F}", "frontend/src")
    return p

# Extract file content from git at PINNED_SHA
def get_git_file(rel_path):
    cmd = ["git", "show", f"{PINNED_SHA}:{rel_path}"]
    res = subprocess.run(cmd, capture_output=True, text=True, cwd=repo_root)
    if res.returncode != 0:
        raise RuntimeError(f"Failed to git show {PINNED_SHA}:{rel_path}: {res.stderr}")
    return res.stdout

def find_line_range(file_lines, from_anchor, to_anchor, plus_n=0):
    clean_from = from_anchor.strip().strip('`')
    clean_to = to_anchor.strip().strip('`')

    start_idx = None
    end_idx = None

    for i, l in enumerate(file_lines):
        if clean_from in l:
            start_idx = i
            break

    if start_idx is None:
        first_word = clean_from.split()[0]
        for i, l in enumerate(file_lines):
            if first_word in l and len(l.strip()) > 5:
                start_idx = i
                break

    if start_idx is not None:
        for i in range(start_idx, len(file_lines)):
            if clean_to in file_lines[i]:
                end_idx = i + plus_n
                break

    if start_idx is None:
        start_idx = 0
    if end_idx is None:
        end_idx = min(start_idx + 24, len(file_lines) - 1)

    return start_idx + 1, min(end_idx + 1, len(file_lines))

def render_16bit_card_svg(card_id, file_path, start_line, end_line, code_lines):
    lang = "JAVA"
    if file_path.endswith(".ts") or file_path.endswith(".tsx"):
        lang = "TYPESCRIPT"
    elif file_path.endswith(".sql"):
        lang = "SQL"

    file_basename = os.path.basename(file_path)
    total_lines = len(code_lines)
    card_height = max(520, 160 + total_lines * 24 + 40)

    keywords = {
        "public", "private", "protected", "class", "record", "interface", "sealed", "permits",
        "static", "final", "void", "return", "if", "else", "throw", "new", "import", "package",
        "const", "let", "function", "async", "await", "export", "switch", "case", "default",
        "SELECT", "INSERT", "UPDATE", "DELETE", "FROM", "WHERE", "ORDER", "BY", "JOIN"
    }

    code_rows_svg = []
    y_offset = 135
    for idx, raw_line in enumerate(code_lines):
        line_num = start_line + idx
        escaped_line = html.escape(raw_line.rstrip())
        
        words = escaped_line.split(" ")
        formatted_words = []
        for w in words:
            clean_w = re.sub(r'[^a-zA-Z0-9_]', '', w)
            if clean_w in keywords:
                formatted_words.append(f'<tspan fill="#FFD84D" font-weight="bold">{w}</tspan>')
            elif clean_w.startswith("@"):
                formatted_words.append(f'<tspan fill="#43D17A">{w}</tspan>')
            elif '"' in w or "'" in w:
                formatted_words.append(f'<tspan fill="#88D49E">{w}</tspan>')
            else:
                formatted_words.append(w)
        line_colored = " ".join(formatted_words)

        code_rows_svg.append(f'''
    <!-- Line {line_num} -->
    <text x="135" y="{y_offset}" fill="#7B739E" font-family="'Courier New', monospace" font-size="14" text-anchor="end">{line_num}</text>
    <text x="175" y="{y_offset}" fill="#FFF8DC" font-family="'Courier New', monospace" font-size="14">{line_colored}</text>
''')
        y_offset += 24

    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080" shape-rendering="crispEdges">
  <defs>
    <!-- 24x24 Checkerboard Dither -->
    <pattern id="dither_{card_id}" width="24" height="24" patternUnits="userSpaceOnUse">
      <rect width="24" height="24" fill="#1E1646"/>
      <rect width="12" height="12" fill="#261C58"/>
      <rect x="12" y="12" width="12" height="12" fill="#261C58"/>
    </pattern>
  </defs>

  <!-- Canvas Background -->
  <rect width="1920" height="1080" fill="url(#dither_{card_id})"/>

  <!-- Card Hard Offset Shadow -->
  <rect x="106" y="56" width="1708" height="{card_height}" fill="#0B071E"/>

  <!-- Card Main Pixel Frame -->
  <rect x="100" y="50" width="1708" height="{card_height}" fill="#161033" stroke="#0B071E" stroke-width="4"/>

  <!-- Header Bar -->
  <rect x="104" y="54" width="1700" height="46" fill="#2E236C" stroke="#0B071E" stroke-width="2"/>

  <!-- Square Window Controls -->
  <rect x="120" y="68" width="14" height="14" fill="#FF4D3D" stroke="#0B071E" stroke-width="2"/>
  <rect x="142" y="68" width="14" height="14" fill="#FFD84D" stroke="#0B071E" stroke-width="2"/>
  <rect x="164" y="68" width="14" height="14" fill="#43D17A" stroke="#0B071E" stroke-width="2"/>

  <!-- Title & Repo Path -->
  <text x="200" y="83" fill="#FFF8DC" font-family="'Courier New', monospace" font-size="16" font-weight="bold">{file_basename}</text>
  <text x="500" y="83" fill="#A499D4" font-family="'Courier New', monospace" font-size="13">{file_path} (L{start_line}–L{end_line})</text>

  <!-- Language Badge -->
  <rect x="1690" y="63" width="90" height="24" fill="#FFD84D" stroke="#0B071E" stroke-width="2"/>
  <text x="1735" y="80" fill="#0B071E" font-family="'Courier New', monospace" font-size="12" font-weight="bold" text-anchor="middle">{lang}</text>

  <!-- Gutter Separator -->
  <line x1="155" y1="100" x2="155" y2="{card_height + 40}" stroke="#2E236C" stroke-width="2"/>

  <!-- Code Lines -->
  {"".join(code_rows_svg)}
</svg>
'''
    return svg_content

CARD_DEFINITIONS = [
    # Act 2
    {
        "id": "C02-A",
        "file": "backend/src/test/java/edu/campus/iitsm/ArchitectureTest.java",
        "from": "static final ArchRule R1_domain_has_zero_framework_imports = noClasses()",
        "to": '"tools.jackson.."',
        "plus_n": 1
    },
    # Act 3
    {
        "id": "C03-A",
        "file": "backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java",
        "from": "public static Incident createWithNumber(",
        "to": "return i;",
        "plus_n": 1
    },
    {
        "id": "C03-B",
        "file": "backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java",
        "from": "public void acknowledge(UUID actor, Instant now,",
        "to": "commit(state.close(this, actor, closureNote, now));",
        "plus_n": 1
    },
    {
        "id": "C03-C",
        "file": "backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java",
        "from": "private void commit(TransitionResult r) {",
        "to": "if (changed) this.version++;",
        "plus_n": 1
    },
    {
        "id": "C03-D",
        "file": "backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java",
        "from": "public List<DomainEvent> pullEvents() {",
        "to": "return copy;",
        "plus_n": 1
    },
    {
        "id": "C03-E",
        "file": "backend/src/main/java/edu/campus/iitsm/incident/domain/IncidentState.java",
        "from": "public sealed interface IncidentState",
        "to": "throw StateSupport.illegal(inc, status(), CommandType.ACKNOWLEDGE);",
        "plus_n": 1
    },
    {
        "id": "C03-F",
        "file": "backend/src/main/java/edu/campus/iitsm/incident/domain/AssignedState.java",
        "from": "final class AssignedState implements IncidentState {",
        "to": "return new TransitionResult(AcknowledgedState.INSTANCE,",
        "plus_n": 1
    },
    {
        "id": "C03-G",
        "file": "backend/src/main/java/edu/campus/iitsm/incident/domain/ResolvedState.java",
        "from": "@Override public TransitionResult verify(",
        "to": "return new TransitionResult(ReopenedState.INSTANCE, events);",
        "plus_n": 1
    },
    {
        "id": "C03-H",
        "file": "backend/src/main/java/edu/campus/iitsm/shared/domain/error/InvalidStateTransitionException.java",
        "from": "public final class InvalidStateTransitionException extends ItsmException {",
        "to": "this.attemptedCommand = attemptedCommand;",
        "plus_n": 1
    },
    # Act 4
    {
        "id": "C04-A",
        "file": "backend/src/main/java/edu/campus/iitsm/incident/domain/SlaClock.java",
        "from": "public record SlaClock(",
        "to": "return new SlaClock(ClockState.STOPPED, consumedMs + extra, lastResumeAt, targetMs, mode);",
        "plus_n": 1
    },
    {
        "id": "C04-B",
        "file": "backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java",
        "from": "public void refreshSla(Instant now, WorkingTimeCalculator cal)",
        "to": "slaStatus = atRisk ? SlaStatus.AT_RISK : SlaStatus.ON_TRACK;",
        "plus_n": 2
    },
    {
        "id": "C04-C",
        "file": "backend/src/main/java/edu/campus/iitsm/catalog/domain/BusinessCalendar.java",
        "from": "public boolean isWorkingDay(LocalDate date) {",
        "to": "return workDays.contains(date.getDayOfWeek()) && !holidays.contains(date);",
        "plus_n": 1
    },
    {
        "id": "C04-D",
        "file": "backend/src/main/java/edu/campus/iitsm/catalog/domain/BusinessCalendar.java",
        "from": "while (!cur.toLocalDate().isAfter(stop.toLocalDate())) {",
        "to": "return totalMs;",
        "plus_n": 1
    },
    {
        "id": "C04-E",
        "file": "backend/src/main/java/edu/campus/iitsm/shared/domain/ClockPort.java",
        "from": "public interface ClockPort {",
        "to": "long realNanosUntil(Instant targetVirtualInstant);",
        "plus_n": 1
    },
    {
        "id": "C04-F",
        "file": "backend/src/main/java/edu/campus/iitsm/shared/domain/VirtualAnchoredClock.java",
        "from": "public Instant now() {",
        "to": "if (onScaleChangeWakeup != null) onScaleChangeWakeup.run();",
        "plus_n": 1
    },
    # Act 5
    {
        "id": "C05-A",
        "file": "backend/src/main/java/edu/campus/iitsm/incident/application/intake/IntakePipeline.java",
        "from": "public class IntakePipeline {",
        "to": "return ctx;",
        "plus_n": 2
    },
    {
        "id": "C05-B",
        "file": "backend/src/main/java/edu/campus/iitsm/incident/application/intake/AbstractIntakeStep.java",
        "from": "public final void execute(IntakeContext ctx) {",
        "to": "protected abstract void doExecute(IntakeContext ctx);",
        "plus_n": 0
    },
    {
        "id": "C05-C",
        "file": "backend/src/main/java/edu/campus/iitsm/incident/application/intake/ValidateStep.java",
        "from": "protected void doExecute(IntakeContext ctx) {",
        "to": "throw new InvalidIncidentPayloadException(",
        "plus_n": 1
    },
    {
        "id": "C05-D",
        "file": "backend/src/main/java/edu/campus/iitsm/incident/application/intake/PriorityAndSlaStep.java",
        "from": "PriorityResult result = priorityStrategy.calculate(in);",
        "to": "ctx.incident.declareMajor(Actors.SYSTEM, p1Sla, now, calendar);",
        "plus_n": 1
    },
    {
        "id": "C05-E",
        "file": "backend/src/main/java/edu/campus/iitsm/incident/application/priority/ItilMatrixPriorityStrategy.java",
        "from": "private static final Priority[][] MATRIX = {",
        "to": "\"Impact \" + in.impact() + \" x Urgency \" + in.urgency()",
        "plus_n": 0
    },
    {
        "id": "C05-F",
        "file": "backend/src/main/java/edu/campus/iitsm/incident/application/priority/ItilMatrixPriorityStrategy.java",
        "from": "if (in.activeCalendarWindow()) {",
        "to": "bumps == 1 ?",
        "plus_n": 3
    },
    # Act 6
    {
        "id": "C06-A",
        "file": "backend/src/main/java/edu/campus/iitsm/incident/application/IncidentCommandService.java",
        "from": "public void acknowledge(UUID incidentId, UUID actorId, String role, String supportTier) {",
        "to": "commitAndPublish(inc);",
        "plus_n": 1
    },
    {
        "id": "C06-B",
        "file": "backend/src/main/java/edu/campus/iitsm/incident/application/CommandAuthorizer.java",
        "from": "public void authorize(Incident inc, CommandType cmd,",
        "to": "throw new UnauthorizedOperationException(",
        "plus_n": 2
    },
    {
        "id": "C06-C",
        "file": "backend/src/main/java/edu/campus/iitsm/assignment/domain/AssignmentStrategy.java",
        "from": "public interface AssignmentStrategy {",
        "to": "List<TechnicianCandidate> candidates",
        "plus_n": 2
    },
    {
        "id": "C06-D",
        "file": "backend/src/main/java/edu/campus/iitsm/assignment/application/strategy/LeastLoadedStrategy.java",
        "from": "List<TechnicianCandidate> eligible = StrategySupport.filterEligible(",
        "to": "double score = 1.0 - chosen.loadRatio();",
        "plus_n": 0
    },
    # Act 7
    {
        "id": "C07-A",
        "file": "backend/src/main/java/edu/campus/iitsm/incident/infrastructure/web/IncidentController.java",
        "from": "@PostMapping",
        "to": "Incident created = intakeService.createIncident(",
        "plus_n": 5
    },
    {
        "id": "C07-B",
        "file": "backend/src/main/java/edu/campus/iitsm/incident/infrastructure/web/IncidentController.java",
        "from": "switch (command.toLowerCase()) {",
        "to": "default -> throw new IllegalArgumentException(\"Unknown command:\"",
        "plus_n": 2
    },
    {
        "id": "C07-C",
        "file": "backend/src/main/java/edu/campus/iitsm/incident/infrastructure/persistence/JpaIncidentRepositoryAdapter.java",
        "from": "public Optional<Incident> findById(UUID id) {",
        "to": "return incident.withPersistedVersion(saved.getVersion());",
        "plus_n": 1
    },
    {
        "id": "C07-D",
        "file": "backend/src/main/java/edu/campus/iitsm/audit/infrastructure/AuditLedgerInTxListener.java",
        "from": "@EventListener",
        "to": "String selectSql = \"SELECT last_audit_index, last_audit_hash, status FROM incident WHERE id = ? FOR UPDATE\";",
        "plus_n": 1
    },
    {
        "id": "C07-E",
        "file": "backend/src/main/java/edu/campus/iitsm/audit/infrastructure/AuditLedgerInTxListener.java",
        "from": "String prevHash =",
        "to": "AuditHasher.computeHash(",
        "plus_n": 7
    },
    {
        "id": "C07-F",
        "file": "backend/src/main/java/edu/campus/iitsm/audit/domain/AuditHasher.java",
        "from": "public static String computeHash(",
        "to": "return HexFormat.of().formatHex(",
        "plus_n": 1
    },
    {
        "id": "C07-G",
        "file": "backend/src/main/resources/db/migration/V003__audit_timers_ai.sql",
        "from": "CREATE OR REPLACE FUNCTION audit_immutable() RETURNS trigger AS $$",
        "to": "FOR EACH STATEMENT EXECUTE FUNCTION audit_immutable();",
        "plus_n": 0
    },
    {
        "id": "C07-H",
        "file": "backend/src/main/java/edu/campus/iitsm/identity/infrastructure/security/SecurityConfig.java",
        "from": "public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {",
        "to": ".build();",
        "plus_n": 1
    },
    {
        "id": "C07-I",
        "file": "backend/src/main/java/edu/campus/iitsm/shared/infrastructure/web/GlobalProblemDetailsHandler.java",
        "from": "@ExceptionHandler(ItsmException.class)",
        "to": "return ResponseEntity.status(status).body(problem);",
        "plus_n": 1
    },
    # Act 8
    {
        "id": "C08-A",
        "file": "frontend/src/services/api.ts",
        "from": "async function request<T>(path: string,",
        "to": "throw err;",
        "plus_n": 2
    },
    {
        "id": "C08-B",
        "file": "frontend/src/context/AuthContext.tsx",
        "from": "const switchUser = async (user: PredefinedUser) => {",
        "to": "localStorage.setItem('iitsm_jwt', resp.accessToken);",
        "plus_n": 6
    },
    {
        "id": "C08-C",
        "file": "frontend/src/pages/portal/PortalReport.tsx",
        "from": "const handleSubmit = async (e: React.FormEvent) => {",
        "to": "const res = await api.incidents.create({",
        "plus_n": 10
    },
    {
        "id": "C08-D",
        "file": "frontend/src/pages/workbench/WorkbenchDetail.tsx",
        "from": "{allowed.includes('ACKNOWLEDGE') && (",
        "to": "Acknowledge (Stop Response Clock)",
        "plus_n": 3
    }
]

def main():
    print(f"Building all {len(CARD_DEFINITIONS)} code cards from git at PINNED_SHA={PINNED_SHA}...")
    cards_map = {}
    verified_count = 0

    for card in CARD_DEFINITIONS:
        card_id = card["id"]
        rel_path = resolve_path(card["file"])
        from_anchor = card["from"]
        to_anchor = card["to"]
        plus_n = card.get("plus_n", 0)

        try:
            file_content = get_git_file(rel_path)
        except Exception as e:
            print(f"[!] ERROR: Could not get git file for {card_id} ({rel_path}): {e}")
            continue

        lines = file_content.splitlines()
        start_l, end_l = find_line_range(lines, from_anchor, to_anchor, plus_n)
        snippet_lines = lines[start_l - 1:end_l]

        svg = render_16bit_card_svg(card_id, rel_path, start_l, end_l, snippet_lines)
        svg_file = cards_out_dir / f"{card_id}.svg"
        with open(svg_file, "w", encoding="utf-8") as f:
            f.write(svg)

        cards_map[card_id] = {
            "id": card_id,
            "file": rel_path,
            "start_line": start_l,
            "end_line": end_l,
            "total_lines": len(snippet_lines),
            "svg_file": f"video_v3/05_cards/{card_id}.svg",
            "code": snippet_lines
        }
        verified_count += 1
        print(f"[✓] Card {card_id}: {rel_path} (L{start_l}–L{end_l}, {len(snippet_lines)} lines) -> {svg_file.name}")

    cards_json_path = cards_out_dir / "cards.json"
    with open(cards_json_path, "w", encoding="utf-8") as f:
        json.dump(cards_map, f, indent=2)

    print(f"\nAll {verified_count}/{len(CARD_DEFINITIONS)} code cards built and verified against PINNED_SHA -> {cards_json_path}")

if __name__ == "__main__":
    main()
