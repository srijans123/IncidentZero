package edu.campus.iitsm.shared.domain;

import java.util.UUID;

public interface NotificationChannel {
  String channelName();
  void send(UUID recipientId, UUID incidentId, String template, String payloadJson, String idempotencyKey);
}
