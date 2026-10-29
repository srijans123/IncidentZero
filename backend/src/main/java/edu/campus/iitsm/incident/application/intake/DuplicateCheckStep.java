package edu.campus.iitsm.incident.application.intake;

import edu.campus.iitsm.shared.domain.ClockPort;
import edu.campus.iitsm.shared.domain.WorkingTimeCalculator;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@Order(4)
public class DuplicateCheckStep extends AbstractIntakeStep {

  private final WorkingTimeCalculator calendar;

  public DuplicateCheckStep(ClockPort clockPort, WorkingTimeCalculator calendar) {
    super(clockPort);
    this.calendar = calendar;
  }

  @Override
  public int order() {
    return 4;
  }

  @Override
  protected void doExecute(IntakeContext ctx) {
    if (ctx.incident == null) return;

    if (ctx.autoLinkedMasterId != null) {
      Instant now = clockPort.now();
      ctx.incident.linkAsChild(ctx.autoLinkedMasterId, now, calendar);
      ctx.skipClassificationAndAssignment = true;
      log.info("Incident {} auto-linked as child of master {}", ctx.incident.id(), ctx.autoLinkedMasterId);
    }
  }
}
