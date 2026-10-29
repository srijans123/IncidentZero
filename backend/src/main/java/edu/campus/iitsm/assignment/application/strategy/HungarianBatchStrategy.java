package edu.campus.iitsm.assignment.application.strategy;

import edu.campus.iitsm.assignment.api.AssignmentRationale;
import edu.campus.iitsm.assignment.domain.AssignmentStrategy;
import edu.campus.iitsm.assignment.domain.HungarianBatchAssigner;
import edu.campus.iitsm.assignment.domain.HungarianBatchAssigner.BatchResult;
import edu.campus.iitsm.assignment.domain.HungarianBatchAssigner.TicketCandidate;
import edu.campus.iitsm.assignment.domain.TechnicianCandidate;
import edu.campus.iitsm.incident.domain.Priority;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public class HungarianBatchStrategy implements AssignmentStrategy {

  @Override
  public String name() {
    return "HungarianBatch";
  }

  @Override
  public Optional<AssignmentRationale> selectTechnician(
      UUID incidentId,
      UUID serviceId,
      UUID ownerTeamId,
      Priority priority,
      double ticketWeight,
      Set<String> requiredSkills,
      List<TechnicianCandidate> candidates
  ) {
    List<TechnicianCandidate> eligible = StrategySupport.filterEligible(ownerTeamId, ticketWeight, requiredSkills, candidates);
    if (eligible.isEmpty()) return Optional.empty();

    boolean isP1 = priority == Priority.P1;
    TicketCandidate ticket = new TicketCandidate(incidentId, ticketWeight, isP1);

    Map<UUID, Double> techCap = new HashMap<>();
    Map<UUID, Map<UUID, Double>> scoreMap = new HashMap<>();
    Map<UUID, Double> perTechScores = new HashMap<>();

    for (TechnicianCandidate c : eligible) {
      double free = Math.max(0.0, c.capacityPoints() - c.currentLoadPoints());
      techCap.put(c.technicianId(), free);
      double score = StrategySupport.calculateHybridScore(requiredSkills, c);
      perTechScores.put(c.technicianId(), score);
    }
    scoreMap.put(incidentId, perTechScores);

    BatchResult result = HungarianBatchAssigner.matchBatch(List.of(ticket), techCap, scoreMap);
    if (result.matches().isEmpty()) return Optional.empty();

    var match = result.matches().get(0);
    AssignmentRationale rationale = new AssignmentRationale(
        name(),
        match.technicianId(),
        match.score(),
        List.of(new AssignmentRationale.CandidateScore(match.technicianId(), "Technician", match.score(), 1.0, 1.0, 0.0, 0.0)),
        List.of("onShift", "loadCapacity", "teamMatch", "hungarianOptimalMatch")
    );
    return Optional.of(rationale);
  }
}
