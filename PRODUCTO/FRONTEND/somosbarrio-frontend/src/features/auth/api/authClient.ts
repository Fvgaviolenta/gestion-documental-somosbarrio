import axios from 'axios'

import { API_BASE_URL } from '@/shared/lib/constants'

/** Cliente sin Bearer: login y refresh (especificaciones §6.3). */
export const authClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

authClient.interceptors.request.use((config) => {
  config.headers['X-Correlation-Id'] = crypto.randomUUID()
  return config
})
