# Guía de pruebas de integración (Frontend + Backend + PostgreSQL)

Pasos para levantar **los tres componentes** en local y comprobar que el SPA consume bien la API. Complementa:

- API solo (Postman): [`../BACKEND/somosbarrio-backend/pruebas-backend.md`](../BACKEND/somosbarrio-backend/pruebas-backend.md)
- Mapa de contrato: [`INTEGRACION_FRONTEND_BACKEND.md`](INTEGRACION_FRONTEND_BACKEND.md)
- Análisis del cliente: [`ANALISIS_FRONTEND.md`](ANALISIS_FRONTEND.md)

---

## 1. Qué vas a levantar

| Componente | Puerto | URL útil |
|------------|--------|----------|
| PostgreSQL (Docker) | 5432 | `localhost:5432` |
| Backend Spring (Docker) | **8081** (host) | `http://localhost:8081/api/v1` |
| Frontend Vite | **5173** | `http://localhost:5173` |
| Swagger | — | `http://localhost:8081/swagger-ui.html` |
| pgAdmin (opcional) | 5050 | `http://localhost:5050` |

El frontend llama a `/api/v1/...` en el mismo origen (`5173`); Vite **reenvía** `/api` al backend (`8081`). No hace falta CORS manual en desarrollo.

---

## 2. Prerrequisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) en ejecución
- [Node.js](https://nodejs.org/) 20 LTS
- Puertos libres: **5173**, **8081**, **5432** (y 5050 si usas pgAdmin)

Si **5432** ya lo usa Postgres en Windows:

```powershell
Get-Service postgresql*   # opcional: Stop-Service <nombre>
```

O cambia en `docker-compose.yml` el mapeo a `"15432:5432"` y usa `DB_PORT=15432` solo si corres Maven contra ese puerto.

---

## 3. Credenciales alineadas (importante)

Docker Compose y el frontend deben usar **la misma contraseña** que crea el contenedor Postgres.

| Variable / dato | Valor con la configuración del repo |
|-----------------|-------------------------------------|
| Base de datos | `somosbarrio` |
| Usuario | `somosbarrio_app` |
| Contraseña | `password` (archivo raíz `somosbarrio-backend/.env` → `DB_PASSWORD`) |
| Admin seed | `admin@somosbarrio.cl` / `Admin123!` |
| Colaborador seed | `colaborador1@somosbarrio.cl` / `Admin123!` |

**Dos archivos `.env` en backend (no confundir):**

| Archivo | Para qué |
|---------|----------|
| `somosbarrio-backend/.env` | **Docker Compose** (`DB_PASSWORD`, `JWT_SECRET`, mail) |
| `somosbarrio-backend/backend/.env` | **`./mvnw spring-boot:run`** sin Docker (conectar a `localhost:5432`) |

**Frontend:** `somosbarrio-frontend/.env` → `VITE_BACKEND_PROXY_TARGET=http://localhost:8081`

Si cambiaste la contraseña en el pasado y Postgres ya tiene un volumen antiguo, la BD puede quedar con otra clave. Solución en dev:

```powershell
cd somosbarrio-backend
docker compose down -v
docker compose up -d --build
```

(`-v` borra datos; Flyway volverá a aplicar seeds.)

---

## 4. Arranque paso a paso

### 4.1 Backend + base de datos

```powershell
cd BACKEND\somosbarrio-backend

# Primera vez o tras cambiar DB_PASSWORD
Copy-Item .env.example .env -ErrorAction SilentlyContinue

docker compose up -d --build
docker compose logs -f backend
```

Espera en logs algo como **Started BackendApplication** sin errores de Flyway.

**Comprobaciones:**

```powershell
# Health
curl http://localhost:8081/actuator/health

# Debe devolver {"status":"UP"} (o similar con componentes UP)
```

Abre en navegador: `http://localhost:8081/swagger-ui.html`

### 4.2 Frontend

```powershell
cd FRONTEND\somosbarrio-frontend

Copy-Item .env.example .env -ErrorAction SilentlyContinue
npm install
npm run dev
```

Abre: `http://localhost:5173`

---

## 5. Smoke test de integración (15 minutos)

Marca cada ítem. En Chrome/Edge: **F12 → Red (Network)** → filtrar `api`.

### 5.1 Conectividad

| # | Acción | Resultado esperado |
|---|--------|-------------------|
| 1 | `GET` vía navegador a `http://localhost:8081/actuator/health` | `status: UP` |
| 2 | En `5173`, abrir `/login` | Formulario visible |
| 3 | Login `admin@somosbarrio.cl` / `Admin123!` | `POST /api/v1/auth/login` → **200**; redirección a `/` |
| 4 | Recargar F5 en `/` | Sigue autenticado (AuthBootstrap + refresh) |

### 5.2 Panel y actividades

| # | Acción | Resultado esperado |
|---|--------|-------------------|
| 5 | `/` — panel | `GET /api/v1/activities?page=0&size=100` → **200** |
| 6 | `/activities` — listado | `GET /api/v1/activities` → **200** |
| 7 | `/activities/new` — crear actividad | `POST /api/v1/activities` → **201**; vuelve al listado |
| 8 | Editar una actividad | `PUT /api/v1/activities/{id}` → **200** |

### 5.3 Documentos (flujo principal)

| # | Acción | Resultado esperado |
|---|--------|-------------------|
| 9 | `/documents` | Listado paginado **200** |
| 10 | `/documents/new` — plantilla `INFORME_TIPO` o otra | `GET /document-templates` **200**; `POST /documents` **201** |
| 11 | Detalle → enviar a revisión | `PATCH .../submit-review` **200** |
| 12 | Como admin → aprobar | `PATCH .../approve` **200** |
| 13 | Descargar PDF | `GET .../pdf` **200** (blob) o error claro si faltan `.docx` en `templates/` |

> **Nota plantillas Word:** en `somosbarrio-backend/templates/` deben existir los `.docx` referenciados en BD (`INFORME_TEMPLATE.docx`, etc.). Si solo está `PLACEHOLDERS.txt`, preview/PDF puede fallar; el resto del CRUD sigue funcionando.

### 5.4 Módulos admin

| # | Ruta | Request clave |
|---|------|----------------|
| 14 | `/users` | `GET/POST/PUT/DELETE /users` |
| 15 | `/document-templates` | CRUD plantillas |
| 16 | `/recipient-groups` | CRUD grupos |
| 17 | `/repository` | `GET /repository/documents` |
| 18 | `/audit-logs` | `GET /audit-logs` |
| 19 | `/reports` | Descarga Excel docs y actividades |

### 5.5 Portal trabajador

| # | Acción | Resultado esperado |
|---|--------|-------------------|
| 20 | Cerrar sesión → `/trabajador/login` | Login colaborador |
| 21 | `colaborador1@somosbarrio.cl` / `Admin123!` | Entrada a `/trabajador` |
| 22 | `/trabajador/reportes` o `/mis-reportes` (si entró por `/login`) | Crea documento vía API |
| 23 | `/trabajador/notas` | **Sin** llamadas REST (solo localStorage) |

### 5.6 Cuenta y seguridad

| # | Acción | Resultado esperado |
|---|--------|-------------------|
| 24 | `/account` | `GET /auth/me` **200** |
| 25 | Cambio de contraseña (y revertir en dev si quieres) | `POST /auth/change-password` **204** |
| 26 | Colaborador intenta `/users` | Redirección o **403** en API |

---

## 6. Errores frecuentes y solución

| Síntoma | Causa probable | Qué hacer |
|---------|----------------|-----------|
| `502` / “No hay conexión con el API” en login | Proxy apunta al puerto equivocado | `VITE_BACKEND_PROXY_TARGET=http://localhost:8081` y reiniciar `npm run dev` |
| `Connection refused` en 8081 | Backend no levantado | `docker compose up -d --build` |
| Flyway / “password authentication failed” | `.env` distinto al volumen Postgres | `docker compose down -v` y alinear `DB_PASSWORD=password` |
| Login 401 con credenciales seed | BD vacía o migraciones fallidas | Revisar logs backend; recrear volumen |
| CORS en navegador | Llamada directa a `:8081` desde el front | Usar solo `/api/v1` relativo (proxy Vite) |
| PDF / preview docx falla | Faltan archivos en `templates/` | Copiar `.docx` o probar plantilla sin `template_file_path` |
| Envío correo falla | SMTP sin credenciales | Normal en dev; probar solo UI de envío |
| Repositorio 404 en pantalla | Ruta no registrada | Verificar que `router.tsx` incluya `/repository` |

---

## 7. Probar solo API (sin frontend)

Útil para aislar fallos:

1. Swagger: `http://localhost:8081/swagger-ui.html`
2. Colección manual: [`../BACKEND/somosbarrio-backend/pruebas-backend.md`](../BACKEND/somosbarrio-backend/pruebas-backend.md) (flujos F1–F12)

---

## 8. Probar solo frontend (mock / backend caído)

No aplica mock global: el SPA espera API real. Para UI sin backend solo verás errores de red en login.

---

## 9. Alternativa: backend con Maven (sin contenedor Java)

1. Levantar solo Postgres: `docker compose up -d db`
2. `backend/.env` con `DB_HOST=localhost`, `DB_NAME=somosbarrio`, `DB_PASSWORD=password`
3. `cd backend` → `./mvnw spring-boot:run` → API en **8380**
4. Front: `VITE_BACKEND_PROXY_TARGET=http://localhost:8380`

---

## 10. Checklist final “integración OK”

- [ ] Health backend UP
- [ ] Login admin y colaborador OK
- [ ] F5 mantiene sesión
- [ ] CRUD actividades (incl. alta)
- [ ] Flujo documento borrador → aprobado
- [ ] Al menos un módulo admin (usuarios, auditoría o reportes) responde 200
- [ ] Trabajador crea informe o bitácora
- [ ] Sin URLs duplicadas `/api/v1/api/v1/...` en Network

Si todos los ítems críticos (primeros seis) pasan, **frontend y backend están integrados** con la base de datos Docker para el entorno de desarrollo estándar del repo.

---

## 11. Referencia rápida de archivos de configuración

```
somosbarrio-backend/
  .env                 ← Docker Compose (DB_PASSWORD, JWT)
  .env.example
  docker-compose.yml
  backend/
    .env               ← mvn spring-boot:run
    .env.example

somosbarrio-frontend/
  .env                 ← VITE_BACKEND_PROXY_TARGET=8081
  .env.example
  vite.config.ts       ← proxy /api → target
```
