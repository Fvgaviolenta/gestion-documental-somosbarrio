package cl.somosbarrio.backend.audit.repository;

import cl.somosbarrio.backend.audit.entity.AuditLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AuditLogRepository
        extends JpaRepository<AuditLogEntity, Long>,
                JpaSpecificationExecutor<AuditLogEntity> {
}
