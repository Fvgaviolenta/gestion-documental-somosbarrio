package cl.somosbarrio.backend.suppliers.dto;

import cl.somosbarrio.backend.suppliers.entity.SupplierStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class SupplierDto {

    private UUID id;
    private String nombreProveedor;
    private String rutEmpresa;
    private String emailContacto;
    private String telefonoContacto;
    private String direccion;
    private SupplierStatus status;
    private String statusLabel;
    private List<String> giros;
    private List<String> idLicitaciones;
    private List<String> ordenesCompra;
    private Instant createdAt;
    private Instant updatedAt;
}
