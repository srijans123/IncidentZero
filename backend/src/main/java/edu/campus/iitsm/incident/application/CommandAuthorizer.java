package edu.campus.iitsm.incident.application;

import edu.campus.iitsm.incident.domain.CommandType;
import edu.campus.iitsm.incident.domain.Incident;
import edu.campus.iitsm.shared.domain.Actors;
import edu.campus.iitsm.shared.domain.error.UnauthorizedOperationException;
import java.util.Set;
import java.util.UUID;

public final class CommandAuthorizer {
  public void authorize(Incident inc, CommandType cmd, UUID actorId, String role, String supportTier) {
    if (Actors.SYSTEM.equals(actorId)) return;
    boolean isAdmin = "ADMINISTRATOR".equals(role);
    boolean isTeamLead = "TECHNICIAN".equals(role) && "TEAM_LEAD".equals(supportTier);
    boolean isTech = "TECHNICIAN".equals(role);
    boolean isReporter = inc.reporterId().equals(actorId);
    boolean isAssignee = inc.assigneeId() != null && inc.assigneeId().equals(actorId);

    boolean allowed = switch (cmd) {
      case CLASSIFY, CLOSE, LINK_AS_CHILD, UNLINK_FROM_MASTER, REPRIORITIZE -> isTech || isAdmin || (cmd == CommandType.UNLINK_FROM_MASTER && isReporter);
      case ASSIGN, DECLARE_MAJOR -> isTeamLead || isAdmin;
      case REASSIGN -> isTeamLead || isAdmin || isAssignee;
      case ACKNOWLEDGE, START_INVESTIGATION, REQUEST_USER_INFO, RESOLVE -> isAssignee;
      case PROVIDE_USER_INFO, VERIFY, REJECT_RESOLUTION -> isReporter;
      case CANCEL -> isReporter || isAdmin;
      case RESOLVE_WITH_MASTER -> false; // SYSTEM only
    };
    if (!allowed) {
      throw new UnauthorizedOperationException(actorId, cmd.name());
    }
  }
}
