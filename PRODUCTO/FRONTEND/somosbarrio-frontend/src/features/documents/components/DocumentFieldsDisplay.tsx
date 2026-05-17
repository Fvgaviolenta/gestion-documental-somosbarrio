import { formatFieldDateDisplay, parseFieldValuesJson } from '@/features/documents/lib/template-fields'
import type { TemplateFieldDefinition } from '@/features/documents/types'

interface DocumentFieldsDisplayProps {
  fieldValues?: string
  fields: TemplateFieldDefinition[]
}

export function DocumentFieldsDisplay({ fieldValues, fields }: DocumentFieldsDisplayProps) {
  const values = parseFieldValuesJson(fieldValues)

  if (fields.length === 0 && Object.keys(values).length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted-foreground)]">Sin campos adicionales.</p>
    )
  }

  const entries =
    fields.length > 0
      ? fields.map((f) => ({ key: f.key, label: f.label, type: f.type, value: values[f.key] }))
      : Object.entries(values).map(([key, value]) => ({
          key,
          label: key,
          type: 'text',
          value,
        }))

  const visible = entries.filter((e) => e.value?.trim())

  if (visible.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted-foreground)]">Sin campos completados.</p>
    )
  }

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {visible.map((entry) => (
        <div key={entry.key}>
          <dt className="text-xs font-medium text-[var(--color-muted-foreground)]">
            {entry.label}
          </dt>
          <dd className="mt-0.5 whitespace-pre-wrap text-sm">
            {entry.type === 'date' ? formatFieldDateDisplay(entry.value) : entry.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
