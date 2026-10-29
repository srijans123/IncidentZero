package edu.campus.iitsm.shared.domain.error;

public final class ServiceNotFoundException extends ItsmException {
  public ServiceNotFoundException(String serviceCode) {
    super("ITSM-4042", 404, "IT Service not found: " + serviceCode);
  }
}
