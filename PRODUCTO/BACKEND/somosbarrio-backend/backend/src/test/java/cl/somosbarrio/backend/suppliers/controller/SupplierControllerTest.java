package cl.somosbarrio.backend.suppliers.controller;

import cl.somosbarrio.backend.exception.GlobalExceptionHandler;
import cl.somosbarrio.backend.security.JwtAuthenticationFilter;
import cl.somosbarrio.backend.security.JwtService;
import cl.somosbarrio.backend.security.SecurityConfig;
import cl.somosbarrio.backend.suppliers.dto.SupplierDto;
import cl.somosbarrio.backend.suppliers.entity.SupplierStatus;
import cl.somosbarrio.backend.suppliers.service.SupplierService;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SupplierController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, GlobalExceptionHandler.class})
class SupplierControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private SupplierService supplierService;
    @MockitoBean private JwtService jwtService;

    private static final String TOKEN = "test-token";
    private static final String BEARER = "Bearer " + TOKEN;

    @BeforeEach
    void setUpJwt() {
        Claims claims = mock(Claims.class);
        when(claims.getSubject()).thenReturn(UUID.randomUUID().toString());
        when(claims.get("type", String.class)).thenReturn("access");
        when(claims.get("email", String.class)).thenReturn("admin@somosbarrio.cl");
        when(claims.get("roles", List.class)).thenReturn(List.of("ROLE_ADMINISTRADOR"));
        when(jwtService.validateToken(TOKEN)).thenReturn(claims);
    }

    @Test
    @DisplayName("GET /suppliers incluye idLicitaciones y ordenesCompra en cada ítem")
    void findAll_includesLicitacionesAndOrdenesCompra() throws Exception {
        UUID id = UUID.randomUUID();
        SupplierDto dto = SupplierDto.builder()
                .id(id)
                .nombreProveedor("Empresa de Prueba")
                .rutEmpresa("76134941-4")
                .emailContacto("empresa@deprueba.cl")
                .status(SupplierStatus.ACTIVO)
                .statusLabel("Activo")
                .giros(List.of("Giro de prueba"))
                .idLicitaciones(List.of("LIC-001", "LIC-002"))
                .ordenesCompra(List.of("OC-100"))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        when(supplierService.findAll(any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(dto)));

        mockMvc.perform(get("/api/v1/suppliers").header("Authorization", BEARER))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].idLicitaciones[0]").value("LIC-001"))
                .andExpect(jsonPath("$.content[0].idLicitaciones[1]").value("LIC-002"))
                .andExpect(jsonPath("$.content[0].ordenesCompra[0]").value("OC-100"));
    }
}
