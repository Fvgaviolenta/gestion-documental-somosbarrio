package cl.somosbarrio.backend.auth.service;

import cl.somosbarrio.backend.auth.entity.RefreshTokenEntity;
import cl.somosbarrio.backend.auth.entity.UserEntity;
import cl.somosbarrio.backend.auth.repository.RefreshTokenRepository;
import cl.somosbarrio.backend.exception.ErrorCode;
import cl.somosbarrio.backend.exception.custom.BusinessException;
import cl.somosbarrio.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    @Transactional
    public String createRefreshToken(UserEntity user) {
        String jti = UUID.randomUUID().toString();
        String rawToken = jwtService.generateRefreshToken(user.getId().toString(), jti);
        String tokenHash = JwtService.hashToken(rawToken);

        RefreshTokenEntity entity = new RefreshTokenEntity();
        entity.setUser(user);
        entity.setJti(UUID.fromString(jti));
        entity.setTokenHash(tokenHash);
        entity.setIssuedAt(Instant.now());
        entity.setExpiresAt(Instant.now().plusMillis(jwtService.getRefreshTtlMillis()));
        refreshTokenRepository.save(entity);

        return rawToken;
    }

    @Transactional
    public UserEntity validateAndRotate(String rawToken) {
        String hash = JwtService.hashToken(rawToken);

        RefreshTokenEntity stored = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.TOKEN_INVALID, "Refresh token inválido", HttpStatus.UNAUTHORIZED));

        if (stored.isRevoked()) {
            throw new BusinessException(ErrorCode.TOKEN_REVOKED, "Refresh token revocado", HttpStatus.UNAUTHORIZED);
        }
        if (stored.getExpiresAt().isBefore(Instant.now())) {
            throw new BusinessException(ErrorCode.TOKEN_EXPIRED, "Refresh token expirado", HttpStatus.UNAUTHORIZED);
        }

        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        return stored.getUser();
    }

    @Transactional
    public void revokeAllByUser(UUID userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
    }
}
