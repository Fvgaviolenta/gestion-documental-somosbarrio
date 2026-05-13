package cl.somosbarrio.backend.documents.repository;

import cl.somosbarrio.backend.documents.entity.DocumentEntity;
import cl.somosbarrio.backend.documents.entity.DocumentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface DocumentRepository extends JpaRepository<DocumentEntity, UUID>, JpaSpecificationExecutor<DocumentEntity> {

    Page<DocumentEntity> findByActivityId(UUID activityId, Pageable pageable);

    Page<DocumentEntity> findByStatus(DocumentStatus status, Pageable pageable);

    Page<DocumentEntity> findByActivityIdAndStatus(UUID activityId, DocumentStatus status, Pageable pageable);

    Page<DocumentEntity> findByCreatedById(UUID createdById, Pageable pageable);

    boolean existsByTemplateId(UUID templateId);
}
