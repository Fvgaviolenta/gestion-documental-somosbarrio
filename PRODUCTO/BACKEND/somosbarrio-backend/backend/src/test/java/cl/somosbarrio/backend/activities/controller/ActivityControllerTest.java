package cl.somosbarrio.backend.activities.controller;

import cl.somosbarrio.backend.activities.dto.ActivityDto;
import cl.somosbarrio.backend.activities.dto.CreateActivityRequest;
import cl.somosbarrio.backend.activities.entity.ActivityStatus;
import cl.somosbarrio.backend.activities.service.ActivityService;
import cl.somosbarrio.backend.exception.ErrorCode;
import cl.somosbarrio.backend.exception.GlobalExceptionHandler;
import cl.somosbarrio.backend.exception.custom.ResourceNotFoundException;
import cl.somosbarrio.backend.security.JwtAuthenticationFilter;
import cl.somosbarrio.backend.security.JwtService;
import cl.somosbarrio.backend.security.SecurityConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ActivityController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, GlobalExceptionHandler.class})
class ActivityControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private ActivityService activityService;
    @MockitoBean private JwtService jwtService;

    private static final String TOKEN = "test-token";
    private static final String BEARER = "Bearer " + TOKEN;

    private final UUID actorId = UUID.randomUUID();
    private final UUID activityId = UUID.randomUUID();

    @BeforeEach
    void setUpJwt() {
        Claims claims = mock(Claims.class);
        when(claims.getSubject()).thenReturn(actorId.toString());
        when(claims.get("type", String.class)).thenReturn("access");
        when(claims.get("email", String.class)).thenReturn("admin@somosbarrio.cl");
        when(claims.get("roles", List.class)).thenReturn(List.of("ROLE_ADMINISTRADOR"));
        when(jwtService.validateToken(TOKEN)).thenReturn(claims);
    }

    // --- GET /api/v1/activities ---

    @Test
    @DisplayName("GET /activities sin autenticación retorna 401 (endpoint protegido)")
    void findAll_noAuth_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/activities"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /activities retorna 200 con JWT válido")
    void findAll_withAuth_returns200() throws Exception {
        when(activityService.findAll(any(), any(), any())).thenReturn(Page.empty());

        mockMvc.perform(get("/api/v1/activities").header("Authorization", BEARER))
                .andExpect(status().isOk());
    }

    // --- GET /api/v1/activities/{id} ---

    @Test
    @DisplayName("GET /activities/{id} retorna 200 cuando existe")
    void findById_existing_returns200() throws Exception {
        ActivityDto dto = ActivityDto.builder().id(activityId).title("Test").build();
        when(activityService.findById(activityId)).thenReturn(dto);

        mockMvc.perform(get("/api/v1/activities/" + activityId)
                        .header("Authorization", BEARER))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(activityId.toString()));
    }

    @Test
    @DisplayName("GET /activities/{id} retorna 404 cuando no existe")
    void findById_notFound_returns404() throws Exception {
        when(activityService.findById(any()))
                .thenThrow(new ResourceNotFoundException("Actividad", activityId));

        mockMvc.perform(get("/api/v1/activities/" + activityId)
                        .header("Authorization", BEARER))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(ErrorCode.NOT_FOUND));
    }

    // --- POST /api/v1/activities ---

    @Test
    @DisplayName("POST /activities retorna 201 con datos válidos y JWT de ADMIN")
    void create_validRequest_returns201() throws Exception {
        CreateActivityRequest request = buildRequest();
        ActivityDto dto = ActivityDto.builder()
                .id(activityId).title(request.getTitle())
                .status(ActivityStatus.PLANIFICADA).build();

        when(activityService.create(any(), any())).thenReturn(dto);

        mockMvc.perform(post("/api/v1/activities")
                        .header("Authorization", BEARER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PLANIFICADA"));
    }

    @Test
    @DisplayName("POST /activities sin autenticación retorna 401")
    void create_noAuth_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/activities")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildRequest())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /activities con body inválido retorna 400")
    void create_invalidBody_returns400() throws Exception {
        CreateActivityRequest invalid = new CreateActivityRequest();

        mockMvc.perform(post("/api/v1/activities")
                        .header("Authorization", BEARER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(ErrorCode.VALIDATION_ERROR));
    }

    // --- PATCH /api/v1/activities/{id}/status ---

    @Test
    @DisplayName("PATCH /activities/{id}/status retorna 200 con transición válida")
    void changeStatus_valid_returns200() throws Exception {
        ActivityDto dto = ActivityDto.builder().id(activityId).status(ActivityStatus.EN_CURSO).build();
        when(activityService.changeStatus(any(), any())).thenReturn(dto);

        mockMvc.perform(patch("/api/v1/activities/" + activityId + "/status")
                        .header("Authorization", BEARER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"EN_CURSO\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EN_CURSO"));
    }

    // --- DELETE /api/v1/activities/{id} ---

    @Test
    @DisplayName("DELETE /activities/{id} retorna 204 cuando existe")
    void delete_existing_returns204() throws Exception {
        mockMvc.perform(delete("/api/v1/activities/" + activityId)
                        .header("Authorization", BEARER))
                .andExpect(status().isNoContent());
    }

    private CreateActivityRequest buildRequest() {
        CreateActivityRequest req = new CreateActivityRequest();
        req.setTitle("Actividad de prueba");
        req.setTerritory("Viña Norte");
        req.setStartDate(LocalDate.now().plusDays(7));
        return req;
    }
}
