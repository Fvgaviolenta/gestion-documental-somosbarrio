package cl.somosbarrio.backend.minutes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateMinuteRequest {

    @NotBlank
    @Size(max = 200)
    private String title;

    private String content;
}
