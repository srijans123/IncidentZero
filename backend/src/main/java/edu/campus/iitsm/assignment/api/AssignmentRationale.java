package edu.campus.iitsm.assignment.api;

import java.util.List;
import java.util.UUID;

public record AssignmentRationale(
    String strategy,
    UUID chosenTechnicianId,
    double chosenScore,
    List<CandidateScore> topCandidates,
    List<String> hardConstraintsApplied
) {
  public record CandidateScore(
      UUID technicianId, String technicianName, double totalScore,
      double skillScore, double loadScore, double experienceScore, double speedScore
  ) {}
}
