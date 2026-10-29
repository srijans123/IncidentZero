package edu.campus.iitsm.shared.domain;

import java.time.Instant;

public interface WorkingTimeCalculator {
  long workingMillisBetween(Instant start, Instant end, boolean is24x7);
  Instant addWorkingMillis(Instant from, long millisToAdd, boolean is24x7);
}
