package cl.somosbarrio.backend.activities.dto;

import cl.somosbarrio.backend.activities.entity.ActivityStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
public class ActivityDto {

    private UUID id;
    private String title;
    private String description;
    private String territory;
    private LocalDate startDate;
    private LocalDate endDate;
    private ActivityStatus status;
    private String statusLabel;
    private UUID createdById;
    private String createdByName;
    private Instant createdAt;
    private Instant updatedAt;
}
