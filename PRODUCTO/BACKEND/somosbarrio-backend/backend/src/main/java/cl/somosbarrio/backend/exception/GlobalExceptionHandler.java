package cl.somosbarrio.backend.exception;

import cl.somosbarrio.backend.exception.custom.BusinessException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiError> handleBusiness(BusinessException ex, HttpServletRequest req) {
        return ResponseEntity.status(ex.getStatus()).body(build(ex.getErrorCode(), ex.getMessage(), req));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex,
                                                      HttpServletRequest req) {
        Map<String, Object> details = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            details.put(fe.getField(), fe.getDefaultMessage());
        }
        ApiError error = ApiError.builder()
                .code(ErrorCode.VALIDATION_ERROR)
                .message("Error de validación en los datos enviados")
                .details(details)
                .timestamp(Instant.now())
                .path(req.getRequestURI())
                .build();
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex,
                                                       HttpServletRequest req) {
        Map<String, Object> details = Map.of(
                "parameter", ex.getName(),
                "expectedType", ex.getRequiredType() == null ? "?" : ex.getRequiredType().getSimpleName(),
                "rejectedValue", String.valueOf(ex.getValue())
        );
        ApiError error = ApiError.builder()
                .code(ErrorCode.VALIDATION_ERROR)
                .message("Parametro con tipo invalido")
                .details(details)
                .timestamp(Instant.now())
                .path(req.getRequestURI())
                .build();
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex,
                                                           HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(build(ErrorCode.METHOD_NOT_ALLOWED, ex.getMessage(), req));
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiError> handleNoHandler(NoHandlerFoundException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(build(ErrorCode.NOT_FOUND, "Endpoint no encontrado", req));
    }

    /**
     * Spring MVC 6+: recurso estatico inexistente (ej. {@code /favicon.ico}).
     * Para favicon respondemos 204 silenciosamente; para el resto, 404 limpio.
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<?> handleNoResourceFound(NoResourceFoundException ex, HttpServletRequest req) {
        String uri = req.getRequestURI();
        if (uri != null && uri.endsWith("/favicon.ico")) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(build(ErrorCode.NOT_FOUND, "Recurso no encontrado", req));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(build(ErrorCode.ACCESS_DENIED, "Acceso denegado", req));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuth(AuthenticationException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(build(ErrorCode.INVALID_CREDENTIALS, ex.getMessage(), req));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrity(DataIntegrityViolationException ex,
                                                        HttpServletRequest req) {
        log.warn("Violacion de integridad de datos: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(build(ErrorCode.CONFLICT_DUPLICATE, "Conflicto de integridad de datos", req));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> handleMaxUpload(MaxUploadSizeExceededException ex,
                                                    HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(build(ErrorCode.FILE_TOO_LARGE, "El archivo supera el tamano maximo permitido", req));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex, HttpServletRequest req) {
        log.error("Unhandled exception at {}: {}", req.getRequestURI(), ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(build(ErrorCode.INTERNAL_ERROR, "Error interno del servidor", req));
    }

    private ApiError build(String code, String message, HttpServletRequest req) {
        return ApiError.builder()
                .code(code)
                .message(message)
                .timestamp(Instant.now())
                .path(req.getRequestURI())
                .build();
    }
}
