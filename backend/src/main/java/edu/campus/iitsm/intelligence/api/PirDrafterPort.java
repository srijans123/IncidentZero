package edu.campus.iitsm.intelligence.api;

import edu.campus.iitsm.shared.domain.Suggestion;
import java.util.List;
import java.util.UUID;

public interface PirDrafterPort {
  Suggestion<LlmPirDraftSchema> draftPir(
      UUID incidentId,
      String canonicalFactsJson,
      List<String> validAuditTimestamps
  );
}
