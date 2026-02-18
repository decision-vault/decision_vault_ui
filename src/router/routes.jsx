import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../layouts/dashboard/AppLayout'
import { AssistantPage } from '../modules/dashboard/AssistantPage'
import { DashboardPage } from '../modules/dashboard/DashboardPage'
export const router = createBrowserRouter([
  
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: "/", element: <Navigate to="chat" /> },
      { path: 'chat', element: <DashboardPage /> },
      { path: 'assistant', element: <AssistantPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard/chat" replace />,
  },
])

export default router;
