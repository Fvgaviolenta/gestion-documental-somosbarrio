package cl.somosbarrio.backend.mailing.dto;

import cl.somosbarrio.backend.mailing.entity.EmailStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class SendDocumentResponse {
    private UUID emailLogId;
    private UUID documentId;
    private String toAddresses;
    private EmailStatus status;
    private Instant sentAt;
}
