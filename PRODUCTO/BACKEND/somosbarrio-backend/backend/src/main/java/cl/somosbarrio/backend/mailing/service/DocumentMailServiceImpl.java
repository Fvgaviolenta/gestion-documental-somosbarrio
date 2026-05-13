package cl.somosbarrio.backend.mailing.service;

import cl.somosbarrio.backend.audit.entity.AuditAction;
import cl.somosbarrio.backend.audit.service.AuditLogService;
import cl.somosbarrio.backend.auth.entity.UserEntity;
import cl.somosbarrio.backend.auth.repository.UserRepository;
import cl.somosbarrio.backend.common.storage.FileStorageService;
import cl.somosbarrio.backend.documents.entity.DocumentEntity;
import cl.somosbarrio.backend.documents.entity.DocumentStatus;
import cl.somosbarrio.backend.documents.repository.DocumentRepository;
import cl.somosbarrio.backend.documents.pdf.GeneratedDocumentFilenames;
import cl.somosbarrio.backend.exception.ErrorCode;
import cl.somosbarrio.backend.exception.custom.BusinessException;
import cl.somosbarrio.backend.exception.custom.ResourceNotFoundException;
import cl.somosbarrio.backend.mailing.dto.EmailLogDto;
import cl.somosbarrio.backend.mailing.dto.RecipientGroupDto;
import cl.somosbarrio.backend.mailing.dto.SendDocumentRequest;
import cl.somosbarrio.backend.mailing.dto.SendDocumentResponse;
import cl.somosbarrio.backend.mailing.entity.EmailLogEntity;
import cl.somosbarrio.backend.mailing.entity.EmailStatus;
import cl.somosbarrio.backend.mailing.entity.RecipientGroupEntity;
import cl.somosbarrio.backend.mailing.repository.EmailLogRepository;
import cl.somosbarrio.backend.mailing.repository.RecipientGroupRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentMailServiceImpl implements DocumentMailService {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$", Pattern.CASE_INSENSITIVE);
    private static final TypeReference<List<String>> LIST_OF_STRING = new TypeReference<>() {};

    private final RecipientGroupRepository recipientGroupRepository;
    private final EmailLogRepository emailLogRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper;
    private final AuditLogService auditLogService;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    @Value("${app.mail.from-name:Programa Somos Barrio}")
    private String mailFromName;

    @Override
    @Transactional(readOnly = true)
    public List<RecipientGroupDto> listActiveRecipientGroups() {
        return recipientGroupRepository.findByIsActiveTrueOrderByNameAsc()
                .stream()
                .map(this::toRecipientGroupDto)
                .toList();
    }

    @Override
    @Transactional
    public SendDocumentResponse sendDocument(UUID documentId, UUID actorId, SendDocumentRequest request) {
        DocumentEntity document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Documento", documentId));

        if (document.getStatus() != DocumentStatus.APROBADA) {
            throw new BusinessException(ErrorCode.CONFLICT_STATE,
                    "Solo se pueden enviar documentos en estado APROBADA", HttpStatus.CONFLICT);
        }
        if (document.getGeneratedPdfPath() == null || document.getGeneratedPdfPath().isBlank()) {
            throw new BusinessException(ErrorCode.CONFLICT_STATE,
                    "El documento no tiene un PDF generado para enviar", HttpStatus.CONFLICT);
        }

        UserEntity actor = userRepository.findById(actorId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", actorId));

        RecipientGroupEntity group = null;
        Set<String> recipients = new LinkedHashSet<>();
        if (request.getRecipientGroupId() != null) {
            group = recipientGroupRepository.findById(request.getRecipientGroupId())
                    .orElseThrow(() -> new ResourceNotFoundException("Grupo destinatario", request.getRecipientGroupId()));
            if (!group.isActive()) {
                throw new BusinessException(ErrorCode.CONFLICT_STATE,
                        "El grupo de destinatarios está inactivo", HttpStatus.CONFLICT);
            }
            recipients.addAll(parseEmails(group.getEmails()));
        }
        if (request.getAdditionalEmails() != null) {
            recipients.addAll(request.getAdditionalEmails());
        }
        if (recipients.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_NO_RECIPIENTS,
                    "Debes indicar al menos un destinatario", HttpStatus.BAD_REQUEST);
        }

        List<String> normalizedRecipients = recipients.stream()
                .map(this::normalizeAndValidateEmail)
                .distinct()
                .toList();

        Path pdfPath = fileStorageService.resolve(document.getGeneratedPdfPath());
        if (!Files.exists(pdfPath)) {
            throw new BusinessException(ErrorCode.FILE_STORAGE_ERROR,
                    "No se encontró el PDF del documento en almacenamiento", HttpStatus.CONFLICT);
        }

        String subject = defaultIfBlank(request.getSubject(), defaultSubject(document));
        String body = defaultIfBlank(request.getBody(), defaultBody(document));
        Instant now = Instant.now();

        EmailLogEntity logEntry = new EmailLogEntity();
        logEntry.setDocument(document);
        logEntry.setRecipientGroup(group);
        logEntry.setToAddresses(String.join(", ", normalizedRecipients));
        logEntry.setSubject(subject);
        logEntry.setSentBy(actor);
        logEntry.setSentAt(now);

        try {
            var mimeMessage = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(mailFrom, mailFromName);
            helper.setTo(normalizedRecipients.toArray(String[]::new));
            helper.setSubject(subject);
            helper.setText(body);
            helper.addAttachment(GeneratedDocumentFilenames.pdfFileName(document), pdfPath.toFile());
            mailSender.send(mimeMessage);

            logEntry.setStatus(EmailStatus.ENVIADO);
            emailLogRepository.save(logEntry);
            auditLogService.log(actorId, AuditAction.EMAIL_SENT, "Document", documentId.toString(),
                    null, java.util.Map.of("recipients", logEntry.getToAddresses()));
        } catch (MailException ex) {
            log.warn("Fallo envio de correo documento {}: {}", documentId, ex.getMessage());
            logEntry.setStatus(EmailStatus.FALLIDO);
            logEntry.setErrorMessage(truncate(ex.getMessage(), 1000));
            emailLogRepository.save(logEntry);
            throw new BusinessException(ErrorCode.EMAIL_DELIVERY_FAILED,
                    "No se pudo enviar el correo: " + ex.getMessage(), HttpStatus.BAD_GATEWAY);
        } catch (Exception ex) {
            log.warn("Fallo envio de correo documento {}: {}", documentId, ex.getMessage());
            logEntry.setStatus(EmailStatus.FALLIDO);
            logEntry.setErrorMessage(truncate(ex.getMessage(), 1000));
            emailLogRepository.save(logEntry);
            throw new BusinessException(ErrorCode.EMAIL_DELIVERY_FAILED,
                    "No se pudo enviar el correo: " + ex.getMessage(), HttpStatus.BAD_GATEWAY);
        }

        return SendDocumentResponse.builder()
                .emailLogId(logEntry.getId())
                .documentId(document.getId())
                .toAddresses(logEntry.getToAddresses())
                .status(logEntry.getStatus())
                .sentAt(logEntry.getSentAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmailLogDto> findByDocumentId(UUID documentId) {
        return emailLogRepository.findByDocumentIdOrderBySentAtDesc(documentId)
                .stream()
                .map(this::toEmailLogDto)
                .toList();
    }

    private RecipientGroupDto toRecipientGroupDto(RecipientGroupEntity group) {
        return RecipientGroupDto.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .emails(parseEmails(group.getEmails()))
                .createdAt(group.getCreatedAt())
                .build();
    }

    private EmailLogDto toEmailLogDto(EmailLogEntity logEntry) {
        String sentByName = logEntry.getSentBy().getFirstName() + " " + logEntry.getSentBy().getLastName();
        return EmailLogDto.builder()
                .id(logEntry.getId())
                .documentId(logEntry.getDocument() != null ? logEntry.getDocument().getId() : null)
                .recipientGroupId(logEntry.getRecipientGroup() != null ? logEntry.getRecipientGroup().getId() : null)
                .recipientGroupName(logEntry.getRecipientGroup() != null ? logEntry.getRecipientGroup().getName() : null)
                .toAddresses(logEntry.getToAddresses())
                .subject(logEntry.getSubject())
                .status(logEntry.getStatus())
                .errorMessage(logEntry.getErrorMessage())
                .sentBy(logEntry.getSentBy().getId())
                .sentByName(sentByName)
                .sentAt(logEntry.getSentAt())
                .build();
    }

    private List<String> parseEmails(String emailsJson) {
        if (emailsJson == null || emailsJson.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(emailsJson, LIST_OF_STRING);
        } catch (Exception ex) {
            log.warn("No se pudo parsear emails de recipient_group: {}", ex.getMessage());
            return new ArrayList<>();
        }
    }

    private String normalizeAndValidateEmail(String email) {
        if (email == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Email destinatario inválido", HttpStatus.BAD_REQUEST);
        }
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        if (!EMAIL_PATTERN.matcher(normalized).matches()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Email destinatario inválido: " + email, HttpStatus.BAD_REQUEST);
        }
        return normalized;
    }

    private String defaultSubject(DocumentEntity document) {
        return "[Somos Barrio] " + document.getCode() + " - " + document.getTitle();
    }

    private String defaultBody(DocumentEntity document) {
        String approvedAt = document.getApprovedAt() != null
                ? DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                .withZone(ZoneId.of("America/Santiago"))
                .format(document.getApprovedAt())
                : "N/D";
        return "Estimado/a,\n\n"
                + "Adjuntamos el documento institucional aprobado del programa Somos Barrio.\n\n"
                + "Codigo: " + document.getCode() + "\n"
                + "Titulo: " + document.getTitle() + "\n"
                + "Fecha de aprobacion: " + approvedAt + "\n\n"
                + "Saludos cordiales,\n"
                + "Programa Somos Barrio";
    }

    private String defaultIfBlank(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value;
    }

    private String truncate(String value, int maxLen) {
        if (value == null || value.length() <= maxLen) {
            return value;
        }
        return value.substring(0, maxLen);
    }
}
