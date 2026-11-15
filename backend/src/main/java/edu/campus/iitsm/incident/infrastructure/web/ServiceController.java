package edu.campus.iitsm.incident.infrastructure.web;

import edu.campus.iitsm.incident.api.IncidentQueryPort;
import edu.campus.iitsm.incident.api.dto.IncidentDtos;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/services")
public class ServiceController {

  private final IncidentQueryPort queryPort;

  public ServiceController(IncidentQueryPort queryPort) {
    this.queryPort = queryPort;
  }

  @GetMapping
  public ResponseEntity<List<IncidentDtos.ServiceDto>> listServices() {
    return ResponseEntity.ok(queryPort.listServices());
  }
}
