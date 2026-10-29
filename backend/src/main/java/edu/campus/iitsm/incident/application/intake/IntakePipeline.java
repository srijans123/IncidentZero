package edu.campus.iitsm.incident.application.intake;

import edu.campus.iitsm.intake.application.IntakeStep;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
public class IntakePipeline {

  private final List<IntakeStep> sortedSteps;

  public IntakePipeline(List<IntakeStep> steps) {
    this.sortedSteps = (steps != null)
        ? steps.stream().sorted(Comparator.comparingInt(IntakeStep::order)).toList()
        : List.of();
  }

  public IntakeStep.IntakeContext process(IntakeStep.IntakeContext ctx) {
    for (IntakeStep step : sortedSteps) {
      step.execute(ctx);
    }
    return ctx;
  }
}
