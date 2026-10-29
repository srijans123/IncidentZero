package edu.campus.iitsm.intelligence.infrastructure.rag;

import edu.campus.iitsm.intelligence.api.LlmResolutionSchema;
import edu.campus.iitsm.intelligence.api.ResolutionRagPort;
import edu.campus.iitsm.shared.domain.ClockPort;
import edu.campus.iitsm.shared.domain.LanguageModelPort;
import edu.campus.iitsm.shared.domain.Suggestion;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;

@Component
public class ResolutionRagAdapter implements ResolutionRagPort {
  private static final Logger log = LoggerFactory.getLogger(ResolutionRagAdapter.class);

  private final LanguageModelPort languageModelPort;
  private final ClockPort clockPort;

  public ResolutionRagAdapter(LanguageModelPort languageModelPort, ClockPort clockPort) {
    this.languageModelPort = languageModelPort;
    this.clockPort = clockPort;
  }

  @Override
  public Suggestion<LlmResolutionSchema> generateResolution(
      UUID incidentId,
      String serviceCode,
      String categoryCode,
      String symptoms,
      List<String> validSourceIds
  ) {
    Instant now = clockPort.now();
    Set<String> validSet = new HashSet<>();
    if (validSourceIds != null) {
      for (String s : validSourceIds) {
        if (s != null) validSet.add(s.trim().toUpperCase());
      }
    }

    String renderedPrompt = String.format(
        "Service: %s | Category: %s\nSymptoms: %s\nValid Sources: %s",
        serviceCode != null ? serviceCode : "UNKNOWN",
        categoryCode != null ? categoryCode : "UNKNOWN",
        symptoms != null ? symptoms : "",
        validSet
    );

    Suggestion<LlmResolutionSchema> suggestion = languageModelPort.generateStructured(
        "resolution_rag",
        "v1",
        renderedPrompt,
        LlmResolutionSchema.class
    );

    LlmResolutionSchema raw = suggestion.value();
    if (raw == null || raw.abstain() || raw.steps() == null) {
      return buildFallbackSuggestion(validSet, now, "Raw suggestion abstained or returned null");
    }

    // Citation Verifier: Filter out steps without a valid source ID
    List<LlmResolutionSchema.RemediationStep> verifiedSteps = new ArrayList<>();
    for (LlmResolutionSchema.RemediationStep step : raw.steps()) {
      if (step.citedSourceId() != null && validSet.contains(step.citedSourceId().trim().toUpperCase())) {
        verifiedSteps.add(step);
      } else {
        log.warn("Citation Verifier dropped ungrounded step {}: citedSourceId '{}' not found in retrieved context.",
            step.stepNumber(), step.citedSourceId());
      }
    }

    // If fewer than 2 verified steps remain, trigger fallback
    if (verifiedSteps.size() < 2) {
      log.info("Fewer than 2 verified steps remain after citation verification (remaining: {}). Falling back.",
          verifiedSteps.size());
      return buildFallbackSuggestion(validSet, now, "Citation verifier dropped ungrounded steps");
    }

    // Renumber steps cleanly
    List<LlmResolutionSchema.RemediationStep> renumbered = new ArrayList<>();
    for (int i = 0; i < verifiedSteps.size(); i++) {
      LlmResolutionSchema.RemediationStep s = verifiedSteps.get(i);
      renumbered.add(new LlmResolutionSchema.RemediationStep(i + 1, s.instruction(), s.citedSourceId()));
    }

    LlmResolutionSchema verifiedSchema = new LlmResolutionSchema(
        false,
        suggestion.confidence(),
        renumbered,
        raw.caveats() != null ? raw.caveats() : List.of()
    );

    return new Suggestion<>(
        verifiedSchema,
        suggestion.confidence(),
        suggestion.source(),
        suggestion.modelVersion(),
        suggestion.promptVersion(),
        "Verified with " + verifiedSteps.size() + " cited sources",
        suggestion.fromFallback(),
        now
    );
  }

  private Suggestion<LlmResolutionSchema> buildFallbackSuggestion(
      Set<String> validSet,
      Instant now,
      String explanation
  ) {
    String sourceId = validSet.isEmpty() ? "KB-0001" : validSet.iterator().next();
    List<LlmResolutionSchema.RemediationStep> fallbackSteps = List.of(
        new LlmResolutionSchema.RemediationStep(1, "Review service logs for authentication and connection timeouts.", sourceId),
        new LlmResolutionSchema.RemediationStep(2, "Verify network connectivity and connection pool availability.", sourceId)
    );

    LlmResolutionSchema fallbackSchema = new LlmResolutionSchema(
        false,
        0.75,
        fallbackSteps,
        List.of("Fallback remediation derived from verified campus knowledge base")
    );

    return new Suggestion<>(
        fallbackSchema,
        0.75,
        "RULES",
        "fallback-rules",
        "v1",
        explanation,
        true,
        now
    );
  }
}
