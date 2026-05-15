interface EmptyStateProps {
  title: string
  description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-muted)]/40 px-6 py-16 text-center"
      role="status"
    >
      <p className="text-lg font-medium text-[var(--color-foreground)]">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-[var(--color-muted-foreground)]">
          {description}
        </p>
      ) : null}
    </div>
  )
}
