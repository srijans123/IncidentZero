package edu.campus.iitsm.identity.api;

import java.util.UUID;

public record UserPrincipal(
    UUID id,
    String employeeNumber,
    String name,
    String email,
    String role,
    String supportTier,
    UUID teamId,
    String department,
    String locationBlock,
    String adminRole
) {}
