package cl.somosbarrio.backend.documents.pdf;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ImageFieldValuesEnricherTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void assignsUnusedImageToEmptyUuidFieldFromSchema() {
        UUID imageId = UUID.fromString("c0000000-0000-0000-0000-000000000001");
        Map<String, String> vars = new LinkedHashMap<>();
        vars.put("numero_acta", "001");

        String schema = """
                {"fields":[{"key":"foto_mesa_uuid","label":"Foto","type":"text"}]}
                """;

        ImageFieldValuesEnricher.enrich(vars, Map.of(imageId, "/tmp/x.jpg"), schema, objectMapper);

        assertThat(vars.get("foto_mesa_uuid")).isEqualTo(imageId.toString());
    }

    @Test
    void doesNotOverwriteExistingUuidReference() {
        UUID existing = UUID.fromString("a0000000-0000-0000-0000-000000000099");
        UUID newImage = UUID.fromString("b0000000-0000-0000-0000-000000000099");
        Map<String, String> vars = new LinkedHashMap<>();
        vars.put("foto_mesa_uuid", existing.toString());

        ImageFieldValuesEnricher.enrich(vars, Map.of(newImage, "/tmp/y.jpg"), null, objectMapper);

        assertThat(vars.get("foto_mesa_uuid")).isEqualTo(existing.toString());
    }
}
