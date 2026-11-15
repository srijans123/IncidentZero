package edu.campus.iitsm.incident.infrastructure.web;

import edu.campus.iitsm.incident.application.intake.IntakeService;
import edu.campus.iitsm.incident.domain.Incident;
import edu.campus.iitsm.notification.api.SseBroadcastPort;
import edu.campus.iitsm.shared.domain.ClockPort;
import edu.campus.iitsm.shared.domain.VirtualAnchoredClock;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

  private final IntakeService intakeService;
  private final SseBroadcastPort sseHub;
  private final ClockPort clockPort;
  private final JdbcTemplate jdbcTemplate;
  private final edu.campus.iitsm.incident.application.IncidentCommandService commandService;

  public AdminController(
      IntakeService intakeService,
      SseBroadcastPort sseHub,
      ClockPort clockPort,
      JdbcTemplate jdbcTemplate
  ) {
    this(intakeService, sseHub, clockPort, jdbcTemplate, (edu.campus.iitsm.incident.application.IncidentCommandService) null);
  }

  public AdminController(
      IntakeService intakeService,
      SseBroadcastPort sseHub,
      ClockPort clockPort,
      Object legacyAuditPort,
      JdbcTemplate jdbcTemplate
  ) {
    this(intakeService, sseHub, clockPort, jdbcTemplate, (edu.campus.iitsm.incident.application.IncidentCommandService) null);
  }

  @org.springframework.beans.factory.annotation.Autowired
  public AdminController(
      IntakeService intakeService,
      SseBroadcastPort sseHub,
      ClockPort clockPort,
      JdbcTemplate jdbcTemplate,
      edu.campus.iitsm.incident.application.IncidentCommandService commandService
  ) {
    this.intakeService = intakeService;
    this.sseHub = sseHub;
    this.clockPort = clockPort;
    this.jdbcTemplate = jdbcTemplate;
    this.commandService = commandService;
  }

  @PostMapping("/demo-clock")
  public ResponseEntity<Map<String, Object>> setDemoClock(@RequestBody Map<String, Integer> body) {
    int scale = body.getOrDefault("scaleFactor", 1);
    if (clockPort instanceof VirtualAnchoredClock vac) {
      vac.setScaleFactor(scale);
    }
    sseHub.sendHeartbeat();
    return ResponseEntity.ok(Map.of(
        "scaleFactor", scale,
        "virtualNow", clockPort.now().toString()
    ));
  }

  @PostMapping({"/simulate/storm", "/simulate-storm"})
  public ResponseEntity<Map<String, Object>> simulateStorm(
      @RequestBody Map<String, Object> body,
      @org.springframework.security.core.annotation.AuthenticationPrincipal edu.campus.iitsm.identity.api.UserPrincipal principal
  ) {
    String scenario = (String) body.getOrDefault("scenario", "ERP_LDAP_POOL_EXHAUSTION");
    int count = body.containsKey("reportCount") ? ((Number) body.get("reportCount")).intValue() : 40;

    UUID ldapSvc = jdbcTemplate.queryForObject("SELECT id FROM it_service WHERE code = 'AUTH-LDAP'", UUID.class);
    UUID erpSvc = jdbcTemplate.queryForObject("SELECT id FROM it_service WHERE code = 'APP-ERP'", UUID.class);
    UUID lmsSvc = jdbcTemplate.queryForObject("SELECT id FROM it_service WHERE code = 'APP-LMS'", UUID.class);
    UUID libSvc = jdbcTemplate.queryForObject("SELECT id FROM it_service WHERE code = 'APP-LIB'", UUID.class);
    UUID reporter = UUID.fromString("019299a0-0000-7000-8000-000000000002");

    UUID adminActorId = principal != null ? principal.id() : UUID.fromString("019299a0-0000-7000-8000-000000000007");
    String adminRole = principal != null ? principal.role() : "ADMINISTRATOR";
    String adminTier = principal != null ? principal.supportTier() : "TEAM_LEAD";

    int injected = 0;
    int masters = 0;
    int children = 0;

    // Reports 1-3: AUTH-LDAP (T0)
    UUID ldapMaster = null;
    for (int i = 1; i <= Math.min(3, count); i++) {
      try {
        Incident inc = intakeService.createIncident(
            reporter, "LDAP bind timeout on central SSO login page (" + i + ")",
            "SSO redirect failing with timeout error", ldapSvc, "T0", 2, 2, ldapMaster
        );
        if (ldapMaster == null) ldapMaster = inc.id();
        injected++;
        if (inc.parentId() == null) masters++; else children++;
        sseHub.broadcast("storm.progress", Map.of(
            "scenario", scenario, "injectedCount", injected, "totalCount", count, "masterCount", masters, "childCount", children
        ));
      } catch (Exception ex) {
        // Continue injection
      }
    }

    // Reports 4-25: APP-ERP (Course registration, T1)
    UUID erpMaster = null;
    for (int i = 4; i <= Math.min(25, count); i++) {
      try {
        Incident inc = intakeService.createIncident(
            reporter, "Course registration portal stuck on SSO redirect HTTP 504 (" + i + ")",
            "AUGSD course registration portal timeout from student hostel", erpSvc, "T1", 2, 3, erpMaster
        );
        if (erpMaster == null) {
          erpMaster = inc.id();
          if (commandService != null) {
            commandService.declareMajor(erpMaster, adminActorId, adminRole, adminTier);
          }
        }
        injected++;
        if (inc.parentId() == null) masters++; else children++;
        sseHub.broadcast("storm.progress", Map.of(
            "scenario", scenario, "injectedCount", injected, "totalCount", count, "masterCount", masters, "childCount", children
        ));
      } catch (Exception ex) {
        // Continue injection
      }
    }

    // Reports 26-35: APP-LMS
    UUID lmsMaster = null;
    for (int i = 26; i <= Math.min(35, count); i++) {
      try {
        Incident inc = intakeService.createIncident(
            reporter, "LMS quiz login failing with SSO error (" + i + ")",
            "LMS login timeout", lmsSvc, "T1", 2, 2, lmsMaster
        );
        if (lmsMaster == null) lmsMaster = inc.id();
        injected++;
        if (inc.parentId() == null) masters++; else children++;
        sseHub.broadcast("storm.progress", Map.of(
            "scenario", scenario, "injectedCount", injected, "totalCount", count, "masterCount", masters, "childCount", children
        ));
      } catch (Exception ex) {
        // Continue injection
      }
    }

    // Reports 36-40: APP-LIB
    UUID libMaster = null;
    for (int i = 36; i <= Math.min(40, count); i++) {
      try {
        Incident inc = intakeService.createIncident(
            reporter, "IEEE Xplore EZProxy authentication timeout (" + i + ")",
            "Library proxy auth failure", libSvc, "T2", 2, 2, libMaster
        );
        if (libMaster == null) libMaster = inc.id();
        injected++;
        if (inc.parentId() == null) masters++; else children++;
        sseHub.broadcast("storm.progress", Map.of(
            "scenario", scenario, "injectedCount", injected, "totalCount", count, "masterCount", masters, "childCount", children
        ));
      } catch (Exception ex) {
        // Continue injection
      }
    }

    return ResponseEntity.ok(Map.of(
        "scenario", scenario,
        "totalInjected", injected,
        "masterCount", masters,
        "childCount", children,
        "rootCandidateService", "AUTH-LDAP"
    ));
  }

  public ResponseEntity<Map<String, Object>> simulateStorm(Map<String, Object> req) {
    return simulateStorm(req, null);
  }

  @GetMapping("/metrics")
  public ResponseEntity<Map<String, Object>> getMetrics() {
    long totalIncidents = jdbcTemplate.queryForObject("SELECT count(*) FROM incident", Long.class);
    long activeMajorP1 = jdbcTemplate.queryForObject(
        "SELECT count(*) FROM incident WHERE is_major = true AND status NOT IN ('RESOLVED', 'VERIFIED', 'CLOSED', 'CANCELLED')",
        Long.class
    );
    long breachedCount = jdbcTemplate.queryForObject(
        "SELECT count(*) FROM incident WHERE sla_status = 'BREACHED'",
        Long.class
    );
    double complianceRate = totalIncidents > 0
        ? Math.max(0.0, Math.min(100.0, (1.0 - ((double) breachedCount / totalIncidents)) * 100.0))
        : 100.0;

    Double avgMttrMinutes = jdbcTemplate.queryForObject(
        "SELECT coalesce(avg(extract(epoch from (resolved_at - created_at))/60), 0.0) FROM incident WHERE resolved_at IS NOT NULL",
        Double.class
    );

    List<Map<String, Object>> statusCounts = jdbcTemplate.query(
        "SELECT status, count(*) AS cnt FROM incident GROUP BY status",
        (rs, rn) -> Map.of("status", rs.getString("status"), "count", rs.getLong("cnt"))
    );

    List<Map<String, Object>> priorityCounts = jdbcTemplate.query(
        "SELECT priority, count(*) AS cnt FROM incident GROUP BY priority",
        (rs, rn) -> Map.of("priority", rs.getString("priority"), "count", rs.getLong("cnt"))
    );

    Map<String, Object> res = new LinkedHashMap<>();
    res.put("totalVolume", totalIncidents);
    res.put("activeMajorP1", activeMajorP1);
    res.put("slaCompliance", String.format(java.util.Locale.US, "%.1f%%", complianceRate));
    res.put("mttrMinutes", String.format(java.util.Locale.US, "%.1fm", avgMttrMinutes != null ? avgMttrMinutes : 0.0));
    res.put("statusBreakdown", statusCounts);
    res.put("priorityBreakdown", priorityCounts);
    return ResponseEntity.ok(res);
  }

  @GetMapping("/sla-policies")
  public ResponseEntity<List<Map<String, Object>>> getSlaPolicies() {
    String sql = "SELECT id, tier, priority, response_minutes, resolution_minutes, clock_mode FROM sla_policy ORDER BY tier ASC, priority ASC";
    List<Map<String, Object>> policies = jdbcTemplate.query(
        sql,
        (rs, rowNum) -> Map.of(
            "id", rs.getObject("id").toString(),
            "tier", rs.getString("tier"),
            "priority", rs.getString("priority"),
            "responseTargetMin", rs.getInt("response_minutes"),
            "resolutionTargetMin", rs.getInt("resolution_minutes"),
            "mode", rs.getString("clock_mode")
        )
    );
    return ResponseEntity.ok(policies);
  }

  @GetMapping("/services")
  public ResponseEntity<List<Map<String, Object>>> getServices() {
    String sql = "SELECT id, code, name, tier, owner_team_id AS team_id FROM it_service ORDER BY code ASC";
    List<Map<String, Object>> services = jdbcTemplate.query(
        sql,
        (rs, rowNum) -> Map.of(
            "id", rs.getObject("id").toString(),
            "code", rs.getString("code"),
            "name", rs.getString("name"),
            "tier", rs.getString("tier"),
            "teamId", rs.getObject("team_id") != null ? rs.getObject("team_id").toString() : ""
        )
    );
    return ResponseEntity.ok(services);
  }

  @GetMapping("/categories")
  public ResponseEntity<List<Map<String, Object>>> getCategories() {
    String sql = "SELECT id, code, name FROM category ORDER BY code ASC";
    List<Map<String, Object>> categories = jdbcTemplate.query(
        sql,
        (rs, rowNum) -> Map.of(
            "id", rs.getObject("id").toString(),
            "code", rs.getString("code"),
            "name", rs.getString("name")
        )
    );
    return ResponseEntity.ok(categories);
  }

  @GetMapping("/users")
  public ResponseEntity<List<Map<String, Object>>> getUsers() {
    String sql = "SELECT id, employee_number, name, email, type FROM app_user ORDER BY email ASC";
    List<Map<String, Object>> users = jdbcTemplate.query(
        sql,
        (rs, rowNum) -> Map.of(
            "id", rs.getObject("id").toString(),
            "employeeNumber", rs.getString("employee_number"),
            "name", rs.getString("name"),
            "email", rs.getString("email"),
            "type", rs.getString("type")
        )
    );
    return ResponseEntity.ok(users);
  }
}
