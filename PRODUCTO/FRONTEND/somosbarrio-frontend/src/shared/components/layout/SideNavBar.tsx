import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/store/authStore';
import { SB_COLORS } from '@/shared/constants/colors';

export default function SideNavBar() {
    const location = useLocation();
    const navigate = useNavigate();
    const logout = useAuthStore((s) => s.logout);
    const isActive = (path: string) => location.pathname === path;

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
            
            <button className="mb-stack-lg w-full rounded-lg bg-black px-4 py-3 font-semibold text-white flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all active:scale-95 shadow-sm cursor-pointer text-sm">
                <span className="material-symbols-outlined text-white text-[20px]">add</span>
                <span>Nueva Solicitud</span>
            </button>
           
            <nav className="flex-1 space-y-1">
                <Link to="/" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActive('/') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="text-sm font-semibold">Panel de Control</span>
                </Link>
                
                {/* Ruta actualizada según router.tsx */}
                <Link to="/activities" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActive('/activities') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                    <span className="material-symbols-outlined">folder_open</span>
                    <span className="text-sm font-semibold">Actividades</span>
                </Link>
                
                <Link to="/inbox" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActive('/inbox') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                    <span className="material-symbols-outlined">move_to_inbox</span>
                    <span className="text-sm font-semibold">Bandeja de Entrada</span>
                </Link>
                
                <Link to="/reports" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActive('/reports') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                    <span className="material-symbols-outlined">bar_chart</span>
                    <span className="text-sm font-semibold">Reportes</span>
                </Link>
                
                <Link to="/settings" className={`flex items-center gap-3 px-3 py-2 transition-colors duration-200 rounded-lg ${isActive('/settings') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                    <span className="material-symbols-outlined">settings</span>
                    <span className="text-sm font-semibold">Configuración</span>
                </Link>
            </nav>
            
            <div className="mt-auto pt-stack-md border-t border-outline-variant space-y-1">
                <a className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200 rounded-lg" href="#">
                    <span className="material-symbols-outlined">help</span>
                    <span className="text-sm font-semibold">Soporte</span>
                </a>
                <button
                    type="button"
                    onClick={handleLogout}
                    style={{ backgroundColor: SB_COLORS.RED }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-white transition-all hover:opacity-90 cursor-pointer">
                    <span className="material-symbols-outlined">logout</span>
                    <span className="text-sm font-semibold">Cerrar sesión</span>
                </button>
                <div className="flex items-center gap-3 px-3 py-4 mt-2">
                    <img alt="Perfil" className="w-8 h-8 rounded-full border border-outline-variant" src="https://lh3.googleusercontent.com/a/default-user=s64-c" />
                    <div>
                        <p className="text-sm font-semibold text-on-surface leading-none">Usuario Demo</p>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Administrador</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}