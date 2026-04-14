# Carta Gantt — Plataforma Somos Barrio

## Información del Proyecto

| Campo | Detalle |
|---|---|
| **Proyecto** | Plataforma Web de Gestión Administrativa — Programa Somos Barrio |
| **Cliente** | Subsecretaría de Prevención del Delito, Viña del Mar |
| **Contacto cliente** | Luciano Renault, Subdirector del programa |
| **Metodología** | Scrum + Carta Gantt |
| **Duración** | 16 semanas (9 de marzo – 28 de junio 2026) |
| **Stack** | React 18 + TypeScript / Java 21 + Spring Boot 3.x / PostgreSQL 16 / Docker |

---

## Equipo de Trabajo

| Integrante | Rol Principal | Rol Secundario |
|---|---|---|
| Benjamín Castro Ormeño | Backend | QA Tester, DBA |
| Alfonso González | Backend | Scrum Master |
| Stephania Muñoz | Frontend | UI/UX |
| Aran Opazo Campusano | Frontend | UI/UX |

---

## Calendario de Semanas

| Semana | Fecha Inicio | Fecha Fin | Fase |
|---|---|---|---|
| S1 | 09/03/2026 | 15/03/2026 | Fase 1 — Planificación |
| S2 | 16/03/2026 | 22/03/2026 | Fase 1 — Planificación |
| S3 | 23/03/2026 | 29/03/2026 | Fase 1 — Planificación |
| S4 | 30/03/2026 | 05/04/2026 | Fase 1 — Planificación |
| S5 | 06/04/2026 | 12/04/2026 | Fase 2 — Diseño y Setup |
| S6 | 13/04/2026 | 19/04/2026 | Fase 2 — Diseño y Setup |
| S7 | 20/04/2026 | 26/04/2026 | Fase 2 — Desarrollo (Sprint 1) |
| S8 | 27/04/2026 | 03/05/2026 | Fase 2 — Desarrollo (Sprint 1) |
| S9 | 04/05/2026 | 10/05/2026 | Fase 2 — Desarrollo (Sprint 2) |
| S10 | 11/05/2026 | 17/05/2026 | Fase 2 — Desarrollo (Sprint 2) |
| S11 | 18/05/2026 | 24/05/2026 | Fase 2 — Desarrollo (Sprint 3) |
| S12 | 25/05/2026 | 31/05/2026 | Fase 2 — Desarrollo (Sprint 3) |
| S13 | 01/06/2026 | 07/06/2026 | Fase 3 — Integración y QA |
| S14 | 08/06/2026 | 14/06/2026 | Fase 3 — Integración y QA |
| S15 | 15/06/2026 | 21/06/2026 | Fase 3 — Cierre |
| S16 | 22/06/2026 | 28/06/2026 | Fase 3 — Cierre |

---

## Estructura Detallada por Fase

---

### FASE 1 — PLANIFICACIÓN (S1 – S4 | 09/03 – 05/04)

#### Etapa 1.1 — Levantamiento de Requerimientos (S1 – S2 | 09/03 – 22/03)

| ID | Tarea | Responsable | Inicio | Fin | Entregable |
|---|---|---|---|---|---|
| 1.1.1 | Reunión inicial con cliente (Luciano Renault) | Todo el equipo | 09/03 | 09/03 | Acta de reunión / Transcripción |
| 1.1.2 | Identificación de procesos críticos del programa | Todo el equipo | 10/03 | 12/03 | Listado de procesos |
| 1.1.3 | Levantamiento de requerimientos funcionales | Alfonso (SM) + Equipo | 10/03 | 15/03 | Documento de requerimientos borrador |
| 1.1.4 | Definición de módulos del sistema | Alfonso + Benjamín | 16/03 | 18/03 | Mapa de módulos |
| 1.1.5 | Construcción del Product Backlog inicial | Alfonso (SM) | 16/03 | 19/03 | Product Backlog (Trello) |
| 1.1.6 | Validación de requerimientos con el cliente | Todo el equipo | 20/03 | 22/03 | Backlog validado |
| 1.1.7 | Elaboración documento de registro del proyecto | Todo el equipo | 09/03 | 22/03 | Documento 1.1.2 |

#### Etapa 1.2 — Análisis de la Información (S3 – S4 | 23/03 – 05/04)

| ID | Tarea | Responsable | Inicio | Fin | Entregable |
|---|---|---|---|---|---|
| 1.2.1 | Priorización de requerimientos (MoSCoW) | Alfonso (SM) + Equipo | 23/03 | 25/03 | Backlog priorizado |
| 1.2.2 | Definición de roles y permisos del sistema | Alfonso + Benjamín | 23/03 | 25/03 | Matriz de roles (ADMIN, COORDINADOR, ANALISTA_TERRITORIAL, FINANZAS, AUDITOR) |
| 1.2.3 | Análisis de flujos de negocio por módulo | Todo el equipo | 26/03 | 29/03 | Diagramas de flujo |
| 1.2.4 | Especificación de requerimientos funcionales (RF-01 a RF-08) | Benjamín + Alfonso | 30/03 | 02/04 | Documento de especificaciones técnicas |
| 1.2.5 | Especificación de requerimientos no funcionales (RNF-01 a RNF-07) | Benjamín + Alfonso | 30/03 | 02/04 | Documento RNF |
| 1.2.6 | Definición de criterios de aceptación por módulo | Todo el equipo | 03/04 | 05/04 | Criterios documentados |

**Hito 1 — Fin Fase Planificación (05/04): Product Backlog completo, requerimientos definidos y validados.**

---

### FASE 2 — DISEÑO, CONFIGURACIÓN Y DESARROLLO (S5 – S12 | 06/04 – 31/05)

#### Etapa 2.1 — Diseño de la Solución (S5 – S6 | 06/04 – 19/04)

| ID | Tarea | Responsable | Inicio | Fin | Entregable |
|---|---|---|---|---|---|
| 2.1.1 | Diseño del modelo entidad-relación (MER) | Benjamín (DBA) | 06/04 | 09/04 | Diagrama ER (Draw.io / dbdiagram) |
| 2.1.2 | Diseño de esquema de base de datos (tablas clave) | Benjamín (DBA) | 06/04 | 10/04 | Script SQL / Migraciones Flyway |
| 2.1.3 | Diseño de arquitectura del sistema | Benjamín + Alfonso | 08/04 | 10/04 | Diagrama de arquitectura (Docker + componentes) |
| 2.1.4 | Definición de la API REST (endpoints /api/v1) | Alfonso + Benjamín | 10/04 | 12/04 | Documentación OpenAPI |
| 2.1.5 | Diseño de wireframes / mockups UI | Stephania + Aran | 06/04 | 12/04 | Mockups por módulo |
| 2.1.6 | Diseño del sistema de autenticación (JWT + Refresh Token) | Benjamín | 10/04 | 12/04 | Documento de diseño de seguridad |
| 2.1.7 | Configuración del repositorio GitHub | Alfonso | 13/04 | 13/04 | Repositorio creado con estructura base |
| 2.1.8 | Configuración de Docker Compose (frontend, backend, db, pgadmin) | Benjamín + Alfonso | 13/04 | 15/04 | docker-compose.yml funcional |
| 2.1.9 | Setup del proyecto backend (Spring Boot + dependencias) | Benjamín + Alfonso | 14/04 | 16/04 | Proyecto Spring Boot base |
| 2.1.10 | Setup del proyecto frontend (React + Vite + TypeScript) | Stephania + Aran | 14/04 | 16/04 | Proyecto React base |
| 2.1.11 | Configuración de ESLint, Prettier, Checkstyle | Todo el equipo | 16/04 | 17/04 | Linters configurados |
| 2.1.12 | Creación de migraciones Flyway iniciales | Benjamín (DBA) | 16/04 | 19/04 | Migraciones V1 ejecutables |
| 2.1.13 | Configuración de variables de entorno (.env) | Alfonso | 17/04 | 18/04 | Archivo .env |
| 2.1.14 | Validación: levantar entorno completo con `docker compose up` | Todo el equipo | 18/04 | 19/04 | Entorno funcional verificado |

**Hito 2 — Fin Diseño y Setup (19/04): Arquitectura definida, entorno de desarrollo operativo, BD modelada.**

---

#### Etapa 2.2 — Sprint 1: Autenticación + Módulo Actividades + Módulo Actas (S7 – S8 | 20/04 – 03/05)

| ID | Tarea | Responsable | Inicio | Fin | Entregable |
|---|---|---|---|---|---|
| **Sprint Planning S1** | | | **20/04** | **20/04** | |
| 2.2.1 | **[RF-01] Backend:** Implementar entidades User, Role, UserRole | Benjamín | 20/04 | 21/04 | Entidades JPA + migraciones |
| 2.2.2 | **[RF-01] Backend:** Implementar login con JWT (access + refresh token) | Benjamín + Alfonso | 20/04 | 23/04 | Endpoint POST /auth/login, POST /auth/refresh |
| 2.2.3 | **[RF-01] Backend:** Implementar autorización por roles (Spring Security) | Alfonso | 22/04 | 24/04 | Filtros de seguridad configurados |
| 2.2.4 | **[RF-01] Frontend:** Pantalla de login | Stephania | 20/04 | 22/04 | Página login funcional |
| 2.2.5 | **[RF-01] Frontend:** Manejo de sesión (JWT storage, refresh, protección de rutas) | Aran | 22/04 | 24/04 | Auth context + rutas protegidas |
| 2.2.6 | **[RF-02] Backend:** CRUD de actividades (controller, service, repository) | Alfonso | 24/04 | 27/04 | Endpoints GET/POST/PUT /activities |
| 2.2.7 | **[RF-02] Frontend:** Vista listado de actividades | Stephania | 24/04 | 26/04 | Tabla de actividades con filtros |
| 2.2.8 | **[RF-02] Frontend:** Formulario crear/editar actividad | Aran | 25/04 | 27/04 | Formulario con validación (React Hook Form + Zod) |
| 2.2.9 | **[RF-03] Backend:** CRUD de actas + gestión de estados (BORRADOR → EN_REVISION → APROBADA) | Benjamín | 27/04 | 30/04 | Endpoints GET/POST/PUT /minutes |
| 2.2.10 | **[RF-03] Backend:** Upload de archivos adjuntos a actas | Alfonso | 28/04 | 30/04 | Endpoint POST /minutes/{id}/attachments |
| 2.2.11 | **[RF-03] Frontend:** Vista de actas asociadas a actividad | Stephania | 28/04 | 30/04 | Interfaz de gestión de actas |
| 2.2.12 | **[RF-03] Frontend:** Componente de carga de archivos adjuntos | Aran | 29/04 | 01/05 | Upload funcional |
| 2.2.13 | Integración y pruebas Sprint 1 | Todo el equipo | 01/05 | 03/05 | Módulos auth + actividades + actas integrados |
| **Sprint Review S1** | | Todo el equipo | **03/05** | **03/05** | Demo al cliente |

**Hito 3 — Sprint 1 completado (03/05): Sistema con login, gestión de actividades y actas funcional.**

---

#### Etapa 2.3 — Sprint 2: Módulo Financiero + Proveedores (S9 – S10 | 04/05 – 17/05)

| ID | Tarea | Responsable | Inicio | Fin | Entregable |
|---|---|---|---|---|---|
| **Sprint Planning S2** | | | **04/05** | **04/05** | |
| 2.3.1 | **[RF-04] Backend:** Entidades Expense, ExpenseDocument | Benjamín | 04/05 | 05/05 | Entidades + migraciones |
| 2.3.2 | **[RF-04] Backend:** Lógica de rendición financiera (cálculo neto, IVA 19%, total) | Benjamín + Alfonso | 05/05 | 08/05 | Service con cálculos automáticos |
| 2.3.3 | **[RF-04] Backend:** CRUD gastos + validaciones de montos y fechas | Alfonso | 06/05 | 09/05 | Endpoints GET/POST/PUT /expenses |
| 2.3.4 | **[RF-04] Frontend:** Vista de rendiciones financieras | Stephania | 06/05 | 09/05 | Tabla de gastos con totales |
| 2.3.5 | **[RF-04] Frontend:** Formulario de registro de gastos | Aran | 07/05 | 10/05 | Formulario con cálculos en tiempo real |
| 2.3.6 | **[RF-05] Backend:** CRUD de proveedores | Alfonso | 10/05 | 12/05 | Endpoints GET/POST/PUT /suppliers |
| 2.3.7 | **[RF-05] Backend:** Envío de correos de solicitud de cotización (Spring Mail + SMTP) | Benjamín | 10/05 | 13/05 | Endpoint POST /emails/send-request |
| 2.3.8 | **[RF-05] Backend:** Trazabilidad de envío (email_logs) | Benjamín | 12/05 | 13/05 | Registro de envíos |
| 2.3.9 | **[RF-05] Frontend:** Vista de proveedores | Stephania | 11/05 | 13/05 | Listado + formulario proveedores |
| 2.3.10 | **[RF-05] Frontend:** Interfaz de envío de solicitudes por correo | Aran | 12/05 | 14/05 | UI de envío de correos |
| 2.3.11 | Integración y pruebas Sprint 2 | Todo el equipo | 14/05 | 17/05 | Módulos financiero + proveedores integrados |
| **Sprint Review S2** | | Todo el equipo | **17/05** | **17/05** | Demo al cliente |

**Hito 4 — Sprint 2 completado (17/05): Rendición financiera y gestión de proveedores operativa.**

---

#### Etapa 2.4 — Sprint 3: Módulo Inventario + Auditoría (S11 – S12 | 18/05 – 31/05)

| ID | Tarea | Responsable | Inicio | Fin | Entregable |
|---|---|---|---|---|---|
| **Sprint Planning S3** | | | **18/05** | **18/05** | |
| 2.4.1 | **[RF-06] Backend:** Entidades InventoryItem, InventoryMovement | Benjamín | 18/05 | 19/05 | Entidades + migraciones |
| 2.4.2 | **[RF-06] Backend:** CRUD de items de inventario | Alfonso | 18/05 | 20/05 | Endpoints GET/POST /inventory/items |
| 2.4.3 | **[RF-06] Backend:** Registro de movimientos (entradas/salidas) + cálculo de stock | Benjamín | 20/05 | 22/05 | Endpoint POST /inventory/movements |
| 2.4.4 | **[RF-06] Backend:** Lógica de alerta por stock mínimo | Alfonso | 22/05 | 23/05 | Alertas configurables |
| 2.4.5 | **[RF-06] Frontend:** Vista de inventario (stock actual) | Stephania | 19/05 | 22/05 | Tabla de inventario con alertas visuales |
| 2.4.6 | **[RF-06] Frontend:** Formulario de registro de movimientos | Aran | 20/05 | 23/05 | Formulario entradas/salidas |
| 2.4.7 | **[RF-08] Backend:** Implementar tabla audit_logs | Benjamín | 23/05 | 25/05 | Entidad + interceptor de auditoría |
| 2.4.8 | **[RF-08] Backend:** Registrar creación/modificación/aprobación en entidades críticas | Alfonso | 24/05 | 27/05 | Auditoría automática |
| 2.4.9 | **[RF-08] Frontend:** Vista de logs de auditoría (solo rol AUDITOR/ADMIN) | Stephania + Aran | 25/05 | 28/05 | Panel de auditoría |
| 2.4.10 | Integración y pruebas Sprint 3 | Todo el equipo | 28/05 | 31/05 | Módulos inventario + auditoría integrados |
| **Sprint Review S3** | | Todo el equipo | **31/05** | **31/05** | Demo al cliente |

**Hito 5 — Sprint 3 completado (31/05): Inventario y auditoría operativos.**

---

### FASE 3 — INTEGRACIÓN, QA Y CIERRE (S13 – S16 | 01/06 – 28/06)

#### Etapa 3.1 — Sprint 4: Reportes + Integración General (S13 – S14 | 01/06 – 14/06)

| ID | Tarea | Responsable | Inicio | Fin | Entregable |
|---|---|---|---|---|---|
| **Sprint Planning S4** | | | **01/06** | **01/06** | |
| 3.1.1 | **[RF-07] Backend:** Generación de reportes en Excel (Apache POI) | Benjamín | 01/06 | 04/06 | Servicio de exportación Excel |
| 3.1.2 | **[RF-07] Backend:** Generación de reportes en PDF (OpenPDF) | Alfonso | 01/06 | 04/06 | Servicio de exportación PDF |
| 3.1.3 | **[RF-07] Backend:** Filtros por rango de fecha, actividad, estado rendición | Benjamín + Alfonso | 04/06 | 06/06 | Endpoint GET /reports/monthly con parámetros |
| 3.1.4 | **[RF-07] Frontend:** Interfaz de generación de reportes | Stephania | 02/06 | 05/06 | Panel de reportes con filtros |
| 3.1.5 | **[RF-07] Frontend:** Descarga de archivos Excel/PDF | Aran | 04/06 | 06/06 | Botones de exportación funcionales |
| 3.1.6 | Integración completa de todos los módulos | Todo el equipo | 06/06 | 09/06 | Sistema integrado end-to-end |
| 3.1.7 | Revisión de navegación y flujos entre módulos | Stephania + Aran | 08/06 | 10/06 | UX validada |
| 3.1.8 | Configuración de GitHub Actions (build + test) | Alfonso | 08/06 | 10/06 | Pipeline CI funcional |
| 3.1.9 | Pruebas de integración entre módulos | Benjamín (QA) | 10/06 | 12/06 | Reporte de bugs |
| 3.1.10 | Corrección de bugs encontrados | Todo el equipo | 12/06 | 14/06 | Bugs resueltos |
| **Sprint Review S4** | | Todo el equipo | **14/06** | **14/06** | Demo al cliente |

**Hito 6 — Sprint 4 completado (14/06): Sistema completo con reportes e integración total.**

---

#### Etapa 3.2 — Pruebas, Ajustes y Cierre (S15 – S16 | 15/06 – 28/06)

| ID | Tarea | Responsable | Inicio | Fin | Entregable |
|---|---|---|---|---|---|
| 3.2.1 | Pruebas funcionales completas del sistema | Benjamín (QA) | 15/06 | 18/06 | Reporte de pruebas |
| 3.2.2 | Pruebas de seguridad (JWT, roles, CORS, validaciones) | Alfonso + Benjamín | 15/06 | 17/06 | Checklist de seguridad |
| 3.2.3 | Pruebas unitarias backend (JUnit 5 + Mockito) — cobertura ≥ 60% | Benjamín + Alfonso | 16/06 | 19/06 | Tests ejecutables |
| 3.2.4 | Corrección de bugs y ajustes finales | Todo el equipo | 18/06 | 21/06 | Sistema estable |
| 3.2.5 | Revisión de UI/UX final y pulido visual | Stephania + Aran | 18/06 | 20/06 | Interfaz pulida |
| 3.2.6 | Documentación técnica del proyecto | Alfonso | 20/06 | 23/06 | README + documentación API (OpenAPI) |
| 3.2.7 | Elaboración del informe final del proyecto | Todo el equipo | 22/06 | 25/06 | Informe final |
| 3.2.8 | Preparación de la presentación / demo | Todo el equipo | 23/06 | 26/06 | PPT + demo preparada |
| 3.2.9 | Ensayo de presentación | Todo el equipo | 26/06 | 27/06 | Equipo preparado |
| 3.2.10 | **Presentación final y entrega del proyecto** | Todo el equipo | 28/06 | 28/06 | Proyecto entregado |

**Hito 7 — Entrega Final (28/06): Sistema entregado, presentación realizada, documentación completa.**

---

## Resumen de Hitos

| Hito | Descripción | Fecha |
|---|---|---|
| H1 | Fin Fase Planificación: Backlog completo y requerimientos validados | 05/04/2026 |
| H2 | Fin Diseño y Setup: Arquitectura, BD y entorno operativos | 19/04/2026 |
| H3 | Sprint 1 completado: Auth + Actividades + Actas | 03/05/2026 |
| H4 | Sprint 2 completado: Financiero + Proveedores | 17/05/2026 |
| H5 | Sprint 3 completado: Inventario + Auditoría | 31/05/2026 |
| H6 | Sprint 4 completado: Reportes + Integración | 14/06/2026 |
| H7 | Entrega Final del proyecto | 28/06/2026 |

---

## Vista Gantt por Semanas (Resumen Visual)

```
TAREA / SEMANA                          S1  S2  S3  S4  S5  S6  S7  S8  S9  S10 S11 S12 S13 S14 S15 S16
                                        Mar Mar Mar Abr Abr Abr Abr May May May May May Jun Jun Jun Jun
                                         9  16  23  30   6  13  20  27   4  11  18  25   1   8  15  22
────────────────────────────────────────────────────────────────────────────────────────────────────────────
FASE 1 — PLANIFICACIÓN
  Levantamiento de requerimientos       [██][██]
  Análisis de la información                    [██][██]
  ► HITO 1: Planificación completa                  ◆

FASE 2 — DISEÑO + DESARROLLO
  Diseño BD + Arquitectura                              [██][██]
  Config entorno Docker + Setup                             [██]
  ► HITO 2: Diseño y setup listo                             ◆

  Sprint 1: Auth + Actividades + Actas                          [██][██]
  ► HITO 3: Sprint 1 completado                                      ◆

  Sprint 2: Financiero + Proveedores                                    [██][██]
  ► HITO 4: Sprint 2 completado                                              ◆

  Sprint 3: Inventario + Auditoría                                              [██][██]
  ► HITO 5: Sprint 3 completado                                                      ◆

FASE 3 — INTEGRACIÓN + QA + CIERRE
  Sprint 4: Reportes + Integración                                                      [██][██]
  ► HITO 6: Sprint 4 completado                                                              ◆

  Pruebas + Ajustes finales                                                                     [██]
  Documentación + Informe + Demo                                                                    [██]
  ► HITO 7: ENTREGA FINAL                                                                            ◆
```

---

## Distribución de Carga por Integrante

### Benjamín Castro Ormeño (Backend / QA / DBA)
- **S1–S4:** Participación en levantamiento y análisis de requerimientos
- **S5–S6:** Diseño de MER, esquema BD, migraciones Flyway, Docker Compose
- **S7–S8:** Entidades User/Role, login JWT, CRUD actas, upload archivos
- **S9–S10:** Entidades financieras, lógica IVA/rendición, envío correos SMTP
- **S11–S12:** Entidades inventario, movimientos stock, tabla audit_logs
- **S13–S14:** Reportes Excel (Apache POI), pruebas de integración
- **S15–S16:** Pruebas QA funcionales, tests unitarios, corrección de bugs

### Alfonso González (Backend / Scrum Master)
- **S1–S4:** Coordinación Scrum, Product Backlog, definición de RF/RNF
- **S5–S6:** Diseño arquitectura, setup repositorio, config .env, Docker
- **S7–S8:** Autorización por roles, CRUD actividades, upload adjuntos
- **S9–S10:** CRUD gastos, CRUD proveedores
- **S11–S12:** CRUD inventario, alertas stock, auditoría automática
- **S13–S14:** Reportes PDF (OpenPDF), GitHub Actions, corrección bugs
- **S15–S16:** Pruebas seguridad, tests unitarios, documentación técnica

### Stephania Muñoz (Frontend / UI-UX)
- **S1–S4:** Participación en levantamiento y análisis
- **S5–S6:** Wireframes y mockups UI de todos los módulos
- **S7–S8:** Pantalla login, listado actividades, vista actas
- **S9–S10:** Vista rendiciones financieras, vista proveedores
- **S11–S12:** Vista inventario con alertas visuales, panel auditoría
- **S13–S14:** Panel de reportes, revisión UX de navegación
- **S15–S16:** Pulido visual final, preparación presentación

### Aran Opazo Campusano (Frontend / UI-UX)
- **S1–S4:** Participación en levantamiento y análisis
- **S5–S6:** Wireframes y mockups UI de todos los módulos
- **S7–S8:** Manejo sesión JWT, formularios actividades, carga archivos
- **S9–S10:** Formulario gastos (cálculos tiempo real), interfaz correos
- **S11–S12:** Formulario movimientos inventario, panel auditoría
- **S13–S14:** Descarga Excel/PDF, revisión flujos UX
- **S15–S16:** Pulido visual final, preparación presentación

---

## Módulos del Sistema vs. Sprints

| Módulo | RF | Sprint | Semanas |
|---|---|---|---|
| Autenticación y Roles | RF-01 | Sprint 1 | S7–S8 |
| Gestión de Actividades | RF-02 | Sprint 1 | S7–S8 |
| Gestión de Actas | RF-03 | Sprint 1 | S7–S8 |
| Rendición Financiera | RF-04 | Sprint 2 | S9–S10 |
| Proveedores y Solicitudes | RF-05 | Sprint 2 | S9–S10 |
| Inventario | RF-06 | Sprint 3 | S11–S12 |
| Auditoría | RF-08 | Sprint 3 | S11–S12 |
| Reportes | RF-07 | Sprint 4 | S13–S14 |

---

## Evidencias del Proyecto

| Nro. | Evidencia | Sprint/Fase asociada | Fecha estimada |
|---|---|---|---|
| 1 | Acta de reunión con el cliente | Fase 1 (S1) | 09/03/2026 |
| 2 | Documento de requerimientos (Product Backlog) | Fase 1 (S2–S4) | 05/04/2026 |
| 3 | Modelo entidad-relación (MER) | Fase 2 (S5) | 10/04/2026 |
| 4 | Diagrama de arquitectura | Fase 2 (S5) | 10/04/2026 |
| 5 | Código fuente del sistema (Backend + Frontend) | Fase 2–3 (S7–S14) | 14/06/2026 |
| 6 | Informe final del proyecto | Fase 3 (S16) | 25/06/2026 |

---

## Notas Importantes

- **Reuniones Scrum:** Se recomienda realizar Daily Standups (15 min) al menos 3 veces por semana.
- **Sprint Reviews:** Al finalizar cada sprint (S8, S10, S12, S14) se presenta avance al cliente.
- **Herramientas de gestión:** Trello para seguimiento de tareas, GitHub para control de versiones.
- **Entorno de desarrollo:** Todo el sistema debe levantarse con `docker compose up` (RNF-02).
- **El alcance MVP NO incluye:** migración de datos históricos, integración con sistemas del Estado, firma electrónica avanzada ni app móvil nativa.
