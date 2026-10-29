package edu.campus.iitsm.shared.domain;

import java.time.Instant;

public record Suggestion<T>(
    T value,
    double confidence,
    String source,
    String modelVersion,
    String promptVersion,
    String explanation,
    boolean fromFallback,
    Instant createdAt
) {}
