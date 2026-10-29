package edu.campus.iitsm.incident.infrastructure;

import edu.campus.iitsm.incident.application.CommandAuthorizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class IncidentConfiguration {

  @Bean
  public CommandAuthorizer commandAuthorizer() {
    return new CommandAuthorizer();
  }
}
