package cl.somosbarrio.backend.suppliers.controller;

import cl.somosbarrio.backend.common.pagination.PagedResponse;
import cl.somosbarrio.backend.suppliers.dto.ChangeSupplierStatusRequest;
import cl.somosbarrio.backend.suppliers.dto.CreateSupplierRequest;
import cl.somosbarrio.backend.suppliers.dto.SupplierDto;
import cl.somosbarrio.backend.suppliers.dto.UpdateSupplierRequest;
import cl.somosbarrio.backend.suppliers.entity.SupplierStatus;
import cl.somosbarrio.backend.suppliers.service.SupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/suppliers")
@RequiredArgsConstructor
@Tag(name = "Suppliers", description = "Gestión de proveedores")
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    @Operation(summary = "Listar proveedores (paginado, filtros opcionales)")
    public ResponseEntity<PagedResponse<SupplierDto>> findAll(
            @RequestParam(required = false) SupplierStatus status,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(new PagedResponse<>(supplierService.findAll(status, search, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener proveedor por ID")
    public ResponseEntity<SupplierDto> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(supplierService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Crear proveedor (ADMINISTRADOR)")
    public ResponseEntity<SupplierDto> create(
            @Valid @RequestBody CreateSupplierRequest request,
            Authentication auth) {
        UUID actorId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierService.create(request, actorId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Actualizar proveedor (ADMINISTRADOR)")
    public ResponseEntity<SupplierDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSupplierRequest request,
            Authentication auth) {
        UUID actorId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(supplierService.update(id, request, actorId));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Cambiar estado del proveedor (ADMINISTRADOR)")
    public ResponseEntity<SupplierDto> changeStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ChangeSupplierStatusRequest request) {
        return ResponseEntity.ok(supplierService.changeStatus(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Eliminar proveedor (soft-delete, ADMINISTRADOR)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        supplierService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
