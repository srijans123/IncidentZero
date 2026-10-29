package edu.campus.iitsm.incident.application.intake;

import edu.campus.iitsm.shared.domain.ClockPort;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.UUID;

@Component
@Order(5)
public class CategoryAndServiceStep extends AbstractIntakeStep {

  public static final UUID CAT_HARDWARE = UUID.fromString("20000000-0000-0000-0000-000000000001");
  public static final UUID CAT_SOFTWARE = UUID.fromString("20000000-0000-0000-0000-000000000002");
  public static final UUID CAT_NETWORK = UUID.fromString("20000000-0000-0000-0000-000000000003");
  public static final UUID CAT_SECURITY = UUID.fromString("20000000-0000-0000-0000-000000000006");
  public static final UUID CAT_APPLICATION = UUID.fromString("20000000-0000-0000-0000-000000000008");

  public CategoryAndServiceStep(ClockPort clockPort) {
    super(clockPort);
  }

  @Override
  public int order() {
    return 5;
  }

  @Override
  protected void doExecute(IntakeContext ctx) {
    if (ctx.skipClassificationAndAssignment) return;

    if (ctx.categoryId == null) {
      String text = ((ctx.rawTitle != null ? ctx.rawTitle : "") + " " +
          (ctx.rawDescription != null ? ctx.rawDescription : "")).toLowerCase(Locale.ROOT);

      if (text.contains("security") || text.contains("compromise") || text.contains("unauthorized") || text.contains("malware")) {
        ctx.categoryId = CAT_SECURITY;
      } else if (text.contains("wifi") || text.contains("network") || text.contains("router") || text.contains("switch") || text.contains("dns")) {
        ctx.categoryId = CAT_NETWORK;
      } else if (text.contains("laptop") || text.contains("printer") || text.contains("monitor") || text.contains("hardware")) {
        ctx.categoryId = CAT_HARDWARE;
      } else {
        ctx.categoryId = CAT_APPLICATION;
      }
    }

    if (CAT_SECURITY.equals(ctx.categoryId)) {
      ctx.securityCategory = true;
    }
  }
}
