package edu.campus.iitsm.notification.infrastructure;

import edu.campus.iitsm.notification.api.SseBroadcastPort;
import edu.campus.iitsm.shared.domain.DomainEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Map;

@Component
public class IncidentSseNotificationListener {

  private static final Logger log = LoggerFactory.getLogger(IncidentSseNotificationListener.class);
  private final SseBroadcastPort sseHub;

  public IncidentSseNotificationListener(SseBroadcastPort sseHub) {
    this.sseHub = sseHub;
  }

  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  public void onDomainEvent(DomainEvent event) {
    if (event == null || event.incidentId() == null) {
      return;
    }

    String simpleName = event.getClass().getSimpleName();
    String sseType = "IncidentCreated".equalsIgnoreCase(simpleName)
        ? "incident.created"
        : "incident.updated";

    log.debug("Broadcasting SSE event {} for incident {}", sseType, event.incidentId());
    sseHub.broadcast(sseType, Map.of(
        "incidentId", event.incidentId(),
        "eventType", simpleName
    ));
  }
}
