package edu.campus.iitsm.identity.infrastructure.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.campus.iitsm.identity.api.UserPrincipal;
import edu.campus.iitsm.shared.domain.ClockPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class JwtTokenService {

  private final byte[] secretKeyBytes;
  private final long tokenValiditySeconds;
  private final ClockPort clockPort;
  private final ObjectMapper objectMapper;

  public JwtTokenService(
      @Value("${app.auth.secret}") String secret,
      @Value("${app.auth.token-validity-seconds:86400}") long tokenValiditySeconds,
      ClockPort clockPort,
      ObjectMapper objectMapper) {
    this.secretKeyBytes = secret.getBytes(StandardCharsets.UTF_8);
    this.tokenValiditySeconds = tokenValiditySeconds;
    this.clockPort = clockPort;
    this.objectMapper = objectMapper;
  }

  public String generateToken(UserPrincipal user) {
    try {
      long nowEpoch = clockPort.wallNow().getEpochSecond();
      long expEpoch = nowEpoch + tokenValiditySeconds;

      String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
      Map<String, Object> payloadMap = Map.of(
          "sub", user.id().toString(),
          "email", user.email(),
          "name", user.name(),
          "role", user.role(),
          "supportTier", user.supportTier() != null ? user.supportTier() : "",
          "teamId", user.teamId() != null ? user.teamId().toString() : "",
          "department", user.department() != null ? user.department() : "",
          "iat", nowEpoch,
          "exp", expEpoch
      );

      String headerB64 = Base64.getUrlEncoder().withoutPadding().encodeToString(headerJson.getBytes(StandardCharsets.UTF_8));
      String payloadB64 = Base64.getUrlEncoder().withoutPadding().encodeToString(objectMapper.writeValueAsBytes(payloadMap));

      String content = headerB64 + "." + payloadB64;
      String sigB64 = sign(content);
      return content + "." + sigB64;
    } catch (Exception e) {
      throw new IllegalStateException("Failed to generate JWT token", e);
    }
  }

  public Optional<UserPrincipal> validateAndExtract(String token) {
    try {
      String[] parts = token.split("\\.");
      if (parts.length != 3) return Optional.empty();

      String content = parts[0] + "." + parts[1];
      String expectedSig = sign(content);
      if (!MessageDigest.isEqual(expectedSig.getBytes(StandardCharsets.UTF_8), parts[2].getBytes(StandardCharsets.UTF_8))) {
        return Optional.empty();
      }

      byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
      Map<String, Object> claims = objectMapper.readValue(payloadBytes, Map.class);

      Number expNumber = (Number) claims.get("exp");
      if (expNumber == null || expNumber.longValue() < clockPort.wallNow().getEpochSecond()) {
        return Optional.empty();
      }

      UUID id = UUID.fromString((String) claims.get("sub"));
      String email = (String) claims.get("email");
      String name = (String) claims.get("name");
      String role = (String) claims.get("role");
      String supportTier = (String) claims.get("supportTier");
      String teamIdStr = (String) claims.get("teamId");
      UUID teamId = (teamIdStr != null && !teamIdStr.isBlank()) ? UUID.fromString(teamIdStr) : null;
      String department = (String) claims.get("department");

      return Optional.of(new UserPrincipal(
          id, null, name, email, role,
          (supportTier != null && !supportTier.isBlank()) ? supportTier : null,
          teamId, department, null, null
      ));
    } catch (Exception e) {
      return Optional.empty();
    }
  }

  public long getTokenValiditySeconds() {
    return tokenValiditySeconds;
  }

  private String sign(String content) throws Exception {
    Mac mac = Mac.getInstance("HmacSHA256");
    mac.init(new SecretKeySpec(secretKeyBytes, "HmacSHA256"));
    byte[] signatureBytes = mac.doFinal(content.getBytes(StandardCharsets.UTF_8));
    return Base64.getUrlEncoder().withoutPadding().encodeToString(signatureBytes);
  }
}
