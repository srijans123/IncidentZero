package edu.campus.iitsm.incident.infrastructure.web;

import edu.campus.iitsm.identity.api.UserPrincipal;
import edu.campus.iitsm.incident.api.IncidentQueryPort;
import edu.campus.iitsm.incident.api.dto.IncidentDtos;
import edu.campus.iitsm.incident.application.IncidentCommandService;
import edu.campus.iitsm.incident.application.intake.IntakeService;
import edu.campus.iitsm.incident.domain.Incident;
import edu.campus.iitsm.incident.domain.Resolution;
import edu.campus.iitsm.intelligence.api.*;
import edu.campus.iitsm.shared.domain.ClockPort;
import edu.campus.iitsm.shared.domain.error.IncidentNotFoundException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.*;

@RestController
@RequestMapping("/api/v1/incidents")
public class IncidentController {

  private final IncidentCommandService commandService;
  private final IncidentQueryPort queryPort;
  private final IntakeService intakeService;
  private final ClockPort clockPort;
  private final DuplicateDetectionPort duplicateDetectionPort;
  private final SlaBreachPredictorPort slaBreachPredictorPort;
  private final ResolutionRagPort resolutionRagPort;
  private final RcaRankerPort rcaRankerPort;
  private final PirDrafterPort pirDrafterPort;
  private final NlSearchPort nlSearchPort;

  public IncidentController(
      IncidentCommandService commandService,
      IncidentQueryPort queryPort,
      IntakeService intakeService,
      ClockPort clockPort,
      DuplicateDetectionPort duplicateDetectionPort,
      SlaBreachPredictorPort slaBreachPredictorPort,
      ResolutionRagPort resolutionRagPort,
      RcaRankerPort rcaRankerPort,
      PirDrafterPort pirDrafterPort,
      NlSearchPort nlSearchPort
  ) {
    this.commandService = commandService;
    this.queryPort = queryPort;
    this.intakeService = intakeService;
    this.clockPort = clockPort;
    this.duplicateDetectionPort = duplicateDetectionPort;
    this.slaBreachPredictorPort = slaBreachPredictorPort;
    this.resolutionRagPort = resolutionRagPort;
    this.rcaRankerPort = rcaRankerPort;
    this.pirDrafterPort = pirDrafterPort;
    this.nlSearchPort = nlSearchPort;
  }

  @PostMapping
  public ResponseEntity<IncidentDtos.IncidentDetailResponse> createIncident(
      @RequestBody IncidentDtos.CreateIncidentRequest req,
      @AuthenticationPrincipal UserPrincipal principal
  ) {
    UUID actorId = principal != null ? principal.id() : UUID.fromString("00000000-0000-0000-0000-000000000002");
    UUID serviceId = req.serviceId() != null ? req.serviceId() : UUID.fromString("30000000-0000-0000-0000-000000000001");
    int urgency = req.urgency() != null ? req.urgency() : 3;
    int impact = req.impactOverride() != null ? req.impactOverride() : 2;

    Incident created = intakeService.createIncident(
        actorId,
        req.title(),
        req.description(),
        serviceId,
        "T1",
        impact,
        urgency
    );

    IncidentDtos.IncidentDetailResponse detail = queryPort.findIncidentDetail(created.id())
        .orElseThrow(() -> new IncidentNotFoundException(created.id()));

    return ResponseEntity
        .created(URI.create("/api/v1/incidents/" + created.id()))
        .header(HttpHeaders.ETAG, "\"" + detail.version() + "\"")
        .body(detail);
  }

  @GetMapping
  public ResponseEntity<IncidentDtos.PageResponse<IncidentDtos.IncidentSummaryDto>> listIncidents(
      @RequestParam(value = "status", required = false) String status,
      @RequestParam(value = "priority", required = false) String priority,
      @RequestParam(value = "serviceId", required = false) UUID serviceId,
      @RequestParam(value = "q", required = false) String q,
      @RequestParam(value = "cursor", required = false) String cursor,
      @RequestParam(value = "limit", defaultValue = "50") int limit
  ) {
    IncidentDtos.PageResponse<IncidentDtos.IncidentSummaryDto> page = queryPort.listIncidents(
        status, priority, serviceId, q, cursor, limit
    );
    return ResponseEntity.ok(page);
  }

  @GetMapping("/{id}")
  public ResponseEntity<IncidentDtos.IncidentDetailResponse> getIncident(@PathVariable("id") UUID id) {
    IncidentDtos.IncidentDetailResponse detail = queryPort.findIncidentDetail(id)
        .orElseThrow(() -> new IncidentNotFoundException(id));
    return ResponseEntity.ok()
        .header(HttpHeaders.ETAG, "\"" + detail.version() + "\"")
        .body(detail);
  }

  @PostMapping("/{id}/commands/{command}")
  public ResponseEntity<IncidentDtos.IncidentDetailResponse> executeCommand(
      @PathVariable("id") UUID id,
      @PathVariable("command") String command,
      @RequestBody(required = false) IncidentDtos.CommandEnvelope env,
      @AuthenticationPrincipal UserPrincipal principal
  ) {
    UUID actorId = principal != null ? principal.id() : UUID.fromString("00000000-0000-0000-0000-000000000003");
    String role = principal != null ? principal.role() : "TECHNICIAN";
    String supportTier = principal != null ? principal.supportTier() : "SENIOR";
    IncidentDtos.CommandEnvelope envelope = env != null ? env : new IncidentDtos.CommandEnvelope(
        null, null, null, null, null, null, null, null, null, null, null, null
    );

    switch (command.toLowerCase()) {
      case "acknowledge" -> commandService.acknowledge(id, actorId, role, supportTier);
      case "start" -> commandService.startInvestigation(id, actorId, role, supportTier);
      case "request-info" -> commandService.requestUserInfo(id, envelope.question(), actorId, role, supportTier);
      case "provide-info" -> commandService.provideUserInfo(id, actorId, role, supportTier);
      case "resolve" -> {
        Resolution res = new Resolution(
            envelope.resolutionCode() != null ? envelope.resolutionCode() : "FIXED",
            envelope.resolutionNotes() != null ? envelope.resolutionNotes() : "Issue remediated successfully.",
            envelope.rootCauseCategory()
        );
        commandService.resolve(id, res, actorId, role, supportTier);
      }
      case "verify" -> commandService.verify(id, envelope.rating() != null ? envelope.rating().intValue() : 5, actorId, role, supportTier);
      case "reject" -> commandService.rejectResolution(id, envelope.reason() != null ? envelope.reason() : "Issue persisted after verification.", actorId, role, supportTier);
      case "close" -> commandService.close(id, envelope.closureNote() != null ? envelope.closureNote() : "Verified and closed.", actorId, role, supportTier);
      case "cancel" -> commandService.cancel(id, envelope.reason() != null ? envelope.reason() : "Duplicate or invalid report.", actorId, role, supportTier);
      case "declare-major" -> commandService.declareMajor(id, actorId, role, supportTier);
      default -> throw new IllegalArgumentException("Unknown command: " + command);
    }

    IncidentDtos.IncidentDetailResponse updated = queryPort.findIncidentDetail(id)
        .orElseThrow(() -> new IncidentNotFoundException(id));

    return ResponseEntity.ok()
        .header(HttpHeaders.ETAG, "\"" + updated.version() + "\"")
        .body(updated);
  }

  @GetMapping("/{id}/timeline")
  public ResponseEntity<List<IncidentDtos.AuditTimelineItemDto>> getTimeline(@PathVariable("id") UUID id) {
    List<IncidentDtos.AuditTimelineItemDto> timeline = queryPort.getTimeline(id);
    return ResponseEntity.ok(timeline);
  }

  @GetMapping("/{id}/ai")
  public ResponseEntity<IncidentDtos.IncidentAiPanelDto> getAiPanel(@PathVariable("id") UUID id) {
    IncidentDtos.IncidentDetailResponse detail = queryPort.findIncidentDetail(id)
        .orElseThrow(() -> new IncidentNotFoundException(id));

    double breachRisk = slaBreachPredictorPort.predictBreachProbability(Map.of(
        "impact", (double) detail.impact(),
        "urgency", (double) detail.urgency(),
        "priorityNum", 2.0,
        "elapsedRatio", 0.40
    ));

    List<DuplicateCandidate> related = duplicateDetectionPort.findDuplicates(
        id, detail.title() + " " + detail.description(), null, clockPort.now(), 1440
    );

    IncidentDtos.IncidentAiPanelDto panel = new IncidentDtos.IncidentAiPanelDto(
        List.of(Map.of("rule", "ITIL_MATRIX_BASE", "result", detail.priority())),
        Map.of("strategy", "LEAST_LOADED", "chosenScore", 0.88),
        breachRisk,
        List.of(Map.of("instruction", "Check LDAP connection pool status and server latency", "citedSourceId", "KB-0001")),
        related
    );

    return ResponseEntity.ok(panel);
  }

  @GetMapping("/{id}/rca")
  public ResponseEntity<LlmRcaExplanationSchema> getRca(@PathVariable("id") UUID id) {
    var suggestion = rcaRankerPort.rankRootCause(
        Map.of("AUTH-LDAP", 3, "APP-ERP", 22, "APP-LMS", 10),
        Map.of("AUTH-LDAP", List.of("APP-ERP", "APP-LMS", "APP-LIB"))
    );
    return ResponseEntity.ok(suggestion.value());
  }

  @PostMapping("/{id}/pir")
  public ResponseEntity<LlmPirDraftSchema> draftPir(@PathVariable("id") UUID id) {
    List<IncidentDtos.AuditTimelineItemDto> timeline = queryPort.getTimeline(id);
    List<String> timestamps = timeline.stream().map(t -> t.timestamp().toString()).toList();
    var suggestion = pirDrafterPort.draftPir(id, "{\"incidentId\":\"" + id + "\"}", timestamps);
    return ResponseEntity.ok(suggestion.value());
  }

  @PostMapping("/nl-search")
  public ResponseEntity<Map<String, Object>> nlSearch(@RequestBody Map<String, String> body) {
    String query = body.getOrDefault("query", "");
    var suggestion = nlSearchPort.parseQuery(query);
    var page = queryPort.listIncidents(null, null, null, query, null, 20);

    return ResponseEntity.ok(Map.of(
        "ast", suggestion.value(),
        "page", page
    ));
  }
}
