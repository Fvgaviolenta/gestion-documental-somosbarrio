import { QueryClientProvider } from '@tanstack/react-query'

import { queryClient } from '@/shared/lib/queryClient'

import { AuthBootstrap } from './AuthBootstrap'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap>{children}</AuthBootstrap>
    </QueryClientProvider>
  )
}
