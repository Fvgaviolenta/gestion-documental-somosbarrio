package cl.somosbarrio.backend.auth.service;

import cl.somosbarrio.backend.audit.service.AuditLogService;
import cl.somosbarrio.backend.auth.dto.LoginRequest;
import cl.somosbarrio.backend.auth.dto.LoginResponse;
import cl.somosbarrio.backend.auth.entity.UserEntity;
import cl.somosbarrio.backend.auth.mapper.UserMapper;
import cl.somosbarrio.backend.auth.repository.UserRepository;
import cl.somosbarrio.backend.exception.custom.BusinessException;
import cl.somosbarrio.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.HashSet;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenService refreshTokenService;
    @Mock private JwtService jwtService;
    @Mock private UserMapper userMapper;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuditLogService auditLogService;
    @InjectMocks private AuthServiceImpl authService;

    private UserEntity activeUser;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        activeUser = new UserEntity();
        activeUser.setId(UUID.randomUUID());
        activeUser.setEmail("admin@somosbarrio.cl");
        activeUser.setPasswordHash("$2a$10$hashed");
        activeUser.setActive(true);
        activeUser.setRoles(new HashSet<>());

        loginRequest = new LoginRequest();
        loginRequest.setEmail("admin@somosbarrio.cl");
        loginRequest.setPassword("Admin123!");
    }

    @Test
    @DisplayName("Login exitoso retorna tokens y datos del usuario")
    void login_success_returnsTokens() {
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), activeUser.getPasswordHash())).thenReturn(true);
        when(jwtService.generateAccessToken(activeUser)).thenReturn("access.token");
        when(refreshTokenService.createRefreshToken(activeUser)).thenReturn("refresh.token");
        when(userMapper.toDto(activeUser)).thenReturn(null);

        LoginResponse response = authService.login(loginRequest);

        assertThat(response.getAccessToken()).isEqualTo("access.token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh.token");
        assertThat(response.getExpiresInSec()).isEqualTo(900);
    }

    @Test
    @DisplayName("Login con credenciales inválidas lanza 401")
    void login_wrongPassword_throws401() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);
        when(userRepository.save(any())).thenReturn(activeUser);

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BusinessException.class)
                .satisfies(e -> assertThat(((BusinessException) e).getStatus())
                        .isEqualTo(HttpStatus.UNAUTHORIZED));
    }

    @Test
    @DisplayName("Login con email no registrado lanza 401")
    void login_unknownEmail_throws401() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BusinessException.class)
                .satisfies(e -> assertThat(((BusinessException) e).getStatus())
                        .isEqualTo(HttpStatus.UNAUTHORIZED));
    }

    @Test
    @DisplayName("Login con usuario inactivo lanza 403")
    void login_inactiveUser_throws403() {
        activeUser.setActive(false);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(activeUser));

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BusinessException.class)
                .satisfies(e -> assertThat(((BusinessException) e).getStatus())
                        .isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    @DisplayName("Cuenta bloqueada lanza 403")
    void login_lockedAccount_throws403() {
        activeUser.setLockedUntil(Instant.now().plusSeconds(300));
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(activeUser));

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BusinessException.class)
                .satisfies(e -> assertThat(((BusinessException) e).getStatus())
                        .isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    @DisplayName("Después de 5 intentos fallidos la cuenta queda bloqueada")
    void login_fiveFailedAttempts_accountLocked() {
        activeUser.setFailedLoginAttempts(4);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);
        when(userRepository.save(any())).thenReturn(activeUser);

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BusinessException.class);

        assertThat(activeUser.getLockedUntil()).isNotNull();
        assertThat(activeUser.getLockedUntil()).isAfter(Instant.now());
    }
}
