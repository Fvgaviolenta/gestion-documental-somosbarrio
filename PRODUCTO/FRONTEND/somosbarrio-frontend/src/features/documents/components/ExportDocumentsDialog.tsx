import { useState } from 'react'
import axios from 'axios'

import { downloadDocumentsExcelReport } from '@/features/documents/api/documents-reports.api'
import { Button } from '@/shared/components/ui/button'

interface ExportDocumentsDialogProps {
  open: boolean
  onClose: () => void
}

function defaultRange() {
  const to = new Date()
  const from = new Date()
  from.setMonth(from.getMonth() - 1)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return { from: fmt(from), to: fmt(to) }
}

export function ExportDocumentsDialog({ open, onClose }: ExportDocumentsDialogProps) {
  const [range, setRange] = useState(defaultRange)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const onExport = async () => {
    setLoading(true)
    setError(null)
    try {
      await downloadDocumentsExcelReport(range.from, range.to)
      onClose()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          (err.response?.data as { message?: string } | undefined)?.message ?? err.message,
        )
      } else {
        setError('No se pudo generar el reporte.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-documents-title"
    >
      <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5 shadow-lg">
        <h3 id="export-documents-title" className="text-lg font-semibold">
          Exportar documentos
        </h3>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Descarga un Excel con los documentos creados en el rango de fechas (formato YYYY-MM-DD).
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="export-from" className="mb-1 block text-sm font-medium">
              Desde
            </label>
            <input
              id="export-from"
              type="date"
              className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm"
              value={range.from}
              onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="export-to" className="mb-1 block text-sm font-medium">
              Hasta
            </label>
            <input
              id="export-to"
              type="date"
              className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm"
              value={range.to}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
            />
          </div>
        </div>

        {error ? (
          <p className="mt-3 text-sm text-[var(--color-destructive)]" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="button" onClick={onExport} disabled={loading || !range.from || !range.to}>
            {loading ? 'Generando…' : 'Descargar Excel'}
          </Button>
        </div>
      </div>
    </div>
  )
}
