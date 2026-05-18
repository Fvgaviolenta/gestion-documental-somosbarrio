import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

function isEmpty(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  if (el instanceof HTMLSelectElement) return !el.value
  if (el.type === 'checkbox' || el.type === 'radio') return !(el as HTMLInputElement).checked
  return !String(el.value ?? '').trim()
}

function missingMessage(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  if (el instanceof HTMLSelectElement) return 'Selecciona una opción.'
  if (el instanceof HTMLTextAreaElement) return 'Completa este campo.'
  if (el.type === 'checkbox' || el.type === 'radio') return 'Debes marcar esta opción.'
  if (el.type === 'file') return 'Debes seleccionar un archivo.'
  if (el.type === 'email') return 'Ingresa tu correo electrónico.'
  if (el.type === 'password') return 'Ingresa tu contraseña.'
  if (el.type === 'date' || el.type === 'datetime-local') return 'Selecciona una fecha.'
  return 'Completa este campo.'
}

function messageForValidity(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  const { validity } = el

  if (validity.valueMissing) return missingMessage(el)

  if (validity.typeMismatch) {
    if (el instanceof HTMLInputElement && el.type === 'email') {
      return 'Ingresa un correo electrónico válido.'
    }
    return 'El valor ingresado no es válido.'
  }

  if (validity.patternMismatch) {
    if (el instanceof HTMLInputElement && el.placeholder === 'DD-MM-YYYY') {
      return 'Ingresa una fecha válida (DD-MM-YYYY).'
    }
    return 'El formato ingresado no es válido.'
  }
  if (validity.tooShort && 'minLength' in el && el.minLength >= 0) {
    return `Ingresa al menos ${el.minLength} caracteres.`
  }
  if (validity.tooLong && 'maxLength' in el && el.maxLength >= 0) {
    return `Ingresa como máximo ${el.maxLength} caracteres.`
  }
  if (validity.rangeUnderflow && el instanceof HTMLInputElement && el.min) {
    return `El valor mínimo es ${el.min}.`
  }
  if (validity.rangeOverflow && el instanceof HTMLInputElement && el.max) {
    return `El valor máximo es ${el.max}.`
  }
  if (validity.badInput) return 'Revisa el valor ingresado.'

  return 'Revisa este campo.'
}

function isFormControl(
  target: EventTarget | null,
): target is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  )
}

function applySpanishValidity(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  if (!el.willValidate) return

  if (el.validity.valid) {
    el.setCustomValidity('')
    return
  }

  el.setCustomValidity(messageForValidity(el))
}

function presetIfRequiredEmpty(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  if (!el.required) return
  if (isEmpty(el)) {
    el.setCustomValidity(missingMessage(el))
  }
}

/** Mensajes en español para validación HTML5 nativa del navegador. */
export function setupSpanishNativeValidation() {
  document.addEventListener(
    'invalid',
    (event) => {
      const el = event.target
      if (!isFormControl(el)) return
      applySpanishValidity(el)
    },
    true,
  )

  document.addEventListener(
    'focusin',
    (event) => {
      const el = event.target
      if (!isFormControl(el)) return
      presetIfRequiredEmpty(el)
    },
    true,
  )

  document.addEventListener(
    'mouseover',
    (event) => {
      const el = event.target
      if (!isFormControl(el)) return
      presetIfRequiredEmpty(el)
    },
    true,
  )

  document.addEventListener(
    'input',
    (event) => {
      const el = event.target
      if (!isFormControl(el)) return
      if (el.validity.valid || !isEmpty(el)) {
        el.setCustomValidity('')
      }
    },
    true,
  )

  document.addEventListener(
    'change',
    (event) => {
      const el = event.target
      if (!isFormControl(el)) return
      if (el.validity.valid) el.setCustomValidity('')
    },
    true,
  )

  document.addEventListener(
    'submit',
    (event) => {
      const form = event.target
      if (!(form instanceof HTMLFormElement) || form.noValidate) return

      for (const el of form.elements) {
        if (!isFormControl(el)) continue
        if (!el.validity.valid) applySpanishValidity(el)
      }
    },
    true,
  )
}

type NativeValidationProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'onInvalid' | 'onInput' | 'onFocus'
>

/** Props opcionales para inputs con `required` (refuerzo por campo). */
export function spanishValidationProps(): NativeValidationProps {
  return {
    onFocus: (e) => presetIfRequiredEmpty(e.currentTarget),
    onInvalid: (e) => {
      applySpanishValidity(e.currentTarget)
    },
    onInput: (e) => {
      if (e.currentTarget.validity.valid) {
        e.currentTarget.setCustomValidity('')
      }
    },
  }
}

export function spanishTextareaValidationProps(): Pick<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onInvalid' | 'onInput' | 'onFocus'
> {
  return {
    onFocus: (e) => presetIfRequiredEmpty(e.currentTarget),
    onInvalid: (e) => {
      applySpanishValidity(e.currentTarget)
    },
    onInput: (e) => {
      if (e.currentTarget.validity.valid) {
        e.currentTarget.setCustomValidity('')
      }
    },
  }
}
