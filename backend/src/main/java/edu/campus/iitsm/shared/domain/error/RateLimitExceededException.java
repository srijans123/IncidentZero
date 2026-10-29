package edu.campus.iitsm.shared.domain.error;

public final class RateLimitExceededException extends ItsmException {
  private final long retryAfterSeconds;

  public RateLimitExceededException(long retryAfterSeconds) {
    super("ITSM-4290", 429, "Rate limit exceeded; retry after " + retryAfterSeconds + " seconds");
    this.retryAfterSeconds = retryAfterSeconds;
  }
  public long retryAfterSeconds() { return retryAfterSeconds; }
}
