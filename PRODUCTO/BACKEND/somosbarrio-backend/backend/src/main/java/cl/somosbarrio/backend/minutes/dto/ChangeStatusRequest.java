package cl.somosbarrio.backend.minutes.dto;

import cl.somosbarrio.backend.minutes.entity.MinuteStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangeStatusRequest {

    @NotNull
    private MinuteStatus status;
}
