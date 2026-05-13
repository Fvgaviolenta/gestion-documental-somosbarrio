package cl.somosbarrio.backend.minutes.dto;

import cl.somosbarrio.backend.minutes.entity.MinuteStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class MinuteDto {

    private UUID id;
    private UUID activityId;
    private String activityTitle;
    private String title;
    private String content;
    private MinuteStatus status;
    private String statusLabel;
    private UUID authorId;
    private String authorName;
    private Instant createdAt;
    private Instant updatedAt;
    private List<MinuteAttachmentDto> attachments;
}
