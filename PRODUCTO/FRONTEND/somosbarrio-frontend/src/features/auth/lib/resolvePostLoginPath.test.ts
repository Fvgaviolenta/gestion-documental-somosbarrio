import { describe, expect, it } from 'vitest'

import { resolvePostLoginPath } from './resolvePostLoginPath'

describe('resolvePostLoginPath', () => {
  it('sends admin to home by default', () => {
    expect(resolvePostLoginPath(['ADMINISTRADOR'])).toBe('/')
  })

  it('sends admin to protected route they tried to open', () => {
    expect(resolvePostLoginPath(['ADMINISTRADOR'], '/users')).toBe('/users')
  })

  it('sends worker to institutional dashboard by default', () => {
    expect(resolvePostLoginPath(['COLABORADOR'])).toBe('/')
  })

  it('sends worker back to worker route they tried to open', () => {
    expect(resolvePostLoginPath(['COLABORADOR'], '/trabajador/bitacora')).toBe(
      '/trabajador/bitacora',
    )
  })

  it('ignores admin-only from path for worker-only users', () => {
    expect(resolvePostLoginPath(['COLABORADOR'], '/users')).toBe('/')
  })
})
