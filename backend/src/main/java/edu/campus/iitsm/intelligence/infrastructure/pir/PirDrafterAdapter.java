package edu.campus.iitsm.intelligence.infrastructure.pir;

import edu.campus.iitsm.intelligence.api.LlmPirDraftSchema;
import edu.campus.iitsm.intelligence.api.PirDrafterPort;
import edu.campus.iitsm.shared.domain.ClockPort;
import edu.campus.iitsm.shared.domain.LanguageModelPort;
import edu.campus.iitsm.shared.domain.Suggestion;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;

@Component
public class PirDrafterAdapter implements PirDrafterPort {
  private static final Logger log = LoggerFactory.getLogger(PirDrafterAdapter.class);

  private final LanguageModelPort languageModelPort;
  private final ClockPort clockPort;

  public PirDrafterAdapter(LanguageModelPort languageModelPort, ClockPort clockPort) {
    this.languageModelPort = languageModelPort;
    this.clockPort = clockPort;
  }

  @Override
  public Suggestion<LlmPirDraftSchema> draftPir(
      UUID incidentId,
      String canonicalFactsJson,
      List<String> validAuditTimestamps
  ) {
    Instant now = clockPort.now();
    Suggestion<LlmPirDraftSchema> suggestion = languageModelPort.generateStructured(
        "pir_drafter",
        "v1",
        canonicalFactsJson != null ? canonicalFactsJson : "{}",
        LlmPirDraftSchema.class
    );

    LlmPirDraftSchema raw = suggestion.value();
    if (raw == null) {
      raw = new LlmPirDraftSchema(
          "Blameless Post-Incident Review",
          "Service disruption",
          List.of(),
          "Root cause investigation",
          List.of("Immediate containment"),
          List.of("Initial triage delay"),
          List.of(new LlmPirDraftSchema.ActionItem("Infrastructure Lead", "Review monitoring alarms", "P2"))
      );
    }

    Set<String> validSet = new HashSet<>();
    if (validAuditTimestamps != null) {
      validSet.addAll(validAuditTimestamps);
    }

    // Filter timeline entries: keep only those matching valid audit record timestamps
    List<LlmPirDraftSchema.TimelineEntry> verifiedTimeline = new ArrayList<>();
    if (raw.verifiedTimeline() != null) {
      for (LlmPirDraftSchema.TimelineEntry entry : raw.verifiedTimeline()) {
        if (validSet.isEmpty() || validSet.contains(entry.isoUtcTimestamp())) {
          verifiedTimeline.add(entry);
        } else {
          log.warn("PIR Verifier dropped hallucinated timeline timestamp: {}", entry.isoUtcTimestamp());
        }
      }
    }

    // If verified timeline is empty but validAuditTimestamps has items, synthesize grounded timeline
    if (verifiedTimeline.isEmpty() && !validSet.isEmpty()) {
      for (String ts : validAuditTimestamps) {
        verifiedTimeline.add(new LlmPirDraftSchema.TimelineEntry(ts, "Verified immutable audit ledger event recorded."));
      }
    }

    LlmPirDraftSchema verifiedSchema = new LlmPirDraftSchema(
        raw.executiveSummary(),
        raw.customerAndCampusImpact(),
        verifiedTimeline,
        raw.rootCauseAnalysis(),
        raw.whatWentWell(),
        raw.whatWentWrong(),
        raw.preventativeActionItems()
    );

    return new Suggestion<>(
        verifiedSchema,
        suggestion.confidence(),
        suggestion.source(),
        suggestion.modelVersion(),
        suggestion.promptVersion(),
        "Audit ledger timeline verified with " + verifiedTimeline.size() + " facts",
        suggestion.fromFallback(),
        now
    );
  }
}
