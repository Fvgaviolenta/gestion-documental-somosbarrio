import { type FormEvent, useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { useNavigate } from 'react-router-dom'

import { DateInput } from '@/shared/components/DateInput'
import { Button } from '@/shared/components/ui/button'
import type { MinuteFormContent } from '@/features/minutes/types'
import { WorkerFormDraftControls } from '@/features/worker/components/WorkerFormDraftControls'
import { useWorkerFormDraft } from '@/features/worker/hooks/useWorkerFormDraft'
import { WorkerMinutesHistoryList } from '@/features/worker-minutes/components/WorkerMinutesHistoryList'
import {
  formatMinuteError,
  useWorkerMinutesList,
  useWorkerMinutesSubmit,
} from '@/features/worker-minutes/hooks/useWorkerMinutesSubmit'
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
    <div>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
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
    </div>
  )
}

interface UploadedImage {
  name: string
  url: string
  file: File
}

const tableShell =
  'w-full overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]'
const cellLabel =
  'w-[38%] align-top border border-[var(--color-border)] bg-[var(--color-muted)]/25 px-3 py-2 text-sm font-medium text-[var(--color-foreground)]'
const cellInput = 'align-top border border-[var(--color-border)] p-0'

export function WorkerMinutesPage() {
  const navigate = useNavigate()
  const allocatedUrlsRef = useRef<Set<string>>(new Set())
  const firmaGestorInputRef = useRef<HTMLInputElement>(null)
  const firmaContraparteInputRef = useRef<HTMLInputElement>(null)
  const mediosInputRef = useRef<HTMLInputElement>(null)
  const registroInputRef = useRef<HTMLInputElement>(null)
  const accessToken = useAuthStore((s) => s.accessToken)
  const apiEnabled = Boolean(accessToken) && !accessToken?.startsWith('mock')
  const minutesQuery = useWorkerMinutesList(apiEnabled)
  const submitMutation = useWorkerMinutesSubmit()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitOk, setSubmitOk] = useState<string | null>(null)

  const [numeroActa, setNumeroActa] = useState('')
  const [proyecto, setProyecto] = useState('')
  const [comuna, setComuna] = useState('')
  const [barrio, setBarrio] = useState('')
  const [reunionConvocadaPor, setReunionConvocadaPor] = useState('')
  const [fechaActividad, setFechaActividad] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [horaTermino, setHoraTermino] = useState('')
  const [lugarReunion, setLugarReunion] = useState('')
  const [motivoObjetivo, setMotivoObjetivo] = useState('')
  const [resumenTemas, setResumenTemas] = useState('')
  const [compromisosResponsabilidades, setCompromisosResponsabilidades] = useState('')
  const [gestorBarrial, setGestorBarrial] = useState('')
  const [accion, setAccion] = useState('')
  const [firma, setFirma] = useState<UploadedImage | null>(null)
  const [contraparteSpd, setContraparteSpd] = useState('')
  const [accionContraparte, setAccionContraparte] = useState('')
  const [firmaContraparte, setFirmaContraparte] = useState<UploadedImage | null>(null)
  const [mediosVerificadores, setMediosVerificadores] = useState<UploadedImage[]>([])
  const [registroFotografico, setRegistroFotografico] = useState<UploadedImage[]>([])

  const getTextFields = useCallback(
    (): MinuteFormContent => ({
      numeroActa,
      proyecto,
      comuna,
      barrio,
      reunionConvocadaPor,
      fechaActividad,
      horaInicio,
      horaTermino,
      lugarReunion,
      motivoObjetivo,
      resumenTemas,
      compromisosResponsabilidades,
      gestorBarrial,
      accion,
      contraparteSpd,
      accionContraparte,
    }),
    [
      numeroActa,
      proyecto,
      comuna,
      barrio,
      reunionConvocadaPor,
      fechaActividad,
      horaInicio,
      horaTermino,
      lugarReunion,
      motivoObjetivo,
      resumenTemas,
      compromisosResponsabilidades,
      gestorBarrial,
      accion,
      contraparteSpd,
      accionContraparte,
    ],
  )

  const applyTextFields = useCallback((data: MinuteFormContent) => {
    setNumeroActa(data.numeroActa)
    setProyecto(data.proyecto)
    setComuna(data.comuna)
    setBarrio(data.barrio)
    setReunionConvocadaPor(data.reunionConvocadaPor)
    setFechaActividad(data.fechaActividad)
    setHoraInicio(data.horaInicio)
    setHoraTermino(data.horaTermino)
    setLugarReunion(data.lugarReunion)
    setMotivoObjetivo(data.motivoObjetivo)
    setResumenTemas(data.resumenTemas)
    setCompromisosResponsabilidades(data.compromisosResponsabilidades)
    setGestorBarrial(data.gestorBarrial)
    setAccion(data.accion)
    setContraparteSpd(data.contraparteSpd)
    setAccionContraparte(data.accionContraparte)
  }, [])

  const draft = useWorkerFormDraft('acta', {
    getValues: getTextFields,
    applyValues: applyTextFields,
  })

  useEffect(() => {
    const allocatedUrls = allocatedUrlsRef.current
    return () => {
      for (const url of allocatedUrls) URL.revokeObjectURL(url)
      allocatedUrls.clear()
    }
  }, [])

  const createPreviewImages = (files: FileList | null): UploadedImage[] => {
    if (!files) return []
    return Array.from(files).map((file) => {
      const url = URL.createObjectURL(file)
      allocatedUrlsRef.current.add(url)
      return { name: file.name, url, file }
    })
  }

  const collectAttachmentFiles = (): File[] => {
    const files: File[] = []
    if (firma) files.push(firma.file)
    if (firmaContraparte) files.push(firmaContraparte.file)
    for (const image of mediosVerificadores) files.push(image.file)
    for (const image of registroFotografico) files.push(image.file)
    return files
  }

  const revokeImageUrl = (url: string) => {
    URL.revokeObjectURL(url)
    allocatedUrlsRef.current.delete(url)
  }

  const removeMedioAt = (url: string) => {
    revokeImageUrl(url)
    setMediosVerificadores((prev) => prev.filter((i) => i.url !== url))
  }

  const removeRegistroAt = (url: string) => {
    revokeImageUrl(url)
    setRegistroFotografico((prev) => prev.filter((i) => i.url !== url))
  }

  const clearForm = () => {
    setNumeroActa('')
    setProyecto('')
    setComuna('')
    setBarrio('')
    setReunionConvocadaPor('')
    setFechaActividad('')
    setHoraInicio('')
    setHoraTermino('')
    setLugarReunion('')
    setMotivoObjetivo('')
    setResumenTemas('')
    setCompromisosResponsabilidades('')
    setGestorBarrial('')
    setAccion('')
    setFirma(null)
    setContraparteSpd('')
    setAccionContraparte('')
    setFirmaContraparte(null)
    setMediosVerificadores([])
    setRegistroFotografico([])
  }

  const submitDraft = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitOk(null)

    if (accessToken?.startsWith('mock')) {
      setSubmitError('El modo mock no persiste en el API. Use colaborador1@somosbarrio.cl con backend activo.')
      return
    }

    submitMutation.mutate(
      {
        fields: getTextFields(),
        files: collectAttachmentFiles(),
      },
      {
        onSuccess: () => {
          clearForm()
          draft.clearDraft()
          setSubmitOk('Acta enviada a revisión correctamente.')
        },
        onError: (error) => setSubmitError(formatMinuteError(error)),
      },
    )
  }

  const inputClass =
    'w-full border-0 bg-transparent px-3 py-2 text-sm outline-none ring-[var(--color-primary)] focus:ring-2 focus:ring-inset rounded-none'
  const textareaClass =
    'min-h-28 w-full resize-y border-0 bg-transparent px-3 py-2 text-sm outline-none ring-[var(--color-primary)] focus:ring-2 focus:ring-inset'

  return (
    <section className="space-y-5">
      <header>
        <button
          onClick={() => navigate('/trabajador')}
          className="mb-2 flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Volver
        </button>
        <h2 className="text-2xl font-bold text-[var(--color-foreground)]">Acta de actividades</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Flujo sugerido: elaboración (colaborador/admin) — EN_REVISION — aprobación ADMINISTRADOR.
        </p>
      </header>

      <form
        className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 shadow-sm"
        onSubmit={submitDraft}
      >
        <div className={tableShell}>
          <table className="w-full border-collapse text-left">
            <tbody>
              <tr>
                <td className={cellLabel}>Número acta</td>
                <td className={cellInput}>
                  <input
                    className={inputClass}
                    value={numeroActa}
                    onChange={(e) => setNumeroActa(e.target.value)}
                    placeholder="Ej: 2025-042"
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className={cellLabel}>Proyecto</td>
                <td className={cellInput}>
                  <input
                    className={inputClass}
                    value={proyecto}
                    onChange={(e) => setProyecto(e.target.value)}
                    placeholder="Nombre del proyecto"
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className={cellLabel}>Comuna</td>
                <td className={cellInput}>
                  <input
                    className={inputClass}
                    value={comuna}
                    onChange={(e) => setComuna(e.target.value)}
                    placeholder="Comuna"
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className={cellLabel}>Barrio</td>
                <td className={cellInput}>
                  <input
                    className={inputClass}
                    value={barrio}
                    onChange={(e) => setBarrio(e.target.value)}
                    placeholder="Barrio o sector"
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className={cellLabel}>Reunión convocada por</td>
                <td className={cellInput}>
                  <input
                    className={inputClass}
                    value={reunionConvocadaPor}
                    onChange={(e) => setReunionConvocadaPor(e.target.value)}
                    placeholder="Persona u organización convocante"
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className={cellLabel}>Fecha de actividad</td>
                <td className={cellInput}>
                  <DateInput
                    className={inputClass}
                    value={fechaActividad}
                    onChange={setFechaActividad}
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className={cellLabel}>Hora inicio</td>
                <td className={cellInput}>
                  <input
                    type="time"
                    className={inputClass}
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className={cellLabel}>Hora término</td>
                <td className={cellInput}>
                  <input
                    type="time"
                    className={inputClass}
                    value={horaTermino}
                    onChange={(e) => setHoraTermino(e.target.value)}
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className={cellLabel}>Lugar reunión</td>
                <td className={cellInput}>
                  <input
                    className={inputClass}
                    value={lugarReunion}
                    onChange={(e) => setLugarReunion(e.target.value)}
                    placeholder="Dirección o referencia del lugar"
                    required
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={tableShell}>
          <table className="w-full border-collapse text-left">
            <tbody>
              <tr>
                <td className={cellLabel}>Motivo y/u objetivo de la reunión</td>
                <td className={cellInput}>
                  <textarea
                    className={textareaClass}
                    value={motivoObjetivo}
                    onChange={(e) => setMotivoObjetivo(e.target.value)}
                    placeholder="Describa el motivo y los objetivos de la reunión."
                    required
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={tableShell}>
          <table className="w-full border-collapse text-left">
            <tbody>
              <tr>
                <td className={cellLabel}>Resumen de temas tratados</td>
                <td className={cellInput}>
                  <textarea
                    className={textareaClass}
                    value={resumenTemas}
                    onChange={(e) => setResumenTemas(e.target.value)}
                    placeholder="Resumen de los temas abordados en la reunión."
                    required
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={tableShell}>
          <table className="w-full border-collapse text-left">
            <tbody>
              <tr>
                <td className={cellLabel}>Compromisos y responsabilidades</td>
                <td className={cellInput}>
                  <textarea
                    className={textareaClass}
                    value={compromisosResponsabilidades}
                    onChange={(e) => setCompromisosResponsabilidades(e.target.value)}
                    placeholder="Compromisos asumidos, plazos y responsables."
                    required
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={tableShell}>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[var(--color-muted)]/15">
                <th className="border border-[var(--color-border)] px-3 py-2 text-left text-sm font-semibold">
                  Gestor barrial
                </th>
                <th className="border border-[var(--color-border)] px-3 py-2 text-left text-sm font-semibold">
                  Acción
                </th>
                <th className="border border-[var(--color-border)] px-3 py-2 text-left text-sm font-semibold">
                  Firma
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={cellInput}>
                  <input
                    className={inputClass}
                    value={gestorBarrial}
                    onChange={(e) => setGestorBarrial(e.target.value)}
                    placeholder="Nombre gestor barrial"
                    required
                  />
                </td>
                <td className={cellInput}>
                  <input
                    className={inputClass}
                    value={accion}
                    onChange={(e) => setAccion(e.target.value)}
                    placeholder="Acción o compromiso asociado"
                    required
                  />
                </td>
                <td className="align-top border border-[var(--color-border)] p-2">
                  <ImagePickerButton
                    inputRef={firmaGestorInputRef}
                    inputId="firma-gestor"
                    onPick={(files) => {
                      const [image] = createPreviewImages(files)
                      setFirma(image ?? null)
                    }}
                  />
                  {firma ? (
                    <img
                      src={firma.url}
                      alt="Vista previa firma gestor barrial"
                      className="mt-2 h-28 w-full rounded border border-[var(--color-border)] object-contain bg-white p-2"
                    />
                  ) : (
                    <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                      La vista previa aparece al elegir la imagen.
                    </p>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={tableShell}>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[var(--color-muted)]/15">
                <th className="border border-[var(--color-border)] px-3 py-2 text-left text-sm font-semibold">
                  Contraparte SPD
                </th>
                <th className="border border-[var(--color-border)] px-3 py-2 text-left text-sm font-semibold">
                  Acción
                </th>
                <th className="border border-[var(--color-border)] px-3 py-2 text-left text-sm font-semibold">
                  Firma
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={cellInput}>
                  <input
                    className={inputClass}
                    value={contraparteSpd}
                    onChange={(e) => setContraparteSpd(e.target.value)}
                    placeholder="Nombre contraparte SPD"
                    required
                  />
                </td>
                <td className={cellInput}>
                  <input
                    className={inputClass}
                    value={accionContraparte}
                    onChange={(e) => setAccionContraparte(e.target.value)}
                    placeholder="Acción o compromiso asociado"
                    required
                  />
                </td>
                <td className="align-top border border-[var(--color-border)] p-2">
                  <ImagePickerButton
                    inputRef={firmaContraparteInputRef}
                    inputId="firma-contraparte-spd"
                    onPick={(files) => {
                      const [image] = createPreviewImages(files)
                      setFirmaContraparte(image ?? null)
                    }}
                  />
                  {firmaContraparte ? (
                    <img
                      src={firmaContraparte.url}
                      alt="Vista previa firma contraparte SPD"
                      className="mt-2 h-28 w-full rounded border border-[var(--color-border)] object-contain bg-white p-2"
                    />
                  ) : (
                    <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                      La vista previa aparece al elegir la imagen.
                    </p>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={tableShell}>
          <table className="w-full border-collapse text-left">
            <tbody>
              <tr>
                <td className={cellLabel}>Medios verificadores</td>
                <td className="align-top border border-[var(--color-border)] p-3">
                  <ImagePickerButton
                    inputRef={mediosInputRef}
                    inputId="medios-verificadores"
                    multiple
                    onPick={(files) => {
                      const next = createPreviewImages(files)
                      if (next.length) setMediosVerificadores((prev) => [...prev, ...next])
                    }}
                  />
                  <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                    Agregue todas las imagenes que considere necesarias
                  </p>
                  {mediosVerificadores.length > 0 ? (
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {mediosVerificadores.map((image) => (
                        <div key={image.url} className="relative">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="h-28 w-full rounded border border-[var(--color-border)] object-cover"
                          />
                          <button
                            type="button"
                            className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-black"
                            onClick={() => removeMedioAt(image.url)}
                          >
                            Quitar
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={tableShell}>
          <table className="w-full border-collapse text-left">
            <tbody>
              <tr>
                <td className={cellLabel}>Registro fotográfico</td>
                <td className="align-top border border-[var(--color-border)] p-3">
                  <ImagePickerButton
                    inputRef={registroInputRef}
                    inputId="registro-fotografico"
                    multiple
                    onPick={(files) => {
                      const next = createPreviewImages(files)
                      if (next.length) setRegistroFotografico((prev) => [...prev, ...next])
                    }}
                  />
                  <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                    Agregue todas las imagenes que considere necesarias
                  </p>
                  {registroFotografico.length > 0 ? (
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {registroFotografico.map((image) => (
                        <div key={image.url} className="relative">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="h-28 w-full rounded border border-[var(--color-border)] object-cover"
                          />
                          <button
                            type="button"
                            className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-black"
                            onClick={() => removeRegistroAt(image.url)}
                          >
                            Quitar
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {submitError ? (
          <p className="text-sm text-[var(--color-destructive)]" role="alert">
            {submitError}
          </p>
        ) : null}
        {submitOk ? (
          <p className="text-sm text-emerald-600" role="status">
            {submitOk}
          </p>
        ) : null}

        <WorkerFormDraftControls
          pendingLabel={draft.pendingLabel}
          notice={draft.notice}
          onSaveDraft={draft.saveDraft}
          onRestoreDraft={draft.restoreDraft}
          onDiscardDraft={draft.discardDraft}
          submitDisabled={submitMutation.isPending}
        >
          <Button type="submit" disabled={submitMutation.isPending}>
            {submitMutation.isPending ? 'Enviando…' : 'Enviar a revisión'}
          </Button>
        </WorkerFormDraftControls>
      </form>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Actas registradas</h3>
        {minutesQuery.isLoading ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">Cargando actas…</p>
        ) : (minutesQuery.data?.length ?? 0) === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--color-border)] p-4 text-sm text-[var(--color-muted-foreground)]">
            Aún no hay actas creadas.
          </p>
        ) : (
          <WorkerMinutesHistoryList minutes={minutesQuery.data ?? []} />
        )}
      </section>
    </section>
  )
}
