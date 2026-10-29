package edu.campus.iitsm.intelligence.api;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface DuplicateDetectionPort {
  List<DuplicateCandidate> findDuplicates(
      UUID incidentId,
      String queryText,
      UUID serviceId,
      Instant nowUtc,
      int windowMinutes
  );
}
