import type { SupplierStatus } from '@/features/suppliers/api/suppliers.api'

interface SupplierStatusBadgeProps {
  status: SupplierStatus
}

const STATUS_CONFIG: Record<SupplierStatus, { label: string; classes: string }> = {
  ACTIVO: {
    label: 'Activo',
    classes: 'bg-green-100 text-green-800 border border-green-200',
  },
  INACTIVO: {
    label: 'Inactivo',
    classes: 'bg-gray-100 text-gray-600 border border-gray-200',
  },
  SUSPENDIDO: {
    label: 'Suspendido',
    classes: 'bg-red-100 text-red-700 border border-red-200',
  },
}

export function SupplierStatusBadge({ status }: SupplierStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.INACTIVO
  return (
    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  )
}
