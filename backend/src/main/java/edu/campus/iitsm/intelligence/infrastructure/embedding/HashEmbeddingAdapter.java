package edu.campus.iitsm.intelligence.infrastructure.embedding;

import edu.campus.iitsm.shared.domain.EmbeddingPort;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import org.springframework.stereotype.Component;

@Component
public class HashEmbeddingAdapter implements EmbeddingPort {
  private static final int DIMENSIONS = 384;
  private static final String MODEL_VERSION = "bge-small-en-v1.5-hash";

  @Override
  public float[] embed(String text) {
    if (text == null || text.isBlank()) {
      float[] zero = new float[DIMENSIONS];
      zero[0] = 1.0f;
      return zero;
    }

    float[] vec = new float[DIMENSIONS];
    String normalized = text.toLowerCase().trim();
    String[] tokens = normalized.split("\\s+");

    // Token trigrams and character n-grams to seed dimensions
    for (int i = 0; i < tokens.length; i++) {
      String token = tokens[i];
      byte[] hash = sha256(token + ":" + i);
      for (int d = 0; d < DIMENSIONS; d++) {
        int byteIdx = d % hash.length;
        int val = hash[byteIdx] & 0xFF;
        vec[d] += (float) (val - 128) / 128.0f;
      }
      if (i + 2 < tokens.length) {
        String trigram = tokens[i] + " " + tokens[i + 1] + " " + tokens[i + 2];
        byte[] thash = sha256(trigram);
        for (int d = 0; d < DIMENSIONS; d++) {
          int bidx = (d + 13) % thash.length;
          int val = thash[bidx] & 0xFF;
          vec[d] += 2.0f * ((float) (val - 128) / 128.0f);
        }
      }
    }

    // L2 Normalize
    double sumSq = 0.0;
    for (float v : vec) {
      sumSq += (double) v * v;
    }
    float norm = (float) Math.sqrt(sumSq);
    if (norm > 1e-9) {
      for (int i = 0; i < DIMENSIONS; i++) {
        vec[i] /= norm;
      }
    } else {
      vec[0] = 1.0f;
    }
    return vec;
  }

  @Override
  public String modelVersion() {
    return MODEL_VERSION;
  }

  private byte[] sha256(String input) {
    try {
      MessageDigest md = MessageDigest.getInstance("SHA-256");
      return md.digest(input.getBytes(StandardCharsets.UTF_8));
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException("SHA-256 unavailable", e);
    }
  }
}
