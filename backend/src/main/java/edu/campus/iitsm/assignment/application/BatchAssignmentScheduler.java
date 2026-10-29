package edu.campus.iitsm.assignment.application;

import edu.campus.iitsm.assignment.domain.HungarianBatchAssigner;
import edu.campus.iitsm.assignment.domain.HungarianBatchAssigner.BatchResult;
import edu.campus.iitsm.assignment.domain.HungarianBatchAssigner.TicketCandidate;
import edu.campus.iitsm.incident.domain.Incident;
import edu.campus.iitsm.incident.domain.IncidentRepository;
import edu.campus.iitsm.incident.domain.Priority;
import edu.campus.iitsm.shared.domain.ClockPort;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class BatchAssignmentScheduler {

  private final IncidentRepository incidentRepository;
  private final ClockPort clockPort;

  public BatchAssignmentScheduler(IncidentRepository incidentRepository, ClockPort clockPort) {
    this.incidentRepository = incidentRepository;
    this.clockPort = clockPort;
  }

  public boolean shouldFlush(List<Incident> waitingTickets, Instant now) {
    if (waitingTickets == null || waitingTickets.isEmpty()) return false;
    if (waitingTickets.size() >= 5) return true;
    Incident oldest = waitingTickets.get(0);
    long waitedSeconds = Duration.between(oldest.createdAt(), now).toSeconds();
    return waitedSeconds >= 10;
  }

  public BatchResult processBatch(
      List<Incident> waitingTickets,
      Map<UUID, Double> techFreeCapacity,
      Map<UUID, Map<UUID, Double>> scoreMatrix
  ) {
    if (waitingTickets.isEmpty()) return new BatchResult(List.of(), List.of());

    List<TicketCandidate> candidates = new ArrayList<>();
    for (Incident inc : waitingTickets) {
      double weight = switch (inc.priority()) {
        case P1 -> 3.0;
        case P2 -> 2.0;
        case P3 -> 1.0;
        case P4 -> 0.5;
      };
      boolean isP1 = inc.priority() == Priority.P1;
      candidates.add(new TicketCandidate(inc.id(), weight, isP1));
    }

    return HungarianBatchAssigner.matchBatch(candidates, techFreeCapacity, scoreMatrix);
  }

  public int pollAndFlush(
      Map<UUID, Double> techFreeCapacity,
      Map<UUID, Map<UUID, Double>> scoreMatrix
  ) {
    Instant now = clockPort.now();
    List<Incident> unassigned = incidentRepository.findClassifiedUnassignedRoots(50);
    if (!shouldFlush(unassigned, now)) return 0;

    BatchResult result = processBatch(unassigned, techFreeCapacity, scoreMatrix);
    return result.matches().size();
  }
}
