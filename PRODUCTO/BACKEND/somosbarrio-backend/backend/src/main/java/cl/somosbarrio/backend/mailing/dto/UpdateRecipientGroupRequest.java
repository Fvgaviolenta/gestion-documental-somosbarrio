package cl.somosbarrio.backend.mailing.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateRecipientGroupRequest {

    @Size(max = 120)
    private String name;

    private String description;

    @Size(min = 1)
    private List<@jakarta.validation.constraints.NotBlank String> emails;
}
