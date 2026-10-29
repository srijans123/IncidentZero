package edu.campus.iitsm;

import edu.campus.iitsm.catalog.domain.BusinessCalendar;
import edu.campus.iitsm.incident.domain.ClockMode;
import edu.campus.iitsm.incident.domain.ClockState;
import edu.campus.iitsm.incident.domain.Priority;
import edu.campus.iitsm.incident.domain.SlaClock;
import edu.campus.iitsm.incident.domain.SlaSnapshot;
import edu.campus.iitsm.incident.application.sla.SlaPolicyResolver;
import org.junit.jupiter.api.Test;

import java.time.*;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class SlaClockAndPolicyTest {

  @Test
  void testSlaPolicyResolution() {
    SlaPolicyResolver resolver = new SlaPolicyResolver();

    // T0 P1: 5m resp (300,000ms), 30m res (1,800,000ms), CONTINUOUS_24X7
    SlaSnapshot t0p1 = resolver.resolve("T0", Priority.P1);
    assertEquals("T0", t0p1.tier());
    assertEquals(300_000L, t0p1.responseTargetMs());
    assertEquals(1_800_000L, t0p1.resolutionTargetMs());
    assertEquals(ClockMode.CONTINUOUS_24X7, t0p1.mode());

    // T2 P3: 120m resp (7,200,000ms), 720m res (43,200,000ms), BUSINESS_HOURS
    SlaSnapshot t2p3 = resolver.resolve("T2", Priority.P3);
    assertEquals("T2", t2p3.tier());
    assertEquals(7_200_000L, t2p3.responseTargetMs());
    assertEquals(43_200_000L, t2p3.resolutionTargetMs());
    assertEquals(ClockMode.BUSINESS_HOURS, t2p3.mode());
  }

  @Test
  void testSlaDualClockLifecycleAndPause() {
    ZoneId zone = ZoneId.of("Asia/Kolkata");
    BusinessCalendar cal = new BusinessCalendar(
        zone,
        Set.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY),
        LocalTime.of(8, 0),
        LocalTime.of(18, 0),
        Set.of()
    );

    // Monday 09:00:00
    Instant t0 = ZonedDateTime.of(LocalDate.of(2026, 3, 2), LocalTime.of(9, 0), zone).toInstant();
    SlaClock clock = SlaClock.start(t0, 600_000L, ClockMode.CONTINUOUS_24X7); // 10 minutes target
    assertEquals(ClockState.RUNNING, clock.state());
    assertEquals(600_000L, clock.remainingMs(t0, cal));

    // 4 minutes later: Monday 09:04:00
    Instant t1 = t0.plus(Duration.ofMinutes(4));
    assertEquals(360_000L, clock.remainingMs(t1, cal));

    // Pause clock at t1
    clock = clock.pause(t1, cal);
    assertEquals(ClockState.PAUSED, clock.state());

    // 20 minutes pass while paused: Monday 09:24:00
    Instant t2 = t1.plus(Duration.ofMinutes(20));
    // Remaining time must not change during pause
    assertEquals(360_000L, clock.remainingMs(t2, cal));

    // Resume clock at t2
    clock = clock.resume(t2);
    assertEquals(ClockState.RUNNING, clock.state());

    // 2 minutes later: Monday 09:26:00
    Instant t3 = t2.plus(Duration.ofMinutes(2));
    assertEquals(240_000L, clock.remainingMs(t3, cal));

    // Stop clock at t3
    clock = clock.stop(t3, cal);
    assertEquals(ClockState.STOPPED, clock.state());
    assertEquals(360_000L, clock.consumedMs()); // 4m + 2m = 6m consumed = 360,000ms
  }
}
