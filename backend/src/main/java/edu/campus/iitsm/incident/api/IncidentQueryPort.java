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
      UUID parentId,
      Boolean mine,
      UUID callerId,
      String callerRole,
      String q,
      String cursor,
      int limit
  );

  default IncidentDtos.PageResponse<IncidentDtos.IncidentSummaryDto> listIncidents(
      String status,
      String priority,
      UUID serviceId,
      String q,
      String cursor,
      int limit
  ) {
    return listIncidents(status, priority, serviceId, null, null, null, null, q, cursor, limit);
  }
  List<IncidentDtos.AuditTimelineItemDto> getTimeline(UUID incidentId);
  Optional<IncidentDtos.ServiceDto> findService(String serviceCode, UUID serviceId);
  List<IncidentDtos.ServiceDto> listServices();
}
