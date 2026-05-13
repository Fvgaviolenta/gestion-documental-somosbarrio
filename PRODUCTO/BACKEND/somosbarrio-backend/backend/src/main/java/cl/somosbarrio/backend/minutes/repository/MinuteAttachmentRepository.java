package cl.somosbarrio.backend.minutes.repository;

import cl.somosbarrio.backend.minutes.entity.MinuteAttachmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MinuteAttachmentRepository extends JpaRepository<MinuteAttachmentEntity, UUID> {

    List<MinuteAttachmentEntity> findByMinuteId(UUID minuteId);
}
