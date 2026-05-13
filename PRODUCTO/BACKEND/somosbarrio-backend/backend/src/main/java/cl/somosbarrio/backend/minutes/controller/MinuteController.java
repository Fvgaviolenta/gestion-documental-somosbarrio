package cl.somosbarrio.backend.minutes.controller;

import cl.somosbarrio.backend.common.pagination.PagedResponse;
import cl.somosbarrio.backend.minutes.dto.*;
import cl.somosbarrio.backend.minutes.entity.MinuteStatus;
import cl.somosbarrio.backend.minutes.service.MinuteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/minutes")
@RequiredArgsConstructor
@Tag(name = "Minutes", description = "Gestión de actas")
public class MinuteController {

    private final MinuteService minuteService;

    @GetMapping
    @Operation(summary = "Listar actas (paginado, filtros opcionales)")
    public ResponseEntity<PagedResponse<MinuteDto>> findAll(
            @RequestParam(required = false) UUID activityId,
            @RequestParam(required = false) MinuteStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(new PagedResponse<>(minuteService.findAll(activityId, status, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener acta con adjuntos")
    public ResponseEntity<MinuteDto> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(minuteService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Crear acta (estado BORRADOR)")
    public ResponseEntity<MinuteDto> create(@Valid @RequestBody CreateMinuteRequest request,
                                             Authentication auth) {
        UUID actorId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.status(HttpStatus.CREATED).body(minuteService.create(request, actorId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar acta (solo BORRADOR)")
    public ResponseEntity<MinuteDto> update(@PathVariable UUID id,
                                             @Valid @RequestBody UpdateMinuteRequest request,
                                             Authentication auth) {
        UUID actorId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(minuteService.update(id, request, actorId));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Cambiar estado del acta")
    public ResponseEntity<MinuteDto> changeStatus(@PathVariable UUID id,
                                                   @Valid @RequestBody ChangeStatusRequest request,
                                                   Authentication auth) {
        UUID actorId = UUID.fromString((String) auth.getPrincipal());
        Set<String> roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(r -> r.replace("ROLE_", ""))
                .collect(Collectors.toSet());
        return ResponseEntity.ok(minuteService.changeStatus(id, request.getStatus(), actorId, roles));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar acta (solo BORRADOR)")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication auth) {
        UUID actorId = UUID.fromString((String) auth.getPrincipal());
        Set<String> roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(r -> r.replace("ROLE_", ""))
                .collect(Collectors.toSet());
        minuteService.delete(id, actorId, roles);
        return ResponseEntity.noContent().build();
    }
}
