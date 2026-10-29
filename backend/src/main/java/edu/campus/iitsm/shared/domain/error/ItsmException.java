package edu.campus.iitsm.shared.domain.error;

public abstract class ItsmException extends RuntimeException {
  private final String code;
  private final int httpStatus;

  protected ItsmException(String code, int httpStatus, String message) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
  }
  public String code() { return code; }
  public int httpStatus() { return httpStatus; }
}
