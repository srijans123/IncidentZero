package edu.campus.iitsm.incident.application.intake;

import edu.campus.iitsm.incident.api.AssignmentPort;
import edu.campus.iitsm.incident.domain.IncidentStatus;
import edu.campus.iitsm.incident.domain.Priority;
import edu.campus.iitsm.shared.domain.Actors;
import edu.campus.iitsm.shared.domain.ClockPort;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Optional;

@Component
@Order(8)
public class AssignStep extends AbstractIntakeStep {

  private final Optional<AssignmentPort> assignmentPort;

  public AssignStep(ClockPort clockPort, Optional<AssignmentPort> assignmentPort) {
    super(clockPort);
    this.assignmentPort = assignmentPort;
  }

  @Override
  public int order() {
    return 8;
  }

  @Override
  protected void doExecute(IntakeContext ctx) {
    if (ctx.skipClassificationAndAssignment || ctx.incident == null) return;
    if (ctx.incident.status() != IncidentStatus.CLASSIFIED) return;
    if (assignmentPort == null || assignmentPort.isEmpty()) return;

    Priority p = ctx.incident.priority() != null ? ctx.incident.priority() : Priority.P3;
    double weight = switch (p) {
      case P1 -> 3.0;
      case P2 -> 2.0;
      case P3 -> 1.0;
      case P4 -> 0.5;
    };

    assignmentPort.get().assign(ctx.incident.id(), ctx.serviceId, p, weight)
        .ifPresent(res -> {
          Instant now = clockPort.now();
          ctx.incident.assign(res.chosenTechnicianId(), res.teamId(), res.strategy(), Actors.SYSTEM, now);
          log.info("Incident {} assigned to technician {} via strategy {}",
              ctx.incident.id(), res.chosenTechnicianId(), res.strategy());
        });
  }
}
