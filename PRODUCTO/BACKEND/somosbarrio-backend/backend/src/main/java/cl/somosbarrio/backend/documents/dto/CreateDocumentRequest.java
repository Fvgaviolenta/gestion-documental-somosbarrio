package cl.somosbarrio.backend.documents.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateDocumentRequest {

    @NotNull
    private UUID templateId;

    private UUID activityId;

    @NotBlank
    @Size(min = 3, max = 200)
    private String title;

    private String fieldValues;
}
