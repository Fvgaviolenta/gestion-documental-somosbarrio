import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SupplierStatusBadge } from './SupplierStatusBadge'

describe('SupplierStatusBadge', () => {
  it('renders Activo label', () => {
    render(<SupplierStatusBadge status="ACTIVO" />)
    expect(screen.getByText('Activo')).toBeInTheDocument()
  })

  it('renders Inactivo label', () => {
    render(<SupplierStatusBadge status="INACTIVO" />)
    expect(screen.getByText('Inactivo')).toBeInTheDocument()
  })

  it('renders Suspendido label', () => {
    render(<SupplierStatusBadge status="SUSPENDIDO" />)
    expect(screen.getByText('Suspendido')).toBeInTheDocument()
  })
})
