package edu.campus.iitsm.shared.domain.error;

public final class InvalidCredentialsException extends ItsmException {
  public InvalidCredentialsException() {
    super("ITSM-4010", 401, "Invalid email or password");
  }
}
