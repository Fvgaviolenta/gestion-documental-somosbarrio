import type { MinuteFormContent } from '@/features/minutes/types'

const FIELD_LABELS: Record<keyof MinuteFormContent, string> = {
  numeroActa: 'N° acta',
  proyecto: 'Proyecto',
  comuna: 'Comuna',
  barrio: 'Barrio',
  reunionConvocadaPor: 'Convocada por',
  fechaActividad: 'Fecha actividad',
  horaInicio: 'Hora inicio',
  horaTermino: 'Hora término',
  lugarReunion: 'Lugar',
  motivoObjetivo: 'Motivo / objetivo',
  resumenTemas: 'Resumen temas',
  compromisosResponsabilidades: 'Compromisos',
  gestorBarrial: 'Gestor barrial',
  accion: 'Acción gestor',
  contraparteSpd: 'Contraparte SPD',
  accionContraparte: 'Acción contraparte',
}

export function MinuteFieldsDisplay({ fields }: { fields: Partial<MinuteFormContent> }) {
  const entries = (Object.keys(FIELD_LABELS) as (keyof MinuteFormContent)[]).filter(
    (key) => fields[key]?.trim(),
  )

  if (entries.length === 0) {
    return <p className="text-sm text-[var(--color-muted-foreground)]">Sin campos estructurados.</p>
  }

  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      {entries.map((key) => (
        <div key={key}>
          <dt className="text-[var(--color-muted-foreground)]">{FIELD_LABELS[key]}</dt>
          <dd className="font-medium whitespace-pre-wrap">{fields[key]}</dd>
        </div>
      ))}
    </dl>
  )
}
