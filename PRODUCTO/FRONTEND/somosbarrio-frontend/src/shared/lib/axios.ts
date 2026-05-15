import axios from 'axios'

import { useAuthStore } from '@/store/authStore'
import { API_BASE_URL } from './constants'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  config.headers['X-Correlation-Id'] = crypto.randomUUID()
  return config
})

let refreshing: Promise<string | null> | null = null

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      (error.response?.data?.code === 'AUTH_TOKEN_EXPIRED' || error.response?.data?.code === 'TOKEN_INVALID') &&
      original &&
      !original._retry
    ) {
      original._retry = true
      refreshing ??= useAuthStore.getState().refresh()
      const newToken = await refreshing
      refreshing = null
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      }
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
