package cl.somosbarrio.backend.mailing.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class RecipientGroupDto {
    private UUID id;
    private String name;
    private String description;
    private List<String> emails;
    private Instant createdAt;
}
