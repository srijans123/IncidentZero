package edu.campus.iitsm.catalog.domain;

import edu.campus.iitsm.shared.domain.WorkingTimeCalculator;
import java.time.*;
import java.util.Set;

public final class BusinessCalendar implements WorkingTimeCalculator {
  private final ZoneId zone;
  private final Set<DayOfWeek> workDays;
  private final LocalTime dayStart;
  private final LocalTime dayEnd;
  private final Set<LocalDate> holidays;

  public BusinessCalendar(ZoneId zone, Set<DayOfWeek> workDays,
                          LocalTime dayStart, LocalTime dayEnd, Set<LocalDate> holidays) {
    if (!dayEnd.isAfter(dayStart)) {
      throw new IllegalArgumentException("dayEnd must be after dayStart");
    }
    if (workDays == null || workDays.isEmpty()) {
      throw new IllegalArgumentException("at least one working day is required");
    }
    this.zone = zone;
    this.workDays = Set.copyOf(workDays);
    this.dayStart = dayStart;
    this.dayEnd = dayEnd;
    this.holidays = Set.copyOf(holidays);
  }

  public boolean isWorkingDay(LocalDate date) {
    return workDays.contains(date.getDayOfWeek()) && !holidays.contains(date);
  }

  @Override
  public long workingMillisBetween(Instant start, Instant end, boolean is24x7) {
    if (!end.isAfter(start)) return 0L;
    if (is24x7) return Duration.between(start, end).toMillis();

    ZonedDateTime cur = start.atZone(zone);
    ZonedDateTime stop = end.atZone(zone);
    long totalMs = 0L;
    int guardDays = 0;

    while (!cur.toLocalDate().isAfter(stop.toLocalDate())) {
      if (++guardDays > 3700) {
        throw new IllegalStateException("workingMillisBetween span exceeds 10-year horizon guard (3700 days)");
      }
      LocalDate date = cur.toLocalDate();
      if (isWorkingDay(date)) {
        ZonedDateTime winStart = ZonedDateTime.of(date, dayStart, zone);
        ZonedDateTime winEnd = ZonedDateTime.of(date, dayEnd, zone);
        ZonedDateTime effStart = cur.isAfter(winStart) ? cur : winStart;
        ZonedDateTime effEnd = stop.isBefore(winEnd) ? stop : winEnd;
        if (effEnd.isAfter(effStart)) {
          totalMs += Duration.between(effStart, effEnd).toMillis();
        }
      }
      cur = ZonedDateTime.of(date.plusDays(1), dayStart, zone);
    }
    return totalMs;
  }

  @Override
  public Instant addWorkingMillis(Instant from, long millisToAdd, boolean is24x7) {
    if (millisToAdd <= 0L) return from;
    if (is24x7) return from.plusMillis(millisToAdd);

    ZonedDateTime cur = from.atZone(zone);
    long remainingMs = millisToAdd;
    int guardDays = 0;

    while (remainingMs > 0L) {
      if (++guardDays > 3700) {
        throw new IllegalStateException("no working time within 10 years; check holidays and working days");
      }
      LocalDate date = cur.toLocalDate();
      if (isWorkingDay(date)) {
        ZonedDateTime winStart = ZonedDateTime.of(date, dayStart, zone);
        ZonedDateTime winEnd = ZonedDateTime.of(date, dayEnd, zone);
        if (cur.isBefore(winStart)) cur = winStart;
        if (cur.isBefore(winEnd)) {
          long availableTodayMs = Duration.between(cur, winEnd).toMillis();
          if (remainingMs <= availableTodayMs) {
            return cur.plus(Duration.ofMillis(remainingMs)).toInstant();
          }
          remainingMs -= availableTodayMs;
        }
      }
      cur = ZonedDateTime.of(date.plusDays(1), dayStart, zone);
    }
    return cur.toInstant();
  }
}
