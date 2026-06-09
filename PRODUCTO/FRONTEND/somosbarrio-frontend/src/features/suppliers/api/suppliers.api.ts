import { api } from '@/shared/lib/axios'
import type { PagedResponse } from '@/shared/types/api'

export type SupplierStatus = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO'

export interface Supplier {
  id: string
  nombreProveedor: string
  rutEmpresa: string
  emailContacto: string
  telefonoContacto?: string
  direccion?: string
  status: SupplierStatus
  statusLabel: string
  giros: string[]
  idLicitaciones: string[]
  ordenesCompra: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateSupplierRequest {
  nombreProveedor: string
  rutEmpresa: string
  emailContacto: string
  telefonoContacto?: string
  direccion?: string
  giros: string[]
  idLicitaciones?: string[]
  ordenesCompra?: string[]
}

export interface UpdateSupplierRequest {
  nombreProveedor: string
  rutEmpresa: string
  emailContacto: string
  telefonoContacto?: string
  direccion?: string
  giros: string[]
  idLicitaciones?: string[]
  ordenesCompra?: string[]
}

export interface ChangeSupplierStatusRequest {
  status: SupplierStatus
}

export interface SuppliersQueryParams {
  status?: SupplierStatus
  search?: string
  page?: number
  size?: number
}

export const suppliersApi = {
  getAll: async (params?: SuppliersQueryParams): Promise<PagedResponse<Supplier>> => {
    const response = await api.get<PagedResponse<Supplier>>('/suppliers', { params })
    return response.data
  },

  getById: async (id: string): Promise<Supplier> => {
    const response = await api.get<Supplier>(`/suppliers/${id}`)
    return response.data
  },

  create: async (data: CreateSupplierRequest): Promise<Supplier> => {
    const response = await api.post<Supplier>('/suppliers', data)
    return response.data
  },

  update: async (id: string, data: UpdateSupplierRequest): Promise<Supplier> => {
    const response = await api.put<Supplier>(`/suppliers/${id}`, data)
    return response.data
  },

  changeStatus: async (id: string, status: SupplierStatus): Promise<Supplier> => {
    const body: ChangeSupplierStatusRequest = { status }
    const response = await api.patch<Supplier>(`/suppliers/${id}/status`, body)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/suppliers/${id}`)
  },
}
