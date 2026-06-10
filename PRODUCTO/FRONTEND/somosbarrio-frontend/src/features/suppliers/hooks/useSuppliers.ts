import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  suppliersApi,
  type CreateSupplierRequest,
  type UpdateSupplierRequest,
  type SupplierStatus,
  type SuppliersQueryParams,
} from '@/features/suppliers/api/suppliers.api'

export const supplierKeys = {
  all: ['suppliers'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
  list: (params?: SuppliersQueryParams) => [...supplierKeys.lists(), params] as const,
  details: () => [...supplierKeys.all, 'detail'] as const,
  detail: (id: string) => [...supplierKeys.details(), id] as const,
}

export function useSuppliers(params?: SuppliersQueryParams) {
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => suppliersApi.getAll(params),
  })
}

export function useSupplierById(id: string) {
  return useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: () => suppliersApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateSupplierRequest) => suppliersApi.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: supplierKeys.all })
    },
  })
}

export function useUpdateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplierRequest }) =>
      suppliersApi.update(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: supplierKeys.all })
    },
  })
}

export function useChangeSupplierStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SupplierStatus }) =>
      suppliersApi.changeStatus(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: supplierKeys.all })
    },
  })
}

export function useDeleteSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => suppliersApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: supplierKeys.all })
    },
  })
}
