import { useEffect, useState } from 'react'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import { Box, Flex } from '@radix-ui/themes'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardLeftListPanel } from './DashboardLeftListPanel'
import { DashboardHeaderBar } from './DashboardHeaderBar'

/**
 * Dashboard layout with collapsible navigation sidebar and left list panel.
 */
export function DashboardLayout() {
  const { orgId, projectId } = useParams()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('dv_dashboard_sidebar_collapsed') === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('dv_dashboard_sidebar_collapsed', sidebarCollapsed ? '1' : '0')
    } catch {
      // ignore
    }
  }, [sidebarCollapsed])

  const assistantPath = `/organizations/${orgId}/projects/${projectId}/dashboard`
  const showLeftListPanel =
    location.pathname.includes('/dashboard/messenger') ||
    location.pathname.includes('/dashboard/channel/') ||
    location.pathname.includes('/dashboard/slack/')

  return (
    <Box
      style={{
        height: '100vh',
        width: '100%',
        overflow: 'auto',
        display: 'grid',
        gridTemplateColumns: `${sidebarCollapsed ? 72 : 280}px ${
          showLeftListPanel ? '300px ' : ''
        }minmax(0, 1fr)`,
        background: 'var(--color-background)',
      }}
    >
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />
      {showLeftListPanel ? <DashboardLeftListPanel /> : null}
      <Flex direction="column" style={{ minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
        <DashboardHeaderBar />
        <Box style={{ minWidth: 0, minHeight: 0, overflow: 'auto', flex: 1 }}>
          <Outlet />
        </Box>
      </Flex>
    </Box>
  )
}
