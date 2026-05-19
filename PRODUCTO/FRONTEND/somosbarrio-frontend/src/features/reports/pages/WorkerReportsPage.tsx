import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

import { Button } from '@/shared/components/ui/button'
import { createWorkerReport } from '@/features/reports/api/reports.api'
import { WorkerFormDraftControls } from '@/features/worker/components/WorkerFormDraftControls'
import { useWorkerFormDraft } from '@/features/worker/hooks/useWorkerFormDraft'
import { useDefaultActivityId } from '@/features/worker/hooks/useDefaultActivityId'
import { useAuthStore } from '@/store/authStore'
import { SB_COLORS } from '@/shared/constants/colors'

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
      <Button 
        type="button" 
        onClick={() => inputRef.current?.click()}
        style={{ backgroundColor: SB_COLORS.PURPLE }}
        className="text-white hover:opacity-90 font-semibold"
      >
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

  const draft = useWorkerFormDraft('reporte', {
    getValues: useCallback(() => ({ title, description }), [title, description]),
    applyValues: useCallback((data: { title: string; description: string }) => {
      setTitle(data.title)
      setDescription(data.description)
    }, []),
  })

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
      draft.clearDraft()
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
    <div className="min-h-screen p-margin bg-surface">
      <div className="max-w-container-max mx-auto space-y-5">
        <PageHeader navigate={navigate} />

        <form
          className="space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md shadow-sm"
          onSubmit={(e) => {
            e.preventDefault()
            setLocalOk(null)
            mutation.mutate()
          }}
        >
          <div>
            <label htmlFor="report-title" className="mb-1 block text-sm font-semibold text-sb-dark-purple">
              Título del reporte
            </label>
            <input
              id="report-title"
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sb-purple/30 transition-all"
              placeholder="Ej: luminaria apagada en pasaje 4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="report-description" className="mb-1 block text-sm font-semibold text-sb-dark-purple">
              Descripción
            </label>
            <textarea
              id="report-description"
              className="min-h-28 w-full rounded-lg border border-outline-variant px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sb-purple/30 transition-all"
              placeholder="Describe brevemente lo observado..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface-container-low/30 p-4">
            <p className="mb-3 text-sm font-bold text-sb-dark-purple uppercase tracking-wider">Fotografías</p>
            <ImagePickerButton
              inputRef={photosInputRef}
              inputId="report-photos"
              multiple
              onPick={addPhotos}
            />
            <p className="mt-2 text-xs text-on-surface-variant font-medium">
              En celular puedes abrir la cámara directamente. Puedes agregar varias imágenes.
            </p>

            <div className="mt-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-on-surface-variant">Vista previa</p>
                {photos.length > 0 ? (
                  <span className="text-xs font-semibold text-emerald-700">
                    {photos.length} imagen{photos.length === 1 ? '' : 'es'} lista
                    {photos.length === 1 ? '' : 's'} para enviar
                  </span>
                ) : null}
              </div>

              {photos.length === 0 ? (
                <div className="flex min-h-[7rem] items-center justify-center rounded-lg border border-dashed border-outline-variant bg-surface-container-low/20 px-4 py-6 text-center text-xs text-on-surface-variant">
                  Aún no hay imágenes. Usa «Agregar imagen» para ver la miniatura aquí.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-sm"
                    >
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="h-28 w-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-sb-red transition-colors"
                        onClick={() => removePhoto(photo.id)}
                        aria-label={`Quitar ${photo.name}`}
                      >
                        Quitar
                      </button>
                      <p className="truncate px-2 py-1 text-[10px] text-on-surface-variant font-medium">
                        {photo.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {errorMessage ? (
            <p className="text-sm font-semibold text-sb-red" role="alert">
              {errorMessage}
            </p>
          ) : null}
          {localOk ? (
            <p className="text-sm font-semibold text-emerald-600" role="status">
              {localOk}
            </p>
          ) : null}

          <WorkerFormDraftControls
            pendingLabel={draft.pendingLabel}
            notice={draft.notice}
            onSaveDraft={draft.saveDraft}
            onRestoreDraft={draft.restoreDraft}
            onDiscardDraft={draft.discardDraft}
            submitDisabled={mutation.isPending}
          >
            <Button 
              type="submit" 
              disabled={mutation.isPending || photos.length === 0}
              style={{ backgroundColor: SB_COLORS.PURPLE }}
              className="text-white hover:opacity-90 font-bold shadow-sm"
            >
              {mutation.isPending ? 'Enviando…' : 'Enviar reporte'}
            </Button>
          </WorkerFormDraftControls>
        </form>
      </div>
    </div>
  )
}

function PageHeader({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mb-2 flex items-center gap-2 text-sm text-on-surface-variant hover:text-sb-dark-purple font-medium transition-colors"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Volver al Panel de Control
      </button>
      <h2 className="text-3xl font-bold text-sb-dark-purple">Reporte rápido</h2>
      <p className="mt-1 text-sm text-on-surface-variant">
        Registro de incidencia con evidencias fotográficas.
      </p>
    </div>
  )
}