package edu.campus.iitsm.incident.domain;

public enum IncidentStatus {
  NEW, CLASSIFIED, ASSIGNED, ACKNOWLEDGED, IN_PROGRESS,
  PENDING_USER, RESOLVED, VERIFIED, REOPENED, CLOSED, CANCELLED;

  public boolean isTerminal() {
    return this == CLOSED || this == CANCELLED;
  }
}
