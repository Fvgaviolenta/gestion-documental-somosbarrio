package cl.somosbarrio.backend.minutes.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class MinuteAttachmentDto {

    private UUID id;
    private String originalName;
    private String mimeType;
    private long sizeBytes;
    private Instant uploadedAt;
}
