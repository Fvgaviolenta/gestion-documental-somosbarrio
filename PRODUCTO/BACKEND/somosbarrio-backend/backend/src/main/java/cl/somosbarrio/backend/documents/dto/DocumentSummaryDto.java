package cl.somosbarrio.backend.documents.dto;

import cl.somosbarrio.backend.documents.entity.DocumentStatus;
import cl.somosbarrio.backend.documents.entity.DocumentType;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class DocumentSummaryDto {
    private UUID id;
    private String code;
    private String title;
    private DocumentType documentType;
    private DocumentStatus status;
    private UUID activityId;
    private String activityTitle;
    private UUID createdById;
    private String createdByName;
    private Instant createdAt;
    private Instant approvedAt;
}
