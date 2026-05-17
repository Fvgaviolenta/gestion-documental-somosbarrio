# Somos Barrio Frontend

Frontend de la **Plataforma de Gestión Documental Somos Barrio** para la Subsecretaría de Prevención del Delito (Viña del Mar - Sector Miraflores).

> Esta versión consolida el trabajo paralelo del equipo (aran + stephanía) tomando como base la arquitectura modular por features y aplicando un baseline de calidad técnica con TypeScript estricto. Ver la documentación interna para los detalles de la integración.

## Stack

- React 19 (o versión activa en el proyecto)
- TypeScript (Modo estricto con `verbatimModuleSyntax`)
- Vite (Herramienta de empaquetado y HMR)
- Tailwind CSS (Estilos y sistema de diseño institucional)
- React Router Dom (Enrutamiento SPA)
- Axios (Cliente HTTP con interceptores de ciclo de vida)
- Material Symbols (Iconografía institucional)
- ESLint + Prettier (Estilo de código y linting)

## Setup local (primera vez)

### 1) Prerrequisitos

| Herramienta | Como verificar |
|---|---|
| Node.js (v18+ recomendado) | `node -v` |
| NPM (v9+) | `npm -v` |

### 2) Levantar el entorno de desarrollo

```bash
cd somosbarrio-frontend
# Crear archivo de variables de entorno si no existe
cp .env.example .env
# Instalar dependencias del proyecto
npm install
# Levantar servidor local con Hot Module Replacement (HMR)
npm run dev

```

Servicios:

* Frontend de React en `http://localhost:5173` (o el puerto asignado por Vite)
* Conexión por defecto a la API del Backend en `http://localhost:8080` (v1)

### 3) Configuración del Entorno (.env)

Asegúrate de que tu archivo `.env` en la raíz apunte correctamente al puerto operativo del backend:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1

```

## Rutas útiles para validar

| URL | Que hace |
| --- | --- |
| `http://localhost:5173/` | Pantalla de Login General / Redirección por estado de sesión |
| `http://localhost:5173/admin/dashboard` | Panel de Control Central para el rol ADMINISTRADOR |
| `http://localhost:5173/worker/activities` | Listado y gestión operativa para el rol COLABORADOR |

## Auth M1 (roles simplificados)

Roles activos y protegidos en las rutas del frontend:

* `ADMINISTRADOR`
* `COLABORADOR`

Flujo de Autenticación:

* **Rutas Protegidas**: Manejadas mediante `ProtectedRoute.tsx` y `WorkerRoute.tsx` para interceptar accesos no autorizados.
* **Robustez de Token**: El archivo `src/shared/lib/axios.ts` incluye un interceptor de respuesta que captura el error `TOKEN_INVALID` o la expiración del JWT, intentando un flujo automático de *refresh token* exactamente una vez antes de destruir la sesión local.

## Estructura de carpetas (Screaming Architecture)

```
src/
  app/                           <- Configuración global, enrutador y proveedores
    layouts/                     <- AppLayout, AuthLayout, WorkerLayout
    providers.tsx                <- Contextos globales de la aplicación
    router.tsx                   <- Árbol de rutas de React Router
    WorkerRoute.tsx              <- Middleware de protección para Colaboradores
  assets/                        <- Logotipos (Somos Barrio), imágenes y recursos estáticos
  features/                      <- Módulos empaquetados por dominio de negocio
    auth/                        <- Login, recuperación, hooks de sesión y mutaciones de estado
    activities/                  <- Panel de control, flujos y formularios de actividades comunitarias
    worker-logbook/              <- Páginas y lógica de la bitácora operativa
    worker-minutes/              <- Creación y gestión de actas de reuniones
  shared/                        <- Componentes y utilidades reutilizables globalmente
    components/                  <- SideNavBar, BackButton, elementos comunes de la UI
    constants/                   <- colors.ts (Paleta institucional: Coral, Púrpura, Cian)
    lib/                         <- Instancia y configuración de Axios
    types/                       <- enums.ts (Definición estricta de UserRole)
  index.css                      <- Estilos globales y variables core de Tailwind CSS
  main.tsx                       <- Punto de entrada de la aplicación React

```

## Paleta de Colores Institucional

Las constantes visuales viven en `src/shared/constants/colors.ts` y están extendidas en `tailwind.config.js` bajo el prefijo `sb-` para asegurar consistencia con el manual de marca:

| Color | Hexadecimal | Ubicación en UI / Componente |
| --- | --- | --- |
| **Rojo Coral** | `#E55B5B` | Alertas activas y estados de criticidad |
| **Púrpura Normal** | `#6B3F82` | Botones de acción principales, elementos interactivos del menú |
| **Cian Turquesa** | `#70C5CE` | Badges de estados óptimos o sincronizados |
| **Púrpura Oscuro** | `#5B3A7D` | Títulos principales de páginas, jerarquías altas de texto y cifras de KPIs |

## Comandos útiles

```bash
# Instalar dependencias limpias
npm install

# Correr el servidor de desarrollo local
npm run dev

# Compilar la aplicación y generar el Build estático de producción
npm run build

# Previsualizar el Build de producción localmente
npm run preview

# Ejecutar el Linter para comprobar errores de estilo de código
npm run lint

```

## Mapa de módulos y Brechas (UI vs Backend)

| Módulo Frontend | RF Relacionado | Estado de Integración Lógica |
| --- | --- | --- |
| M0 Setup e Infraestructura Base | - | Completo (Estructura por Features) |
| M1 Login e Interceptores (RBAC) | RF-01 | Completo (Sincronizado con enums de backend) |
| M2 Panel de Actividades | RF-02 | Completo (Payload alineado a `startDate`) |
| M3 Formularios Operativos (Bitácora/Actas) | RF-03 | Completo (Navegación circular UX integrada) |
| M4 Gestión Documental (Fino) | RF-03 | UI Completa / Lógica pendiente de mapeo de estados |
| M5 Bandeja de Entrada y Configuración | RF-04 | Pendiente (Presentes como marcadores de posición en UI) |
| M6 Reportes y Exportación | RF-06 | UI Completa (Acciones lógicas pendientes de endpoints) |