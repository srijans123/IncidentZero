---
type: community
cohesion: 0.10
members: 35
---

# Community 14

**Cohesion:** 0.10 - loosely connected
**Members:** 35 nodes

## Members
- [[dot-IncidentEvents()]] - code - backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java
- [[dot-IntelligenceEvents()]] - code - backend/src/main/java/edu/campus/iitsm/intelligence/api/IntelligenceEvents.java
- [[dot-incidentId()]] - code - backend/src/main/java/edu/campus/iitsm/shared/domain/DomainEvent.java
- [[dot-occurredAt()]] - code - backend/src/main/java/edu/campus/iitsm/shared/domain/DomainEvent.java
- [[dot-onDomainEvent()]] - code - backend/src/main/java/edu/campus/iitsm/audit/infrastructure/AuditLedgerInTxListener.java
- [[dot-onDomainEvent()_1]] - code - backend/src/main/java/edu/campus/iitsm/sla/infrastructure/SlaTimerInTxListener.java
- [[dot-pullEvents()]] - code - backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java
- [[AiSuggestionIssued]] - code - backend/src/main/java/edu/campus/iitsm/intelligence/api/IntelligenceEvents.java
- [[AiSuggestionOutcomeRecorded]] - code - backend/src/main/java/edu/campus/iitsm/intelligence/api/IntelligenceEvents.java
- [[BreachRiskRaised]] - code - backend/src/main/java/edu/campus/iitsm/intelligence/api/IntelligenceEvents.java
- [[DomainEvent]] - code - backend/src/main/java/edu/campus/iitsm/shared/domain/DomainEvent.java
- [[DuplicatesCorrelated]] - code - backend/src/main/java/edu/campus/iitsm/intelligence/api/IntelligenceEvents.java
- [[EscalationTriggered]] - code - backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java
- [[IncidentAcknowledged]] - code - backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java
- [[IncidentAssigned]] - code - backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java
- [[IncidentCancelled]] - code - backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java
- [[IncidentClassified]] - code - backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java
- [[IncidentClosed]] - code - backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java
- [[IncidentCreated]] - code - backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java
- [[IncidentEvents]] - code - backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java
- [[IncidentLinked]] - code - backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java
- [[IncidentReassigned]] - code - backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java
- [[IncidentUnlinked]] - code - backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java
- [[IntelligenceEvents]] - code - backend/src/main/java/edu/campus/iitsm/intelligence/api/IntelligenceEvents.java
- [[InvestigationStarted]] - code - backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java
- [[MajorIncidentDeclared]] - code - backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java
- [[NotificationRequested]] - code - backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java
- [[PriorityChanged]] - code - backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java
- [[ResolutionRejected]] - code - backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java
- [[ResolutionVerified]] - code - backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java
- [[SlaWarning]] - code - backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java
- [[TransitionResult.java]] - code - backend/src/main/java/edu/campus/iitsm/incident/domain/TransitionResult.java
- [[UserInfoProvided]] - code - backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java
- [[UserInfoRequested]] - code - backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java
- [[org.springframework.context.event.EventListener]] - code

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Community_14
SORT file.name ASC
```

## Connections to other communities
- 15 edges to [[_COMMUNITY_Community 4]]
- 7 edges to [[_COMMUNITY_Community 37]]
- 5 edges to [[_COMMUNITY_Community 22]]
- 4 edges to [[_COMMUNITY_Community 1]]
- 4 edges to [[_COMMUNITY_Community 25]]
- 3 edges to [[_COMMUNITY_Community 34]]
- 2 edges to [[_COMMUNITY_Community 23]]
- 2 edges to [[_COMMUNITY_Community 16]]
- 2 edges to [[_COMMUNITY_Community 48]]
- 2 edges to [[_COMMUNITY_Community 36]]
- 1 edge to [[_COMMUNITY_Community 54]]
- 1 edge to [[_COMMUNITY_Community 59]]
- 1 edge to [[_COMMUNITY_Community 69]]
- 1 edge to [[_COMMUNITY_Community 6]]
- 1 edge to [[_COMMUNITY_Community 53]]
- 1 edge to [[_COMMUNITY_Community 64]]
- 1 edge to [[_COMMUNITY_Community 55]]
- 1 edge to [[_COMMUNITY_Community 61]]
- 1 edge to [[_COMMUNITY_Community 24]]
- 1 edge to [[_COMMUNITY_Community 38]]
- 1 edge to [[_COMMUNITY_Community 33]]

## Top bridge nodes
- [[DomainEvent]] - degree 47, connects to 7 communities
- [[IncidentEvents]] - degree 23, connects to 3 communities
- [[dot-onDomainEvent()]] - degree 7, connects to 3 communities
- [[IncidentCreated]] - degree 6, connects to 3 communities
- [[dot-onDomainEvent()_1]] - degree 7, connects to 2 communities