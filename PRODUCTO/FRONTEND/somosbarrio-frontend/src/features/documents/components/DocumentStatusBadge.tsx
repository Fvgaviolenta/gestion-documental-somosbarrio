import type { DocumentStatus } from '@/features/documents/types'

const styles: Record<DocumentStatus, string> = {
  BORRADOR: 'bg-slate-100 text-slate-700',
  EN_REVISION: 'bg-amber-100 text-amber-800',
  APROBADA: 'bg-emerald-100 text-emerald-800',
  RECHAZADA: 'bg-red-100 text-red-800',
}

export function DocumentStatusBadge({
  status,
  label,
}: {
  status: DocumentStatus
  label?: string
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}
    >
      {label ?? status.replace('_', ' ')}
    </span>
  )
}
