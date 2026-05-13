package cl.somosbarrio.backend.exception;

/**
 * Catalogo central de codigos de error de la API.
 * Convencion: {@code DOMINIO_DETALLE} en mayusculas.
 */
public final class ErrorCode {

    private ErrorCode() {}

    // Auth
    public static final String INVALID_CREDENTIALS   = "INVALID_CREDENTIALS";
    public static final String ACCOUNT_LOCKED         = "ACCOUNT_LOCKED";
    public static final String ACCOUNT_INACTIVE       = "ACCOUNT_INACTIVE";
    public static final String TOKEN_EXPIRED          = "TOKEN_EXPIRED";
    public static final String TOKEN_INVALID          = "TOKEN_INVALID";
    public static final String TOKEN_REVOKED          = "TOKEN_REVOKED";
    public static final String CURRENT_PASSWORD_INVALID = "CURRENT_PASSWORD_INVALID";

    // Resources
    public static final String NOT_FOUND              = "NOT_FOUND";
    public static final String CONFLICT_DUPLICATE     = "CONFLICT_DUPLICATE";
    public static final String CONFLICT_STATE         = "CONFLICT_STATE";
    public static final String CONFLICT_HAS_RELATED   = "CONFLICT_HAS_RELATED";

    // Validation
    public static final String VALIDATION_ERROR       = "VALIDATION_ERROR";
    public static final String VALIDATION_PASSWORD_POLICY = "VALIDATION_PASSWORD_POLICY";

    // Access
    public static final String ACCESS_DENIED          = "ACCESS_DENIED";
    public static final String UNAUTHORIZED           = "UNAUTHORIZED";

    // File
    public static final String FILE_TOO_LARGE         = "FILE_TOO_LARGE";
    public static final String FILE_MIME_INVALID      = "FILE_MIME_INVALID";
    public static final String FILE_STORAGE_ERROR     = "FILE_STORAGE_ERROR";

    // Mailing (M6)
    public static final String EMAIL_DELIVERY_FAILED  = "EMAIL_DELIVERY_FAILED";
    public static final String VALIDATION_NO_RECIPIENTS = "VALIDATION_NO_RECIPIENTS";

    // Generic
    public static final String INTERNAL_ERROR         = "INTERNAL_ERROR";
    public static final String METHOD_NOT_ALLOWED     = "METHOD_NOT_ALLOWED";
}
