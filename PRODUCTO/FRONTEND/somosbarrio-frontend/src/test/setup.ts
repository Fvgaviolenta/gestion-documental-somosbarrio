import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { useAuthStore } from '@/store/authStore'

import { server } from './msw/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  cleanup()
  server.resetHandlers()
  localStorage.clear()
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
  })
})

afterAll(() => server.close())
