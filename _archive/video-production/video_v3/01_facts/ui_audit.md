# Incident-Zero (I-ITSM) — UI Control Click-Through Audit

> **Rule for the whole UI:** Every button, tab and link in the app was clicked against the real backend. Each one does what its label says. Zero dead controls. Zero native dialogs. Zero console errors.

**Audit Date:** 2026-11-15T22:17:41.062Z
**Tested Environment:** http://localhost:3000 against Spring Boot API http://localhost:8080/api/v1
**Total Controls Verified:** 36
**Console Errors:** 0
**Native Dialogs:** 0

| # | Control Label | Page / Component | Actor Persona | Action / API Endpoint | Status |
|---|---------------|------------------|---------------|-----------------------|--------|
| 1 | `Brand Logo Return Link` | Header | Aarav Sharma | Navigate to ./ | **PASS - Verified Active** |
| 2 | `Sky / Weather Cycle Button` | Header | Aarav Sharma | Cycle Day/Sunset/Night/Monsoon themes | **PASS - Verified Active** |
| 3 | `Chiptune Audio Toggle` | Header | Aarav Sharma | Toggle 8-bit audio synth | **PASS - Verified Active** |
| 4 | `Campus Station Menu Button` | Header | Aarav Sharma | Open station quick-jump menu | **PASS - Verified Active** |
| 5 | `Persona Switcher -> Aarav Sharma` | Header | Any | Switch authenticated user persona | **PASS - Verified Active** |
| 6 | `Student Portal Tab` | Nav Cartridge | Aarav Sharma | Open ROM 01 Student Portal | **PASS - Verified Active** |
| 7 | `Report New Incident Button` | Student Portal | Aarav Sharma | Open incident report intake form | **PASS - Verified Active** |
| 8 | `Incident Title Input` | Portal Report Form | Aarav Sharma | Enter title | **PASS - Verified Active** |
| 9 | `Affected Service Select` | Portal Report Form | Aarav Sharma | Select NET-WIFI-HOSTEL | **PASS - Verified Active** |
| 10 | `Detailed Description Textarea` | Portal Report Form | Aarav Sharma | Enter incident details | **PASS - Verified Active** |
| 11 | `Urgency 2 (High Priority) Button` | Portal Report Form | Aarav Sharma | Select High Priority | **PASS - Verified Active** |
| 12 | `Submit Incident Report Button` | Portal Report Form | Aarav Sharma | POST /api/v1/incidents -> 201 Created | **PASS - Verified Active** |
| 13 | `Incident Detail Dossier [INC-2026-000210]` | Portal Detail | Aarav Sharma | Verify dossier rendered | **PASS - Verified Active** |
| 14 | `Persona Switcher -> Vikram Rao` | Header | Any | Switch authenticated user persona | **PASS - Verified Active** |
| 15 | `Workbench Tab` | Nav Cartridge | Vikram Rao | Open ROM 02 Technician Workbench | **PASS - Verified Active** |
| 16 | `All Incidents Queue Tab` | Workbench Home | Vikram Rao | Show all queue tickets | **PASS - Verified Active** |
| 17 | `Workbench Queue Row [INC-2026-000210]` | Workbench Home | Vikram Rao | Open Workbench Detail view | **PASS - Verified Active** |
| 18 | `Acknowledge Button` | Workbench Detail | Vikram Rao | POST /commands/acknowledge -> ACKNOWLEDGED | **PASS - Verified Active** |
| 19 | `Start Investigation Button` | Workbench Detail | Vikram Rao | POST /commands/start -> IN_PROGRESS | **PASS - Verified Active** |
| 20 | `Send Request & Pause Clock Button` | Request Info Modal | Vikram Rao | POST /commands/request-info -> PENDING_USER | **PASS - Verified Active** |
| 21 | `Persona Switcher -> Aarav Sharma` | Header | Any | Switch authenticated user persona | **PASS - Verified Active** |
| 22 | `Send Diagnostic Reply Button` | Portal Detail | Aarav Sharma | POST /commands/provide-info -> IN_PROGRESS | **PASS - Verified Active** |
| 23 | `Persona Switcher -> Vikram Rao` | Header | Any | Switch authenticated user persona | **PASS - Verified Active** |
| 24 | `Confirm Resolution Button` | Resolve Modal | Vikram Rao | POST /commands/resolve -> RESOLVED | **PASS - Verified Active** |
| 25 | `Persona Switcher -> Aarav Sharma` | Header | Any | Switch authenticated user persona | **PASS - Verified Active** |
| 26 | `Confirm It Is Fixed Button` | Portal Detail | Aarav Sharma | POST /commands/verify -> VERIFIED | **PASS - Verified Active** |
| 27 | `Persona Switcher -> Vikram Rao` | Header | Any | Switch authenticated user persona | **PASS - Verified Active** |
| 28 | `Close Incident Button` | Workbench Detail | Vikram Rao | POST /commands/close -> CLOSED | **PASS - Verified Active** |
| 29 | `Persona Switcher -> Suresh Deshmukh` | Header | Any | Switch authenticated user persona | **PASS - Verified Active** |
| 30 | `Command DAG Tab` | Nav Cartridge | Suresh Deshmukh | Open ROM 03 Admin Command DAG | **PASS - Verified Active** |
| 31 | `19-Node Service DAG Subtab` | Admin Console | Suresh Deshmukh | Render 3D dependency blast radius graph | **PASS - Verified Active** |
| 32 | `Audit Ledger Subtab` | Admin Console | Suresh Deshmukh | Render SHA-256 Merkle block spine | **PASS - Verified Active** |
| 33 | `VERIFY LEDGER Button` | Admin Audit Ledger | Suresh Deshmukh | POST /api/v1/admin/audit/verify -> valid: true | **PASS - Verified Active** |
| 34 | `System Config Subtab` | Admin Console | Suresh Deshmukh | Render SLA policies & routing strategies | **PASS - Verified Active** |
| 35 | `System Specs Tab` | Nav Cartridge | Suresh Deshmukh | Open ROM 04 Architectural Specifications | **PASS - Verified Active** |
| 36 | `Campus Stage Tab` | Nav Cartridge | Suresh Deshmukh | Open ROM 00 2D Isometric Campus Stage | **PASS - Verified Active** |

## Conclusion
All UI controls across ROM 00 (Campus Stage), ROM 01 (Student Portal), ROM 02 (Technician Workbench), ROM 03 (Command DAG), and ROM 04 (System Specs) are active, wired to live backend endpoints, and produce verified state transitions without any console errors or native dialogs.
