package edu.campus.iitsm.intelligence.infrastructure.search;

import edu.campus.iitsm.intelligence.api.DuplicateCandidate;
import edu.campus.iitsm.intelligence.api.DuplicateDetectionPort;
import edu.campus.iitsm.shared.domain.EmbeddingPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Component
public class DuplicateDetectionAdapter implements DuplicateDetectionPort {
  private static final Logger log = LoggerFactory.getLogger(DuplicateDetectionAdapter.class);

  private final JdbcTemplate jdbcTemplate;
  private final EmbeddingPort embeddingPort;

  public DuplicateDetectionAdapter(JdbcTemplate jdbcTemplate, EmbeddingPort embeddingPort) {
    this.jdbcTemplate = jdbcTemplate;
    this.embeddingPort = embeddingPort;
  }

  @Override
  public List<DuplicateCandidate> findDuplicates(
      UUID incidentId,
      String queryText,
      UUID serviceId,
      Instant nowUtc,
      int windowMinutes
  ) {
    if (queryText == null || queryText.trim().length() < 3) {
      return List.of();
    }

    float[] vec = embeddingPort.embed(queryText);
    String vecStr = formatVector(vec);
    String modelVersion = embeddingPort.modelVersion();
    Timestamp nowTs = Timestamp.from(nowUtc != null ? nowUtc : Instant.now());

    String sql = """
        WITH win AS (
          SELECT id, number, title, service_id, status, created_at, search_tsv, embedding, embedding_model
          FROM incident
          WHERE parent_id IS NULL
            AND status NOT IN ('RESOLVED', 'VERIFIED', 'CLOSED', 'CANCELLED')
            AND created_at >= CAST(? AS timestamptz) - make_interval(mins => CAST(? AS integer))
            AND (CAST(? AS uuid) IS NULL OR id <> CAST(? AS uuid))
        ),
        lex AS (
          SELECT id,
                 row_number() OVER (
                   ORDER BY ts_rank_cd(search_tsv, websearch_to_tsquery('english', CAST(? AS text))) DESC,
                            created_at DESC
                 ) AS r,
                 ts_rank_cd(search_tsv, websearch_to_tsquery('english', CAST(? AS text))) AS lex_score
          FROM win
          WHERE char_length(trim(CAST(? AS text))) >= 3
            AND search_tsv @@ websearch_to_tsquery('english', CAST(? AS text))
          LIMIT 50
        ),
        sem AS (
          SELECT id,
                 row_number() OVER (
                   ORDER BY embedding <=> CAST(NULLIF(trim(CAST(? AS text)), '') AS vector) ASC,
                            created_at DESC
                 ) AS r,
                 1.0 - (embedding <=> CAST(NULLIF(trim(CAST(? AS text)), '') AS vector)) AS cosine
          FROM win
          WHERE NULLIF(trim(CAST(? AS text)), '') IS NOT NULL
            AND embedding IS NOT NULL
            AND embedding_model = CAST(? AS text)
          ORDER BY embedding <=> CAST(NULLIF(trim(CAST(? AS text)), '') AS vector) ASC
          LIMIT 50
        )
        SELECT w.id AS candidate_id,
               w.number AS candidate_number,
               w.title AS candidate_title,
               w.service_id AS candidate_service_id,
               w.created_at AS candidate_created_at,
               coalesce(1.0 / (60 + l.r), 0.0) + coalesce(1.0 / (60 + s.r), 0.0) AS rrf,
               coalesce(s.cosine, 0.0) AS cosine,
               coalesce(l.lex_score, 0.0) AS lex_score
        FROM lex l
        FULL OUTER JOIN sem s ON l.id = s.id
        JOIN win w ON w.id = coalesce(l.id, s.id)
        ORDER BY rrf DESC, cosine DESC
        LIMIT 10;
        """;

    try {
      List<DuplicateCandidate> candidates = jdbcTemplate.query(
          sql,
          ps -> {
            ps.setTimestamp(1, nowTs);
            ps.setInt(2, windowMinutes > 0 ? windowMinutes : 1440);
            ps.setObject(3, incidentId);
            ps.setObject(4, incidentId);
            ps.setString(5, queryText);
            ps.setString(6, queryText);
            ps.setString(7, queryText);
            ps.setString(8, queryText);
            ps.setString(9, vecStr);
            ps.setString(10, vecStr);
            ps.setString(11, vecStr);
            ps.setString(12, modelVersion);
            ps.setString(13, vecStr);
          },
          (rs, rowNum) -> {
            UUID candId = (UUID) rs.getObject("candidate_id");
            String candNum = rs.getString("candidate_number");
            String candTitle = rs.getString("candidate_title");
            UUID candServiceId = (UUID) rs.getObject("candidate_service_id");
            Timestamp candCreatedTs = rs.getTimestamp("candidate_created_at");
            Instant candCreatedAt = candCreatedTs != null ? candCreatedTs.toInstant() : nowUtc;
            double rrf = rs.getDouble("rrf");
            double cosine = rs.getDouble("cosine");

            double linkScore = computeDiLinkLiteScore(
                cosine,
                serviceId,
                candServiceId,
                candCreatedAt,
                nowUtc,
                queryText,
                candTitle
            );

            String relationship;
            boolean sameService = serviceId != null && serviceId.equals(candServiceId);
            if (sameService && linkScore >= 0.82) {
              relationship = "CHILD";
            } else if (linkScore >= 0.82) {
              relationship = "RELATED";
            } else if (linkScore >= 0.65) {
              relationship = "SUGGESTED";
            } else {
              relationship = "NONE";
            }

            return new DuplicateCandidate(
                candId,
                candNum,
                candTitle,
                candServiceId,
                candCreatedAt,
                rrf,
                cosine,
                linkScore,
                relationship
            );
          }
      );

      // Return only candidates meeting suggestion threshold
      return candidates.stream()
          .filter(c -> c.linkScore() >= 0.65)
          .toList();
    } catch (Exception e) {
      log.warn("SQL hybrid RRF duplicate search failed: {}. Falling back to title scan.", e.getMessage());
      return fallbackTitleScan(incidentId, queryText, serviceId, nowUtc, windowMinutes);
    }
  }

  private double computeDiLinkLiteScore(
      double cosine,
      UUID targetServiceId,
      UUID candServiceId,
      Instant candCreated,
      Instant now,
      String queryText,
      String candTitle
  ) {
    // graph score: 1.0 if same service, 0.7 if hard edge, 0.4 soft, else 0.0
    double graph = (targetServiceId != null && targetServiceId.equals(candServiceId)) ? 1.0 : 0.4;

    // delta time minutes
    double dtMinutes = 0.0;
    if (candCreated != null && now != null) {
      dtMinutes = Math.abs(Duration.between(candCreated, now).toMinutes());
    }
    double timeDecay = Math.exp(-dtMinutes / 45.0);

    // Jaccard similarity of token sets
    double jaccard = jaccardSimilarity(queryText, candTitle);

    // DiLink-Lite formula:
    // LinkScore = 0.55 * cos + 0.20 * graph + 0.15 * exp(-dt/45) + 0.10 * jaccard
    double score = 0.55 * Math.max(0.0, cosine)
        + 0.20 * graph
        + 0.15 * timeDecay
        + 0.10 * jaccard;

    return Math.min(1.0, Math.max(0.0, score));
  }

  private double jaccardSimilarity(String s1, String s2) {
    if (s1 == null || s2 == null) return 0.0;
    Set<String> set1 = new HashSet<>(Arrays.asList(s1.toLowerCase().split("\\s+")));
    Set<String> set2 = new HashSet<>(Arrays.asList(s2.toLowerCase().split("\\s+")));
    set1.removeIf(s -> s.length() < 3);
    set2.removeIf(s -> s.length() < 3);
    if (set1.isEmpty() || set2.isEmpty()) return 0.0;

    Set<String> intersection = new HashSet<>(set1);
    intersection.retainAll(set2);

    Set<String> union = new HashSet<>(set1);
    union.addAll(set2);

    return (double) intersection.size() / (double) union.size();
  }

  private List<DuplicateCandidate> fallbackTitleScan(
      UUID incidentId,
      String queryText,
      UUID serviceId,
      Instant nowUtc,
      int windowMinutes
  ) {
    String fallbackSql = """
        SELECT id, number, title, service_id, created_at
        FROM incident
        WHERE parent_id IS NULL
          AND status NOT IN ('RESOLVED', 'VERIFIED', 'CLOSED', 'CANCELLED')
          AND (CAST(? AS uuid) IS NULL OR id <> CAST(? AS uuid))
        ORDER BY created_at DESC
        LIMIT 20
        """;

    try {
      return jdbcTemplate.query(
          fallbackSql,
          ps -> {
            ps.setObject(1, incidentId);
            ps.setObject(2, incidentId);
          },
          (rs, rowNum) -> {
            UUID candId = (UUID) rs.getObject("id");
            String candNum = rs.getString("number");
            String candTitle = rs.getString("title");
            UUID candServiceId = (UUID) rs.getObject("service_id");
            Timestamp ts = rs.getTimestamp("created_at");
            Instant created = ts != null ? ts.toInstant() : nowUtc;

            double jaccard = jaccardSimilarity(queryText, candTitle);
            double linkScore = computeDiLinkLiteScore(
                jaccard, serviceId, candServiceId, created, nowUtc, queryText, candTitle
            );

            String rel = (serviceId != null && serviceId.equals(candServiceId) && linkScore >= 0.82)
                ? "CHILD"
                : (linkScore >= 0.82 ? "RELATED" : (linkScore >= 0.65 ? "SUGGESTED" : "NONE"));

            return new DuplicateCandidate(
                candId, candNum, candTitle, candServiceId, created, jaccard, jaccard, linkScore, rel
            );
          }
      ).stream().filter(c -> c.linkScore() >= 0.65).toList();
    } catch (Exception ex) {
      log.error("Fallback scan failed", ex);
      return List.of();
    }
  }

  private String formatVector(float[] vec) {
    if (vec == null || vec.length == 0) return "[]";
    StringBuilder sb = new StringBuilder("[");
    for (int i = 0; i < vec.length; i++) {
      if (i > 0) sb.append(",");
      sb.append(String.format(Locale.US, "%.6f", vec[i]));
    }
    sb.append("]");
    return sb.toString();
  }
}
