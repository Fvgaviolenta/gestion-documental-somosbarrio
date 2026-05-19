import { createBrowserRouter, Navigate } from 'react-router-dom'

import { LoginPage } from '@/features/auth/pages/LoginPage'
import { WorkerLoginPage } from '@/features/auth/pages/WorkerLoginPage'
import { ActivitiesListPage } from '@/features/activities/pages/ActivitiesListPage'
import { CreateActivityPage } from '@/features/activities/pages/CreateActivityPage'
import { EditActivityPage } from '@/features/activities/pages/EditActivityPage'
import { CreateDocumentPage } from '@/features/documents/pages/CreateDocumentPage'
import { DocumentDetailPage } from '@/features/documents/pages/DocumentDetailPage'
import { DocumentsListPage } from '@/features/documents/pages/DocumentsListPage'
import { HomePage } from '@/features/home/pages/HomePage'
import { AccountPage } from '@/features/auth/pages/AccountPage'
import { AuditLogsPage } from '@/features/audit/pages/AuditLogsPage'
import { DocumentTemplatesPage } from '@/features/document-templates/pages/DocumentTemplatesPage'
import { RecipientGroupsPage } from '@/features/mailing/pages/RecipientGroupsPage'
import { AdminReportsPage } from '@/features/reports/pages/AdminReportsPage'
import { WorkerReportsPage } from '@/features/reports/pages/WorkerReportsPage'
import { WorkerConfigPage } from '@/features/worker-menu/pages/WorkerConfigPage'
import { WorkerHelpPage } from '@/features/worker-menu/pages/WorkerHelpPage'
import { WorkerHomePage } from '@/features/worker-menu/pages/WorkerHomePage'
import { WorkerNotesPage } from '@/features/worker-menu/pages/WorkerNotesPage'
import { WorkerLogbookPage } from '@/features/worker-logbook/pages/WorkerLogbookPage'
import { MinuteDetailPage } from '@/features/minutes/pages/MinuteDetailPage'
import { MinutesListPage } from '@/features/minutes/pages/MinutesListPage'
import { WorkerMinutesPage } from '@/features/worker-minutes/pages/WorkerMinutesPage'

import { AdminRoute } from './AdminRoute'
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
      { path: 'account', element: <AccountPage /> },
      { path: 'documents', element: <DocumentsListPage /> },
      { path: 'documents/new', element: <CreateDocumentPage /> },
      { path: 'documents/:id', element: <DocumentDetailPage /> },
      { path: 'minutes', element: <MinutesListPage /> },
      { path: 'minutes/:id', element: <MinuteDetailPage /> },
      
      { path: 'mis-reportes', element: <WorkerReportsPage /> },
      { path: 'mis-actas', element: <WorkerMinutesPage /> },

      {
        element: <AdminRoute />,
        children: [
          { path: 'reports', element: <AdminReportsPage /> },
          { path: 'document-templates', element: <DocumentTemplatesPage /> },
          { path: 'recipient-groups', element: <RecipientGroupsPage /> },
          { path: 'audit-logs', element: <AuditLogsPage /> },
          { path: 'users', element: <UsersListPage /> },
        ],
      },
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
  
  // Comodín de seguridad
  { path: '*', element: <Navigate to="/login" replace /> },
])