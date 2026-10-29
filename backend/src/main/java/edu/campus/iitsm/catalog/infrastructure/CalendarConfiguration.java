package edu.campus.iitsm.catalog.infrastructure;

import edu.campus.iitsm.catalog.domain.BusinessCalendar;
import edu.campus.iitsm.shared.domain.WorkingTimeCalculator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.Set;

@Configuration
public class CalendarConfiguration {

  @Bean
  public WorkingTimeCalculator workingTimeCalculator() {
    return new BusinessCalendar(
        ZoneId.of("Asia/Kolkata"),
        Set.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY),
        LocalTime.of(8, 0),
        LocalTime.of(18, 0),
        Collections.emptySet()
    );
  }
}
