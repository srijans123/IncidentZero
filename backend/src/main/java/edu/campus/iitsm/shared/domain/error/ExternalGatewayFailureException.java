package edu.campus.iitsm.shared.domain.error;

public final class ExternalGatewayFailureException extends ItsmException {
  public ExternalGatewayFailureException(String provider, String reason) {
    super("ITSM-5031", 503, "External AI gateway failure (" + provider + "): " + reason);
  }
}
