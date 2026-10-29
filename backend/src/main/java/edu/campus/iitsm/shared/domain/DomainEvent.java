package edu.campus.iitsm.shared.domain;

import java.time.Instant;
import java.util.UUID;

public interface DomainEvent {
  UUID incidentId();
  Instant occurredAt();
}
