package cl.somosbarrio.backend.activities.controller;

import cl.somosbarrio.backend.activities.dto.ActivityDto;
import cl.somosbarrio.backend.activities.dto.ChangeActivityStatusRequest;
import cl.somosbarrio.backend.activities.dto.CreateActivityRequest;
import cl.somosbarrio.backend.activities.entity.ActivityStatus;
import cl.somosbarrio.backend.activities.service.ActivityService;
import cl.somosbarrio.backend.common.pagination.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/activities")
@RequiredArgsConstructor
@Tag(name = "Activities", description = "Gestión de actividades")
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping
    @Operation(summary = "Listar actividades (paginado, filtros opcionales)")
    public ResponseEntity<PagedResponse<ActivityDto>> findAll(
            @RequestParam(required = false) ActivityStatus status,
            @RequestParam(required = false) String territory,
            Pageable pageable) {
        return ResponseEntity.ok(new PagedResponse<>(activityService.findAll(status, territory, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener actividad")
    public ResponseEntity<ActivityDto> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(activityService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','COLABORADOR')")
    @Operation(summary = "Crear actividad")
    public ResponseEntity<ActivityDto> create(@Valid @RequestBody CreateActivityRequest request,
                                               Authentication auth) {
        UUID actorId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.status(HttpStatus.CREATED).body(activityService.create(request, actorId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','COLABORADOR')")
    @Operation(summary = "Actualizar actividad")
    public ResponseEntity<ActivityDto> update(@PathVariable UUID id,
                                               @Valid @RequestBody CreateActivityRequest request,
                                               Authentication auth) {
        UUID actorId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(activityService.update(id, request, actorId));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Cambiar estado de la actividad (ADMINISTRADOR)")
    public ResponseEntity<ActivityDto> changeStatus(@PathVariable UUID id,
                                                     @Valid @RequestBody ChangeActivityStatusRequest request) {
        return ResponseEntity.ok(activityService.changeStatus(id, request.getStatus()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Eliminar actividad (soft-delete, solo si no tiene actas)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        activityService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
