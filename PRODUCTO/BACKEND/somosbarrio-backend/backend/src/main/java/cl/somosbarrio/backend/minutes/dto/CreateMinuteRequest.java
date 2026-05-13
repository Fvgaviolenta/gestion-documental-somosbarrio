package cl.somosbarrio.backend.minutes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateMinuteRequest {

    @NotNull
    private UUID activityId;

    @NotBlank
    @Size(max = 200)
    private String title;

    private String content;
}
