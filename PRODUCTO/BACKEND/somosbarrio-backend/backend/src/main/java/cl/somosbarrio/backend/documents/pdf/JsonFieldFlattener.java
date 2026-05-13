package cl.somosbarrio.backend.documents.pdf;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Aplana {@code field_values} JSON a mapa {@code ${clave}} → texto para placeholders en .docx.
 */
public final class JsonFieldFlattener {

    private JsonFieldFlattener() {
    }

    public static Map<String, String> flatten(String json, ObjectMapper mapper) {
        Map<String, String> out = new LinkedHashMap<>();
        if (json == null || json.isBlank()) {
            return out;
        }
        try {
            JsonNode root = mapper.readTree(json);
            flattenNode("", root, out);
        } catch (Exception ignored) {
            // devuelve mapa vacío; el merge seguirá sustituyendo solo IMG explícitos
        }
        return out;
    }

    private static void flattenNode(String prefix, JsonNode node, Map<String, String> out) {
        if (node == null || node.isNull()) {
            return;
        }
        if (node.isObject()) {
            Iterator<Map.Entry<String, JsonNode>> fields = node.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> e = fields.next();
                String key = prefix.isEmpty() ? e.getKey() : prefix + "." + e.getKey();
                flattenNode(key, e.getValue(), out);
            }
            return;
        }
        if (node.isArray()) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < node.size(); i++) {
                if (i > 0) {
                    sb.append(", ");
                }
                JsonNode item = node.get(i);
                sb.append(item.isValueNode() ? item.asText() : item.toString());
            }
            out.put(prefix, sb.toString());
            return;
        }
        out.put(prefix, node.asText(""));
    }
}
