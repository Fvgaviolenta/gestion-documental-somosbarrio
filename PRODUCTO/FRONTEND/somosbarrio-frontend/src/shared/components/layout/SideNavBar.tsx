import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/store/authStore';
import { SB_COLORS } from '@/shared/constants/colors';

export default function SideNavBar() {
    const location = useLocation();
    const navigate = useNavigate();
    const logout = useAuthStore((s) => s.logout);
    const user = useAuthStore((s) => s.user);
    const hasRole = useAuthStore((s) => s.hasRole);
    const isAdmin = hasRole('ADMINISTRADOR');
    const isActive = (path: string) => location.pathname === path;
    const isActivePrefix = (path: string) => location.pathname.startsWith(path);

    const displayName =
        user?.firstName || user?.lastName
            ? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
            : user?.email ?? 'Usuario';

    const primaryRole = user?.roles[0] ?? 'Usuario';

    const handleLogout = async () => {
        await logout();
        navigate(isAdmin ? '/login' : '/trabajador/login', { replace: true });
    };

    return (
        <aside className="hidden md:flex flex-col flex-shrink-0 h-screen w-64 bg-surface-container-lowest border-r border-outline-variant p-stack-md overflow-y-auto">
            <div className="mb-stack-lg">
                <h1 className="text-2xl font-bold text-primary">Somos Barrio</h1>
                <p className="text-xs text-on-surface-variant">Portal Institucional</p>
            </div>
            
            <Link
                to="/documents/new"
                className="mb-stack-lg flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-95"
            >
                <span className="material-symbols-outlined text-[20px] text-white">add</span>
                <span>Nueva Solicitud</span>
            </Link>
           
            <nav className="flex-1 space-y-1">
                {/* 1. Panel de Control (Siempre visible, siempre apunta al entorno moderno) */}
                <Link to="/" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActive('/') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="text-sm font-semibold">Panel de Control</span>
                </Link>
                
                {/* 2. Actividades */}
                <Link to="/activities" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActivePrefix('/activities') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                    <span className="material-symbols-outlined">folder_open</span>
                    <span className="text-sm font-semibold">Actividades</span>
                </Link>

                {/* 3. Documentos */}
                <Link to="/documents" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActivePrefix('/documents') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                    <span className="material-symbols-outlined">description</span>
                    <span className="text-sm font-semibold">Documentos</span>
                </Link>

                {/* 4. Actas (Dividido por rol pero dentro del menú moderno) */}
                <Link 
                    to={isAdmin ? "/minutes" : "/mis-actas"} 
                    className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${(isAdmin ? isActivePrefix('/minutes') : isActivePrefix('/mis-actas')) ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                    <span className="material-symbols-outlined">assignment</span>
                    <span className="text-sm font-semibold">Actas</span>
                </Link>

                {/* 5. Plantillas (Solo Admin) */}
                {isAdmin && (
                    <Link to="/document-templates" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActive('/document-templates') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                        <span className="material-symbols-outlined">article</span>
                        <span className="text-sm font-semibold">Plantillas</span>
                    </Link>
                )}

                {/* 6. Destinatarios (Solo Admin) */}
                {isAdmin && (
                    <Link to="/recipient-groups" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActive('/recipient-groups') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                        <span className="material-symbols-outlined">mail</span>
                        <span className="text-sm font-semibold">Destinatarios</span>
                    </Link>
                )}

                {/* 7. Repositorio (SOLO visible para Admin si la vista del colaborador se rompe por falta de permisos del backend) */}
                {isAdmin && (
                    <Link to="/repository" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActive('/repository') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                        <span className="material-symbols-outlined">search</span>
                        <span className="text-sm font-semibold">Repositorio</span>
                    </Link>
                )}

                {/* 8. Auditoría (Solo Admin) */}
                {isAdmin && (
                    <Link to="/audit-logs" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActive('/audit-logs') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                        <span className="material-symbols-outlined">history</span>
                        <span className="text-sm font-semibold">Auditoría</span>
                    </Link>
                )}
                
                {/* 9. Reportes (Dividido por rol) */}
                {isAdmin ? (
                    <Link to="/reports" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActive('/reports') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                        <span className="material-symbols-outlined">bar_chart</span>
                        <span className="text-sm font-semibold">Reportes</span>
                    </Link>
                ) : (
                    <Link to="/mis-reportes" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActivePrefix('/mis-reportes') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                        <span className="material-symbols-outlined">campaign</span>
                        <span className="text-sm font-semibold">Reportes</span>
                    </Link>
                )}

                {/* 10. Gestión Usuarios (Solo Admin) */}
                {isAdmin && (
                    <Link to="/users" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActivePrefix('/users') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                        <span className="material-symbols-outlined">manage_accounts</span>
                        <span className="text-sm font-semibold">Gestión Usuarios</span>
                    </Link>
                )}
            </nav>
            
            <div className="mt-auto pt-stack-md border-t border-outline-variant space-y-1">
                <button
                    type="button"
                    onClick={handleLogout}
                    style={{ backgroundColor: SB_COLORS.RED }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-white transition-all hover:opacity-90 cursor-pointer">
                    <span className="material-symbols-outlined">logout</span>
                    <span className="text-sm font-semibold">Cerrar sesión</span>
                </button>
                <Link
                    to="/account"
                    className="flex items-center gap-3 px-3 py-4 mt-2 rounded-lg hover:bg-surface-container-high transition-colors"
                >
                    <div className="w-8 h-8 rounded-full border border-outline-variant bg-sb-dark-purple/10 flex items-center justify-center text-sb-dark-purple font-bold text-sm">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-on-surface leading-none">{displayName}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{primaryRole}</p>
                    </div>
                </Link>
            </div>
        </aside>
    );
}