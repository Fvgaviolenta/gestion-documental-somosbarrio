import { useState } from 'react'
import { SupplierForm } from '@/features/suppliers/components/SupplierForm'
import { SupplierStatusBadge } from '@/features/suppliers/components/SupplierStatusBadge'
import {
  useSuppliers, useCreateSupplier, useUpdateSupplier,
  useDeleteSupplier, useChangeSupplierStatus,
} from '@/features/suppliers/hooks/useSuppliers'
import type { Supplier, SupplierStatus } from '@/features/suppliers/api/suppliers.api'

const PAGE_SIZE = 10

const STATUS_OPTIONS: { value: SupplierStatus | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'INACTIVO', label: 'Inactivo' },
  { value: 'SUSPENDIDO', label: 'Suspendido' },
]

const NEXT_STATUS: Record<SupplierStatus, { value: SupplierStatus; label: string }[]> = {
  ACTIVO: [{ value: 'INACTIVO', label: 'Marcar Inactivo' }, { value: 'SUSPENDIDO', label: 'Suspender' }],
  INACTIVO: [{ value: 'ACTIVO', label: 'Activar' }, { value: 'SUSPENDIDO', label: 'Suspender' }],
  SUSPENDIDO: [{ value: 'ACTIVO', label: 'Activar' }, { value: 'INACTIVO', label: 'Marcar Inactivo' }],
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full sm:w-96 rounded-t-2xl sm:rounded-xl bg-surface shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-outline-variant bg-surface">
          <h2 className="text-lg font-semibold text-on-surface">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-container-high rounded-full transition-colors">
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

function ConfirmDialog({ message, confirmLabel, confirmClass, onConfirm, onCancel, isLoading }: {
  message: string; confirmLabel: string; confirmClass?: string
  onConfirm: () => void; onCancel: () => void; isLoading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-96 rounded-xl bg-surface shadow-lg p-6">
        <p className="text-sm text-on-surface mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} disabled={isLoading} className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-high disabled:opacity-40 transition-colors text-sm font-medium">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={isLoading} className={`px-4 py-2 rounded-lg text-on-primary hover:opacity-90 disabled:opacity-40 transition-colors text-sm font-medium flex items-center gap-2 ${confirmClass || 'bg-primary'}`}>
            {isLoading && <span>⏳</span>}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 bg-surface-container-highest rounded-lg animate-pulse" />
      ))}
    </div>
  )
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  const bgClass = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
  const textClass = type === 'success' ? 'text-green-700' : 'text-red-700'
  return (
    <div className={`fixed bottom-4 right-4 flex gap-2 p-4 rounded-lg border ${bgClass} shadow-lg z-40 animate-in`}>
      <span className="text-lg">{type === 'success' ? '✓' : '⚠'}</span>
      <span className={`text-sm font-medium ${textClass}`}>{message}</span>
    </div>
  )
}

export function SuppliersListPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<SupplierStatus | ''>('')
  const [page, setPage] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [changingStatus, setChangingStatus] = useState<{ id: string; status: SupplierStatus } | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const { data, isLoading, isError } = useSuppliers({
    search: search || undefined,
    status: statusFilter || undefined,
    page,
    size: PAGE_SIZE,
  })

  const suppliers: Supplier[] = data?.content ?? []
  const totalPages = data?.totalPages ?? 1

  const createMutation = useCreateSupplier()
  const updateMutation = useUpdateSupplier()
  const deleteMutation = useDeleteSupplier()
  const statusMutation = useChangeSupplierStatus()

  const handleOpenCreate = () => { setEditingSupplier(null); setShowForm(true) }
  const handleOpenEdit = (supplier: Supplier) => { setEditingSupplier(supplier); setShowForm(true) }
  const handleCloseForm = () => { setShowForm(false); setEditingSupplier(null); createMutation.reset(); updateMutation.reset() }

  const handleSubmitForm = (formData: any) => {
    if (editingSupplier) {
      updateMutation.mutate({ id: editingSupplier.id, data: formData }, {
        onSuccess: () => { handleCloseForm(); showToast('Proveedor actualizado correctamente') },
      })
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => { handleCloseForm(); showToast('Proveedor creado correctamente') },
      })
    }
  }

  const handleConfirmDelete = () => {
    if (!deletingId) return
    deleteMutation.mutate(deletingId, {
      onSuccess: () => { setDeletingId(null); showToast('Proveedor eliminado') },
      onError: () => { setDeletingId(null); showToast('No se pudo eliminar el proveedor', 'error') },
    })
  }

  const handleConfirmStatus = () => {
    if (!changingStatus) return
    statusMutation.mutate(changingStatus, {
      onSuccess: () => { setChangingStatus(null); showToast('Estado actualizado') },
      onError: () => { setChangingStatus(null); showToast('No se pudo actualizar el estado', 'error') },
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {toast && <Toast message={toast.message} type={toast.type} />}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Gestión de Proveedores</h1>
          <p className="text-sm text-on-surface-variant">Administra los proveedores vinculados al programa Somos Barrio</p>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-bold shadow-md">
          ➕ Nuevo Proveedor
        </button>
      </div>

      <div className="flex gap-3">
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} placeholder="Buscar por nombre, RUT o email..." className="flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as SupplierStatus | ''); setPage(0) }} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30">
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-outline-variant overflow-hidden bg-surface">
        {isLoading ? (
          <div className="p-6"><TableSkeleton /></div>
        ) : isError ? (
          <div className="p-6 flex gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-on-surface">Error al cargar proveedores</h3>
            </div>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-2">🏢</div>
            <h3 className="font-semibold text-on-surface">No se encontraron proveedores</h3>
            {(search || statusFilter) && <button onClick={() => { setSearch(''); setStatusFilter('') }} className="mt-3 text-sm text-primary hover:underline">Limpiar filtros</button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-outline-variant bg-surface-container-highest">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant">Proveedor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant">RUT</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant">Giros</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-4 py-3 text-sm text-on-surface font-medium">{supplier.nombreProveedor}</td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">{supplier.rutEmpresa}</td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">{supplier.emailContacto}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {supplier.giros.slice(0, 2).map((g) => (
                          <span key={g} className="inline-block px-2 py-1 bg-surface-container rounded text-xs text-on-surface">{g}</span>
                        ))}
                        {supplier.giros.length > 2 && <span className="text-xs text-on-surface-variant">+{supplier.giros.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm"><SupplierStatusBadge status={supplier.status} /></td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="relative group">
                          <button className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors">↔️</button>
                          <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-surface border border-outline-variant rounded-lg shadow-lg z-20">
                            {NEXT_STATUS[supplier.status].map((opt) => (
                              <button key={opt.value} onClick={() => setChangingStatus({ id: supplier.id, status: opt.value })} className="px-3 py-2 text-xs text-left hover:bg-surface-container-high text-on-surface whitespace-nowrap">
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => handleOpenEdit(supplier)} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors">✏️</button>
                        <button onClick={() => setDeletingId(supplier.id)} className="p-1.5 rounded-lg text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-colors">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="border-t border-outline-variant p-4 flex items-center justify-between">
            <span className="text-xs text-on-surface-variant">Página {page + 1} de {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Anterior</button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <Modal title={editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'} onClose={handleCloseForm}>
          <SupplierForm 
            initialData={editingSupplier || undefined} 
            onSubmit={handleSubmitForm} 
            onCancel={handleCloseForm} 
            isLoading={createMutation.isPending || updateMutation.isPending}
            serverError={(createMutation.error || updateMutation.error) as any as string}
          />
        </Modal>
      )}
      {deletingId && (
        <ConfirmDialog 
          message="¿Estás seguro de que deseas eliminar este proveedor? Esta acción no se puede deshacer." 
          confirmLabel="Eliminar"
          confirmClass="bg-red-600 hover:bg-red-700"
          onConfirm={handleConfirmDelete} 
          onCancel={() => setDeletingId(null)} 
          isLoading={deleteMutation.isPending} 
        />
      )}
      {changingStatus && (
        <ConfirmDialog 
          message={`¿Cambiar el estado del proveedor "${suppliers.find(s => s.id === changingStatus.id)?.nombreProveedor}"?`}
          confirmLabel="Cambiar"
          onConfirm={handleConfirmStatus} 
          onCancel={() => setChangingStatus(null)} 
          isLoading={statusMutation.isPending} 
        />
      )}
    </div>
  )
}
