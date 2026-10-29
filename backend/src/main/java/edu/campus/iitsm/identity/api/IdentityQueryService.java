package edu.campus.iitsm.identity.api;

import java.util.Optional;
import java.util.UUID;

public interface IdentityQueryService {
  AuthTokens login(String email, String rawPassword);
  Optional<UserPrincipal> findById(UUID id);
  Optional<UserPrincipal> findByEmail(String email);
  StreamTicketResponse issueStreamTicket(UUID userId);
  Optional<UserPrincipal> consumeStreamTicket(String ticket);
}
