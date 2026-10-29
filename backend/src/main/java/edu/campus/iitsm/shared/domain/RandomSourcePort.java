package edu.campus.iitsm.shared.domain;

public interface RandomSourcePort {
  double nextDouble();
  int nextInt(int bound);
}
