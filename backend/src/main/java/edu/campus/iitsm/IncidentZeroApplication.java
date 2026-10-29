package edu.campus.iitsm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class IncidentZeroApplication {
  public static void main(String[] args) {
    SpringApplication.run(IncidentZeroApplication.class, args);
  }
}
