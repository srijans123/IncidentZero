package edu.campus.iitsm.intelligence.api;

import edu.campus.iitsm.shared.domain.Suggestion;
import java.util.Map;

public interface RcaRankerPort {
  Suggestion<LlmRcaExplanationSchema> rankRootCause(
      Map<String, Integer> serviceReportCounts,
      Map<String, java.util.List<String>> dependencyGraph
  );
}
