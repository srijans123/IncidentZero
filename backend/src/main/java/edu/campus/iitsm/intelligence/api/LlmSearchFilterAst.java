package edu.campus.iitsm.intelligence.api;

import java.util.List;

public record LlmSearchFilterAst(List<FilterClause> clauses) {
  public record FilterClause(String field, String operator, List<String> values) {}
}
