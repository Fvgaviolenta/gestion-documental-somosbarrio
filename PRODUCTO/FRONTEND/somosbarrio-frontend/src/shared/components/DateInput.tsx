import { useEffect, useId, useState, type InputHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'
import {
  displayToIso,
  formatDateMask,
  isoToDisplay,
  isValidDisplayDate,
} from '@/shared/lib/dateInput'

export interface DateInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  /** Valor en formato API: YYYY-MM-DD */
  value: string
  onChange: (isoValue: string) => void
}

const inputClassName =
  'w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none ring-[var(--color-primary)] focus:ring-2'

export function DateInput({
  value,
  onChange,
  className,
  id: idProp,
  required,
  onBlur,
  ...props
}: DateInputProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const [display, setDisplay] = useState(() => isoToDisplay(value))

  useEffect(() => {
    setDisplay(isoToDisplay(value))
  }, [value])

  const syncValidity = (el: HTMLInputElement, text: string) => {
    if (!required && !text.trim()) {
      el.setCustomValidity('')
      return
    }
    if (!text.trim()) {
      el.setCustomValidity('')
      return
    }
    el.setCustomValidity(isValidDisplayDate(text) ? '' : 'Ingresa una fecha válida (DD-MM-YYYY).')
  }

  return (
    <input
      {...props}
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder="DD-MM-YYYY"
      pattern="\d{2}-\d{2}-\d{4}"
      maxLength={10}
      required={required}
      className={cn(inputClassName, className)}
      value={display}
      onChange={(e) => {
        const masked = formatDateMask(e.target.value)
        setDisplay(masked)
        syncValidity(e.target, masked)

        if (!masked) {
          onChange('')
          return
        }
        if (masked.length === 10) {
          const iso = displayToIso(masked)
          if (iso) onChange(iso)
        }
      }}
      onBlur={(e) => {
        const text = display.trim()
        if (!text) {
          onChange('')
          setDisplay('')
        } else {
          const iso = displayToIso(text)
          if (iso) {
            onChange(iso)
            setDisplay(isoToDisplay(iso))
          } else {
            setDisplay(isoToDisplay(value))
          }
        }
        syncValidity(e.target, e.target.value.trim())
        onBlur?.(e)
      }}
    />
  )
}
