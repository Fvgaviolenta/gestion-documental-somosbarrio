package cl.somosbarrio.backend.auth.service;

import cl.somosbarrio.backend.auth.dto.CreateUserRequest;
import cl.somosbarrio.backend.auth.dto.UpdateUserRequest;
import cl.somosbarrio.backend.auth.dto.UserDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserService {

    Page<UserDto> findAll(Pageable pageable);

    UserDto create(CreateUserRequest request);

    UserDto update(UUID id, UpdateUserRequest request);

    void deactivate(UUID id);
}
