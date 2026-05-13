package cl.somosbarrio.backend.activities.service;

import cl.somosbarrio.backend.activities.dto.ActivityDto;
import cl.somosbarrio.backend.activities.dto.CreateActivityRequest;
import cl.somosbarrio.backend.activities.entity.ActivityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ActivityService {

    Page<ActivityDto> findAll(ActivityStatus status, String territory, Pageable pageable);

    ActivityDto findById(UUID id);

    ActivityDto create(CreateActivityRequest request, UUID actorId);

    ActivityDto update(UUID id, CreateActivityRequest request, UUID actorId);

    ActivityDto changeStatus(UUID id, ActivityStatus newStatus);

    void delete(UUID id);
}
