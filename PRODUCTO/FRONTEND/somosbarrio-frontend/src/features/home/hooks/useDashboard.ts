import { useActivities } from '@/features/activities/hooks/useActivities';
// Nota: Aquí podrías importar hooks de documentos cuando estén listos

export function useDashboardStats() {
  // Traemos las actividades reales del backend
  const { data: activities, isLoading } = useActivities({ page: 0, size: 100 });

  // Calculamos KPI basados en datos reales del backend
  const stats = {
    totalActivities: activities?.totalElements ?? 0,
    pendingActivities: activities?.content.filter(a => a.status === 'PLANIFICADA').length ?? 0,
    // Aquí puedes sumar más lógica según los endpoints disponibles
  };

  return { stats, isLoading };
}