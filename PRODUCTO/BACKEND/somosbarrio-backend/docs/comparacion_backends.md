# Comparativa de Backends — Somos Barrio

Análisis técnico de los dos backends que el equipo (Alfonso y Benjamín) desarrolló en paralelo, contrastados contra el [plan de implementación](./plan_de_implementacion.md), con una recomendación de cuál usar como base y un plan de trabajo paralelo para no chocar entre desarrolladores.

| Backend | Ruta |
|---|---|
| **Repo A — Alfonso** | `c:\Users\alfon\Desktop\PROYECTO_FINAL_SALIDA_INTERMEDIA\somosbarrio-backend` |
| **Repo B — Benjamín** | `c:\Users\alfon\Desktop\PROYECTO_FINAL_SALIDA_INTERMEDIA\somosbarrio-backend-benja\somosbarrio-backend\backend` |

---

## 1. Tabla resumen

| Aspecto | Repo A (Alfonso) | Repo B (Benjamín) |
|---|---|---|
| Spring Boot | 3.4.4 | 3.5.x |
| Java | 21 | 21 |
| BD | PostgreSQL nativo (Win) | PostgreSQL en Docker Compose |
| Migraciones Flyway | V1, V2, V9 (3 archivos) | V1 a V11 (11 archivos) |
| Dominios implementados | `auth` solamente | `auth`, `activities`, `documents`, `minutes` (actas), `attachments`, `templates` |
| Roles configurados | `ADMINISTRADOR`, `COLABORADOR` (alineados con la decisión actual del cliente) | `ADMIN`, `COORDINADOR`, `ANALISTA_TERRITORIAL` (modelo previo del plan) |
| JWT access + refresh | Sí, con rotación + revocación + hash SHA-256 + jti | Sí, con jti + revocación |
| Seguridad por rol | `@PreAuthorize` en endpoints admin | `@PreAuthorize` extendido por dominio |
| Manejo de errores | `ApiError` + `GlobalExceptionHandler` muy completo, `SecurityErrorResponder`, `ErrorCode` con catálogo | `ApiError` + `GlobalExceptionHandler` (más reducido) |
| Correlation ID | Filtro propio en MDC | No (no se detectó equivalente) |
| Logging | Logback con perfil dev/prod (texto vs JSON Logstash) | Logback similar |
| OpenAPI / Swagger | Sí (springdoc) | Sí (springdoc) |
| Multipart upload | Configuración lista, sin endpoints | Endpoints reales: `/documents/{id}/attachments`, `/minutes/{id}/attachments` |
| MIME validation (Tika) | Dependencia, sin uso | `MimeValidator` real |
| PDF (OpenPDF) | Dependencia, sin uso | Dependencia y campo `generatedPdfPath` declarado, **pero sin generación implementada** |
| Excel (Apache POI) | Dependencia, sin uso | Dependencia, sin uso |
| Mail | Configuración + dependencia | Configuración + dependencia + tablas, **sin servicio Java de envío** |
| Auditoría | No implementada | Tabla `audit_logs` (V7) **sin entidad ni servicio que la pueble** (solo timestamps JPA) |
| Reportes | No | No |
| Búsqueda con Specifications | No | Sí en `Activity` (filtros `status`, `territory`); en `Document` aún básico |
| Tests | 1 test de integración Auth/RBAC (Spring real, BD dev) | Batería más amplia: unitarios + WebMvc + 1 IT con **Testcontainers** + JaCoCo 50% |
| Docker | No incluye | `docker-compose.yml` (Postgres 16, backend, pgAdmin) + `Dockerfile` multi-stage |
| Documentación | `README.md`, `database_schema.md`, `bitacora_iteraciones_integracion.md`, `glosario_de_documentos_somosbarrio.md` (en GESTION) | Sin README en backend; sin docs vivas |
| Estado vs plan | **M0 + M1 cerrados con calidad alta** | **Sprint 1–2 parcial avanzado**, con varios pendientes serios |

---

## 2. Similitudes fundamentales

Ambos repos comparten un “ADN” común que confirma que la base técnica está consensuada:

- **Stack idéntico**: Spring Boot 3.x sobre Java 21, JPA, Flyway, JWT con JJWT, Spring Security stateless, springdoc-openapi, Lombok, MapStruct, JaCoCo en B (configurable en A).
- **Esquema base común**: ambos crean `roles`, `users`, `user_roles`, `refresh_tokens` en V2.
- **Esquema de errores tipo `ApiError`** y `GlobalExceptionHandler` en ambos.
- **JWT access + refresh** con `jti` y revocación; hash del refresh en BD.
- **Configuración por variables de entorno** y separación de perfiles (`dev`, `test`).
- **Layout de paquetes consistente**: `controller / service / repository / dto / model` por dominio.

---

## 3. Diferencias fundamentales

### 3.1 Profundidad funcional

- **Repo B está varios pasos por delante** funcionalmente: tiene `activities`, `documents`, `document_templates`, `minutes` (actas), adjuntos con MIME real, máquinas de estado para documentos y actas, generador de código (`ACT-2026-0001`), seeds de plantillas y datos demo (V10, V11).
- **Repo A solo cubre auth** (M0 + M1 según nuestra nomenclatura), pero lo cubre con una calidad de detalle superior.

### 3.2 Modelo de roles (incompatibilidad importante)

- **Repo A**: 2 roles `ADMINISTRADOR` + `COLABORADOR`. Esto coincide con la decisión más reciente del cliente y con la simplificación validada del MVP.
- **Repo B**: 3 roles `ADMIN`, `COORDINADOR`, `ANALISTA_TERRITORIAL`. Es el modelo del plan original; ya no representa la realidad.

> Si elegimos B como base, hay que **migrar el modelo de roles a `ADMINISTRADOR/COLABORADOR`** y revisar todos los `@PreAuthorize` y seeds (V9, V10, V11).

### 3.3 Calidad de la capa de seguridad y errores  

- **Repo A** tiene componentes más maduros:
  - `CorrelationIdFilter` con MDC,
  - `SecurityErrorResponder` con `ApiError` consistente para 401/403,
  - `ErrorCode` con catálogo extenso (incl. `AUTH_REFRESH_REVOKED`, `AUTH_REFRESH_EXPIRED`, `VALIDATION_PASSWORD_POLICY`, etc.),
  - `JwtProperties` con `@ConfigurationProperties`,
  - manejo limpio de `NoResourceFoundException` (favicon).
- **Repo B** tiene seguridad funcional, pero menos pulida: usa principal como `userId` (UUID string) en authorities, y deja **algunos endpoints GET sensibles públicos** (actividades, plantillas).

### 3.4 Tests

- **Repo A**: 1 test de integración real contra BD dev — pragmático pero acoplado al entorno local.
- **Repo B**: tests unitarios por servicio (state machines, code generator, auth), `@WebMvcTest` para controladores y un IT con **Testcontainers** (BD efímera). Esta estrategia es más reproducible para CI/CD.

### 3.5 Inconsistencias / deudas detectadas en Repo B

- **`minutes` y `minute_attachments`** existen como **entidades JPA**, pero **no hay migración Flyway** que las cree. Con `ddl-auto: validate`, eso revienta el arranque salvo que se cree la tabla manualmente. **Hay que escribir la V12 (o regenerar V3) para esas tablas.**
- **Mail, PDF, Excel y `audit_logs`**: dependencias y/o tablas declaradas, **sin código de negocio**. Hay que asumir que esas piezas todavía requieren implementación, similar al estado de A.
- **GETs públicos** de actividades y plantillas pueden filtrar información municipal sensible.
- **`DocumentCodeGenerator` usa `count()`** sobre `documents`, lo cual genera códigos **no estables ni atómicos** (problemas de concurrencia y de “correlativo por año”).
- **No hay README** en el backend ni docs vivas; hay que documentarlo al adoptarlo.

### 3.6 Infraestructura y empaquetado

- **Repo B** trae Docker Compose y Dockerfile, lo que favorece arranque cero‑config para el equipo y para CI.
- **Repo A** depende de Postgres nativo en Windows + scripts manuales (`scripts/db_setup.sql`), lo que ralentiza onboarding del compañero.

### 3.7 Documentación

- **Repo A** está acompañado por:
  - `README.md` completo
  - `database_schema.md` vivo
  - `bitacora_iteraciones_integracion.md`
  - `glosario_de_documentos_somosbarrio.md`
- **Repo B** no tiene README ni bitácoras propias.

---

## 4. Estado vs `plan_de_implementacion.md`

> El plan está organizado por **Sprints** (S1–S4) y la nomenclatura **M0–M8** la usamos en la bitácora y README de Repo A para sincronizar avance. Mapeo aproximado:

| Hito interno | Sprint del plan | Repo A | Repo B |
|---|---|---|---|
| M0 Setup | Fase 2.1 + setup S1 | Cerrado | Cerrado (con Docker) |
| M1 Auth | Sprint 1 (issues 1–4) | **Cerrado y testeado** | Cerrado pero con roles distintos |
| M2 Activities | Sprint 1 (issue 8) | Pendiente | Cerrado (CRUD + filtros + estados) |
| M3 Documents base | Sprint 1 (issues 11–12) | Pendiente | Cerrado en gran parte (templates + documents en borrador + adjuntos) |
| M4 Documents completo | Sprint 2 (issues 16–24) | Pendiente | **Parcial**: estados y adjuntos sí; **PDF no** implementado |
| M5 Repositorio + Búsqueda | Sprint 3 (issues 29–31) | Pendiente | **Parcial**: filtros simples en `documents`, falta búsqueda rica + generador de código robusto |
| M6 Mailing | Sprint 3 (issues 32–36) | Pendiente | **Solo tablas**, sin servicio Java |
| M7 Reportes | Sprint 4 (issues 45–47) | Pendiente | Pendiente |
| M8 Auditoría | Sprint 4 (issues 43–44) | Pendiente | **Solo tabla `audit_logs`**, sin lógica |

**Conclusión de avance**: Repo B cubre del orden del **40–50%** del MVP backend; Repo A cubre del orden del **15–20%** pero con calidad superior en lo que sí está. **Tiramos a la basura mucho trabajo** si descartamos Repo B.

---

## 5. Recomendación

### 5.1 Base elegida: **Repo B (Benjamín)** con re-trabajo dirigido

**Por qué**:

- Ya implementa la mayor parte de los dominios funcionales (M2–M3 y parte de M4–M5).
- Trae Docker Compose, Testcontainers y JaCoCo, que son la base correcta para CI.
- Migrar Auth/calidad de Repo A a Repo B es **mucho más barato** que reimplementar `activities`, `documents`, `minutes`, `attachments`, `templates` desde cero.

### 5.2 Lista de re-trabajo crítico antes de seguir

Estos cambios son **bloqueantes** para que Repo B sea la base oficial:

1. **Migrar el modelo de roles a 2 roles (`ADMINISTRADOR`, `COLABORADOR`)**.
   - Reescribir V9 (seed roles).
   - Reemplazar todos los `@PreAuthorize` con el modelo simplificado.
   - Ajustar V10 (seed demo) y V11 (templates) para usar los nuevos roles.
2. **Crear migración Flyway para `minutes` y `minute_attachments`** (V12, p. ej.) y validar con `ddl-auto: validate` en `dev`.
3. **Cerrar GETs públicos** de actividades y plantillas: pasar todos los endpoints a `authenticated` y restringir mutaciones por rol.
4. **Reemplazar `DocumentCodeGenerator` basado en `count()`** por un correlativo atómico por tipo y año (secuencia o contador en BD).
5. **Adoptar de Repo A**:
   - `CorrelationIdFilter` + MDC,
   - `ApiError` + catálogo extendido `ErrorCode`,
   - `SecurityErrorResponder` para 401/403 consistentes,
   - manejo de `NoResourceFoundException` (favicon),
   - `JwtProperties` vía `@ConfigurationProperties`.
6. **Arrastrar la documentación viva** de A a la raíz `FASE 2/GESTION/`:
   - actualizar `database_schema.md` para reflejar V1–V11 + nuevas migraciones,
   - actualizar `bitacora_iteraciones_integracion.md` indicando que la base oficial pasa a ser Repo B,
   - publicar un `README.md` en el backend nuevo.
7. **Definir y subir un workflow CI** mínimo (build + test con Testcontainers).

### 5.3 Resultado esperado tras el re-trabajo

Backend único, con M0–M3 reales en verde, M4–M5 listos para terminar, y M6–M8 con cimientos de BD. Cualquier nueva iteración (M4 PDF, M5 búsqueda rica, M6 mailing, M7 reportes, M8 auditoría) parte de aquí.

---

## 6. Cómo trabajar en paralelo sin chocarse

### 6.1 Repo único + ramas por feature

- **Un solo repositorio Git oficial** (`somosbarrio-backend`) con `main` protegida.
- **Ramas**: `feature/<modulo>-<descripcion-corta>`, p. ej. `feature/m4-pdf-generation`, `feature/m6-mail-service`.
- **PRs obligatorios** con al menos 1 reviewer cruzado (Alfonso ↔ Benjamín). Esto resuelve también el “qué hizo el otro” sin reuniones.
- **CODEOWNERS**: cada paquete principal tiene un owner por defecto (no exclusivo) — facilita asignación natural de revisiones.

### 6.2 División de dominio (no de capa)

Para evitar pisarse, asignar **módulos completos** a cada uno, no “backend vs DTO”:

| Persona | Módulos sugeridos |
|---|---|
| Alfonso | M4 (PDF + descarga), M6 (Mailing + email_logs), M8 (Auditoría JPA + endpoint admin) |
| Benjamín | Cierre de M2/M3 con reglas finales, M5 (búsqueda con Specifications), M7 (Reportes Excel/PDF) |

Esto los pone a trabajar en paquetes Java distintos casi todo el tiempo (`documents/pdf`, `mailing/`, `audit/` vs `documents/search`, `reports/`).

### 6.3 Independencia de pruebas (clave)

Para que ninguno tenga que esperar al otro:

1. **Spring profiles claros**:
   - `dev` para desarrollo local de cada uno (Postgres por Docker Compose),
   - `test` para Testcontainers en CI,
   - `mock` opcional para arrancar sin BD con datos en memoria, útil para frontend.
2. **Datos seed completos** en V10/V11 (y nuevos seeds) que dejen la BD lista con: usuarios admin/colab, actividades, plantillas y documentos en distintos estados → cualquiera de los dos puede probar M5/M6/M7 sin haber implementado M2/M3.
3. **Stubs/Fakes**:
   - Para M6 (Mail), trabajar contra una **interfaz `EmailSender`** con implementación `LoggingEmailSender` por defecto en `dev`. La implementación real con SMTP queda detrás de un `@Profile("smtp")` o flag `app.mail.enabled=true`.
   - Para M4 (PDF), exponer un `PdfRenderer` con implementación dummy (`SamplePdfRenderer`) que devuelva PDF de prueba, hasta que la real esté lista.
4. **OpenAPI como contrato**: cada PR que toque endpoints regenera o actualiza la spec OpenAPI; el frontend puede consumir mocks contra ella sin esperar al backend.
5. **Testcontainers en cada test de integración**: hace que correr `mvn verify` no requiera la BD de tu compañero. Es la regla de oro para no bloquearse.

### 6.4 Bandera por feature (feature flags ligeros)

Para que un módulo a medias no rompa los demás:

- Convención: `app.features.<modulo>.enabled` con default `false` en `application.yml` y `true` cuando madure.
- Los `@Bean` o `@RestController` que dependan de la feature pueden ser `@ConditionalOnProperty(prefix="app.features.X", value="enabled", havingValue="true")`.
- Cuando Benjamín esté trabajando en `reports`, Alfonso lo mantiene apagado en su perfil dev para no recibir errores.

### 6.5 Reglas de migraciones Flyway

Para no chocar en `db/migration/`:

- **Reservar rangos de versiones** por persona en cada sprint:
  - Alfonso: V12, V14, V16…
  - Benjamín: V13, V15, V17…
- O, más simple y robusto: **timestamp-based versioning** (`V20260504_1100__nombre.sql`). Recomendado.
- Flyway en modo `validate-on-migrate: true` para no permitir mutaciones de migraciones ya aplicadas.

### 6.6 Convenciones operativas

- **Issue tracker**: GitHub Issues o Jira con un tablero por sprint, etiquetando `[BE]` y `Mx`.
- **Definition of Done compartida** ya existente en `plan_de_implementacion.md` §6.
- **Reuniones cortas**: 15 min al inicio de cada semana para sincronizar qué módulos estará tocando cada uno y validar contratos cruzados.
- **Bitácora de integraciones**: cada cierre de módulo se registra en `bitacora_iteraciones_integracion.md` (formato ya definido).

### 6.7 Checklist mínimo antes de mergear

- [ ] Compila (`mvn -DskipTests compile`).
- [ ] Tests verdes (`mvn verify` con Testcontainers).
- [ ] Migraciones Flyway nuevas con su número y descripción.
- [ ] OpenAPI sigue exponiendo lo declarado.
- [ ] Documentación viva actualizada (`database_schema.md`, `bitacora_iteraciones_integracion.md` o `glosario_de_documentos_somosbarrio.md` si aplica).
- [ ] PR revisado por la otra persona.

---

## 7. Próximos pasos concretos sugeridos

1. **Aceptar Repo B como base oficial**, hacer un fork/copia limpia y abrir el repo en GitHub.
2. **Ejecutar el re-trabajo crítico** de §5.2 en una rama `chore/m1-baseline` y mergear como nuevo M0+M1 oficial.
3. **Migrar la documentación de gestión** de Repo A a la base unificada.
4. **Repartir M4–M8** según §6.2, abrir issues, y empezar a trabajar en paralelo con la disciplina de §6.3–6.7.

Cuando este documento o las decisiones cambien, este archivo (`comparacion_backends.md`) se mantiene como bitácora histórica de la decisión; si más adelante se elige otra base, se anota aquí con fecha y motivo.
