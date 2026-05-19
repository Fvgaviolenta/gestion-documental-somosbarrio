import type { MinuteStatus } from '@/features/minutes/types'

const LABELS: Record<MinuteStatus, string> = {
  BORRADOR: 'Borrador',
  EN_REVISION: 'En revisión',
  APROBADA: 'Aprobada',
}

const STYLES: Record<MinuteStatus, string> = {
  BORRADOR: 'bg-slate-100 text-slate-700',
  EN_REVISION: 'bg-amber-100 text-amber-800',
  APROBADA: 'bg-emerald-100 text-emerald-800',
}

export function MinuteStatusBadge({
  status,
  label,
}: {
  status: MinuteStatus
  label?: string
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STYLES[status]}`}
    >
      {label ?? LABELS[status]}
    </span>
  )
}
