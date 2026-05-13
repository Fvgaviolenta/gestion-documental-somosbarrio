package cl.somosbarrio.backend.e2e;

import cl.somosbarrio.backend.TestcontainersConfiguration;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * E2E plantillas Word V16: vista previa .docx, flujo aprobación y PDF bajo documents/generated/{tipo}/.
 * Usa plantillas mínimas generadas en disco temporal (sin depender de rutas del desarrollador).
 * Requiere Docker (Testcontainers) como {@link Sprint1FlowIT}.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
class DocumentWordTemplatesFlowIT {

    private static final Path UPLOAD_ROOT;
    private static final Path TEMPLATE_ROOT;

    static {
        try {
            Path base = Files.createTempDirectory("sb-doc-word-it");
            UPLOAD_ROOT = Files.createDirectories(base.resolve("uploads"));
            TEMPLATE_ROOT = Files.createDirectories(base.resolve("templates"));
            writeMinimalDocx(TEMPLATE_ROOT.resolve("ACTA_MESA_COMUNITARIA_TEMPLATE.docx"),
                    "Acta ${numero_acta} — ${proyecto}");
            writeMinimalDocx(TEMPLATE_ROOT.resolve("INFORME_TEMPLATE.docx"),
                    "Informe ${numero_informe}");
        } catch (Exception e) {
            throw new ExceptionInInitializerError(e);
        }
    }

    @DynamicPropertySource
    static void registerPaths(DynamicPropertyRegistry registry) {
        registry.add("app.upload.root",
                () -> UPLOAD_ROOT.toAbsolutePath().toString().replace('\\', '/'));
        registry.add("app.template.root",
                () -> TEMPLATE_ROOT.toAbsolutePath().toString().replace('\\', '/'));
    }

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("ACTA_MESA_COMUNITARIA: preview-docx, revisión, PDF en ACTA/")
    void actaMesa_previewSubmitApprovePdf() throws Exception {
        String adminToken = login("admin@somosbarrio.cl", "Admin123!");
        String colabToken = login("colaborador1@somosbarrio.cl", "Admin123!");

        String createBody = """
                {"templateId":"b0000000-0000-0000-0000-000000000011","title":"Acta IT mesa",\
                "fieldValues":"{\\"numero_acta\\":\\"1/2026\\",\\"proyecto\\":\\"Parque\\"}"}
                """;

        MvcResult created = mockMvc.perform(post("/api/v1/documents")
                        .header("Authorization", "Bearer " + colabToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("BORRADOR"))
                .andReturn();

        String docId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(post("/api/v1/documents/" + docId + "/preview-docx")
                        .header("Authorization", "Bearer " + colabToken))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/api/v1/documents/" + docId + "/submit-review")
                        .header("Authorization", "Bearer " + colabToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EN_REVISION"));

        mockMvc.perform(patch("/api/v1/documents/" + docId + "/approve")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APROBADA"))
                .andExpect(jsonPath("$.generatedPdfPath", containsString("/ACTA/")));

        mockMvc.perform(get("/api/v1/documents/" + docId + "/pdf")
                        .header("Authorization", "Bearer " + colabToken))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(result.getResponse().getContentAsByteArray().length).isPositive());
    }

    @Test
    @DisplayName("INFORME_TIPO: preview y PDF en INFORME/")
    void informeTipo_previewApprovePdf() throws Exception {
        String adminToken = login("admin@somosbarrio.cl", "Admin123!");
        String colabToken = login("colaborador1@somosbarrio.cl", "Admin123!");

        String createBody = """
                {"templateId":"b0000000-0000-0000-0000-000000000012","title":"Informe IT",\
                "fieldValues":"{\\"numero_informe\\":\\"2/2026\\"}"}
                """;

        MvcResult created = mockMvc.perform(post("/api/v1/documents")
                        .header("Authorization", "Bearer " + colabToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isCreated())
                .andReturn();

        String docId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(post("/api/v1/documents/" + docId + "/preview-docx")
                        .header("Authorization", "Bearer " + colabToken))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/api/v1/documents/" + docId + "/submit-review")
                        .header("Authorization", "Bearer " + colabToken))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/api/v1/documents/" + docId + "/approve")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.generatedPdfPath", containsString("/INFORME/")));

        mockMvc.perform(get("/api/v1/documents/" + docId + "/pdf")
                        .header("Authorization", "Bearer " + colabToken))
                .andExpect(status().isOk());
    }

    private static void writeMinimalDocx(Path path, String paragraphText) throws Exception {
        try (XWPFDocument doc = new XWPFDocument()) {
            doc.createParagraph().createRun().setText(paragraphText);
            try (OutputStream out = Files.newOutputStream(path)) {
                doc.write(out);
            }
        }
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
