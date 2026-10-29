package edu.campus.iitsm.shared.domain.error;

public final class MissingSlaConfigurationException extends ItsmException {
  public MissingSlaConfigurationException(String tier, String priority) {
    super("ITSM-5001", 500, "Missing SLA policy for tier=" + tier + ", priority=" + priority);
  }
}
