package cl.somosbarrio.backend.documents.controller;

import cl.somosbarrio.backend.common.pagination.PagedResponse;
import cl.somosbarrio.backend.documents.dto.DocumentRepositoryFilter;
import cl.somosbarrio.backend.documents.dto.DocumentSummaryDto;
import cl.somosbarrio.backend.documents.entity.DocumentStatus;
import cl.somosbarrio.backend.documents.entity.DocumentType;
import cl.somosbarrio.backend.documents.service.DocumentRepositoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/repository/documents")
@RequiredArgsConstructor
@Tag(name = "Document Repository", description = "Búsqueda avanzada de documentos")
public class DocumentRepositoryController {

    private final DocumentRepositoryService documentRepositoryService;

    @GetMapping
    @Operation(summary = "Buscar documentos con filtros avanzados")
    public ResponseEntity<PagedResponse<DocumentSummaryDto>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) DocumentType type,
            @RequestParam(required = false) DocumentStatus status,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            @RequestParam(required = false) UUID authorId,
            @RequestParam(required = false) UUID activityId,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) Boolean belongsToMe,
            Pageable pageable,
            Authentication auth) {

        DocumentRepositoryFilter filter = DocumentRepositoryFilter.builder()
                .q(q)
                .type(type)
                .status(status)
                .from(from)
                .to(to)
                .authorId(authorId)
                .activityId(activityId)
                .code(code)
                .belongsToMe(belongsToMe)
                .actorId(UUID.fromString((String) auth.getPrincipal()))
                .build();

        return ResponseEntity.ok(new PagedResponse<>(documentRepositoryService.search(filter, pageable)));
    }
}
