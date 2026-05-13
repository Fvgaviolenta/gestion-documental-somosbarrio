package cl.somosbarrio.backend.audit.service;

import cl.somosbarrio.backend.audit.dto.AuditLogDto;
import cl.somosbarrio.backend.audit.entity.AuditAction;
import cl.somosbarrio.backend.audit.entity.AuditLogEntity;
import cl.somosbarrio.backend.audit.repository.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.criteria.Predicate;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;
    private final PlatformTransactionManager transactionManager;

    private TransactionTemplate requiresNewTx;

    @PostConstruct
    void initTx() {
        requiresNewTx = new TransactionTemplate(transactionManager);
        requiresNewTx.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    /**
     * Ejecuta en su propia transacción para que un fallo de auditoría nunca
     * revierta la transacción principal del caller.
     */
    @Override
    public void log(UUID actorId, AuditAction action, String entityType, String entityId,
                    Object beforeData, Object afterData) {
        try {
            requiresNewTx.executeWithoutResult(status -> {
                AuditLogEntity entry = new AuditLogEntity();
                entry.setUserId(actorId);
                entry.setAction(action);
                entry.setEntityType(entityType);
                entry.setEntityId(entityId);
                entry.setBeforeData(toJson(beforeData));
                entry.setAfterData(toJson(afterData));
                entry.setIpAddress(extractIp());
                entry.setCorrelationId(MDC.get("correlationId"));
                auditLogRepository.save(entry);
            });
        } catch (Exception e) {
            log.warn("No se pudo registrar entrada de auditoría [action={}, entity={}/{}]: {}",
                    action, entityType, entityId, e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogDto> findAll(String entityType, String entityId,
                                     UUID userId, AuditAction action, Pageable pageable) {
        Specification<AuditLogEntity> spec = buildSpec(entityType, entityId, userId, action);
        return auditLogRepository.findAll(spec, pageable).map(this::toDto);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private Specification<AuditLogEntity> buildSpec(String entityType, String entityId,
                                                     UUID userId, AuditAction action) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (entityType != null && !entityType.isBlank()) {
                predicates.add(cb.equal(root.get("entityType"), entityType));
            }
            if (entityId != null && !entityId.isBlank()) {
                predicates.add(cb.equal(root.get("entityId"), entityId));
            }
            if (userId != null) {
                predicates.add(cb.equal(root.get("userId"), userId));
            }
            if (action != null) {
                predicates.add(cb.equal(root.get("action"), action));
            }
            if (query != null) {
                query.orderBy(cb.desc(root.get("createdAt")));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.warn("No se pudo serializar datos de auditoría: {}", e.getMessage());
            return null;
        }
    }

    private String extractIp() {
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            HttpServletRequest request = attrs.getRequest();
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                return forwarded.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        } catch (Exception e) {
            return null;
        }
    }

    private AuditLogDto toDto(AuditLogEntity entity) {
        return AuditLogDto.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .action(entity.getAction())
                .entityType(entity.getEntityType())
                .entityId(entity.getEntityId())
                .beforeData(entity.getBeforeData())
                .afterData(entity.getAfterData())
                .ipAddress(entity.getIpAddress())
                .correlationId(entity.getCorrelationId())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
