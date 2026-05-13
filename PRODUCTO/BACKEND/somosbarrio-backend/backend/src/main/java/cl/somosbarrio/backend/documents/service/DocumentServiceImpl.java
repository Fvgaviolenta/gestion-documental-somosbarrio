package cl.somosbarrio.backend.documents.service;

import cl.somosbarrio.backend.audit.entity.AuditAction;
import cl.somosbarrio.backend.audit.service.AuditLogService;
import cl.somosbarrio.backend.activities.entity.ActivityEntity;
import cl.somosbarrio.backend.activities.repository.ActivityRepository;
import cl.somosbarrio.backend.auth.entity.UserEntity;
import cl.somosbarrio.backend.auth.repository.UserRepository;
import cl.somosbarrio.backend.documents.dto.*;
import cl.somosbarrio.backend.documents.entity.DocumentEntity;
import cl.somosbarrio.backend.documents.entity.DocumentStatus;
import cl.somosbarrio.backend.documents.entity.DocumentTemplateEntity;
import cl.somosbarrio.backend.documents.mapper.DocumentMapper;
import cl.somosbarrio.backend.documents.repository.DocumentAttachmentRepository;
import cl.somosbarrio.backend.documents.repository.DocumentRepository;
import cl.somosbarrio.backend.documents.repository.DocumentTemplateRepository;
import cl.somosbarrio.backend.documents.pdf.DocumentPdfGenerationService;
import cl.somosbarrio.backend.exception.ErrorCode;
import cl.somosbarrio.backend.exception.custom.BusinessException;
import cl.somosbarrio.backend.exception.custom.ConflictException;
import cl.somosbarrio.backend.exception.custom.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentAttachmentRepository attachmentRepository;
    private final DocumentTemplateRepository templateRepository;
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final DocumentMapper documentMapper;
    private final DocumentStateMachine stateMachine;
    private final DocumentCodeGenerator codeGenerator;
    private final DocumentPdfGenerationService documentPdfGenerationService;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public Page<DocumentDto> findAll(UUID activityId, DocumentStatus status, Pageable pageable) {
        Page<DocumentEntity> page;
        if (activityId != null && status != null) {
            page = documentRepository.findByActivityIdAndStatus(activityId, status, pageable);
        } else if (activityId != null) {
            page = documentRepository.findByActivityId(activityId, pageable);
        } else if (status != null) {
            page = documentRepository.findByStatus(status, pageable);
        } else {
            page = documentRepository.findAll(pageable);
        }
        return page.map(documentMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentDto findById(UUID id) {
        DocumentEntity doc = getOrThrow(id);
        DocumentDto dto = documentMapper.toDto(doc);
        List<DocumentAttachmentDto> attachments = attachmentRepository.findByDocumentId(id)
                .stream().map(documentMapper::toAttachmentDto).toList();
        return DocumentDto.builder()
                .id(dto.getId())
                .code(dto.getCode())
                .templateId(dto.getTemplateId())
                .templateName(dto.getTemplateName())
                .documentType(dto.getDocumentType())
                .activityId(dto.getActivityId())
                .activityTitle(dto.getActivityTitle())
                .title(dto.getTitle())
                .fieldValues(dto.getFieldValues())
                .generatedPdfPath(dto.getGeneratedPdfPath())
                .status(dto.getStatus())
                .statusLabel(dto.getStatusLabel())
                .createdById(dto.getCreatedById())
                .createdByName(dto.getCreatedByName())
                .approvedById(dto.getApprovedById())
                .approvedByName(dto.getApprovedByName())
                .approvedAt(dto.getApprovedAt())
                .rejectionReason(dto.getRejectionReason())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .attachments(attachments)
                .build();
    }

    @Override
    @Transactional
    public DocumentDto create(CreateDocumentRequest request, UUID actorId) {
        DocumentTemplateEntity template = templateRepository.findById(request.getTemplateId())
                .orElseThrow(() -> new ResourceNotFoundException("Plantilla", request.getTemplateId()));

        if (!template.isActive()) {
            throw new BusinessException(ErrorCode.CONFLICT_STATE,
                    "La plantilla no está activa", HttpStatus.CONFLICT);
        }

        UserEntity author = userRepository.findById(actorId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", actorId));

        ActivityEntity activity = null;
        if (request.getActivityId() != null) {
            activity = activityRepository.findById(request.getActivityId())
                    .orElseThrow(() -> new ResourceNotFoundException("Actividad", request.getActivityId()));
        }

        DocumentEntity doc = new DocumentEntity();
        doc.setCode(codeGenerator.generate(template.getDocumentType()));
        doc.setTemplate(template);
        doc.setActivity(activity);
        doc.setTitle(request.getTitle());
        doc.setFieldValues(request.getFieldValues() != null ? request.getFieldValues() : "{}");
        doc.setCreatedBy(author);

        DocumentEntity saved = documentRepository.save(doc);
        auditLogService.log(actorId, AuditAction.CREATE, "Document", saved.getId().toString(), null, null);
        return documentMapper.toDto(saved);
    }

    @Override
    @Transactional
    public DocumentDto update(UUID id, UpdateDocumentRequest request, UUID actorId) {
        DocumentEntity doc = getOrThrow(id);

        if (doc.getStatus() != DocumentStatus.BORRADOR && doc.getStatus() != DocumentStatus.RECHAZADA) {
            throw new ConflictException(ErrorCode.CONFLICT_STATE,
                    "Solo se pueden editar documentos en estado BORRADOR o RECHAZADA");
        }

        if (!doc.getCreatedBy().getId().equals(actorId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED,
                    "Solo el autor puede editar el documento", HttpStatus.FORBIDDEN);
        }

        doc.setTitle(request.getTitle());
        if (request.getFieldValues() != null) {
            doc.setFieldValues(request.getFieldValues());
        }

        DocumentDto result = documentMapper.toDto(documentRepository.save(doc));
        auditLogService.log(actorId, AuditAction.UPDATE, "Document", id.toString(), null, null);
        return result;
    }

    @Override
    @Transactional
    public DocumentDto changeStatus(UUID id, DocumentStatus newStatus,
                                    UUID actorId, Set<String> actorRoles) {
        DocumentEntity doc = getOrThrow(id);
        stateMachine.validate(doc.getStatus(), newStatus,
                actorId, doc.getCreatedBy().getId(), actorRoles);

        if (newStatus == DocumentStatus.APROBADA) {
            UserEntity approver = userRepository.findById(actorId)
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario", actorId));
            doc.setApprovedBy(approver);
            doc.setApprovedAt(Instant.now());
            doc.setRejectionReason(null);
            String pdfRelPath = documentPdfGenerationService.generateAndStorePdf(doc);
            doc.setGeneratedPdfPath(pdfRelPath);
        } else if (newStatus == DocumentStatus.BORRADOR && doc.getStatus() == DocumentStatus.RECHAZADA) {
            doc.setRejectionReason(null);
        }

        doc.setStatus(newStatus);
        DocumentDto result = documentMapper.toDto(documentRepository.save(doc));

        if (newStatus == DocumentStatus.APROBADA) {
            auditLogService.log(actorId, AuditAction.APPROVE, "Document", id.toString(), null, null);
            auditLogService.log(actorId, AuditAction.PDF_GENERATED, "Document", id.toString(), null, null);
        }

        return result;
    }

    @Override
    @Transactional
    public DocumentDto reject(UUID id, String rejectionReason,
                               UUID actorId, Set<String> actorRoles) {
        DocumentEntity doc = getOrThrow(id);
        stateMachine.validate(doc.getStatus(), DocumentStatus.RECHAZADA,
                actorId, doc.getCreatedBy().getId(), actorRoles);
        doc.setStatus(DocumentStatus.RECHAZADA);
        doc.setRejectionReason(rejectionReason);
        DocumentDto result = documentMapper.toDto(documentRepository.save(doc));
        auditLogService.log(actorId, AuditAction.REJECT, "Document", id.toString(),
                null, java.util.Map.of("reason", rejectionReason != null ? rejectionReason : ""));
        return result;
    }

    @Override
    @Transactional
    public void delete(UUID id, UUID actorId, Set<String> actorRoles) {
        DocumentEntity doc = getOrThrow(id);

        if (doc.getStatus() != DocumentStatus.BORRADOR) {
            throw new ConflictException(ErrorCode.CONFLICT_STATE,
                    "Solo se pueden eliminar documentos en estado BORRADOR");
        }

        boolean isAuthor = doc.getCreatedBy().getId().equals(actorId);
        boolean isAdmin  = actorRoles.contains("ADMINISTRADOR");
        if (!isAuthor && !isAdmin) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED,
                    "Solo el autor o un ADMINISTRADOR pueden eliminar el documento", HttpStatus.FORBIDDEN);
        }

        documentRepository.delete(doc);
        auditLogService.log(actorId, AuditAction.DELETE, "Document", id.toString(), null, null);
    }

    @Override
    @Transactional
    public String previewMergedDocx(UUID id, UUID actorId, Set<String> actorRoles) {
        DocumentEntity doc = getOrThrow(id);
        DocumentStatus s = doc.getStatus();
        if (s != DocumentStatus.BORRADOR && s != DocumentStatus.RECHAZADA && s != DocumentStatus.EN_REVISION) {
            throw new ConflictException(ErrorCode.CONFLICT_STATE,
                    "Solo se puede generar vista previa en BORRADOR, RECHAZADA o EN_REVISION");
        }
        boolean admin = actorRoles.contains("ADMINISTRADOR");
        boolean author = doc.getCreatedBy().getId().equals(actorId);
        if (!admin && !author) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED,
                    "Solo el autor o un ADMINISTRADOR pueden solicitar la vista previa",
                    HttpStatus.FORBIDDEN);
        }
        return documentPdfGenerationService.mergePreviewDocx(doc);
    }

    private DocumentEntity getOrThrow(UUID id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Documento", id));
    }
}
