package edu.campus.iitsm.intake.application;

import edu.campus.iitsm.incident.domain.Incident;
import java.util.UUID;

public interface IntakeStep {
  int order();
  void execute(IntakeContext ctx);

  final class IntakeContext {
    public UUID actorId;
    public String rawTitle;
    public String rawDescription;
    public String redactedTitle;
    public String redactedDescription;
    public UUID serviceId;
    public String serviceTier;
    public UUID categoryId;
    public int urgency;
    public int impact;
    public boolean activeCalendarWindow;
    public boolean securityCategory;
    public int linkedReportsIn15Min;
    public UUID autoLinkedMasterId;
    public Incident incident;
  }
}
