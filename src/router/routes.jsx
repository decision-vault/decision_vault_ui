import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'
import { AuthLayout } from '../layouts/auth/AuthLayout'
import { OrgLayout } from '../layouts/org/OrgLayout'
import { ProjectLayout } from '../layouts/project/ProjectLayout'
import { DashboardLayout } from '../layouts/dashboard/DashboardLayout'
import { LoginPage } from '../pages/auth/LoginPage'
import { SignupPage } from '../pages/auth/SignupPage'
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage'
import { DocsPage } from '../pages/auth/DocsPage'
import { TermsPage } from '../pages/auth/TermsPage'
import { PrivacyPage } from '../pages/auth/PrivacyPage'
import { OrgListPage } from '../pages/org/OrgListPage'
import { OrgCreatePage } from '../pages/org/OrgCreatePage'
import { OrgPlansPage } from '../pages/org/OrgPlansPage'
import { ProjectListPage } from '../pages/project/ProjectListPage'
import { ProjectCreatePage } from '../pages/project/ProjectCreatePage'
import { InputMainPage } from '../pages/project/InputMainPage'
import { MvpStepPage } from '../pages/project/MvpStepPage'
import { DashboardPage } from '../pages/project/DashboardPage'
import { ChannelThreadPage } from '../pages/project/ChannelThreadPage'
import { ProjectConnectorsPage } from '../pages/project/ProjectConnectorsPage'
import { ProjectLlmConfigPage } from '../pages/project/ProjectLlmConfigPage'
import { ProjectTeamPage } from '../pages/project/ProjectTeamPage'
import { ProjectSettingsPage } from '../pages/project/ProjectSettingsPage'
import { ProjectLogsPage } from '../pages/project/ProjectLogsPage'
import { MessengerPage } from '../pages/project/MessengerPage'
import { GuestRoute, ProtectedRoute } from '../auth/ProtectedRoute'

function RedirectToProjectDashboard() {
  const { orgId, projectId } = useParams()
  return <Navigate to={`/organizations/${orgId}/projects/${projectId}/dashboard`} replace />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <GuestRoute>
        <AuthLayout />
      </GuestRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'docs', element: <DocsPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
    ],
  },
  {
    path: '/organizations',
    element: (
      <ProtectedRoute>
        <OrgLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <OrgListPage /> },
      { path: 'new', element: <OrgCreatePage /> },
      { path: 'plans', element: <OrgPlansPage /> },
    ],
  },
  {
    path: '/organizations/:orgId/projects/:projectId/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <InputMainPage /> },
      { path: 'messenger', element: <MessengerPage /> },
      { path: 'overview', element: <DashboardPage /> },
      { path: 'channel/:channelId', element: <ChannelThreadPage /> },
      { path: 'slack/:slackChannelId', element: <ChannelThreadPage /> },
      { path: 'team', element: <ProjectTeamPage /> },
      { path: 'llm-config', element: <ProjectLlmConfigPage /> },
      { path: 'connectors', element: <ProjectConnectorsPage /> },
      { path: 'logs', element: <ProjectLogsPage /> },
      { path: 'settings', element: <ProjectSettingsPage /> },
    ],
  },
  {
    path: '/organizations/:orgId/projects',
    element: (
      <ProtectedRoute>
        <ProjectLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <ProjectListPage /> },
      { path: 'new', element: <ProjectCreatePage /> },
      { path: ':projectId/connectors', element: <ProjectConnectorsPage /> },
      { path: ':projectId/llm-config', element: <ProjectLlmConfigPage /> },
      { path: ':projectId/team', element: <ProjectTeamPage /> },
      { path: ':projectId/settings', element: <ProjectSettingsPage /> },
      { path: ':projectId/mvp/doc/:stepIndex', element: <MvpStepPage /> },
      { path: ':projectId', element: <RedirectToProjectDashboard /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])

export default router
