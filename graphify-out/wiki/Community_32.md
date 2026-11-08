# Community 32

> 23 nodes · cohesion 0.17

## Key Concepts

- **UserPrincipal** (30 connections) — `backend/src/main/java/edu/campus/iitsm/identity/api/UserPrincipal.java`
- **IdentityQueryServiceAdapter** (15 connections) — `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/IdentityQueryServiceAdapter.java`
- **JwtTokenService.java** (14 connections) — `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/security/JwtTokenService.java`
- **StreamTicketService** (12 connections) — `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/security/StreamTicketService.java`
- **org.springframework.stereotype.Service** (12 connections)
- **StreamTicketService.java** (10 connections) — `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/security/StreamTicketService.java`
- **.issueStreamTicket()** (5 connections) — `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/IdentityQueryServiceAdapter.java`
- **Override** (5 connections)
- **.issueTicket()** (5 connections) — `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/security/StreamTicketService.java`
- **.testStreamTicketSingleUseAndExpiration()** (5 connections) — `backend/src/test/java/edu/campus/iitsm/AuthenticationTest.java`
- **value** (5 connections)
- **.consumeStreamTicket()** (4 connections) — `backend/src/main/java/edu/campus/iitsm/identity/api/IdentityQueryService.java`
- **.consumeStreamTicket()** (4 connections) — `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/IdentityQueryServiceAdapter.java`
- **.findByEmail()** (4 connections) — `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/IdentityQueryServiceAdapter.java`
- **.findById()** (4 connections) — `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/IdentityQueryServiceAdapter.java`
- **.consumeTicket()** (4 connections) — `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/security/StreamTicketService.java`
- **.testStreamWithValidTicketReturns200TextEventStream()** (4 connections) — `backend/src/test/java/edu/campus/iitsm/ApiControllerAndProblemDetailsTest.java`
- **com.github.benmanes.caffeine.cache.Cache** (2 connections)
- **.StreamTicketService()** (1 connections) — `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/security/StreamTicketService.java`
- **base64** (1 connections)
- **caffeine** (1 connections)
- **mac** (1 connections)
- **secretkeyspec** (1 connections)

## Relationships

- [Community 19](Community_19.md) (11 shared connections)
- [Community 49](Community_49.md) (9 shared connections)
- [Community 62](Community_62.md) (8 shared connections)
- [Community 6](Community_6.md) (8 shared connections)
- [Community 21](Community_21.md) (4 shared connections)
- [Community 39](Community_39.md) (4 shared connections)
- [Community 61](Community_61.md) (2 shared connections)
- [Community 36](Community_36.md) (2 shared connections)
- [Community 20](Community_20.md) (2 shared connections)
- [Community 3](Community_3.md) (2 shared connections)
- [Community 51](Community_51.md) (2 shared connections)
- [Community 4](Community_4.md) (2 shared connections)

## Source Files

- `backend/src/main/java/edu/campus/iitsm/identity/api/IdentityQueryService.java`
- `backend/src/main/java/edu/campus/iitsm/identity/api/UserPrincipal.java`
- `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/IdentityQueryServiceAdapter.java`
- `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/security/JwtTokenService.java`
- `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/security/StreamTicketService.java`
- `backend/src/test/java/edu/campus/iitsm/ApiControllerAndProblemDetailsTest.java`
- `backend/src/test/java/edu/campus/iitsm/AuthenticationTest.java`

## Audit Trail

- EXTRACTED: 98 (92%)
- INFERRED: 9 (8%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*