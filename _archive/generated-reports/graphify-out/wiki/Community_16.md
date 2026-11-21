# Community 16

> 32 nodes · cohesion 0.14

## Key Concepts

- **WorkingTimeCalculator** (94 connections) — `backend/src/main/java/edu/campus/iitsm/shared/domain/WorkingTimeCalculator.java`
- **SlaClock** (21 connections) — `backend/src/main/java/edu/campus/iitsm/incident/domain/SlaClock.java`
- **.applyPriority()** (8 connections) — `backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java`
- **.remainingMs()** (8 connections) — `backend/src/main/java/edu/campus/iitsm/incident/domain/SlaClock.java`
- **.testSlaDualClockLifecycleAndPause()** (8 connections) — `backend/src/test/java/edu/campus/iitsm/SlaClockAndPolicyTest.java`
- **.refreshSla()** (7 connections) — `backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java`
- **.applyClassification()** (6 connections) — `backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java`
- **.ratio()** (6 connections) — `backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java`
- **.running()** (6 connections) — `backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java`
- **.stopResolution()** (6 connections) — `backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java`
- **.stopResponse()** (6 connections) — `backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java`
- **.pause()** (6 connections) — `backend/src/main/java/edu/campus/iitsm/incident/domain/SlaClock.java`
- **.stop()** (6 connections) — `backend/src/main/java/edu/campus/iitsm/incident/domain/SlaClock.java`
- **SlaBreached** (5 connections) — `backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java`
- **.elapsedMs()** (5 connections) — `backend/src/main/java/edu/campus/iitsm/incident/domain/SlaClock.java`
- **.retarget()** (5 connections) — `backend/src/main/java/edu/campus/iitsm/incident/domain/SlaClock.java`
- **.start()** (5 connections) — `backend/src/main/java/edu/campus/iitsm/incident/domain/SlaClock.java`
- **.workingMillisBetween()** (5 connections) — `backend/src/main/java/edu/campus/iitsm/shared/domain/WorkingTimeCalculator.java`
- **SlaClock.java** (4 connections) — `backend/src/main/java/edu/campus/iitsm/incident/domain/SlaClock.java`
- **.dueAt()** (4 connections) — `backend/src/main/java/edu/campus/iitsm/incident/domain/SlaClock.java`
- **.resume()** (4 connections) — `backend/src/main/java/edu/campus/iitsm/incident/domain/SlaClock.java`
- **.linkToMaster()** (3 connections) — `backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java`
- **.pauseResolution()** (3 connections) — `backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java`
- **.reopen()** (3 connections) — `backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java`
- **.resolutionClock()** (2 connections) — `backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java`
- *... and 7 more nodes in this community*

## Relationships

- [Community 1](Community_1.md) (24 shared connections)
- [Community 4](Community_4.md) (12 shared connections)
- [Community 34](Community_34.md) (10 shared connections)
- [Community 23](Community_23.md) (9 shared connections)
- [Community 37](Community_37.md) (9 shared connections)
- [Community 22](Community_22.md) (5 shared connections)
- [Community 53](Community_53.md) (5 shared connections)
- [Community 54](Community_54.md) (5 shared connections)
- [Community 55](Community_55.md) (5 shared connections)
- [Community 6](Community_6.md) (4 shared connections)
- [Community 3](Community_3.md) (4 shared connections)
- [Community 59](Community_59.md) (4 shared connections)

## Source Files

- `backend/src/main/java/edu/campus/iitsm/incident/api/IncidentEvents.java`
- `backend/src/main/java/edu/campus/iitsm/incident/domain/Incident.java`
- `backend/src/main/java/edu/campus/iitsm/incident/domain/SlaClock.java`
- `backend/src/main/java/edu/campus/iitsm/shared/domain/WorkingTimeCalculator.java`
- `backend/src/test/java/edu/campus/iitsm/SlaClockAndPolicyTest.java`

## Audit Trail

- EXTRACTED: 158 (87%)
- INFERRED: 24 (13%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*