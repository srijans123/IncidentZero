package edu.campus.iitsm.intelligence.infrastructure.classification;

import edu.campus.iitsm.intelligence.api.CategorizationPort;
import edu.campus.iitsm.intelligence.api.LlmClassificationSchema;
import edu.campus.iitsm.shared.domain.ClockPort;
import edu.campus.iitsm.shared.domain.LanguageModelPort;
import edu.campus.iitsm.shared.domain.Suggestion;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Component
public class CategorizationAdapter implements CategorizationPort {
  private final LanguageModelPort languageModelPort;
  private final ClockPort clockPort;

  // Stage 1 Alias Dictionary
  private static final Map<String, String[]> ALIAS_DICT = Map.of(
      "ldap", new String[]{"AUTH-LDAP", "AUTHENTICATION"},
      "sso", new String[]{"AUTH-LDAP", "AUTHENTICATION"},
      "wifi", new String[]{"NET-CORE", "NETWORK"},
      "router", new String[]{"NET-CORE", "NETWORK"},
      "nalanda", new String[]{"APP-LMS", "SOFTWARE"},
      "moodle", new String[]{"APP-LMS", "SOFTWARE"},
      "ezproxy", new String[]{"APP-LIB", "SOFTWARE"},
      "xplore", new String[]{"APP-LIB", "SOFTWARE"},
      "erp", new String[]{"APP-ERP", "SOFTWARE"}
  );

  public CategorizationAdapter(LanguageModelPort languageModelPort, ClockPort clockPort) {
    this.languageModelPort = languageModelPort;
    this.clockPort = clockPort;
  }

  @Override
  public Suggestion<LlmClassificationSchema> classify(String title, String description) {
    Instant now = clockPort.now();
    String fullText = ((title != null ? title : "") + " " + (description != null ? description : "")).toLowerCase();

    // Stage 1: Alias Dictionary Match (Confidence 0.90)
    for (Map.Entry<String, String[]> entry : ALIAS_DICT.entrySet()) {
      if (fullText.contains(entry.getKey())) {
        String service = entry.getValue()[0];
        String category = entry.getValue()[1];
        LlmClassificationSchema schema = new LlmClassificationSchema(
            category,
            service,
            "CAMPUS",
            50,
            2,
            List.of(entry.getKey()),
            List.of(),
            null,
            0.90,
            "Matched keyword alias '" + entry.getKey() + "' in Stage 1"
        );
        return new Suggestion<>(
            schema,
            0.90,
            "ALIAS_DICTIONARY",
            "alias-v1",
            "v1",
            "Keyword alias rule",
            false,
            now
        );
      }
    }

    // Stage 2: LLM Classification
    String prompt = "Title: " + title + "\nDescription: " + description;
    Suggestion<LlmClassificationSchema> suggestion = languageModelPort.generateStructured(
        "classify",
        "v1",
        prompt,
        LlmClassificationSchema.class
    );

    if (suggestion.value() != null && !suggestion.value().categoryCode().equalsIgnoreCase("ABSTAIN")
        && suggestion.confidence() >= 0.50) {
      return suggestion;
    }

    // Stage 3: Baseline Fallback
    LlmClassificationSchema fallback = new LlmClassificationSchema(
        "GENERAL",
        "APP-PORTAL",
        "INDIVIDUAL",
        1,
        3,
        List.of(),
        List.of("SERVICE", "ERROR_TEXT"),
        "Please provide the specific application name and error message.",
        0.50,
        "Fallback categorization"
    );
    return new Suggestion<>(
        fallback,
        0.50,
        "RULES",
        "fallback-v1",
        "v1",
        "Fallback rule applied",
        true,
        now
    );
  }
}
