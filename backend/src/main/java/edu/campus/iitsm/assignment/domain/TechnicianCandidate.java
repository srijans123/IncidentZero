package edu.campus.iitsm.assignment.domain;

import java.util.Map;
import java.util.UUID;

public record TechnicianCandidate(
    UUID technicianId,
    String name,
    UUID teamId,
    String supportTier,
    boolean onShift,
    double currentLoadPoints,
    double capacityPoints,
    Map<String, Integer> skillLevels,
    int resolvedOnService90d,
    double medianTtrMinutes,
    int categoryResolvedCount,
    double teamMedianTtrMinutes
) {
  public double freePoints() { return Math.max(0.0, capacityPoints - currentLoadPoints); }
  public double loadRatio() { return Math.max(0.0, Math.min(1.0, currentLoadPoints / Math.max(1.0, capacityPoints))); }
}
