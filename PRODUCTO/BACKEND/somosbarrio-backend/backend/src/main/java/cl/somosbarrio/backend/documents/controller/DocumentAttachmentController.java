package cl.somosbarrio.backend.documents.controller;

import cl.somosbarrio.backend.auth.entity.UserEntity;
import cl.somosbarrio.backend.auth.repository.UserRepository;
import cl.somosbarrio.backend.common.storage.FileStorageService;
import cl.somosbarrio.backend.common.storage.MimeValidator;
import cl.somosbarrio.backend.documents.dto.DocumentAttachmentDto;
import cl.somosbarrio.backend.documents.entity.DocumentAttachmentEntity;
import cl.somosbarrio.backend.documents.entity.DocumentEntity;
import cl.somosbarrio.backend.documents.entity.DocumentStatus;
import cl.somosbarrio.backend.documents.mapper.DocumentMapper;
import cl.somosbarrio.backend.documents.repository.DocumentAttachmentRepository;
import cl.somosbarrio.backend.documents.repository.DocumentRepository;
import cl.somosbarrio.backend.exception.ErrorCode;
import cl.somosbarrio.backend.exception.custom.BusinessException;
import cl.somosbarrio.backend.exception.custom.ConflictException;
import cl.somosbarrio.backend.exception.custom.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents/{documentId}/attachments")
@RequiredArgsConstructor
@Tag(name = "Document Attachments", description = "Adjuntos de documentos")
public class DocumentAttachmentController {

    private final DocumentRepository documentRepository;
    private final DocumentAttachmentRepository attachmentRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final MimeValidator mimeValidator;
    private final DocumentMapper documentMapper;

    @Value("${app.upload.max-mb:20}")
    private long maxMb;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Subir adjunto al documento")
    public ResponseEntity<DocumentAttachmentDto> upload(@PathVariable UUID documentId,
                                                         @RequestParam("file") MultipartFile file,
                                                         Authentication auth) throws IOException {
        DocumentEntity doc = getDocumentOrThrow(documentId);

        if (doc.getStatus() == DocumentStatus.APROBADA) {
            throw new ConflictException(ErrorCode.CONFLICT_STATE,
                    "No se pueden subir adjuntos a documentos aprobados");
        }

        long maxBytes = maxMb * 1024 * 1024;
        if (file.getSize() > maxBytes) {
            throw new BusinessException(ErrorCode.FILE_TOO_LARGE,
                    "El archivo supera el límite de " + maxMb + " MB", HttpStatus.PAYLOAD_TOO_LARGE);
        }

        String contentType = mimeValidator.detectAndValidate(file.getInputStream(), file.getOriginalFilename());
        String storedFilename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        String storagePath = fileStorageService.store(file.getInputStream(), storedFilename, "documents");

        UUID actorId = UUID.fromString((String) auth.getPrincipal());
        UserEntity uploader = userRepository.findById(actorId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", actorId));

        DocumentAttachmentEntity attachment = new DocumentAttachmentEntity();
        attachment.setDocument(doc);
        attachment.setOriginalFilename(file.getOriginalFilename());
        attachment.setStoredFilename(storagePath);
        attachment.setContentType(contentType);
        attachment.setSizeBytes(file.getSize());
        attachment.setUploadedBy(uploader);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentMapper.toAttachmentDto(attachmentRepository.save(attachment)));
    }

    @GetMapping
    @Operation(summary = "Listar adjuntos del documento")
    public ResponseEntity<List<DocumentAttachmentDto>> list(@PathVariable UUID documentId) {
        getDocumentOrThrow(documentId);
        List<DocumentAttachmentDto> dtos = attachmentRepository.findByDocumentId(documentId)
                .stream().map(documentMapper::toAttachmentDto).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{attId}")
    @Operation(summary = "Descargar adjunto")
    public ResponseEntity<Resource> download(@PathVariable UUID documentId,
                                              @PathVariable UUID attId) {
        getDocumentOrThrow(documentId);
        DocumentAttachmentEntity att = attachmentRepository.findById(attId)
                .orElseThrow(() -> new ResourceNotFoundException("Adjunto", attId));

        Resource resource = new PathResource(fileStorageService.resolve(att.getStoredFilename()));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + att.getOriginalFilename() + "\"")
                .contentType(MediaType.parseMediaType(att.getContentType()))
                .body(resource);
    }

    @DeleteMapping("/{attId}")
    @Operation(summary = "Eliminar adjunto (solo si documento en BORRADOR o RECHAZADA)")
    public ResponseEntity<Void> delete(@PathVariable UUID documentId, @PathVariable UUID attId) {
        DocumentEntity doc = getDocumentOrThrow(documentId);
        if (doc.getStatus() == DocumentStatus.APROBADA || doc.getStatus() == DocumentStatus.EN_REVISION) {
            throw new ConflictException(ErrorCode.CONFLICT_STATE,
                    "Solo se pueden eliminar adjuntos de documentos en BORRADOR o RECHAZADA");
        }
        DocumentAttachmentEntity att = attachmentRepository.findById(attId)
                .orElseThrow(() -> new ResourceNotFoundException("Adjunto", attId));
        fileStorageService.delete(att.getStoredFilename());
        attachmentRepository.delete(att);
        return ResponseEntity.noContent().build();
    }

    private DocumentEntity getDocumentOrThrow(UUID id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Documento", id));
    }
}
