package edu.campus.iitsm.intelligence.api;

import java.util.List;

public record LlmPirDraftSchema(
    String executiveSummary, String customerAndCampusImpact, List<TimelineEntry> verifiedTimeline,
    String rootCauseAnalysis, List<String> whatWentWell, List<String> whatWentWrong,
    List<ActionItem> preventativeActionItems
) {
  public record TimelineEntry(String isoUtcTimestamp, String factualEvent) {}
  public record ActionItem(String ownerRole, String actionDescription, String priority) {}
}
