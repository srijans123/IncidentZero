package edu.campus.iitsm.identity.infrastructure.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import edu.campus.iitsm.identity.api.StreamTicketResponse;
import edu.campus.iitsm.identity.api.UserPrincipal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

@Service
public class StreamTicketService {

  private final Cache<String, UserPrincipal> ticketCache;
  private final int validitySeconds;

  public StreamTicketService(
      @Value("${app.auth.stream-ticket-validity-seconds:30}") int validitySeconds) {
    this.validitySeconds = validitySeconds;
    this.ticketCache = Caffeine.newBuilder()
        .expireAfterWrite(Duration.ofSeconds(validitySeconds))
        .maximumSize(10_000)
        .build();
  }

  public StreamTicketResponse issueTicket(UserPrincipal user) {
    String ticket = "st_" + UUID.randomUUID().toString().replace("-", "");
    ticketCache.put(ticket, user);
    return new StreamTicketResponse(ticket, validitySeconds);
  }

  public Optional<UserPrincipal> consumeTicket(String ticket) {
    if (ticket == null || ticket.isBlank()) return Optional.empty();
    UserPrincipal user = ticketCache.asMap().remove(ticket);
    return Optional.ofNullable(user);
  }
}
