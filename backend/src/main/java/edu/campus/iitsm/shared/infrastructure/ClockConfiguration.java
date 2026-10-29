package edu.campus.iitsm.shared.infrastructure;

import edu.campus.iitsm.shared.domain.ClockPort;
import edu.campus.iitsm.shared.domain.VirtualAnchoredClock;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Instant;

@Configuration
public class ClockConfiguration {

  @Bean
  public VirtualAnchoredClock virtualAnchoredClock(
      @Value("${app.clock.initial-scale:1}") int scaleFactor) {
    return new VirtualAnchoredClock(Instant.now(), scaleFactor, null);
  }

  @Bean
  public ClockPort clockPort(VirtualAnchoredClock virtualAnchoredClock) {
    return virtualAnchoredClock;
  }
}
