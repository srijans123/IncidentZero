package edu.campus.iitsm.intelligence.api;

import java.util.List;

public record LlmClassificationSchema(
    String categoryCode, String serviceCode, String scope, int estimatedAffectedUsers,
    int urgencyHint, List<String> extractedErrorTokens, List<String> missingDiagnosticSlots,
    String clarifyingQuestion, double confidence, String briefReasoning
) {}
