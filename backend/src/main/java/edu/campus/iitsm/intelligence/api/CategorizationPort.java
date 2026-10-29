package edu.campus.iitsm.intelligence.api;

import edu.campus.iitsm.shared.domain.Suggestion;

public interface CategorizationPort {
  Suggestion<LlmClassificationSchema> classify(String title, String description);
}
