package edu.campus.iitsm.notification.infrastructure.web;

import edu.campus.iitsm.identity.api.IdentityQueryService;
import edu.campus.iitsm.identity.api.UserPrincipal;
import edu.campus.iitsm.notification.infrastructure.InAppSseHub;
import edu.campus.iitsm.shared.domain.error.UnauthorizedOperationException;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1")
public class StreamController {

  private final InAppSseHub sseHub;
  private final IdentityQueryService identityQueryService;

  public StreamController(InAppSseHub sseHub, IdentityQueryService identityQueryService) {
    this.sseHub = sseHub;
    this.identityQueryService = identityQueryService;
  }

  @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public SseEmitter subscribe(
      @RequestParam(value = "ticket", required = false) String ticket,
      @RequestHeader(value = "Last-Event-ID", required = false) String lastEventIdHeader,
      @RequestParam(value = "lastEventId", required = false) String lastEventIdParam
  ) {
    if (ticket == null || ticket.isBlank()) {
      throw new edu.campus.iitsm.shared.domain.error.InvalidCredentialsException();
    }

    Optional<UserPrincipal> principalOpt = identityQueryService.consumeStreamTicket(ticket);
    if (principalOpt.isEmpty()) {
      throw new edu.campus.iitsm.shared.domain.error.InvalidCredentialsException();
    }

    UserPrincipal principal = principalOpt.get();

    Long lastEventId = null;
    String idStr = lastEventIdHeader != null ? lastEventIdHeader : lastEventIdParam;
    if (idStr != null && !idStr.isBlank()) {
      try {
        lastEventId = Long.parseLong(idStr.trim());
      } catch (NumberFormatException ignored) {
      }
    }

    return sseHub.createEmitter(principal.id(), lastEventId);
  }
}
