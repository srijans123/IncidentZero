package edu.campus.iitsm.incident.infrastructure.web;

import edu.campus.iitsm.incident.api.dto.IncidentDtos;
import edu.campus.iitsm.intelligence.api.CategorizationPort;
import edu.campus.iitsm.intelligence.api.DuplicateCandidate;
import edu.campus.iitsm.intelligence.api.DuplicateDetectionPort;
import edu.campus.iitsm.intelligence.api.LlmClassificationSchema;
import edu.campus.iitsm.shared.domain.ClockPort;
import edu.campus.iitsm.shared.domain.Suggestion;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/intake")
public class IntakeController {

  private final CategorizationPort categorizationPort;
  private final DuplicateDetectionPort duplicateDetectionPort;
  private final ClockPort clockPort;

  public IntakeController(
      CategorizationPort categorizationPort,
      DuplicateDetectionPort duplicateDetectionPort,
      ClockPort clockPort
  ) {
    this.categorizationPort = categorizationPort;
    this.duplicateDetectionPort = duplicateDetectionPort;
    this.clockPort = clockPort;
  }

  @PostMapping("/advice")
  public ResponseEntity<IncidentDtos.AdviceResponse> getAdvice(@RequestBody IncidentDtos.AdviceRequest request) {
    String title = request.title() != null ? request.title() : "";
    String desc = request.description() != null ? request.description() : "";

    // 1. A2 Categorization
    Suggestion<LlmClassificationSchema> catSuggestion = categorizationPort.classify(title, desc);
    LlmClassificationSchema cat = catSuggestion.value();

    String suggestedCat = cat != null ? cat.categoryCode() : "SOFTWARE";
    String suggestedSvc = cat != null ? cat.serviceCode() : "APP-ERP";
    int urgency = request.urgency() != null ? request.urgency() : (cat != null ? cat.urgencyHint() : 3);
    int suggestedImpact = 2;

    // 2. A1 Duplicate Detection
    List<DuplicateCandidate> duplicates = duplicateDetectionPort.findDuplicates(
        null, title + " " + desc, null, clockPort.now(), 1440
    );

    // 3. Relevant KB articles
    List<String> kbArticles = List.of("KB-0001: Common SSO and LDAP Connection Troubleshooting");

    String question = cat != null ? cat.clarifyingQuestion() : null;

    IncidentDtos.AdviceResponse response = new IncidentDtos.AdviceResponse(
        duplicates,
        suggestedCat,
        suggestedSvc,
        suggestedImpact,
        kbArticles,
        question
    );

    return ResponseEntity.ok(response);
  }
}
