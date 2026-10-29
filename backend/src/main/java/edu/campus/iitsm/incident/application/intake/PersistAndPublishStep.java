package edu.campus.iitsm.incident.application.intake;

import edu.campus.iitsm.incident.domain.IncidentRepository;
import edu.campus.iitsm.shared.domain.ClockPort;
import edu.campus.iitsm.shared.domain.DomainEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(9)
public class PersistAndPublishStep extends AbstractIntakeStep {

  private final IncidentRepository incidentRepository;
  private final ApplicationEventPublisher eventPublisher;

  public PersistAndPublishStep(
      ClockPort clockPort,
      IncidentRepository incidentRepository,
      ApplicationEventPublisher eventPublisher) {
    super(clockPort);
    this.incidentRepository = incidentRepository;
    this.eventPublisher = eventPublisher;
  }

  @Override
  public int order() {
    return 9;
  }

  @Override
  protected void doExecute(IntakeContext ctx) {
    if (ctx.incident == null) return;

    incidentRepository.save(ctx.incident);
    List<DomainEvent> events = ctx.incident.pullEvents();
    for (DomainEvent event : events) {
      eventPublisher.publishEvent(event);
    }
    log.info("Incident {} persisted and {} domain events published", ctx.incident.id(), events.size());
  }
}
