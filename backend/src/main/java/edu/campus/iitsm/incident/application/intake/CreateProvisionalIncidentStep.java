package edu.campus.iitsm.incident.application.intake;

import edu.campus.iitsm.incident.domain.Incident;
import edu.campus.iitsm.incident.domain.Priority;
import edu.campus.iitsm.incident.domain.PriorityExplanation;
import edu.campus.iitsm.incident.domain.SlaSnapshot;
import edu.campus.iitsm.shared.domain.ClockPort;
import edu.campus.iitsm.shared.domain.IdGeneratorPort;
import edu.campus.iitsm.incident.application.sla.SlaPolicyResolver;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

@Component
@Order(3)
public class CreateProvisionalIncidentStep extends AbstractIntakeStep {

  private final IdGeneratorPort idGeneratorPort;
  private final SlaPolicyResolver slaPolicyResolver;

  public CreateProvisionalIncidentStep(ClockPort clockPort, IdGeneratorPort idGeneratorPort, SlaPolicyResolver slaPolicyResolver) {
    super(clockPort);
    this.idGeneratorPort = idGeneratorPort;
    this.slaPolicyResolver = slaPolicyResolver;
  }

  @Override
  public int order() {
    return 3;
  }

  @Override
  protected void doExecute(IntakeContext ctx) {
    UUID incidentId = idGeneratorPort.newUuidV7();
    String incNumber = idGeneratorPort.nextIncidentNumber(2026);
    Instant now = clockPort.now();

    String tier = (ctx.serviceTier != null) ? ctx.serviceTier : "T2";
    SlaSnapshot provisionalSla = slaPolicyResolver.resolve(tier, Priority.P3);
    PriorityExplanation provisionalExplanation = PriorityExplanation.empty();

    ctx.incident = Incident.createWithNumber(
        incidentId,
        incNumber,
        ctx.actorId,
        ctx.serviceId,
        ctx.redactedTitle != null ? ctx.redactedTitle : ctx.rawTitle,
        ctx.redactedDescription != null ? ctx.redactedDescription : ctx.rawDescription,
        ctx.impact,
        ctx.urgency,
        Priority.P3,
        provisionalExplanation,
        provisionalSla,
        now
    );
  }
}
