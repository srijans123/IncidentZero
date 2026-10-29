package edu.campus.iitsm.intelligence.infrastructure.llm;

import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class PiiRedactor {
  private static final Pattern EMAIL_PATTERN = Pattern.compile(
      "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"
  );

  private static final Pattern PHONE_PATTERN = Pattern.compile(
      "(?:\\+91[\\s-]?)?[6-9]\\d{9}\\b"
  );

  private static final Pattern SECRET_PATTERN = Pattern.compile(
      "(?i)(?:password|passwd|secret|token|bearer)\\s*[:=]\\s*\\S+|Bearer\\s+[A-Za-z0-9._~+/-]+=*"
  );

  private static final Pattern IP_PATTERN = Pattern.compile(
      "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b"
  );

  public String redact(String input) {
    if (input == null || input.isBlank()) {
      return input;
    }
    String s = EMAIL_PATTERN.matcher(input).replaceAll("[REDACTED_EMAIL]");
    s = PHONE_PATTERN.matcher(s).replaceAll("[REDACTED_PHONE]");
    s = SECRET_PATTERN.matcher(s).replaceAll("[REDACTED_SECRET]");
    s = IP_PATTERN.matcher(s).replaceAll("[REDACTED_IP]");
    return s;
  }
}
