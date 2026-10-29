package edu.campus.iitsm.intelligence.api;

import java.time.Instant;
import java.util.UUID;

public record DuplicateCandidate(
    UUID candidateId,
    String candidateNumber,
    String candidateTitle,
    UUID serviceId,
    Instant createdAt,
    double rrfScore,
    double cosineSimilarity,
    double linkScore,
    String relationship // "CHILD", "RELATED", "SUGGESTED"
) {}
