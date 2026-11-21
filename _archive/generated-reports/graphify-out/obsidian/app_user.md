---
source_file: "backend/src/main/resources/db/migration/V001__reference_tables.sql"
type: "code"
community: "Community 8"
location: "L20"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/Community_8
---

# app_user

## Connections
- [[V001__reference_tables.sql]] - `contains` [EXTRACTED]
- [[ai_suggestion]] - `references` [EXTRACTED]
- [[app_config]] - `references` [EXTRACTED]
- [[assignment_decision]] - `references` [EXTRACTED]
- [[escalation_event]] - `references` [EXTRACTED]
- [[incident_5]] - `references` [EXTRACTED]
- [[incident_comment]] - `references` [EXTRACTED]
- [[notification]] - `references` [EXTRACTED]
- [[refresh_token]] - `references` [EXTRACTED]
- [[technician_load]] - `references` [EXTRACTED]
- [[technician_profile]] - `references` [EXTRACTED]
- [[technician_skill]] - `references` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/Community_8