package edu.campus.iitsm.intelligence.api;

import java.util.Map;

public interface SlaBreachPredictorPort {
  double predictBreachProbability(Map<String, Object> features);
}
