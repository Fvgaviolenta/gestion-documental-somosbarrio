import { useState } from 'react';
import axios from 'axios'; 
import { useUsers, useDeleteUser, useCreateUser, useUpdateUser } from '../hooks/useUsers';
import type { User } from '../api/users.api';
import { SB_COLORS } from '@/shared/constants/colors';
import { RoleCheckboxes } from '@/shared/components/RoleCheckboxes';
import type { ApiErrorBody } from '@/shared/types/api'; 

export function UsersListPage() {
    const { data: users, isLoading, error } = useUsers();
    const deleteUserMutation = useDeleteUser();
    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editFirstName, setEditFirstName] = useState('');
    const [editLastName, setEditLastName] = useState('');
    const [editRoles, setEditRoles] = useState<string[]>(['COLABORADOR']);
    const [editActive, setEditActive] = useState(true);
    const [editError, setEditError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [createRoles, setCreateRoles] = useState<string[]>(['COLABORADOR']);
    const [formError, setFormError] = useState<string | null>(null);

    const filteredUsers = users?.filter(user => {
        const emailMatch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const firstNameMatch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
        const lastNameMatch = user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
        return emailMatch || firstNameMatch || lastNameMatch;
    }) ?? [];

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!email.trim()) {
            setFormError('El correo electrónico es obligatorio.');
            return;
        }

        if (!fullName.trim()) {
            setFormError('El nombre completo es obligatorio.');
            return;
        }

        try {
            const nameParts = fullName.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || ' ';

            await createUserMutation.mutateAsync({
                email: email.trim(),
                password: 'Temporal123!', 
                firstName: firstName,
                lastName: lastName,
                roles: createRoles,
            });
            
            setEmail('');
            setFullName('');
            setCreateRoles(['COLABORADOR']);
            setShowForm(false);
        } catch (err) {
            console.error('Error al crear usuario:', err);
            
            if (axios.isAxiosError(err) && err.response) {
                const data = err.response.data as ApiErrorBody | undefined;
                setFormError(data?.message ?? 'El servidor rechazó el registro. Verifique el formato.');
            } else {
                setFormError(err instanceof Error ? err.message : 'No se pudo registrar el usuario en el sistema.');
            }
        }
    };

    const openEdit = (user: User) => {
        setEditingUser(user);
        setEditFirstName(user.firstName ?? '');
        setEditLastName(user.lastName ?? '');
        setEditRoles(
            user.roles.length
                ? user.roles.map((r) => (r.startsWith('ROLE_') ? r.replace('ROLE_', '') : r))
                : ['COLABORADOR'],
        );
        setEditActive(user.enabled);
        setEditError(null);
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setEditError(null);
        try {
            await updateUserMutation.mutateAsync({
                id: editingUser.id,
                data: {
                    firstName: editFirstName.trim(),
                    lastName: editLastName.trim(),
                    roles: editRoles,
                    isActive: editActive,
                },
            });
            setEditingUser(null);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                const data = err.response.data as ApiErrorBody | undefined;
                setEditError(data?.message ?? 'No se pudo actualizar el usuario.');
            } else {
                setEditError('No se pudo actualizar el usuario.');
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Estás seguro de que deseas deshabilitar a este usuario?')) {
            try {
                try {
                    await deleteUserMutation.mutateAsync(id);
                } catch (e) {
                    console.error('Error al dar de baja al usuario:', e);
                }
            } catch (e) {
                console.error('Error al dar de baja al usuario:', e);
            }
        }
    };

    return (
        <div className="min-h-screen p-margin bg-surface">
            <div className="max-w-container-max mx-auto">
                
                <section className="mb-stack-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-4xl font-bold text-sb-dark-purple">Gestión de Usuarios</h2>
                            <p className="text-base text-on-surface-variant">
                                Administra las cuentas, accesos y roles del personal del Programa Somos Barrio.
                            </p>
                        </div>

                        <button 
                            onClick={() => setShowForm(!showForm)}
                            style={{ backgroundColor: SB_COLORS.PURPLE }}
                            className="px-4 py-2 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-sm active:scale-95 self-start sm:self-auto"
                        >
                            <span className="material-symbols-outlined text-white text-[18px]">
                                {showForm ? 'close' : 'person_add'}
                            </span>
                            {showForm ? 'Cancelar' : 'Nuevo Usuario'}
                        </button>
                    </div>
                </section>

                {editingUser && (
                    <form onSubmit={handleUpdateUser} className="mb-stack-lg bg-surface-container-lowest border border-outline-variant p-stack-md rounded-xl shadow-md">
                        <h3 className="text-lg font-bold text-sb-dark-purple mb-stack-sm">Editar usuario</h3>
                        <p className="text-xs text-on-surface-variant mb-stack-sm font-mono">{editingUser.email}</p>
                        {editError && (
                            <p className="mb-stack-sm p-stack-sm bg-error-container text-on-error-container rounded-lg text-xs" role="alert">
                                {editError}
                            </p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                            <div>
                                <label className="text-xs font-bold uppercase">Nombre</label>
                                <input className="w-full p-2 border rounded-lg text-sm mt-1" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase">Apellido</label>
                                <input className="w-full p-2 border rounded-lg text-sm mt-1" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} required />
                            </div>
                            <div className="md:col-span-2">
                                <RoleCheckboxes value={editRoles} onChange={setEditRoles} />
                            </div>
                            <div className="flex items-end">
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} />
                                    Usuario activo
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-stack-md">
                            <button type="button" className="px-4 py-2 border rounded-lg text-sm" onClick={() => setEditingUser(null)}>Cancelar</button>
                            <button type="submit" disabled={updateUserMutation.isPending} className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                                {updateUserMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
                            </button>
                        </div>
                    </form>
                )}

                {showForm && (
                    <form onSubmit={handleCreateUser} className="mb-stack-lg bg-surface-container-lowest border border-outline-variant p-stack-md rounded-xl shadow-md">
                        <h3 className="text-lg font-bold text-sb-dark-purple mb-stack-sm">Registrar Nuevo Personal</h3>
                        
                        {formError && (
                            <div className="mb-stack-sm p-stack-sm bg-error-container text-on-error-container rounded-lg text-xs border border-error/20" role="alert">
                                {formError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-md">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-on-surface-variant uppercase">Correo Electrónico</label>
                                <input 
                                    type="email" 
                                    required
                                    placeholder="ejemplo@somosbarrio.cl"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="p-2 border border-outline-variant rounded-lg text-sm bg-surface focus:outline-none focus:border-sb-purple"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-on-surface-variant uppercase">Nombre Completo</label>
                                <input 
                                    type="text" 
                                    placeholder="Juan Pérez"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="p-2 border border-outline-variant rounded-lg text-sm bg-surface focus:outline-none focus:border-sb-purple"
                                />
                            </div>
                            <div className="md:col-span-3">
                                <RoleCheckboxes value={createRoles} onChange={setCreateRoles} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-stack-md">
                            <button 
                                type="submit" 
                                disabled={createUserMutation.isPending}
                                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                            >
                                {createUserMutation.isPending ? 'Guardando...' : 'Confirmar Registro'}
                            </button>
                        </div>
                    </form>
                )}

                <section className="mb-stack-md bg-surface-container-lowest border border-outline-variant p-stack-sm rounded-xl shadow-sm flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant">search</span>
                    <input 
                        type="text"
                        placeholder="Buscar por nombre o correo electrónico..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent text-sm text-on-surface placeholder-on-surface-variant/60 focus:outline-none"
                    />
                </section>

                {isLoading ? (
                    <div className="flex justify-center items-center py-20 text-on-surface-variant font-medium">
                        <span className="animate-pulse">Cargando nómina de usuarios...</span>
                    </div>
                ) : error ? (
                    <div className="rounded-xl bg-error-container p-stack-md text-on-error-container border border-error/30 mb-section-gap">
                        No se pudieron cargar los usuarios de la base de datos. Verifique sus permisos de Administrador.
                    </div>
                ) : (
                    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-surface-container-low border-b border-outline-variant">
                                    <tr>
                                        <th className="p-stack-md text-xs font-bold text-sb-dark-purple uppercase tracking-wider">Usuario</th>
                                        <th className="p-stack-md text-xs font-bold text-sb-dark-purple uppercase tracking-wider">Correo Electrónico</th>
                                        <th className="p-stack-md text-xs font-bold text-sb-dark-purple uppercase tracking-wider">Roles Asignados</th>
                                        <th className="p-stack-md text-xs font-bold text-sb-dark-purple uppercase tracking-wider">Estado</th>
                                        <th className="p-stack-md text-xs font-bold text-sb-dark-purple uppercase tracking-wider text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-stack-lg text-center text-sm text-on-surface-variant">
                                                No se encontraron usuarios registrados en este sector.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-surface-container-low/40 transition-colors">
                                                <td className="p-stack-md">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-sb-dark-purple/10 flex items-center justify-center text-sb-dark-purple font-bold text-sm">
                                                            {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm font-semibold text-on-surface">
                                                            {user.firstName || user.lastName 
                                                                ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() 
                                                                : 'Sin Nombre Completo'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-stack-md text-sm text-on-surface-variant font-mono">
                                                    {user.email}
                                                </td>
                                                <td className="p-stack-md">
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles.map((role, idx) => (
                                                            <span key={idx} className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container tracking-wide uppercase">
                                                                {role}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-stack-md">
                                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${user.enabled ? 'bg-green-100 text-green-800' : 'bg-zinc-100 text-zinc-600'}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${user.enabled ? 'bg-green-500' : 'bg-zinc-400'}`}></span>
                                                        {user.enabled ? 'ACTIVO' : 'INACTIVO'}
                                                    </span>
                                                </td>
                                                <td className="p-stack-md text-center">
                                                    <div className="flex justify-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(user)}
                                                            className="p-1.5 rounded-lg text-sb-purple hover:bg-secondary-container/50 cursor-pointer"
                                                            title="Editar usuario"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(user.id)}
                                                            disabled={!user.enabled || deleteUserMutation.isPending}
                                                            className={`p-1.5 rounded-lg inline-flex items-center justify-center transition-colors ${user.enabled && !deleteUserMutation.isPending ? 'text-sb-red hover:bg-error-container/30 cursor-pointer' : 'text-zinc-300 cursor-not-allowed'}`}
                                                            title="Deshabilitar usuario"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">person_remove</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}