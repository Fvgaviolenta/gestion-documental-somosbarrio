package cl.somosbarrio.backend.auth.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {

    private String accessToken;
    private String refreshToken;
    private long expiresInSec;
    private UserDto user;
}
