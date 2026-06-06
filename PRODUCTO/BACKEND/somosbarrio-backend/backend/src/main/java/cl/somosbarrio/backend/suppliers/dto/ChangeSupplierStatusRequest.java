package cl.somosbarrio.backend.suppliers.dto;

import cl.somosbarrio.backend.suppliers.entity.SupplierStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangeSupplierStatusRequest {

    @NotNull
    private SupplierStatus status;
}
