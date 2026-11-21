import os
import json

EXPLICIT_MAPPING = {
    "act2_scene1": ("backend/src/test/java/edu/campus/iitsm/ApiControllerAndProblemDetailsTest.java", "20-45", "ArchUnit & Architectural Invariant Tests"),
    "act2_scene2": ("backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java", "15-45", "Incident Aggregate Root (Pure Domain)"),
    "act2_scene3": ("backend/src/main/java/edu/campus/iitsm/shared/domain/ClockPort.java", "1-25", "ClockPort Hexagonal Outbound Port"),
    "act2_scene4": ("backend/src/main/java/edu/campus/iitsm/audit/infrastructure/AuditLedgerInTxListener.java", "20-40", "AuditLedger In-Tx Listener (@EventListener)"),
    "act2_scene7": ("backend/src/main/java/edu/campus/iitsm/shared/domain/error/ItsmException.java", "1-30", "Domain Exception Root Hierarchy"),
    "act2_scene8": ("backend/src/main/java/edu/campus/iitsm/shared/infrastructure/web/GlobalProblemDetailsHandler.java", "25-55", "RFC-7807 Problem Details Handler"),
    "act3_scene4": ("backend/src/main/java/edu/campus/iitsm/incident/domain/Priority.java", "1-30", "Priority Calculation Enum & Bands"),
    "act3_scene5": ("backend/src/main/java/edu/campus/iitsm/incident/domain/PriorityExplanation.java", "1-25", "Priority Explanation Audit Record"),
    "act4_scene2": ("backend/src/main/java/edu/campus/iitsm/sla/infrastructure/SlaTimerInTxListener.java", "15-45", "SLA Timer Mandatory Transactional Listener"),
    "act4_scene5": ("backend/src/main/java/edu/campus/iitsm/shared/domain/VirtualAnchoredClock.java", "10-40", "Virtual Anchored SLA Chronometer"),
    "act4_scene7": ("backend/src/main/java/edu/campus/iitsm/shared/domain/WorkingTimeCalculator.java", "10-40", "Business Working Hours Calculator"),
    "act4_scene8": ("backend/src/main/java/edu/campus/iitsm/catalog/domain/BusinessCalendar.java", "15-45", "Campus Academic Holiday Calendar"),
    "act5_scene3": ("backend/src/main/resources/db/migration/V001__reference_tables.sql", "1-35", "Service Topology DAG Schema & Relations"),
    "act5_scene5": ("backend/src/main/java/edu/campus/iitsm/intelligence/infrastructure/search/DuplicateDetectionAdapter.java", "15-45", "Duplicate Storm Detection Adapter"),
    "act5_scene9": ("backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java", "110-145", "Cascading Resolution & Child Linking"),
    "act6_scene2": ("backend/src/main/java/edu/campus/iitsm/intelligence/infrastructure/embedding/HashEmbeddingAdapter.java", "15-45", "Locality Sensitive Hash Embedding Port"),
    "act6_scene4": ("backend/src/main/java/edu/campus/iitsm/intelligence/infrastructure/embedding/OnnxEmbeddingAdapter.java", "20-50", "ONNX Dense Vector Embedding"),
    "act6_scene6": ("backend/src/main/java/edu/campus/iitsm/assignment/application/strategy/SkillMatchStrategy.java", "15-45", "Skill Match Technician Routing Strategy"),
    "act6_scene8": ("backend/src/main/java/edu/campus/iitsm/assignment/application/strategy/RoundRobinStrategy.java", "10-40", "Deterministic Round-Robin Dispatch"),
    "act7_scene2": ("backend/src/main/java/edu/campus/iitsm/audit/domain/AuditHasher.java", "1-35", "SHA-256 Merkle Ledger Hash Engine"),
    "act7_scene4": ("backend/src/main/resources/db/migration/V003__audit_timers_ai.sql", "1-35", "Immutable Audit Ledger Table DDL"),
    "act7_scene6": ("backend/src/main/java/edu/campus/iitsm/identity/infrastructure/IdentityQueryServiceAdapter.java", "20-50", "Role-Based Access Control (RBAC) Query"),
    "act7_scene8": ("backend/src/main/java/edu/campus/iitsm/identity/api/AuthTokens.java", "1-30", "Cryptographic JWT Session Tokens"),
    "act8_scene2": ("backend/src/main/java/edu/campus/iitsm/assignment/domain/AssignmentStrategy.java", "1-25", "GoF Strategy Pattern: AssignmentStrategy"),
    "act8_scene3": ("backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java", "50-85", "GoF State Pattern: FSM Transition Enforcement"),
    "act8_scene4": ("backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java", "1-30", "GoF Observer Pattern: Domain Events"),
    "act8_scene5": ("backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java", "1-35", "GoF Factory/Builder: Incident Snapshot"),
    "act8_scene6": ("backend/src/main/java/edu/campus/iitsm/notification/infrastructure/InAppSseHub.java", "15-45", "GoF Decorator/Adapter: Realtime SSE Hub"),
    "act8_scene7": ("backend/src/main/java/edu/campus/iitsm/assignment/application/BatchAssignmentScheduler.java", "15-45", "GoF Command Pattern: Batch Scheduler"),
    "act8_scene8": ("backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java", "85-120", "GoF Facade Pattern: Incident Management"),
    "act8_scene9": ("backend/src/main/java/edu/campus/iitsm/shared/domain/VirtualAnchoredClock.java", "1-30", "GoF Template Method: Virtual Clock"),
    "act9_scene2": ("backend/src/test/java/edu/campus/iitsm/SlaClockAndPolicyTest.java", "20-55", "SLA Clock Exhaustive Verification Test"),
    "act9_scene4": ("backend/src/test/java/edu/campus/iitsm/ApiControllerAndProblemDetailsTest.java", "30-65", "End-to-End Problem Details Integration Test"),
    "act9_scene7": ("backend/src/main/java/edu/campus/iitsm/shared/infrastructure/web/GlobalProblemDetailsHandler.java", "1-35", "RFC-7807 Standard Error Details"),
    "act10_scene3": ("backend/src/main/java/edu/campus/iitsm/audit/infrastructure/AuditLedgerInTxListener.java", "30-55", "Pessimistic Concurrency (FOR UPDATE)")
}

code_snippets = {}

for sc_id, (file_path, line_range, title) in EXPLICIT_MAPPING.items():
    actual_path = file_path if os.path.exists(file_path) else None
    
    start_l, end_l = [int(x) for x in line_range.split("-")]
    snippet = ""
    if actual_path and os.path.exists(actual_path):
        with open(actual_path, "r", encoding="utf-8") as f:
            all_lines = f.readlines()
            selected = all_lines[max(0, start_l - 1):min(len(all_lines), end_l)]
            snippet = "".join(selected)
    else:
        snippet = f"// File {file_path} not found"

    code_snippets[sc_id] = {
        "id": sc_id,
        "title": title,
        "file": file_path,
        "display_file": file_path,
        "lines": line_range,
        "exists": bool(actual_path),
        "code": snippet
    }

print(f"Processed {len(code_snippets)} mapped code snippets:")
found_count = sum(1 for v in code_snippets.values() if v["exists"])
print(f"  Successfully loaded from real source: {found_count}/{len(code_snippets)}")

out_file = "video/07_remotion/public/code_snippets.json"
os.makedirs(os.path.dirname(out_file), exist_ok=True)
with open(out_file, "w", encoding="utf-8") as out:
    json.dump(code_snippets, out, indent=2)

print(f"Saved to {out_file}")
