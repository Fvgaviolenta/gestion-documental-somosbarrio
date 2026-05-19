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
      <Button 
        type="button" 
        onClick={() => inputRef.current?.click()}
        style={{ backgroundColor: SB_COLORS.PURPLE }}
        className="text-white hover:opacity-90 font-semibold text-xs"
      >
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
  'w-full overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm'
const cellLabel =
  'w-[38%] align-top border border-outline-variant bg-surface-container-low px-4 py-3 text-sm font-semibold text-sb-dark-purple'
const cellInput = 'align-top border border-outline-variant p-0 bg-surface-container-lowest'

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
    'w-full border-0 bg-transparent px-3 py-2.5 text-sm outline-none focus:bg-surface-container-low/30 transition-colors rounded-none'
  const textareaClass =
    'min-h-28 w-full resize-y border-0 bg-transparent px-3 py-2.5 text-sm outline-none focus:bg-surface-container-low/30 transition-colors'

  return (
    <div className="min-h-screen p-margin bg-surface">
      <div className="max-w-container-max mx-auto space-y-5">
        <header>
          <button
            onClick={() => navigate('/')}
            className="mb-2 flex items-center gap-2 text-sm text-on-surface-variant hover:text-sb-dark-purple font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Volver
          </button>
          <h2 className="text-3xl font-bold text-sb-dark-purple">Acta de actividades</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Flujo sugerido: elaboración (colaborador/admin) — EN_REVISION — aprobación ADMINISTRADOR.
          </p>
        </header>

        <form
          className="space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm"
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
                <tr className="bg-surface-container-low">
                  <th className="border border-outline-variant px-3 py-2 text-left text-sm font-semibold text-sb-dark-purple">
                    Gestor barrial
                  </th>
                  <th className="border border-outline-variant px-3 py-2 text-left text-sm font-semibold text-sb-dark-purple">
                    Acción
                  </th>
                  <th className="border border-outline-variant px-3 py-2 text-left text-sm font-semibold text-sb-dark-purple">
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
                  <td className="align-top border border-outline-variant p-3 bg-surface-container-lowest">
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
                        className="mt-2 h-28 w-full rounded-lg border border-outline-variant object-contain bg-surface p-2 shadow-sm"
                      />
                    ) : (
                      <p className="mt-2 text-xs text-on-surface-variant font-medium">
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
                <tr className="bg-surface-container-low">
                  <th className="border border-outline-variant px-3 py-2 text-left text-sm font-semibold text-sb-dark-purple">
                    Contraparte SPD
                  </th>
                  <th className="border border-outline-variant px-3 py-2 text-left text-sm font-semibold text-sb-dark-purple">
                    Acción
                  </th>
                  <th className="border border-outline-variant px-3 py-2 text-left text-sm font-semibold text-sb-dark-purple">
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
                  <td className="align-top border border-outline-variant p-3 bg-surface-container-lowest">
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
                        className="mt-2 h-28 w-full rounded-lg border border-outline-variant object-contain bg-surface p-2 shadow-sm"
                      />
                    ) : (
                      <p className="mt-2 text-xs text-on-surface-variant font-medium">
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
                  <td className="align-top border border-outline-variant p-4 bg-surface-container-lowest">
                    <ImagePickerButton
                      inputRef={mediosInputRef}
                      inputId="medios-verificadores"
                      multiple
                      onPick={(files) => {
                        const next = createPreviewImages(files)
                        if (next.length) setMediosVerificadores((prev) => [...prev, ...next])
                      }}
                    />
                    <p className="mt-2 text-xs text-on-surface-variant font-medium">
                      Agregue todas las imágenes que considere necesarias
                    </p>
                    {mediosVerificadores.length > 0 ? (
                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {mediosVerificadores.map((image) => (
                          <div key={image.url} className="relative group rounded-lg overflow-hidden border border-outline-variant shadow-sm">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="h-28 w-full object-cover"
                            />
                            <button
                              type="button"
                              className="absolute right-1 top-1 rounded bg-black/70 px-2 py-1 text-[10px] font-medium text-white hover:bg-sb-red transition-colors"
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
                  <td className="align-top border border-outline-variant p-4 bg-surface-container-lowest">
                    <ImagePickerButton
                      inputRef={registroInputRef}
                      inputId="registro-fotografico"
                      multiple
                      onPick={(files) => {
                        const next = createPreviewImages(files)
                        if (next.length) setRegistroFotografico((prev) => [...prev, ...next])
                      }}
                    />
                    <p className="mt-2 text-xs text-on-surface-variant font-medium">
                      Agregue todas las imágenes que considere necesarias
                    </p>
                    {registroFotografico.length > 0 ? (
                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {registroFotografico.map((image) => (
                          <div key={image.url} className="relative group rounded-lg overflow-hidden border border-outline-variant shadow-sm">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="h-28 w-full object-cover"
                            />
                            <button
                              type="button"
                              className="absolute right-1 top-1 rounded bg-black/70 px-2 py-1 text-[10px] font-medium text-white hover:bg-sb-red transition-colors"
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
            <p className="text-sm font-semibold text-sb-red" role="alert">
              {submitError}
            </p>
          ) : null}
          {submitOk ? (
            <p className="text-sm font-semibold text-emerald-600" role="status">
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
            <Button 
              type="submit" 
              disabled={submitMutation.isPending}
              style={{ backgroundColor: SB_COLORS.PURPLE }}
              className="text-white hover:opacity-90 font-bold shadow-sm"
            >
              {submitMutation.isPending ? 'Enviando…' : 'Enviar a revisión'}
            </Button>
          </WorkerFormDraftControls>
        </form>

        <section className="space-y-3 pt-4">
          <h3 className="text-xl font-bold text-sb-dark-purple">Actas registradas</h3>
          {minutesQuery.isLoading ? (
            <p className="text-sm text-on-surface-variant">Cargando actas…</p>
          ) : (minutesQuery.data?.length ?? 0) === 0 ? (
            <p className="rounded-xl border border-dashed border-outline-variant p-6 text-sm text-on-surface-variant bg-surface-container-lowest">
              Aún no hay actas creadas.
            </p>
          ) : (
            <WorkerMinutesHistoryList minutes={minutesQuery.data ?? []} />
          )}
        </section>
      </div>
    </div>
  )
}