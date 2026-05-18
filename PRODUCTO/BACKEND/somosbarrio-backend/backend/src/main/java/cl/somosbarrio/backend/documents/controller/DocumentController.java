package cl.somosbarrio.backend.documents.controller;

import cl.somosbarrio.backend.common.pagination.PagedResponse;
import cl.somosbarrio.backend.common.storage.FileStorageService;
import cl.somosbarrio.backend.documents.dto.*;
import cl.somosbarrio.backend.documents.entity.DocumentStatus;
import cl.somosbarrio.backend.documents.service.DocumentService;
import cl.somosbarrio.backend.exception.ErrorCode;
import cl.somosbarrio.backend.exception.custom.BusinessException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Tag(name = "Documents", description = "Gestión de documentos institucionales")
public class DocumentController {

    private final DocumentService documentService;
    private final FileStorageService fileStorageService;

    @GetMapping
    @Operation(summary = "Listar documentos (paginado, filtros opcionales)")
    public ResponseEntity<PagedResponse<DocumentDto>> findAll(
            @RequestParam(required = false) UUID activityId,
            @RequestParam(required = false) DocumentStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(new PagedResponse<>(
                documentService.findAll(activityId, status, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener documento con adjuntos")
    public ResponseEntity<DocumentDto> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(documentService.findById(id));
    }

    @GetMapping("/{id}/pdf")
    @Operation(summary = "Descargar PDF institucional generado al aprobar")
    public ResponseEntity<Resource> downloadPdf(@PathVariable UUID id) {
        DocumentDto doc = documentService.findById(id);
        String rel = doc.getGeneratedPdfPath();
        if (rel == null || rel.isBlank()) {
            throw new BusinessException(ErrorCode.NOT_FOUND,
                    "El documento no tiene PDF generado aún", HttpStatus.NOT_FOUND);
        }
        Path path = fileStorageService.resolve(rel);
        if (!Files.isRegularFile(path)) {
            throw new BusinessException(ErrorCode.FILE_STORAGE_ERROR,
                    "El archivo PDF no está disponible en disco", HttpStatus.CONFLICT);
        }
        Resource resource = new PathResource(path);
        String filename = path.getFileName().toString();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

    @PostMapping("/{id}/preview-docx")
    @Operation(summary = "Vista previa: genera .docx mergeado (BORRADOR, RECHAZADA o EN_REVISION)")
    public ResponseEntity<Resource> previewDocx(@PathVariable UUID id, Authentication auth) {
        UUID actorId = UUID.fromString((String) auth.getPrincipal());
        Set<String> roles = extractRoles(auth);
        String rel = documentService.previewMergedDocx(id, actorId, roles);
        Path path = fileStorageService.resolve(rel);
        if (!Files.isRegularFile(path)) {
            throw new BusinessException(ErrorCode.FILE_STORAGE_ERROR,
                    "No se generó el archivo de vista previa", HttpStatus.CONFLICT);
        }
        Resource resource = new PathResource(path);
        String filename = path.getFileName().toString();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .body(resource);
    }

    @PostMapping
    @Operation(summary = "Crear documento en estado BORRADOR")
    public ResponseEntity<DocumentDto> create(@Valid @RequestBody CreateDocumentRequest request,
                                               Authentication auth) {
        UUID actorId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentService.create(request, actorId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar documento (solo BORRADOR o RECHAZADA)")
    public ResponseEntity<DocumentDto> update(@PathVariable UUID id,
                                               @Valid @RequestBody UpdateDocumentRequest request,
                                               Authentication auth) {
        UUID actorId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(documentService.update(id, request, actorId));
    }

    @PatchMapping("/{id}/submit-review")
    @Operation(summary = "Enviar documento a revisión (BORRADOR → EN_REVISION)")
    public ResponseEntity<DocumentDto> submitReview(@PathVariable UUID id, Authentication auth) {
        UUID actorId = UUID.fromString((String) auth.getPrincipal());
        Set<String> roles = extractRoles(auth);
        return ResponseEntity.ok(
                documentService.changeStatus(id, DocumentStatus.EN_REVISION, actorId, roles));
    }

    @PatchMapping("/{id}/reopen")
    @Operation(summary = "Reabrir documento rechazado (RECHAZADA → BORRADOR)")
    public ResponseEntity<DocumentDto> reopen(@PathVariable UUID id, Authentication auth) {
        UUID actorId = UUID.fromString((String) auth.getPrincipal());
        Set<String> roles = extractRoles(auth);
        return ResponseEntity.ok(
                documentService.changeStatus(id, DocumentStatus.BORRADOR, actorId, roles));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Aprobar documento (EN_REVISION → APROBADA)")
    public ResponseEntity<DocumentDto> approve(@PathVariable UUID id, Authentication auth) {
        UUID actorId = UUID.fromString((String) auth.getPrincipal());
        Set<String> roles = extractRoles(auth);
        return ResponseEntity.ok(
                documentService.changeStatus(id, DocumentStatus.APROBADA, actorId, roles));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Rechazar documento (EN_REVISION → RECHAZADA)")
    public ResponseEntity<DocumentDto> reject(@PathVariable UUID id,
                                               @Valid @RequestBody RejectDocumentRequest request,
                                               Authentication auth) {
        UUID actorId = UUID.fromString((String) auth.getPrincipal());
        Set<String> roles = extractRoles(auth);
        return ResponseEntity.ok(
                documentService.reject(id, request.getRejectionReason(), actorId, roles));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar documento (solo BORRADOR)")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication auth) {
        UUID actorId = UUID.fromString((String) auth.getPrincipal());
        Set<String> roles = extractRoles(auth);
        documentService.delete(id, actorId, roles);
        return ResponseEntity.noContent().build();
    }

    private Set<String> extractRoles(Authentication auth) {
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(r -> r.replace("ROLE_", ""))
                .collect(Collectors.toSet());
    }
}
