package cl.somosbarrio.backend.documents.service;

import cl.somosbarrio.backend.documents.dto.*;
import cl.somosbarrio.backend.documents.entity.DocumentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Set;
import java.util.UUID;

public interface DocumentService {

    Page<DocumentDto> findAll(UUID activityId, DocumentStatus status, Pageable pageable);

    DocumentDto findById(UUID id);

    DocumentDto create(CreateDocumentRequest request, UUID actorId);

    DocumentDto update(UUID id, UpdateDocumentRequest request, UUID actorId);

    DocumentDto changeStatus(UUID id, DocumentStatus newStatus, UUID actorId, Set<String> actorRoles);

    DocumentDto reject(UUID id, String rejectionReason, UUID actorId, Set<String> actorRoles);

    void delete(UUID id, UUID actorId, Set<String> actorRoles);

    /**
     * Genera merge .docx en {@code documents/previews/{id}/} con nombre tipo {@code ACTA_ACT-2026-0001_preview_merged.docx}
     * (ver {@link cl.somosbarrio.backend.documents.pdf.GeneratedDocumentFilenames}).
     */
    String previewMergedDocx(UUID id, UUID actorId, Set<String> actorRoles);
}
