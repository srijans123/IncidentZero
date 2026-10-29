package edu.campus.iitsm.incident.api;

import edu.campus.iitsm.incident.domain.Priority;
import edu.campus.iitsm.incident.domain.Resolution;
import edu.campus.iitsm.shared.domain.DomainEvent;
import java.time.Instant;
import java.util.UUID;

public final class IncidentEvents {
  private IncidentEvents() {}

  public record IncidentCreated(UUID incidentId, Instant occurredAt, UUID reporterId, UUID serviceId, Priority priority) implements DomainEvent {}
  public record IncidentClassified(UUID incidentId, Instant occurredAt, UUID categoryId, Priority priority, UUID actor) implements DomainEvent {}
  public record IncidentAssigned(UUID incidentId, Instant occurredAt, UUID assigneeId, UUID teamId, String strategy, UUID actor) implements DomainEvent {}
  public record IncidentReassigned(UUID incidentId, Instant occurredAt, UUID prevAssignee, UUID newAssignee, String reason, UUID actor) implements DomainEvent {}
  public record IncidentAcknowledged(UUID incidentId, Instant occurredAt, UUID actor) implements DomainEvent {}
  public record InvestigationStarted(UUID incidentId, Instant occurredAt, UUID actor) implements DomainEvent {}
  public record UserInfoRequested(UUID incidentId, Instant occurredAt, UUID actor, String question) implements DomainEvent {}
  public record UserInfoProvided(UUID incidentId, Instant occurredAt, UUID reporter) implements DomainEvent {}
  public record IncidentResolved(UUID incidentId, Instant occurredAt, UUID actor, Resolution resolution) implements DomainEvent {}
  public record ResolutionVerified(UUID incidentId, Instant occurredAt, UUID actor, Integer rating) implements DomainEvent {}
  public record ResolutionRejected(UUID incidentId, Instant occurredAt, UUID reporter, String reason) implements DomainEvent {}
  public record IncidentClosed(UUID incidentId, Instant occurredAt, UUID actor) implements DomainEvent {}
  public record IncidentCancelled(UUID incidentId, Instant occurredAt, UUID actor, String reason) implements DomainEvent {}
  public record IncidentLinked(UUID incidentId, Instant occurredAt, UUID masterId) implements DomainEvent {}
  public record IncidentUnlinked(UUID incidentId, Instant occurredAt, UUID formerMasterId, String reason) implements DomainEvent {}
  public record MajorIncidentDeclared(UUID incidentId, Instant occurredAt, UUID actor) implements DomainEvent {}
  public record PriorityChanged(UUID incidentId, Instant occurredAt, Priority before, Priority after, String reason) implements DomainEvent {}
  public record SlaWarning(UUID incidentId, Instant occurredAt, String kind, int thresholdPercent) implements DomainEvent {}
  public record SlaBreached(UUID incidentId, Instant occurredAt, String kind) implements DomainEvent {}
  public record EscalationTriggered(UUID incidentId, Instant occurredAt, int level, UUID targetUserId, String reason) implements DomainEvent {}
  public record NotificationRequested(UUID incidentId, Instant occurredAt, UUID recipientId, String channel, String template) implements DomainEvent {}
}
