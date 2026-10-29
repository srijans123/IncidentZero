package edu.campus.iitsm;

import edu.campus.iitsm.identity.api.AuthTokens;
import edu.campus.iitsm.identity.api.IdentityQueryService;
import edu.campus.iitsm.identity.api.StreamTicketResponse;
import edu.campus.iitsm.identity.api.UserPrincipal;
import edu.campus.iitsm.identity.infrastructure.security.JwtTokenService;
import edu.campus.iitsm.identity.infrastructure.security.StreamTicketService;
import edu.campus.iitsm.incident.application.CommandAuthorizer;
import edu.campus.iitsm.incident.domain.ClockMode;
import edu.campus.iitsm.incident.domain.CommandType;
import edu.campus.iitsm.incident.domain.Incident;
import edu.campus.iitsm.incident.domain.Priority;
import edu.campus.iitsm.incident.domain.PriorityExplanation;
import edu.campus.iitsm.incident.domain.PriorityStep;
import edu.campus.iitsm.incident.domain.SlaSnapshot;
import edu.campus.iitsm.shared.domain.error.InvalidCredentialsException;
import edu.campus.iitsm.shared.domain.error.UnauthorizedOperationException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.io.File;
import java.nio.file.Files;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@org.springframework.test.context.TestPropertySource(properties = {"spring.flyway.enabled=false"})
@SpringBootTest
class AuthenticationTest {

  private static Map<String, String> loadDotEnv() {
    Map<String, String> map = new HashMap<>();
    File[] candidates = new File[] { new File(".env"), new File("../.env") };
    for (File f : candidates) {
      if (f.exists()) {
        try {
          for (String line : Files.readAllLines(f.toPath())) {
            line = line.trim();
            if (line.startsWith("#") || !line.contains("=")) continue;
            int idx = line.indexOf('=');
            String key = line.substring(0, idx).trim();
            String val = line.substring(idx + 1).trim();
            if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.substring(1, val.length() - 1);
            }
            map.put(key, val);
          }
          break;
        } catch (Exception ignored) {}
      }
    }
    return map;
  }

  @DynamicPropertySource
  static void registerProperties(DynamicPropertyRegistry registry) {
    Map<String, String> dotenv = loadDotEnv();
    String rawDbUrl = System.getenv("DB_URL");
    if (rawDbUrl == null || rawDbUrl.isBlank()) rawDbUrl = dotenv.get("DB_URL");
    final String dbUrl = rawDbUrl;
    if (dbUrl != null) {
      registry.add("spring.datasource.url", () -> dbUrl);
      registry.add("spring.flyway.url", () -> dbUrl);
    }

    String rawDbUser = System.getenv("DB_APP_USER");
    if (rawDbUser == null || rawDbUser.isBlank()) rawDbUser = dotenv.get("DB_APP_USER");
    final String dbUser = rawDbUser;
    if (dbUser != null) registry.add("spring.datasource.username", () -> dbUser);

    String rawDbPass = System.getenv("DB_APP_PASSWORD");
    if (rawDbPass == null || rawDbPass.isBlank()) rawDbPass = dotenv.get("DB_APP_PASSWORD");
    final String dbPass = rawDbPass;
    if (dbPass != null) registry.add("spring.datasource.password", () -> dbPass);

    String rawOwnerUser = System.getenv("DB_OWNER_USER");
    if (rawOwnerUser == null || rawOwnerUser.isBlank()) rawOwnerUser = dotenv.get("DB_OWNER_USER");
    final String ownerUser = rawOwnerUser;
    if (ownerUser != null) registry.add("spring.flyway.user", () -> ownerUser);

    String rawOwnerPass = System.getenv("DB_OWNER_PASSWORD");
    if (rawOwnerPass == null || rawOwnerPass.isBlank()) rawOwnerPass = dotenv.get("DB_OWNER_PASSWORD");
    final String ownerPass = rawOwnerPass;
    if (ownerPass != null) registry.add("spring.flyway.password", () -> ownerPass);

    String rawSecret = System.getenv("BETTER_AUTH_SECRET");
    if (rawSecret == null || rawSecret.isBlank()) rawSecret = dotenv.get("BETTER_AUTH_SECRET");
    final String secret = rawSecret;
    if (secret != null) registry.add("app.auth.secret", () -> secret);
  }

  @Autowired
  private IdentityQueryService identityQueryService;

  @Autowired
  private JwtTokenService jwtTokenService;

  @Autowired
  private StreamTicketService streamTicketService;

  private final CommandAuthorizer authorizer = new CommandAuthorizer();

  @Test
  void testSuccessfulDemoUserLogin() {
    AuthTokens tokens = identityQueryService.login("tech.vikram@bits.campus", "Bits@2026");
    assertNotNull(tokens);
    assertNotNull(tokens.accessToken());
    assertEquals("tech.vikram@bits.campus", tokens.user().email());
    assertEquals("TECHNICIAN", tokens.user().role());
    assertEquals("SENIOR", tokens.user().supportTier());
    assertNotNull(tokens.user().teamId());

    Optional<UserPrincipal> extracted = jwtTokenService.validateAndExtract(tokens.accessToken());
    assertTrue(extracted.isPresent());
    assertEquals("tech.vikram@bits.campus", extracted.get().email());
    assertEquals("TECHNICIAN", extracted.get().role());
  }

  @Test
  void testInvalidPasswordFails() {
    assertThrows(InvalidCredentialsException.class, () ->
        identityQueryService.login("tech.vikram@bits.campus", "WrongPassword!2026"));
  }

  @Test
  void testStreamTicketSingleUseAndExpiration() {
    UserPrincipal user = new UserPrincipal(
        UUID.randomUUID(), "BITS-T-999", "Test Tech", "test@bits.campus",
        "TECHNICIAN", "L1", UUID.randomUUID(), "CCIT", "NAB", null);

    StreamTicketResponse ticketResp = streamTicketService.issueTicket(user);
    assertNotNull(ticketResp.ticket());
    assertTrue(ticketResp.ticket().startsWith("st_"));
    assertEquals(30, ticketResp.expiresInSeconds());

    Optional<UserPrincipal> firstConsume = streamTicketService.consumeTicket(ticketResp.ticket());
    assertTrue(firstConsume.isPresent());
    assertEquals(user.id(), firstConsume.get().id());

    Optional<UserPrincipal> secondConsume = streamTicketService.consumeTicket(ticketResp.ticket());
    assertTrue(secondConsume.isEmpty(), "Stream ticket must be single-use only");
  }

  @Test
  void testCommandAuthorizerRbacMatrix() {
    UUID reporterId = UUID.randomUUID();
    UUID serviceId = UUID.randomUUID();
    UUID teamLeadId = UUID.randomUUID();
    UUID intruderId = UUID.randomUUID();

    SlaSnapshot sla = new SlaSnapshot(UUID.randomUUID(), "T1", 60 * 60000L, 480 * 60000L, ClockMode.BUSINESS_HOURS);
    PriorityExplanation ex = new PriorityExplanation(List.of(new PriorityStep("BASE", null, Priority.P3, "Default")));
    Instant now = Instant.parse("2026-10-17T06:30:00Z");

    Incident inc = Incident.create(UUID.randomUUID(), reporterId, serviceId, 2, 2, Priority.P3, ex, sla, now);

    // Reporter permissions
    assertDoesNotThrow(() -> authorizer.authorize(inc, CommandType.PROVIDE_USER_INFO, reporterId, "EMPLOYEE", null));
    assertDoesNotThrow(() -> authorizer.authorize(inc, CommandType.VERIFY, reporterId, "EMPLOYEE", null));
    assertThrows(UnauthorizedOperationException.class, () ->
        authorizer.authorize(inc, CommandType.VERIFY, intruderId, "EMPLOYEE", null));

    // Team Lead permissions
    assertDoesNotThrow(() -> authorizer.authorize(inc, CommandType.ASSIGN, teamLeadId, "TECHNICIAN", "TEAM_LEAD"));
    assertDoesNotThrow(() -> authorizer.authorize(inc, CommandType.DECLARE_MAJOR, teamLeadId, "TECHNICIAN", "TEAM_LEAD"));

    // Standard L1 Technician permissions
    assertThrows(UnauthorizedOperationException.class, () ->
        authorizer.authorize(inc, CommandType.ASSIGN, intruderId, "TECHNICIAN", "L1"));
  }
}
