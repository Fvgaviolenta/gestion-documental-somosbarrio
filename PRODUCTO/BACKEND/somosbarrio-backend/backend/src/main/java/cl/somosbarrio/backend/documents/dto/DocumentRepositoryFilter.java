package cl.somosbarrio.backend.documents.dto;

import cl.somosbarrio.backend.documents.entity.DocumentStatus;
import cl.somosbarrio.backend.documents.entity.DocumentType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
public class DocumentRepositoryFilter {
    private String q;
    private DocumentType type;
    private DocumentStatus status;
    private LocalDate from;
    private LocalDate to;
    private UUID authorId;
    private UUID activityId;
    private String code;
    private Boolean belongsToMe;
    private UUID actorId;
}
