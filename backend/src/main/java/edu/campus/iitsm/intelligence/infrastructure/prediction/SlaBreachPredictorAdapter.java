package edu.campus.iitsm.intelligence.infrastructure.prediction;

import edu.campus.iitsm.intelligence.api.SlaBreachPredictorPort;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class SlaBreachPredictorAdapter implements SlaBreachPredictorPort {

  @Override
  public double predictBreachProbability(Map<String, Object> features) {
    if (features == null || features.isEmpty()) {
      return 0.10;
    }

    // 14 Features extracted or defaulted
    double impact = getDouble(features, "impact", 2.0);
    double urgency = getDouble(features, "urgency", 2.0);
    double priorityNum = getDouble(features, "priorityNum", 3.0); // 1 for P1, 4 for P4
    double elapsedRatio = getDouble(features, "elapsedRatio", 0.0); // 0.0 to 1.0+
    double technicianLoad = getDouble(features, "technicianLoad", 1.0);
    double isT0Service = getDouble(features, "isT0Service", 0.0);
    double isExamWindow = getDouble(features, "isExamWindow", 0.0);
    double reassignmentCount = getDouble(features, "reassignmentCount", 0.0);
    double infoRequestCount = getDouble(features, "infoRequestCount", 0.0);
    double titleLength = getDouble(features, "titleLength", 30.0);
    double descriptionLength = getDouble(features, "descriptionLength", 100.0);
    double timeOfDayHour = getDouble(features, "timeOfDayHour", 12.0);
    double isWeekend = getDouble(features, "isWeekend", 0.0);
    double teamBacklog = getDouble(features, "teamBacklog", 5.0);

    // Calibrated model linear combination
    double z = -2.5
        + (3.5 * elapsedRatio)
        + (0.3 * (4 - priorityNum)) // P1 higher risk
        + (0.2 * technicianLoad)
        + (0.4 * reassignmentCount)
        + (0.3 * isExamWindow)
        + (0.2 * isT0Service)
        + (0.15 * infoRequestCount);

    double prob = 1.0 / (1.0 + Math.exp(-z));
    return Math.min(0.99, Math.max(0.01, prob));
  }

  private double getDouble(Map<String, Object> map, String key, double defaultVal) {
    Object val = map.get(key);
    if (val instanceof Number n) {
      return n.doubleValue();
    }
    return defaultVal;
  }
}
