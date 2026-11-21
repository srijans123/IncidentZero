# DomainEvent

> God node · 47 connections · `backend/src/main/java/edu/campus/iitsm/shared/domain/DomainEvent.java`

**Community:** [Community 14](Community_14.md)

## Connections by Relation

### contains
- DomainEvent.java `EXTRACTED`

### implements
- IncidentCreated `EXTRACTED`
- IncidentResolved `EXTRACTED`
- PriorityChanged `EXTRACTED`
- SlaBreached `EXTRACTED`
- IncidentClassified `EXTRACTED`
- IncidentUnlinked `EXTRACTED`
- InvestigationStarted `EXTRACTED`
- IncidentAcknowledged `EXTRACTED`
- IncidentAssigned `EXTRACTED`
- IncidentCancelled `EXTRACTED`
- IncidentClosed `EXTRACTED`
- IncidentLinked `EXTRACTED`
- IncidentReassigned `EXTRACTED`
- MajorIncidentDeclared `EXTRACTED`
- ResolutionRejected `EXTRACTED`
- ResolutionVerified `EXTRACTED`
- UserInfoProvided `EXTRACTED`
- UserInfoRequested `EXTRACTED`
- EscalationTriggered `EXTRACTED`
- NotificationRequested `EXTRACTED`
- *…and 5 more `implements` connection(s) not listed (lowest-degree first to go)*

### imports
- Incident.java `EXTRACTED`
- IncidentEvents.java `EXTRACTED`
- ResolvedState.java `EXTRACTED`
- Verify.java `EXTRACTED`
- AuditLedgerInTxListener.java `EXTRACTED`
- IncidentCommandService.java `EXTRACTED`
- SlaTimerInTxListener.java `EXTRACTED`
- PendingUserState.java `EXTRACTED`
- ReopenedState.java `EXTRACTED`
- PersistAndPublishStep.java `EXTRACTED`
- StateSupport.java `EXTRACTED`
- VerifiedState.java `EXTRACTED`
- IntelligenceEvents.java `EXTRACTED`
- TransitionResult.java `EXTRACTED`

### method
- .incidentId() `EXTRACTED`
- .occurredAt() `EXTRACTED`

### references
- [Incident](Incident.md) `EXTRACTED`
- [TransitionResult](TransitionResult.md) `EXTRACTED`
- .onDomainEvent() `EXTRACTED`
- .onDomainEvent() `EXTRACTED`
- .pullEvents() `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*