package cl.somosbarrio.backend.minutes.mapper;

import cl.somosbarrio.backend.minutes.dto.MinuteAttachmentDto;
import cl.somosbarrio.backend.minutes.dto.MinuteDto;
import cl.somosbarrio.backend.minutes.entity.MinuteAttachmentEntity;
import cl.somosbarrio.backend.minutes.entity.MinuteEntity;
import cl.somosbarrio.backend.minutes.entity.MinuteStatus;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface MinuteMapper {

    @Mapping(target = "activityId",    source = "activity.id")
    @Mapping(target = "activityTitle", source = "activity.title")
    @Mapping(target = "authorId",      source = "author.id")
    @Mapping(target = "authorName",    expression = "java(entity.getAuthor().getFirstName() + ' ' + entity.getAuthor().getLastName())")
    @Mapping(target = "statusLabel",   source = "status", qualifiedByName = "statusLabel")
    @Mapping(target = "attachments",   ignore = true)
    MinuteDto toDto(MinuteEntity entity);

    @Mapping(target = "id",           source = "id")
    @Mapping(target = "originalName", source = "originalName")
    @Mapping(target = "mimeType",     source = "mimeType")
    @Mapping(target = "sizeBytes",    source = "sizeBytes")
    @Mapping(target = "uploadedAt",   source = "uploadedAt")
    MinuteAttachmentDto toAttachmentDto(MinuteAttachmentEntity entity);

    @Named("statusLabel")
    default String statusLabel(MinuteStatus status) {
        return switch (status) {
            case BORRADOR    -> "Borrador";
            case EN_REVISION -> "En revisión";
            case APROBADA    -> "Aprobada";
        };
    }
}
