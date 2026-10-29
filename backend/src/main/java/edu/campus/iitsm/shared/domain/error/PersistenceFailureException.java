package edu.campus.iitsm.shared.domain.error;

public final class PersistenceFailureException extends ItsmException {
  public PersistenceFailureException(String detail) {
    super("ITSM-5030", 503, "Database persistence failure: " + detail);
  }
}
