package edu.campus.iitsm.shared.domain;

import java.util.UUID;

public interface IdGeneratorPort {
  UUID newUuidV7();
  String nextIncidentNumber(int year);
}
