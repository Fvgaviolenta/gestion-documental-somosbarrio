package cl.somosbarrio.backend.suppliers.repository;

import cl.somosbarrio.backend.suppliers.entity.SupplierEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface SupplierRepository
        extends JpaRepository<SupplierEntity, UUID>, JpaSpecificationExecutor<SupplierEntity> {

    boolean existsByRutEmpresa(String rutEmpresa);

    boolean existsByRutEmpresaAndIdNot(String rutEmpresa, UUID id);
}
