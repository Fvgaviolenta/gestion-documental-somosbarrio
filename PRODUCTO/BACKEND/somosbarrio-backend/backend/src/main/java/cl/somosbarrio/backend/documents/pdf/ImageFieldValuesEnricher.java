package cl.somosbarrio.backend.documents.pdf;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Asigna UUIDs de adjuntos imagen a claves {@code *_uuid} vacías en {@code field_values},
 * para que placeholders {@code ${IMG:foto_mesa_uuid}} resuelvan tras subir archivos sin rellenar el campo a mano.
 */
public final class ImageFieldValuesEnricher {

    private ImageFieldValuesEnricher() {
    }

    public static void enrich(Map<String, String> vars, Map<UUID, ?> imageAttachments, String fieldsSchema,
                              ObjectMapper objectMapper) {
        if (imageAttachments == null || imageAttachments.isEmpty()) {
            return;
        }
        List<UUID> unused = new ArrayList<>(unusedAttachmentIds(vars, imageAttachments.keySet()));
        if (unused.isEmpty()) {
            return;
        }

        List<String> targetKeys = new ArrayList<>();
        for (String key : parseImageUuidKeysFromSchema(fieldsSchema, objectMapper)) {
            if (!targetKeys.contains(key)) {
                targetKeys.add(key);
            }
        }
        for (String key : vars.keySet()) {
            if (isImageUuidKey(key) && !targetKeys.contains(key)) {
                targetKeys.add(key);
            }
        }

        for (String key : targetKeys) {
            if (unused.isEmpty()) {
                break;
            }
            String current = vars.get(key);
            if (current != null && !current.isBlank()) {
                continue;
            }
            vars.put(key, unused.remove(0).toString());
        }
    }

    static boolean isImageUuidKey(String key) {
        return key != null && key.endsWith("_uuid");
    }

    private static List<UUID> unusedAttachmentIds(Map<String, String> vars, Set<UUID> attachmentIds) {
        Set<UUID> referenced = new HashSet<>();
        for (String value : vars.values()) {
            if (value == null || value.isBlank()) {
                continue;
            }
            try {
                referenced.add(UUID.fromString(value.trim()));
            } catch (IllegalArgumentException ignored) {
                // no es UUID de adjunto
            }
        }
        return attachmentIds.stream()
                .filter(id -> !referenced.contains(id))
                .sorted(Comparator.comparing(UUID::toString))
                .toList();
    }

    private static List<String> parseImageUuidKeysFromSchema(String fieldsSchema, ObjectMapper objectMapper) {
        List<String> keys = new ArrayList<>();
        if (fieldsSchema == null || fieldsSchema.isBlank()) {
            return keys;
        }
        try {
            JsonNode root = objectMapper.readTree(fieldsSchema);
            JsonNode fields = root.get("fields");
            if (fields == null || !fields.isArray()) {
                return keys;
            }
            for (JsonNode field : fields) {
                JsonNode keyNode = field.get("key");
                if (keyNode != null && keyNode.isTextual() && isImageUuidKey(keyNode.asText())) {
                    keys.add(keyNode.asText());
                }
            }
        } catch (Exception ignored) {
            return keys;
        }
        return keys;
    }
}
