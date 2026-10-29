package edu.campus.iitsm.intelligence.infrastructure.rca;

import edu.campus.iitsm.intelligence.api.LlmRcaExplanationSchema;
import edu.campus.iitsm.intelligence.api.RcaRankerPort;
import edu.campus.iitsm.shared.domain.ClockPort;
import edu.campus.iitsm.shared.domain.Suggestion;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;

@Component
public class RcaRankerAdapter implements RcaRankerPort {
  private final ClockPort clockPort;

  public RcaRankerAdapter(ClockPort clockPort) {
    this.clockPort = clockPort;
  }

  @Override
  public Suggestion<LlmRcaExplanationSchema> rankRootCause(
      Map<String, Integer> serviceReportCounts,
      Map<String, List<String>> dependencyGraph
  ) {
    Instant now = clockPort.now();

    if (serviceReportCounts == null || serviceReportCounts.isEmpty()) {
      LlmRcaExplanationSchema empty = new LlmRcaExplanationSchema(
          true, "UNKNOWN", "No incident reports to analyze", List.of(), List.of()
      );
      return new Suggestion<>(empty, 0.0, "RULES", "graph-rca-v1", "v1", "No reports", true, now);
    }

    Set<String> symptomServices = serviceReportCounts.keySet();
    int totalReports = serviceReportCounts.values().stream().mapToInt(Integer::intValue).sum();

    String bestCandidate = null;
    double bestScore = -Double.MAX_VALUE;

    // Evaluate each candidate service in the graph or reports
    Set<String> allServices = new HashSet<>(symptomServices);
    if (dependencyGraph != null) {
      allServices.addAll(dependencyGraph.keySet());
    }

    for (String cand : allServices) {
      Set<String> reachable = getReachableNodes(cand, dependencyGraph, 4);
      reachable.add(cand);

      // Coverage: |Reach(v) intersect S| / |S|
      Set<String> coveredSymptomServices = new HashSet<>(reachable);
      coveredSymptomServices.retainAll(symptomServices);

      double nodeCoverage = (double) coveredSymptomServices.size() / symptomServices.size();
      int coveredReports = coveredSymptomServices.stream()
          .mapToInt(s -> serviceReportCounts.getOrDefault(s, 0))
          .sum();
      double reportCoverage = totalReports > 0 ? (double) coveredReports / totalReports : 0.0;

      double coverage = 0.60 * nodeCoverage + 0.40 * reportCoverage;

      // Tier T0 bonus (e.g. AUTH-LDAP, NET-CORE)
      double tierBonus = ("AUTH-LDAP".equalsIgnoreCase(cand) || "NET-CORE".equalsIgnoreCase(cand)) ? 0.05 : 0.0;

      // Combined score
      double score = coverage + tierBonus;

      if (score > bestScore) {
        bestScore = score;
        bestCandidate = cand;
      }
    }

    if (bestCandidate == null) {
      bestCandidate = symptomServices.iterator().next();
    }

    String summary = String.format(
        "Root cause candidate '%s' covers %.1f%% of reported symptoms across the campus dependency topology.",
        bestCandidate, bestScore * 100.0
    );

    List<String> checks = List.of(
        "Verify network connectivity and response time on " + bestCandidate,
        "Check connection pool utilization and thread dumps",
        "Inspect recent configuration changes on upstream dependencies"
    );

    LlmRcaExplanationSchema explanation = new LlmRcaExplanationSchema(
        false,
        bestCandidate,
        summary,
        List.of(),
        checks
    );

    return new Suggestion<>(
        explanation,
        Math.min(0.98, bestScore),
        "GRAPH_RCA",
        "graph-rca-v1",
        "v1",
        "Topological dependency graph traversal",
        false,
        now
    );
  }

  private Set<String> getReachableNodes(String start, Map<String, List<String>> graph, int maxHops) {
    Set<String> visited = new HashSet<>();
    if (graph == null) return visited;

    Queue<String> queue = new LinkedList<>();
    Map<String, Integer> distance = new HashMap<>();

    queue.add(start);
    distance.put(start, 0);

    while (!queue.isEmpty()) {
      String curr = queue.poll();
      int d = distance.get(curr);
      if (d >= maxHops) continue;

      List<String> neighbors = graph.get(curr);
      if (neighbors != null) {
        for (String next : neighbors) {
          if (!distance.containsKey(next)) {
            distance.put(next, d + 1);
            visited.add(next);
            queue.add(next);
          }
        }
      }
    }

    return visited;
  }
}
