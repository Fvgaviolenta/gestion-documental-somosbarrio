export function WorkerHelpPage() {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold text-[var(--color-foreground)]">Ayuda / soporte</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Recursos para usar el panel de trabajador y reportar problemas.
        </p>
      </header>
      <div className="space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm">
        <p className="text-[var(--color-foreground)]">
          <strong className="font-semibold">Reportes y bitácora</strong>
        </p>
        <p className="text-[var(--color-muted-foreground)]">
          Complete los formularios con la mayor precisión posible y adjunte fotos cuando corresponda.
          Los borradores locales dependen del navegador hasta que exista sincronización con el
          servidor.
        </p>
        <p className="text-[var(--color-foreground)]">
          <strong className="font-semibold">Soporte</strong>
        </p>
        <p className="text-[var(--color-muted-foreground)]">
          Si necesita asistencia técnica o tiene dudas sobre procedimientos, contacte a su
          coordinación o al administrador de la plataforma.
        </p>
      </div>
    </section>
  )
}
