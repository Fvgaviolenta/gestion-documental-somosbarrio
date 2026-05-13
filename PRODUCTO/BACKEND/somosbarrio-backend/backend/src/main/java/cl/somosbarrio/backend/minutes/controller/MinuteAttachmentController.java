package cl.somosbarrio.backend.minutes.controller;

import cl.somosbarrio.backend.auth.entity.UserEntity;
import cl.somosbarrio.backend.auth.repository.UserRepository;
import cl.somosbarrio.backend.common.storage.FileStorageService;
import cl.somosbarrio.backend.common.storage.MimeValidator;
import cl.somosbarrio.backend.exception.ErrorCode;
import cl.somosbarrio.backend.exception.custom.BusinessException;
import cl.somosbarrio.backend.exception.custom.ConflictException;
import cl.somosbarrio.backend.exception.custom.ResourceNotFoundException;
import cl.somosbarrio.backend.minutes.dto.MinuteAttachmentDto;
import cl.somosbarrio.backend.minutes.entity.MinuteAttachmentEntity;
import cl.somosbarrio.backend.minutes.entity.MinuteEntity;
import cl.somosbarrio.backend.minutes.entity.MinuteStatus;
import cl.somosbarrio.backend.minutes.mapper.MinuteMapper;
import cl.somosbarrio.backend.minutes.repository.MinuteAttachmentRepository;
import cl.somosbarrio.backend.minutes.repository.MinuteRepository;
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
@RequestMapping("/api/v1/minutes/{minuteId}/attachments")
@RequiredArgsConstructor
@Tag(name = "Minute Attachments", description = "Adjuntos de actas")
public class MinuteAttachmentController {

    private final MinuteRepository minuteRepository;
    private final MinuteAttachmentRepository attachmentRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final MimeValidator mimeValidator;
    private final MinuteMapper minuteMapper;

    @Value("${app.upload.max-mb:20}")
    private long maxMb;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Subir adjunto al acta")
    public ResponseEntity<MinuteAttachmentDto> upload(@PathVariable UUID minuteId,
                                                       @RequestParam("file") MultipartFile file,
                                                       Authentication auth) throws IOException {
        MinuteEntity minute = getMinuteOrThrow(minuteId);

        long maxBytes = maxMb * 1024 * 1024;
        if (file.getSize() > maxBytes) {
            throw new BusinessException(ErrorCode.FILE_TOO_LARGE,
                    "El archivo supera el límite de " + maxMb + " MB", HttpStatus.PAYLOAD_TOO_LARGE);
        }

        String mimeType = mimeValidator.detectAndValidate(file.getInputStream(), file.getOriginalFilename());
        String storagePath = fileStorageService.store(file.getInputStream(), file.getOriginalFilename(), "minutes");

        UUID actorId = UUID.fromString((String) auth.getPrincipal());
        UserEntity uploader = userRepository.findById(actorId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", actorId));

        MinuteAttachmentEntity attachment = new MinuteAttachmentEntity();
        attachment.setMinute(minute);
        attachment.setOriginalName(file.getOriginalFilename());
        attachment.setStoragePath(storagePath);
        attachment.setMimeType(mimeType);
        attachment.setSizeBytes(file.getSize());
        attachment.setUploadedBy(uploader);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(minuteMapper.toAttachmentDto(attachmentRepository.save(attachment)));
    }

    @GetMapping
    @Operation(summary = "Listar adjuntos del acta")
    public ResponseEntity<List<MinuteAttachmentDto>> list(@PathVariable UUID minuteId) {
        getMinuteOrThrow(minuteId);
        List<MinuteAttachmentDto> dtos = attachmentRepository.findByMinuteId(minuteId)
                .stream().map(minuteMapper::toAttachmentDto).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{attId}")
    @Operation(summary = "Descargar adjunto")
    public ResponseEntity<Resource> download(@PathVariable UUID minuteId,
                                              @PathVariable UUID attId) {
        getMinuteOrThrow(minuteId);
        MinuteAttachmentEntity att = attachmentRepository.findById(attId)
                .orElseThrow(() -> new ResourceNotFoundException("Adjunto", attId));

        Resource resource = new PathResource(fileStorageService.resolve(att.getStoragePath()));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + att.getOriginalName() + "\"")
                .contentType(MediaType.parseMediaType(att.getMimeType()))
                .body(resource);
    }

    @DeleteMapping("/{attId}")
    @Operation(summary = "Eliminar adjunto (solo si acta en BORRADOR)")
    public ResponseEntity<Void> delete(@PathVariable UUID minuteId, @PathVariable UUID attId) {
        MinuteEntity minute = getMinuteOrThrow(minuteId);
        if (minute.getStatus() != MinuteStatus.BORRADOR) {
            throw new ConflictException(ErrorCode.CONFLICT_STATE,
                    "Solo se pueden eliminar adjuntos de actas en estado BORRADOR");
        }
        MinuteAttachmentEntity att = attachmentRepository.findById(attId)
                .orElseThrow(() -> new ResourceNotFoundException("Adjunto", attId));
        fileStorageService.delete(att.getStoragePath());
        attachmentRepository.delete(att);
        return ResponseEntity.noContent().build();
    }

    private MinuteEntity getMinuteOrThrow(UUID id) {
        return minuteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Acta", id));
    }
}
