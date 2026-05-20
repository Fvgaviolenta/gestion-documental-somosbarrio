import { Link } from 'react-router-dom'

const sections = [
  {
    to: '/documents/new',
    title: 'Documentos',
    description: 'Informes y trámites con plantillas institucionales.',
  },
  {
    to: '/trabajador/bitacora',
    title: 'Bitácora terreno',
    description: 'Registro diario de actividades en el territorio.',
  },
] as const

export function WorkerHomePage() {
  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-[var(--color-foreground)]">Home</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Elija el módulo con el que desea trabajar en terreno.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-1">
        {sections.map((item) => (
          <li
            key={item.to}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-[var(--color-foreground)]">{item.title}</h3>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{item.description}</p>
            <div className="mt-4">
              <Link
                to={item.to}
                className="inline-flex h-10 items-center justify-center rounded-[var(--radius-lg)] bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
              >
                Ir a {item.title.toLowerCase()}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
