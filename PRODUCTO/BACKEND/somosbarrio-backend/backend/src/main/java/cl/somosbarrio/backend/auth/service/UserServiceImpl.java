package cl.somosbarrio.backend.auth.service;

import cl.somosbarrio.backend.auth.dto.CreateUserRequest;
import cl.somosbarrio.backend.auth.dto.UpdateUserRequest;
import cl.somosbarrio.backend.auth.dto.UserDto;
import cl.somosbarrio.backend.auth.entity.RoleEntity;
import cl.somosbarrio.backend.auth.entity.UserEntity;
import cl.somosbarrio.backend.auth.mapper.UserMapper;
import cl.somosbarrio.backend.auth.repository.RoleRepository;
import cl.somosbarrio.backend.auth.repository.UserRepository;
import cl.somosbarrio.backend.exception.ErrorCode;
import cl.somosbarrio.backend.exception.custom.BusinessException;
import cl.somosbarrio.backend.exception.custom.ConflictException;
import cl.somosbarrio.backend.exception.custom.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public Page<UserDto> findAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toDto);
    }

    @Override
    @Transactional
    public UserDto create(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException(ErrorCode.CONFLICT_DUPLICATE,
                    "Ya existe un usuario con el email: " + request.getEmail());
        }

        UserEntity user = new UserEntity();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRoles(resolveRoles(request.getRoles()));

        return userMapper.toDto(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserDto update(UUID id, UpdateUserRequest request) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            user.setRoles(resolveRoles(request.getRoles()));
        }

        if (request.getIsActive() != null) {
            user.setActive(request.getIsActive());
        }

        return userMapper.toDto(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deactivate(UUID id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));
        user.setActive(false);
        userRepository.save(user);
    }

    private Set<RoleEntity> resolveRoles(Set<String> roleNames) {
        Set<RoleEntity> roles = new HashSet<>();
        for (String name : roleNames) {
            roles.add(roleRepository.findByName(name)
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                            "Rol no encontrado: " + name, HttpStatus.BAD_REQUEST)));
        }
        return roles;
    }
}
