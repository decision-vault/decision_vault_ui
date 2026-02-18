import { Outlet } from 'react-router-dom'
import { InfoPanel } from '../../modules/dashboard/components/InfoPanel'
import { ProjectRail } from '../../modules/dashboard/components/ProjectRail'
import { WorkspaceSidebar } from '../../modules/dashboard/components/WorkspaceSidebar'
import '../../modules/dashboard/dashboard.css'

export function AppLayout() {
  return (
    <div className="app-scene">
      <div className="dashboard-layout">
        <ProjectRail />
        <WorkspaceSidebar />
        <Outlet />
        <InfoPanel />
      </div>
    </div>
  )
}
