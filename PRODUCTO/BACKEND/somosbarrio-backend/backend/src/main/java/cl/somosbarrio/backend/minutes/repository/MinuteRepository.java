package cl.somosbarrio.backend.minutes.repository;

import cl.somosbarrio.backend.minutes.entity.MinuteEntity;
import cl.somosbarrio.backend.minutes.entity.MinuteStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MinuteRepository extends JpaRepository<MinuteEntity, UUID> {

    Page<MinuteEntity> findByActivityId(UUID activityId, Pageable pageable);

    Page<MinuteEntity> findByStatus(MinuteStatus status, Pageable pageable);

    Page<MinuteEntity> findByActivityIdAndStatus(UUID activityId, MinuteStatus status, Pageable pageable);

    boolean existsByActivityIdAndTitle(UUID activityId, String title);

    boolean existsByActivityIdAndTitleAndIdNot(UUID activityId, String title, UUID id);
}
