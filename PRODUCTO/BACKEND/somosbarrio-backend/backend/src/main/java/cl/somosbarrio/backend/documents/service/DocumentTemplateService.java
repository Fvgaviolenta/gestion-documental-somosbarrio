package cl.somosbarrio.backend.documents.service;

import cl.somosbarrio.backend.documents.dto.CreateDocumentTemplateRequest;
import cl.somosbarrio.backend.documents.dto.DocumentTemplateDto;
import cl.somosbarrio.backend.documents.entity.DocumentType;

import java.util.List;
import java.util.UUID;

public interface DocumentTemplateService {

    List<DocumentTemplateDto> findAllActive();

    List<DocumentTemplateDto> findByType(DocumentType type);

    DocumentTemplateDto findById(UUID id);

    DocumentTemplateDto create(CreateDocumentTemplateRequest request);

    DocumentTemplateDto update(UUID id, CreateDocumentTemplateRequest request);

    void delete(UUID id);
}
