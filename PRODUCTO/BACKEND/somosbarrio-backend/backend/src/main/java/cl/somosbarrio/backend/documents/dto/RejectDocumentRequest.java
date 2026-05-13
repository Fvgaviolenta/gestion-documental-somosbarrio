package cl.somosbarrio.backend.documents.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RejectDocumentRequest {

    @NotBlank
    @Size(min = 10, max = 1000)
    private String rejectionReason;
}
