package cl.somosbarrio.backend.audit.service;

import cl.somosbarrio.backend.audit.dto.AuditLogDto;
import cl.somosbarrio.backend.audit.entity.AuditAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface AuditLogService {

    /**
     * Registra un evento de auditoría de forma no bloqueante.
     * Los errores internos se loggean como WARN y nunca se propagan al caller.
     *
     * @param actorId    UUID del usuario que ejecutó la acción (null para eventos de sistema)
     * @param action     Tipo de acción auditada
     * @param entityType Nombre lógico de la entidad (ej. "Document", "Activity")
     * @param entityId   ID de la entidad afectada como String
     * @param beforeData Estado anterior de los datos relevantes (puede ser null)
     * @param afterData  Estado posterior de los datos relevantes (puede ser null)
     */
    void log(UUID actorId, AuditAction action, String entityType, String entityId,
             Object beforeData, Object afterData);

    /**
     * Devuelve el historial de auditoría con filtros opcionales, paginado y
     * ordenado por fecha descendente.
     */
    Page<AuditLogDto> findAll(String entityType, String entityId,
                              UUID userId, AuditAction action, Pageable pageable);
}
