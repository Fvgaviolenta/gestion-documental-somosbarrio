package cl.somosbarrio.backend.suppliers.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateSupplierRequest {

    @NotBlank
    @Size(max = 200)
    private String nombreProveedor;

    @NotBlank
    @Pattern(
        regexp = "^\\d{7,8}-[\\dKk]$",
        message = "RUT inválido. Formato esperado: 12345678-9 (sin puntos, con guión)"
    )
    private String rutEmpresa;

    @NotBlank
    @Email
    @Size(max = 255)
    private String emailContacto;

    @Size(max = 30)
    private String telefonoContacto;

    private String direccion;

    @NotEmpty(message = "Debe ingresar al menos un giro")
    private List<@NotBlank @Size(max = 200) String> giros;

    private List<@NotBlank @Size(max = 100) String> idLicitaciones;

    private List<@NotBlank @Size(max = 100) String> ordenesCompra;
}
