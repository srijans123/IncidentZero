package edu.campus.iitsm;

import edu.campus.iitsm.intelligence.api.LlmResolutionSchema;
import edu.campus.iitsm.intelligence.infrastructure.rag.ResolutionRagAdapter;
import edu.campus.iitsm.shared.domain.ClockPort;
import edu.campus.iitsm.shared.domain.LanguageModelPort;
import edu.campus.iitsm.shared.domain.Suggestion;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class CaseBasedRagTest {

  private LanguageModelPort languageModelPort;
  private ClockPort clockPort;
  private ResolutionRagAdapter adapter;

  @BeforeEach
  void setUp() {
    languageModelPort = mock(LanguageModelPort.class);
    clockPort = new edu.campus.iitsm.shared.domain.VirtualAnchoredClock(
        Instant.parse("2026-10-29T10:00:00Z"), 1, () -> {}
    );
    adapter = new ResolutionRagAdapter(languageModelPort, clockPort);
  }

  @Test
  void testCitationVerifierRetainsGroundedSteps() {
    UUID incidentId = UUID.randomUUID();
    List<String> validSources = List.of("KB-0001", "INC-2026-000104");

    LlmResolutionSchema rawSchema = new LlmResolutionSchema(
        false,
        0.90,
        List.of(
            new LlmResolutionSchema.RemediationStep(1, "Check upstream LDAP logs", "KB-0001"),
            new LlmResolutionSchema.RemediationStep(2, "Restart connection pool", "INC-2026-000104")
        ),
        List.of("Ensure dependent services are notified")
    );

    Suggestion<LlmResolutionSchema> mockSuggestion = new Suggestion<>(
        rawSchema, 0.90, "REPLAY", "model-v1", "v1", "Raw RAG", false, clockPort.now()
    );

    when(languageModelPort.generateStructured(anyString(), anyString(), anyString(), eq(LlmResolutionSchema.class)))
        .thenReturn(mockSuggestion);

    Suggestion<LlmResolutionSchema> result = adapter.generateResolution(
        incidentId, "AUTH-LDAP", "AUTHENTICATION", "SSO timeout", validSources
    );

    assertNotNull(result);
    assertFalse(result.fromFallback());
    assertEquals(2, result.value().steps().size());
    assertEquals("KB-0001", result.value().steps().get(0).citedSourceId());
    assertEquals("INC-2026-000104", result.value().steps().get(1).citedSourceId());
  }

  @Test
  void testCitationVerifierDropsHallucinatedSourcesAndTriggersFallback() {
    UUID incidentId = UUID.randomUUID();
    List<String> validSources = List.of("KB-0001");

    // Only 1 step has valid citation, 2nd step has hallucinated source
    LlmResolutionSchema rawSchema = new LlmResolutionSchema(
        false,
        0.90,
        List.of(
            new LlmResolutionSchema.RemediationStep(1, "Check upstream LDAP logs", "KB-0001"),
            new LlmResolutionSchema.RemediationStep(2, "Run unsupported root shell command", "HALLUCINATED-99")
        ),
        List.of()
    );

    Suggestion<LlmResolutionSchema> mockSuggestion = new Suggestion<>(
        rawSchema, 0.90, "REPLAY", "model-v1", "v1", "Raw RAG", false, clockPort.now()
    );

    when(languageModelPort.generateStructured(anyString(), anyString(), anyString(), eq(LlmResolutionSchema.class)))
        .thenReturn(mockSuggestion);

    Suggestion<LlmResolutionSchema> result = adapter.generateResolution(
        incidentId, "AUTH-LDAP", "AUTHENTICATION", "SSO timeout", validSources
    );

    assertNotNull(result);
    // Since only 1 valid step remained (< 2), citation verifier fell back to verified knowledge base rules
    assertTrue(result.fromFallback(), "When fewer than 2 verified steps remain, fallback must be triggered");
    assertEquals("RULES", result.source());
    assertTrue(result.value().steps().size() >= 2);
  }
}
