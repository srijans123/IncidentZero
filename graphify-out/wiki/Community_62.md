# Community 62

> 9 nodes · cohesion 0.31

## Key Concepts

- **JwtTokenService** (16 connections) — `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/security/JwtTokenService.java`
- **.login()** (8 connections) — `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/IdentityQueryServiceAdapter.java`
- **.validateAndExtract()** (5 connections) — `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/security/JwtTokenService.java`
- **.findByEmail()** (4 connections) — `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/persistence/AppUserJpaRepository.java`
- **.generateToken()** (4 connections) — `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/security/JwtTokenService.java`
- **.JwtTokenService()** (3 connections) — `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/security/JwtTokenService.java`
- **.sign()** (3 connections) — `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/security/JwtTokenService.java`
- **.getPasswordHash()** (2 connections) — `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/persistence/AppUserJpaEntity.java`
- **.getTokenValiditySeconds()** (2 connections) — `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/security/JwtTokenService.java`

## Relationships

- [Community 32](Community_32.md) (8 shared connections)
- [Community 20](Community_20.md) (3 shared connections)
- [Community 49](Community_49.md) (3 shared connections)
- [Community 3](Community_3.md) (3 shared connections)
- [Community 19](Community_19.md) (2 shared connections)
- [Community 38](Community_38.md) (2 shared connections)
- [Community 39](Community_39.md) (2 shared connections)
- [Community 6](Community_6.md) (2 shared connections)

## Source Files

- `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/IdentityQueryServiceAdapter.java`
- `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/persistence/AppUserJpaEntity.java`
- `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/persistence/AppUserJpaRepository.java`
- `backend/src/main/java/edu/campus/iitsm/identity/infrastructure/security/JwtTokenService.java`

## Audit Trail

- EXTRACTED: 29 (81%)
- INFERRED: 7 (19%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*