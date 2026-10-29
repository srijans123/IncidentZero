package edu.campus.iitsm.notification.infrastructure;

import edu.campus.iitsm.shared.domain.NotificationChannel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class InAppSseChannelAdapter implements NotificationChannel {
  private static final Logger log = LoggerFactory.getLogger(InAppSseChannelAdapter.class);

  public record NotificationRecord(UUID recipientId, UUID incidentId, String template, String payloadJson, String idempotencyKey) {}
  private final List<NotificationRecord> sentNotifications = new CopyOnWriteArrayList<>();

  @Override
  public String channelName() {
    return "IN_APP_SSE";
  }

  @Override
  public void send(UUID recipientId, UUID incidentId, String template, String payloadJson, String idempotencyKey) {
    NotificationRecord record = new NotificationRecord(recipientId, incidentId, template, payloadJson, idempotencyKey);
    sentNotifications.add(record);
    log.info("[IN_APP_SSE] Dispatched notification to user={} for incident={}: template={}", recipientId, incidentId, template);
  }

  public List<NotificationRecord> getSentNotifications() {
    return sentNotifications;
  }
}
