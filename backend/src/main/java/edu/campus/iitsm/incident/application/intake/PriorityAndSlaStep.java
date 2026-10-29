package edu.campus.iitsm.incident.application.intake;

import edu.campus.iitsm.incident.application.priority.ItilMatrixPriorityStrategy;
import edu.campus.iitsm.incident.application.priority.PriorityInput;
import edu.campus.iitsm.incident.application.priority.PriorityResult;
import edu.campus.iitsm.incident.application.priority.PriorityStrategy;
import edu.campus.iitsm.incident.domain.Priority;
import edu.campus.iitsm.incident.domain.SlaSnapshot;
import edu.campus.iitsm.shared.domain.Actors;
import edu.campus.iitsm.shared.domain.ClockPort;
import edu.campus.iitsm.shared.domain.WorkingTimeCalculator;
import edu.campus.iitsm.incident.application.sla.SlaPolicyResolver;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@Order(7)
public class PriorityAndSlaStep extends AbstractIntakeStep {

  private final PriorityStrategy priorityStrategy;
  private final SlaPolicyResolver slaPolicyResolver;
  private final WorkingTimeCalculator calendar;

  public PriorityAndSlaStep(
      ClockPort clockPort,
      List<PriorityStrategy> strategies,
      SlaPolicyResolver slaPolicyResolver,
      WorkingTimeCalculator calendar) {
    super(clockPort);
    this.priorityStrategy = (strategies != null) ? strategies.stream()
        .filter(s -> s instanceof ItilMatrixPriorityStrategy)
        .findFirst()
        .orElseGet(() -> strategies.isEmpty() ? new ItilMatrixPriorityStrategy() : strategies.get(0))
        : new ItilMatrixPriorityStrategy();
    this.slaPolicyResolver = slaPolicyResolver;
    this.calendar = calendar;
  }

  @Override
  public int order() {
    return 7;
  }

  @Override
  protected void doExecute(IntakeContext ctx) {
    if (ctx.skipClassificationAndAssignment || ctx.incident == null) return;

    String tier = (ctx.serviceTier != null) ? ctx.serviceTier : "T2";
    PriorityInput in = new PriorityInput(
        ctx.impact,
        ctx.urgency,
        tier,
        ctx.incident.affectedUsers(),
        ctx.activeCalendarWindow,
        ctx.securityCategory,
        ctx.linkedReportsIn15Min
    );

    PriorityResult result = priorityStrategy.calculate(in);
    SlaSnapshot sla = slaPolicyResolver.resolve(tier, result.priority());
    Instant now = clockPort.now();

    ctx.incident.classify(
        ctx.categoryId,
        result.priority(),
        result.explanation(),
        sla,
        Actors.SYSTEM,
        now,
        calendar
    );

    if (result.major()) {
      SlaSnapshot p1Sla = slaPolicyResolver.resolve(tier, Priority.P1);
      ctx.incident.declareMajor(Actors.SYSTEM, p1Sla, now, calendar);
    }
  }
}
