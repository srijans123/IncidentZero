# Community 14

> 35 nodes · cohesion 0.10

## Key Concepts

- **DomainEvent** (47 connections) — `backend/src/main/java/edu/campus/iitsm/shared/domain/DomainEvent.java`
- **IncidentEvents** (23 connections) — `backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java`
- **.onDomainEvent()** (7 connections) — `backend/src/main/java/edu/campus/iitsm/audit/infrastructure/AuditLedgerInTxListener.java`
- **.onDomainEvent()** (7 connections) — `backend/src/main/java/edu/campus/iitsm/sla/infrastructure/SlaTimerInTxListener.java`
- **IncidentCreated** (6 connections) — `backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java`
- **IntelligenceEvents** (6 connections) — `backend/src/main/java/edu/campus/iitsm/intelligence/api/IntelligenceEvents.java`
- **PriorityChanged** (5 connections) — `backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java`
- **IncidentClassified** (4 connections) — `backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java`
- **IncidentUnlinked** (4 connections) — `backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java`
- **InvestigationStarted** (4 connections) — `backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java`
- **org.springframework.context.event.EventListener** (4 connections)
- **IncidentAcknowledged** (3 connections) — `backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java`
- **IncidentAssigned** (3 connections) — `backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java`
- **IncidentCancelled** (3 connections) — `backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java`
- **IncidentClosed** (3 connections) — `backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java`
- **IncidentLinked** (3 connections) — `backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java`
- **IncidentReassigned** (3 connections) — `backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java`
- **MajorIncidentDeclared** (3 connections) — `backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java`
- **ResolutionRejected** (3 connections) — `backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java`
- **ResolutionVerified** (3 connections) — `backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java`
- **UserInfoProvided** (3 connections) — `backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java`
- **UserInfoRequested** (3 connections) — `backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java`
- **TransitionResult.java** (3 connections) — `backend/src/main/java/edu/campus/iitsm/incident/domain/TransitionResult.java`
- **.incidentId()** (3 connections) — `backend/src/main/java/edu/campus/iitsm/shared/domain/DomainEvent.java`
- **.occurredAt()** (3 connections) — `backend/src/main/java/edu/campus/iitsm/shared/domain/DomainEvent.java`
- *... and 10 more nodes in this community*

## Relationships

- [Community 4](Community_4.md) (15 shared connections)
- [Community 37](Community_37.md) (7 shared connections)
- [Community 22](Community_22.md) (5 shared connections)
- [Community 1](Community_1.md) (4 shared connections)
- [Community 25](Community_25.md) (4 shared connections)
- [Community 34](Community_34.md) (3 shared connections)
- [Community 36](Community_36.md) (2 shared connections)
- [Community 23](Community_23.md) (2 shared connections)
- [Community 16](Community_16.md) (2 shared connections)
- [Community 48](Community_48.md) (2 shared connections)
- [Community 33](Community_33.md) (1 shared connections)
- [Community 38](Community_38.md) (1 shared connections)

## Source Files

- `backend/src/main/java/edu/campus/iitsm/audit/infrastructure/AuditLedgerInTxListener.java`
- `backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java`
- `backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java`
- `backend/src/main/java/edu/campus/iitsm/incident/domain/TransitionResult.java`
- `backend/src/main/java/edu/campus/iitsm/intelligence/api/IntelligenceEvents.java`
- `backend/src/main/java/edu/campus/iitsm/shared/domain/DomainEvent.java`
- `backend/src/main/java/edu/campus/iitsm/sla/infrastructure/SlaTimerInTxListener.java`

## Audit Trail

- EXTRACTED: 93 (79%)
- INFERRED: 24 (21%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*