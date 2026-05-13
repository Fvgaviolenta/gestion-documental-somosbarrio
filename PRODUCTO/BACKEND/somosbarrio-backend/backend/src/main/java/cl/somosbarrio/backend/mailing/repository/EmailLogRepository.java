package cl.somosbarrio.backend.mailing.repository;

import cl.somosbarrio.backend.mailing.entity.EmailLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EmailLogRepository extends JpaRepository<EmailLogEntity, UUID> {
    List<EmailLogEntity> findByDocumentIdOrderBySentAtDesc(UUID documentId);
}
