package cl.somosbarrio.backend.suppliers.entity;

import cl.somosbarrio.backend.common.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "suppliers")
@SQLDelete(sql = "UPDATE suppliers SET deleted_at = NOW() WHERE id = ? AND version = ?")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
public class SupplierEntity extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "nombre_proveedor", nullable = false, length = 200)
    private String nombreProveedor;

    @Column(name = "rut_empresa", nullable = false, length = 12)
    private String rutEmpresa;

    @Column(name = "email_contacto", nullable = false, length = 255)
    private String emailContacto;

    @Column(name = "telefono_contacto", length = 30)
    private String telefonoContacto;

    @Column(columnDefinition = "TEXT")
    private String direccion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SupplierStatus status = SupplierStatus.ACTIVO;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "supplier_giros", joinColumns = @JoinColumn(name = "supplier_id"))
    @Column(name = "giro", nullable = false, length = 200)
    private List<String> giros = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "supplier_licitaciones", joinColumns = @JoinColumn(name = "supplier_id"))
    @Column(name = "id_licitacion", nullable = false, length = 100)
    private List<String> idLicitaciones = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "supplier_ordenes_compra", joinColumns = @JoinColumn(name = "supplier_id"))
    @Column(name = "orden_compra", nullable = false, length = 100)
    private List<String> ordenesCompra = new ArrayList<>();

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Version
    @Column(nullable = false)
    private int version = 0;
}
