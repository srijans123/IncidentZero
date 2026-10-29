package edu.campus.iitsm;

import edu.campus.iitsm.audit.domain.AuditHasher;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class AuditLedgerTamperTest {

  @Test
  void testCanonicalizeJsonPreservesValuesAndSortsKeys() {
    String raw = "{\"z\": 1, \"a\": [\"val2\", \"val1\"], \"m\": {\"y\": true, \"x\": \"hello world\"}}";
    String canonical = AuditHasher.canonicalizeJson(raw);
    assertEquals("{\"a\":[\"val2\",\"val1\"],\"m\":{\"x\":\"hello world\",\"y\":true},\"z\":1}", canonical);

    // Reordered json string should yield identical canonical json
    String reordered = "{\"a\": [\"val2\", \"val1\"], \"z\": 1, \"m\": {\"x\": \"hello world\", \"y\": true}}";
    assertEquals(canonical, AuditHasher.canonicalizeJson(reordered));
  }

  @Test
  void testAuditChainVerificationAndTamperingDetection() {
    UUID incidentId = UUID.fromString("00000000-0000-0000-0000-000000000001");
    UUID actorId = UUID.fromString("00000000-0000-0000-0000-000000000002");
    Instant now = Instant.parse("2026-03-02T10:00:00Z");

    List<AuditHasher.AuditRowView> chain = new ArrayList<>();
    String prevHash = AuditHasher.GENESIS_HASH;

    for (int i = 1; i <= 5; i++) {
      Instant rowTs = now.plusSeconds(i * 60L);
      String payload = "{\"step\":" + i + ",\"status\":\"OK\"}";
      String canonicalPayload = AuditHasher.canonicalizeJson(payload);
      String hash = AuditHasher.computeHash(
          prevHash, incidentId, i, rowTs, "TECHNICIAN", actorId,
          "STEP_" + i, "STATE_" + (i - 1), "STATE_" + i, "Step " + i + " applied", canonicalPayload
      );
      chain.add(new AuditHasher.AuditRowView(
          (long) i, incidentId, i, rowTs, "TECHNICIAN", actorId,
          "STEP_" + i, "STATE_" + (i - 1), "STATE_" + i, "Step " + i + " applied",
          canonicalPayload, prevHash, hash
      ));
      prevHash = hash;
    }

    // Valid chain check
    AuditHasher.VerificationReport okReport = AuditHasher.verifyIncidentChain(chain, prevHash, 5);
    assertTrue(okReport.valid(), "Chain should be completely valid");
    assertNull(okReport.firstCorruptedRowId());

    // Tampering test: tamper with row 3's description
    AuditHasher.AuditRowView row3 = chain.get(2);
    AuditHasher.AuditRowView tamperedRow3 = new AuditHasher.AuditRowView(
        row3.id(), row3.incidentId(), row3.chainIndex(), row3.ts(), row3.actorType(), row3.actorId(),
        row3.action(), row3.prevState(), row3.newState(), "Tampered description",
        row3.canonicalPayloadJson(), row3.prevHash(), row3.hash()
    );
    List<AuditHasher.AuditRowView> tamperedChain = new ArrayList<>(chain);
    tamperedChain.set(2, tamperedRow3);

    AuditHasher.VerificationReport failReport = AuditHasher.verifyIncidentChain(tamperedChain, prevHash, 5);
    assertFalse(failReport.valid(), "Tampered chain must be detected as invalid");
    assertEquals(3L, failReport.firstCorruptedRowId());
    assertTrue(failReport.failureReason().contains("SHA-256 payload mismatch"));
  }
}
