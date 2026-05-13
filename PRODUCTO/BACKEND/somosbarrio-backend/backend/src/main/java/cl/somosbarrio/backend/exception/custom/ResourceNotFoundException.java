package cl.somosbarrio.backend.exception.custom;

import cl.somosbarrio.backend.exception.ErrorCode;
import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(String resourceName, Object id) {
        super(ErrorCode.NOT_FOUND,
              resourceName + " con id '" + id + "' no encontrado",
              HttpStatus.NOT_FOUND);
    }
}
