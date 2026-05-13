package cl.somosbarrio.backend.exception.custom;

import cl.somosbarrio.backend.exception.ErrorCode;
import org.springframework.http.HttpStatus;

public class ConflictException extends BusinessException {

    public ConflictException(String errorCode, String message) {
        super(errorCode, message, HttpStatus.CONFLICT);
    }

    public static ConflictException duplicateTitle(String resource) {
        return new ConflictException(ErrorCode.CONFLICT_DUPLICATE,
                "Ya existe un " + resource + " con ese título");
    }

    public static ConflictException invalidStateTransition(String from, String to) {
        return new ConflictException(ErrorCode.CONFLICT_STATE,
                "Transición de estado inválida: " + from + " → " + to);
    }

    public static ConflictException hasRelated(String resource) {
        return new ConflictException(ErrorCode.CONFLICT_HAS_RELATED,
                "No se puede eliminar: el " + resource + " tiene registros relacionados");
    }
}
