package edu.campus.iitsm.incident.domain;

import edu.campus.iitsm.shared.domain.error.InvalidIncidentPayloadException;
import java.util.Objects;
import java.util.UUID;

public record SlaSnapshot(UUID policyId, String tier, long responseTargetMs, long resolutionTargetMs, ClockMode mode) {
  public SlaSnapshot {
    Objects.requireNonNull(policyId, "policyId");
    Objects.requireNonNull(tier, "tier");
    Objects.requireNonNull(mode, "mode");
    if (responseTargetMs <= 0 || resolutionTargetMs < responseTargetMs) {
      throw new InvalidIncidentPayloadException("sla", "resolutionTargetMs must be >= responseTargetMs > 0");
    }
  }
}
