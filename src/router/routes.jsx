import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout } from '../layouts/auth/AuthLayout'
import { OrgLayout } from '../layouts/org/OrgLayout'
import { ProjectLayout } from '../layouts/project/ProjectLayout'
import { LoginPage } from '../pages/auth/LoginPage'
import { SignupPage } from '../pages/auth/SignupPage'
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage'
import { DocsPage } from '../pages/auth/DocsPage'
import { TermsPage } from '../pages/auth/TermsPage'
import { PrivacyPage } from '../pages/auth/PrivacyPage'
import { OrgListPage } from '../pages/org/OrgListPage'
import { OrgCreatePage } from '../pages/org/OrgCreatePage'
import { ProjectListPage } from '../pages/project/ProjectListPage'
import { ProjectCreatePage } from '../pages/project/ProjectCreatePage'
import { InputMainPage } from '../pages/project/InputMainPage'
import { MvpDocViewPage } from '../pages/project/MvpDocViewPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
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
    element: <OrgLayout />,
    children: [
      { index: true, element: <OrgListPage /> },
      { path: 'new', element: <OrgCreatePage /> },
    ],
  },
  {
    path: '/organizations/:orgId/projects',
    element: <ProjectLayout />,
    children: [
      { index: true, element: <ProjectListPage /> },
      { path: 'new', element: <ProjectCreatePage /> },
      { path: ':projectId/mvp/doc/:stepIndex', element: <MvpDocViewPage /> },
      { path: ':projectId', element: <InputMainPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])

export default router
