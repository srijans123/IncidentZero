package edu.campus.iitsm.shared.domain;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicReference;

public final class VirtualAnchoredClock implements ClockPort {
  private record Anchor(Instant virtualInstant, long realNanos, int scaleFactor) {}

  private final AtomicReference<Anchor> state;
  private final Runnable onScaleChangeWakeup;

  public VirtualAnchoredClock(Instant initialInstant, int initialScale, Runnable onScaleChangeWakeup) {
    if (initialScale < 1 || initialScale > 3600) {
      throw new IllegalArgumentException("Scale factor must be in [1, 3600]");
    }
    this.state = new AtomicReference<>(new Anchor(initialInstant, System.nanoTime(), initialScale));
    this.onScaleChangeWakeup = onScaleChangeWakeup;
  }

  @Override
  public Instant now() {
    Anchor a = state.get();
    long elapsedRealNanos = Math.max(0L, System.nanoTime() - a.realNanos());
    return a.virtualInstant().plusNanos(elapsedRealNanos * a.scaleFactor());
  }

  @Override
  public Instant wallNow() {
    return Instant.now();
  }

  @Override
  public int scaleFactor() { return state.get().scaleFactor(); }

  public void setScaleFactor(int newFactor) {
    if (newFactor < 1 || newFactor > 3600) {
      throw new IllegalArgumentException("Scale factor must be in [1, 3600]");
    }
    state.updateAndGet(prev -> {
      long elapsedRealNanos = Math.max(0L, System.nanoTime() - prev.realNanos());
      Instant currentVirtual = prev.virtualInstant().plusNanos(elapsedRealNanos * prev.scaleFactor());
      return new Anchor(currentVirtual, System.nanoTime(), newFactor);
    });
    if (onScaleChangeWakeup != null) onScaleChangeWakeup.run();
  }

  @Override
  public long realNanosUntil(Instant targetVirtualInstant) {
    Anchor a = state.get();
    long elapsedRealNanos = Math.max(0L, System.nanoTime() - a.realNanos());
    Instant currentVirtual = a.virtualInstant().plusNanos(elapsedRealNanos * a.scaleFactor());
    long virtualRemainingNanos = Duration.between(currentVirtual, targetVirtualInstant).toNanos();
    return virtualRemainingNanos <= 0L ? 0L : virtualRemainingNanos / a.scaleFactor();
  }
}
