# Integración Frontend ↔ Backend Somos Barrio

Contraste entre el cliente SPA ([`somosbarrio-frontend`](somosbarrio-frontend)) y la API REST de Spring Boot ([`somosbarrio-backend`](../BACKEND/somosbarrio-backend)), actualizado a **mayo 2026** (post PR #12 y correcciones de auth/actividades).

Complementa el análisis del cliente en [`ANALISIS_FRONTEND.md`](ANALISIS_FRONTEND.md).

**Contexto:** el **backend está completo** (~55 endpoints REST, Flyway V1–V17, módulos M0–M8 operativos). El **frontend consume casi todo el catálogo API** con pantallas admin y flujos colaborador; la integración estimada ronda **~90–92 %**.

**Referencias servidor:**

- Prefijo REST: `/api/v1`
- Swagger (Compose): `http://localhost:8081/swagger-ui.html` (host **8081** → contenedor **8380**)
- OpenAPI JSON: `/v3/api-docs`
- Pruebas manuales backend: [`../BACKEND/somosbarrio-backend/pruebas-backend.md`](../BACKEND/somosbarrio-backend/pruebas-backend.md)

```mermaid
flowchart LR
  subgraph frontend [Frontend :5173]
    Shell[AppLayout ProtectedRoute]
    Worker[/trabajador WorkerRoute]
  end
  subgraph integrated [Integrado]
    I1[auth 5 endpoints]
    I2[documentos mail workflow]
    I3[usuarios CRUD PUT]
    I4[actividades CRUD delete]
    I5[plantillas repo API audit reports]
    I6[actas admin y colaborador]
  end
  subgraph gap [Brechas menores]
    G1["/repository sin ruta en router"]
    G2[PATCH activity status sin UI]
    G3[env.example puerto 8080]
  end
  Shell --> integrated
  Worker --> integrated
  gap -.-> frontend
```

---

## 1. Resumen ejecutivo de integración

| Dimensión | Backend | Frontend |
|-----------|---------|----------|
| Endpoints REST | ~55 en 13 controladores | ~52 consumidos vía **12** archivos `*.api.ts` |
| Módulos | Auth, actividades, documentos, actas, plantillas, mailing, reportes, auditoría, repositorio | Cliente HTTP en todos; UI en casi todos |
| Cobertura estimada | — | **~90–92 %** catálogo API; flujos visibles **~92 %** |

### Corregido recientemente en el cliente

| Tema | Estado actual |
|------|----------------|
| `POST` alta actividad | [`CreateActivityPage`](somosbarrio-frontend/src/features/activities/pages/CreateActivityPage.tsx) usa `POST /activities` (sin doble `/api/v1`) |
| JWT expirado | Interceptor en [`axios.ts`](somosbarrio-frontend/src/shared/lib/axios.ts) reacciona a `TOKEN_EXPIRED`, `TOKEN_INVALID` y `AUTH_TOKEN_EXPIRED` |
| Sesión tras F5 | [`AuthBootstrap`](somosbarrio-frontend/src/app/AuthBootstrap.tsx) rehidrata Zustand y llama `refresh()` si hay refresh sin access |
| Guards | `ProtectedRoute` + `AdminRoute` + `WorkerRoute` activos |
| Perfil navegación | `SideNavBar` con `authStore.user`; `GET /auth/me` vía `syncUser` |

### Deuda técnica residual

1. ~~Repositorio sin ruta~~ — corregido: `/repository` registrado en [`router.tsx`](somosbarrio-frontend/src/app/router.tsx).
2. **`PATCH /activities/{id}/status`:** API + hook `useChangeActivityStatus` sin pantalla que lo use.
3. **`.env.example`:** `VITE_BACKEND_PROXY_TARGET=http://localhost:8080` vs Compose **8081** (fallback Vite sí usa **8081**).
4. **`logout`:** `localStorage.clear()` borra notas/borradores del trabajador.

---

## 2. Arquitectura de portales (nuevo modelo UX)

El SPA ofrece **dos shells** que comparten la misma API:

| Shell | Entrada login | Rutas | Rol típico |
|-------|---------------|-------|------------|
| **Portal institucional** | `/login` → `/` | `AppLayout` + `ProtectedRoute`: documentos, actividades, actas admin, `/mis-reportes`, `/mis-actas` (colaborador en shell moderno) | `ADMINISTRADOR` y también `COLABORADOR` si entra por `/login` |
| **Portal trabajador clásico** | `/trabajador/login` → `/trabajador` | `WorkerLayout` + `WorkerRoute`: bitácora, actas, notas locales | Solo `COLABORADOR` |

`AdminRoute` restringe: `/reports`, `/document-templates`, `/recipient-groups`, `/audit-logs`, `/users`.

Ruta comodín `*` → **`/login`** (no `/`).

---

## 3. Qué cumple hoy el frontend frente al backend

### 3.1 Autenticación (5/5 endpoints)

| Endpoint | UI / comportamiento |
|----------|---------------------|
| `POST /auth/login` | `/login`, `/trabajador/login` |
| `POST /auth/refresh` | `AuthBootstrap`, interceptor 401 |
| `POST /auth/logout` | SideNavBar / layouts |
| `GET /auth/me` | `syncUser`, `/account` |
| `POST /auth/change-password` | `/account` |

### 3.2 Actividades

| Endpoint | Estado integración |
|----------|-------------------|
| `GET /activities` | Listado, home, selects |
| `POST /activities` | Alta en `/activities/new` **OK** |
| `GET`, `PUT /activities/{id}` | Edición con React Query |
| `DELETE /activities/{id}` | Listado (admin) |
| `PATCH .../status` | **Sin UI** |

### 3.3 Documentos y mailing

- CRUD, workflow, adjuntos, PDF, preview-docx — completo.
- `POST /documents/{id}/send`, `GET .../email-logs` — [`DocumentMailPanel`](somosbarrio-frontend/src/features/mailing/components/DocumentMailPanel.tsx).

### 3.4 Plantillas, usuarios, reportes, auditoría

| Módulo | Endpoints | Pantalla |
|--------|-----------|----------|
| Plantillas | GET + CRUD | `/document-templates` (admin) |
| Usuarios | GET, POST, PUT, DELETE | `/users` (admin) |
| Reportes Excel | `/reports/documents`, `/reports/activities` | `/reports` (admin) |
| Auditoría | `GET /audit-logs` | `/audit-logs` (admin) |

### 3.5 Repositorio

| Capa | Estado |
|------|--------|
| Cliente + UI | [`RepositoryPage`](somosbarrio-frontend/src/features/repository/pages/RepositoryPage.tsx) en `/repository` |

### 3.6 Actas

| Ámbito | Rutas UI | API |
|--------|----------|-----|
| Admin | `/minutes`, `/minutes/:id` | list, detail, PUT, DELETE, status, adjuntos |
| Colaborador (shell moderno) | `/mis-actas` | mismos endpoints vía worker pages |
| Colaborador (shell clásico) | `/trabajador/actas` | creación + adjuntos + `EN_REVISION` |

### 3.7 Flujos colaborador (documentos como informe/bitácora)

- `/mis-reportes` o `/trabajador/reportes` → plantilla `INFORME_TIPO` (env).
- `/trabajador/bitacora` → plantilla bitácora (env).

---

## 4. Qué cumple el backend sin UI equivalente

| Ítem | Notas |
|------|-------|
| `PATCH /activities/{id}/status` | Solo servidor + cliente sin pantalla |
| `GET .../attachments` (listados aislados docs/actas) | Detalle trae adjuntos en DTO; funciones list no usadas en UI |
| `POST /minutes` desde admin | Sin `/minutes/new` institucional |
| Upload `.docx` plantillas | Diseño intencional: `templateFilePath` + `TEMPLATE_ROOT` |
| Notas trabajador | `localStorage` en `/trabajador/notas` |

---

## 5. Desajustes de contrato (actualizados)

| Tema | Estado | Acción si aplica |
|------|--------|------------------|
| Doble prefijo actividades | **Resuelto** | — |
| `TOKEN_EXPIRED` en interceptor | **Resuelto** | — |
| `AuthBootstrap` | **Activo** | — |
| Ruta `/repository` | **Roto** | Añadir ruta en `router.tsx` |
| Paginación `GET /users` | Front carga todo `content` | Opcional: query `page`/`size` |
| `enabled` vs `isActive` | Mapeado en `users.api.ts` | Mantener al editar |
| Proxy `.env.example` | **8080** vs Compose **8081** | Actualizar ejemplo |
| Logout | `localStorage.clear()` | Acotar claves `sb-*` |

---

## 6. Matriz de cobertura por módulo

| Módulo | Backend | UI | Integración |
|--------|---------|-----|-------------|
| Auth | 5 | 5 | ~98 % |
| Usuarios | CRUD | CRUD admin | ~95 % |
| Actividades | CRUD + status + DELETE | Falta PATCH status UI | ~90 % |
| Documentos + mail | Completo | Completo | ~98 % |
| Plantillas | CRUD | CRUD admin | ~90 % |
| Repositorio | GET búsqueda | `/repository` | ~90 % |
| Mailing grupos | CRUD | `/recipient-groups` | ~95 % |
| Actas | CRUD + adjuntos | Admin + worker + `/mis-actas` | ~85 % |
| Reportes | 2 Excel | Admin ambos | ~100 % |
| Auditoría | GET | `/audit-logs` | ~95 % |

---

## 7. Roadmap residual

1. UI cambio de estado actividad (`PATCH /status`) para admin.
3. Alinear **`.env.example`** a puerto **8081**.
4. Logout sin borrar notas/borradores locales.
5. (Producto) upload `.docx` o API notas trabajador.

---

## 8. Auditoría endpoint → UI

| Recurso `/api/v1` | Cliente | Pantalla |
|-------------------|---------|----------|
| Auth (5) | Sí | Sí |
| Users CRUD | Sí | Sí |
| Activities GET/POST/PUT/DELETE | Sí | Sí |
| Activities PATCH status | Sí | **No** |
| Documentos + adjuntos + workflow + pdf + preview | Sí | Sí |
| send + email-logs | Sí | Sí |
| Plantillas CRUD | Sí | Sí |
| Repositorio GET | Sí | Sí (`/repository`) |
| Reports (2) | Sí | Sí (admin) |
| Minutes | Sí | Sí |
| Recipient-groups | Sí | Sí |
| Audit-logs | Sí | Sí |

---

## 9. Referencias

| Documento | Ruta |
|-----------|------|
| Análisis frontend | [`ANALISIS_FRONTEND.md`](ANALISIS_FRONTEND.md) |
| **Guía pruebas integración (E2E local)** | [`GUIA_PRUEBAS_INTEGRACION.md`](GUIA_PRUEBAS_INTEGRACION.md) |
| Pruebas backend Postman | [`../BACKEND/somosbarrio-backend/pruebas-backend.md`](../BACKEND/somosbarrio-backend/pruebas-backend.md) |
| README backend | [`../BACKEND/somosbarrio-backend/README.md`](../BACKEND/somosbarrio-backend/README.md) |
| Esquema BD | [`../BACKEND/somosbarrio-backend/docs/database_schema.md`](../BACKEND/somosbarrio-backend/docs/database_schema.md) |

**Fuente normativa en runtime:** `/v3/api-docs` y Swagger UI con backend levantado.
