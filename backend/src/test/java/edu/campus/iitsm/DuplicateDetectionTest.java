package edu.campus.iitsm;

import edu.campus.iitsm.intelligence.api.DuplicateCandidate;
import edu.campus.iitsm.intelligence.infrastructure.embedding.HashEmbeddingAdapter;
import edu.campus.iitsm.intelligence.infrastructure.search.DuplicateDetectionAdapter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class DuplicateDetectionTest {

  private HashEmbeddingAdapter hashEmbedding;
  private JdbcTemplate jdbcTemplate;
  private DuplicateDetectionAdapter adapter;

  @BeforeEach
  void setUp() {
    hashEmbedding = new HashEmbeddingAdapter();
    jdbcTemplate = mock(JdbcTemplate.class);
    adapter = new DuplicateDetectionAdapter(jdbcTemplate, hashEmbedding);
  }

  @Test
  void testHashEmbeddingGenerates384DimensionsUnitVector() {
    float[] vec = hashEmbedding.embed("Course registration portal timeout on SSO redirect");
    assertNotNull(vec);
    assertEquals(384, vec.length);

    // Verify L2 normalization: sum(v^2) ~= 1.0
    double sumSq = 0.0;
    for (float v : vec) {
      sumSq += (double) v * v;
    }
    assertEquals(1.0, sumSq, 1e-4, "Embedding vector must be L2-normalized unit vector");
    assertEquals("bge-small-en-v1.5-hash", hashEmbedding.modelVersion());
  }

  @Test
  void testDuplicateDetectionCalculatesDiLinkLiteScores() {
    UUID incidentId = UUID.randomUUID();
    UUID serviceId = UUID.fromString("30000000-0000-0000-0000-000000000001");
    UUID existingCandId = UUID.randomUUID();
    Instant now = Instant.parse("2026-10-29T10:00:00Z");

    when(jdbcTemplate.query(anyString(), any(org.springframework.jdbc.core.PreparedStatementSetter.class), any(RowMapper.class)))
        .thenAnswer(invocation -> {
          RowMapper<DuplicateCandidate> mapper = invocation.getArgument(2);
          java.sql.ResultSet rs = mock(java.sql.ResultSet.class);
          when(rs.getObject("candidate_id")).thenReturn(existingCandId);
          when(rs.getString("candidate_number")).thenReturn("INC-2026-000001");
          when(rs.getString("candidate_title")).thenReturn("Course registration portal timeout on SSO redirect");
          when(rs.getObject("candidate_service_id")).thenReturn(serviceId);
          when(rs.getTimestamp("candidate_created_at")).thenReturn(Timestamp.from(now.minusSeconds(300)));
          when(rs.getDouble("rrf")).thenReturn(0.032);
          when(rs.getDouble("cosine")).thenReturn(0.95);

          DuplicateCandidate cand = mapper.mapRow(rs, 1);
          return List.of(cand);
        });

    List<DuplicateCandidate> results = adapter.findDuplicates(
        incidentId,
        "Course registration portal timeout on SSO redirect",
        serviceId,
        now,
        60
    );

    assertNotNull(results);
    assertEquals(1, results.size());
    DuplicateCandidate cand = results.get(0);
    assertEquals(existingCandId, cand.candidateId());
    assertEquals("INC-2026-000001", cand.candidateNumber());
    assertTrue(cand.linkScore() >= 0.82, "High cosine + same service + recent time should yield linkScore >= 0.82");
    assertEquals("CHILD", cand.relationship(), "High linkScore with same service should categorize as CHILD");
  }

  @Test
  void testShortQueryReturnsEmptyList() {
    List<DuplicateCandidate> results = adapter.findDuplicates(
        UUID.randomUUID(), "ab", UUID.randomUUID(), Instant.now(), 60
    );
    assertTrue(results.isEmpty());
  }
}
