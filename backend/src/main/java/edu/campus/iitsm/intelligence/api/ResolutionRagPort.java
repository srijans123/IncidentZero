package edu.campus.iitsm.intelligence.api;

import edu.campus.iitsm.shared.domain.Suggestion;
import java.util.List;
import java.util.UUID;

public interface ResolutionRagPort {
  Suggestion<LlmResolutionSchema> generateResolution(
      UUID incidentId,
      String serviceCode,
      String categoryCode,
      String symptoms,
      List<String> validSourceIds
  );
}
