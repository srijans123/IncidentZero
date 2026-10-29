package edu.campus.iitsm.shared.domain.error;

public final class AuditChainTamperException extends ItsmException {
  public AuditChainTamperException(long corruptedRowId, String reason) {
    super("ITSM-5090", 500, "Audit chain tamper detected at row " + corruptedRowId + ": " + reason);
  }
}
