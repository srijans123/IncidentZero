package edu.campus.iitsm.incident.application.intake;

import edu.campus.iitsm.intake.application.IntakeStep;
import edu.campus.iitsm.shared.domain.ClockPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.time.Instant;

public abstract class AbstractIntakeStep implements IntakeStep {
  protected final Logger log = LoggerFactory.getLogger(getClass());
  protected final ClockPort clockPort;

  protected AbstractIntakeStep(ClockPort clockPort) {
    this.clockPort = clockPort;
  }

  @Override
  public final void execute(IntakeContext ctx) {
    Instant start = clockPort.now();
    try {
      if (shouldExecute(ctx)) {
        doExecute(ctx);
      }
    } catch (Exception e) {
      log.warn("Error in intake step {}: {}", getClass().getSimpleName(), e.getMessage());
      onFailure(ctx, e);
    } finally {
      Duration duration = Duration.between(start, clockPort.now());
      log.debug("Intake step {} completed in {}ms", getClass().getSimpleName(), duration.toMillis());
    }
  }

  protected boolean shouldExecute(IntakeContext ctx) {
    return true;
  }

  protected abstract void doExecute(IntakeContext ctx);

  protected void onFailure(IntakeContext ctx, Exception e) {
    if (e instanceof RuntimeException re) throw re;
    throw new RuntimeException(e);
  }
}
