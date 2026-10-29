package edu.campus.iitsm.audit.api;

import java.util.UUID;

public interface AuditVerificationPort {
  AuditVerificationResult verifyAllLedgers();
  AuditVerificationResult verifyLedger(UUID incidentId);
}
