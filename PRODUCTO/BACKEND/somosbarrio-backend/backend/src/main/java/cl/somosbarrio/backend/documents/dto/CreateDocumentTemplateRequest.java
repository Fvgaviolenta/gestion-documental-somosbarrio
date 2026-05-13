package cl.somosbarrio.backend.documents.dto;

import cl.somosbarrio.backend.documents.entity.DocumentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateDocumentTemplateRequest {

    @NotBlank
    @Size(max = 40)
    private String code;

    @NotBlank
    @Size(max = 160)
    private String name;

    @NotNull
    private DocumentType documentType;

    private String description;

    private String fieldsSchema;

    /** Opcional: ruta relativa al directorio de matrices Word ({@code TEMPLATE_ROOT}), p. ej. {@code actas/ACTA_v1.docx}. */
    @jakarta.validation.constraints.Size(max = 500)
    private String templateFilePath;
}
