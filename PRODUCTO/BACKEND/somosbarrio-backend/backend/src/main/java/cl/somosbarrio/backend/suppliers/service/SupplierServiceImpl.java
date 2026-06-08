package cl.somosbarrio.backend.suppliers.service;

import cl.somosbarrio.backend.audit.entity.AuditAction;
import cl.somosbarrio.backend.audit.service.AuditLogService;
import cl.somosbarrio.backend.exception.ErrorCode;
import cl.somosbarrio.backend.exception.custom.ConflictException;
import cl.somosbarrio.backend.exception.custom.ResourceNotFoundException;
import cl.somosbarrio.backend.suppliers.dto.ChangeSupplierStatusRequest;
import cl.somosbarrio.backend.suppliers.dto.CreateSupplierRequest;
import cl.somosbarrio.backend.suppliers.dto.SupplierDto;
import cl.somosbarrio.backend.suppliers.dto.UpdateSupplierRequest;
import cl.somosbarrio.backend.suppliers.entity.SupplierEntity;
import cl.somosbarrio.backend.suppliers.entity.SupplierStatus;
import cl.somosbarrio.backend.suppliers.mapper.SupplierMapper;
import cl.somosbarrio.backend.suppliers.repository.SupplierRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public Page<SupplierDto> findAll(SupplierStatus status, String search, Pageable pageable) {
        Specification<SupplierEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (search != null && !search.isBlank()) {
                String term = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("nombreProveedor")), term),
                        cb.like(root.get("rutEmpresa"), "%" + search + "%")
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return supplierRepository.findAll(spec, pageable).map(supplierMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierDto findById(UUID id) {
        return supplierMapper.toDto(getOrThrow(id));
    }

    @Override
    @Transactional
    public SupplierDto create(CreateSupplierRequest request, UUID actorId) {
        if (supplierRepository.existsByRutEmpresa(request.getRutEmpresa())) {
            throw new ConflictException(ErrorCode.CONFLICT_DUPLICATE,
                    "Ya existe un proveedor con el RUT " + request.getRutEmpresa());
        }

        SupplierEntity supplier = new SupplierEntity();
        supplier.setNombreProveedor(request.getNombreProveedor());
        supplier.setRutEmpresa(request.getRutEmpresa());
        supplier.setEmailContacto(request.getEmailContacto());
        supplier.setTelefonoContacto(request.getTelefonoContacto());
        supplier.setDireccion(request.getDireccion());
        supplier.getGiros().addAll(request.getGiros());
        if (request.getIdLicitaciones() != null) {
            supplier.getIdLicitaciones().addAll(request.getIdLicitaciones());
        }
        if (request.getOrdenesCompra() != null) {
            supplier.getOrdenesCompra().addAll(request.getOrdenesCompra());
        }

        SupplierEntity saved = supplierRepository.save(supplier);
        auditLogService.log(actorId, AuditAction.CREATE, "Supplier", saved.getId().toString(), null, null);
        return supplierMapper.toDto(saved);
    }

    @Override
    @Transactional
    public SupplierDto update(UUID id, UpdateSupplierRequest request, UUID actorId) {
        SupplierEntity supplier = getOrThrow(id);

        if (!supplier.getRutEmpresa().equals(request.getRutEmpresa())
                && supplierRepository.existsByRutEmpresaAndIdNot(request.getRutEmpresa(), id)) {
            throw new ConflictException(ErrorCode.CONFLICT_DUPLICATE,
                    "Ya existe un proveedor con el RUT " + request.getRutEmpresa());
        }

        supplier.setNombreProveedor(request.getNombreProveedor());
        supplier.setRutEmpresa(request.getRutEmpresa());
        supplier.setEmailContacto(request.getEmailContacto());
        supplier.setTelefonoContacto(request.getTelefonoContacto());
        supplier.setDireccion(request.getDireccion());

        supplier.getGiros().clear();
        supplier.getGiros().addAll(request.getGiros());

        supplier.getIdLicitaciones().clear();
        if (request.getIdLicitaciones() != null) {
            supplier.getIdLicitaciones().addAll(request.getIdLicitaciones());
        }

        supplier.getOrdenesCompra().clear();
        if (request.getOrdenesCompra() != null) {
            supplier.getOrdenesCompra().addAll(request.getOrdenesCompra());
        }

        return supplierMapper.toDto(supplierRepository.save(supplier));
    }

    @Override
    @Transactional
    public SupplierDto changeStatus(UUID id, ChangeSupplierStatusRequest request) {
        SupplierEntity supplier = getOrThrow(id);
        SupplierStatus newStatus = request.getStatus();

        if (supplier.getStatus() == newStatus) {
            throw ConflictException.invalidStateTransition(
                    supplier.getStatus().name(), newStatus.name());
        }

        supplier.setStatus(newStatus);
        SupplierDto result = supplierMapper.toDto(supplierRepository.save(supplier));
        auditLogService.log(null, AuditAction.UPDATE, "Supplier", id.toString(), null,
                Map.of("status", newStatus.name()));
        return result;
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        SupplierEntity supplier = getOrThrow(id);

        if (supplier.getStatus() == SupplierStatus.SUSPENDIDO) {
            throw new ConflictException(ErrorCode.CONFLICT_STATE,
                    "No se puede eliminar un proveedor con estado SUSPENDIDO. Cambie el estado primero.");
        }

        supplierRepository.delete(supplier);
        auditLogService.log(null, AuditAction.DELETE, "Supplier", id.toString(), null, null);
    }

    private SupplierEntity getOrThrow(UUID id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor", id));
    }
}
