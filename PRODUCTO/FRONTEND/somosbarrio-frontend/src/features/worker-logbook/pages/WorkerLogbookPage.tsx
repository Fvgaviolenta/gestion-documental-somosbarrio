import { type FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/shared/components/ui/button'

interface LogbookEntry {
  id: string
  date: string
  relato: string
  eventoRelevante: string
  territorio: string
  equipo: string
}

function monthKey(dateString: string) {
  return dateString.slice(0, 7)
}

function monthLabel(yyyyMm: string) {
  const [year, month] = yyyyMm.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('es-CL', {
    month: 'long',
    year: 'numeric',
  })
}

export function WorkerLogbookPage() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState<LogbookEntry[]>([])
  const [date, setDate] = useState('')
  const [relato, setRelato] = useState('')
  const [eventoRelevante, setEventoRelevante] = useState('')
  const [territorio, setTerritorio] = useState('Miraflores Alto')
  const [equipo, setEquipo] = useState('Equipo Somos Barrio')
  const [filterDate, setFilterDate] = useState('')

  const filteredEntries = useMemo(() => {
    if (!filterDate) return entries
    return entries.filter((entry) => entry.date === filterDate)
  }, [entries, filterDate])

  const groupedByMonth = useMemo(() => {
    const groups = new Map<string, LogbookEntry[]>()
    for (const entry of filteredEntries) {
      const key = monthKey(entry.date)
      const current = groups.get(key) ?? []
      current.push(entry)
      groups.set(key, current)
    }
    return Array.from(groups.entries()).sort(([a], [b]) => (a > b ? -1 : 1))
  }, [filteredEntries])

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const next: LogbookEntry = {
      id: crypto.randomUUID(),
      date,
      relato,
      eventoRelevante,
      territorio,
      equipo,
    }

    setEntries((prev) => [next, ...prev])
    setRelato('')
    setEventoRelevante('')
  }

  return (
    <section className="space-y-5">
      <header>
        <button
          onClick={() => navigate(-1)}
          className="mb-2 flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Volver
        </button>
        <h2 className="text-2xl font-bold text-[var(--color-foreground)]">Bitácora de salidas a terreno</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Registro narrativo mensual del trabajo territorial en Miraflores Alto.
        </p>
      </header>

      <form
        className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 shadow-sm"
        onSubmit={onSubmit}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label htmlFor="logbook-date" className="mb-1 block text-sm font-medium">
              Fecha
            </label>
            <input
              id="logbook-date"
              type="date"
              className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none ring-[var(--color-primary)] focus:ring-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="logbook-event" className="mb-1 block text-sm font-medium">
              Evento más relevante
            </label>
            <input
              id="logbook-event"
              className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none ring-[var(--color-primary)] focus:ring-2"
              value={eventoRelevante}
              onChange={(e) => setEventoRelevante(e.target.value)}
              placeholder="Ej: reunión vecinal por luminarias"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="logbook-story" className="mb-1 block text-sm font-medium">
            Relato de salida
          </label>
          <textarea
            id="logbook-story"
            className="min-h-28 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none ring-[var(--color-primary)] focus:ring-2"
            value={relato}
            onChange={(e) => setRelato(e.target.value)}
            placeholder="Describe los hechos principales y acuerdos de la jornada."
            required
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label htmlFor="logbook-territory" className="mb-1 block text-sm font-medium">
              Territorio
            </label>
            <input
              id="logbook-territory"
              className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none ring-[var(--color-primary)] focus:ring-2"
              value={territorio}
              onChange={(e) => setTerritorio(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="logbook-team" className="mb-1 block text-sm font-medium">
              Equipo
            </label>
            <input
              id="logbook-team"
              className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none ring-[var(--color-primary)] focus:ring-2"
              value={equipo}
              onChange={(e) => setEquipo(e.target.value)}
              required
            />
          </div>
        </div>

        <Button type="submit">Agregar entrada a bitácora</Button>
      </form>

      <section className="space-y-3">
        <div className="space-y-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
          <h3 className="text-lg font-semibold">Buscar en bitácora por fecha</h3>
          <div className="flex flex-col gap-2 md:flex-row md:items-end">
            <div className="w-full md:max-w-xs">
              <label htmlFor="logbook-filter-date" className="mb-1 block text-sm font-medium">
                Fecha a filtrar
              </label>
              <input
                id="logbook-filter-date"
                type="date"
                className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none ring-[var(--color-primary)] focus:ring-2"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            {filterDate ? (
              <Button type="button" onClick={() => setFilterDate('')}>
                Limpiar filtro
              </Button>
            ) : null}
          </div>
        </div>

        <h3 className="text-lg font-semibold">Entradas por mes</h3>
        {groupedByMonth.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--color-border)] p-4 text-sm text-[var(--color-muted-foreground)]">
            {entries.length === 0
              ? 'Aún no hay entradas registradas.'
              : 'No hay resultados para la fecha seleccionada.'}
          </p>
        ) : (
          groupedByMonth.map(([month, monthEntries]) => (
            <article
              key={month}
              className="space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4"
            >
              <h4 className="text-base font-semibold capitalize">{monthLabel(month)}</h4>
              <div className="space-y-2">
                {monthEntries
                  .sort((a, b) => (a.date < b.date ? 1 : -1))
                  .map((entry) => (
                    <div key={entry.id} className="rounded-lg border border-[var(--color-border)] p-3">
                      <p className="text-xs text-[var(--color-muted-foreground)]">{entry.date}</p>
                      <p className="mt-1 text-sm font-semibold">{entry.eventoRelevante}</p>
                      <p className="mt-1 text-sm">{entry.relato}</p>
                      <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                        {entry.territorio} - {entry.equipo}
                      </p>
                    </div>
                  ))}
              </div>
            </article>
          ))
        )}
      </section>
    </section>
  )
}
