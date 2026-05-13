package cl.somosbarrio.backend.mailing.repository;

import cl.somosbarrio.backend.mailing.entity.RecipientGroupEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RecipientGroupRepository extends JpaRepository<RecipientGroupEntity, UUID> {
    List<RecipientGroupEntity> findByIsActiveTrueOrderByNameAsc();
}
