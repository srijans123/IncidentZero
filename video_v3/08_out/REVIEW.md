# Incident-Zero — Video Production Review (Top 20 Critical Beats)

Per Section C15 of `ANTIGRAVITY_MASTER_BRIEF.md`, this document lists the 20 beats most worth human review.
Each beat is evaluated for speech pacing, code card legibility, audio-visual synchronisation, and state-machine accuracy.

| # | Beat ID | Scene | Timestamp | Tag | Duration | Key Focus / Reason | Narration Excerpt |
|---|---|---|---|---|---|---|---|
| 1 | `a09b33` | `S09.9` | `13:43` | `measured` | `6.8s` | Extended duration (6.8s); Code execution trace overlay | "The note needs at least twenty characters. A lazy note like "done" is rejec..." |
| 2 | `a09b38` | `S09.11` | `14:06` | `measured` | `6.9s` | Extended duration (6.9s); Code execution trace overlay | "Finally the technician closes it. [confirmation-en] The ticket is closed, a..." |
| 3 | `a03b28` | `S03.7` | `04:49` | `measured` | `7.0s` | Extended duration (7.0s); Integrity / security invariant demonstration | "An illegal move throws this exception. It sits with fourteen other error cl..." |
| 4 | `a09b11` | `S09.2` | `12:07` | `measured` | `4.0s` | Code execution trace overlay; Merkle audit chain verification | "And the audit listener writes the first links of the hash chain." |
| 5 | `a09b39` | `S09.11` | `14:12` | `measured` | `5.2s` | Code execution trace overlay; Merkle audit chain verification | "And the timeline shows the full story: who did what, when, and the hash of ..." |
| 6 | `a10b05` | `S10.2` | `14:39` | `measured` | `3.6s` | Code execution trace overlay; Merkle audit chain verification | "It recomputes every hash and compares it with the stored one." |
| 7 | `a07b15` | `S07.3` | `09:58` | `measured` | `6.9s` | Extended duration (6.9s); Merkle audit chain verification | "The hasher joins the previous hash, the time, the actor, the action and the..." |
| 8 | `a07b16` | `S07.3` | `10:05` | `measured` | `6.1s` | Extended duration (6.1s); Merkle audit chain verification | "So every entry is chained to the one before. Change one old row, and every ..." |
| 9 | `a09b05` | `S09.2` | `11:47` | `measured` | `3.5s` | Code execution trace overlay | "Pause. This click runs the submit handler I showed you." |
| 10 | `a09b06` | `S09.2` | `11:50` | `measured` | `2.9s` | Code execution trace overlay | "It sends a POST request to the incidents route." |
| 11 | `a09b07` | `S09.2` | `11:53` | `measured` | `3.4s` | Code execution trace overlay | "The controller receives it and calls the intake service." |
| 12 | `a09b08` | `S09.2` | `11:57` | `measured` | `2.1s` | Code execution trace overlay | "The pipeline runs its nine steps." |
| 13 | `a09b09` | `S09.2` | `11:59` | `measured` | `5.2s` | Code execution trace overlay | "Step three calls the factory method, which checks the rules and records the..." |
| 14 | `a09b10` | `S09.2` | `12:04` | `measured` | `3.3s` | Code execution trace overlay | "Step nine saves the ticket and publishes its events." |
| 15 | `a09b16` | `S09.4` | `12:34` | `measured` | `3.1s` | Code execution trace overlay | "Now I switch to the technician it was assigned to." |
| 16 | `a09b17` | `S09.4` | `12:37` | `measured` | `5.6s` | Code execution trace overlay | "The ticket is in his queue. There is no Resolve button yet, because the sta..." |
| 17 | `a09b18` | `S09.4` | `12:43` | `measured` | `1.7s` | Code execution trace overlay | "He clicks acknowledge." |
| 18 | `a09b19` | `S09.5` | `12:46` | `measured` | `3.5s` | Code execution trace overlay | "The button calls runCommand, which posts the action name." |
| 19 | `a09b20` | `S09.5` | `12:49` | `measured` | `3.5s` | Code execution trace overlay | "The controller's switch picks the acknowledge method." |
| 20 | `a09b21` | `S09.5` | `12:53` | `measured` | `3.4s` | Code execution trace overlay | "The service loads the ticket and asks the authorizer." |

## Reviewer Checklist for Selected Beats
1. **T1–T5 Code Trace Overlays**: Confirm visual highlight accurately boxes the method call chain and terminal output.
2. **State Machine Invariants**: Verify that `IncidentState.java` and illegal transition responses (HTTP 409) match the exact text spoken.
3. **Merkle Audit Integrity**: Confirm SHA-256 genesis hash (`0000...`) and trigger-enforced immutability are clearly depicted.
4. **Acoustic Clarity**: Confirm zero clipping or excessive mouth noise on emphasized and technical terms (`Spring Boot`, `Flyway`, `EBU R128`).
