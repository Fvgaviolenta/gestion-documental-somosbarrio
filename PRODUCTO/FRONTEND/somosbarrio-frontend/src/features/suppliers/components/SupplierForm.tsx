import { useState, useEffect } from 'react'
import type { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '@/features/suppliers/api/suppliers.api'

function validateRut(rut: string): boolean {
  const clean = rut.replace(/[.\-]/g, '').toUpperCase()
  if (clean.length < 8) return false
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  if (!/^\d+$/.test(body)) return false
  let sum = 0
  let multiplier = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }
  const remainder = 11 - (sum % 11)
  const expected = remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder)
  return dv === expected
}

function TagInput({
  label, values, onChange, placeholder, required, error,
}: {
  label: string; values: string[]; onChange: (values: string[]) => void
  placeholder?: string; required?: boolean; error?: string
}) {
  const [input, setInput] = useState('')
  const addTag = () => {
    const trimmed = input.trim()
    if (trimmed && !values.includes(trimmed)) onChange([...values, trimmed])
    setInput('')
  }
  const removeTag = (tag: string) => onChange(values.filter((v) => v !== tag))
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-on-surface">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-outline-variant bg-surface-container-lowest">
        {values.map((tag) => (
          <div key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-xs text-primary">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
              ✕
            </button>
          </div>
        ))}
        <input
          type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }}
          onBlur={addTag}
          placeholder={values.length === 0 ? (placeholder ?? 'Escribir y presionar Enter') : ''}
          className="flex-1 min-w-20 outline-none bg-transparent text-sm text-on-surface"
        />
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
      <span className="text-xs text-on-surface-variant">Presiona Enter o coma para agregar cada valor</span>
    </div>
  )
}

type FormData = {
  nombreProveedor: string; rutEmpresa: string; emailContacto: string
  telefonoContacto: string; direccion: string; giros: string[]
  idLicitaciones: string[]; ordenesCompra: string[]
}
type FormErrors = Partial<Record<keyof FormData, string>>

interface SupplierFormProps {
  initialData?: Supplier
  onSubmit: (data: CreateSupplierRequest | UpdateSupplierRequest) => void
  onCancel: () => void
  isLoading: boolean
  serverError?: string
}

export function SupplierForm({ initialData, onSubmit, onCancel, isLoading, serverError }: SupplierFormProps) {
  const isEditing = !!initialData
  const [form, setForm] = useState<FormData>({
    nombreProveedor: initialData?.nombreProveedor ?? '',
    rutEmpresa: initialData?.rutEmpresa ?? '',
    emailContacto: initialData?.emailContacto ?? '',
    telefonoContacto: initialData?.telefonoContacto ?? '',
    direccion: initialData?.direccion ?? '',
    giros: initialData?.giros ?? [],
    idLicitaciones: initialData?.idLicitaciones ?? [],
    ordenesCompra: initialData?.ordenesCompra ?? [],
  })
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (initialData) {
      setForm({
        nombreProveedor: initialData.nombreProveedor,
        rutEmpresa: initialData.rutEmpresa,
        emailContacto: initialData.emailContacto,
        telefonoContacto: initialData.telefonoContacto ?? '',
        direccion: initialData.direccion ?? '',
        giros: initialData.giros,
        idLicitaciones: initialData.idLicitaciones,
        ordenesCompra: initialData.ordenesCompra,
      })
    }
  }, [initialData?.id])

  const set = (field: keyof FormData, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    if (!form.nombreProveedor.trim()) newErrors.nombreProveedor = 'El nombre es obligatorio'
    if (!form.rutEmpresa.trim()) newErrors.rutEmpresa = 'El RUT es obligatorio'
    else if (!validateRut(form.rutEmpresa)) newErrors.rutEmpresa = 'RUT inválido (ej: 12.345.678-9)'
    if (!form.emailContacto.trim()) newErrors.emailContacto = 'El email es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailContacto)) newErrors.emailContacto = 'Formato de email inválido'
    if (form.giros.length === 0) newErrors.giros = 'Debe ingresar al menos un giro'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      nombreProveedor: form.nombreProveedor.trim(),
      rutEmpresa: form.rutEmpresa.trim(),
      emailContacto: form.emailContacto.trim(),
      telefonoContacto: form.telefonoContacto.trim() || undefined,
      direccion: form.direccion.trim() || undefined,
      giros: form.giros,
      idLicitaciones: form.idLicitaciones,
      ordenesCompra: form.ordenesCompra,
    })
  }

  const inputClass = (field: keyof FormData) =>
    `w-full rounded-lg border px-3 py-2 text-sm text-on-surface bg-surface-container-lowest outline-none transition focus:ring-2 focus:ring-primary/30 ${errors[field] ? 'border-red-400' : 'border-outline-variant'}`

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {serverError && (
        <div className="flex gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <span className="text-red-600 text-lg flex-shrink-0">⚠️</span>
          <span className="text-sm text-red-700">{serverError}</span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-on-surface mb-1 block">
            Nombre Proveedor <span className="text-red-500">*</span>
          </label>
          <input type="text" value={form.nombreProveedor} onChange={(e) => set('nombreProveedor', e.target.value)} placeholder="Empresa Ejemplo Ltda." disabled={isLoading} className={inputClass('nombreProveedor')} />
          {errors.nombreProveedor && <span className="text-xs text-red-500">{errors.nombreProveedor}</span>}
        </div>

        <div>
          <label className="text-xs font-semibold text-on-surface mb-1 block">
            RUT Empresa <span className="text-red-500">*</span>
          </label>
          <input type="text" value={form.rutEmpresa} onChange={(e) => set('rutEmpresa', e.target.value)} placeholder="12.345.678-9" disabled={isLoading} className={inputClass('rutEmpresa')} />
          {errors.rutEmpresa && <span className="text-xs text-red-500">{errors.rutEmpresa}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-on-surface mb-1 block">
            Email Contacto <span className="text-red-500">*</span>
          </label>
          <input type="email" value={form.emailContacto} onChange={(e) => set('emailContacto', e.target.value)} placeholder="contacto@empresa.cl" disabled={isLoading} className={inputClass('emailContacto')} />
          {errors.emailContacto && <span className="text-xs text-red-500">{errors.emailContacto}</span>}
        </div>

        <div>
          <label className="text-xs font-semibold text-on-surface mb-1 block">Teléfono</label>
          <input type="text" value={form.telefonoContacto} onChange={(e) => set('telefonoContacto', e.target.value)} placeholder="+56 9 1234 5678" disabled={isLoading} className={inputClass('telefonoContacto')} />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-on-surface mb-1 block">Dirección</label>
        <textarea value={form.direccion} onChange={(e) => set('direccion', e.target.value)} placeholder="Calle, número, ciudad" disabled={isLoading} className={`${inputClass('direccion')} resize-none min-h-20`} />
      </div>

      <TagInput label="Giros" values={form.giros} onChange={(v) => set('giros', v)} placeholder="Ej: Consultoría, Capacitación" required error={errors.giros} />
      <TagInput label="IDs Licitación" values={form.idLicitaciones} onChange={(v) => set('idLicitaciones', v)} placeholder="Ej: LIC-2024-001" />
      <TagInput label="Órdenes de Compra" values={form.ordenesCompra} onChange={(v) => set('ordenesCompra', v)} placeholder="Ej: OC-2024-042" />
      
      <div className="flex gap-3 justify-end pt-4">
        <button type="button" onClick={onCancel} disabled={isLoading} className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-high disabled:opacity-40 transition-colors text-sm font-medium">
          Cancelar
        </button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-40 transition-colors text-sm font-bold flex items-center gap-2 shadow-md">
          {isLoading && <span>⏳</span>}
          {isEditing ? 'Guardar cambios' : 'Crear proveedor'}
        </button>
      </div>
    </form>
  )
}
