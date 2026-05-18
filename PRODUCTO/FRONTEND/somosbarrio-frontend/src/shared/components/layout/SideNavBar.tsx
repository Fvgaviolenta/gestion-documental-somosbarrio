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
        navigate('/login', { replace: true });
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
                <Link to="/" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActive('/') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="text-sm font-semibold">Panel de Control</span>
                </Link>
                
                <Link to="/activities" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActivePrefix('/activities') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                    <span className="material-symbols-outlined">folder_open</span>
                    <span className="text-sm font-semibold">Actividades</span>
                </Link>

                <Link to="/documents" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActivePrefix('/documents') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                    <span className="material-symbols-outlined">description</span>
                    <span className="text-sm font-semibold">Documentos</span>
                </Link>

                <Link to="/repository" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActive('/repository') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                    <span className="material-symbols-outlined">search</span>
                    <span className="text-sm font-semibold">Repositorio</span>
                </Link>

                <Link to="/minutes" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActivePrefix('/minutes') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                    <span className="material-symbols-outlined">assignment</span>
                    <span className="text-sm font-semibold">Actas</span>
                </Link>
                
                <Link to="/reports" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActive('/reports') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                    <span className="material-symbols-outlined">bar_chart</span>
                    <span className="text-sm font-semibold">Reportes</span>
                </Link>

                {isAdmin && (
                    <>
                        <Link to="/users" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActivePrefix('/users') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                            <span className="material-symbols-outlined">manage_accounts</span>
                            <span className="text-sm font-semibold">Gestión Usuarios</span>
                        </Link>
                        <Link to="/document-templates" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActive('/document-templates') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                            <span className="material-symbols-outlined">article</span>
                            <span className="text-sm font-semibold">Plantillas</span>
                        </Link>
                        <Link to="/recipient-groups" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActive('/recipient-groups') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                            <span className="material-symbols-outlined">mail</span>
                            <span className="text-sm font-semibold">Destinatarios</span>
                        </Link>
                        <Link to="/audit-logs" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActive('/audit-logs') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                            <span className="material-symbols-outlined">history</span>
                            <span className="text-sm font-semibold">Auditoría</span>
                        </Link>
                    </>
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
