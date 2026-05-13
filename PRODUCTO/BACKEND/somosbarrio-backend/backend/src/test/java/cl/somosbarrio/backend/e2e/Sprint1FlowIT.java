package cl.somosbarrio.backend.e2e;

import cl.somosbarrio.backend.TestcontainersConfiguration;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Flujo end-to-end del Sprint 1 con Testcontainers.
 *
 * Cubre el modelo simplificado de roles (ADMINISTRADOR / COLABORADOR):
 *   - login admin y colaborador,
 *   - colaborador crea actividad (con permiso),
 *   - admin cambia estado de la actividad,
 *   - colaborador crea acta y la envia a EN_REVISION,
 *   - admin aprueba el acta,
 *   - intentar editar acta APROBADA -> 409.
 *
 * Requiere Docker corriendo. Flyway aplica V9 + V10 con admin y colaboradores.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
class Sprint1FlowIT {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @Test
    @DisplayName("Sprint 1 happy path: COLABORADOR crea, ADMINISTRADOR aprueba")
    void sprint1HappyPath() throws Exception {

        String adminToken = login("admin@somosbarrio.cl", "Admin123!");
        String colabToken = login("colaborador1@somosbarrio.cl", "Admin123!");

        // 1. Colaborador crea actividad
        String activityBody = """
                {"title":"Test E2E Activity","territory":"Vina Norte","startDate":"2026-05-01"}
                """;
        MvcResult activityResult = mockMvc.perform(post("/api/v1/activities")
                        .header("Authorization", "Bearer " + colabToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(activityBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PLANIFICADA"))
                .andReturn();

        String activityId = objectMapper.readTree(activityResult.getResponse().getContentAsString())
                .get("id").asText();

        // 2. Admin cambia estado a EN_CURSO
        mockMvc.perform(patch("/api/v1/activities/" + activityId + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"EN_CURSO\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EN_CURSO"));

        // 3. Colaborador crea acta asociada
        String minuteBody = String.format(
                "{\"activityId\":\"%s\",\"title\":\"Acta E2E Test\",\"content\":\"Contenido\"}", activityId);
        MvcResult minuteResult = mockMvc.perform(post("/api/v1/minutes")
                        .header("Authorization", "Bearer " + colabToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(minuteBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("BORRADOR"))
                .andReturn();

        String minuteId = objectMapper.readTree(minuteResult.getResponse().getContentAsString())
                .get("id").asText();

        // 4. Colaborador (autor) envia acta a EN_REVISION
        mockMvc.perform(patch("/api/v1/minutes/" + minuteId + "/status")
                        .header("Authorization", "Bearer " + colabToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"EN_REVISION\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EN_REVISION"));

        // 5. Colaborador NO puede aprobar el acta (regla de negocio)
        mockMvc.perform(patch("/api/v1/minutes/" + minuteId + "/status")
                        .header("Authorization", "Bearer " + colabToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"APROBADA\"}"))
                .andExpect(status().isForbidden());

        // 6. Admin aprueba el acta
        mockMvc.perform(patch("/api/v1/minutes/" + minuteId + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"APROBADA\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APROBADA"));

        // 7. Editar acta APROBADA -> 409
        mockMvc.perform(put("/api/v1/minutes/" + minuteId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Titulo modificado\",\"content\":\"nuevo\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT_STATE"));
    }

    private String login(String email, String password) throws Exception {
        String body = String.format("{\"email\":\"%s\",\"password\":\"%s\"}", email, password);
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString())
                .get("accessToken").asText();
    }
}
