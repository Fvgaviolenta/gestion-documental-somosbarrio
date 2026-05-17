import {
  minuteDisplayTitle,
  minuteStatusStyles,
  parseMinuteContent,
} from '@/features/worker-minutes/hooks/useWorkerMinutesSubmit'
import type { MinuteDto } from '@/features/minutes/types'
import { formatStoredDateForDisplay } from '@/shared/lib/dateInput'

export function WorkerMinutesHistoryList({ minutes }: { minutes: MinuteDto[] }) {
  return (
    <>
      {minutes.map((minute) => {
        const fields = parseMinuteContent(minute.content)
        return (
          <article
            key={minute.id}
            className="space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4"
          >
            <MinuteListHeader minute={minute} />
            {fields ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Territorio:</span> {fields.barrio}, {fields.comuna}
                </p>
                <p>
                  <span className="font-medium">Fecha actividad:</span>{' '}
                  {formatStoredDateForDisplay(fields.fechaActividad)} (
                  {fields.horaInicio}–{fields.horaTermino})
                </p>
                <p>
                  <span className="font-medium">Lugar:</span> {fields.lugarReunion}
                </p>
                <p>
                  <span className="font-medium">Resumen temas:</span> {fields.resumenTemas}
                </p>
                <p>
                  <span className="font-medium">Compromisos:</span>{' '}
                  {fields.compromisosResponsabilidades}
                </p>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-muted-foreground)] whitespace-pre-wrap">
                {minute.content ?? 'Sin detalle'}
              </p>
            )}
          </article>
        )
      })}
    </>
  )
}

function MinuteListHeader({ minute }: { minute: MinuteDto }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h4 className="font-semibold">{minuteDisplayTitle(minute)}</h4>
      <span
        className={`rounded-full px-2 py-1 text-xs font-semibold ${minuteStatusStyles[minute.status]}`}
      >
        {minute.statusLabel ?? minute.status}
      </span>
    </div>
  )
}
