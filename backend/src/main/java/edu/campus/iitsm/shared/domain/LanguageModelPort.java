package edu.campus.iitsm.shared.domain;

public interface LanguageModelPort {
  <T> Suggestion<T> generateStructured(String promptName, String promptVersion, String renderedPrompt, Class<T> schema);
}
