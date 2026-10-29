package edu.campus.iitsm.incident.application.intake;

import edu.campus.iitsm.shared.domain.ClockPort;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(6)
public class EnrichStep extends AbstractIntakeStep {

  public EnrichStep(ClockPort clockPort) {
    super(clockPort);
  }

  @Override
  public int order() {
    return 6;
  }

  @Override
  protected void doExecute(IntakeContext ctx) {
    if (ctx.skipClassificationAndAssignment) return;
  }
}
