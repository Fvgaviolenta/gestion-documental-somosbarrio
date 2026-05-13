package cl.somosbarrio.backend.auth.repository;

import cl.somosbarrio.backend.auth.entity.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<RoleEntity, Short> {

    Optional<RoleEntity> findByName(String name);
}
