import { useState } from 'react';
import { useUsers, useDeleteUser, useCreateUser } from '../hooks/useUsers'; // 1. Agregado useCreateUser
import { SB_COLORS } from '@/shared/constants/colors';

export function UsersListPage() {
    const { data: users, isLoading, error } = useUsers();
    const deleteUserMutation = useDeleteUser();
    const createUserMutation = useCreateUser(); // Declaráramos la mutación real

    // Estados para filtros
    const [searchTerm, setSearchTerm] = useState('');

    // 2. Estados para controlar el Formulario de Creación Real
    const [showForm, setShowForm] = useState(false);
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('COLABORADOR');
    const [formError, setFormError] = useState<string | null>(null);

    // Filtrado básico local para optimizar la experiencia de búsqueda
    const filteredUsers = users?.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    ) ?? [];

    // Manejador del envío del formulario al backend de Spring Boot
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!email.trim()) {
            setFormError('El correo electrónico es obligatorio.');
            return;
        }

        try {
            await createUserMutation.mutateAsync({
                email: email.trim(),
                fullName: fullName.trim() || undefined,
                roles: [role]
            });
            
            // Limpiar campos si todo sale bien
            setEmail('');
            setFullName('');
            setRole('COLABORADOR');
            setShowForm(false);
        } catch (err) {
            console.error('Error al crear usuario:', err);
            setFormError('No se pudo registrar el usuario en el sistema.');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Estás seguro de que deseas deshabilitar a este usuario?')) {
            try {
                await deleteUserMutation.mutateAsync(id);
            } catch (e) {
                console.error('Error al dar de baja al usuario:', e);
            }
        }
    };

    return (
        <div className="min-h-screen p-margin bg-surface">
            <div className="max-w-container-max mx-auto">
                
                {/* Cabecera del Módulo */}
                <section className="mb-stack-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-4xl font-bold text-sb-dark-purple">Gestión de Usuarios</h2>
                            <p className="text-base text-on-surface-variant">
                                Administra las cuentas, accesos y roles del personal del Programa Somos Barrio.
                            </p>
                        </div>

                        {/* Conexión del botón para alternar el formulario */}
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

                {/* 3. Formulario de Inserción de Usuarios */}
                {showForm && (
                    <form onSubmit={handleCreateUser} className="mb-stack-lg bg-surface-container-lowest border border-outline-variant p-stack-md rounded-xl shadow-md">
                        <h3 className="text-lg font-bold text-sb-dark-purple mb-stack-sm">Registrar Nuevo Personal</h3>
                        
                        {formError && (
                            <div className="mb-stack-sm p-stack-sm bg-error-container text-on-error-container rounded-lg text-xs border border-error/20">
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
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-on-surface-variant uppercase">Rol Inicial</label>
                                <select 
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="p-2 border border-outline-variant rounded-lg text-sm bg-surface focus:outline-none focus:border-sb-purple"
                                >
                                    <option value="COLABORADOR">COLABORADOR (Terreno)</option>
                                    <option value="ADMINISTRADOR">ADMINISTRADOR (Gestión)</option>
                                </select>
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

                {/* Barra de Filtros */}
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

                {/* Estados de Carga y Errores de API REST */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20 text-on-surface-variant font-medium">
                        <span className="animate-pulse">Cargando nómina de usuarios...</span>
                    </div>
                ) : error ? (
                    <div className="rounded-xl bg-error-container p-stack-md text-on-error-container border border-error/30 mb-section-gap">
                        No se pudieron cargar los usuarios de la base de datos. Verifique sus permisos de Administrador.
                    </div>
                ) : (
                    /* Tabla de Datos de Usuarios */
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
                                                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm font-semibold text-on-surface">
                                                            {user.fullName || 'Sin Nombre Completo'}
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
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        disabled={!user.enabled || deleteUserMutation.isPending}
                                                        className={`p-1.5 rounded-lg inline-flex items-center justify-center transition-colors ${user.enabled && !deleteUserMutation.isPending ? 'text-sb-red hover:bg-error-container/30 cursor-pointer' : 'text-zinc-300 cursor-not-allowed'}`}
                                                        title="Deshabilitar usuario"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">person_remove</span>
                                                    </button>
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