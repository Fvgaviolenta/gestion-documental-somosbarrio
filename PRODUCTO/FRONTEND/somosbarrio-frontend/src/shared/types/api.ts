export interface ApiErrorBody {
  code?: string
  message?: string
  details?: Record<string, unknown>
  timestamp?: string
  path?: string
}

export interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
