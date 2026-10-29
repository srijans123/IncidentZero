package edu.campus.iitsm.intelligence.api;

import edu.campus.iitsm.shared.domain.Suggestion;

public interface NlSearchPort {
  Suggestion<LlmSearchFilterAst> parseQuery(String queryText);
}
