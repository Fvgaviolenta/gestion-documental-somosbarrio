package cl.somosbarrio.backend.auth.service;

import cl.somosbarrio.backend.auth.entity.RefreshTokenEntity;
import cl.somosbarrio.backend.auth.entity.UserEntity;
import cl.somosbarrio.backend.auth.repository.RefreshTokenRepository;
import cl.somosbarrio.backend.exception.custom.BusinessException;
import cl.somosbarrio.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private JwtService jwtService;
    @InjectMocks private RefreshTokenService refreshTokenService;

    private UserEntity user;
    private final String rawToken = "raw.refresh.token";
    private final String tokenHash = JwtService.hashToken(rawToken);

    @BeforeEach
    void setUp() {
        user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setEmail("test@somosbarrio.cl");
    }

    @Test
    @DisplayName("validateAndRotate rota token válido y retorna usuario")
    void validateAndRotate_validToken_returnsUser() {
        RefreshTokenEntity stored = new RefreshTokenEntity();
        stored.setUser(user);
        stored.setTokenHash(tokenHash);
        stored.setRevoked(false);
        stored.setExpiresAt(Instant.now().plusSeconds(3600));

        when(refreshTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(stored));
        when(refreshTokenRepository.save(stored)).thenReturn(stored);

        UserEntity result = refreshTokenService.validateAndRotate(rawToken);

        assertThat(result.getEmail()).isEqualTo(user.getEmail());
        assertThat(stored.isRevoked()).isTrue();
        verify(refreshTokenRepository).save(stored);
    }

    @Test
    @DisplayName("validateAndRotate lanza excepción para token revocado")
    void validateAndRotate_revokedToken_throwsException() {
        RefreshTokenEntity stored = new RefreshTokenEntity();
        stored.setRevoked(true);
        stored.setExpiresAt(Instant.now().plusSeconds(3600));

        when(refreshTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(stored));

        assertThatThrownBy(() -> refreshTokenService.validateAndRotate(rawToken))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("revocado");
    }

    @Test
    @DisplayName("validateAndRotate lanza excepción para token expirado")
    void validateAndRotate_expiredToken_throwsException() {
        RefreshTokenEntity stored = new RefreshTokenEntity();
        stored.setRevoked(false);
        stored.setExpiresAt(Instant.now().minusSeconds(1));

        when(refreshTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(stored));

        assertThatThrownBy(() -> refreshTokenService.validateAndRotate(rawToken))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("expirado");
    }

    @Test
    @DisplayName("validateAndRotate lanza excepción cuando token no existe")
    void validateAndRotate_unknownToken_throwsException() {
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> refreshTokenService.validateAndRotate(rawToken))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("inválido");
    }
}
