package edu.campus.iitsm.incident.infrastructure.web;

import edu.campus.iitsm.audit.api.AuditVerificationPort;
import edu.campus.iitsm.audit.api.AuditVerificationResult;
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
  private final AuditVerificationPort auditVerificationPort;
  private final JdbcTemplate jdbcTemplate;
  private final edu.campus.iitsm.incident.application.IncidentCommandService commandService;

  public AdminController(
      IntakeService intakeService,
      SseBroadcastPort sseHub,
      ClockPort clockPort,
      AuditVerificationPort auditVerificationPort,
      JdbcTemplate jdbcTemplate
  ) {
    this(intakeService, sseHub, clockPort, auditVerificationPort, jdbcTemplate, null);
  }

  @org.springframework.beans.factory.annotation.Autowired
  public AdminController(
      IntakeService intakeService,
      SseBroadcastPort sseHub,
      ClockPort clockPort,
      AuditVerificationPort auditVerificationPort,
      JdbcTemplate jdbcTemplate,
      edu.campus.iitsm.incident.application.IncidentCommandService commandService
  ) {
    this.intakeService = intakeService;
    this.sseHub = sseHub;
    this.clockPort = clockPort;
    this.auditVerificationPort = auditVerificationPort;
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

  @PostMapping("/simulate/storm")
  public ResponseEntity<Map<String, Object>> simulateStorm(@RequestBody Map<String, Object> body) {
    String scenario = (String) body.getOrDefault("scenario", "ERP_LDAP_POOL_EXHAUSTION");
    int count = body.containsKey("reportCount") ? ((Number) body.get("reportCount")).intValue() : 40;

    UUID ldapSvc = UUID.fromString("30000000-0000-0000-0000-000000000002");
    UUID erpSvc = UUID.fromString("30000000-0000-0000-0000-000000000001");
    UUID lmsSvc = UUID.fromString("30000000-0000-0000-0000-000000000003");
    UUID libSvc = UUID.fromString("30000000-0000-0000-0000-000000000004");
    UUID reporter = UUID.fromString("019299a0-0000-7000-8000-000000000002");

    int injected = 0;
    int masters = 0;
    int children = 0;

    // Reports 1-3: AUTH-LDAP
    UUID ldapMaster = null;
    for (int i = 1; i <= Math.min(3, count); i++) {
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
    }

    // Reports 4-25: APP-ERP (Course registration)
    UUID erpMaster = null;
    for (int i = 4; i <= Math.min(25, count); i++) {
      Incident inc = intakeService.createIncident(
          reporter, "Course registration portal stuck on SSO redirect HTTP 504 (" + i + ")",
          "AUGSD course registration portal timeout from student hostel", erpSvc, "T1", 2, 3, erpMaster
      );
      if (erpMaster == null) {
        erpMaster = inc.id();
        if (commandService != null) {
          commandService.declareMajor(erpMaster, reporter, "ADMINISTRATOR", "SENIOR");
        }
      }
      injected++;
      if (inc.parentId() == null) masters++; else children++;
      sseHub.broadcast("storm.progress", Map.of(
          "scenario", scenario, "injectedCount", injected, "totalCount", count, "masterCount", masters, "childCount", children
      ));
    }

    // Reports 26-35: APP-LMS
    UUID lmsMaster = null;
    for (int i = 26; i <= Math.min(35, count); i++) {
      Incident inc = intakeService.createIncident(
          reporter, "Nalanda quiz login failing with SSO error (" + i + ")",
          "LMS login timeout", lmsSvc, "T1", 2, 2, lmsMaster
      );
      if (lmsMaster == null) lmsMaster = inc.id();
      injected++;
      if (inc.parentId() == null) masters++; else children++;
      sseHub.broadcast("storm.progress", Map.of(
          "scenario", scenario, "injectedCount", injected, "totalCount", count, "masterCount", masters, "childCount", children
      ));
    }

    // Reports 36-40: APP-LIB
    UUID libMaster = null;
    for (int i = 36; i <= Math.min(40, count); i++) {
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
    }

    return ResponseEntity.ok(Map.of(
        "scenario", scenario,
        "totalInjected", injected,
        "masterCount", masters,
        "childCount", children,
        "rootCandidateService", "AUTH-LDAP"
    ));
  }

  @PostMapping("/audit/verify")
  public ResponseEntity<Map<String, Object>> verifyAuditLedger() {
    AuditVerificationResult result = auditVerificationPort.verifyAllLedgers();
    return ResponseEntity.ok(Map.of(
        "valid", result.valid(),
        "firstCorruptedRowId", result.firstCorruptedRowId() != null ? result.firstCorruptedRowId() : 0L,
        "totalRecordsVerified", result.totalRecordsVerified(),
        "reason", result.failureReason() != null ? result.failureReason() : "All cryptographic hash links intact."
    ));
  }

  @GetMapping("/services")
  public ResponseEntity<List<Map<String, Object>>> getServices() {
    String sql = "SELECT id, code, name, tier, team_id FROM service ORDER BY code ASC";
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
