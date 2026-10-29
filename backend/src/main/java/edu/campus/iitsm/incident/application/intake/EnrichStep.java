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
    String fullText = ((ctx.rawTitle != null ? ctx.rawTitle : "") + " " + (ctx.rawDescription != null ? ctx.rawDescription : "")).toLowerCase();
    if (fullText.contains("quiz") || fullText.contains("exam") || fullText.contains("registration")) {
      ctx.activeCalendarWindow = true;
    }
  }
}
