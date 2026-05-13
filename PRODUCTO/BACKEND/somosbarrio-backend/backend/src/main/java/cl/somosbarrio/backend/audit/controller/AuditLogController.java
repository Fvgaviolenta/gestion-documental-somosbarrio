package cl.somosbarrio.backend.audit.controller;

import cl.somosbarrio.backend.audit.dto.AuditLogDto;
import cl.somosbarrio.backend.audit.entity.AuditAction;
import cl.somosbarrio.backend.audit.service.AuditLogService;
import cl.somosbarrio.backend.common.pagination.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "Historial de eventos del sistema (solo ADMINISTRADOR)")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Listar entradas de auditoría con filtros opcionales")
    public ResponseEntity<PagedResponse<AuditLogDto>> findAll(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String entityId,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) AuditAction action,
            Pageable pageable) {

        return ResponseEntity.ok(
                new PagedResponse<>(auditLogService.findAll(entityType, entityId, userId, action, pageable))
        );
    }
}
