package cl.somosbarrio.backend.auth.service;

import cl.somosbarrio.backend.audit.entity.AuditAction;
import cl.somosbarrio.backend.audit.service.AuditLogService;
import cl.somosbarrio.backend.auth.dto.*;
import cl.somosbarrio.backend.auth.entity.UserEntity;
import cl.somosbarrio.backend.auth.mapper.UserMapper;
import cl.somosbarrio.backend.auth.repository.UserRepository;
import cl.somosbarrio.backend.exception.ErrorCode;
import cl.somosbarrio.backend.exception.custom.BusinessException;
import cl.somosbarrio.backend.exception.custom.ResourceNotFoundException;
import cl.somosbarrio.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCK_DURATION_MINUTES = 15;

    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.INVALID_CREDENTIALS, "Credenciales inválidas", HttpStatus.UNAUTHORIZED));

        if (!user.isActive()) {
            throw new BusinessException(ErrorCode.ACCOUNT_INACTIVE, "Cuenta inactiva", HttpStatus.FORBIDDEN);
        }

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(Instant.now())) {
            throw new BusinessException(ErrorCode.ACCOUNT_LOCKED,
                    "Cuenta bloqueada temporalmente. Intente nuevamente más tarde", HttpStatus.FORBIDDEN);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            if (user.getFailedLoginAttempts() >= MAX_FAILED_ATTEMPTS) {
                user.setLockedUntil(Instant.now().plusSeconds(LOCK_DURATION_MINUTES * 60));
                log.warn("Account locked for user {} after {} failed attempts", user.getEmail(), MAX_FAILED_ATTEMPTS);
            }
            userRepository.save(user);
            auditLogService.log(user.getId(), AuditAction.LOGIN_FAILED, "User", user.getId().toString(), null, null);
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS, "Credenciales inválidas", HttpStatus.UNAUTHORIZED);
        }

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = refreshTokenService.createRefreshToken(user);

        auditLogService.log(user.getId(), AuditAction.LOGIN, "User", user.getId().toString(), null, null);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresInSec(900)
                .user(userMapper.toDto(user))
                .build();
    }

    @Override
    @Transactional
    public LoginResponse refresh(RefreshRequest request) {
        UserEntity user = refreshTokenService.validateAndRotate(request.getRefreshToken());
        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = refreshTokenService.createRefreshToken(user);

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .expiresInSec(900)
                .user(userMapper.toDto(user))
                .build();
    }

    @Override
    @Transactional
    public void logout(String rawRefreshToken) {
        try {
            refreshTokenService.validateAndRotate(rawRefreshToken);
        } catch (BusinessException ignored) {
            // Already revoked or not found — logout is idempotent
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto me(UUID userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", userId));
        return userMapper.toDto(user);
    }

    @Override
    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS,
                    "Contraseña actual incorrecta", HttpStatus.BAD_REQUEST);
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        refreshTokenService.revokeAllByUser(userId);
    }
}
