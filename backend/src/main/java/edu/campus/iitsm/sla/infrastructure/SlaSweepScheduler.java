package edu.campus.iitsm.sla.infrastructure;

import edu.campus.iitsm.incident.api.IncidentSlaSweepPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class SlaSweepScheduler {

  private static final Logger log = LoggerFactory.getLogger(SlaSweepScheduler.class);
  private final IncidentSlaSweepPort slaSweepPort;

  public SlaSweepScheduler(@org.springframework.beans.factory.annotation.Autowired(required = false) IncidentSlaSweepPort slaSweepPort) {
    this.slaSweepPort = slaSweepPort;
  }

  @Scheduled(fixedDelay = 5000)
  public void sweep() {
    if (slaSweepPort == null) return;
    try {
      slaSweepPort.sweepSla();
    } catch (Exception e) {
      log.warn("SLA sweep iteration encountered exception: {}", e.getMessage());
    }
  }
}
