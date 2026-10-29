package edu.campus.iitsm.incident.api.dto;

import edu.campus.iitsm.intelligence.api.DuplicateCandidate;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class IncidentDtos {
  private IncidentDtos() {}

  public record CreateIncidentRequest(
      String title,
      String description,
      String serviceCode,
      UUID serviceId,
      Integer urgency,
      Integer impactOverride
  ) {}

  public record CommandEnvelope(
      UUID categoryId,
      UUID assigneeId,
      UUID teamId,
      String priority,
      String question,
      String reason,
      String resolutionCode,
      String resolutionNotes,
      String rootCauseCategory,
      Short rating,
      String closureNote,
      UUID masterId
  ) {}

  public record IncidentSummaryDto(
      UUID id,
      String number,
      String title,
      String serviceCode,
      String categoryCode,
      String status,
      String slaStatus,
      String priority,
      UUID assigneeId,
      String assigneeName,
      Instant createdAt,
      Instant responseDueAt,
      Instant resolutionDueAt,
      long version
  ) {}

  public record PageResponse<T>(
      List<T> items,
      String nextCursor,
      boolean hasMore,
      long totalMatching
  ) {}

  public record AdviceRequest(
      String title,
      String description,
      String serviceCode,
      Integer urgency
  ) {}

  public record AdviceResponse(
      List<DuplicateCandidate> duplicates,
      String suggestedCategory,
      String suggestedService,
      Integer suggestedImpact,
      List<String> kbArticles,
      String clarifyingQuestion
  ) {}

  public record AuditTimelineItemDto(
      long id,
      UUID incidentId,
      String eventType,
      String actorType,
      String actorName,
      String summary,
      String payloadJson,
      String hash,
      Instant timestamp
  ) {}

  public record IncidentDetailResponse(
      UUID id,
      String number,
      String title,
      String description,
      String status,
      String slaStatus,
      String serviceCode,
      String categoryCode,
      short impact,
      short urgency,
      String priority,
      List<Map<String, Object>> priorityExplanation,
      Map<String, Object> sla,
      Map<String, Object> assignee,
      Map<String, Object> assignmentRationale,
      UUID parentId,
      UUID commanderId,
      int affectedUsers,
      List<String> allowedCommands,
      boolean suggestionsPending,
      long version,
      Instant createdAt,
      Instant responseDueAt,
      Instant resolutionDueAt
  ) {}

  public record IncidentAiPanelDto(
      List<Map<String, Object>> priorityExplanation,
      Map<String, Object> assignmentRationale,
      double breachRisk,
      List<Map<String, Object>> suggestedResolution,
      List<DuplicateCandidate> relatedIncidents
  ) {}
}
