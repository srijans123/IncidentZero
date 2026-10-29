package edu.campus.iitsm.shared.domain.error;

public final class InvalidIncidentPayloadException extends ItsmException {
  private final String field;

  public InvalidIncidentPayloadException(String field, String reason) {
    super("ITSM-4220", 422, "Invalid field '" + field + "': " + reason);
    this.field = field;
  }
  public String field() { return field; }
}
