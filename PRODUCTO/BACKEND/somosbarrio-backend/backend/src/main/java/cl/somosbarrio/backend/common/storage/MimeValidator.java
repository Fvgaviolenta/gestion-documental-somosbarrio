package cl.somosbarrio.backend.common.storage;

import cl.somosbarrio.backend.exception.ErrorCode;
import cl.somosbarrio.backend.exception.custom.BusinessException;
import org.apache.tika.Tika;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.Set;

@Component
public class MimeValidator {

    private static final Set<String> ALLOWED = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    private final Tika tika = new Tika();

    public String detectAndValidate(InputStream data, String originalName) {
        try {
            String detected = tika.detect(data, originalName);
            if (!ALLOWED.contains(detected)) {
                throw new BusinessException(ErrorCode.FILE_MIME_INVALID,
                        "Tipo de archivo no permitido: " + detected, HttpStatus.UNPROCESSABLE_ENTITY);
            }
            return detected;
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.FILE_MIME_INVALID,
                    "No se pudo determinar el tipo del archivo", HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }
}
