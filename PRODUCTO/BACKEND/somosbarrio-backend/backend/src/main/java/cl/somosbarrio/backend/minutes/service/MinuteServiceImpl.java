package cl.somosbarrio.backend.minutes.service;

import cl.somosbarrio.backend.audit.entity.AuditAction;
import cl.somosbarrio.backend.audit.service.AuditLogService;
import cl.somosbarrio.backend.activities.entity.ActivityEntity;
import cl.somosbarrio.backend.activities.repository.ActivityRepository;
import cl.somosbarrio.backend.auth.entity.UserEntity;
import cl.somosbarrio.backend.auth.repository.UserRepository;
import cl.somosbarrio.backend.exception.ErrorCode;
import cl.somosbarrio.backend.exception.custom.BusinessException;
import cl.somosbarrio.backend.exception.custom.ConflictException;
import cl.somosbarrio.backend.exception.custom.ResourceNotFoundException;
import cl.somosbarrio.backend.minutes.dto.*;
import cl.somosbarrio.backend.minutes.entity.MinuteEntity;
import cl.somosbarrio.backend.minutes.entity.MinuteStatus;
import cl.somosbarrio.backend.minutes.mapper.MinuteMapper;
import cl.somosbarrio.backend.minutes.repository.MinuteAttachmentRepository;
import cl.somosbarrio.backend.minutes.repository.MinuteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MinuteServiceImpl implements MinuteService {

    private final MinuteRepository minuteRepository;
    private final MinuteAttachmentRepository attachmentRepository;
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final MinuteMapper minuteMapper;
    private final MinuteStateMachine stateMachine;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public Page<MinuteDto> findAll(UUID activityId, MinuteStatus status, Pageable pageable) {
        Page<MinuteEntity> page;
        if (activityId != null && status != null) {
            page = minuteRepository.findByActivityIdAndStatus(activityId, status, pageable);
        } else if (activityId != null) {
            page = minuteRepository.findByActivityId(activityId, pageable);
        } else if (status != null) {
            page = minuteRepository.findByStatus(status, pageable);
        } else {
            page = minuteRepository.findAll(pageable);
        }
        return page.map(minuteMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public MinuteDto findById(UUID id) {
        MinuteEntity minute = getOrThrow(id);
        MinuteDto dto = minuteMapper.toDto(minute);
        List<MinuteAttachmentDto> attachments = attachmentRepository.findByMinuteId(id)
                .stream().map(minuteMapper::toAttachmentDto).toList();
        return MinuteDto.builder()
                .id(dto.getId())
                .activityId(dto.getActivityId())
                .activityTitle(dto.getActivityTitle())
                .title(dto.getTitle())
                .content(dto.getContent())
                .status(dto.getStatus())
                .statusLabel(dto.getStatusLabel())
                .authorId(dto.getAuthorId())
                .authorName(dto.getAuthorName())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .attachments(attachments)
                .build();
    }

    @Override
    @Transactional
    public MinuteDto create(CreateMinuteRequest request, UUID actorId) {
        ActivityEntity activity = activityRepository.findById(request.getActivityId())
                .orElseThrow(() -> new ResourceNotFoundException("Actividad", request.getActivityId()));

        if (minuteRepository.existsByActivityIdAndTitle(request.getActivityId(), request.getTitle())) {
            throw ConflictException.duplicateTitle("acta");
        }

        UserEntity author = userRepository.findById(actorId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", actorId));

        MinuteEntity minute = new MinuteEntity();
        minute.setActivity(activity);
        minute.setTitle(request.getTitle());
        minute.setContent(request.getContent());
        minute.setAuthor(author);

        MinuteEntity saved = minuteRepository.save(minute);
        auditLogService.log(actorId, AuditAction.CREATE, "Minute", saved.getId().toString(), null, null);
        return minuteMapper.toDto(saved);
    }

    @Override
    @Transactional
    public MinuteDto update(UUID id, UpdateMinuteRequest request, UUID actorId) {
        MinuteEntity minute = getOrThrow(id);

        if (minute.getStatus() != MinuteStatus.BORRADOR) {
            throw new ConflictException(ErrorCode.CONFLICT_STATE,
                    "Solo se pueden editar actas en estado BORRADOR");
        }

        if (!minute.getTitle().equals(request.getTitle()) &&
                minuteRepository.existsByActivityIdAndTitleAndIdNot(
                        minute.getActivity().getId(), request.getTitle(), id)) {
            throw ConflictException.duplicateTitle("acta");
        }

        minute.setTitle(request.getTitle());
        minute.setContent(request.getContent());

        return minuteMapper.toDto(minuteRepository.save(minute));
    }

    @Override
    @Transactional
    public MinuteDto changeStatus(UUID id, MinuteStatus newStatus,
                                   UUID actorId, Set<String> actorRoles) {
        MinuteEntity minute = getOrThrow(id);
        stateMachine.validate(minute.getStatus(), newStatus,
                actorId, minute.getAuthor().getId(), actorRoles);
        minute.setStatus(newStatus);
        MinuteDto result = minuteMapper.toDto(minuteRepository.save(minute));
        AuditAction auditAction = (newStatus == MinuteStatus.APROBADA) ? AuditAction.APPROVE : AuditAction.UPDATE;
        auditLogService.log(actorId, auditAction, "Minute", id.toString(), null,
                java.util.Map.of("status", newStatus.name()));
        return result;
    }

    @Override
    @Transactional
    public void delete(UUID id, UUID actorId, Set<String> actorRoles) {
        MinuteEntity minute = getOrThrow(id);

        if (minute.getStatus() != MinuteStatus.BORRADOR) {
            throw new ConflictException(ErrorCode.CONFLICT_STATE,
                    "Solo se pueden eliminar actas en estado BORRADOR");
        }

        boolean isAuthor = minute.getAuthor().getId().equals(actorId);
        boolean isAdmin  = actorRoles.contains("ADMINISTRADOR");
        if (!isAuthor && !isAdmin) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED,
                    "Solo el autor o un ADMINISTRADOR pueden eliminar el acta", HttpStatus.FORBIDDEN);
        }

        minuteRepository.delete(minute);
        auditLogService.log(actorId, AuditAction.DELETE, "Minute", id.toString(), null, null);
    }

    private MinuteEntity getOrThrow(UUID id) {
        return minuteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Acta", id));
    }
}
