package edu.campus.iitsm.audit.domain;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;

public final class AuditHasher {
  private static final String SEP = "\u001F";
  public static final String GENESIS_HASH = "0".repeat(64);

  public record AuditRowView(
      long id, UUID incidentId, int chainIndex, Instant ts, String actorType, UUID actorId,
      String action, String prevState, String newState, String description,
      String canonicalPayloadJson, String prevHash, String hash
  ) {}

  public record VerificationReport(boolean valid, Long firstCorruptedRowId, String failureReason) {
    public static VerificationReport ok() { return new VerificationReport(true, null, null); }
    public static VerificationReport fail(long rowId, String reason) {
      return new VerificationReport(false, rowId, reason);
    }
  }

  /**
   * Recursively canonicalizes any JSON value (objects, arrays, strings with escaped quotes/colons,
   * numbers, booleans, null) with lexicographically sorted object keys at all nesting levels and
   * zero insignificant whitespace outside string literals.
   */
  public static String canonicalizeJson(String rawJson) {
    if (rawJson == null || rawJson.isBlank()) return "{}";
    String s = rawJson.strip();
    int[] pos = new int[]{0};
    return parseJsonValue(s, pos);
  }

  private static int skipWs(String s, int p) {
    while (p < s.length() && Character.isWhitespace(s.charAt(p))) p++;
    return p;
  }

  private static String parseJsonString(String s, int[] pos) {
    int start = pos[0];
    int p = start + 1; // skip opening '"'
    while (p < s.length()) {
      char c = s.charAt(p);
      if (c == '\\') {
        p += 2;
      } else if (c == '"') {
        pos[0] = p + 1;
        return s.substring(start, p + 1);
      } else {
        p++;
      }
    }
    pos[0] = p;
    return s.substring(start);
  }

  private static String parseJsonValue(String s, int[] pos) {
    int p = skipWs(s, pos[0]);
    pos[0] = p;
    if (p >= s.length()) return "";
    char c = s.charAt(p);
    if (c == '{') return parseJsonObject(s, pos);
    if (c == '[') return parseJsonArray(s, pos);
    if (c == '"') return parseJsonString(s, pos);
    int start = p;
    while (p < s.length()) {
      char ch = s.charAt(p);
      if (Character.isWhitespace(ch) || ch == ',' || ch == '}' || ch == ']') break;
      p++;
    }
    pos[0] = p;
    return s.substring(start, p);
  }

  private static String parseJsonArray(String s, int[] pos) {
    pos[0] = skipWs(s, pos[0] + 1); // skip '['
    if (pos[0] < s.length() && s.charAt(pos[0]) == ']') {
      pos[0]++;
      return "[]";
    }
    StringBuilder sb = new StringBuilder("[");
    boolean first = true;
    while (pos[0] < s.length()) {
      String elem = parseJsonValue(s, pos);
      if (!first) sb.append(',');
      first = false;
      sb.append(elem);
      pos[0] = skipWs(s, pos[0]);
      if (pos[0] < s.length() && s.charAt(pos[0]) == ',') {
        pos[0]++;
      } else if (pos[0] < s.length() && s.charAt(pos[0]) == ']') {
        pos[0]++;
        break;
      } else {
        break;
      }
    }
    return sb.append(']').toString();
  }

  private static String parseJsonObject(String s, int[] pos) {
    pos[0] = skipWs(s, pos[0] + 1); // skip '{'
    if (pos[0] < s.length() && s.charAt(pos[0]) == '}') {
      pos[0]++;
      return "{}";
    }
    Map<String, String> sorted = new TreeMap<>();
    while (pos[0] < s.length()) {
      pos[0] = skipWs(s, pos[0]);
      String key;
      if (pos[0] < s.length() && s.charAt(pos[0]) == '"') {
        key = parseJsonString(s, pos);
      } else {
        int start = pos[0];
        while (pos[0] < s.length() && s.charAt(pos[0]) != ':' && s.charAt(pos[0]) != '}' && !Character.isWhitespace(s.charAt(pos[0]))) {
          pos[0]++;
        }
        key = s.substring(start, pos[0]);
      }
      pos[0] = skipWs(s, pos[0]);
      if (pos[0] < s.length() && s.charAt(pos[0]) == ':') pos[0]++;
      String val = parseJsonValue(s, pos);
      sorted.put(key, val);
      pos[0] = skipWs(s, pos[0]);
      if (pos[0] < s.length() && s.charAt(pos[0]) == ',') {
        pos[0]++;
      } else if (pos[0] < s.length() && s.charAt(pos[0]) == '}') {
        pos[0]++;
        break;
      } else {
        break;
      }
    }
    StringBuilder sb = new StringBuilder("{");
    boolean first = true;
    for (var e : sorted.entrySet()) {
      if (!first) sb.append(',');
      first = false;
      sb.append(e.getKey()).append(':').append(e.getValue());
    }
    return sb.append('}').toString();
  }

  public static String computeHash(
      String prevHash, UUID incidentId, int chainIndex, Instant ts, String actorType, UUID actorId,
      String action, String prevState, String newState, String description, String canonicalJsonPayload) {
    try {
      String canonicalTs = ts.truncatedTo(ChronoUnit.MICROS).toString();
      String normalizedPayload = canonicalizeJson(canonicalJsonPayload);
      String raw = String.join(SEP,
          prevHash != null ? prevHash : GENESIS_HASH,
          incidentId.toString(),
          Integer.toString(chainIndex),
          canonicalTs,
          actorType,
          actorId != null ? actorId.toString() : "",
          action,
          prevState != null ? prevState : "",
          newState != null ? newState : "",
          description != null ? description : "",
          normalizedPayload
      );
      MessageDigest md = MessageDigest.getInstance("SHA-256");
      return HexFormat.of().formatHex(md.digest(raw.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception e) {
      throw new IllegalStateException("SHA-256 unavailable", e);
    }
  }

  public static VerificationReport verifyIncidentChain(
      List<AuditRowView> orderedRows, String expectedHeadHash, int expectedHeadIndex) {
    String expectedPrev = GENESIS_HASH;
    int expectedIndex = 1;

    for (AuditRowView r : orderedRows) {
      if (r.chainIndex() != expectedIndex) {
        return VerificationReport.fail(r.id(),
            "Gap in chain_index: expected " + expectedIndex + " but found " + r.chainIndex());
      }
      if (!expectedPrev.equals(r.prevHash())) {
        return VerificationReport.fail(r.id(), "Broken prev_hash link at chain_index " + r.chainIndex());
      }
      String recomputed = computeHash(
          r.prevHash(), r.incidentId(), r.chainIndex(), r.ts(), r.actorType(),
          r.actorId(), r.action(), r.prevState(), r.newState(), r.description(), r.canonicalPayloadJson()
      );
      if (!recomputed.equals(r.hash())) {
        return VerificationReport.fail(r.id(),
            "SHA-256 payload mismatch at row id " + r.id() + " (chain_index " + r.chainIndex() + ")");
      }
      expectedPrev = r.hash();
      expectedIndex++;
    }

    if (orderedRows.size() != expectedHeadIndex || !expectedPrev.equals(expectedHeadHash)) {
      long badId = orderedRows.isEmpty() ? -1L : orderedRows.get(orderedRows.size() - 1).id();
      return VerificationReport.fail(badId, "Tail truncation detected against anchored head hash");
    }
    return VerificationReport.ok();
  }
}
