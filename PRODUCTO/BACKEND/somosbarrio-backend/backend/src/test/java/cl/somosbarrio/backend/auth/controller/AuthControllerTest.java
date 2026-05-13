package cl.somosbarrio.backend.auth.controller;

import cl.somosbarrio.backend.auth.dto.LoginRequest;
import cl.somosbarrio.backend.auth.dto.LoginResponse;
import cl.somosbarrio.backend.auth.dto.UserDto;
import cl.somosbarrio.backend.auth.service.AuthService;
import cl.somosbarrio.backend.exception.ErrorCode;
import cl.somosbarrio.backend.exception.GlobalExceptionHandler;
import cl.somosbarrio.backend.exception.custom.BusinessException;
import cl.somosbarrio.backend.security.JwtAuthenticationFilter;
import cl.somosbarrio.backend.security.JwtService;
import cl.somosbarrio.backend.security.SecurityConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, GlobalExceptionHandler.class})
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private AuthService authService;
    @MockitoBean private JwtService jwtService;

    private final UserDto userDto = UserDto.builder()
            .id(UUID.randomUUID())
            .email("admin@somosbarrio.cl")
            .firstName("Admin").lastName("Sistema")
            .roles(Set.of("ADMINISTRADOR")).isActive(true)
            .build();

    @Test
    @DisplayName("POST /auth/login retorna 200 con tokens")
    void login_validCredentials_returns200() throws Exception {
        LoginResponse response = LoginResponse.builder()
                .accessToken("access.token").refreshToken("refresh.token")
                .expiresInSec(900).user(userDto).build();

        when(authService.login(any())).thenReturn(response);

        LoginRequest request = new LoginRequest();
        request.setEmail("admin@somosbarrio.cl");
        request.setPassword("Admin123!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access.token"))
                .andExpect(jsonPath("$.expiresInSec").value(900));
    }

    @Test
    @DisplayName("POST /auth/login con credenciales inválidas retorna 401")
    void login_invalidCredentials_returns401() throws Exception {
        when(authService.login(any())).thenThrow(
                new BusinessException(ErrorCode.INVALID_CREDENTIALS, "Credenciales inválidas",
                        HttpStatus.UNAUTHORIZED));

        LoginRequest request = new LoginRequest();
        request.setEmail("wrong@example.com");
        request.setPassword("wrongpass");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(ErrorCode.INVALID_CREDENTIALS));
    }

    @Test
    @DisplayName("POST /auth/login sin email retorna 400")
    void login_missingEmail_returns400() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setPassword("Admin123!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(ErrorCode.VALIDATION_ERROR));
    }
}
