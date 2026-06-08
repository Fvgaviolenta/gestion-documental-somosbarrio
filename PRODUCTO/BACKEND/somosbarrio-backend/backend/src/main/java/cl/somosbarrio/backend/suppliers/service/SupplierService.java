package cl.somosbarrio.backend.suppliers.service;

import cl.somosbarrio.backend.suppliers.dto.ChangeSupplierStatusRequest;
import cl.somosbarrio.backend.suppliers.dto.CreateSupplierRequest;
import cl.somosbarrio.backend.suppliers.dto.SupplierDto;
import cl.somosbarrio.backend.suppliers.dto.UpdateSupplierRequest;
import cl.somosbarrio.backend.suppliers.entity.SupplierStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface SupplierService {

    Page<SupplierDto> findAll(SupplierStatus status, String search, Pageable pageable);

    SupplierDto findById(UUID id);

    SupplierDto create(CreateSupplierRequest request, UUID actorId);

    SupplierDto update(UUID id, UpdateSupplierRequest request, UUID actorId);

    SupplierDto changeStatus(UUID id, ChangeSupplierStatusRequest request);

    void delete(UUID id);
}
