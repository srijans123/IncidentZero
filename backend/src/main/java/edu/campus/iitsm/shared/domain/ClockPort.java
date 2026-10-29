package edu.campus.iitsm.shared.domain;

import java.time.Instant;

public interface ClockPort {
  /** Virtual/simulated clock time for incident lifecycle, SLA clocks, timers, and audit rows. */
  Instant now();
  /** Real wall-clock time for JWT expiration, 30s SSE stream tickets, and HTTP rate-limit windows. */
  default Instant wallNow() { return Instant.now(); }
  int scaleFactor();
  long realNanosUntil(Instant targetVirtualInstant);
}
