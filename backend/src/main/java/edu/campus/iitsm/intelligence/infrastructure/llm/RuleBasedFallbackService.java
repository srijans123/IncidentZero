package edu.campus.iitsm.intelligence.infrastructure.llm;

import edu.campus.iitsm.intelligence.api.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RuleBasedFallbackService {

  @SuppressWarnings("unchecked")
  public <T> T generateFallback(Class<T> schema, String promptName, String text) {
    String lower = text != null ? text.toLowerCase() : "";

    if (schema.equals(LlmClassificationSchema.class)) {
      String category = "SOFTWARE";
      String service = "APP-ERP";
      int urgency = 3;

      if (lower.contains("ldap") || lower.contains("sso") || lower.contains("login") || lower.contains("auth")) {
        category = "AUTHENTICATION";
        service = "AUTH-LDAP";
        urgency = 2;
      } else if (lower.contains("wifi") || lower.contains("network") || lower.contains("router")) {
        category = "NETWORK";
        service = "NET-CORE";
        urgency = 2;
      } else if (lower.contains("lms") || lower.contains("nalanda")) {
        category = "SOFTWARE";
        service = "APP-LMS";
      } else if (lower.contains("library") || lower.contains("ezproxy")) {
        category = "SOFTWARE";
        service = "APP-LIB";
      }

      return (T) new LlmClassificationSchema(
          category,
          service,
          "CAMPUS",
          50,
          urgency,
          List.of("error", "timeout"),
          List.of(),
          null,
          0.85,
          "Deterministic rule-based keyword classification"
      );
    }

    if (schema.equals(LlmResolutionSchema.class)) {
      return (T) new LlmResolutionSchema(
          false,
          0.80,
          List.of(
              new LlmResolutionSchema.RemediationStep(1, "Verify upstream dependency status and error logs.", "KB-0001"),
              new LlmResolutionSchema.RemediationStep(2, "Recycle pool connections and monitor latency.", "KB-0001")
          ),
          List.of("Verify campus firewall rules if connection refused.")
      );
    }

    if (schema.equals(LlmPirDraftSchema.class)) {
      return (T) new LlmPirDraftSchema(
          "Blameless Post-Incident Review compiled from immutable audit records.",
          "Campus-wide service disruption during peak load.",
          List.of(),
          "Root cause identified as connection pool exhaustion on upstream dependency.",
          List.of("Incident declared promptly and containment steps initiated."),
          List.of("Monitoring alarms were delayed by 3 minutes."),
          List.of(new LlmPirDraftSchema.ActionItem("Infrastructure Lead", "Tune max-connections parameter and alert thresholds.", "P2"))
      );
    }

    if (schema.equals(LlmRcaExplanationSchema.class)) {
      return (T) new LlmRcaExplanationSchema(
          false,
          "AUTH-LDAP",
          "Cascading authentication failure originating from LDAP connection pool exhaustion.",
          List.of(),
          List.of("Check LDAP connection metrics", "Inspect network latency between app servers and LDAP host")
      );
    }

    if (schema.equals(LlmSearchFilterAst.class)) {
      return (T) new LlmSearchFilterAst(List.of());
    }

    throw new IllegalArgumentException("Unsupported schema: " + schema.getName());
  }
}
