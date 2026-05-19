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
Copy-Item .env.example .env -ErrorAction SilentlyContinue
docker compose up -d --build
```

Variables de Compose: archivo **`.env` en la raíz** de este repo (`DB_PASSWORD`, `JWT_SECRET`).  
Para `./mvnw spring-boot:run` sin Docker Java, usar `backend/.env` (ver `backend/.env.example`).

Servicios:
- Backend Spring Boot: **`http://localhost:8081`** (Compose mapea el puerto host **8081** → `8380` en el contenedor)
- PostgreSQL en `localhost:5432` (volumen `db_data`)
- pgAdmin en `http://localhost:5050` (admin@admin.com / admin)

### 3) Alternativa sin Docker para el backend

Tener Postgres local según datasource en `backend/src/main/resources/application.yml`. Arranque Maven:

```powershell
cd backend
./mvnw spring-boot:run
```

Puerto **`http://localhost:8380`** (definido en `application.yml`; es el mismo que escucha la app dentro de Docker antes del mapeo).

## Endpoints útiles para validar

| URL | Qué hace |
|---|---|
| `http://localhost:8081/actuator/health` (Compose) o `http://localhost:8380/actuator/health` (Maven) | Healthcheck (`{"status":"UP"}` si la BD responde) |
| `.../swagger-ui.html` | Documentación interactiva de la API |
| `.../v3/api-docs` | OpenAPI 3 en JSON |

La API REST usa el prefijo **`/api/v1`**. La integración paso a paso con Postman está en **[pruebas-backend.md](pruebas-backend.md)**.

En Actuator sigue configurado **`management.health.mail.enabled: false`**: eso solo desactiva el *health indicator* de mail; el **módulo de envío (M6)** sí está implementado en la aplicación — ver flujos de mailing en la guía anterior.

## Integración con frontend (SPA)

- **Base URL** que debe usar el SPA (Vite/local): Compose → `http://localhost:8081/api/v1`; Spring local → `http://localhost:8380/api/v1`.
- **CORS**: por defecto `APP_CORS_ORIGINS=http://localhost:5173` (ver variables en `docker-compose.yml` / `application.yml`).
- Si el SPA usa proxy de desarrollo, debe apuntar al backend en **8081** cuando corres Compose (no usar 8380 desde el navegador salvo que el front corra igualmente contra ese puerto).

Mapa de contrato frontend ↔ backend (qué pantalla debe consumir qué recurso):

- Ver [`../../FRONTEND/INTEGRACION_FRONTEND_BACKEND.md`](../../FRONTEND/INTEGRACION_FRONTEND_BACKEND.md)

## Auth M1 (roles simplificados)

Roles activos en este baseline:
- `ADMINISTRADOR`
- `COLABORADOR`

Usuarios seed (dev / test):
- `admin@somosbarrio.cl` / `Admin123!`
- `colaborador1@somosbarrio.cl` / `Admin123!`
- `colaborador2@somosbarrio.cl` / `Admin123!`

Endpoints principales (detalle completo en Swagger y en [pruebas-backend.md](pruebas-backend.md)):
- `POST /api/v1/auth/login`, `refresh`, `logout`; `GET /api/v1/auth/me`; `POST /api/v1/auth/change-password`
- `GET|POST|PUT|DELETE /api/v1/users` (mutaciones solo `ADMINISTRADOR`; **PUT por id** `/users/{id}`)
- `GET|POST|PUT|PATCH|DELETE /api/v1/activities`
- `GET|POST|PUT|DELETE /api/v1/document-templates` + `GET /document-templates/{id}`
- `GET|POST|PUT|PATCH|DELETE /api/v1/documents`; `PATCH .../submit-review`, `/approve`, `/reject`, `/reopen`; `GET .../{id}/pdf`; `POST .../{id}/preview-docx`; `POST .../{id}/send`; `GET .../{id}/email-logs`
- `GET /api/v1/repository/documents` (búsqueda repositorio)
- `GET|POST|PUT|PATCH /api/v1/recipient-groups`
- `GET|POST|PUT|PATCH|DELETE /api/v1/minutes` + adjuntos
- `GET /api/v1/reports/documents`, `GET /api/v1/reports/activities` (**solo ADMIN**)
- `GET /api/v1/audit-logs` (**solo ADMIN**)

Reglas de estados (idénticas para `documents` y `minutes` salvo donde se note):
- BORRADOR → EN_REVISION: autor o ADMINISTRADOR.
- EN_REVISION → APROBADA: solo ADMINISTRADOR.
- EN_REVISION → RECHAZADA: solo ADMINISTRADOR (**solo documents** tienen rechazo formal con motivo).
- RECHAZADA → BORRADOR: autor o ADMINISTRADOR (**documents** via `PATCH .../reopen`).
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
  documents/                     <- plantillas, documentos, adjuntos, máquina de estados, repositorio
  minutes/                       <- actas
  mailing/                       <- grupos destinatarios, envío SMTP, logs
  audit/                         <- API de auditoría
  reports/                       <- Excel
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
| V6 | Tablas `recipient_groups` y `email_logs` (M6 mailing) |
| V7 | Tabla `audit_logs` (M8) |
| V8 | Función + triggers `updated_at` |
| V9 | Seed roles **ADMINISTRADOR / COLABORADOR** |
| V10 | Seed datos demo (1 admin + 2 colaboradores + 10 actividades) |
| V11 | Seed plantillas de documento genéricas |
| V12 | Tablas `minutes` y `minute_attachments` |
| V13 | Tabla `document_code_counters` (correlativos por tipo y año) |
| V14 | `recipient_groups.updated_at` + trigger (AuditableEntity) |
| V15 | `document_templates.template_file_path` (.docx en `TEMPLATE_ROOT`) |
| V16 | Plantillas municipales **ACTA_MESA_COMUNITARIA** / **INFORME_TIPO** (.docx) |
| V17 | Actualización `fields_schema` acta/informe (placeholders/imágenes Word) |

Documentación detallada del esquema vivo en [docs/database_schema.md](docs/database_schema.md).

## Comandos útiles

```powershell
# Desde carpeta backend/
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
| M3 Documents base (templates + CRUD + adjuntos) | RF-03 | Completo |
| M4 Documents completo (PDF + LibreOffice/.docx + estados) | RF-03 | Completo (PDF al aprobar; preview docx en BORRADOR/EN_REVISION/RECHAZADA) |
| M5 Repositorio + Búsqueda | RF-04 | Completo (`GET /api/v1/repository/documents`) |
| M6 Mailing (SMTP + envío + grupos + logs) | RF-05 | Completo (`recipient-groups`, `POST .../send`, `email-logs`) |
| M7 Reportes (Excel admin) | RF-06 | Completo (`/reports/documents`, `/reports/activities`) |
| M8 Auditoría | RF-07 | Completo (`GET /api/v1/audit-logs`; persistencia desde servicios) |

## Trabajo paralelo entre desarrolladores

Ver [docs/comparacion_backends.md](docs/comparacion_backends.md) sección "Cómo trabajar en paralelo": ramas, división por dominio, stubs, Testcontainers en CI, OpenAPI como contrato y reglas de migraciones.
