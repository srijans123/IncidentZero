package edu.campus.iitsm.identity.api;

public record StreamTicketResponse(
    String ticket,
    int expiresInSeconds
) {}
