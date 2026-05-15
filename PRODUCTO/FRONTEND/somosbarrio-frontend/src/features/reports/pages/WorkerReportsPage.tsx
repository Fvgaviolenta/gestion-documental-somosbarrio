import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

import { Button } from '@/shared/components/ui/button'
import { createWorkerReport } from '@/features/reports/api/reports.api'

export function WorkerReportsPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [localOk, setLocalOk] = useState<string | null>(null)

  const previews = useMemo(
    () =>
      photos.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [photos],
  )

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [previews])

  const mutation = useMutation({
    mutationFn: () =>
      createWorkerReport({
        title,
        description,
        photos,
      }),
    onSuccess: () => {
      setTitle('')
      setDescription('')
      setPhotos([])
      setLocalOk('Reporte enviado correctamente.')
    },
  })

  const errorMessage = (() => {
    if (!mutation.isError) return null
    if (!axios.isAxiosError(mutation.error)) return 'No se pudo enviar el reporte.'
    if (mutation.error.response?.status === 404) {
      return 'El endpoint de reportes aún no existe en backend; la vista y carga de fotos ya quedaron listas.'
    }
    return (
      (mutation.error.response?.data as { message?: string } | undefined)?.message ??
      mutation.error.message
    )
  })()

  return (
    <section className="space-y-5">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="mb-2 flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Volver
        </button>
        <h2 className="text-2xl font-bold text-[var(--color-foreground)]">Reportar incidencia</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Puedes subir fotos desde tu celular usando la c&aacute;mara o galeria.
        </p>
        <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
          Complemento del módulo trabajador junto a Bitácora y Actas.
        </p>
      </div>

      <form
        className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault()
          setLocalOk(null)
          mutation.mutate()
        }}
      >
        <div>
          <label htmlFor="report-title" className="mb-1 block text-sm font-medium">
            T&iacute;tulo del reporte
          </label>
          <input
            id="report-title"
            className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none ring-[var(--color-primary)] focus:ring-2"
            placeholder="Ej: luminaria apagada en pasaje 4"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="report-description" className="mb-1 block text-sm font-medium">
            Descripci&oacute;n
          </label>
          <textarea
            id="report-description"
            className="min-h-28 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none ring-[var(--color-primary)] focus:ring-2"
            placeholder="Describe brevemente lo observado..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="report-photos" className="mb-1 block text-sm font-medium">
            Fotograf&iacute;as
          </label>
          <input
            id="report-photos"
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="block w-full text-sm"
            onChange={(e) => {
              const selected = Array.from(e.target.files ?? [])
              setPhotos(selected)
            }}
          />
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
            En celular puedes abrir la c&aacute;mara directamente.
          </p>
        </div>

        {previews.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {previews.map((preview) => (
              <article key={preview.name} className="overflow-hidden rounded-lg border border-[var(--color-border)]">
                <img src={preview.url} alt={preview.name} className="h-28 w-full object-cover" />
                <p className="truncate px-2 py-1 text-xs">{preview.name}</p>
              </article>
            ))}
          </div>
        ) : null}

        {errorMessage ? (
          <p className="text-sm text-[var(--color-destructive)]" role="alert">
            {errorMessage}
          </p>
        ) : null}
        {localOk ? (
          <p className="text-sm text-emerald-600" role="status">
            {localOk}
          </p>
        ) : null}

        <Button type="submit" disabled={mutation.isPending || photos.length === 0}>
          {mutation.isPending ? 'Enviando…' : 'Enviar reporte'}
        </Button>
      </form>
    </section>
  )
}
