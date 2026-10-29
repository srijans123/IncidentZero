package edu.campus.iitsm.shared.domain;

public interface EmbeddingPort {
  float[] embed(String text);
  String modelVersion();
}
