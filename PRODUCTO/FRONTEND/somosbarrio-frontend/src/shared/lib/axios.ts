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
  
  if (token) {
    if (config.headers.set) {
      config.headers.set('Authorization', `Bearer ${token}`)
    } else {
      config.headers['Authorization'] = `Bearer ${token}`
    }
  }
  
  if (config.headers.set) {
    config.headers.set('X-Correlation-Id', crypto.randomUUID())
  } else {
    config.headers['X-Correlation-Id'] = crypto.randomUUID()
  }

  return config
})

let refreshing: Promise<string | null> | null = null

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    
    // Captura la respuesta de error del backend de Spring Boot
    const serverCode = error.response?.data?.code
    const serverMessage = error.response?.data?.message

    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      (serverCode === 'TOKEN_EXPIRED' || 
       serverCode === 'TOKEN_INVALID' || 
       serverMessage === 'TOKEN_EXPIRED' ||
       serverCode === 'AUTH_TOKEN_EXPIRED') &&
      original &&
      !original._retry
    ) {
      original._retry = true
      
      // Control de concurrencia seguro para peticiones en paralelo
      refreshing ??= useAuthStore.getState().refresh()
      const newToken = await refreshing
      refreshing = null
      
      if (newToken) {
        if (original.headers.set) {
          original.headers.set('Authorization', `Bearer ${newToken}`)
        } else {
          original.headers.Authorization = `Bearer ${newToken}`
        }
        return api(original) // Reintenta la petición original con el nuevo token
      }
      
      // Si falla la renovación del refresh token, se cierra la sesión limpiamente
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)