package cl.somosbarrio.backend.auth.mapper;

import cl.somosbarrio.backend.auth.dto.UserDto;
import cl.somosbarrio.backend.auth.entity.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "roles", source = "roles", qualifiedByName = "rolesToStrings")
    @Mapping(target = "isActive", source = "active")
    UserDto toDto(UserEntity entity);

    @Named("rolesToStrings")
    default Set<String> rolesToStrings(Set<cl.somosbarrio.backend.auth.entity.RoleEntity> roles) {
        if (roles == null) return Set.of();
        return roles.stream().map(cl.somosbarrio.backend.auth.entity.RoleEntity::getName).collect(Collectors.toSet());
    }
}
