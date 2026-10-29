package edu.campus.iitsm.incident.domain;

import edu.campus.iitsm.shared.domain.WorkingTimeCalculator;
import java.time.Instant;
import java.util.Objects;

public record SlaClock(ClockState state, long consumedMs, Instant lastResumeAt, long targetMs, ClockMode mode) {
  public static SlaClock start(Instant createdAt, long targetMs, ClockMode mode) {
    return new SlaClock(ClockState.RUNNING, 0L, Objects.requireNonNull(createdAt), targetMs, Objects.requireNonNull(mode));
  }

  public SlaClock pause(Instant now, WorkingTimeCalculator cal) {
    if (state != ClockState.RUNNING) return this;
    long delta = cal.workingMillisBetween(lastResumeAt, now, mode == ClockMode.CONTINUOUS_24X7);
    return new SlaClock(ClockState.PAUSED, consumedMs + delta, lastResumeAt, targetMs, mode);
  }

  public SlaClock resume(Instant now) {
    if (state != ClockState.PAUSED) return this;
    return new SlaClock(ClockState.RUNNING, consumedMs, Objects.requireNonNull(now), targetMs, mode);
  }

  public SlaClock stop(Instant now, WorkingTimeCalculator cal) {
    if (state == ClockState.STOPPED) return this;
    long extra = (state == ClockState.RUNNING)
        ? cal.workingMillisBetween(lastResumeAt, now, mode == ClockMode.CONTINUOUS_24X7)
        : 0L;
    return new SlaClock(ClockState.STOPPED, consumedMs + extra, lastResumeAt, targetMs, mode);
  }

  /** Folds elapsed time under the old mode before switching targetMs and newMode. */
  public SlaClock retarget(Instant now, WorkingTimeCalculator cal, long newTargetMs, ClockMode newMode) {
    if (state == ClockState.RUNNING) {
      long delta = cal.workingMillisBetween(lastResumeAt, now, mode == ClockMode.CONTINUOUS_24X7);
      return new SlaClock(ClockState.RUNNING, consumedMs + delta, Objects.requireNonNull(now), newTargetMs, newMode);
    }
    return new SlaClock(state, consumedMs, lastResumeAt, newTargetMs, newMode);
  }

  /** Resumes from accumulated consumedMs when a RESOLVED incident is rejected into REOPENED. */
  public SlaClock reopen(Instant now) {
    return new SlaClock(ClockState.RUNNING, consumedMs, Objects.requireNonNull(now), targetMs, mode);
  }

  public long elapsedMs(Instant now, WorkingTimeCalculator cal) {
    long active = (state == ClockState.RUNNING)
        ? cal.workingMillisBetween(lastResumeAt, now, mode == ClockMode.CONTINUOUS_24X7)
        : 0L;
    return consumedMs + active;
  }

  public long remainingMs(Instant now, WorkingTimeCalculator cal) {
    return targetMs - elapsedMs(now, cal);
  }

  public Instant dueAt(Instant now, WorkingTimeCalculator cal) {
    long rem = Math.max(0L, remainingMs(now, cal));
    return cal.addWorkingMillis(now, rem, mode == ClockMode.CONTINUOUS_24X7);
  }
}
