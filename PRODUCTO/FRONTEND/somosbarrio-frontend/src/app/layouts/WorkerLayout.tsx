import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { APP_NAME } from '@/shared/lib/constants'
import { useAuthStore } from '@/store/authStore'

const menuLinks = [
  { to: '/trabajador', label: 'Home', id: 'home' },
  { to: '/trabajador/configuracion', label: 'Configuración', id: 'config' },
  { to: '/trabajador/ayuda', label: 'Ayuda / soporte', id: 'ayuda' },
  { to: '/trabajador/notas', label: 'Notas', id: 'notas' },
] as const

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      {open ? (
        <>
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  )
}

function CloseMenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  )
}

export function WorkerLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const handleLogout = async () => {
    await logout()
    navigate('/trabajador/login', { replace: true })
  }

  const linkIsActive = (item: (typeof menuLinks)[number]) => {
    if (item.id === 'home') {
      return location.pathname === '/trabajador'
    }
    return location.pathname === item.to
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <header className="border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 py-3">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[var(--color-on-surface-variant)]">Modo trabajador</p>
            <h1 className="truncate text-base font-semibold text-[var(--color-on-surface)]">
              {APP_NAME}
            </h1>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-high)]"
            aria-expanded={menuOpen}
            aria-controls="worker-nav-drawer"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 flex">
          <button
            type="button"
            className="min-h-0 flex-1 bg-black/40"
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            id="worker-nav-drawer"
            className="relative z-[1] flex h-full w-[min(18rem,88vw)] flex-col border-l border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] shadow-xl"
          >
            <div className="flex items-center justify-between gap-2 border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-3 py-2 pr-2">
              <p className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-on-surface-variant)]">
                Menú
              </p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-high)]"
                aria-label="Cerrar menú"
              >
                <CloseMenuIcon />
              </button>
            </div>
            <ul className="flex flex-1 flex-col gap-1 overflow-y-auto bg-[var(--color-surface-container-lowest)] p-2">
              {menuLinks.map((item) => {
                const active = linkIsActive(item)
                return (
                  <li key={item.id}>
                    <Link
                      to={item.to}
                      className={`block rounded-[var(--radius-lg)] px-3 py-3 text-sm font-medium transition ${
                        active
                          ? 'bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]'
                          : 'text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
            <div className="border-t border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-[var(--radius-lg)] bg-black px-3 py-3 text-sm font-medium text-white transition hover:bg-zinc-700"
              >
                Cerrar sesión
              </button>
            </div>
          </nav>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-5xl px-4 py-5">
        <Outlet />
      </main>
    </div>
  )
}
