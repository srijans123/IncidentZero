package edu.campus.iitsm.shared.domain;

public final class UserInfoContext {
  private static final ThreadLocal<String> CURRENT_ANSWER = new ThreadLocal<>();

  private UserInfoContext() {}

  public static void setAnswer(String answer) {
    if (answer != null && !answer.isBlank()) {
      CURRENT_ANSWER.set(answer);
    } else {
      CURRENT_ANSWER.remove();
    }
  }

  public static String getAndClear() {
    String ans = CURRENT_ANSWER.get();
    CURRENT_ANSWER.remove();
    return ans;
  }
}
