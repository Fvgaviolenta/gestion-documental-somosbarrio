/** Fecha legible (Chile). Backend: America/Santiago. */
export function formatDate(iso: string | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Santiago',
  }).format(d)
}

export function formatDateOnly(iso: string | undefined): string {
  if (!iso) return '—'
  const cleanDate = iso.slice(0, 10); 
  const parts = cleanDate.split('-');
  if (parts.length !== 3) return iso;
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
}
