import { type FormEvent, useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

import { DateInput } from '@/shared/components/DateInput'
import { Button } from '@/shared/components/ui/button'
import { formatStoredDateForDisplay } from '@/shared/lib/dateInput'
import { createDocument, listDocuments } from '@/features/documents/api/documents.api'
import { WorkerFormDraftControls } from '@/features/worker/components/WorkerFormDraftControls'
import { useWorkerFormDraft } from '@/features/worker/hooks/useWorkerFormDraft'
import type { DocumentDto } from '@/features/documents/types'
import {
  buildBitacoraFieldValues,
  isBitacoraDocument,
  parseBitacoraFieldValues,
} from '@/features/worker/lib/document-field-values'
import { getBitacoraTemplateId } from '@/features/worker/lib/worker-templates'
import { useDefaultActivityId } from '@/features/worker/hooks/useDefaultActivityId'
import { useAuthStore } from '@/store/authStore'

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

function toLogbookEntry(doc: DocumentDto) {
  const meta = parseBitacoraFieldValues(doc.fieldValues)
  if (!meta) return null
  return {
    id: doc.id,
    date: meta.date,
    relato: meta.description,
    eventoRelevante: meta.relevantEvent,
    territorio: meta.territory,
    equipo: meta.team,
  }
}

export function WorkerLogbookPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((s) => s.accessToken)
  const { data: activityId } = useDefaultActivityId()

  const [date, setDate] = useState('')
  const [relato, setRelato] = useState('')
  const [eventoRelevante, setEventoRelevante] = useState('')
  const [territorio, setTerritorio] = useState('Miraflores Alto')
  const [equipo, setEquipo] = useState('Equipo Somos Barrio')
  const [filterDate, setFilterDate] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const draft = useWorkerFormDraft('bitacora', {
    getValues: useCallback(
      () => ({
        date,
        relato,
        eventoRelevante,
        territorio,
        equipo,
      }),
      [date, relato, eventoRelevante, territorio, equipo],
    ),
    applyValues: useCallback(
      (data: {
        date: string
        relato: string
        eventoRelevante: string
        territorio: string
        equipo: string
      }) => {
        setDate(data.date)
        setRelato(data.relato)
        setEventoRelevante(data.eventoRelevante)
        setTerritorio(data.territorio)
        setEquipo(data.equipo)
      },
      [],
    ),
  })

  const historyQuery = useQuery({
    queryKey: ['worker', 'bitacora'],
    queryFn: async () => {
      const page = await listDocuments({ page: 0, size: 100 })
      return page.content.filter(isBitacoraDocument).map(toLogbookEntry).filter(Boolean) as Array<{
        id: string
        date: string
        relato: string
        eventoRelevante: string
        territorio: string
        equipo: string
      }>
    },
    enabled: Boolean(accessToken) && !accessToken?.startsWith('mock'),
  })

  const entries = historyQuery.data ?? []

  const filteredEntries = useMemo(() => {
    if (!filterDate) return entries
    return entries.filter((entry) => entry.date === filterDate)
  }, [entries, filterDate])

  const groupedByMonth = useMemo(() => {
    const groups = new Map<string, typeof filteredEntries>()
    for (const entry of filteredEntries) {
      const key = monthKey(entry.date)
      const current = groups.get(key) ?? []
      current.push(entry)
      groups.set(key, current)
    }
    return Array.from(groups.entries()).sort(([a], [b]) => (a > b ? -1 : 1))
  }, [filteredEntries])

  const createMutation = useMutation({
    mutationFn: async () => {
      const templateId = await getBitacoraTemplateId()
      return createDocument({
        templateId,
        activityId,
        title: `Bitácora - ${territorio}`,
        fieldValues: buildBitacoraFieldValues({
          date,
          relevantEvent: eventoRelevante,
          territory: territorio,
          team: equipo,
          description: relato,
        }),
      })
    },
    onSuccess: async () => {
      setRelato('')
      setEventoRelevante('')
      setFormError(null)
      draft.clearDraft()
      await queryClient.invalidateQueries({ queryKey: ['worker', 'bitacora'] })
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const message = (error.response?.data as { message?: string } | undefined)?.message
        setFormError(message ?? error.message)
        return
      }
      setFormError('No se pudo guardar la entrada.')
    },
  })

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)
    if (accessToken?.startsWith('mock')) {
      setFormError('El modo mock no persiste en el API. Use colaborador1@somosbarrio.cl con backend activo.')
      return
    }
    createMutation.mutate()
  }

  return (
    <section className="space-y-5">
      <header>
        <button
          type="button"
          onClick={() => navigate('/trabajador')}
          className="mb-2 flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Volver al Home
        </button>
        <h2 className="text-2xl font-bold text-[var(--color-foreground)]">Bitácora de salidas a terreno</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Registro narrativo mensual del trabajo territorial.
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
            <DateInput
              id="logbook-date"
              value={date}
              onChange={setDate}
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

        {formError ? (
          <p className="text-sm text-[var(--color-destructive)]" role="alert">
            {formError}
          </p>
        ) : null}

        <WorkerFormDraftControls
          pendingLabel={draft.pendingLabel}
          notice={draft.notice}
          onSaveDraft={draft.saveDraft}
          onRestoreDraft={draft.restoreDraft}
          onDiscardDraft={draft.discardDraft}
          submitDisabled={createMutation.isPending}
        >
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Guardando…' : 'Agregar entrada a bitácora'}
          </Button>
        </WorkerFormDraftControls>
      </form>

      <section className="space-y-3">
        <div className="space-y-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
          <h3 className="text-lg font-semibold">Buscar en bitácora por fecha</h3>
          <div className="flex flex-col gap-2 md:flex-row md:items-end">
            <div className="w-full md:max-w-xs">
              <label htmlFor="logbook-filter-date" className="mb-1 block text-sm font-medium">
                Fecha a filtrar
              </label>
              <DateInput
                id="logbook-filter-date"
                value={filterDate}
                onChange={setFilterDate}
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
        {historyQuery.isLoading ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">Cargando historial…</p>
        ) : groupedByMonth.length === 0 ? (
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
              <EntriesList monthEntries={monthEntries} />
            </article>
          ))
        )}
      </section>
    </section>
  )
}

function EntriesList({
  monthEntries,
}: {
  monthEntries: Array<{
    id: string
    date: string
    relato: string
    eventoRelevante: string
    territorio: string
    equipo: string
  }>
}) {
  return (
    <div className="space-y-2">
      {monthEntries
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .map((entry) => (
          <LogbookEntryCard key={entry.id} entry={entry} />
        ))}
    </div>
  )
}

function LogbookEntryCard({
  entry,
}: {
  entry: {
    id: string
    date: string
    relato: string
    eventoRelevante: string
    territorio: string
    equipo: string
  }
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] p-3">
      <p className="text-xs text-[var(--color-muted-foreground)]">
        {formatStoredDateForDisplay(entry.date)}
      </p>
      <p className="mt-1 text-sm font-semibold">{entry.eventoRelevante}</p>
      <p className="mt-1 text-sm">{entry.relato}</p>
      <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
        {entry.territorio} - {entry.equipo}
      </p>
    </div>
  )
}
