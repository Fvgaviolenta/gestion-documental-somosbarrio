import { useCallback, useEffect, useState } from 'react'

import {
  clearWorkerDraft,
  formatDraftSavedAt,
  isDraftDataEmpty,
  loadWorkerDraft,
  saveWorkerDraft,
  type StoredWorkerDraft,
  type WorkerDraftKind,
} from '@/features/worker/lib/worker-form-draft'

interface UseWorkerFormDraftOptions<T extends object> {
  getValues: () => T
  applyValues: (data: T) => void
}

export function useWorkerFormDraft<T extends object>(
  kind: WorkerDraftKind,
  { getValues, applyValues }: UseWorkerFormDraftOptions<T>,
) {
  const [pending, setPending] = useState<StoredWorkerDraft<T> | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    const stored = loadWorkerDraft<T>(kind)
    setPending(stored)
  }, [kind])

  const saveDraft = useCallback(() => {
    const data = getValues()
    if (isDraftDataEmpty(data)) {
      setNotice('Escribe algo en el formulario antes de guardar el borrador.')
      return
    }
    saveWorkerDraft(kind, data)
    setPending(null)
    setNotice('Borrador guardado en este dispositivo.')
  }, [kind, getValues])

  const restoreDraft = useCallback(() => {
    if (!pending) return
    applyValues(pending.data)
    setPending(null)
    setNotice('Borrador restaurado.')
  }, [pending, applyValues])

  const discardDraft = useCallback(() => {
    clearWorkerDraft(kind)
    setPending(null)
    setNotice('Borrador descartado.')
  }, [kind])

  const clearDraft = useCallback(() => {
    clearWorkerDraft(kind)
    setPending(null)
  }, [kind])

  const dismissNotice = useCallback(() => setNotice(null), [])

  return {
    pending,
    pendingLabel: pending ? formatDraftSavedAt(pending.savedAt) : null,
    notice,
    saveDraft,
    restoreDraft,
    discardDraft,
    clearDraft,
    dismissNotice,
  }
}
