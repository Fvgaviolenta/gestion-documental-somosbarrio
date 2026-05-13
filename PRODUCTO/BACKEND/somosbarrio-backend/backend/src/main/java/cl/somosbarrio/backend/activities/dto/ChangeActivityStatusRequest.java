package cl.somosbarrio.backend.activities.dto;

import cl.somosbarrio.backend.activities.entity.ActivityStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangeActivityStatusRequest {

    @NotNull
    private ActivityStatus status;
}
