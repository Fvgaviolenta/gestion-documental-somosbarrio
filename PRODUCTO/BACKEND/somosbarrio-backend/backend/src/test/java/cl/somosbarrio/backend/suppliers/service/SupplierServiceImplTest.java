package cl.somosbarrio.backend.suppliers.service;

import cl.somosbarrio.backend.audit.service.AuditLogService;
import cl.somosbarrio.backend.suppliers.dto.CreateSupplierRequest;
import cl.somosbarrio.backend.suppliers.dto.SupplierDto;
import cl.somosbarrio.backend.suppliers.dto.UpdateSupplierRequest;
import cl.somosbarrio.backend.suppliers.entity.SupplierEntity;
import cl.somosbarrio.backend.suppliers.mapper.SupplierMapper;
import cl.somosbarrio.backend.suppliers.repository.SupplierRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SupplierServiceImplTest {

    @Mock private SupplierRepository supplierRepository;
    @Mock private SupplierMapper supplierMapper;
    @Mock private AuditLogService auditLogService;

    private SupplierServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new SupplierServiceImpl(supplierRepository, supplierMapper, auditLogService);
    }

    @Test
    void create_deduplicatesCollectionValues() {
        CreateSupplierRequest request = new CreateSupplierRequest();
        request.setNombreProveedor("Proveedor");
        request.setRutEmpresa("76134941-4");
        request.setEmailContacto("test@example.com");
        request.setGiros(List.of("Giro A", "Giro A"));
        request.setIdLicitaciones(List.of("LIC-001", "LIC-001", "LIC-002"));
        request.setOrdenesCompra(List.of("OC-100", "OC-100"));

        when(supplierRepository.existsByRutEmpresa(request.getRutEmpresa())).thenReturn(false);
        when(supplierRepository.save(any(SupplierEntity.class)))
                .thenAnswer(invocation -> {
                    SupplierEntity entity = invocation.getArgument(0);
                    entity.setId(UUID.randomUUID());
                    return entity;
                });
        when(supplierMapper.toDto(any(SupplierEntity.class)))
                .thenReturn(SupplierDto.builder().build());

        service.create(request, UUID.randomUUID());

        ArgumentCaptor<SupplierEntity> captor = ArgumentCaptor.forClass(SupplierEntity.class);
        verify(supplierRepository).save(captor.capture());
        SupplierEntity saved = captor.getValue();

        assertThat(saved.getGiros()).containsExactly("Giro A");
        assertThat(saved.getIdLicitaciones()).containsExactly("LIC-001", "LIC-002");
        assertThat(saved.getOrdenesCompra()).containsExactly("OC-100");
    }

    @Test
    void update_deduplicatesCollectionValues() {
        UUID id = UUID.randomUUID();
        SupplierEntity existing = new SupplierEntity();
        existing.setId(id);
        existing.setRutEmpresa("76134941-4");

        UpdateSupplierRequest request = new UpdateSupplierRequest();
        request.setNombreProveedor("Proveedor");
        request.setRutEmpresa("76134941-4");
        request.setEmailContacto("test@example.com");
        request.setGiros(List.of("Giro B", "Giro B"));
        request.setIdLicitaciones(List.of("LIC-003", "LIC-003"));
        request.setOrdenesCompra(List.of("OC-200", "OC-201", "OC-200"));

        when(supplierRepository.findById(id)).thenReturn(Optional.of(existing));
        when(supplierRepository.save(any(SupplierEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(supplierMapper.toDto(any(SupplierEntity.class)))
                .thenReturn(SupplierDto.builder().build());

        service.update(id, request, UUID.randomUUID());

        ArgumentCaptor<SupplierEntity> captor = ArgumentCaptor.forClass(SupplierEntity.class);
        verify(supplierRepository).save(captor.capture());
        SupplierEntity saved = captor.getValue();

        assertThat(saved.getGiros()).containsExactly("Giro B");
        assertThat(saved.getIdLicitaciones()).containsExactly("LIC-003");
        assertThat(saved.getOrdenesCompra()).containsExactly("OC-200", "OC-201");
    }
}
