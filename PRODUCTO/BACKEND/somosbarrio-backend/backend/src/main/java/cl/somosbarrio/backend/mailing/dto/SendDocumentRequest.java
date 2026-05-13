package cl.somosbarrio.backend.mailing.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class SendDocumentRequest {
    private UUID recipientGroupId;
    private List<String> additionalEmails;
    @Size(max = 200)
    private String subject;
    @Size(max = 10000)
    private String body;
}
