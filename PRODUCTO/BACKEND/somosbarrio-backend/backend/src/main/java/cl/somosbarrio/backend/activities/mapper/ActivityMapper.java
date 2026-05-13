package cl.somosbarrio.backend.activities.mapper;

import cl.somosbarrio.backend.activities.dto.ActivityDto;
import cl.somosbarrio.backend.activities.entity.ActivityEntity;
import cl.somosbarrio.backend.activities.entity.ActivityStatus;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface ActivityMapper {

    @Mapping(target = "createdById",   source = "createdBy.id")
    @Mapping(target = "createdByName", expression = "java(entity.getCreatedBy().getFirstName() + ' ' + entity.getCreatedBy().getLastName())")
    @Mapping(target = "statusLabel",   source = "status", qualifiedByName = "statusLabel")
    ActivityDto toDto(ActivityEntity entity);

    @Named("statusLabel")
    default String statusLabel(ActivityStatus status) {
        return switch (status) {
            case PLANIFICADA -> "Planificada";
            case EN_CURSO    -> "En curso";
            case FINALIZADA  -> "Finalizada";
            case CANCELADA   -> "Cancelada";
        };
    }
}
