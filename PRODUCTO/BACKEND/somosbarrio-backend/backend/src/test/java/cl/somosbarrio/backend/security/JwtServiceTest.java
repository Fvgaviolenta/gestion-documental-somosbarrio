package cl.somosbarrio.backend.security;

import cl.somosbarrio.backend.auth.entity.RoleEntity;
import cl.somosbarrio.backend.auth.entity.UserEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

class JwtServiceTest {

    private static final String SECRET = "test-secret-key-must-be-at-least-32-bytes-long!";

    private JwtService jwtService;
    private UserEntity user;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, 15L, 7L);

        RoleEntity adminRole = new RoleEntity();
        adminRole.setName("ADMINISTRADOR");

        user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setEmail("admin@somosbarrio.cl");
        user.setRoles(Set.of(adminRole));
    }

    @Test
    @DisplayName("generateAccessToken produce un token con claims correctos")
    void generateAccessToken_validUser_correctClaims() {
        String token = jwtService.generateAccessToken(user);

        Claims claims = jwtService.validateToken(token);

        assertThat(claims.getSubject()).isEqualTo(user.getId().toString());
        assertThat(claims.get("email", String.class)).isEqualTo(user.getEmail());
        assertThat(claims.get("type", String.class)).isEqualTo("access");
        @SuppressWarnings("unchecked")
        var roles = (java.util.List<String>) claims.get("roles");
        assertThat(roles).contains("ROLE_ADMINISTRADOR");
    }

    @Test
    @DisplayName("generateRefreshToken produce un token con type=refresh")
    void generateRefreshToken_validParams_correctClaims() {
        String jti = UUID.randomUUID().toString();
        String token = jwtService.generateRefreshToken(user.getId().toString(), jti);

        Claims claims = jwtService.validateToken(token);

        assertThat(claims.getSubject()).isEqualTo(user.getId().toString());
        assertThat(claims.getId()).isEqualTo(jti);
        assertThat(claims.get("type", String.class)).isEqualTo("refresh");
    }

    @Test
    @DisplayName("validateToken con token de firma alterada lanza JwtException")
    void validateToken_alteredSignature_throwsJwtException() {
        String token = jwtService.generateAccessToken(user);
        String tampered = token.substring(0, token.lastIndexOf('.') + 1) + "invalidsignature";

        assertThatThrownBy(() -> jwtService.validateToken(tampered))
                .isInstanceOf(JwtException.class);
    }

    @Test
    @DisplayName("validateToken con token firmado con clave distinta lanza JwtException")
    void validateToken_differentKey_throwsJwtException() {
        JwtService otherService = new JwtService("other-secret-key-must-be-at-least-32-bytes!!", 15L, 7L);
        String token = otherService.generateAccessToken(user);

        assertThatThrownBy(() -> jwtService.validateToken(token))
                .isInstanceOf(JwtException.class);
    }

    @Test
    @DisplayName("isTokenExpired retorna false para token recién generado")
    void isTokenExpired_freshToken_returnsFalse() {
        String token = jwtService.generateAccessToken(user);
        Claims claims = jwtService.validateToken(token);

        assertThat(jwtService.isTokenExpired(claims)).isFalse();
    }

    @Test
    @DisplayName("hashToken produce el mismo hash para la misma entrada")
    void hashToken_sameInput_sameHash() {
        String raw = "some.raw.token";

        assertThat(JwtService.hashToken(raw)).isEqualTo(JwtService.hashToken(raw));
    }

    @Test
    @DisplayName("hashToken produce hashes distintos para entradas distintas")
    void hashToken_differentInputs_differentHashes() {
        assertThat(JwtService.hashToken("token-a")).isNotEqualTo(JwtService.hashToken("token-b"));
    }

    @Test
    @DisplayName("Constructor lanza IllegalArgumentException si secret tiene menos de 32 bytes")
    void constructor_shortSecret_throwsIllegalArgument() {
        assertThatThrownBy(() -> new JwtService("short", 15L, 7L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("32 bytes");
    }
}
