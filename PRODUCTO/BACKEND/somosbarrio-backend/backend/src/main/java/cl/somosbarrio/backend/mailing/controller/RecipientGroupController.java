package cl.somosbarrio.backend.mailing.controller;

import cl.somosbarrio.backend.mailing.dto.RecipientGroupDto;
import cl.somosbarrio.backend.mailing.service.DocumentMailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recipient-groups")
@RequiredArgsConstructor
@Tag(name = "Recipient Groups", description = "Listas de destinatarios habituales")
public class RecipientGroupController {

    private final DocumentMailService documentMailService;

    @GetMapping
    @Operation(summary = "Listar grupos de destinatarios activos")
    public ResponseEntity<List<RecipientGroupDto>> listActive() {
        return ResponseEntity.ok(documentMailService.listActiveRecipientGroups());
    }
}
