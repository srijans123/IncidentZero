package edu.campus.iitsm.incident.application.intake;

import edu.campus.iitsm.incident.domain.Incident;
import edu.campus.iitsm.intake.application.IntakeStep;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class IntakeService {

  private final IntakePipeline pipeline;

  public IntakeService(IntakePipeline pipeline) {
    this.pipeline = pipeline;
  }

  @Transactional
  public Incident createIncident(
      UUID actorId,
      String rawTitle,
      String rawDescription,
      UUID serviceId,
      String serviceTier,
      int impact,
      int urgency
  ) {
    return createIncident(actorId, rawTitle, rawDescription, serviceId, serviceTier, impact, urgency, null);
  }

  @Transactional
  public Incident createIncident(
      UUID actorId,
      String rawTitle,
      String rawDescription,
      UUID serviceId,
      String serviceTier,
      int impact,
      int urgency,
      UUID masterId
  ) {
    IntakeStep.IntakeContext ctx = new IntakeStep.IntakeContext();
    ctx.actorId = actorId;
    ctx.rawTitle = rawTitle;
    ctx.rawDescription = rawDescription;
    ctx.serviceId = serviceId;
    ctx.serviceTier = serviceTier;
    ctx.impact = impact;
    ctx.urgency = urgency;
    ctx.autoLinkedMasterId = masterId;

    pipeline.process(ctx);
    return ctx.incident;
  }

  @Transactional
  public IntakeStep.IntakeContext executePipeline(IntakeStep.IntakeContext ctx) {
    return pipeline.process(ctx);
  }
}
