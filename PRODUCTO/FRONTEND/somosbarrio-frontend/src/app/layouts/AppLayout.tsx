import { Outlet } from 'react-router-dom';

import { useSyncCurrentUser } from '@/features/auth/hooks/useSyncCurrentUser';
import SideNavBar from '@/shared/components/layout/SideNavBar';

export function AppLayout() {
  useSyncCurrentUser();

  return (
    <div className="flex h-screen w-full bg-surface">
      {/* MENÚ LATERAL */}
      <SideNavBar />
      
      {/* DASHBOARD */}
      <main className="flex-1 overflow-y-auto relative">
        <Outlet />
      </main>
    </div>
  );
}