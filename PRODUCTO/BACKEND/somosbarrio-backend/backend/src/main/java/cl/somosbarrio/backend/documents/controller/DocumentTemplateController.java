package cl.somosbarrio.backend.documents.controller;

import cl.somosbarrio.backend.documents.dto.CreateDocumentTemplateRequest;
import cl.somosbarrio.backend.documents.dto.DocumentTemplateDto;
import cl.somosbarrio.backend.documents.entity.DocumentType;
import cl.somosbarrio.backend.documents.service.DocumentTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/document-templates")
@RequiredArgsConstructor
@Tag(name = "Document Templates", description = "Catálogo de plantillas de documentos")
public class DocumentTemplateController {

    private final DocumentTemplateService templateService;

    @GetMapping
    @Operation(summary = "Listar plantillas activas")
    public ResponseEntity<List<DocumentTemplateDto>> findAll(
            @RequestParam(required = false) DocumentType type) {
        List<DocumentTemplateDto> result = (type != null)
                ? templateService.findByType(type)
                : templateService.findAllActive();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener plantilla por ID")
    public ResponseEntity<DocumentTemplateDto> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(templateService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Crear plantilla (ADMINISTRADOR)")
    public ResponseEntity<DocumentTemplateDto> create(
            @Valid @RequestBody CreateDocumentTemplateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(templateService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Actualizar plantilla (ADMINISTRADOR)")
    public ResponseEntity<DocumentTemplateDto> update(@PathVariable UUID id,
            @Valid @RequestBody CreateDocumentTemplateRequest request) {
        return ResponseEntity.ok(templateService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Eliminar o desactivar plantilla (ADMINISTRADOR)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        templateService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
