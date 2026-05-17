import { useEffect, useRef, useState, type RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

import { Button } from '@/shared/components/ui/button'
import { createWorkerReport } from '@/features/reports/api/reports.api'
import { useDefaultActivityId } from '@/features/worker/hooks/useDefaultActivityId'
import { useAuthStore } from '@/store/authStore'

function ImagePickerButton({
  inputRef,
  inputId,
  multiple,
  onPick,
}: {
  inputRef: RefObject<HTMLInputElement | null>
  inputId: string
  multiple?: boolean
  onPick: (files: FileList | null) => void
}) {
  return (
    <>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          onPick(e.target.files)
          e.target.value = ''
        }}
      />
      <Button type="button" onClick={() => inputRef.current?.click()}>
        Agregar imagen
      </Button>
    </>
  )
}

interface PhotoPreview {
  id: string
  name: string
  url: string
  file: File
}

export function WorkerReportsPage() {
  const navigate = useNavigate()
  const accessToken = useAuthStore((s) => s.accessToken)
  const { data: activityId } = useDefaultActivityId()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<PhotoPreview[]>([])
  const [localOk, setLocalOk] = useState<string | null>(null)
  const photosInputRef = useRef<HTMLInputElement>(null)
  const allocatedUrlsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const allocated = allocatedUrlsRef.current
    return () => {
      for (const url of allocated) URL.revokeObjectURL(url)
      allocated.clear()
    }
  }, [])

  const addPhotos = (files: FileList | null) => {
    if (!files?.length) return
    const next = Array.from(files).map((file) => {
      const url = URL.createObjectURL(file)
      allocatedUrlsRef.current.add(url)
      return {
        id: crypto.randomUUID(),
        name: file.name,
        url,
        file,
      }
    })
    setPhotos((prev) => [...prev, ...next])
  }

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id)
      if (target) {
        URL.revokeObjectURL(target.url)
        allocatedUrlsRef.current.delete(target.url)
      }
      return prev.filter((p) => p.id !== id)
    })
  }

  const clearPhotos = () => {
    setPhotos((prev) => {
      for (const photo of prev) {
        URL.revokeObjectURL(photo.url)
        allocatedUrlsRef.current.delete(photo.url)
      }
      return []
    })
  }

  const mutation = useMutation({
    mutationFn: () =>
      createWorkerReport({
        title,
        description,
        photos: photos.map((p) => p.file),
        activityId,
      }),
    onSuccess: () => {
      setTitle('')
      setDescription('')
      clearPhotos()
      setLocalOk('Reporte enviado correctamente.')
    },
  })

  const errorMessage = (() => {
    if (!mutation.isError) return null
    if (accessToken?.startsWith('mock')) {
      return 'El modo mock no persiste en el API. Use colaborador1@somosbarrio.cl con backend activo.'
    }
    if (!axios.isAxiosError(mutation.error)) return 'No se pudo enviar el reporte.'
    return (
      (mutation.error.response?.data as { message?: string } | undefined)?.message ??
      mutation.error.message
    )
  })()

  return (
    <section className="space-y-5">
      <PageHeader navigate={navigate} />

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
            Título del reporte
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
            Descripción
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

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4">
          <p className="mb-3 text-sm font-medium text-[var(--color-foreground)]">Fotografías</p>
          <ImagePickerButton
            inputRef={photosInputRef}
            inputId="report-photos"
            multiple
            onPick={addPhotos}
          />
          <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
            En celular puedes abrir la cámara directamente. Puedes agregar varias imágenes.
          </p>

          <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/5 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-[var(--color-foreground)]">Vista previa</p>
              {photos.length > 0 ? (
                <span className="text-xs text-emerald-700">
                  {photos.length} imagen{photos.length === 1 ? '' : 'es'} lista
                  {photos.length === 1 ? '' : 's'} para enviar
                </span>
              ) : null}
            </div>

            {photos.length === 0 ? (
              <div className="flex min-h-[7rem] items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-background)] px-4 py-6 text-center text-xs text-[var(--color-muted-foreground)]">
                Aún no hay imágenes. Usa «Agregar imagen» para ver la miniatura aquí.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative overflow-hidden rounded-lg border border-[var(--color-border)] bg-white"
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="h-28 w-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-black"
                      onClick={() => removePhoto(photo.id)}
                      aria-label={`Quitar ${photo.name}`}
                    >
                      Quitar
                    </button>
                    <p className="truncate px-2 py-1 text-[10px] text-[var(--color-muted-foreground)]">
                      {photo.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

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

function PageHeader({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/trabajador')}
        className="mb-2 flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Volver al Home
      </button>
      <h2 className="text-2xl font-bold text-[var(--color-foreground)]">Reporte rápido</h2>
      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
        Registro de incidencia con evidencias fotográficas.
      </p>
    </div>
  )
}
