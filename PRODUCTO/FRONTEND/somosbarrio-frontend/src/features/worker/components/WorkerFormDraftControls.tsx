import type { ReactNode } from 'react'

import { Button } from '@/shared/components/ui/button'

interface WorkerFormDraftControlsProps {
  pendingLabel: string | null
  notice: string | null
  onSaveDraft: () => void
  onRestoreDraft: () => void
  onDiscardDraft: () => void
  children: ReactNode
  saveDisabled?: boolean
  submitDisabled?: boolean
}

export function WorkerFormDraftControls({
  pendingLabel,
  notice,
  onSaveDraft,
  onRestoreDraft,
  onDiscardDraft,
  children,
  saveDisabled,
  submitDisabled,
}: WorkerFormDraftControlsProps) {
  return (
    <div className="space-y-3">
      {pendingLabel ? (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950"
          role="status"
        >
          <p className="font-medium">Tienes un borrador en este dispositivo</p>
          <p className="mt-1 text-xs text-amber-900/80">Guardado el {pendingLabel}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={onRestoreDraft}>
              Restaurar borrador
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onDiscardDraft}>
              Descartar
            </Button>
          </div>
        </div>
      ) : null}

      {notice ? (
        <p className="text-sm text-emerald-700" role="status">
          {notice}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Button
          type="button"
          variant="outline"
          onClick={onSaveDraft}
          disabled={saveDisabled || submitDisabled}
        >
          Guardar en borrador
        </Button>
        {children}
      </div>
    </div>
  )
}
