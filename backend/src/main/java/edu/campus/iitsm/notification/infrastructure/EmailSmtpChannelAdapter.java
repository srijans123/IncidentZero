package edu.campus.iitsm.notification.infrastructure;

import edu.campus.iitsm.shared.domain.NotificationChannel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class EmailSmtpChannelAdapter implements NotificationChannel {
  private static final Logger log = LoggerFactory.getLogger(EmailSmtpChannelAdapter.class);

  public record EmailRecord(UUID recipientId, UUID incidentId, String template, String payloadJson, String idempotencyKey) {}
  private final List<EmailRecord> sentEmails = new CopyOnWriteArrayList<>();
  private final Optional<JavaMailSender> mailSender;

  public EmailSmtpChannelAdapter(Optional<JavaMailSender> mailSender) {
    this.mailSender = mailSender;
  }

  @Override
  public String channelName() {
    return "EMAIL_SMTP";
  }

  @Override
  public void send(UUID recipientId, UUID incidentId, String template, String payloadJson, String idempotencyKey) {
    EmailRecord record = new EmailRecord(recipientId, incidentId, template, payloadJson, idempotencyKey);
    sentEmails.add(record);
    log.info("[EMAIL_SMTP] Dispatching email to user={} for incident={}: template={}", recipientId, incidentId, template);

    mailSender.ifPresent(sender -> {
      try {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipientId + "@bits.campus");
        message.setSubject("[Incident-Zero] " + template);
        message.setText("Incident " + incidentId + "\n" + payloadJson);
        sender.send(message);
      } catch (Exception e) {
        log.warn("[EMAIL_SMTP] Could not send live email: {}", e.getMessage());
      }
    });
  }

  public List<EmailRecord> getSentEmails() {
    return sentEmails;
  }
}
