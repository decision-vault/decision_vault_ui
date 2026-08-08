import { useEffect, useState } from 'react'
import { Outlet, useLocation, useParams, useNavigate } from 'react-router-dom'
import { Box, Flex } from '@radix-ui/themes'
import { DashboardSidebar } from './DashboardSidebar'
import { TaskSprintSidebar } from './TaskSprintSidebar'
import { getSprints, deleteSprint } from '../../services/taskApi'

export function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { orgId, projectId, sprintId: routeSprintId } = useParams()

  const [sprints, setSprints] = useState([])
  const [sprintLoading, setSprintLoading] = useState(false)

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('dv_dashboard_sidebar_collapsed') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('dv_dashboard_sidebar_collapsed', isCollapsed)
  }, [isCollapsed])

  //  Check if the user is currently looking at any task-related screen
  const isTaskRoute = location.pathname.includes('/tasks')
  const sprintFilter = routeSprintId || 'all'

  // Fetch sprints at layout level if we are on a task route with a valid project
  useEffect(() => {
    if (isTaskRoute && projectId) {
      loadLayoutSprints()
    }
  }, [isTaskRoute, projectId])

  async function loadLayoutSprints() {
    try {
      setSprintLoading(true)
      const data = await getSprints(projectId)
      setSprints(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Layout failed syncing sprints:', error)
    } finally {
      setSprintLoading(false)
    }
  }

  function handleSprintSelect(id) {
    if (id === 'all') {
      navigate(`/organizations/${orgId}/projects/${projectId}/tasks`)
    } else {
      navigate(`/organizations/${orgId}/projects/${projectId}/tasks/sprint/${id}`)
    }
  }

  async function handleRemoveSprint(sprintId, e) {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this sprint?')) return
    try {
      await deleteSprint(sprintId)
      setSprints(prev => prev.filter(s => (s.id || s._id) !== sprintId))
      if (sprintFilter === sprintId) handleSprintSelect('all')
    } catch (error) {
      console.error(error)
    }
  }

  // Handle cross-window refresh when a sprint gets added via modals
  const triggerSprintRefresh = () => {
    loadLayoutSprints()
  }

  return (
    <Box
      style={{
        height: '100vh',
        width: '100%',
        overflow: 'auto',
        display: 'grid',
        //  Dynamic Grid Template: Adjusts sidebar width based on isCollapsed state
        gridTemplateColumns: isTaskRoute 
          ? `${isCollapsed ? '50px' : '220px'} 250px minmax(0, 1fr)` 
          : `${isCollapsed ? '50px' : '220px'} minmax(0, 1fr)`,
        background: 'var(--color-background)',
        transition: 'grid-template-columns 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Column 1: Global Navigation Icons */}
      <DashboardSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      {/* Column 2: Conditionally Rendered Sprint Side Panel */}
      {isTaskRoute && (
        <TaskSprintSidebar
          sprints={sprints}
          sprintFilter={sprintFilter}
          sprintLoading={sprintLoading}
          onSprintSelect={handleSprintSelect}
          onAddSprintClick={() => window.dispatchEvent(new Event('open-sprint-modal'))}
          onRemoveSprint={handleRemoveSprint}
          projectId={projectId}
        />
      )}

      {/* Column 3: Scrollable Workspace Content View Frame */}
      <Flex direction="column" style={{ minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
        <Box style={{ minWidth: 0, minHeight: 0, overflow: 'auto', flex: 1 }}>
          {/* We pass downstream states using Outlet Context so pages can use the updated lists */}
          <Outlet context={{ sprints, triggerSprintRefresh }} />
        </Box>
      </Flex>
    </Box>
  )
}