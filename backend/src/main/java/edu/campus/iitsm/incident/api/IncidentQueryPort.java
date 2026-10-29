package edu.campus.iitsm.incident.api;

import edu.campus.iitsm.incident.api.dto.IncidentDtos;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IncidentQueryPort {
  Optional<IncidentDtos.IncidentDetailResponse> findIncidentDetail(UUID id);
  IncidentDtos.PageResponse<IncidentDtos.IncidentSummaryDto> listIncidents(
      String status,
      String priority,
      UUID serviceId,
      String q,
      String cursor,
      int limit
  );
  List<IncidentDtos.AuditTimelineItemDto> getTimeline(UUID incidentId);
}
