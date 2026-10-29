package edu.campus.iitsm.incident.domain;

public record PriorityStep(String rule, Priority before, Priority after, String reason) {}
