import {
  createBrowserRouter,
  createHashRouter,
  Navigate,
  useParams,
} from "react-router-dom";
import { AuthLayout } from "../layouts/auth/AuthLayout";
import { OrgLayout } from "../layouts/org/OrgLayout";
import { ProjectLayout } from "../layouts/project/ProjectLayout";
import { DashboardLayout } from "../layouts/dashboard/DashboardLayout";
import { LoginPage } from "../pages/auth/LoginPage";
import { SignupPage } from "../pages/auth/SignupPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { AcceptInvitePage } from "../pages/auth/AcceptInvitePage";
import { TermsPage } from "../pages/auth/TermsPage";
import { PrivacyPage } from "../pages/auth/PrivacyPage";
import { LandingPage } from "../pages/marketing/LandingPage";
import { OrgListPage } from "../pages/org/OrgListPage";
import { OrgCreatePage } from "../pages/org/OrgCreatePage";
import { OrgPlansPage } from "../pages/org/OrgPlansPage";
import { OrgDetailsPage } from "../pages/org/OrgDetailsPage";
import { UserProfilePage } from "../pages/project/UserProfilePage";
import { ProjectListPage } from "../pages/project/ProjectListPage";
import { ProjectCreatePage } from "../pages/project/ProjectCreatePage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import ProjectTeamPage from "../pages/project/ProjectTeamPage";
import ProjectInvitePage from "../pages/project/ProjectInvitePage";
import { GuestRoute, ProtectedRoute } from "../auth/ProtectedRoute";
import TaskManagementPage from "../pages/tasks/TaskManagementPage";
import TaskDetailPage from "../pages/tasks/TaskDetailPage";
import AgentWorkspacePage from "../pages/agents/AgentWorkspacePage";
import UIBuilderPage from "../pages/agents/UIBuilderPage";
import DocumentManagementPage from "../pages/agents/DocumentManagementPage";
import AIWorkflowPage from "../pages/dashboard/AIWorkflowPage";
import TeamPage from "../layouts/project/TeamPage";
import IntegrationsPage from "../layouts/project/IntegrationsPage";
import UsagePage from "../layouts/project/UsagePage";
import BillingPage from "../layouts/project/BillingPage";
import FeedbackIssuesPage from "../layouts/project/FeedbackIssuesPage";
import TroubleshootingPage from "../layouts/project/TroubleshootingPage";

function RedirectToProjectDashboard() {
  const { orgId, projectId } = useParams();
  return (
    <Navigate
      to={`/organizations/${orgId}/projects/${projectId}/dashboard`}
      replace
    />
  );
}

const isElectron =
  typeof window !== "undefined" &&
  window.navigator &&
  window.navigator.userAgent.toLowerCase().includes("electron");

const routes = [
  {
    path: "/invite",
    element: <AcceptInvitePage />,
  },
  {
    path: "/invite/project",
    element: <ProjectInvitePage />,
  },
  {
    path: "/",
    element: (
      <GuestRoute>
        <AuthLayout />
      </GuestRoute>
    ),
    children: [
      { index: true, element: <LandingPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "terms", element: <TermsPage /> },
      { path: "privacy", element: <PrivacyPage /> },
    ],
  },
  {
    path: "/organizations",
    element: (
      <ProtectedRoute>
        <OrgLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <OrgListPage /> },
      { path: "new", element: <OrgCreatePage /> },
      { path: "plans", element: <OrgPlansPage /> },
    ],
  },
  {
    path: "/organizations/:orgId/projects/:projectId",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard/overview" replace /> },
      { path: "dashboard", element: <Navigate to="overview" replace /> },
      { path: "dashboard/agentsMain", element: <AgentWorkspacePage /> },
      { path: "dashboard/overview", element: <DashboardPage /> },
      { path: "dashboard/team", element: <ProjectTeamPage /> },
      { path: "dashboard/profile", element: <UserProfilePage /> },

      { path: "dashboard/ui-builder", element: <UIBuilderPage /> },
      {
        path: "dashboard/document-management",
        element: <DocumentManagementPage />,
      },
      { path: "workflow", element: <AIWorkflowPage /> },
      // Task Root & Sprint-Scoped Routes
      { path: "tasks", element: <TaskManagementPage /> },
      { path: "tasks/sprint/:sprintId", element: <TaskManagementPage /> }, //  Added for clean navigation
      { path: "tasks/:taskId", element: <TaskDetailPage /> },
    ],
  },
  {
    path: "/organizations/:orgId",
    element: (
      <ProtectedRoute>
        <ProjectLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "projects", element: <ProjectListPage /> },
      { path: "new", element: <ProjectCreatePage /> },
      { path: "details", element: <OrgDetailsPage /> },
      { path: "profile", element: <UserProfilePage /> },
      { path: "team", element: <TeamPage /> },
      { path: "integrations", element: <IntegrationsPage /> },
      { path: 'usage', element: <UsagePage /> },
      { path: 'billing', element: <BillingPage /> },
      { path: 'feedback', element: <FeedbackIssuesPage /> },
      { path: 'troubleshooting', element: <TroubleshootingPage /> },
      { path: ":projectId", element: <RedirectToProjectDashboard /> },

    ],
  },

  {
    path: "/onboarding",
    element: <Navigate to="/dashboard/discovery" replace />,
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
];

export const router = isElectron
  ? createHashRouter(routes)
  : createBrowserRouter(routes);

export default router;
