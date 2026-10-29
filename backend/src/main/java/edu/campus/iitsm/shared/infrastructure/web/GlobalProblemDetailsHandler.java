package edu.campus.iitsm.shared.infrastructure.web;

import edu.campus.iitsm.shared.domain.error.InvalidStateTransitionException;
import edu.campus.iitsm.shared.domain.error.ItsmException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.util.UUID;

@RestControllerAdvice
public class GlobalProblemDetailsHandler {
  private static final Logger log = LoggerFactory.getLogger(GlobalProblemDetailsHandler.class);
  private static final String BASE_URI = "https://incident-zero.campus.edu/errors/";

  @ExceptionHandler(ItsmException.class)
  public ResponseEntity<ProblemDetail> handleItsmException(ItsmException ex, HttpServletRequest request) {
    HttpStatus status = HttpStatus.resolve(ex.httpStatus());
    if (status == null) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, ex.getMessage());
    problem.setType(URI.create(BASE_URI + ex.code()));
    problem.setTitle(resolveTitle(ex.code()));
    problem.setInstance(URI.create(request.getRequestURI()));

    String traceId = UUID.randomUUID().toString().replace("-", "");
    problem.setProperty("code", ex.code());
    problem.setProperty("traceId", traceId);

    if (ex instanceof InvalidStateTransitionException ste) {
      problem.setProperty("incidentId", ste.incidentId() != null ? ste.incidentId().toString() : null);
      problem.setProperty("currentState", ste.currentState());
      problem.setProperty("attemptedCommand", ste.attemptedCommand());
    }

    log.warn("Handled {}: status={} code={} detail={}", ex.getClass().getSimpleName(), ex.httpStatus(), ex.code(), ex.getMessage());
    return ResponseEntity.status(status).body(problem);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed for request payload");
    problem.setType(URI.create(BASE_URI + "ITSM-4000"));
    problem.setTitle("Validation Failure");
    problem.setInstance(URI.create(request.getRequestURI()));
    problem.setProperty("code", "ITSM-4000");
    problem.setProperty("traceId", UUID.randomUUID().toString().replace("-", ""));

    var errors = ex.getBindingResult().getFieldErrors().stream()
        .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
        .toList();
    problem.setProperty("errors", errors);

    return ResponseEntity.badRequest().body(problem);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ProblemDetail> handleGeneralException(Exception ex, HttpServletRequest request) {
    log.error("Unhandled exception at " + request.getRequestURI(), ex);
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "An internal server error occurred");
    problem.setType(URI.create(BASE_URI + "ITSM-5000"));
    problem.setTitle("Internal Server Error");
    problem.setInstance(URI.create(request.getRequestURI()));
    problem.setProperty("code", "ITSM-5000");
    problem.setProperty("traceId", UUID.randomUUID().toString().replace("-", ""));
    return ResponseEntity.internalServerError().body(problem);
  }

  private String resolveTitle(String code) {
    return switch (code) {
      case "ITSM-4010" -> "Unauthorized Operation";
      case "ITSM-4011" -> "Invalid Credentials";
      case "ITSM-4030" -> "Forbidden Operation";
      case "ITSM-4040" -> "Incident Not Found";
      case "ITSM-4041" -> "Service Not Found";
      case "ITSM-4090" -> "Invalid Incident Lifecycle State Transition";
      case "ITSM-4091" -> "Duplicate Incident Detected";
      case "ITSM-4092" -> "Optimistic Lock Concurrency Conflict";
      case "ITSM-4220" -> "Unprocessable Incident Payload";
      case "ITSM-4290" -> "Rate Limit Exceeded";
      case "ITSM-5031" -> "External Gateway Failure";
      case "ITSM-5040" -> "Audit Chain Cryptographic Tampering Detected";
      default -> "ITSM Problem Details";
    };
  }
}
