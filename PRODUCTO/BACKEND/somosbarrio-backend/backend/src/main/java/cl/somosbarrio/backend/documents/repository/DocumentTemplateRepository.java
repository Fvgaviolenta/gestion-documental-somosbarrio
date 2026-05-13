package cl.somosbarrio.backend.documents.repository;

import cl.somosbarrio.backend.documents.entity.DocumentTemplateEntity;
import cl.somosbarrio.backend.documents.entity.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentTemplateRepository extends JpaRepository<DocumentTemplateEntity, UUID> {

    List<DocumentTemplateEntity> findByIsActiveTrue();

    List<DocumentTemplateEntity> findByDocumentTypeAndIsActiveTrue(DocumentType documentType);

    Optional<DocumentTemplateEntity> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByIdNotAndCode(UUID id, String code);
}
