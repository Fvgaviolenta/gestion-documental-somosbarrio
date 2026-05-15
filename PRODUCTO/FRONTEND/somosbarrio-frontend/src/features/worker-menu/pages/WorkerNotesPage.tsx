import { type FormEvent, useEffect, useState } from 'react'

import { Button } from '@/shared/components/ui/button'

const STORAGE_KEY = 'somosbarrio-worker-notes-v1'

interface NoteItem {
  id: string
  text: string
  createdAt: string
}

function loadNotes(): NoteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (n): n is NoteItem =>
        typeof n === 'object' &&
        n !== null &&
        'id' in n &&
        'text' in n &&
        'createdAt' in n &&
        typeof (n as NoteItem).id === 'string' &&
        typeof (n as NoteItem).text === 'string' &&
        typeof (n as NoteItem).createdAt === 'string',
    )
  } catch {
    return []
  }
}

export function WorkerNotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [draft, setDraft] = useState('')

  useEffect(() => {
    setNotes(loadNotes())
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  }, [notes])

  const addNote = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setNotes((prev) => [
      {
        id: crypto.randomUUID(),
        text,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
    setDraft('')
  }

  const removeNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-[var(--color-foreground)]">Notas</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Anotaciones libres; se guardan en este dispositivo (almacenamiento local del navegador).
        </p>
      </header>

      <form
        onSubmit={addNote}
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 shadow-sm"
      >
        <label htmlFor="worker-note-draft" className="mb-2 block text-sm font-medium">
          Nueva nota
        </label>
        <textarea
          id="worker-note-draft"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escriba aquí lo que necesite recordar…"
          rows={5}
          className="min-h-[120px] w-full resize-y rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm outline-none ring-[var(--color-primary)] focus:ring-2"
        />
        <div className="mt-3">
          <Button type="submit">Guardar nota</Button>
        </div>
      </form>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[var(--color-foreground)]">Mis notas</h3>
        {notes.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--color-border)] p-4 text-sm text-[var(--color-muted-foreground)]">
            Aún no hay notas guardadas.
          </p>
        ) : (
          <ul className="space-y-3">
            {notes.map((note) => (
              <li
                key={note.id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4"
              >
                <p className="whitespace-pre-wrap text-sm text-[var(--color-foreground)]">
                  {note.text}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <time
                    className="text-xs text-[var(--color-muted-foreground)]"
                    dateTime={note.createdAt}
                  >
                    {new Date(note.createdAt).toLocaleString('es-CL', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </time>
                  <button
                    type="button"
                    onClick={() => removeNote(note.id)}
                    className="text-xs font-medium text-[var(--color-muted-foreground)] underline decoration-[var(--color-border)] underline-offset-2 hover:text-[var(--color-foreground)]"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
