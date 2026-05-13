package cl.somosbarrio.backend.auth.service;

import cl.somosbarrio.backend.auth.dto.*;

import java.util.UUID;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    LoginResponse refresh(RefreshRequest request);

    void logout(String rawRefreshToken);

    UserDto me(UUID userId);

    void changePassword(UUID userId, ChangePasswordRequest request);
}
