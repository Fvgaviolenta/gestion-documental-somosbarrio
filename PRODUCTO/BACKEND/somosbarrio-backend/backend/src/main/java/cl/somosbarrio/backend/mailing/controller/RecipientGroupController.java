package cl.somosbarrio.backend.mailing.controller;

import cl.somosbarrio.backend.mailing.dto.CreateRecipientGroupRequest;
import cl.somosbarrio.backend.mailing.dto.RecipientGroupDto;
import cl.somosbarrio.backend.mailing.dto.UpdateRecipientGroupRequest;
import cl.somosbarrio.backend.mailing.service.RecipientGroupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recipient-groups")
@RequiredArgsConstructor
@Tag(name = "Recipient Groups", description = "Listas de destinatarios habituales")
public class RecipientGroupController {

    private final RecipientGroupService recipientGroupService;

    @GetMapping
    @Operation(summary = "Listar grupos de destinatarios activos")
    public ResponseEntity<List<RecipientGroupDto>> listActive() {
        return ResponseEntity.ok(recipientGroupService.listActive());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Crear un grupo de destinatarios")
    public ResponseEntity<RecipientGroupDto> create(
            @Valid @RequestBody CreateRecipientGroupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(recipientGroupService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Actualizar un grupo de destinatarios")
    public ResponseEntity<RecipientGroupDto> update(
            @PathVariable java.util.UUID id,
            @Valid @RequestBody UpdateRecipientGroupRequest request) {
        return ResponseEntity.ok(recipientGroupService.update(id, request));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Desactivar un grupo de destinatarios")
    public ResponseEntity<Void> deactivate(@PathVariable java.util.UUID id) {
        recipientGroupService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
