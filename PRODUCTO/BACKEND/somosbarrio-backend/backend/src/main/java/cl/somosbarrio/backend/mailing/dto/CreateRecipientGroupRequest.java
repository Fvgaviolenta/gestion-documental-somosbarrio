package cl.somosbarrio.backend.mailing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateRecipientGroupRequest {

    @NotBlank
    @Size(max = 120)
    private String name;

    private String description;

    @NotNull
    @Size(min = 1)
    private List<@NotBlank String> emails;
}
