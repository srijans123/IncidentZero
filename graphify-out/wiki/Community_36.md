# Community 36

> 21 nodes · cohesion 0.37

## Key Concepts

- **IncidentCommandService** (30 connections) — `backend/src/main/java/edu/campus/iitsm/incident/application/IncidentCommandService.java`
- **.executeCommand()** (18 connections) — `backend/src/main/java/edu/campus/iitsm/incident/infrastructure/web/IncidentController.java`
- **org.springframework.transaction.annotation.Transactional** (18 connections)
- **.authorize()** (14 connections) — `backend/src/main/java/edu/campus/iitsm/incident/application/CommandAuthorizer.java`
- **.testWorkflow2_InvestigationPauseResumeVerificationAndAudit()** (14 connections) — `backend/src/test/java/edu/campus/iitsm/DemoWorkflowsEndToEndTest.java`
- **.commitAndPublish()** (12 connections) — `backend/src/main/java/edu/campus/iitsm/incident/application/IncidentCommandService.java`
- **.load()** (12 connections) — `backend/src/main/java/edu/campus/iitsm/incident/application/IncidentCommandService.java`
- **CommandAuthorizer** (8 connections) — `backend/src/main/java/edu/campus/iitsm/incident/application/CommandAuthorizer.java`
- **.declareMajor()** (8 connections) — `backend/src/main/java/edu/campus/iitsm/incident/application/IncidentCommandService.java`
- **.resolve()** (8 connections) — `backend/src/main/java/edu/campus/iitsm/incident/application/IncidentCommandService.java`
- **.acknowledge()** (7 connections) — `backend/src/main/java/edu/campus/iitsm/incident/application/IncidentCommandService.java`
- **.close()** (7 connections) — `backend/src/main/java/edu/campus/iitsm/incident/application/IncidentCommandService.java`
- **.IncidentCommandService()** (7 connections) — `backend/src/main/java/edu/campus/iitsm/incident/application/IncidentCommandService.java`
- **.provideUserInfo()** (7 connections) — `backend/src/main/java/edu/campus/iitsm/incident/application/IncidentCommandService.java`
- **.requestUserInfo()** (7 connections) — `backend/src/main/java/edu/campus/iitsm/incident/application/IncidentCommandService.java`
- **.startInvestigation()** (7 connections) — `backend/src/main/java/edu/campus/iitsm/incident/application/IncidentCommandService.java`
- **.verify()** (7 connections) — `backend/src/main/java/edu/campus/iitsm/incident/application/IncidentCommandService.java`
- **.cancel()** (6 connections) — `backend/src/main/java/edu/campus/iitsm/incident/application/IncidentCommandService.java`
- **.rejectResolution()** (6 connections) — `backend/src/main/java/edu/campus/iitsm/incident/application/IncidentCommandService.java`
- **Incident** (2 connections)
- **IncidentRepository** (2 connections)

## Relationships

- [Community 15](Community_15.md) (8 shared connections)
- [Community 45](Community_45.md) (6 shared connections)
- [Community 1](Community_1.md) (4 shared connections)
- [Community 6](Community_6.md) (3 shared connections)
- [Community 4](Community_4.md) (3 shared connections)
- [Community 5](Community_5.md) (3 shared connections)
- [Community 61](Community_61.md) (3 shared connections)
- [Community 42](Community_42.md) (3 shared connections)
- [Community 3](Community_3.md) (2 shared connections)
- [Community 32](Community_32.md) (2 shared connections)
- [Community 38](Community_38.md) (2 shared connections)
- [Community 16](Community_16.md) (2 shared connections)

## Source Files

- `backend/src/main/java/edu/campus/iitsm/incident/application/CommandAuthorizer.java`
- `backend/src/main/java/edu/campus/iitsm/incident/application/IncidentCommandService.java`
- `backend/src/main/java/edu/campus/iitsm/incident/infrastructure/web/IncidentController.java`
- `backend/src/test/java/edu/campus/iitsm/DemoWorkflowsEndToEndTest.java`

## Audit Trail

- EXTRACTED: 94 (72%)
- INFERRED: 36 (28%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*