package edu.campus.iitsm.intelligence.infrastructure.search;

import edu.campus.iitsm.intelligence.api.LlmSearchFilterAst;
import edu.campus.iitsm.intelligence.api.NlSearchPort;
import edu.campus.iitsm.shared.domain.ClockPort;
import edu.campus.iitsm.shared.domain.LanguageModelPort;
import edu.campus.iitsm.shared.domain.Suggestion;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Component
public class NlSearchAdapter implements NlSearchPort {
  private final LanguageModelPort languageModelPort;
  private final ClockPort clockPort;

  public NlSearchAdapter(LanguageModelPort languageModelPort, ClockPort clockPort) {
    this.languageModelPort = languageModelPort;
    this.clockPort = clockPort;
  }

  @Override
  public Suggestion<LlmSearchFilterAst> parseQuery(String queryText) {
    Instant now = clockPort.now();
    if (queryText == null || queryText.isBlank()) {
      return new Suggestion<>(
          new LlmSearchFilterAst(List.of()),
          1.0,
          "RULES",
          "nl-search-v1",
          "v1",
          "Empty query",
          false,
          now
      );
    }

    String lower = queryText.toLowerCase();
    List<LlmSearchFilterAst.FilterClause> clauses = new ArrayList<>();

    // Rule-based keyword matching for fast parsing
    if (lower.contains("p1") || lower.contains("priority 1") || lower.contains("critical")) {
      clauses.add(new LlmSearchFilterAst.FilterClause("priority", "EQ", List.of("P1")));
    } else if (lower.contains("p2") || lower.contains("priority 2")) {
      clauses.add(new LlmSearchFilterAst.FilterClause("priority", "EQ", List.of("P2")));
    }

    if (lower.contains("breached")) {
      clauses.add(new LlmSearchFilterAst.FilterClause("sla_status", "EQ", List.of("BREACHED")));
    } else if (lower.contains("at risk") || lower.contains("at-risk")) {
      clauses.add(new LlmSearchFilterAst.FilterClause("sla_status", "EQ", List.of("AT_RISK")));
    }

    if (lower.contains("erp")) {
      clauses.add(new LlmSearchFilterAst.FilterClause("service", "EQ", List.of("APP-ERP")));
    } else if (lower.contains("ldap") || lower.contains("sso")) {
      clauses.add(new LlmSearchFilterAst.FilterClause("service", "EQ", List.of("AUTH-LDAP")));
    }

    if (lower.contains("open") || lower.contains("active")) {
      clauses.add(new LlmSearchFilterAst.FilterClause("status", "IN", List.of("NEW", "ASSIGNED", "IN_PROGRESS", "ACKNOWLEDGED")));
    }

    if (!clauses.isEmpty()) {
      return new Suggestion<>(
          new LlmSearchFilterAst(clauses),
          0.90,
          "RULES",
          "nl-rule-v1",
          "v1",
          "Deterministic keyword clause parsing",
          false,
          now
      );
    }

    // Call LLM for more complex parsing
    Suggestion<LlmSearchFilterAst> suggestion = languageModelPort.generateStructured(
        "nl_search",
        "v1",
        queryText,
        LlmSearchFilterAst.class
    );

    if (suggestion.value() != null) {
      return suggestion;
    }

    return new Suggestion<>(
        new LlmSearchFilterAst(List.of()),
        0.50,
        "RULES",
        "fallback-v1",
        "v1",
        "Fallback empty AST",
        true,
        now
    );
  }
}
