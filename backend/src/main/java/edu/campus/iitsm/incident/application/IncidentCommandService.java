package edu.campus.iitsm.incident.application;

import edu.campus.iitsm.incident.application.sla.SlaPolicyResolver;
import edu.campus.iitsm.incident.domain.*;
import edu.campus.iitsm.shared.domain.ClockPort;
import edu.campus.iitsm.shared.domain.DomainEvent;
import edu.campus.iitsm.shared.domain.WorkingTimeCalculator;
import edu.campus.iitsm.shared.domain.error.IncidentNotFoundException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class IncidentCommandService {

  private final IncidentRepository incidentRepository;
  private final CommandAuthorizer commandAuthorizer;
  private final ClockPort clockPort;
  private final WorkingTimeCalculator calendar;
  private final SlaPolicyResolver slaPolicyResolver;
  private final ApplicationEventPublisher eventPublisher;

  public IncidentCommandService(
      IncidentRepository incidentRepository,
      CommandAuthorizer commandAuthorizer,
      ClockPort clockPort,
      WorkingTimeCalculator calendar,
      SlaPolicyResolver slaPolicyResolver,
      ApplicationEventPublisher eventPublisher) {
    this.incidentRepository = incidentRepository;
    this.commandAuthorizer = commandAuthorizer;
    this.clockPort = clockPort;
    this.calendar = calendar;
    this.slaPolicyResolver = slaPolicyResolver;
    this.eventPublisher = eventPublisher;
  }

  private Incident load(UUID id) {
    return incidentRepository.findById(id)
        .orElseThrow(() -> new IncidentNotFoundException(id));
  }

  private void commitAndPublish(Incident incident) {
    incidentRepository.save(incident);
    List<DomainEvent> events = incident.pullEvents();
    for (DomainEvent event : events) {
      eventPublisher.publishEvent(event);
    }
  }

  @Transactional
  public void acknowledge(UUID incidentId, UUID actorId, String role, String supportTier) {
    Incident inc = load(incidentId);
    commandAuthorizer.authorize(inc, CommandType.ACKNOWLEDGE, actorId, role, supportTier);
    Instant now = clockPort.now();
    inc.acknowledge(actorId, now, calendar);
    commitAndPublish(inc);
  }

  @Transactional
  public void startInvestigation(UUID incidentId, UUID actorId, String role, String supportTier) {
    Incident inc = load(incidentId);
    commandAuthorizer.authorize(inc, CommandType.START_INVESTIGATION, actorId, role, supportTier);
    Instant now = clockPort.now();
    inc.startInvestigation(actorId, now, calendar);
    commitAndPublish(inc);
  }

  @Transactional
  public void requestUserInfo(UUID incidentId, String question, UUID actorId, String role, String supportTier) {
    Incident inc = load(incidentId);
    commandAuthorizer.authorize(inc, CommandType.REQUEST_USER_INFO, actorId, role, supportTier);
    Instant now = clockPort.now();
    inc.requestUserInfo(actorId, question, now, calendar);
    commitAndPublish(inc);
  }

  @Transactional
  public void provideUserInfo(UUID incidentId, UUID actorId, String role, String supportTier) {
    Incident inc = load(incidentId);
    commandAuthorizer.authorize(inc, CommandType.PROVIDE_USER_INFO, actorId, role, supportTier);
    Instant now = clockPort.now();
    inc.provideUserInfo(actorId, now);
    commitAndPublish(inc);
  }

  @Transactional
  public void resolve(UUID incidentId, Resolution resolution, UUID actorId, String role, String supportTier) {
    Incident inc = load(incidentId);
    commandAuthorizer.authorize(inc, CommandType.RESOLVE, actorId, role, supportTier);
    Instant now = clockPort.now();
    inc.resolve(actorId, resolution, now, calendar);
    commitAndPublish(inc);
  }

  @Transactional
  public void verify(UUID incidentId, Integer rating, UUID actorId, String role, String supportTier) {
    Incident inc = load(incidentId);
    commandAuthorizer.authorize(inc, CommandType.VERIFY, actorId, role, supportTier);
    Instant now = clockPort.now();
    inc.verify(actorId, rating, now);
    commitAndPublish(inc);
  }

  @Transactional
  public void rejectResolution(UUID incidentId, String reason, UUID actorId, String role, String supportTier) {
    Incident inc = load(incidentId);
    commandAuthorizer.authorize(inc, CommandType.REJECT_RESOLUTION, actorId, role, supportTier);
    Instant now = clockPort.now();
    inc.rejectResolution(actorId, reason, now);
    commitAndPublish(inc);
  }

  @Transactional
  public void close(UUID incidentId, String note, UUID actorId, String role, String supportTier) {
    Incident inc = load(incidentId);
    commandAuthorizer.authorize(inc, CommandType.CLOSE, actorId, role, supportTier);
    Instant now = clockPort.now();
    inc.close(actorId, note, now);
    commitAndPublish(inc);
  }

  @Transactional
  public void cancel(UUID incidentId, String reason, UUID actorId, String role, String supportTier) {
    Incident inc = load(incidentId);
    commandAuthorizer.authorize(inc, CommandType.CANCEL, actorId, role, supportTier);
    Instant now = clockPort.now();
    inc.cancel(actorId, reason, now, calendar);
    commitAndPublish(inc);
  }

  @Transactional
  public void declareMajor(UUID incidentId, UUID actorId, String role, String supportTier) {
    Incident inc = load(incidentId);
    commandAuthorizer.authorize(inc, CommandType.DECLARE_MAJOR, actorId, role, supportTier);
    Instant now = clockPort.now();
    String tier = inc.sla() != null ? inc.sla().tier() : "T0";
    SlaSnapshot p1Sla = slaPolicyResolver.resolve(tier, Priority.P1);
    inc.declareMajor(actorId, p1Sla, now, calendar);
    commitAndPublish(inc);
  }
}
