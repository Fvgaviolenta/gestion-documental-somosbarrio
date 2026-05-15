export function WorkerConfigPage() {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold text-[var(--color-foreground)]">Configuración</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Preferencias de la app en modo trabajador. Más opciones se habilitarán cuando haya cuenta
          vinculada al backend.
        </p>
      </header>
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm text-[var(--color-muted-foreground)]">
        No hay ajustes obligatorios por ahora. Use el menú para volver a sus registros o notas.
      </div>
    </section>
  )
}
