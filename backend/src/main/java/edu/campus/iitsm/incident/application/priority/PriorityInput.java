package edu.campus.iitsm.incident.application.priority;

public record PriorityInput(
    int impact,
    int urgency,
    String serviceTier,
    int affectedUsers,
    boolean activeCalendarWindow,
    boolean securityCategory,
    int linkedReportsIn15Min
) {}
