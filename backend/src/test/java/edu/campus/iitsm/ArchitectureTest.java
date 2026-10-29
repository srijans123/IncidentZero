package edu.campus.iitsm;

import com.tngtech.archunit.core.domain.JavaMethod;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchCondition;
import com.tngtech.archunit.lang.ArchRule;
import com.tngtech.archunit.lang.ConditionEvents;
import com.tngtech.archunit.lang.SimpleConditionEvent;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.Random;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.context.event.EventListener;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.docs.Documenter;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.methods;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noFields;

@AnalyzeClasses(packages = "edu.campus.iitsm", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {

  @ArchTest
  static final ArchRule R1_domain_has_zero_framework_imports = noClasses()
      .that().resideInAPackage("..domain..")
      .should().dependOnClassesThat().resideInAnyPackage(
          "org.springframework..",
          "jakarta.persistence..",
          "jakarta.transaction..",
          "org.hibernate..",
          "com.fasterxml.jackson..",
          "tools.jackson.."
      );

  @ArchTest
  static final ArchRule R2_application_isolated_from_infrastructure_and_jpa = noClasses()
      .that().resideInAPackage("..application..")
      .should().dependOnClassesThat().resideInAnyPackage(
          "jakarta.persistence..",
          "jakarta.servlet..",
          "..infrastructure.."
      );

  @ArchTest
  static final ArchRule R4_controllers_never_touch_repositories = noClasses()
      .that().resideInAPackage("..infrastructure.web..")
      .should().dependOnClassesThat().haveSimpleNameEndingWith("Repository")
      .orShould().dependOnClassesThat().haveSimpleNameEndingWith("JpaRepository");

  @ArchTest
  static final ArchRule R5_ban_wall_clock_and_unseeded_random_in_core = noClasses()
      .that().resideInAnyPackage("..domain..", "..application..")
      .and().doNotHaveSimpleName("ClockPort")
      .and().doNotHaveSimpleName("VirtualAnchoredClock")
      .should().callMethod(Instant.class, "now")
      .orShould().callMethod(LocalDateTime.class, "now")
      .orShould().callMethod(ZonedDateTime.class, "now")
      .orShould().callMethod(System.class, "currentTimeMillis")
      .orShould().callMethod(UUID.class, "randomUUID")
      .orShould().callConstructor(Random.class);

  @ArchTest
  static final ArchRule R6_intelligence_cannot_invoke_incident_commands = noClasses()
      .that().resideInAPackage("edu.campus.iitsm.intelligence..")
      .should().dependOnClassesThat().haveSimpleNameEndingWith("CommandService")
      .orShould().dependOnClassesThat().resideInAPackage("edu.campus.iitsm.incident.domain..");

  @ArchTest
  static final ArchRule R7_port_implementations_live_in_infrastructure = classes()
      .that().haveSimpleNameEndingWith("Adapter")
      .should().resideInAPackage("..infrastructure..");

  @ArchTest
  static final ArchRule R8_constructor_injection_only = noFields()
      .should().beAnnotatedWith("org.springframework.beans.factory.annotation.Autowired")
      .orShould().beAnnotatedWith("jakarta.inject.Inject");

  @ArchTest
  static final ArchRule R9_in_tx_listeners_use_event_listener_and_mandatory_tx = methods()
      .that().areDeclaredInClassesThat().haveSimpleNameEndingWith("InTxListener")
      .and().arePublic()
      .should().beAnnotatedWith(EventListener.class)
      .andShould().notBeAnnotatedWith(ApplicationModuleListener.class)
      .andShould(new ArchCondition<JavaMethod>("be annotated with @Transactional(propagation = Propagation.MANDATORY)") {
        @Override
        public void check(JavaMethod method, ConditionEvents events) {
          boolean mandatory = method.isAnnotatedWith(Transactional.class)
              && method.getAnnotationOfType(Transactional.class).propagation() == Propagation.MANDATORY;
          if (!mandatory) {
            events.add(SimpleConditionEvent.violated(method,
                method.getFullName() + " must be annotated with @Transactional(propagation = Propagation.MANDATORY)"));
          }
        }
      });

  @Test
  void R3_verify_spring_modulith_bounded_contexts_and_emit_plantuml() {
    ApplicationModules modules = ApplicationModules.of(IncidentZeroApplication.class).verify();
    new Documenter(modules)
        .writeModulesAsPlantUml()
        .writeIndividualModulesAsPlantUml();
  }
}
