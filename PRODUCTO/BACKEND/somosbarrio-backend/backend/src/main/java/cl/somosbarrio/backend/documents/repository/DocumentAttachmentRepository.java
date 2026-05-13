package cl.somosbarrio.backend.documents.repository;

import cl.somosbarrio.backend.documents.entity.DocumentAttachmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DocumentAttachmentRepository extends JpaRepository<DocumentAttachmentEntity, UUID> {

    List<DocumentAttachmentEntity> findByDocumentId(UUID documentId);
}
