package cl.somosbarrio.backend.minutes.service;

import cl.somosbarrio.backend.minutes.dto.*;
import cl.somosbarrio.backend.minutes.entity.MinuteStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Set;
import java.util.UUID;

public interface MinuteService {

    Page<MinuteDto> findAll(UUID activityId, MinuteStatus status, Pageable pageable);

    MinuteDto findById(UUID id);

    MinuteDto create(CreateMinuteRequest request, UUID actorId);

    MinuteDto update(UUID id, UpdateMinuteRequest request, UUID actorId);

    MinuteDto changeStatus(UUID id, MinuteStatus newStatus, UUID actorId, Set<String> actorRoles);

    void delete(UUID id, UUID actorId, Set<String> actorRoles);
}
