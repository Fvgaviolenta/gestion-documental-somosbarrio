function messageForValidity(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  const { validity } = el

  if (validity.valueMissing) {
    if (el instanceof HTMLSelectElement) return 'Selecciona una opción.'
    if (el instanceof HTMLTextAreaElement) return 'Completa este campo.'
    if (el.type === 'checkbox' || el.type === 'radio') return 'Debes marcar esta opción.'
    if (el.type === 'file') return 'Debes seleccionar un archivo.'
    if (el.type === 'email') return 'Ingresa tu correo electrónico.'
    if (el.type === 'password') return 'Ingresa tu contraseña.'
    if (el.type === 'date' || el.type === 'datetime-local') return 'Selecciona una fecha.'
    return 'Completa este campo.'
  }

  if (validity.typeMismatch) {
    if (el instanceof HTMLInputElement && el.type === 'email') {
      return 'Ingresa un correo electrónico válido.'
    }
    return 'El valor ingresado no es válido.'
  }

  if (validity.patternMismatch) return 'El formato ingresado no es válido.'
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

function isFormControl(target: EventTarget | null): target is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  )
}

/** Mensajes en español para validación HTML5 nativa del navegador. */
export function setupSpanishNativeValidation() {
  document.addEventListener(
    'invalid',
    (event) => {
      const el = event.target
      if (!isFormControl(el)) return
      el.setCustomValidity(messageForValidity(el))
    },
    true,
  )

  document.addEventListener(
    'input',
    (event) => {
      const el = event.target
      if (isFormControl(el)) el.setCustomValidity('')
    },
    true,
  )

  document.addEventListener(
    'change',
    (event) => {
      const el = event.target
      if (isFormControl(el)) el.setCustomValidity('')
    },
    true,
  )
}
