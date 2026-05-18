import { ROLES, type Role } from '@/shared/types/enums'

const ROLE_LABELS: Record<Role, string> = {
  ADMINISTRADOR: 'Administrador',
  COLABORADOR: 'Colaborador (trabajador)',
}

interface RoleCheckboxesProps {
  value: string[]
  onChange: (roles: string[]) => void
  disabled?: boolean
}

export function RoleCheckboxes({ value, onChange, disabled }: RoleCheckboxesProps) {
  const toggle = (role: Role) => {
    if (disabled) return
    if (value.includes(role)) {
      const next = value.filter((r) => r !== role)
      onChange(next.length > 0 ? next : [role])
    } else {
      onChange([...value, role])
    }
  }

  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="text-xs font-bold uppercase text-on-surface-variant">Roles</legend>
      {ROLES.map((role) => (
        <label key={role} className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={value.includes(role)}
            onChange={() => toggle(role)}
          />
          <span>
            <span className="font-medium">{role}</span>
            <span className="text-on-surface-variant"> — {ROLE_LABELS[role]}</span>
          </span>
        </label>
      ))}
    </fieldset>
  )
}
