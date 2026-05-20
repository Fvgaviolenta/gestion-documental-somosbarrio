import type { TemplateFieldDefinition } from '../types'
import { isImageUuidFieldKey } from '../lib/template-fields'

const fieldClass =
  'w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none ring-[var(--color-primary)] focus:ring-2'

interface TemplateFieldsFormProps {
  fields: TemplateFieldDefinition[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  disabled?: boolean
}

export function TemplateFieldsForm({
  fields,
  values,
  onChange,
  disabled,
}: TemplateFieldsFormProps) {
  if (fields.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted-foreground)]">
        Esta plantilla no define campos adicionales.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {fields.filter((field) => !isImageUuidFieldKey(field.key)).map((field) => {
        const id = `field-${field.key}`
        const value = values[field.key] ?? ''

        return (
          <div key={field.key}>
            <label htmlFor={id} className="mb-1 block text-sm font-medium">
              {field.label}
              {field.required ? <span className="text-[var(--color-destructive)]"> *</span> : null}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={id}
                className={`${fieldClass} min-h-24`}
                value={value}
                disabled={disabled}
                required={field.required}
                minLength={field.minLength}
                maxLength={field.maxLength}
                onChange={(e) => onChange(field.key, e.target.value)}
              />
            ) : (
              <input
                id={id}
                type={
                  field.type === 'time'
                    ? 'time'
                    : field.type === 'month'
                      ? 'month'
                      : field.type === 'date'
                        ? 'date'
                        : 'text'
                }
                className={fieldClass}
                value={value}
                disabled={disabled}
                required={field.required}
                minLength={field.minLength}
                maxLength={field.maxLength}
                onChange={(e) => onChange(field.key, e.target.value)}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
