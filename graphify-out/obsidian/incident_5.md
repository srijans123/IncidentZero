---
source_file: "backend/src/main/resources/db/migration/V002__incident_core.sql"
type: "code"
community: "Community 8"
location: "L3"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/Community_8
---

# incident

## Connections
- [[V002__incident_core.sql]] - `contains` [EXTRACTED]
- [[ai_suggestion]] - `references` [EXTRACTED]
- [[app_user]] - `references` [EXTRACTED]
- [[assignment_decision]] - `references` [EXTRACTED]
- [[audit_record]] - `references` [EXTRACTED]
- [[category]] - `references` [EXTRACTED]
- [[escalation_event]] - `references` [EXTRACTED]
- [[incident_5]] - `references` [EXTRACTED]
- [[incident_assignee_open]] - `indexes` [EXTRACTED]
- [[incident_comment]] - `references` [EXTRACTED]
- [[incident_emb_hnsw]] - `indexes` [EXTRACTED]
- [[incident_feedback]] - `references` [EXTRACTED]
- [[incident_link]] - `references` [EXTRACTED]
- [[incident_parent]] - `indexes` [EXTRACTED]
- [[incident_service_created]] - `indexes` [EXTRACTED]
- [[incident_status_created]] - `indexes` [EXTRACTED]
- [[incident_tsv_gin]] - `indexes` [EXTRACTED]
- [[it_service]] - `references` [EXTRACTED]
- [[knowledge_article]] - `references` [EXTRACTED]
- [[notification]] - `references` [EXTRACTED]
- [[sla_policy]] - `references` [EXTRACTED]
- [[sla_timer]] - `references` [EXTRACTED]
- [[team]] - `references` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/Community_8