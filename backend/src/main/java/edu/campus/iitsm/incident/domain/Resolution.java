package edu.campus.iitsm.incident.domain;

import edu.campus.iitsm.shared.domain.error.InvalidIncidentPayloadException;

public record Resolution(String code, String notes, String rootCauseCategory) {
  public Resolution {
    if (code == null || code.isBlank()) throw new InvalidIncidentPayloadException("resolution.code", "must not be blank");
    if (notes == null || notes.strip().length() < 20) {
      throw new InvalidIncidentPayloadException("resolution.notes", "must be at least 20 characters");
    }
    code = code.strip();
    notes = notes.strip();
    rootCauseCategory = (rootCauseCategory == null || rootCauseCategory.isBlank()) ? null : rootCauseCategory.strip();
  }
  public boolean hasRootCause() { return rootCauseCategory != null; }
}
