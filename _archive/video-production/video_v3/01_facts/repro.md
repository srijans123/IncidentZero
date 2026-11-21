# Bug Reproduction & Verification Log (Step A0.4)

Verified against the live running stack (Spring Boot 3.5.3 on port 8080 against Neon `incidentzero_demo` database, Vite on port 3000):

| Frontend Expectation | Backend Actual Behavior | Observed Reproduction & Evidence |
| :--- | :--- | :--- |
| **`GET /api/v1/incidents` works** | SQL error: column `response_due_at` does not exist | `IncidentQueryAdapter.java:41` queries non-existent columns `response_due_at` and `resolution_due_at`, throwing `PSQLException` and returning HTTP 500 on all incident list calls. |
| **`incident.state`** | `status` | In `IncidentSummaryDto` and `IncidentDetailResponse`, field is named `status` instead of `state`. Frontend status dots, filters, and lifecycle bar evaluate `undefined`. |
| **`allowedCommands` on list rows** | Not present in `IncidentSummaryDto` | `WorkbenchHome.tsx:65, 274` calls `incident.allowedCommands.includes(...)`. Because `allowedCommands` is undefined, Workbench crashes immediately when tickets are loaded. |
| **`START_INVESTIGATION`, `REQUEST_USER_INFO`** | `"START"`, `"REQUEST_INFO"` in `IncidentQueryAdapter` | Hand-written switch in `IncidentQueryAdapter.computeAllowedCommands` outputs non-domain strings `"START"` and `"REQUEST_INFO"`. Buttons never match frontend allowed list; tickets cannot progress past ACKNOWLEDGED. |
| **`isMajor`, `assigneeName`, due dates, serviceCode** | `major` missing, hardcoded strings | `IncidentSummaryDto` hardcodes `"APP-ERP"` and `"SOFTWARE"`; `assigneeName` hardcoded to `"Assigned Technician"`; `responseDueAt` and `resolutionDueAt` are null. |
| **Timeline: `action`, `ts`, `description`** | `eventType`, `timestamp`, `summary` | Audit/timeline DTO returns `eventType`, `timestamp`, `summary`. Frontend displays blank rows and fake `10:00:00` placeholder times. |
| **Advice: `matchedKbs[]`, `potentialDuplicates[]`** | `kbArticles: string[]`, `duplicates[]` | Field names differ; copilot panel displays fallback/placeholder text. |
| **Audit verify: `totalRecordsChecked`, `tamperedRowId`, `message`** | `totalRecordsVerified`, `firstCorruptedRowId`, `reason` | `AdminAudit.tsx` receives undefined fields; verify dialog displays undefined results. |
| **Command `comment`** | Throws `IllegalArgumentException` (500) | No comment command exists in domain/application command switch. Posting a note fails with 500. |
| **Student "Verify & Close"** | Sends command `close` | `PortalDetail.tsx:99` sends `close`. Domain `ResolvedState` only permits `VERIFY` and `REJECT_RESOLUTION`; `CLOSE` is forbidden for students, throwing 409. |
| **Urgency Scale Inversion (A24)** | Frontend Critical=`1`, High=`2`, Standard=`3` | `PortalReport.tsx:270` default is `3`. Backend `ItilMatrixPriorityStrategy` treats `3` as highest urgency. Selecting "Critical" yields lowest priority P4, while "Standard" yields P1. |
| **Resolve Modal Root Cause (A26)** | Required for P1/P2 in `InProgressState.resolve` | `InProgressState.resolve` throws if `rootCauseCategory` is absent on P1/P2 tickets. Modal must require root cause. |
