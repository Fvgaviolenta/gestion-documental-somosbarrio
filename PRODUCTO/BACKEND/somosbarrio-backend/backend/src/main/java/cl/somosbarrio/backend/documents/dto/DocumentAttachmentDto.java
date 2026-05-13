package cl.somosbarrio.backend.documents.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class DocumentAttachmentDto {
    private UUID id;
    private String originalFilename;
    private String contentType;
    private long sizeBytes;
    private Instant createdAt;
}
