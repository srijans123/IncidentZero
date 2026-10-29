package edu.campus.iitsm.shared.infrastructure;

import edu.campus.iitsm.shared.domain.RandomSourcePort;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class RandomSourceAdapter implements RandomSourcePort {

  private final SecureRandom random = new SecureRandom();

  @Override
  public double nextDouble() {
    return random.nextDouble();
  }

  @Override
  public int nextInt(int bound) {
    return random.nextInt(bound);
  }
}
