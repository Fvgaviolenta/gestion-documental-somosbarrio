package cl.somosbarrio.backend.activities.repository;

import cl.somosbarrio.backend.activities.entity.ActivityEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface ActivityRepository extends JpaRepository<ActivityEntity, UUID>,
        JpaSpecificationExecutor<ActivityEntity> {
}
