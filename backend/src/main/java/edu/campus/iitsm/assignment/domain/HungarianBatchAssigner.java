package edu.campus.iitsm.assignment.domain;

import java.util.*;

public final class HungarianBatchAssigner {
  private static final double EPS = 1e-9;

  public record TicketCandidate(UUID incidentId, double weight, boolean isP1) {}
  public record TechSlot(UUID technicianId, int slotIndex, double marginalCeiling) {}
  public record BatchMatch(UUID incidentId, UUID technicianId, double score) {}
  public record BatchResult(List<BatchMatch> matches, List<UUID> unassigned) {}

  public static BatchResult matchBatch(
      List<TicketCandidate> incidents,
      Map<UUID, Double> techFreeCapacity,
      Map<UUID, Map<UUID, Double>> eligibilityAndScores
  ) {
    if (incidents.isEmpty()) return new BatchResult(List.of(), List.of());
    if (incidents.size() <= 7) {
      return solveExact(incidents, techFreeCapacity, eligibilityAndScores);
    }
    return solveMultiPassKuhnMunkres(incidents, techFreeCapacity, eligibilityAndScores);
  }

  /**
   * Exact branch-and-bound solver for small batches (n <= 7): maximizes (1) number of assigned
   * tickets, then (2) total score sum, subject to capacity and <= 1 P1 per technician.
   */
  public static BatchResult solveExact(
      List<TicketCandidate> incidents,
      Map<UUID, Double> techFreeCapacity,
      Map<UUID, Map<UUID, Double>> eligibilityAndScores
  ) {
    List<TicketCandidate> ordered = new ArrayList<>(incidents);
    ordered.sort(Comparator.comparing(TicketCandidate::incidentId));
    List<UUID> techs = new ArrayList<>(techFreeCapacity.keySet());
    techs.sort(Comparator.naturalOrder());

    int m = ordered.size();
    int tCount = techs.size();
    double[] remCap = new double[tCount];
    for (int j = 0; j < tCount; j++) remCap[j] = techFreeCapacity.getOrDefault(techs.get(j), 0.0);
    boolean[] p1Used = new boolean[tCount];
    int[] curAssign = new int[m];
    Arrays.fill(curAssign, -1);

    int[] bestAssign = new int[m];
    Arrays.fill(bestAssign, -1);
    double[] bestObj = new double[]{-1.0, -1.0}; // [assignedCount, totalScore]

    searchExact(0, ordered, techs, eligibilityAndScores, remCap, p1Used, curAssign, 0, 0.0, bestAssign, bestObj);

    List<BatchMatch> matches = new ArrayList<>();
    List<UUID> unassigned = new ArrayList<>();
    for (int i = 0; i < m; i++) {
      TicketCandidate tc = ordered.get(i);
      int tj = bestAssign[i];
      if (tj >= 0) {
        UUID techId = techs.get(tj);
        double sc = eligibilityAndScores.get(tc.incidentId()).get(techId);
        matches.add(new BatchMatch(tc.incidentId(), techId, sc));
      } else {
        unassigned.add(tc.incidentId());
      }
    }
    return new BatchResult(matches, unassigned);
  }

  private static void searchExact(
      int idx, List<TicketCandidate> ordered, List<UUID> techs,
      Map<UUID, Map<UUID, Double>> scores, double[] remCap, boolean[] p1Used,
      int[] curAssign, int curCount, double curScore, int[] bestAssign, double[] bestObj
  ) {
    int m = ordered.size();
    int remainingTickets = m - idx;
    if (curCount + remainingTickets < (int) bestObj[0]) {
      return; // Prune: cannot beat best assigned count
    }
    if (idx == m) {
      if (curCount > (int) bestObj[0]
          || (curCount == (int) bestObj[0] && curScore > bestObj[1] + EPS)) {
        bestObj[0] = curCount;
        bestObj[1] = curScore;
        System.arraycopy(curAssign, 0, bestAssign, 0, m);
      }
      return;
    }

    TicketCandidate tc = ordered.get(idx);
    Map<UUID, Double> eligible = scores.getOrDefault(tc.incidentId(), Map.of());

    for (int j = 0; j < techs.size(); j++) {
      UUID techId = techs.get(j);
      Double sc = eligible.get(techId);
      if (sc == null) continue;
      if (tc.weight() > remCap[j] + EPS) continue;
      if (tc.isP1() && p1Used[j]) continue;

      curAssign[idx] = j;
      remCap[j] -= tc.weight();
      if (tc.isP1()) p1Used[j] = true;

      searchExact(idx + 1, ordered, techs, scores, remCap, p1Used, curAssign, curCount + 1, curScore + sc, bestAssign, bestObj);

      if (tc.isP1()) p1Used[j] = false;
      remCap[j] += tc.weight();
      curAssign[idx] = -1;
    }

    // Option: leave ticket idx unassigned
    searchExact(idx + 1, ordered, techs, scores, remCap, p1Used, curAssign, curCount, curScore, bestAssign, bestObj);
  }

  private static BatchResult solveMultiPassKuhnMunkres(
      List<TicketCandidate> incidents,
      Map<UUID, Double> techFreeCapacity,
      Map<UUID, Map<UUID, Double>> eligibilityAndScores
  ) {
    Map<UUID, TicketCandidate> byId = new LinkedHashMap<>();
    for (TicketCandidate tc : incidents) byId.put(tc.incidentId(), tc);

    Map<UUID, Double> free = new TreeMap<>(techFreeCapacity);
    List<TicketCandidate> remaining = new ArrayList<>(incidents);
    remaining.sort(Comparator.comparing(TicketCandidate::incidentId));

    List<BatchMatch> accepted = new ArrayList<>();
    Set<UUID> p1Taken = new HashSet<>();

    for (int pass = 0; pass < 4 && !remaining.isEmpty(); pass++) {
      List<BatchMatch> raw = solveOnce(remaining, free, eligibilityAndScores, p1Taken);
      if (raw.isEmpty()) break;

      raw.sort(Comparator
          .comparing((BatchMatch m) -> byId.get(m.incidentId()).isP1()).reversed()
          .thenComparing(Comparator.comparingDouble(BatchMatch::score).reversed())
          .thenComparing(BatchMatch::incidentId));

      Set<UUID> kept = new HashSet<>();
      for (BatchMatch m : raw) {
        TicketCandidate tc = byId.get(m.incidentId());
        double room = free.getOrDefault(m.technicianId(), 0.0);
        if (tc.isP1() && p1Taken.contains(m.technicianId())) continue;
        if (tc.weight() <= room + EPS) {
          accepted.add(m);
          kept.add(m.incidentId());
          free.put(m.technicianId(), room - tc.weight());
          if (tc.isP1()) p1Taken.add(m.technicianId());
        }
      }
      if (kept.isEmpty()) break;
      remaining.removeIf(tc -> kept.contains(tc.incidentId()));
    }

    List<UUID> unassigned = remaining.stream().map(TicketCandidate::incidentId).toList();
    return new BatchResult(accepted, unassigned);
  }

  private static List<BatchMatch> solveOnce(
      List<TicketCandidate> incidents,
      Map<UUID, Double> free,
      Map<UUID, Map<UUID, Double>> scores,
      Set<UUID> p1Taken
  ) {
    List<TechSlot> slots = new ArrayList<>();
    for (var entry : free.entrySet()) {
      UUID techId = entry.getKey();
      double f = entry.getValue();
      int maxSlots = Math.min(4, (int) Math.floor((f + EPS) / 0.5));
      for (int k = 1; k <= maxSlots; k++) {
        slots.add(new TechSlot(techId, k, f / k));
      }
    }

    int n = Math.max(incidents.size(), slots.size());
    if (n == 0) return List.of();

    double[][] cost = new double[n][n];
    for (double[] row : cost) Arrays.fill(row, 1.0);

    for (int i = 0; i < incidents.size(); i++) {
      TicketCandidate inc = incidents.get(i);
      Map<UUID, Double> scoredTechs = scores.getOrDefault(inc.incidentId(), Map.of());
      for (int j = 0; j < slots.size(); j++) {
        TechSlot slot = slots.get(j);
        Double hybridScore = scoredTechs.get(slot.technicianId());
        if (hybridScore == null) continue;
        if (inc.weight() > slot.marginalCeiling() + EPS) continue;
        if (inc.isP1() && (slot.slotIndex() > 1 || p1Taken.contains(slot.technicianId()))) continue;

        double dispersionPenalty = 0.03 * (slot.slotIndex() - 1);
        double rawCost = 1.0 - hybridScore + dispersionPenalty;
        cost[i][j] = Math.max(0.0, Math.min(0.99, rawCost));
      }
    }

    int[] matchColForRow = solveKuhnMunkres(cost);
    List<BatchMatch> out = new ArrayList<>();
    for (int i = 0; i < incidents.size(); i++) {
      int j = matchColForRow[i];
      if (j < slots.size() && cost[i][j] < 1.0) {
        UUID techId = slots.get(j).technicianId();
        double rawScore = scores.get(incidents.get(i).incidentId()).get(techId);
        out.add(new BatchMatch(incidents.get(i).incidentId(), techId, rawScore));
      }
    }
    return out;
  }

  public static int[] solveKuhnMunkres(double[][] a) {
    int n = a.length;
    double[] u = new double[n + 1];
    double[] v = new double[n + 1];
    int[] p = new int[n + 1];
    int[] way = new int[n + 1];

    for (int i = 1; i <= n; i++) {
      p[0] = i;
      int j0 = 0;
      double[] minv = new double[n + 1];
      boolean[] used = new boolean[n + 1];
      Arrays.fill(minv, Double.POSITIVE_INFINITY);

      do {
        used[j0] = true;
        int i0 = p[j0];
        double delta = Double.POSITIVE_INFINITY;
        int j1 = 0;
        for (int j = 1; j <= n; j++) {
          if (!used[j]) {
            double cur = a[i0 - 1][j - 1] - u[i0] - v[j];
            if (cur < minv[j]) {
              minv[j] = cur;
              way[j] = j0;
            }
            if (minv[j] < delta) {
              delta = minv[j];
              j1 = j;
            }
          }
        }
        for (int j = 0; j <= n; j++) {
          if (used[j]) {
            u[p[j]] += delta;
            v[j] -= delta;
          } else {
            minv[j] -= delta;
          }
        }
        j0 = j1;
      } while (p[j0] != 0);

      do {
        int j1 = way[j0];
        p[j0] = p[j1];
        j0 = j1;
      } while (j0 != 0);
    }

    int[] rowMatch = new int[n];
    for (int j = 1; j <= n; j++) {
      if (p[j] > 0) rowMatch[p[j] - 1] = j - 1;
    }
    return rowMatch;
  }
}
