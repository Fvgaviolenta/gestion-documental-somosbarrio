# Pruebas del backend Somos Barrio

Guía para validar manualmente los flujos alineados con [`../../FRONTEND/INTEGRACION_FRONTEND_BACKEND.md`](../../FRONTEND/INTEGRACION_FRONTEND_BACKEND.md) (§2–§5) usando **Swagger**, **curl** u **Postman**, sin depender del SPA.

## 1. Prerrequisitos

| Requisito | Notas |
|---|---|
| JDK 21 | Temurin u otra distribución compatible |
| Maven 3.9+ | En `backend/` usar `./mvnw` si no tienes Maven global |
| Docker + Compose | Para stack completo (Postgres + backend + volumen uploads) |

## 2. Arranque

### 2.1 Docker Compose (recomendado)

Desde **la raíz de este repo** (`somosbarrio-backend/`):

```powershell
Copy-Item backend/.env.example .env -ErrorAction SilentlyContinue
docker compose up -d --build
```

| Entorno | Base URL REST |
|---|---|
| Navegador / Postman (host Windows) | `http://localhost:8081/api/v1` |

El compose mapea `8081` (host) → `8380` (contenedor). Dentro del contenedor el servidor usa el puerto **8380**.

### 2.2 Backend solo con Maven (Postgres ya corriendo)

```powershell
cd backend
./mvnw spring-boot:run
```

| Entorno | Base URL REST |
|---|---|
| Local | `http://localhost:8380/api/v1` |

Configura `DB_HOST`, `DB_NAME`, usuario y contraseña según tu Postgres (variables en `application.yml`).

## 3. Verificación post-arranque

1. **Health**: `GET {host}/actuator/health` → `{"status":"UP"}` cuando la BD responde (`host` = `localhost:8081` o `:8380`).
2. **Swagger UI**: `{host}/swagger-ui.html`.
3. **OpenAPI JSON**: `{host}/v3/api-docs`.
4. **Flyway**: al arrancar sin errores, las migraciones **V1–V17** quedan aplicadas. Para inspeccionar desde Maven: `./mvnw flyway:info` (con datasource configurado).

## 4. Credenciales seed (V10)

Todos con contraseña **`Admin123!`**:

| Email | Rol útil para pruebas |
|---|---|
| `admin@somosbarrio.cl` | `ADMINISTRADOR` |
| `colaborador1@somosbarrio.cl` | `COLABORADOR` |
| `colaborador2@somosbarrio.cl` | `COLABORADOR` |

## 5. Datos seed útiles para integración

### 5.1 Usuarios fijos

IDs en tabla `users` (V10):

- Admin: `00000000-0000-0000-0000-000000000001`
- Colaborador 1: `00000000-0000-0000-0000-000000000002`

### 5.2 Actividades demo (V10)

Hay **10** actividades; ejemplo usada con frecuencia en E2E / front:

| ID | Título corto |
|---|---|
| `10000000-0000-0000-0000-000000000005` | Operativo Iluminación (`PLANIFICADA`) |

Si el SPA usa un `FALLBACK_ACTIVITY_ID` y la lista está vacía, el problema suele estar en el cliente o en BD sin migraciones; con Flyway hasta V17 los datos anteriores existen.

### 5.3 Plantillas institucionales (V16 + V17)

Tras **V16** las plantillas genéricas `ACTA_GENERAL` e `INFORME_MENSUAL` quedan **inactivas**; las activas para trabajo municipal típico son:

| Código | UUID plantilla (`document_templates.id`) | `document_type` |
|---|---|---|
| `ACTA_MESA_COMUNITARIA` | `b0000000-0000-0000-0000-000000000011` | `ACTA` |
| `INFORME_TIPO` | `b0000000-0000-0000-0000-000000000012` | `INFORME` |

Archivos `.docx` relativos (`template_file_path`): `ACTA_MESA_COMUNITARIA_TEMPLATE.docx`, `INFORME_TEMPLATE.docx` bajo **`TEMPLATE_ROOT`** (en Compose: `./templates` montado en `/app/templates`).

V11 incluye también plantillas legacy con IDs `a0000000-0000-0000-0000-000000000001`, etc.; algunas pueden no estar activas según seeds posteriores.

## 6. Configuración Postman

Variables de colección sugeridas:

| Variable | Ejemplo Compose | Ejemplo Maven local |
|---|---|---|
| `baseUrl` | `http://localhost:8081/api/v1` | `http://localhost:8380/api/v1` |
| `accessToken` | (vacía; Tests del login la rellenan) | igual |
| `refreshToken` | (opcional) | igual |

**Cabeceras comunes**:

- `Authorization: Bearer {{accessToken}}` en rutas protegidas.
- `Content-Type: application/json` para cuerpos JSON (excepto multipart).
- Opcional: `X-Correlation-Id: <uuid>` para trazar logs.

**Scripts “Tests” en `POST …/auth/login`** (adaptar rutas):

```javascript
var json = pm.response.json();
pm.collectionVariables.set("accessToken", json.accessToken);
pm.collectionVariables.set("refreshToken", json.refreshToken);
```

## 7. Catálogo de endpoints §3 INTEGRACION (referencia rápida)

Todos bajo **`/api/v1`** (omitido en la primera columna para brevedad):

| Área | Métodos y ruta |
|---|---|
| Auth | `POST /auth/login`, `/auth/refresh`, `/auth/logout`; `GET /auth/me`; `POST /auth/change-password` |
| Usuarios (ADMIN) | `GET|POST /users`; `PUT|DELETE /users/{id}` |
| Actividades | `GET|POST /activities`; `PUT /activities/{id}`; `PATCH /activities/{id}/status`; `DELETE /activities/{id}` |
| Plantillas | `GET|POST|PUT|DELETE /document-templates`; `GET /document-templates/{id}` |
| Documentos | `GET|POST /documents`; `GET /documents/{id}`; `PUT /documents/{id}`; `DELETE /documents/{id}`; `PATCH …/submit-review`, `/approve`, `/reject`, `/reopen`; `GET …/{id}/pdf`; `POST …/{id}/preview-docx`; adjuntos Multipart `POST /documents/{id}/attachments`, `GET …/attachments`, `DELETE …/attachments/{attId}` |
| Repositorio | `GET /repository/documents` (+ query params filtros/paginación) |
| Mailing | `GET|POST|PUT|PATCH /recipient-groups`; `POST /documents/{id}/send`; `GET /documents/{id}/email-logs` |
| Actas | `GET|POST|PUT|PATCH|DELETE /minutes`; adjuntos `/minutes/{id}/attachments` |
| Reportes (ADMIN) | `GET /reports/documents?from=&to=`; `GET /reports/activities?year=&month=` |
| Auditoría (ADMIN) | `GET /audit-logs` |

## 8. Flujos Postman / manual (F1–F12)

En cada flujo, `{{baseUrl}}` debe apuntar al entorno §2.

### F1 — Auth completo (§3.1)

| Paso | Request | Body JSON ejemplo |
|---|---|---|
| Login | `POST {{baseUrl}}/auth/login` | `{"email":"admin@somosbarrio.cl","password":"Admin123!"}` |
| Perfil | `GET {{baseUrl}}/auth/me` | Header Bearer |
| Cambio clave | `POST {{baseUrl}}/auth/change-password` | `{"currentPassword":"Admin123!","newPassword":"Admin123!"}` *(o nueva válida ≥8 caracteres)* |
| Refresh | `POST {{baseUrl}}/auth/refresh` | `{"refreshToken":"<refresh del login>"}` |
| Logout | `POST {{baseUrl}}/auth/logout` | `{"refreshToken":"<refresh válido>"}` |

**Esperado**: `200` en login/me/refresh; `204` en change-password/logout cuando aplica.

### F2 — Usuarios CRUD (§3.2 + §2.5 lista admin)

| Paso | Request | Notas |
|---|---|---|
| Listar | `GET {{baseUrl}}/users?page=0&size=20` | Solo **ADMIN**. Paginación Spring → ver §10. |
| Crear | `POST {{baseUrl}}/users` | Body ver ejemplo abajo. |
| Actualizar | `PUT {{baseUrl}}/users/{id}` | `UpdateUserRequest`. |
| Desactivar | `DELETE {{baseUrl}}/users/{id}` | Soft delete |

**Ejemplo `POST /users`**:

```json
{
  "email": "nuevo.user@somosbarrio.cl",
  "password": "Admin123!",
  "firstName": "Nuevo",
  "lastName": "Usuario",
  "roles": ["COLABORADOR"]
}
```

**Ejemplo `PUT /users/{id}`**:

```json
{
  "firstName": "Nuevo",
  "lastName": "Nombre",
  "roles": ["COLABORADOR"],
  "isActive": true
}
```

### F3 — Actividades (§3.6 + §2.2)

| Paso | Request | Ejemplo |
|---|---|---|
| Listar | `GET {{baseUrl}}/activities` | Paginación opcional |
| Crear | `POST {{baseUrl}}/activities` | `{"title":"Taller QA","description":"Opcional","territory":"Viña Centro","startDate":"2026-06-01","endDate":"2026-06-02"}` |
| Actualizar | `PUT {{baseUrl}}/activities/{id}` | mismo shape |
| Estado | `PATCH {{baseUrl}}/activities/{id}/status` | `{"status":"EN_CURSO"}` *(valores válidos según modelo)* |
| Borrar | `DELETE {{baseUrl}}/activities/{id}` | Según rol/reglas |

### F4 — Plantillas admin

| Paso | Request | Notas |
|---|---|---|
| Listar | `GET {{baseUrl}}/document-templates` | |
| Una plantilla | `GET {{baseUrl}}/document-templates/b0000000-0000-0000-0000-000000000012` | `INFORME_TIPO` |
| Crear | `POST {{baseUrl}}/document-templates` | `CreateDocumentTemplateRequest` |
| Actualizar | `PUT {{baseUrl}}/document-templates/{id}` | |
| Borrar | `DELETE {{baseUrl}}/document-templates/{id}` | ADMIN |

**Ejemplo mínimo `POST`**:

```json
{
  "code": "TMP_QA_POSTMAN",
  "name": "Template QA",
  "documentType": "INFORME",
  "description": "Solo pruebas",
  "fieldsSchema": "{\"fields\":[]}",
  "templateFilePath": null
}
```

### F5 — Documentos E2E (§2.3)

Ideal con token de **COLABORADOR** para crear y **ADMIN** para aprobar.

1. `POST {{baseUrl}}/documents` — crear borrador:

```json
{
  "templateId": "b0000000-0000-0000-0000-000000000012",
  "activityId": "10000000-0000-0000-0000-000000000005",
  "title": "Informe QA Postman",
  "fieldValues": "{}"
}
```

2. Adjunto opcional — `POST {{baseUrl}}/documents/{id}/attachments` tipo **multipart/form-data**, campo archivo `file`.

3. `POST {{baseUrl}}/documents/{id}/preview-docx` — genera vista previa (estados permitidos por negocio).

4. `PATCH {{baseUrl}}/documents/{id}/submit-review`.

5. Con **ADMIN**, `PATCH {{baseUrl}}/documents/{id}/approve`.

6. `GET {{baseUrl}}/documents/{id}/pdf` — debe devolver PDF si el pipeline LibreOffice funcionó.

**Notas**: En Docker debe existir LibreOffice configurado (`LIBREOFFICE_PATH`). Sin matrices en `TEMPLATE_ROOT` o sin LibreOffice, los pasos Word/PDF pueden fallar con errores esperados (`FILE_STORAGE_ERROR`, `CONFLICT_*`, etc.).

### F6 — Rechazo y reapertura (documents)

1. Documento en `EN_REVISION` (como en F5 hasta submit-review).

2. `PATCH {{baseUrl}}/documents/{id}/reject` (ADMIN), body:

```json
{"rejectionReason":"Motivo de rechazo suficientemente largo para validación"}
```

3. Opcionalmente `PATCH {{baseUrl}}/documents/{id}/reopen`.

### F7 — Repositorio (§3.3)

`GET {{baseUrl}}/repository/documents?page=0&size=10`

Query params opcionales: `q`, `type` (`ACTA`|`INFORME`|…), `status`, `from`, `to`, `authorId`, `activityId`, `code`, `belongsToMe` (según Swagger).

Respuesta paginada: ver §10 (`PagedResponse`).

### F8 — Actas E2E (§3.5 + similar §2.7 minutos)

1. Obtener `activityId` válido.

2. `POST {{baseUrl}}/minutes`:

```json
{
  "activityId": "10000000-0000-0000-0000-000000000005",
  "title": "Acta QA",
  "content": "Contenido inicial"
}
```

3. Adjunto opcional Multipart — `POST {{baseUrl}}/minutes/{minuteId}/attachments`.

4. `PATCH {{baseUrl}}/minutes/{minuteId}/status` con `{"status":"EN_REVISION"}`, luego `{"status":"APROBADA"}` con ADMIN.

5. CRUD complementario — `GET|PUT|DELETE /minutes/{id}` según reglas de estado.

### F9 — Mailing

| Paso | Request | Ejemplo body |
|---|---|---|
| Listar grupos | `GET {{baseUrl}}/recipient-groups` | |
| Crear grupo | `POST {{baseUrl}}/recipient-groups` | `{"name":"Vecinos norte","description":"QA","emails":["a@ejemplo.cl"]}` *(ADMIN)* |
| Enviar | `POST {{baseUrl}}/documents/{aprobadoId}/send` | `{"recipientGroupId":null,"additionalEmails":["test@ejemplo.cl"],"subject":"Asunto","body":"Texto opcional"}` |
| Logs | `GET {{baseUrl}}/documents/{aprobadoId}/email-logs` | |

Sin credenciales SMTP válidas suele obtenerse error de negocio (`EMAIL_DELIVERY_FAILED` / 5xx según configuración).

### F10 — Reportes Excel

Solo **ADMIN**:

- `GET {{baseUrl}}/reports/documents?from=2026-01-01&to=2026-12-31`
- `GET {{baseUrl}}/reports/activities?year=2026&month=5`

Respuesta: binario `.xlsx` (`Content-Disposition` attachment).

### F11 — Auditoría

`GET {{baseUrl}}/audit-logs?page=0&size=20` (**ADMIN**) con filtros opcionales `entityType`, `entityId`, `userId`, `action`.

### F12 — Casos negativos

| Caso | Cómo probar |
|---|---|
| 401 sin Bearer | `GET {{baseUrl}}/auth/me` sin header → `TOKEN_INVALID`, mensaje típico *No autenticado* |
| 401 JWT access expirado | Header `Bearer <token expirado>` en ruta protegida → código **`TOKEN_EXPIRED`** *(desde filtros JWT para access caducado)* |
| Malformed / firma incorrecta | Sigue cayendo como no autenticado → entrada genérica **`TOKEN_INVALID`** *(sin autenticación previa)* |
| 403 rol | Endpoint solo ADMIN como COLABORADOR → código **`ACCESS_DENIED`** |

## 9. Contrato para consumidores SPA (paginación, usuarios, JWT)

### Paginación

El backend envuelve la página Spring en `PagedResponse`:

```json
{
  "content": [ ... ],
  "totalElements": 42,
  "totalPages": 3,
  "number": 0,
  "size": 20
}
```

- **`number`**: página actual (**0-based**), no usar el nombre `page` en JSON (Spring lo recibe solo como query).

### Usuario (`UserDto`)

Incluye boolean **`isActive`** (entre otros campos como `roles`, `email`).

### Códigos de error JWT (§5 doc integración)

En `401`/`403` típicamente recibes **`ApiError`** serializado así:

```json
{
  "code": "TOKEN_INVALID",
  "message": "...",
  "timestamp": "...",
  "path": "/api/v1/auth/me",
  "details": null
}
```

**Importante**:

- Esta API usa los códigos definidos en `ErrorCode` — por ejemplo **`TOKEN_EXPIRED`** y **`TOKEN_INVALID`**.
- No existe **`AUTH_TOKEN_EXPIRED`**. Si el SPA busca ese string, debe alinearse al backend (**`TOKEN_EXPIRED`**).

Cuando hay **Bearer** presente pero el JWT de **acceso** está **caducado**, el filtro responde **`401`** con `code`: **`TOKEN_EXPIRED`**. Otros errores típicos: refresh inválido → `TOKEN_REVOKED` / `TOKEN_INVALID` según lógica de `AuthService` (ver Swagger y tests).

### Puertos y CORS resumen

| Modo | Origen SPA típico | API base |
|---|---|---|
| Compose | `http://localhost:5173` | `http://localhost:8081/api/v1` |
| Maven solo | igual | `http://localhost:8380/api/v1` |

Variables relevantes Compose (ver `.env.example` / `docker-compose.yml`): `JWT_SECRET` (≥ 32 caracteres UTF-8), `APP_CORS_ORIGINS=http://localhost:5173`.

## 10. Variables de entorno (matriz resumida)

| Variable | Ejemplo Compose | Rol |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `dev` | Perfil Spring |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | `db`, `5432`, … | Postgres |
| `JWT_SECRET` | ver `docker-compose.yml` | Firma JWT (obligatorio sólido) |
| `JWT_ACCESS_TTL_MIN` | `15` | TTL access |
| `JWT_REFRESH_TTL_DAYS` | `7` | TTL refresh |
| `APP_CORS_ORIGINS` | `http://localhost:5173` | CORS |
| `UPLOAD_ROOT` | `/app/uploads` | Disco adjuntos |
| `TEMPLATE_ROOT` | `/app/templates` | Matrices Word `.docx` |
| `LIBREOFFICE_PATH` | `/usr/bin/soffice` | PDF / merge |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` | opcional local | SMTP real |

## 11. Tests automatizados

```powershell
cd backend
./mvnw -DskipITs=false test
./mvnw -DexcludedGroups= verify
```

- **Integración ejemplo**: [`backend/src/test/java/cl/somosbarrio/backend/e2e/Sprint1FlowIT.java`](backend/src/test/java/cl/somosbarrio/backend/e2e/Sprint1FlowIT.java).  
- Flujos adicionales: `DocumentWordTemplatesFlowIT` y otros IT con Testcontainers (requieren Docker).

## 12. Notas operativas

- **SMTP**: sin credenciales válidas los envíos fallan por diseño; útil confirmar errores esperados para no confundirlos con bugs de código.
- **LibreOffice + plantillas `.docx`**: en Compose el backend incluye la herramienta; igual puede fallar si falta archivo bajo `TEMPLATE_ROOT` o permisos de volumen (`uploads_data`).
- **Mailing actuator**: puede estar **`management.health.mail.enabled: false`**; eso solo oculta el health de SMTP en `/actuator/health`.

---

Última alineación: migraciones hasta **V17**, Compose **localhost:8081**, Spring local **8380**.
