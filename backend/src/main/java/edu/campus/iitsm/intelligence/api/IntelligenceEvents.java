package edu.campus.iitsm.intelligence.api;

import edu.campus.iitsm.shared.domain.DomainEvent;
import java.time.Instant;
import java.util.UUID;

public final class IntelligenceEvents {
  private IntelligenceEvents() {}

  public record BreachRiskRaised(UUID incidentId, Instant occurredAt, double probability, String modelVersion) implements DomainEvent {}
  public record DuplicatesCorrelated(UUID incidentId, Instant occurredAt, UUID masterId, double linkScore) implements DomainEvent {}
  public record AiSuggestionIssued(UUID incidentId, Instant occurredAt, UUID suggestionId, String kind, double confidence, boolean fromFallback) implements DomainEvent {}
  public record AiSuggestionOutcomeRecorded(UUID incidentId, Instant occurredAt, UUID suggestionId, String outcome, UUID actor) implements DomainEvent {}
}
