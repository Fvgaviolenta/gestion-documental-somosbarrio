import { createBrowserRouter, Navigate } from 'react-router-dom'

import { LoginPage } from '@/features/auth/pages/LoginPage'
import { WorkerLoginPage } from '@/features/auth/pages/WorkerLoginPage'
import { ActivitiesListPage } from '@/features/activities/pages/ActivitiesListPage'
import { CreateActivityPage } from '@/features/activities/pages/CreateActivityPage'
import { EditActivityPage } from '@/features/activities/pages/EditActivityPage'
import { HomePage } from '@/features/home/pages/HomePage'
import { WorkerReportsPage } from '@/features/reports/pages/WorkerReportsPage'
import { WorkerConfigPage } from '@/features/worker-menu/pages/WorkerConfigPage'
import { WorkerHelpPage } from '@/features/worker-menu/pages/WorkerHelpPage'
import { WorkerHomePage } from '@/features/worker-menu/pages/WorkerHomePage'
import { WorkerNotesPage } from '@/features/worker-menu/pages/WorkerNotesPage'
import { WorkerLogbookPage } from '@/features/worker-logbook/pages/WorkerLogbookPage'
import { WorkerMinutesPage } from '@/features/worker-minutes/pages/WorkerMinutesPage'

import { AppLayout } from './layouts/AppLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { WorkerLayout } from './layouts/WorkerLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { WorkerRoute } from './WorkerRoute'
import { UsersListPage } from '@/features/users/pages/UsersListPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: '/trabajador/login',
    element: <AuthLayout />,
    children: [{ index: true, element: <WorkerLoginPage /> }],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: 'activities', element: <ActivitiesListPage /> },
      { path: 'activities/new', element: <CreateActivityPage /> },
      { path: 'activities/:id/edit', element: <EditActivityPage /> },
      { path: 'reports', element: <WorkerReportsPage /> },
      { path: 'users', element: <UsersListPage /> }
    ],
  },
  {
    path: '/trabajador',
    element: (
      <WorkerRoute>
        <WorkerLayout />
      </WorkerRoute>
    ),
    children: [
      { index: true, element: <WorkerHomePage /> },
      { path: 'mis-registros', element: <Navigate to="/trabajador" replace /> },
      { path: 'configuracion', element: <WorkerConfigPage /> },
      { path: 'ayuda', element: <WorkerHelpPage /> },
      { path: 'notas', element: <WorkerNotesPage /> },
      { path: 'reportes', element: <WorkerReportsPage /> },
      { path: 'bitacora', element: <WorkerLogbookPage /> },
      { path: 'actas', element: <WorkerMinutesPage /> },
    ],
  },
  { path: '*', element: <Navigate to='/' replace /> },
])
