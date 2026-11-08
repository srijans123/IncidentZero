# Community 11

> 39 nodes · cohesion 0.08

## Key Concepts

- **org.junit.jupiter.api.Test** (53 connections)
- **DuplicateDetectionAdapter** (15 connections) — `backend/src/main/java/edu/campus/iitsm/intelligence/infrastructure/search/DuplicateDetectionAdapter.java`
- **HashEmbeddingAdapter** (11 connections) — `backend/src/main/java/edu/campus/iitsm/intelligence/infrastructure/embedding/HashEmbeddingAdapter.java`
- **org.junit.jupiter.api.BeforeEach** (11 connections)
- **.generateStructured()** (10 connections) — `backend/src/main/java/edu/campus/iitsm/intelligence/infrastructure/llm/LanguageModelGatewayAdapter.java`
- **.findDuplicates()** (10 connections) — `backend/src/main/java/edu/campus/iitsm/intelligence/infrastructure/search/DuplicateDetectionAdapter.java`
- **EmbeddingPort** (10 connections) — `backend/src/main/java/edu/campus/iitsm/shared/domain/EmbeddingPort.java`
- **DuplicateDetectionTest** (8 connections) — `backend/src/test/java/edu/campus/iitsm/DuplicateDetectionTest.java`
- **.embed()** (5 connections) — `backend/src/main/java/edu/campus/iitsm/intelligence/infrastructure/embedding/HashEmbeddingAdapter.java`
- **.fallbackTitleScan()** (5 connections) — `backend/src/main/java/edu/campus/iitsm/intelligence/infrastructure/search/DuplicateDetectionAdapter.java`
- **.modelVersion()** (4 connections) — `backend/src/main/java/edu/campus/iitsm/intelligence/infrastructure/embedding/HashEmbeddingAdapter.java`
- **.computeDiLinkLiteScore()** (4 connections) — `backend/src/main/java/edu/campus/iitsm/intelligence/infrastructure/search/DuplicateDetectionAdapter.java`
- **.setUp()** (4 connections) — `backend/src/test/java/edu/campus/iitsm/DuplicateDetectionTest.java`
- **.testHashEmbeddingGenerates384DimensionsUnitVector()** (4 connections) — `backend/src/test/java/edu/campus/iitsm/DuplicateDetectionTest.java`
- **.embed()** (3 connections) — `backend/src/main/java/edu/campus/iitsm/intelligence/infrastructure/embedding/OnnxEmbeddingAdapter.java`
- **.modelVersion()** (3 connections) — `backend/src/main/java/edu/campus/iitsm/intelligence/infrastructure/embedding/OnnxEmbeddingAdapter.java`
- **.redact()** (3 connections) — `backend/src/main/java/edu/campus/iitsm/intelligence/infrastructure/llm/PiiRedactor.java`
- **.DuplicateDetectionAdapter()** (3 connections) — `backend/src/main/java/edu/campus/iitsm/intelligence/infrastructure/search/DuplicateDetectionAdapter.java`
- **.jaccardSimilarity()** (3 connections) — `backend/src/main/java/edu/campus/iitsm/intelligence/infrastructure/search/DuplicateDetectionAdapter.java`
- **.testAiProviderOffReturnsRulesFallback()** (3 connections) — `backend/src/test/java/edu/campus/iitsm/AiGatewayTest.java`
- **.testPiiRedaction()** (3 connections) — `backend/src/test/java/edu/campus/iitsm/AiGatewayTest.java`
- **.testPromptInjectionFlaggedByPromptGuard()** (3 connections) — `backend/src/test/java/edu/campus/iitsm/AiGatewayTest.java`
- **.testReplayProviderGeneratesStructuredSchema()** (3 connections) — `backend/src/test/java/edu/campus/iitsm/AiGatewayTest.java`
- **.setUp()** (3 connections) — `backend/src/test/java/edu/campus/iitsm/CaseBasedRagTest.java`
- **.testDuplicateDetectionCalculatesDiLinkLiteScores()** (3 connections) — `backend/src/test/java/edu/campus/iitsm/DuplicateDetectionTest.java`
- *... and 14 more nodes in this community*

## Relationships

- [Community 39](Community_39.md) (14 shared connections)
- [Community 26](Community_26.md) (10 shared connections)
- [Community 9](Community_9.md) (9 shared connections)
- [Community 6](Community_6.md) (7 shared connections)
- [Community 4](Community_4.md) (5 shared connections)
- [Community 35](Community_35.md) (4 shared connections)
- [Community 23](Community_23.md) (4 shared connections)
- [Community 0](Community_0.md) (4 shared connections)
- [Community 48](Community_48.md) (3 shared connections)
- [Community 21](Community_21.md) (3 shared connections)
- [Community 33](Community_33.md) (3 shared connections)
- [Community 15](Community_15.md) (2 shared connections)

## Source Files

- `backend/src/main/java/edu/campus/iitsm/intelligence/infrastructure/embedding/HashEmbeddingAdapter.java`
- `backend/src/main/java/edu/campus/iitsm/intelligence/infrastructure/embedding/OnnxEmbeddingAdapter.java`
- `backend/src/main/java/edu/campus/iitsm/intelligence/infrastructure/llm/LanguageModelGatewayAdapter.java`
- `backend/src/main/java/edu/campus/iitsm/intelligence/infrastructure/llm/PiiRedactor.java`
- `backend/src/main/java/edu/campus/iitsm/intelligence/infrastructure/search/DuplicateDetectionAdapter.java`
- `backend/src/main/java/edu/campus/iitsm/shared/domain/EmbeddingPort.java`
- `backend/src/test/java/edu/campus/iitsm/AiGatewayTest.java`
- `backend/src/test/java/edu/campus/iitsm/CaseBasedRagTest.java`
- `backend/src/test/java/edu/campus/iitsm/DemoWorkflowsEndToEndTest.java`
- `backend/src/test/java/edu/campus/iitsm/DuplicateDetectionTest.java`

## Audit Trail

- EXTRACTED: 136 (91%)
- INFERRED: 14 (9%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*