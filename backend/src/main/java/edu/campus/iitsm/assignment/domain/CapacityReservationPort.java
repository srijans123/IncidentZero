package edu.campus.iitsm.assignment.domain;

import java.time.Instant;
import java.util.UUID;

public interface CapacityReservationPort {
  boolean reserveLoad(UUID technicianId, double weight, Instant now);
  void releaseLoad(UUID technicianId, double weight, Instant now);
}
