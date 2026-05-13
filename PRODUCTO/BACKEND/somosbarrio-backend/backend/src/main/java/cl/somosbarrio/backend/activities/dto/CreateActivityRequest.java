package cl.somosbarrio.backend.activities.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateActivityRequest {

    @NotBlank @Size(max = 200)
    private String title;

    private String description;

    @NotBlank @Size(max = 100)
    private String territory;

    @NotNull
    private LocalDate startDate;

    private LocalDate endDate;
}
