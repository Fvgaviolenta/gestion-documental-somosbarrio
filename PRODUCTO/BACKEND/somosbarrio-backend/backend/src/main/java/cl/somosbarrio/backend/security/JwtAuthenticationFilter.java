package cl.somosbarrio.backend.security;

import cl.somosbarrio.backend.exception.ApiError;
import cl.somosbarrio.backend.exception.ErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        try {
            Claims claims = jwtService.validateToken(token);
            if (!"access".equals(claims.get("type", String.class))) {
                chain.doFilter(request, response);
                return;
            }

            String userId = claims.getSubject();
            String email = claims.get("email", String.class);

            @SuppressWarnings("unchecked")
            List<String> roles = claims.get("roles", List.class);
            List<SimpleGrantedAuthority> authorities = roles == null ? List.of() :
                    roles.stream().map(SimpleGrantedAuthority::new).toList();

            var auth = new UsernamePasswordAuthenticationToken(userId, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(auth);

            MDC.put("userId", userId);
            MDC.put("userEmail", email);
        } catch (ExpiredJwtException ex) {
            log.debug("JWT access token expired");
            writeApiError(response, request, HttpServletResponse.SC_UNAUTHORIZED,
                    ErrorCode.TOKEN_EXPIRED, "Token de acceso expirado");
            return;
        } catch (JwtException ex) {
            log.debug("JWT validation failed: {}", ex.getMessage());
        }

        chain.doFilter(request, response);
    }

    private void writeApiError(HttpServletResponse response, HttpServletRequest request,
                               int httpStatus, String code, String message) throws IOException {
        ApiError body = ApiError.builder()
                .code(code)
                .message(message)
                .timestamp(Instant.now())
                .path(request.getRequestURI())
                .build();
        response.setStatus(httpStatus);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), body);
    }
}
