package edu.campus.iitsm.intelligence.api;

import java.util.List;

public record LlmResolutionSchema(
    boolean abstain, double confidence, List<RemediationStep> steps, List<String> caveats
) {
  public record RemediationStep(int stepNumber, String instruction, String citedSourceId) {}
}
