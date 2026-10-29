package edu.campus.iitsm.notification.infrastructure;

import edu.campus.iitsm.shared.domain.NotificationChannel;
import edu.campus.iitsm.shared.domain.Notifier;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class DefaultNotifierAdapter implements Notifier {

  private final List<NotificationChannel> channels;

  public DefaultNotifierAdapter(List<NotificationChannel> channels) {
    this.channels = (channels != null) ? List.copyOf(channels) : List.of();
  }

  @Override
  public void notifyUsers(UUID incidentId, List<UUID> recipientIds, String template, String payloadJson) {
    if (recipientIds == null || recipientIds.isEmpty()) return;
    for (UUID recipientId : recipientIds) {
      String idempotencyKey = incidentId + ":" + recipientId + ":" + template;
      for (NotificationChannel channel : channels) {
        channel.send(recipientId, incidentId, template, payloadJson, idempotencyKey);
      }
    }
  }
}
