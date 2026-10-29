package edu.campus.iitsm;

import edu.campus.iitsm.incident.application.priority.*;
import edu.campus.iitsm.incident.domain.Priority;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PriorityStrategyTest {

  @Test
  void testItilMatrixPriorityStrategyCalculations() {
    ItilMatrixPriorityStrategy itil = new ItilMatrixPriorityStrategy();

    // Impact 3, Urgency 3 -> P1
    PriorityResult r1 = itil.calculate(new PriorityInput(3, 3, "T2", 1, false, false, 0));
    assertEquals(Priority.P1, r1.priority());

    // Impact 1, Urgency 1 -> P4
    PriorityResult r4 = itil.calculate(new PriorityInput(1, 1, "T2", 1, false, false, 0));
    assertEquals(Priority.P4, r4.priority());

    // Security category floor is P2
    PriorityResult sec = itil.calculate(new PriorityInput(1, 1, "T2", 1, false, true, 0));
    assertEquals(Priority.P2, sec.priority());

    // Calendar window bump from P3 to P2
    PriorityResult cal = itil.calculate(new PriorityInput(2, 2, "T2", 1, true, false, 0));
    assertEquals(Priority.P2, cal.priority());

    // Major incident trigger (>= 200 affected users)
    PriorityResult major = itil.calculate(new PriorityInput(2, 2, "T2", 250, false, false, 0));
    assertEquals(Priority.P1, major.priority());
    assertTrue(major.major());
  }

  @Test
  void testProductScorePriorityStrategy() {
    ProductScorePriorityStrategy strategy = new ProductScorePriorityStrategy();
    assertEquals("PRODUCT_SCORE", strategy.name());

    // 3 x 3 x T0(3) = 27 >= 18 -> P1
    PriorityResult p1 = strategy.calculate(new PriorityInput(3, 3, "T0", 1, false, false, 0));
    assertEquals(Priority.P1, p1.priority());

    // 1 x 1 x T3(1) = 1 < 4 -> P4
    PriorityResult p4 = strategy.calculate(new PriorityInput(1, 1, "T3", 1, false, false, 0));
    assertEquals(Priority.P4, p4.priority());
  }

  @Test
  void testWeightedScorePriorityStrategy() {
    WeightedScorePriorityStrategy strategy = new WeightedScorePriorityStrategy();
    assertEquals("WEIGHTED_SCORE", strategy.name());

    PriorityResult p1 = strategy.calculate(new PriorityInput(3, 3, "T0", 250, true, true, 12));
    assertEquals(Priority.P1, p1.priority());

    PriorityResult p4 = strategy.calculate(new PriorityInput(1, 1, "T3", 1, false, false, 0));
    assertEquals(Priority.P4, p4.priority());
  }
}
