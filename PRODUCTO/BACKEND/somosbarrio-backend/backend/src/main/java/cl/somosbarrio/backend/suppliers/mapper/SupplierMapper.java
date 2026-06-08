package cl.somosbarrio.backend.suppliers.mapper;

import cl.somosbarrio.backend.suppliers.dto.SupplierDto;
import cl.somosbarrio.backend.suppliers.entity.SupplierEntity;
import cl.somosbarrio.backend.suppliers.entity.SupplierStatus;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface SupplierMapper {

    @Mapping(target = "statusLabel", source = "status", qualifiedByName = "statusLabel")
    SupplierDto toDto(SupplierEntity entity);

    @Named("statusLabel")
    default String statusLabel(SupplierStatus status) {
        return switch (status) {
            case ACTIVO     -> "Activo";
            case INACTIVO   -> "Inactivo";
            case SUSPENDIDO -> "Suspendido";
        };
    }
}
