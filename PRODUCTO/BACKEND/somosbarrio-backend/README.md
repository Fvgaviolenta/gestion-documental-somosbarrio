# Somos Barrio Backend

Backend de la **Plataforma de Gestión Documental Somos Barrio** para la Subsecretaría de Prevención del Delito (Viña del Mar).

> Esta versión consolida el trabajo paralelo del equipo (alfonso + benja) tomando como base el repositorio funcional más avanzado y aplicando un baseline de calidad sobre él. Ver [docs/comparacion_backends.md](docs/comparacion_backends.md) para los detalles de la decisión.

## Stack

- Java 21 (Temurin)
- Spring Boot 3.5.x
- Maven 3.9+
- PostgreSQL 16+ (16 en Docker; probado también con 17/18)
- Flyway (migraciones)
- Spring Security + JWT
- springdoc-openapi (Swagger UI)
- JUnit 5 + Mockito + Testcontainers + JaCoCo (50% mín.)
- Logback con perfil `dev` legible y JSON estructurado en otros perfiles

## Setup local (primera vez)

### 1) Prerrequisitos

| Herramienta | Como verificar |
|---|---|
| JDK 21 Temurin | `java -version` |
| Maven 3.9+ (o `./mvnw`) | `./mvnw -v` |
| Docker Desktop con Compose | `docker compose version` |

### 2) Levantar todo con Docker Compose

```powershell
cd somosbarrio-backend
Copy-Item backend/.env.example .env -ErrorAction SilentlyContinue
docker compose up -d --build
```

Servicios:
- Backend Spring Boot en `http://localhost:8080`
- PostgreSQL en `localhost:5432` (volumen `db_data`)
- pgAdmin en `http://localhost:5050` (admin@admin.com / admin)

### 3) Alternativa sin Docker (Postgres nativo)

Tener un Postgres local con BD `somosbarrio` y usuario `somosbarrio_app`. Luego:

```powershell
cd backend
./mvnw spring-boot:run
```

## Endpoints útiles para validar

| URL | Que hace |
|---|---|
| `http://localhost:8080/actuator/health` | Healthcheck (debe responder `{"status":"UP"}` si la BD responde) |
| `http://localhost:8080/swagger-ui.html` | Documentación interactiva de la API |
| `http://localhost:8080/v3/api-docs` | OpenAPI 3 en JSON |

El health de correo está deshabilitado en Actuator porque no hay SMTP real hasta M6 (mailing).

## Auth M1 (roles simplificados)

Roles activos en este baseline:
- `ADMINISTRADOR`
- `COLABORADOR`

Usuarios seed (dev / test):
- `admin@somosbarrio.cl` / `Admin123!`
- `colaborador1@somosbarrio.cl` / `Admin123!`
- `colaborador2@somosbarrio.cl` / `Admin123!`

Endpoints principales:
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/change-password`
- `GET|POST|PUT|DELETE /api/v1/users` (solo `ADMINISTRADOR`)
- `GET|POST|PUT|PATCH|DELETE /api/v1/activities` (autenticado, mutaciones por rol)
- `GET|POST|PUT|DELETE /api/v1/document-templates` (mutaciones solo `ADMINISTRADOR`)
- `GET|POST|PUT|PATCH|DELETE /api/v1/documents` (estado por máquina)
- `GET|POST|PUT|PATCH|DELETE /api/v1/minutes` (actas)
- `POST /api/v1/documents/{id}/attachments` y `/api/v1/minutes/{id}/attachments`

Reglas de estados (idénticas para `documents` y `minutes`):
- BORRADOR → EN_REVISION: autor o ADMINISTRADOR.
- EN_REVISION → APROBADA: solo ADMINISTRADOR.
- EN_REVISION → RECHAZADA: solo ADMINISTRADOR (solo en documents).
- RECHAZADA → BORRADOR: autor o ADMINISTRADOR (solo en documents).
- APROBADA: terminal.

## Estructura de paquetes

```
cl.somosbarrio.backend
  BackendApplication             <- main
  security/                      <- SecurityConfig, JwtService, JwtAuthenticationFilter, JwtProperties
  exception/                     <- GlobalExceptionHandler, ApiError, ErrorCode + custom/
  common/
    audit/                       <- AuditableEntity, JpaAuditingConfig
    logging/                     <- CorrelationIdFilter (header X-Correlation-Id + MDC)
    pagination/                  <- PagedResponse
    storage/                     <- MimeValidator (Tika), FileStorageService
  auth/                          <- usuarios, roles, refresh tokens, login/refresh
  activities/                    <- actividades comunitarias
  documents/                     <- plantillas, documentos, adjuntos, máquina de estados
  minutes/                       <- actas
```

## Migraciones Flyway

Las migraciones viven en `backend/src/main/resources/db/migration/` con el patrón `V<n>__<descripcion>.sql`. Se aplican automáticamente al arrancar.

| Versión | Descripción |
|---|---|
| V1 | Crear extensión `pgcrypto` |
| V2 | Tablas auth (`roles`, `users`, `user_roles`, `refresh_tokens`) |
| V3 | Tabla `activities` |
| V4 | Tabla `document_templates` |
| V5 | Tablas `documents` y `document_attachments` |
| V6 | Tablas `recipient_groups` y `email_logs` (M6) |
| V7 | Tabla `audit_logs` (M8) |
| V8 | Función + triggers `updated_at` |
| V9 | Seed roles **ADMINISTRADOR / COLABORADOR** |
| V10 | Seed datos demo (1 admin + 2 colaboradores + 10 actividades) |
| V11 | Seed plantillas de documento |
| V12 | Tablas `minutes` y `minute_attachments` (faltaba en el baseline original) |
| V13 | Tabla `document_code_counters` para correlativos atómicos por tipo y año |

Documentación detallada del esquema vivo en [docs/database_schema.md](docs/database_schema.md).

## Comandos útiles

```powershell
# Compilar y ejecutar tests unitarios
./mvnw -DskipITs=false test

# Tests de integración con Testcontainers (requiere Docker)
./mvnw -DexcludedGroups= verify

# Solo correr (sin tests)
./mvnw spring-boot:run

# Saltar tests al empaquetar
./mvnw package -DskipTests

# Ver el estado de migraciones Flyway
./mvnw flyway:info
```

## Mapa de módulos

| Módulo | RF | Estado |
|---|---|---|
| M0 Setup | - | Completo |
| M1 Auth (RBAC simplificado) | RF-01 | Completo |
| M2 Activities | RF-02 | Completo |
| M3 Documents base (templates + crud + adjuntos) | RF-03 | Completo |
| M4 Documents completo (PDF + estados finos) | RF-03 | Parcial (estados sí, PDF pendiente) |
| M5 Repositorio + Búsqueda | RF-04 | Pendiente (filtros básicos sí) |
| M6 Mailing (SMTP + envío) | RF-05 | Solo tablas |
| M7 Reportes (Excel + PDF) | RF-06 | Pendiente |
| M8 Auditoría | RF-07 | Solo tabla |

## Trabajo paralelo entre desarrolladores

Ver [docs/comparacion_backends.md](docs/comparacion_backends.md) sección "Cómo trabajar en paralelo": ramas, división por dominio, stubs, Testcontainers en CI, OpenAPI como contrato y reglas de migraciones.
