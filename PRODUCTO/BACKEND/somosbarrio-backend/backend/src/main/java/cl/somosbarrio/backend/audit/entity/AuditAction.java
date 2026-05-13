package cl.somosbarrio.backend.audit.entity;

/**
 * Acciones auditables del sistema.
 * Deben coincidir con el CHECK constraint definido en V7__audit_logs.sql.
 */
public enum AuditAction {
    CREATE,
    UPDATE,
    DELETE,
    APPROVE,
    REJECT,
    LOGIN,
    LOGIN_FAILED,
    EMAIL_SENT,
    PDF_GENERATED,
    REPORT_GENERATED
}
