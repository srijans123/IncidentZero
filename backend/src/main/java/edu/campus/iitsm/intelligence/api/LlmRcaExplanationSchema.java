package edu.campus.iitsm.intelligence.api;

import java.util.List;

public record LlmRcaExplanationSchema(
    boolean abstain, String primaryCandidateServiceCode, String causalSummary,
    List<String> citedIncidentNumbers, List<String> verificationChecksForTechnician
) {}
