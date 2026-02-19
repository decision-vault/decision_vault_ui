import { Outlet } from 'react-router-dom'
import { Box, ScrollArea } from '@radix-ui/themes'
import { DashboardProjectPanel } from './DashboardProjectPanel'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardRightPanel } from './DashboardRightPanel'

/**
 * Dashboard layout. Project panel + sidebar + main body (Outlet: InputMainPage or DashboardPage) + right panel.
 */
export function DashboardLayout() {
  return (
    <Box
      style={{
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        background: 'var(--color-background)',
      }}
    >
      <DashboardProjectPanel />
      <DashboardSidebar />
      <ScrollArea type="auto" scrollbars="vertical" style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
        <Outlet />
      </ScrollArea>
      <DashboardRightPanel />
    </Box>
  )
}
