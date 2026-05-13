# Schema de Base de Datos — Plataforma Somos Barrio

**Documento vivo.** Se actualiza en cada checkpoint del plan de desarrollo backend (M0–M8). Refleja el estado real de la BD `somosbarrio` incluyendo todas las migraciones Flyway aplicadas, los seeds y consultas útiles para inspeccionarla.

| Campo | Valor |
|---|---|
| Motor | PostgreSQL 16 (Docker oficial) — compatible con 17/18 |
| Base de datos | `somosbarrio` |
| Usuario aplicación | `somosbarrio_app` |
| Encoding | UTF8 |
| Schema | `public` |
| Migraciones gestionadas por | Flyway (carpeta `backend/src/main/resources/db/migration/`) |

---

## 1. Convenciones generales

| Convención | Detalle |
|---|---|
| Naming | `snake_case` en SQL, `camelCase` en Java |
| Primary keys | `UUID` con default `gen_random_uuid()` (extensión `pgcrypto`); excepciones: `roles` SMALLINT, `audit_logs` BIGSERIAL, `document_code_counters` PK compuesta |
| Timestamps | `created_at`, `updated_at` `TIMESTAMPTZ NOT NULL DEFAULT NOW()` mantenidos por trigger `fn_set_updated_at` |
| Soft-delete | Columna `deleted_at TIMESTAMPTZ NULL` en entidades que lo requieren (activities, documents, minutes); enforce con `@SQLRestriction` en JPA |
| Indices | Sobre FKs y campos de búsqueda frecuente |
| Constraints | `CHECK` para enums string en BD + validación en aplicación |
| Versionado optimista | `@Version` (`INTEGER`) en entidades editables concurrentemente |

---

## 2. Migraciones aplicadas

### V1 — Extensiones

`pgcrypto` para `gen_random_uuid()` y `crypt`/`gen_salt` (BCrypt en SQL).

### V2 — Auth

Tablas:
- `roles` (id `SMALLINT`, name unique)
- `users` (id UUID, email único, password_hash, first_name, last_name, is_active, failed_login_attempts, locked_until)
- `user_roles` (PK compuesta)
- `refresh_tokens` (id UUID, user_id, token_hash unique, jti unique, issued_at, expires_at, revoked)

### V3 — Activities

Tabla `activities` con estados (`PLANIFICADA/EN_CURSO/FINALIZADA/CANCELADA`), `created_by`, soft delete y versionado.

### V4 — Document templates

Tabla `document_templates` con `code` único, `document_type` (`ACTA/INFORME/OFICIO/MEMO/OTRO`), `fields_schema` JSONB.

### V5 — Documents y adjuntos

Tablas `documents` (con estados `BORRADOR/EN_REVISION/APROBADA/RECHAZADA`, soft delete, versionado, `field_values` JSONB) y `document_attachments` con CHECK de MIME y tamaño máximo 20 MB.

### V6 — Mailing

Tablas `recipient_groups` (lista de correos en JSONB) y `email_logs` (trazabilidad de envíos). Las preparamos en M3, se usan plenamente en M6.

### V7 — Audit logs

Tabla `audit_logs` con acciones (`CREATE/UPDATE/DELETE/APPROVE/REJECT/LOGIN/...`), `entity_type`, `entity_id`, `before_data`/`after_data` JSONB, `correlation_id`. La pueblan los handlers que se implementarán en M8.

### V8 — Triggers `updated_at`

Función `fn_set_updated_at` y triggers en `users`, `activities`, `document_templates`, `documents`. (V12 agrega el de `minutes`.)

### V9 — Seed roles (modelo simplificado)

```sql
INSERT INTO roles (id, name) VALUES
    (1, 'ADMINISTRADOR'),
    (2, 'COLABORADOR');
```

### V10 — Seed datos demo

- 1 administrador (`admin@somosbarrio.cl`)
- 2 colaboradores (`colaborador1@somosbarrio.cl`, `colaborador2@somosbarrio.cl`)
- 10 actividades demo distribuidas en distintos estados.
- Password único de desarrollo: `Admin123!` (BCrypt cost=10).

### V11 — Seed plantillas de documento

Plantillas con `fields_schema` (acta general, informe mensual, oficio).

### V12 — Tablas `minutes` y `minute_attachments`

Faltaban en el baseline original (las entidades JPA existían pero no la DDL). Incluye:
- Constraint `UNIQUE(activity_id, title)` para evitar duplicados.
- Trigger `updated_at` para `minutes`.
- CHECK de MIME y tamaño en attachments.

### V13 — Contador atómico de códigos de documento

```sql
CREATE TABLE document_code_counters (
    document_type VARCHAR(30) NOT NULL,
    year          INTEGER     NOT NULL,
    last_value    BIGINT      NOT NULL DEFAULT 0,
    PRIMARY KEY (document_type, year)
);
```

Reemplaza el cálculo basado en `count()` para correlativos `ACT-2026-0001` con seguridad ante concurrencia y aislamiento por año.

---

## 3. Consultas útiles para inspección

```sql
-- Estado de migraciones
SELECT * FROM flyway_schema_history ORDER BY installed_rank;

-- Roles y usuarios
SELECT u.email, r.name
FROM user_roles ur
JOIN users u ON u.id = ur.user_id
JOIN roles r ON r.id = ur.role_id
ORDER BY r.id, u.email;

-- Refresh tokens activos
SELECT user_id, expires_at FROM refresh_tokens WHERE revoked = FALSE ORDER BY issued_at DESC;

-- Próximo correlativo de un tipo
SELECT * FROM document_code_counters ORDER BY document_type, year;
```

---

## 4. Reset / borrón y cuenta nueva (solo dev)

Con Docker Compose:

```powershell
docker compose down -v
docker compose up -d --build
```

`-v` borra el volumen `db_data`. Al volver a arrancar, Flyway aplica todo desde V1.
