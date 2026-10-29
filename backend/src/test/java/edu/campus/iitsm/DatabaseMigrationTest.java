package edu.campus.iitsm;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.output.MigrateResult;
import org.junit.jupiter.api.Test;
import java.io.File;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class DatabaseMigrationTest {

  private static Map<String, String> loadDotEnv() {
    Map<String, String> map = new HashMap<>();
    File[] candidates = new File[] { new File(".env"), new File("../.env") };
    for (File f : candidates) {
      if (f.exists()) {
        try {
          for (String line : Files.readAllLines(f.toPath())) {
            line = line.trim();
            if (line.startsWith("#") || !line.contains("=")) continue;
            int idx = line.indexOf('=');
            String key = line.substring(0, idx).trim();
            String val = line.substring(idx + 1).trim();
            if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.substring(1, val.length() - 1);
            }
            map.put(key, val);
          }
          break;
        } catch (Exception ignored) {}
      }
    }
    return map;
  }

  @Test
  void migrateNeonDatabase() {
    Map<String, String> dotenv = loadDotEnv();

    String url = System.getenv("DB_URL");
    if (url == null || url.isBlank()) url = System.getProperty("DB_URL");
    if (url == null || url.isBlank()) url = dotenv.get("DB_URL");

    String user = System.getenv("DB_OWNER_USER");
    if (user == null || user.isBlank()) user = System.getProperty("DB_OWNER_USER");
    if (user == null || user.isBlank()) user = dotenv.get("DB_OWNER_USER");

    String password = System.getenv("DB_OWNER_PASSWORD");
    if (password == null || password.isBlank()) password = System.getProperty("DB_OWNER_PASSWORD");
    if (password == null || password.isBlank()) password = dotenv.get("DB_OWNER_PASSWORD");

    assertNotNull(url, "DB_URL must be configured in environment or .env");
    System.out.println("Migrating NeonDB: " + url.replaceAll(":[^:@]+@", ":***@"));

    Flyway flyway = Flyway.configure()
        .dataSource(url, user, password)
        .locations("classpath:db/migration")
        .baselineOnMigrate(true)
        .load();

    MigrateResult result = flyway.migrate();
    System.out.println("Flyway migration completed successfully: " + result.migrationsExecuted + " migrations executed.");
    assertTrue(result.success, "Flyway migration should succeed");
  }
}
