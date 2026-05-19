import { useState } from 'react'
import axios from 'axios'

import { ExportDocumentsDialog } from '@/features/documents/components/ExportDocumentsDialog'
import { downloadActivitiesExcelReport } from '@/features/documents/api/documents-reports.api'
export function AdminReportsPage() {
  const [exportDocsOpen, setExportDocsOpen] = useState(false)
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onExportActivities = async () => {
    setLoadingActivities(true)
    setError(null)
    try {
      await downloadActivitiesExcelReport(year, month)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          (err.response?.data as { message?: string } | undefined)?.message ?? err.message,
        )
      } else {
        setError('No se pudo generar el reporte de actividades.')
      }
    } finally {
      setLoadingActivities(false)
    }
  }

  return (
    <div className="min-h-screen p-margin bg-surface">
      <div className="max-w-container-max mx-auto space-y-8">
        <section>
          <h2 className="text-4xl font-bold text-sb-dark-purple">Reportes institucionales</h2>
          <p className="text-on-surface-variant">Exportaciones Excel del backend (solo administrador).</p>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md shadow-sm max-w-md">
          <h3 className="font-bold text-sb-dark-purple mb-2">Documentos por rango de fechas</h3>
          <p className="text-sm text-on-surface-variant mb-4">GET /reports/documents</p>
          <button
            type="button"
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold"
            onClick={() => setExportDocsOpen(true)}
          >
            Exportar documentos…
          </button>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md shadow-sm max-w-md space-y-3">
          <h3 className="font-bold text-sb-dark-purple">Actividades por mes</h3>
          <p className="text-sm text-on-surface-variant">GET /reports/activities</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-on-surface-variant">Año</label>
              <input
                type="number"
                min={2000}
                max={2100}
                className="w-full mt-1 p-2 border rounded-lg text-sm"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-on-surface-variant">Mes</label>
              <input
                type="number"
                min={1}
                max={12}
                className="w-full mt-1 p-2 border rounded-lg text-sm"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              />
            </div>
          </div>
          {error && <p className="text-sm text-error" role="alert">{error}</p>}
          <button
            type="button"
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold disabled:opacity-50"
            disabled={loadingActivities}
            onClick={onExportActivities}
          >
            {loadingActivities ? 'Generando…' : 'Descargar Excel de actividades'}
          </button>
        </section>
      </div>

      <ExportDocumentsDialog open={exportDocsOpen} onClose={() => setExportDocsOpen(false)} />
    </div>
  )
}
