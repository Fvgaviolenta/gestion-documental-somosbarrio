export type WorkerDraftKind = 'reporte' | 'bitacora' | 'acta'

export interface StoredWorkerDraft<T> {
  savedAt: string
  data: T
}

const STORAGE_PREFIX = 'sb-worker-draft'

export function isDraftDataEmpty(data: object): boolean {
  return Object.values(data).every(
    (value) => typeof value !== 'string' || !value.trim(),
  )
}

export function getWorkerDraftUserKey(): string {
  try {
    const raw = localStorage.getItem('sb-auth')
    if (!raw) return 'anonymous'
    const parsed = JSON.parse(raw) as {
      state?: { user?: { email?: string; id?: string | number } }
    }
    const user = parsed.state?.user
    if (user?.email) return user.email
    if (user?.id != null) return String(user.id)
  } catch {
    // ignore malformed storage
  }
  return 'anonymous'
}

function storageKey(kind: WorkerDraftKind): string {
  return `${STORAGE_PREFIX}:${kind}:${getWorkerDraftUserKey()}`
}

export function loadWorkerDraft<T extends object>(
  kind: WorkerDraftKind,
): StoredWorkerDraft<T> | null {
  try {
    const raw = localStorage.getItem(storageKey(kind))
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredWorkerDraft<T>
    if (!parsed?.data || typeof parsed.savedAt !== 'string') return null
    if (isDraftDataEmpty(parsed.data)) return null
    return parsed
  } catch {
    return null
  }
}

export function saveWorkerDraft<T extends object>(
  kind: WorkerDraftKind,
  data: T,
): StoredWorkerDraft<T> {
  const stored: StoredWorkerDraft<T> = {
    savedAt: new Date().toISOString(),
    data,
  }
  localStorage.setItem(storageKey(kind), JSON.stringify(stored))
  return stored
}

export function clearWorkerDraft(kind: WorkerDraftKind): void {
  localStorage.removeItem(storageKey(kind))
}

export function formatDraftSavedAt(iso: string): string {
  return new Date(iso).toLocaleString('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
