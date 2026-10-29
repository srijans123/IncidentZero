package edu.campus.iitsm.audit.api;

public record AuditVerificationResult(
    boolean valid,
    Long firstCorruptedRowId,
    int totalRecordsVerified,
    String failureReason
) {}
