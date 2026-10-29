package edu.campus.iitsm.identity.api;

public record AuthTokens(
    String accessToken,
    long expiresInSeconds,
    UserPrincipal user
) {}
