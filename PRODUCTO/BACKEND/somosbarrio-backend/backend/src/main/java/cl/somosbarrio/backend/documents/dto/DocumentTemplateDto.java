package cl.somosbarrio.backend.documents.dto;

import cl.somosbarrio.backend.documents.entity.DocumentType;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class DocumentTemplateDto {
    private UUID id;
    private String code;
    private String name;
    private DocumentType documentType;
    private String description;
    private String fieldsSchema;
    /** Ruta relativa a {@code TEMPLATE_ROOT} del .docx institucional. */
    private String templateFilePath;
    private boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;
}
