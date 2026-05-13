package cl.somosbarrio.backend.documents.dto;

import cl.somosbarrio.backend.documents.entity.DocumentStatus;
import cl.somosbarrio.backend.documents.entity.DocumentType;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class DocumentDto {
    private UUID id;
    private String code;
    private UUID templateId;
    private String templateName;
    private DocumentType documentType;
    private UUID activityId;
    private String activityTitle;
    private String title;
    private String fieldValues;
    private String generatedPdfPath;
    private DocumentStatus status;
    private String statusLabel;
    private UUID createdById;
    private String createdByName;
    private UUID approvedById;
    private String approvedByName;
    private Instant approvedAt;
    private String rejectionReason;
    private Instant createdAt;
    private Instant updatedAt;
    private List<DocumentAttachmentDto> attachments;
}
