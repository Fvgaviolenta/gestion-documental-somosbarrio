import { useQuery } from '@tanstack/react-query'

import { listDocumentTemplates } from '@/features/documents/api/document-templates.api'
import type { DocumentType } from '@/features/documents/types'

export const documentTemplateKeys = {
  all: ['document-templates'] as const,
  list: (type?: DocumentType) => ['document-templates', type ?? 'all'] as const,
}

export function useDocumentTemplates(type?: DocumentType) {
  return useQuery({
    queryKey: documentTemplateKeys.list(type),
    queryFn: () => listDocumentTemplates(type),
  })
}
