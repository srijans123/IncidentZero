package edu.campus.iitsm.incident.application.intake;

import edu.campus.iitsm.shared.domain.ClockPort;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
@Order(2)
public class SanitizeRedactStep extends AbstractIntakeStep {

  private static final Pattern HTML_TAGS = Pattern.compile("<[^>]*>");
  private static final Pattern SCRIPT_TAGS = Pattern.compile("(?i)<script.*?>.*?</script.*?>", Pattern.DOTALL);
  private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+");
  private static final Pattern PHONE_PATTERN = Pattern.compile("\\b(?:\\+?\\d{1,3}[- ]?)?\\d{10}\\b");

  public SanitizeRedactStep(ClockPort clockPort) {
    super(clockPort);
  }

  @Override
  public int order() {
    return 2;
  }

  @Override
  protected void doExecute(IntakeContext ctx) {
    String cleanTitle = sanitize(ctx.rawTitle);
    String cleanDesc = sanitize(ctx.rawDescription);

    ctx.redactedTitle = redact(cleanTitle);
    ctx.redactedDescription = redact(cleanDesc);
  }

  private String sanitize(String text) {
    if (text == null) return "";
    String withoutScripts = SCRIPT_TAGS.matcher(text).replaceAll("");
    return HTML_TAGS.matcher(withoutScripts).replaceAll("").trim();
  }

  private String redact(String text) {
    if (text == null) return "";
    String withoutEmails = EMAIL_PATTERN.matcher(text).replaceAll("[REDACTED_EMAIL]");
    return PHONE_PATTERN.matcher(withoutEmails).replaceAll("[REDACTED_PHONE]");
  }
}
