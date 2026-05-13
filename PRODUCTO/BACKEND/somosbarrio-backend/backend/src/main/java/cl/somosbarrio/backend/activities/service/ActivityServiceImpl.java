package cl.somosbarrio.backend.activities.service;

import cl.somosbarrio.backend.audit.entity.AuditAction;
import cl.somosbarrio.backend.audit.service.AuditLogService;
import cl.somosbarrio.backend.activities.dto.ActivityDto;
import cl.somosbarrio.backend.activities.dto.CreateActivityRequest;
import cl.somosbarrio.backend.activities.entity.ActivityEntity;
import cl.somosbarrio.backend.activities.entity.ActivityStateMachine;
import cl.somosbarrio.backend.activities.entity.ActivityStatus;
import cl.somosbarrio.backend.activities.mapper.ActivityMapper;
import cl.somosbarrio.backend.activities.repository.ActivityRepository;
import cl.somosbarrio.backend.auth.entity.UserEntity;
import cl.somosbarrio.backend.auth.repository.UserRepository;
import cl.somosbarrio.backend.exception.custom.ResourceNotFoundException;
import cl.somosbarrio.backend.documents.repository.DocumentRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final ActivityMapper activityMapper;
    private final ActivityStateMachine stateMachine;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public Page<ActivityDto> findAll(ActivityStatus status, String territory, Pageable pageable) {
        Specification<ActivityEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) predicates.add(cb.equal(root.get("status"), status));
            if (territory != null && !territory.isBlank())
                predicates.add(cb.like(cb.lower(root.get("territory")), "%" + territory.toLowerCase() + "%"));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return activityRepository.findAll(spec, pageable).map(activityMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public ActivityDto findById(UUID id) {
        return activityMapper.toDto(getOrThrow(id));
    }

    @Override
    @Transactional
    public ActivityDto create(CreateActivityRequest request, UUID actorId) {
        UserEntity actor = userRepository.findById(actorId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", actorId));

        ActivityEntity activity = new ActivityEntity();
        activity.setTitle(request.getTitle());
        activity.setDescription(request.getDescription());
        activity.setTerritory(request.getTerritory());
        activity.setStartDate(request.getStartDate());
        activity.setEndDate(request.getEndDate());
        activity.setCreatedBy(actor);

        ActivityEntity saved = activityRepository.save(activity);
        auditLogService.log(actorId, AuditAction.CREATE, "Activity", saved.getId().toString(), null, null);
        return activityMapper.toDto(saved);
    }

    @Override
    @Transactional
    public ActivityDto update(UUID id, CreateActivityRequest request, UUID actorId) {
        ActivityEntity activity = getOrThrow(id);
        activity.setTitle(request.getTitle());
        activity.setDescription(request.getDescription());
        activity.setTerritory(request.getTerritory());
        activity.setStartDate(request.getStartDate());
        activity.setEndDate(request.getEndDate());
        return activityMapper.toDto(activityRepository.save(activity));
    }

    @Override
    @Transactional
    public ActivityDto changeStatus(UUID id, ActivityStatus newStatus) {
        ActivityEntity activity = getOrThrow(id);
        stateMachine.validate(activity.getStatus(), newStatus);
        activity.setStatus(newStatus);
        ActivityDto result = activityMapper.toDto(activityRepository.save(activity));
        auditLogService.log(null, AuditAction.UPDATE, "Activity", id.toString(), null,
                java.util.Map.of("status", newStatus.name()));
        return result;
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        ActivityEntity activity = getOrThrow(id);
        long relatedDocuments = documentRepository.findByActivityId(id, Pageable.unpaged()).getTotalElements();
        if (relatedDocuments > 0) {
            throw cl.somosbarrio.backend.exception.custom.ConflictException.hasRelated("actividad");
        }
        activityRepository.delete(activity);
        auditLogService.log(null, AuditAction.DELETE, "Activity", id.toString(), null, null);
    }

    private ActivityEntity getOrThrow(UUID id) {
        return activityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Actividad", id));
    }
}
