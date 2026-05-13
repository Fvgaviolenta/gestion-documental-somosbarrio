package cl.somosbarrio.backend.audit.dto;

import cl.somosbarrio.backend.audit.entity.AuditAction;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class AuditLogDto {
    private Long id;
    private UUID userId;
    private AuditAction action;
    private String entityType;
    private String entityId;
    private String beforeData;
    private String afterData;
    private String ipAddress;
    private String correlationId;
    private Instant createdAt;
}
