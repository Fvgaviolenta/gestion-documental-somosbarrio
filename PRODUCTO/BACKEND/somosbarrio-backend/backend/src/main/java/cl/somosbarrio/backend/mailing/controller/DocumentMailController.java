package cl.somosbarrio.backend.mailing.controller;

import cl.somosbarrio.backend.mailing.dto.EmailLogDto;
import cl.somosbarrio.backend.mailing.dto.SendDocumentRequest;
import cl.somosbarrio.backend.mailing.dto.SendDocumentResponse;
import cl.somosbarrio.backend.mailing.service.DocumentMailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Tag(name = "Document Mailing", description = "Envio de documentos por correo y trazabilidad")
public class DocumentMailController {

    private final DocumentMailService documentMailService;

    @PostMapping("/{id}/send")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','COLABORADOR')")
    @Operation(summary = "Enviar documento aprobado por correo")
    public ResponseEntity<SendDocumentResponse> send(
            @PathVariable UUID id,
            @Valid @RequestBody SendDocumentRequest request,
            Authentication auth) {
        UUID actorId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(documentMailService.sendDocument(id, actorId, request));
    }

    @GetMapping("/{id}/email-logs")
    @Operation(summary = "Obtener historial de envios de un documento")
    public ResponseEntity<List<EmailLogDto>> getEmailLogs(@PathVariable UUID id) {
        return ResponseEntity.ok(documentMailService.findByDocumentId(id));
    }
}
