package edu.campus.iitsm.shared.infrastructure;

import edu.campus.iitsm.shared.domain.IdGeneratorPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.security.SecureRandom;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class IdGeneratorAdapter implements IdGeneratorPort {

  private final JdbcTemplate jdbcTemplate;
  private final SecureRandom secureRandom = new SecureRandom();
  private final AtomicLong fallbackSequence = new AtomicLong(100);

  public IdGeneratorAdapter(DataSource dataSource) {
    this.jdbcTemplate = dataSource != null ? new JdbcTemplate(dataSource) : null;
  }

  @Override
  public UUID newUuidV7() {
    long epochMillis = System.currentTimeMillis();
    long randA = secureRandom.nextLong() & 0x0FFFL;
    long mostSigBits = (epochMillis << 16) | (0x7000L) | randA;
    long randB = secureRandom.nextLong() & 0x3FFFFFFFFFFFFFFFL;
    long leastSigBits = (0x8000000000000000L) | randB;
    return new UUID(mostSigBits, leastSigBits);
  }

  @Override
  public String nextIncidentNumber(int year) {
    if (jdbcTemplate != null) {
      try {
        String seqName = "incident_num_seq_" + year;
        Long val = jdbcTemplate.queryForObject("SELECT nextval(?)", Long.class, seqName);
        if (val != null) {
          return String.format("INC-%04d-%06d", year, val);
        }
      } catch (Exception ignored) {
        // Fall back to memory sequence if sequence query fails
      }
    }
    return String.format("INC-%04d-%06d", year, fallbackSequence.incrementAndGet());
  }
}
