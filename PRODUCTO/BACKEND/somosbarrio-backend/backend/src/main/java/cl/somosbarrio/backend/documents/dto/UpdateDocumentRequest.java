package cl.somosbarrio.backend.documents.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateDocumentRequest {

    @NotBlank
    @Size(min = 3, max = 200)
    private String title;

    private String fieldValues;
}
