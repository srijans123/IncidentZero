package edu.campus.iitsm.incident.application.intake;

import edu.campus.iitsm.shared.domain.ClockPort;
import edu.campus.iitsm.shared.domain.error.InvalidIncidentPayloadException;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class ValidateStep extends AbstractIntakeStep {

  public ValidateStep(ClockPort clockPort) {
    super(clockPort);
  }

  @Override
  public int order() {
    return 1;
  }

  @Override
  protected void doExecute(IntakeContext ctx) {
    if (ctx.rawTitle == null || ctx.rawTitle.trim().length() < 5 || ctx.rawTitle.trim().length() > 200) {
      throw new InvalidIncidentPayloadException("title", "Title length must be between 5 and 200 characters");
    }
    if (ctx.rawDescription == null || ctx.rawDescription.trim().length() < 10 || ctx.rawDescription.trim().length() > 4000) {
      throw new InvalidIncidentPayloadException("description", "Description length must be between 10 and 4000 characters");
    }
    if (ctx.urgency < 1 || ctx.urgency > 3) {
      throw new InvalidIncidentPayloadException("urgency", "Urgency must be between 1 and 3");
    }
    if (ctx.impact < 1 || ctx.impact > 3) {
      throw new InvalidIncidentPayloadException("impact", "Impact must be between 1 and 3");
    }
  }
}
