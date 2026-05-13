package cl.somosbarrio.backend.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties tipadas para JWT bajo prefijo {@code app.jwt}.
 *
 * <p>Provee una alternativa con tipado fuerte a los {@code @Value} dispersos en
 * {@link JwtService}; el servicio sigue funcionando con {@code @Value} para
 * compatibilidad, pero estas properties estan disponibles para futuros refactors
 * y para componentes que quieran inyectar la configuracion completa.</p>
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    /** Clave HMAC. Minimo 32 bytes UTF-8. */
    private String secret;

    /** Tiempo de vida del access token, en minutos. */
    private long accessTtlMin = 15;

    /** Tiempo de vida del refresh token, en dias. */
    private long refreshTtlDays = 7;

    /** Issuer publicado en el claim {@code iss}. */
    private String issuer = "somosbarrio-backend";
}
