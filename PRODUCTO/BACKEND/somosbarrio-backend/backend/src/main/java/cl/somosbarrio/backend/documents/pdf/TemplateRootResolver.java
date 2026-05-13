package cl.somosbarrio.backend.documents.pdf;

import cl.somosbarrio.backend.exception.ErrorCode;
import cl.somosbarrio.backend.exception.custom.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Resuelve rutas bajo {@code TEMPLATE_ROOT}, bloqueando traversal ({@code ..}).
 */
@Component
public class TemplateRootResolver {

    private final Path templateRoot;

    public TemplateRootResolver(@Value("${app.template.root:./templates}") String templateRoot) {
        this.templateRoot = Paths.get(templateRoot).toAbsolutePath().normalize();
    }

    public Path resolveRelative(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "template_file_path vacío", HttpStatus.BAD_REQUEST);
        }
        String normalized = relativePath.replace('\\', '/').trim();
        if (normalized.startsWith("/") || normalized.contains("..")) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "template_file_path inválido", HttpStatus.BAD_REQUEST);
        }
        Path resolved = templateRoot.resolve(normalized).normalize();
        if (!resolved.startsWith(templateRoot)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "template_file_path fuera de TEMPLATE_ROOT", HttpStatus.BAD_REQUEST);
        }
        return resolved;
    }
}
