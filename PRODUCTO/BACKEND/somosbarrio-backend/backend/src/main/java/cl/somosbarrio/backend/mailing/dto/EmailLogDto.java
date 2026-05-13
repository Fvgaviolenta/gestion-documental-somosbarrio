package cl.somosbarrio.backend.mailing.dto;

import cl.somosbarrio.backend.mailing.entity.EmailStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class EmailLogDto {
    private UUID id;
    private UUID documentId;
    private UUID recipientGroupId;
    private String recipientGroupName;
    private String toAddresses;
    private String subject;
    private EmailStatus status;
    private String errorMessage;
    private UUID sentBy;
    private String sentByName;
    private Instant sentAt;
}
