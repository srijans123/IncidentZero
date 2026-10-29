package edu.campus.iitsm.notification.infrastructure;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.campus.iitsm.shared.domain.ClockPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import edu.campus.iitsm.notification.api.SseBroadcastPort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class InAppSseHub implements SseBroadcastPort {
  private static final Logger log = LoggerFactory.getLogger(InAppSseHub.class);
  private static final int BUFFER_CAPACITY = 512;
  private static final long EMITTER_TIMEOUT = 300_000L; // 5 minutes

  public record SseEvent(long id, String eventType, String dataJson, Instant timestamp) {}

  private final ClockPort clockPort;
  private final ObjectMapper objectMapper;
  private final AtomicLong eventIdCounter = new AtomicLong(0);
  private final SseEvent[] ringBuffer = new SseEvent[BUFFER_CAPACITY];
  private final Set<SseEmitter> activeEmitters = ConcurrentHashMap.newKeySet();

  public InAppSseHub(ClockPort clockPort, ObjectMapper objectMapper) {
    this.clockPort = clockPort;
    this.objectMapper = objectMapper;
  }

  public SseEmitter createEmitter(UUID userId, Long lastEventId) {
    SseEmitter emitter = new SseEmitter(EMITTER_TIMEOUT);
    activeEmitters.add(emitter);

    emitter.onCompletion(() -> activeEmitters.remove(emitter));
    emitter.onTimeout(() -> {
      emitter.complete();
      activeEmitters.remove(emitter);
    });
    emitter.onError(e -> {
      emitter.complete();
      activeEmitters.remove(emitter);
    });

    // Replay missed events from ring buffer if lastEventId is provided
    if (lastEventId != null && lastEventId > 0) {
      replaySince(emitter, lastEventId);
    }

    // Send initial connected event
    try {
      long id = eventIdCounter.incrementAndGet();
      emitter.send(SseEmitter.event()
          .id(String.valueOf(id))
          .name("connected")
          .data(Map.of("userId", userId != null ? userId.toString() : "anonymous", "virtualNow", clockPort.now().toString()))
      );
    } catch (IOException e) {
      log.warn("Failed to send initial SSE connected event", e);
      emitter.complete();
      activeEmitters.remove(emitter);
    }

    return emitter;
  }

  public synchronized void broadcast(String eventType, Object payload) {
    try {
      String json = payload instanceof String s ? s : objectMapper.writeValueAsString(payload);
      long id = eventIdCounter.incrementAndGet();
      Instant now = clockPort.now();
      SseEvent event = new SseEvent(id, eventType, json, now);

      // Save into ring buffer
      int idx = (int) (id % BUFFER_CAPACITY);
      ringBuffer[idx] = event;

      // Dispatch to active emitters
      List<SseEmitter> deadEmitters = new ArrayList<>();
      for (SseEmitter emitter : activeEmitters) {
        try {
          emitter.send(SseEmitter.event()
              .id(String.valueOf(id))
              .name(eventType)
              .data(json)
          );
        } catch (Exception ex) {
          deadEmitters.add(emitter);
        }
      }
      activeEmitters.removeAll(deadEmitters);
    } catch (Exception e) {
      log.error("Failed to broadcast SSE event '{}'", eventType, e);
    }
  }

  @Scheduled(fixedRate = 15000)
  public void sendHeartbeat() {
    broadcast("heartbeat", Map.of(
        "virtualNow", clockPort.now().toString(),
        "scaleFactor", clockPort.scaleFactor()
    ));
  }

  private synchronized void replaySince(SseEmitter emitter, long lastEventId) {
    long currentMax = eventIdCounter.get();
    long startId = Math.max(lastEventId + 1, currentMax - BUFFER_CAPACITY + 1);

    for (long id = startId; id <= currentMax; id++) {
      int idx = (int) (id % BUFFER_CAPACITY);
      SseEvent event = ringBuffer[idx];
      if (event != null && event.id() == id) {
        try {
          emitter.send(SseEmitter.event()
              .id(String.valueOf(event.id()))
              .name(event.eventType())
              .data(event.dataJson())
          );
        } catch (IOException e) {
          log.warn("Failed to replay event {} to emitter", id);
          break;
        }
      }
    }
  }

  public int getActiveEmitterCount() {
    return activeEmitters.size();
  }
}
