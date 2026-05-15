import { useActivities } from '@/features/activities/hooks/useActivities';

export function HomePage() {
    const { data: activitiesData, isLoading } = useActivities({ page: 0, size: 100 });

    const totalActividades = activitiesData?.totalElements ?? 0;
    const actividadesPlanificadas = activitiesData?.content.filter(a => a.status === 'PLANIFICADA').length ?? 0;

    const kpis = [
        { 
            label: "Actividades Planificadas", 
            val: isLoading ? "..." : actividadesPlanificadas.toString(), 
            icon: "pending_actions", 
            change: "Pendientes de inicio", 
            bad: actividadesPlanificadas > 5 
        },
        { 
            label: "Total de Actividades", 
            val: isLoading ? "..." : totalActividades.toString(), 
            icon: "event_available", 
            tag: "Sincronizado" 
        },
        { 
            label: "Alertas Activas", 
            val: "0", 
            icon: "warning", 
            color: "text-error", 
            sub: "Sin incidencias hoy" 
        },
        { 
            label: "Eficiencia del Portal", 
            val: "100%", 
            icon: "speed", 
            tag: "Óptimo" 
        }
    ];

    return (
        <div className="min-h-screen p-margin bg-surface">
            <div className="max-w-container-max mx-auto">
                {/* Cabecera */}
                <section className="mb-stack-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-4xl font-bold text-primary">Control Central</h2>
                            <p className="text-base text-on-surface-variant">Visualización en tiempo real del estado operativo de Somos Barrio.</p>
                        </div>
                        <div className="flex gap-stack-sm">
                            <button className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 bg-black text-white hover:bg-zinc-700 transition-colors cursor-pointer">
                                <span className="material-symbols-outlined text-[18px]">download</span> Exportar Datos
                            </button>
                            <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-zinc-700 transition-all cursor-pointer shadow-sm active:scale-95">
                                <span className="material-symbols-outlined text-white text-[18px]">add</span> 
                                Nuevo Trámite
                            </button>
                        </div>
                    </div>
                </section>

                {/* KPIs Dinámicos */}
                <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-gutter mb-section-gap">
                    {kpis.map((kpi, idx) => (
                        <div key={idx} className="bg-surface-container-lowest border border-outline-variant p-stack-md rounded-xl flex flex-col justify-between min-h-40 shadow-sm">
                            <div>
                                <span className={`material-symbols-outlined ${kpi.color || 'text-primary'} mb-2`}>{kpi.icon}</span>
                                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">{kpi.label}</p>
                                <h3 className={`text-3xl font-bold ${kpi.color || 'text-primary'} mt-1`}>{kpi.val}</h3>
                            </div>
                            <div className="mt-4">
                                {kpi.change && <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${kpi.bad ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'}`}>{kpi.change}</span>}
                                {kpi.tag && <span className="text-[12px] font-bold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">{kpi.tag}</span>}
                                {kpi.sub && <p className="text-xs text-on-surface-variant">{kpi.sub}</p>}
                            </div>
                        </div>
                    ))}
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
                    {/* Gráfico (Simulado con alturas según datos) */}
                    <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm">
                        <div className="p-stack-md bg-surface-container-low flex justify-between items-center border-b border-outline-variant">
                            <h4 className="text-sm font-semibold text-primary">Distribución de Actividades</h4>
                            <p className="text-xs text-on-surface-variant">Basado en registros actuales</p>
                        </div>
                        <div className="p-stack-md flex-1 min-h-[300px] flex flex-col justify-end">
                            <div className="flex items-end justify-around h-64 gap-2">
                                {/* Generamos barras simples proporcionales al total para el ejemplo visual */}
                                {[30, 45, 60, 20, 80].map((h, i) => (
                                    <div key={i} className="bg-primary/20 w-12 rounded-t hover:bg-primary transition-colors relative group cursor-help" style={{height: `${h}%`}}>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {Math.round((h * totalActividades) / 100)} und.
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-around mt-4 text-[10px] text-on-surface-variant font-bold uppercase">
                                <span>Planif.</span><span>En Curso</span><span>Fin.</span><span>Can.</span><span>Total</span>
                            </div>
                        </div>
                    </div>

                    {/* Accesos Rápidos */}
                    <div className="space-y-gutter">
                        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md shadow-sm">
                            <h4 className="text-sm font-semibold text-primary mb-stack-md">Accesos Rápidos</h4>
                            <div className="grid grid-cols-2 gap-stack-sm">
                                {[
                                    { icon: 'description', label: 'Docs' },
                                    { icon: 'person_search', label: 'Usuarios' },
                                    { icon: 'payments', label: 'Pagos' },
                                    { icon: 'mail', label: 'Correo' }
                                ].map((item, i) => (
                                    <button key={i} className="flex flex-col items-center justify-center p-stack-sm rounded-lg bg-black text-white hover:bg-zinc-700 transition-all text-center group cursor-pointer">
                                        <span className="material-symbols-outlined text-white mb-1 group-hover:scale-110 transition-transform">{item.icon}</span>
                                        <span className="text-xs font-medium">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Estado Servidores */}
                        <div className="relative overflow-hidden bg-primary-container text-on-primary-container border border-outline-variant rounded-xl p-stack-md shadow-sm">
                            <div className="relative z-10">
                                <h4 className="text-sm font-semibold mb-2">Estado del Sistema</h4>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse"></div>
                                    <span className="text-sm opacity-90 font-medium">Backend Online (Port 8080)</span>
                                </div>
                                <button className="w-full py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-zinc-700 transition-all cursor-pointer">
                                    Ver Logs
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <button className="fixed bottom-8 right-8 h-14 w-14 bg-black text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 hover:bg-zinc-700 active:scale-95 transition-all z-50 cursor-pointer border border-outline-variant/10">
                <span className="material-symbols-outlined text-3xl text-white" style={{fontVariationSettings: "'FILL' 1"}}>add</span>
            </button>
        </div>
    );
}