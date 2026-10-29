package edu.campus.iitsm.notification.api;

public interface SseBroadcastPort {
  void broadcast(String eventType, Object payload);
  void sendHeartbeat();
}
