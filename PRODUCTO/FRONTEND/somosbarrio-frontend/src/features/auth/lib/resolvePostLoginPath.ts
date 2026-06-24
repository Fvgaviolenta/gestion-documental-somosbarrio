import type { Role } from '@/shared/types/enums'

const ADMIN_ONLY_PREFIXES = [
  '/users',
  '/reports',
  '/document-templates',
  '/recipient-groups',
  '/audit-logs',
  '/suppliers',
] as const

function isAdminOnlyPath(path: string): boolean {
  return ADMIN_ONLY_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

/** Ruta destino tras login según roles del usuario y la URL que intentaba visitar. */
export function resolvePostLoginPath(roles: Role[], from?: string | null): string {
  const isAdmin = roles.includes('ADMINISTRADOR')
  const isWorker = roles.includes('COLABORADOR')

  if (!isAdmin && !isWorker) return '/login'

  const safeFrom =
    from && from !== '/login' && !from.startsWith('/trabajador/login') ? from : null

  if (safeFrom) {
    if (isAdminOnlyPath(safeFrom) && !isAdmin) return '/'
    if (safeFrom.startsWith('/trabajador') && !isWorker) return '/'
    return safeFrom
  }

  // Portal institucional moderno (HomePage + AppLayout) para admin y colaborador.
  return '/'
}
