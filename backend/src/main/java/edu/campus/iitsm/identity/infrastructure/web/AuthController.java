package edu.campus.iitsm.identity.infrastructure.web;

import edu.campus.iitsm.identity.api.AuthTokens;
import edu.campus.iitsm.identity.api.IdentityQueryService;
import edu.campus.iitsm.identity.api.LoginRequest;
import edu.campus.iitsm.identity.api.StreamTicketResponse;
import edu.campus.iitsm.identity.api.UserPrincipal;
import edu.campus.iitsm.shared.domain.error.UnauthorizedOperationException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class AuthController {

  private final IdentityQueryService identityQueryService;

  public AuthController(IdentityQueryService identityQueryService) {
    this.identityQueryService = identityQueryService;
  }

  @PostMapping("/auth/login")
  public ResponseEntity<AuthTokens> login(@Valid @RequestBody LoginRequest request) {
    AuthTokens tokens = identityQueryService.login(request.email(), request.password());
    return ResponseEntity.ok(tokens);
  }

  @GetMapping("/me")
  public ResponseEntity<UserPrincipal> me(@AuthenticationPrincipal UserPrincipal principal) {
    if (principal == null) {
      throw new UnauthorizedOperationException(null, "VIEW_PROFILE");
    }
    return ResponseEntity.ok(principal);
  }

  @PostMapping("/auth/stream-ticket")
  public ResponseEntity<StreamTicketResponse> issueStreamTicket(@AuthenticationPrincipal UserPrincipal principal) {
    if (principal == null) {
      throw new UnauthorizedOperationException(null, "STREAM_TICKET");
    }
    StreamTicketResponse response = identityQueryService.issueStreamTicket(principal.id());
    return ResponseEntity.ok(response);
  }

  @PostMapping("/auth/logout")
  public ResponseEntity<Void> logout() {
    return ResponseEntity.noContent().build();
  }
}
