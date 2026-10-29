package edu.campus.iitsm.shared.domain;

import java.util.List;
import java.util.UUID;

public interface Notifier {
  void notifyUsers(UUID incidentId, List<UUID> recipientIds, String template, String payloadJson);
}
