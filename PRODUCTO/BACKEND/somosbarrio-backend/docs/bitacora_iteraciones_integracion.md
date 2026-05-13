# Bitácora de Iteraciones de Integración — Backend Somos Barrio

**Documento vivo.** Cada iteración (M0..M8) agrega una sección con: lo implementado, cómo validar, resultados de pruebas, bloqueos y decisiones.

---

## Cómo usar esta bitácora

Para cada cierre de módulo, agregar una sección con:

1. Objetivo del módulo
2. Cambios implementados
3. Pruebas ejecutadas (comando + endpoint + resultado esperado / observado)
4. Incidentes / bloqueos
5. Criterio de aprobación (Go / No-Go)
6. Pendientes para la siguiente iteración

---

## Iteración 1 — M0 (Setup base)

Fecha: 2026-04-28
Estado: **Completada**

Resumen: estructura inicial Spring Boot, Flyway con `V1__create_extensions.sql`, healthcheck y Swagger accesibles, perfil dev con Docker Compose (Postgres 16 + pgAdmin). El health de mail está deshabilitado en Actuator porque no hay SMTP real hasta M6.

---

## Iteración 2 — M1 (Auth + RBAC simplificado)

Fecha: 2026-04-29
Estado: **Completada**

### Objetivo

Auth + RBAC con 2 roles `ADMINISTRADOR` / `COLABORADOR`, JWT access+refresh, login/refresh/logout/cambio de contraseña y CRUD de usuarios solo para ADMINISTRADOR.

### Cambios

- Migraciones V2 (auth) y V9 (seed roles).
- JWT stateless con jti, refresh hasheado en BD, revocación al login/refresh/logout.
- Filtro `JwtAuthenticationFilter` + endpoints públicos mínimos.
- `@PreAuthorize` en CRUD de usuarios.

### Pruebas

`./mvnw test` — 9 tests Auth + 8 JwtService verdes.

---

## Iteración 3 — Baseline unificado (consolidación de trabajo paralelo)

Fecha: 2026-05-04
Estado: **Completada**

### Contexto

El equipo trabajó en paralelo dos backends: `somosbarrio-backend` (Alfonso) y `somosbarrio-backend` (Benjamín). Tras la comparación detallada en [comparacion_backends.md](comparacion_backends.md), se elige el repo de Benjamín como base por su mayor avance funcional (M2–M3 reales) y se ejecuta un re-trabajo dirigido para alinear el modelo a la decisión actual del cliente y mejorar calidad.

### Cambios aplicados (rama `chore/m1-baseline-rework`)

1. **Roles a 2** (`ADMINISTRADOR` / `COLABORADOR`):
   - V9 reescrito con los 2 roles definitivos.
   - V10 actualizado con 1 admin y 2 colaboradores.
   - Todos los `@PreAuthorize` y máquinas de estado actualizados.
   - Tests reescritos para reflejar las nuevas reglas.
2. **Migración V12**: tablas `minutes` y `minute_attachments` (faltaban en el baseline original; las entidades JPA estaban pero no la DDL).
3. **Reactivación del módulo `minutes`**: `BackendApplication` ya no excluye el paquete; ahora componentes y entidades de actas están en el contexto.
4. **GETs públicos cerrados**: actividades, plantillas, documentos y actas requieren autenticación. Solo quedan públicos `/auth/login`, `/auth/refresh`, `/actuator/health`, `/actuator/info` y la documentación Swagger.
5. **Manejo uniforme de 401 / 403** en `SecurityConfig` con `ApiError` consistente.
6. **`DocumentCodeGenerator` atómico** vía nueva tabla `document_code_counters` (V13) y `INSERT ... ON CONFLICT DO UPDATE RETURNING`. Resuelve concurrencia y permite correlativos por tipo y año (`ACT-2026-0001`).
7. **Aporte desde Repo A**:
   - `CorrelationIdFilter` con header `X-Correlation-Id` y MDC `correlationId` en logs.
   - `ErrorCode` extendido (códigos de auth, validación, mailing, etc.).
   - Manejo de `NoResourceFoundException` en `GlobalExceptionHandler` (favicon → 204, otros → 404 limpio).
   - `JwtProperties` tipadas via `@ConfigurationProperties(prefix = "app.jwt")`.
8. **Documentación viva** en `docs/`: README oficial, `database_schema.md`, `bitacora_iteraciones_integracion.md`, `comparacion_backends.md`, `glosario_de_documentos.md` y copia del `plan_de_implementacion.md`.
9. **Workflow CI** en `.github/workflows/backend-ci.yml` (build + tests unitarios; los IT con Testcontainers se corren al final con Docker disponible).

### Pruebas ejecutadas

```powershell
cd backend
./mvnw -DexcludedGroups=integration test
```

Resultado: **87 tests verdes, 0 fallos, 0 errores, 0 saltados**. Suites cubiertas:
- `JwtServiceTest` (8)
- `AuthServiceImplTest` (6) + `RefreshTokenServiceTest` (4) + `AuthControllerTest` (3)
- `ActivityServiceImplTest` (11) + `ActivityControllerTest` (9)
- `DocumentServiceImplTest` (13) + `DocumentTemplateServiceTest` (5) + `DocumentStateMachineTest` (14)
- `MinuteServiceImplTest` (6) + `MinuteStateMachineTest` (8)

### Pruebas pendientes (requieren Docker)

```powershell
docker compose up -d db
./mvnw -DexcludedGroups= verify
```

`Sprint1FlowIT` debería levantar Postgres con Testcontainers, aplicar Flyway V1–V13 (incluyendo V12 minutes), hacer login admin / colaborador y validar el ciclo BORRADOR → EN_REVISION → APROBADA con la regla "solo admin aprueba".

### Criterio de aprobación

- Tests unitarios verdes ✅
- Compilación limpia con todas las migraciones ✅
- Modelo de roles alineado al cliente ✅
- Endpoints sensibles cerrados a `authenticated` ✅
- Generador de códigos atómico ✅
- Documentación viva trasladada al repo unificado ✅

### Pendientes para la siguiente iteración

- Validar `Sprint1FlowIT` con Docker arriba.
- Decidir si `INFORME_TIPO`, `BITACORA_TERRENO` y flujo de `compras` requieren tipos específicos en el enum `DocumentType` (ahora se modelan con plantillas + tipos genéricos).
- Iniciar M4 (PDF) y M5 (búsqueda rica con Specifications en `documents`) en ramas paralelas según asignación en `comparacion_backends.md` §6.

---

## Plantilla reutilizable para futuras iteraciones

```md
## Iteración N — Mx (Nombre del módulo)

Fecha:
Estado: En progreso | Completada | Bloqueada

### Objetivo
### Cambios
### Pruebas ejecutadas
### Incidentes / bloqueos
### Criterio de aprobación
### Pendientes siguiente iteración
```
