# Incident-Zero (I-ITSM) — Autonomous Agent Contract (v2.2)

1. **Source of Truth:** `incident_zero_master_implementation_procedure_v2_2.md`.
2. **Never Edit Passing Domain Core:** Files extracted by `python3 tools/split.py incident_zero_master_implementation_procedure_v2_2.md` in `edu.campus.iitsm.*.domain` are compiler-verified across 520,036 transitions. Do not rename classes, methods, or SQL columns.
3. **Architecture Invariants (ArchUnit R1–R9):**
   - `..domain..` has ZERO Spring, JPA, Hibernate, or Jackson imports.
   - `AuditLedgerInTxListener` and `SlaTimerInTxListener` MUST use `@EventListener` + `@Transactional(propagation = Propagation.MANDATORY)` (never `@ApplicationModuleListener`).
   - Never call `Instant.now()` or `UUID.randomUUID()` in `domain` or `application`; always inject `ClockPort` and `IdGeneratorPort`.
4. **Milestone Execution & 3-Strike Failure Policy:**
   - Execute Milestones M1 through M6 in order.
   - After completing a milestone, run its verification script (`bash scripts/verify-mN.sh`) once.
   - If a verification script fails, fix ONLY the failing file and retry at most **3 times**. If still failing after 3 attempts, write the exact compiler/test output to `BLOCKERS.md` and stop immediately (never loop infinitely).
   - Commit to git after each green milestone (`git commit -am "feat: pass milestone M<N>"`).
