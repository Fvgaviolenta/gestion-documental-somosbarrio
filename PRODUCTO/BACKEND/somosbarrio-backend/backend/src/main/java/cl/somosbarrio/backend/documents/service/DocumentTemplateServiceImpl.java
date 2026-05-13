package cl.somosbarrio.backend.documents.service;

import cl.somosbarrio.backend.documents.dto.CreateDocumentTemplateRequest;
import cl.somosbarrio.backend.documents.dto.DocumentTemplateDto;
import cl.somosbarrio.backend.documents.entity.DocumentTemplateEntity;
import cl.somosbarrio.backend.documents.entity.DocumentType;
import cl.somosbarrio.backend.documents.mapper.DocumentMapper;
import cl.somosbarrio.backend.documents.repository.DocumentRepository;
import cl.somosbarrio.backend.documents.repository.DocumentTemplateRepository;
import cl.somosbarrio.backend.exception.ErrorCode;
import cl.somosbarrio.backend.exception.custom.ConflictException;
import cl.somosbarrio.backend.exception.custom.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentTemplateServiceImpl implements DocumentTemplateService {

    private final DocumentTemplateRepository templateRepository;
    private final DocumentRepository documentRepository;
    private final DocumentMapper documentMapper;

    @Override
    @Transactional(readOnly = true)
    public List<DocumentTemplateDto> findAllActive() {
        return templateRepository.findByIsActiveTrue().stream()
                .map(documentMapper::toTemplateDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentTemplateDto> findByType(DocumentType type) {
        return templateRepository.findByDocumentTypeAndIsActiveTrue(type).stream()
                .map(documentMapper::toTemplateDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentTemplateDto findById(UUID id) {
        return documentMapper.toTemplateDto(getOrThrow(id));
    }

    @Override
    @Transactional
    public DocumentTemplateDto create(CreateDocumentTemplateRequest request) {
        if (templateRepository.existsByCode(request.getCode())) {
            throw new ConflictException(ErrorCode.CONFLICT_HAS_RELATED,
                    "Ya existe una plantilla con el código: " + request.getCode());
        }
        DocumentTemplateEntity template = new DocumentTemplateEntity();
        template.setCode(request.getCode().toUpperCase());
        template.setName(request.getName());
        template.setDocumentType(request.getDocumentType());
        template.setDescription(request.getDescription());
        template.setFieldsSchema(request.getFieldsSchema() != null ? request.getFieldsSchema() : "{}");
        template.setTemplateFilePath(normalizeTemplatePath(request.getTemplateFilePath()));
        return documentMapper.toTemplateDto(templateRepository.save(template));
    }

    @Override
    @Transactional
    public DocumentTemplateDto update(UUID id, CreateDocumentTemplateRequest request) {
        DocumentTemplateEntity template = getOrThrow(id);
        if (templateRepository.existsByIdNotAndCode(id, request.getCode())) {
            throw new ConflictException(ErrorCode.CONFLICT_HAS_RELATED,
                    "Ya existe una plantilla con el código: " + request.getCode());
        }
        template.setName(request.getName());
        template.setDocumentType(request.getDocumentType());
        template.setDescription(request.getDescription());
        if (request.getFieldsSchema() != null) {
            template.setFieldsSchema(request.getFieldsSchema());
        }
        if (request.getTemplateFilePath() != null) {
            template.setTemplateFilePath(normalizeTemplatePath(request.getTemplateFilePath()));
        }
        return documentMapper.toTemplateDto(templateRepository.save(template));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        DocumentTemplateEntity template = getOrThrow(id);
        if (documentRepository.existsByTemplateId(id)) {
            // Deactivate instead of hard-delete when documents reference this template
            template.setActive(false);
            templateRepository.save(template);
        } else {
            templateRepository.delete(template);
        }
    }

    private DocumentTemplateEntity getOrThrow(UUID id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plantilla", id));
    }

    private static String normalizeTemplatePath(String path) {
        if (path == null) {
            return null;
        }
        String t = path.trim();
        return t.isEmpty() ? null : t.replace('\\', '/');
    }
}
