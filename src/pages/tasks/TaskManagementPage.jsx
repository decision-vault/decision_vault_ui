import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Grid,
  Heading,
  Select,
  Text,
  TextArea,
  TextField,
  Tabs,
  Avatar,
  Separator,
  Badge,
  
} from '@radix-ui/themes'


import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  assignTask,
  unassignTask,
  getTaskComments,
  createTaskComment,
  getTaskActivities,
  getTasksBySprint,
  createSprint,
  updateSprint,
  createSubtask,
  getSubtasks,
  deleteSubtask
} from '../../services/taskApi'
import { Check, X, Pencil } from 'lucide-react'

const STATUS_COLUMNS = ['backlog', 'ready', 'in_progress', 'review', 'testing', 'done']
const ROLE_OPTIONS = ['backend_developer', 'frontend_developer', 'product_manager', 'qa_engineer', 'devops_engineer']

const STATUS_CONFIG = {
  backlog:      { color: 'var(--gray-9)',   bg: 'var(--gray-3)',   label: 'Backlog' },
  ready:        { color: 'var(--blue-9)',   bg: 'var(--blue-3)',   label: 'Ready' },
  in_progress:  { color: 'var(--amber-9)',  bg: 'var(--amber-3)',  label: 'In Progress' },
  review:       { color: 'var(--purple-9)', bg: 'var(--purple-3)', label: 'Review' },
  testing:      { color: 'var(--teal-9)',   bg: 'var(--teal-3)',   label: 'Testing' },
  done:         { color: 'var(--blue-9)',  bg: 'var(--blue-3)',  label: 'Done' },
}

const PRIORITY_CONFIG = {
  high:   { color: 'var(--red-11)',   bg: 'var(--red-3)',    border: 'var(--red-5)' },
  medium: { color: 'var(--amber-11)', bg: 'var(--amber-3)',  border: 'var(--amber-5)' },
  low:    { color: 'var(--gray-11)',  bg: 'var(--gray-3)',   border: 'var(--gray-5)' },
}

const ROLE_CONFIG = {
  backend_developer:  { label: 'Backend',  color: 'var(--blue-11)', bg: 'var(--blue-3)' },
  frontend_developer: { label: 'Frontend', color: 'var(--violet-11)', bg: 'var(--violet-3)' },
  product_manager:    { label: 'Product',  color: 'var(--amber-11)',  bg: 'var(--amber-3)' },
  qa_engineer:        { label: 'QA',       color: 'var(--teal-11)',   bg: 'var(--teal-3)' },
  devops_engineer:    { label: 'DevOps',   color: 'var(--orange-11)', bg: 'var(--orange-3)' },
}

export default function TaskManagementPage() {
  const { orgId, projectId, sprintId: routeSprintId } = useParams()
  const navigate = useNavigate()
  
  const { sprints, triggerSprintRefresh } = useOutletContext()

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState('board')

  // Filter States
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const sprintFilter = routeSprintId || 'all'

  // INLINE EDIT MODE STATE ENGINE
  const [isEditingHeader, setIsEditingHeader] = useState(false)
  const [editHeaderForm, setEditHeaderForm] = useState({ name: '', description: '' })

  // Modals & Properties Tabs States
  const [createOpen, setCreateOpen] = useState(false)
  const [sprintModalOpen, setSprintModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [detailTab, setDetailTab] = useState('properties')

  // Subtask Engine Local States
  const [subtasks, setSubtasks] = useState([])
  const [subtaskLoading, setSubtaskLoading] = useState(false)
  const [subtaskFormOpen, setSubtaskFormOpen] = useState(false)
  const [subForm, setSubForm] = useState({
    title: '',
    description: '',
    role: 'backend_developer',
    priority: 'medium',
    story_points: 1
  })

  const [comments, setComments] = useState([])
  const [activities, setActivities] = useState([])
  const [commentText, setCommentText] = useState('')

  // Form States
  const [sprintForm, setSprintForm] = useState({ name: '', goal: '', start_date: '', end_date: '' })
  const [form, setForm] = useState({ title: '', description: '', role: 'backend_developer', priority: 'medium', story_points: 3, sprint_id: 'none' })

  // Memoize the active metadata headers based on selected route parameters
  const headerMeta = useMemo(() => {
    if (sprintFilter === 'all') {
      return {
        title: 'Task Management',
        description: 'Track execution workspace metrics across all active timelines, sprints, and engineering teams.',
        editable: false
      }
    }
    if (sprintFilter === 'none') {
      return {
        title: 'Backlog Pool',
        description: 'Unassigned execution items awaiting prioritization and active milestone lane scheduling.',
        editable: false
      }
    }
    
    const match = sprints.find(s => (s.id || s._id) === sprintFilter)
    return {
      title: match?.name || 'Loading Iteration...',
      description: match?.description || 'No execution goals documented for this sprint iteration.',
      editable: true
    }
  }, [sprintFilter, sprints])

  useEffect(() => {
    setIsEditingHeader(false)
  }, [sprintFilter])

  function startHeaderEdit() {
    setEditHeaderForm({ name: headerMeta.title, description: headerMeta.description })
    setIsEditingHeader(true)
  }

  async function saveHeaderEdit() {
    if (!editHeaderForm.name.trim()) return
    try {
      await updateSprint(sprintFilter, { name: editHeaderForm.name, description: editHeaderForm.description })
      setIsEditingHeader(false)
      triggerSprintRefresh()
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const openModalListener = () => setSprintModalOpen(true)
    window.addEventListener('open-sprint-modal', openModalListener)
    return () => window.removeEventListener('open-sprint-modal', openModalListener)
  }, [])

  useEffect(() => {
    if (projectId) {
      if (sprintFilter !== 'all' && sprintFilter !== 'none') {
        loadTasksFromSprint(sprintFilter)
      } else {
        loadTasks()
      }
    }
  }, [projectId, sprintFilter])

  useEffect(() => {
    if (createOpen) {
      setForm((prev) => ({
        ...prev,
        sprint_id: (sprintFilter !== 'all' && sprintFilter !== 'none') ? sprintFilter : 'none'
      }))
    }
  }, [createOpen, sprintFilter])

  // Fetches comments, activities, and child subtasks when an active task drawer overlays
  useEffect(() => {
    if (selectedTask?.id || selectedTask?._id) {
      const taskId = selectedTask.id || selectedTask._id
      loadTaskDetails(taskId)
      loadSubtasks(taskId)
    }
  }, [selectedTask])

  async function loadTasks() {
    if (!projectId) return
    try {
      setLoading(true)
      const response = await getTasks(projectId)
      setTasks(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function loadTasksFromSprint(sprintId) {
    try {
      setLoading(true)
      const response = await getTasksBySprint(sprintId)
      setTasks(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function loadTaskDetails(taskId) {
    try {
      const [fetchedComments, fetchedActivities] = await Promise.all([
        getTaskComments(taskId),
        getTaskActivities(taskId),
      ])
      setComments(Array.isArray(fetchedComments) ? fetchedComments : [])
      setActivities(Array.isArray(fetchedActivities) ? fetchedActivities : [])
    } catch (err) {
      console.error(err)
    }
  }

  // --- SUBTASK ENGINE RUNTIME ACTIONS ---

  async function loadSubtasks(parentId) {
    try {
      setSubtaskLoading(true)
      const data = await getSubtasks(parentId)
      setSubtasks(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed fetching child branches:', error)
    } finally {
      setSubtaskLoading(false)
    }
  }

  async function handleCreateSubtask() {
    if (!subForm.title.trim()) return
    const parentId = selectedTask.id || selectedTask._id
    try {
      await createSubtask(parentId, {
        ...subForm,
        project_id: projectId,
        sprint_id: selectedTask.sprint_id || null
      })
      setSubForm({ title: '', description: '', role: 'backend_developer', priority: 'medium', story_points: 1 })
      setSubtaskFormOpen(false)
      loadSubtasks(parentId)
    } catch (error) {
      console.error(error)
    }
  }

  async function handleUpdateSubtaskStatus(subtaskId, newStatus) {
    const parentId = selectedTask.id || selectedTask._id
    try {
      // Subtasks are individual tasks mapping references; utilizing standard core update endpoint rules
      await updateTask(subtaskId, { status: newStatus })
      loadSubtasks(parentId)
    } catch (error) {
      console.error(error)
    }
  }

  async function handleDeleteSubtask(subtaskId, e) {
    e.stopPropagation()
    const parentId = selectedTask.id || selectedTask._id
    if (!window.confirm('Are you sure you want to remove this subtask?')) return
    try {
      await deleteSubtask(subtaskId)
      loadSubtasks(parentId)
    } catch (error) {
      console.error(error)
    }
  }

  // --- STANDARD TASK MANAGEMENT HANDLERS ---

  async function handleCreateSprint() {
    if (!sprintForm.name.trim() || !sprintForm.start_date || !sprintForm.end_date) {
      alert("Please fill in all sprint fields.")
      return
    }
    try {
      await createSprint({
        project_id: projectId, 
        name: sprintForm.name,
        description: sprintForm.goal,
        start_date: sprintForm.start_date,
        end_date: sprintForm.end_date
      })
      setSprintForm({ name: '', goal: '', start_date: '', end_date: '' })
      setSprintModalOpen(false)
      triggerSprintRefresh() 
    } catch (error) {
      console.error(error)
    }
  }

  async function handleCreateTask() {
    try {
      const payload = {
        project_id: projectId,
        ...form,
        sprint_id: form.sprint_id === 'none' ? null : form.sprint_id
      }
      await createTask(payload)
      setCreateOpen(false)
      setForm({ title: '', description: '', role: 'backend_developer', priority: 'medium', story_points: 3, sprint_id: 'none' })
      if (sprintFilter !== 'all' && sprintFilter !== 'none') {
        loadTasksFromSprint(sprintFilter)
      } else {
        loadTasks()
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function handleInlineUpdate(fields) {
    if (!selectedTask) return
    const taskId = selectedTask.id || selectedTask._id
    try {
      const updated = await updateTask(taskId, fields)
      setSelectedTask(updated)
      setTasks((prev) => prev.map((t) => ((t.id || t._id) === taskId ? updated : t)))
    } catch (error) {
      console.error(error)
    }
  }

  async function handleDeleteTask() {
    if (!selectedTask) return
    const taskId = selectedTask.id || selectedTask._id
    if (!window.confirm('Delete this task?')) return
    try {
      await deleteTask(taskId)
      setSelectedTask(null)
      if (sprintFilter !== 'all' && sprintFilter !== 'none') {
        loadTasksFromSprint(sprintFilter)
      } else {
        loadTasks()
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function handleToggleAssignment(currentUserId) {
    if (!selectedTask) return
    const taskId = selectedTask.id || selectedTask._id
    const currentAssignee = selectedTask.assigned_to || selectedTask.assignee_id
    try {
      let updated
      if (currentAssignee) {
        updated = await unassignTask(taskId)
      } else {
        updated = await assignTask(taskId, currentUserId)
      }
      setSelectedTask(updated)
      setTasks((prev) => prev.map((t) => ((t.id || t._id) === taskId ? updated : t)))
      loadTaskDetails(taskId)
    } catch (error) {
      console.error(error)
    }
  }

  async function handleAddComment() {
    if (!commentText.trim() || !selectedTask) return
    const taskId = selectedTask.id || selectedTask._id
    try {
      await createTaskComment(taskId, commentText)
      setCommentText('')
      loadTaskDetails(taskId)
    } catch (error) {
      console.error(error)
    }
  }

  const handleDragEnd = async (result) => {
    if (!result.destination) return
    const taskId = result.draggableId
    const newStatus = result.destination.droppableId
    try {
      await updateTaskStatus(taskId, newStatus)
      setTasks((prev) =>
        prev.map((task) => {
          if (String(task.id || task._id) === taskId) {
            return { ...task, status: newStatus }
          }
          return task
        })
      )
    } catch (error) {
      console.error(error)
    }
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title?.toLowerCase().includes(search.toLowerCase()) || task.description?.toLowerCase().includes(search.toLowerCase())
      const matchesPriority = priorityFilter === 'all' ? true : task.priority === priorityFilter
      const matchesStatus = statusFilter === 'all' ? true : task.status === statusFilter
      const matchesSprint = sprintFilter === 'all' || sprintFilter === 'none' ? (sprintFilter === 'all' ? true : !task.sprint_id) : task.sprint_id === sprintFilter
      return matchesSearch && matchesPriority && matchesStatus && matchesSprint
    })
  }, [tasks, search, priorityFilter, statusFilter, sprintFilter])

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      progress: tasks.filter((t) => t.status === 'in_progress').length,
      completed: tasks.filter((t) => t.status === 'done').length,
      blocked: tasks.filter((t) => t.status === 'blocked').length,
    }
  }, [tasks])

  const groupedTasks = useMemo(() => {
    const grouped = {}
    STATUS_COLUMNS.forEach((status) => { grouped[status] = [] })
    filteredTasks.forEach((task) => {
      if (grouped[task.status]) grouped[task.status].push(task)
    })
    return grouped
  }, [filteredTasks])

  return (
    <Box p={{ initial: '4', sm: '6' }}>
      <Flex direction="column" gap="5">
        
        {/* RESPONSIVE HEADER WITH INTEGRATED EDITABLE METADATA STATES */}
        <Flex direction={{ initial: 'column', sm: 'row' }} justify="between" align={{ initial: 'stretch', sm: 'flex-start' }} gap="4">
          <Box style={{ maxWidth: '70%', flexGrow: 1 }}>
            {isEditingHeader ? (
              <Flex direction="column" gap="2" mt="1">
                <Flex gap="2" align="center">
                  <Box style={{ width: '320px' }}>
                    <TextField.Root 
                      size="3"
                      value={editHeaderForm.name} 
                      onChange={(e) => setEditHeaderForm({ ...editHeaderForm, name: e.target.value })}
                      style={{ fontWeight: '600', letterSpacing: '-0.5px' }}
                    />
                  </Box>
                  <Button size="2" color="blue" variant="soft" onClick={saveHeaderEdit} style={{ cursor: 'pointer' }}>
                    <Check size={16} />
                  </Button>
                  <Button size="2" color="gray" variant="soft" onClick={() => setIsEditingHeader(false)} style={{ cursor: 'pointer' }}>
                    <X size={16} />
                  </Button>
                </Flex>
                <Box style={{ width: '500px', maxWidth: '100%' }}>
                  <TextArea 
                    size="2"
                    placeholder="Enter iteration details..."
                    value={editHeaderForm.description} 
                    onChange={(e) => setEditHeaderForm({ ...editHeaderForm, description: e.target.value })}
                    style={{ minHeight: '50px', lineHeight: '1.4' }}
                  />
                </Box>
              </Flex>
            ) : (
              <Box>
                <Flex align="center" gap="2" wrap="wrap">
                  <Heading size={{ initial: '6', sm: '8' }} style={{ letterSpacing: '-0.5px' }}>
                    {headerMeta.title}
                  </Heading>
                  {headerMeta.editable && (
                    <Button 
                      size="1" 
                      variant="ghost" 
                      color="gray" 
                      onClick={startHeaderEdit}
                      style={{ cursor: 'pointer', borderRadius: '50%', padding: '4px', height: '28px', width: '28px' }}
                    >
                      <Pencil size={14} />
                    </Button>
                  )}
                </Flex>
                <Text color="gray" size="2" style={{ display: 'block', marginTop: '6px', lineHeight: '1.45' }}>
                  {headerMeta.description}
                </Text>
              </Box>
            )}
          </Box>

          <Flex gap="2" direction={{ initial: 'column', xs: 'row' }} width={{ initial: '100%', sm: 'auto' }} style={{ flexShrink: 0, marginTop: '4px' }}>
            <Button onClick={() => setCreateOpen(true)}>Create Task</Button>
          </Flex>
        </Flex>

        {/* RESPONSIVE STATS CARDS */}
        <Grid columns={{ initial: '2', md: '4' }} gap="3">
          <StatsCard
            title="Total Tasks"
            value={stats.total}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="8" height="4" x="8" y="2" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="m9 14 2 2 4-4" /></svg>}
            color="var(--blue-9)"
            bg="var(--blue-2)"
          />
          <StatsCard
            title="In Progress"
            value={stats.progress}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>}
            color="var(--amber-9)"
            bg="var(--amber-2)"
          />
          <StatsCard
            title="Completed"
            value={stats.completed}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>}
            color="var(--blue-9)"
            bg="var(--blue-2)"
          />
          <StatsCard
            title="Blocked"
            value={stats.blocked}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="m4.93 4.93 14.14 14.14" /></svg>}
            color="var(--red-9)"
            bg="var(--red-2)"
          />
        </Grid>

        {/* RESPONSIVE FILTER BAR */}
        <Flex gap="3" align="center" wrap="wrap">
          <Box style={{ flexGrow: 1, minWidth: 200 }}>
            <TextField.Root
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%' }}
            >
              <TextField.Slot>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              </TextField.Slot>
            </TextField.Root>
          </Box>
          <Flex gap="2" align="center">
            <Select.Root value={priorityFilter} onValueChange={setPriorityFilter}>
              <Select.Trigger style={{ minWidth: 130 }} />
              <Select.Content>
                <Select.Item value="all">All Priorities</Select.Item>
                <Select.Item value="high">🔴 High</Select.Item>
                <Select.Item value="medium">🟠 Medium</Select.Item>
                <Select.Item value="low">⚪ Low</Select.Item>
              </Select.Content>
            </Select.Root>
            <Select.Root value={statusFilter} onValueChange={setStatusFilter}>
              <Select.Trigger style={{ minWidth: 140 }} />
              <Select.Content>
                <Select.Item value="all">All Statuses</Select.Item>
                {STATUS_COLUMNS.map((status) => (
                  <Select.Item key={status} value={status}>
                    {STATUS_CONFIG[status]?.label || status}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>
        </Flex>

        {/* VIEW CONFIGURATION SWITCH */}
        <Tabs.Root value={view} onValueChange={setView}>
          <Tabs.List>
            <Tabs.Trigger value="board">Board View</Tabs.Trigger>
            <Tabs.Trigger value="list">List View</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="board">
            {loading ? (
              <Flex gap="3" mt="4" style={{ overflowX: 'auto', paddingBottom: '12px' }}>
                {STATUS_COLUMNS.map((status) => (
                  <Card key={status} style={{ minHeight: 520, width: 280, flexShrink: 0, opacity: 0.5 }}>
                    <Flex direction="column" gap="3">
                      <Flex justify="between" align="center">
                        <div style={{ height: 12, width: 80, borderRadius: 4, background: 'var(--gray-4)' }} />
                        <div style={{ height: 12, width: 20, borderRadius: 4, background: 'var(--gray-4)' }} />
                      </Flex>
                      {[1, 2, 3].map(i => (
                        <div key={i} style={{ height: 80, borderRadius: 8, background: 'var(--gray-3)' }} />
                      ))}
                    </Flex>
                  </Card>
                ))}
              </Flex>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Flex gap="3" mt="4" style={{ overflowX: 'auto', paddingBottom: '12px', WebkitOverflowScrolling: 'touch' }}>
                  {STATUS_COLUMNS.map((status) => {
                    const cfg = STATUS_CONFIG[status]
                    const count = groupedTasks[status]?.length || 0
                    return (
                      <Droppable droppableId={status} key={status}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{
                              minHeight: 520,
                              width: 280,
                              flexShrink: 0,
                              borderTop: `3px solid ${cfg.color}`,
                              background: snapshot.isDraggingOver ? 'var(--gray-3)' : undefined,
                              transition: 'background 0.15s ease',
                            }}
                          >
                            <Flex direction="column" gap="3">
                              <Flex justify="between" align="center">
                                <Flex align="center" gap="2">
                                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                                  <Text size="2" weight="bold" style={{ textTransform: 'capitalize' }}>{cfg.label}</Text>
                                </Flex>
                                <Badge size="1" variant="soft" color="gray" style={{ minWidth: 22, justifyContent: 'center' }}>{count}</Badge>
                              </Flex>
                              {count === 0 && (
                                <Box style={{ padding: '32px 16px', textAlign: 'center', borderRadius: 8, border: '1px dashed var(--gray-5)' }}>
                                  <Text size="1" color="gray">No tasks</Text>
                                </Box>
                              )}
                              {groupedTasks[status]?.map((task, index) => (
                                <Draggable key={task.id || task._id} draggableId={String(task.id || task._id)} index={index}>
                                  {(provided, snapshot) => (
                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                      <TaskCard task={task} sprints={sprints} isDragging={snapshot.isDragging} onClick={() => { setSelectedTask(task); setDetailTab('properties'); setSubtaskFormOpen(false); }} />
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </Flex>
                          </Card>
                        )}
                      </Droppable>
                    )
                  })}
                </Flex>
              </DragDropContext>
            )}
          </Tabs.Content>

          <Tabs.Content value="list">
            <Flex direction="column" gap="2" mt="4">
              {filteredTasks.length === 0 && !loading && (
                <Card style={{ padding: '48px', textAlign: 'center' }}>
                  <Flex direction="column" gap="2" align="center">
                    <Box style={{ color: 'var(--gray-7)' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="8" height="4" x="8" y="2" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>
                    </Box>
                    <Text size="2" color="gray" weight="medium">No tasks match your filters</Text>
                    <Text size="1" color="gray">Try adjusting your search or filter criteria</Text>
                  </Flex>
                </Card>
              )}
              {filteredTasks.map((task) => {
                const pcfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
                const rcfg = ROLE_CONFIG[task.role] || ROLE_CONFIG.backend_developer
                const scfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.backlog
                const sprintName = task.sprint_id ? (sprints.find(s => (s.id || s._id) === task.sprint_id)?.name || null) : null
                return (
                  <Card key={task.id || task._id} onClick={() => { setSelectedTask(task); setDetailTab('properties'); setSubtaskFormOpen(false); }} style={{ cursor: 'pointer', transition: 'box-shadow 0.15s ease, transform 0.1s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
                  >
                    <Flex align="center" gap="3">
                      <span style={{ width: 4, height: 32, borderRadius: 2, background: pcfg.color, flexShrink: 0 }} />
                      <Box style={{ minWidth: 0, flexGrow: 1 }}>
                        <Flex align="center" gap="2" mb="1">
                          <Text weight="bold" size="2" truncate>{task.title}</Text>
                        </Flex>
                        <Flex align="center" gap="2" wrap="wrap">
                          <Badge size="1" style={{ background: rcfg.bg, color: rcfg.color, fontWeight: 600 }}>{rcfg.label}</Badge>
                          <Badge size="1" style={{ background: scfg.bg, color: scfg.color, fontWeight: 500 }}>{scfg.label}</Badge>
                          {sprintName && <Badge size="1" color="blue" variant="soft">{sprintName}</Badge>}
                        </Flex>
                      </Box>
                      <Flex align="center" gap="3" style={{ flexShrink: 0 }}>
                        <Badge size="1" style={{ background: pcfg.bg, color: pcfg.color, fontWeight: 600, textTransform: 'capitalize' }}>{task.priority}</Badge>
                        <Text size="1" color="gray" weight="medium" style={{ minWidth: 30, textAlign: 'right' }}>{task.story_points} SP</Text>
                      </Flex>
                    </Flex>
                  </Card>
                )
              })}
            </Flex>
          </Tabs.Content>
        </Tabs.Root>

        {/* SPRINT MANAGEMENT MODAL DIALOG */}
        <Dialog.Root open={sprintModalOpen} onOpenChange={setSprintModalOpen}>
          <Dialog.Content style={{ maxWidth: '450px' }}>
            <Dialog.Title>Create New Sprint Cycle</Dialog.Title>
            <Flex direction="column" gap="3" mt="3">
              <Box>
                <Text size="1" weight="medium" color="gray">Sprint Title</Text>
                <TextField.Root placeholder="e.g., Sprint Q3 Core Deployment" value={sprintForm.name} onChange={(e) => setSprintForm({ ...sprintForm, name: e.target.value })} />
              </Box>
              <Box>
                <Text size="1" weight="medium" color="gray">Sprint Goal / Focus</Text>
                <TextArea placeholder="Describe goal milestones..." value={sprintForm.goal} onChange={(e) => setSprintForm({ ...sprintForm, goal: e.target.value })} style={{ minHeight: '60px' }} />
              </Box>

              <Grid columns="2" gap="3" my="1">
                <Box>
                  <Text size="1" weight="medium" color="gray">Start Date</Text>
                  <input type="date" style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--gray-6)', backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }} value={sprintForm.start_date} onChange={(e) => setSprintForm({ ...sprintForm, start_date: e.target.value })} />
                </Box>
                <Box>
                  <Text size="1" weight="medium" color="gray">End Date</Text>
                  <input type="date" style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--gray-6)', backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }} value={sprintForm.end_date} onChange={(e) => setSprintForm({ ...sprintForm, end_date: e.target.value })} />
                </Box>
              </Grid>
              
              <Flex gap="2" justify="end" mt="2">
                <Button variant="soft" color="gray" onClick={() => setSprintModalOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateSprint}>Add Milestone</Button>
              </Flex>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>

        {/* DYNAMIC TASK CREATION DIALOG */}
        <Dialog.Root open={createOpen} onOpenChange={setCreateOpen}>
          <Dialog.Content style={{ maxWidth: '500px', width: '92vw' }}>
            <Dialog.Title>Create New Task</Dialog.Title>
            <Flex direction="column" gap="3" mt="3">
              <Box>
                <Text size="1" weight="medium" color="gray">Title</Text>
                <TextField.Root placeholder="Task name..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </Box>
              <Box>
                <Text size="1" weight="medium" color="gray">Description</Text>
                <TextArea placeholder="Describe scope of execution..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ minHeight: '80px' }} />
              </Box>
              <Grid columns="2" gap="3">
                <Box>
                  <Text size="1" weight="medium" color="gray">Role Assignment</Text>
                  <Select.Root value={form.role} onValueChange={(val) => setForm({ ...form, role: val })}>
                    <Select.Trigger style={{ width: '100%' }} />
                    <Select.Content>
                      {ROLE_OPTIONS.map((r) => <Select.Item key={r} value={r}>{r.replaceAll('_', ' ')}</Select.Item>)}
                    </Select.Content>
                  </Select.Root>
                </Box>
                <Box>
                  <Text size="1" weight="medium" color="gray">Sprint Planner Destination</Text>
                  <Select.Root value={form.sprint_id} onValueChange={(val) => setForm({ ...form, sprint_id: val })}>
                    <Select.Trigger style={{ width: '100%' }} />
                    <Select.Content>
                      <Select.Item value="none">Backlog (No Sprint)</Select.Item>
                      {sprints.map((s) => <Select.Item key={s.id || s._id} value={s.id || s._id}>{s.name}</Select.Item>)}
                    </Select.Content>
                  </Select.Root>
                </Box>
              </Grid>
              <Grid columns="2" gap="3">
                <Box>
                  <Text size="1" weight="medium" color="gray">Priority</Text>
                  <Select.Root value={form.priority} onValueChange={(val) => setForm({ ...form, priority: val })}>
                    <Select.Trigger style={{ width: '100%' }} />
                    <Select.Content>
                      <Select.Item value="low">Low</Select.Item>
                      <Select.Item value="medium">Medium</Select.Item>
                      <Select.Item value="high">High</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Box>
                <Box>
                  <Text size="1" weight="medium" color="gray">Story Points</Text>
                  <TextField.Root type="number" value={form.story_points} onChange={(e) => setForm({ ...form, story_points: parseInt(e.target.value) || 0 })} />
                </Box>
              </Grid>
              <Flex gap="2" justify="end" mt="3">
                <Button variant="soft" color="gray" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateTask}>Create Task</Button>
              </Flex>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>

        {/* WORKSPACE TASK DETAIL DRAWER WITH INTEGRATED INTERACTIVE SUBTASK CHECKLIST PANEL */}
        {selectedTask && (
          <Dialog.Root open={true} onOpenChange={() => setSelectedTask(null)}>
            <Dialog.Content style={{ maxWidth: '720px', width: '95vw' }}>
              <Dialog.Title style={{ wordBreak: 'break-word' }}>{selectedTask.title}</Dialog.Title>
              <Tabs.Root value={detailTab} onValueChange={setDetailTab} style={{ marginTop: '12px' }}>
                <Tabs.List>
                  <Tabs.Trigger value="properties">Properties</Tabs.Trigger>
                  <Tabs.Trigger value="subtasks">Subtasks ({subtasks.length})</Tabs.Trigger>
                  <Tabs.Trigger value="comments">Comments ({comments.length})</Tabs.Trigger>
                  <Tabs.Trigger value="activity">Activity Log</Tabs.Trigger>
                </Tabs.List>

                {/* TAB 1: CORE PROPERTIES */}
                <Tabs.Content value="properties">
                  <Flex direction="column" gap="4" mt="4">
                    {/* Status Stepper */}
                    <Card style={{ background: 'var(--gray-2)', padding: '12px 16px' }}>
                      <Flex align="center" gap="1" justify="between">
                        {STATUS_COLUMNS.map((st, i) => {
                          const cfg = STATUS_CONFIG[st]
                          const isActive = selectedTask.status === st
                          const isPast = STATUS_COLUMNS.indexOf(selectedTask.status) > i
                          return (
                            <Flex key={st} align="center" gap="1" style={{ flex: 1 }}>
                              <Flex direction="column" align="center" gap="1" style={{ flex: 1, cursor: 'pointer' }} onClick={() => handleInlineUpdate({ status: st })}>
                                <span style={{
                                  width: 24, height: 24, borderRadius: '50%',
                                  background: isActive ? cfg.color : isPast ? cfg.color : 'var(--gray-5)',
                                  opacity: isActive ? 1 : isPast ? 0.6 : 0.4,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'all 0.15s ease',
                                  boxShadow: isActive ? `0 0 0 3px ${cfg.bg}` : 'none',
                                }}>
                                  {isPast && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="m5 12 5 5L20 7" /></svg>}
                                  {isActive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                                </span>
                                <Text size="1" weight={isActive ? 'bold' : 'medium'} color={isActive ? 'gray' : 'gray'} style={{ fontSize: 9, textTransform: 'capitalize', opacity: isActive ? 1 : 0.6 }}>{cfg.label}</Text>
                              </Flex>
                              {i < STATUS_COLUMNS.length - 1 && (
                                <div style={{ height: 2, flex: 1, background: isPast ? cfg.color : 'var(--gray-5)', opacity: isPast ? 0.5 : 0.3, borderRadius: 1, marginTop: -12 }} />
                              )}
                            </Flex>
                          )
                        })}
                      </Flex>
                    </Card>

                    <Box>
                      <Text size="1" color="gray" weight="bold">Description</Text>
                      <TextArea style={{ marginTop: '4px', minHeight: '80px' }} value={selectedTask.description || ''} placeholder="Add a detailed description..." onChange={(e) => handleInlineUpdate({ description: e.target.value })} />
                    </Box>

                    <Grid columns="2" gap="3">
                      <Box>
                        <Text size="1" color="gray" weight="bold">Associated Sprint</Text>
                        <Select.Root value={selectedTask.sprint_id || 'none'} onValueChange={(val) => handleInlineUpdate({ sprint_id: val === 'none' ? null : val })}>
                          <Select.Trigger style={{ width: '100%', marginTop: '4px' }} />
                          <Select.Content>
                            <Select.Item value="none">Backlog (No Sprint)</Select.Item>
                            {sprints.map((s) => <Select.Item key={s.id || s._id} value={s.id || s._id}>{s.name}</Select.Item>)}
                          </Select.Content>
                        </Select.Root>
                      </Box>
                      <Box>
                        <Text size="1" color="gray" weight="bold">Role Target</Text>
                        <Select.Root value={selectedTask.role} onValueChange={(val) => handleInlineUpdate({ role: val })}>
                          <Select.Trigger style={{ width: '100%', marginTop: '4px' }} />
                          <Select.Content>
                            {ROLE_OPTIONS.map((r) => {
                              const rcfg = ROLE_CONFIG[r]
                              return <Select.Item key={r} value={r}>{rcfg?.label || r}</Select.Item>
                            })}
                          </Select.Content>
                        </Select.Root>
                      </Box>
                    </Grid>

                    <Grid columns="2" gap="3">
                      <Box>
                        <Text size="1" color="gray" weight="bold">Priority Level</Text>
                        <Select.Root value={selectedTask.priority} onValueChange={(val) => handleInlineUpdate({ priority: val })}>
                          <Select.Trigger style={{ width: '100%', marginTop: '4px' }} />
                          <Select.Content>
                            <Select.Item value="low">Low</Select.Item>
                            <Select.Item value="medium">Medium</Select.Item>
                            <Select.Item value="high">High</Select.Item>
                          </Select.Content>
                        </Select.Root>
                      </Box>
                      <Box>
                        <Text size="1" color="gray" weight="bold">Story Points</Text>
                        <TextField.Root style={{ marginTop: '4px' }} type="number" value={selectedTask.story_points || 0} onChange={(e) => handleInlineUpdate({ story_points: parseInt(e.target.value) || 0 })} />
                      </Box>
                    </Grid>

                    <Separator size="4" />

                    <Flex justify="between" align="center">
                      <Box>
                        <Text size="1" color="gray" weight="bold" style={{ display: 'block' }}>Assignment</Text>
                        <Flex align="center" gap="2" mt="1">
                          {(selectedTask.assigned_to || selectedTask.assignee_id) ? (
                            <>
                              <Avatar size="1" radius="full" fallback="U" color="blue" />
                              <Text size="2" color="blue">Assigned</Text>
                            </>
                          ) : (
                            <Text size="2" color="gray">Unassigned</Text>
                          )}
                        </Flex>
                      </Box>
                      <Button variant="soft" color={(selectedTask.assigned_to || selectedTask.assignee_id) ? 'orange' : 'green'} onClick={() => handleToggleAssignment()}>
                        {(selectedTask.assigned_to || selectedTask.assignee_id) ? 'Unassign' : 'Assign to Me'}
                      </Button>
                    </Flex>

                    <Flex gap="3" justify="between" mt="2">
                      <Button variant="soft" color="red" size="2" onClick={handleDeleteTask}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                        Delete Task
                      </Button>
                      <Flex gap="2">
                        <Button variant="soft" color="gray" onClick={() => setSelectedTask(null)}>Close</Button>
                        <Button variant="soft" color="blue" onClick={() => { const id = selectedTask.id || selectedTask._id; setSelectedTask(null); navigate(`/organizations/${orgId}/projects/${projectId}/tasks/${id}`); }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                          Full Page
                        </Button>
                      </Flex>
                    </Flex>
                  </Flex>
                </Tabs.Content>

                {/* TAB 2: INTERACTIVE SUBTASK LIST WORKSPACE */}
                <Tabs.Content value="subtasks">
                  <Flex direction="column" gap="4" mt="4">
                    <Flex justify="between" align="center">
                      <Flex align="center" gap="2">
                        <Box style={{ color: 'var(--blue-9)' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12 2v13" /><path d="M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path d="M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                        </Box>
                        <Box>
                          <Heading size="3">Subtasks</Heading>
                          <Text size="1" color="gray">{subtasks.length} {subtasks.length === 1 ? 'item' : 'items'} in breakdown</Text>
                        </Box>
                      </Flex>
                      {!subtaskFormOpen && (
                        <Button size="2" variant="soft" color="blue" onClick={() => setSubtaskFormOpen(true)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                          Add Subtask
                        </Button>
                      )}
                    </Flex>

                    {subtaskFormOpen && (
                      <Card style={{ background: 'var(--gray-2)', border: '1px dashed var(--gray-6)' }}>
                        <Flex direction="column" gap="3">
                          <Box>
                            <Text size="1" weight="medium" color="gray">Title</Text>
                            <TextField.Root placeholder="e.g., Secure DB Index configurations..." value={subForm.title} onChange={(e) => setSubForm({ ...subForm, title: e.target.value })} />
                          </Box>
                          <Box>
                            <Text size="1" weight="medium" color="gray">Description</Text>
                            <TextArea placeholder="Define expected sub-implementation constraints..." value={subForm.description} onChange={(e) => setSubForm({ ...subForm, description: e.target.value })} style={{ minHeight: '60px' }} />
                          </Box>
                          <Grid columns="3" gap="3">
                            <Box>
                              <Text size="1" weight="medium" color="gray">Role</Text>
                              <Select.Root value={subForm.role} onValueChange={(val) => setSubForm({ ...subForm, role: val })}>
                                <Select.Trigger style={{ width: '100%' }} />
                                <Select.Content>
                                  {ROLE_OPTIONS.map((r) => {
                                    const rcfg = ROLE_CONFIG[r]
                                    return <Select.Item key={r} value={r}>{rcfg?.label || r}</Select.Item>
                                  })}
                                </Select.Content>
                              </Select.Root>
                            </Box>
                            <Box>
                              <Text size="1" weight="medium" color="gray">Priority</Text>
                              <Select.Root value={subForm.priority} onValueChange={(val) => setSubForm({ ...subForm, priority: val })}>
                                <Select.Trigger style={{ width: '100%' }} />
                                <Select.Content>
                                  <Select.Item value="low">Low</Select.Item>
                                  <Select.Item value="medium">Medium</Select.Item>
                                  <Select.Item value="high">High</Select.Item>
                                </Select.Content>
                              </Select.Root>
                            </Box>
                            <Box>
                              <Text size="1" weight="medium" color="gray">Points</Text>
                              <TextField.Root type="number" value={subForm.story_points} onChange={(e) => setSubForm({ ...subForm, story_points: parseInt(e.target.value) || 1 })} />
                            </Box>
                          </Grid>
                          <Flex gap="2" justify="end">
                            <Button size="1" variant="soft" color="gray" onClick={() => setSubtaskFormOpen(false)}>Cancel</Button>
                            <Button size="1" color="blue" onClick={handleCreateSubtask}>Create</Button>
                          </Flex>
                        </Flex>
                      </Card>
                    )}

                    <Box>
                      {subtaskLoading ? (
                        <Flex direction="column" gap="2" style={{ padding: '16px' }}>
                          {[1, 2].map(i => (
                            <div key={i} style={{ height: 48, borderRadius: 8, background: 'var(--gray-3)', opacity: 0.5 }} />
                          ))}
                        </Flex>
                      ) : subtasks.length === 0 ? (
                        <Card style={{ padding: '32px', textAlign: 'center', border: '1px dashed var(--gray-5)' }}>
                          <Flex direction="column" gap="2" align="center">
                            <Box style={{ color: 'var(--gray-6)' }}>
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18V5l12 2v13" /><path d="M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path d="M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                            </Box>
                            <Text size="2" color="gray" weight="medium">No subtasks yet</Text>
                            <Text size="1" color="gray">Break this task into smaller pieces</Text>
                          </Flex>
                        </Card>
                      ) : (
                        <Flex direction="column" gap="2">
                          {subtasks.map((sub) => {
                            const subId = sub.id || sub._id
                            const subScfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.backlog
                            const subRcfg = ROLE_CONFIG[sub.role] || ROLE_CONFIG.backend_developer
                            return (
                              <Card key={subId} style={{ transition: 'box-shadow 0.15s ease' }}
                                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)' }}
                                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
                              >
                                <Flex justify="between" align="center" gap="3">
                                  <Flex align="center" gap="3" style={{ minWidth: 0, flexGrow: 1 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: subScfg.color, flexShrink: 0 }} />
                                    <Box style={{ minWidth: 0 }}>
                                      <Text size="2" weight="bold" highContrast style={{ display: 'block' }} truncate>{sub.title}</Text>
                                      <Flex gap="2" mt="1" align="center">
                                        <Badge size="1" style={{ background: subRcfg.bg, color: subRcfg.color, fontWeight: 600 }}>{subRcfg.label}</Badge>
                                        <Text size="1" color="gray">{sub.story_points} SP</Text>
                                      </Flex>
                                    </Box>
                                  </Flex>
                                  <Flex align="center" gap="2" style={{ flexShrink: 0 }}>
                                    <Select.Root value={sub.status} onValueChange={(val) => handleUpdateSubtaskStatus(subId, val)}>
                                      <Select.Trigger size="1" style={{ minWidth: 110 }} />
                                      <Select.Content>
                                        {STATUS_COLUMNS.map((st) => (
                                          <Select.Item key={st} value={st}>{STATUS_CONFIG[st]?.label || st}</Select.Item>
                                        ))}
                                      </Select.Content>
                                    </Select.Root>
                                    <Button size="1" variant="ghost" color="red" onClick={(e) => handleDeleteSubtask(subId, e)} style={{ cursor: 'pointer', padding: 4 }}>
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                    </Button>
                                  </Flex>
                                </Flex>
                              </Card>
                            )
                          })}
                        </Flex>
                      )}
                    </Box>
                  </Flex>
                </Tabs.Content>

                {/* TAB 3: COMMENTS SECTION */}
                <Tabs.Content value="comments">
                  <Flex direction="column" gap="3" mt="4">
                    <ScrollAreaContainer height="260px">
                      {comments.length === 0 ? (
                        <Card style={{ padding: '32px', textAlign: 'center', border: '1px dashed var(--gray-5)' }}>
                          <Flex direction="column" gap="2" align="center">
                            <Box style={{ color: 'var(--gray-6)' }}>
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                            </Box>
                            <Text size="2" color="gray" weight="medium">No comments yet</Text>
                            <Text size="1" color="gray">Start a conversation about this task</Text>
                          </Flex>
                        </Card>
                      ) : (
                        <Flex direction="column" gap="3">
                          {comments.map((c) => (
                            <Card key={c.id || c._id} style={{ background: 'var(--gray-2)' }}>
                              <Flex gap="3" align="start">
                                <Avatar size="1" radius="full" fallback={(c.user_id || 'U').substring(0, 2).toUpperCase()} color="blue" />
                                <Box style={{ flexGrow: 1 }}>
                                  <Flex align="center" gap="2">
                                    <Text size="1" weight="bold" color="blue">{c.user_id || 'System User'}</Text>
                                    {c.timestamp && <Text size="1" color="gray">{c.timestamp}</Text>}
                                  </Flex>
                                  <Text size="2" style={{ marginTop: '4px', display: 'block', wordBreak: 'break-word', lineHeight: 1.5 }}>{c.message}</Text>
                                </Box>
                              </Flex>
                            </Card>
                          ))}
                        </Flex>
                      )}
                    </ScrollAreaContainer>
                    <Separator size="4" />
                    <Flex gap="2" mt="1">
                      <Box style={{ flexGrow: 1 }}>
                        <TextField.Root placeholder="Add a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}>
                          <TextField.Slot>
                            <Avatar size="1" radius="full" fallback="U" color="gray" />
                          </TextField.Slot>
                        </TextField.Root>
                      </Box>
                      <Button color="blue" onClick={handleAddComment}>Send</Button>
                    </Flex>
                  </Flex>
                </Tabs.Content>

                {/* TAB 4: CHRONOLOGICAL ACTIVITY LOGGER STREAM */}
                <Tabs.Content value="activity">
                  <Flex direction="column" gap="3" mt="4">
                    <ScrollAreaContainer height="340px">
                      {activities.length === 0 ? (
                        <Card style={{ padding: '32px', textAlign: 'center', border: '1px dashed var(--gray-5)' }}>
                          <Flex direction="column" gap="2" align="center">
                            <Box style={{ color: 'var(--gray-6)' }}>
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
                            </Box>
                            <Text size="2" color="gray" weight="medium">No activity yet</Text>
                            <Text size="1" color="gray">Actions on this task will appear here</Text>
                          </Flex>
                        </Card>
                      ) : (
                        <Flex direction="column" gap="2" style={{ borderLeft: '2px solid var(--gray-4)', paddingLeft: '16px', marginLeft: '6px' }}>
                          {activities.map((act) => (
                            <Box key={act.id || act._id} style={{ position: 'relative', paddingBottom: '16px' }}>
                              <span style={{ position: 'absolute', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--blue-8)', left: '-21px', top: '4px', border: '2px solid var(--blue-3)' }} />
                              <Text size="2" weight="medium" style={{ display: 'block', lineHeight: 1.4 }}>{act.action || 'Task state updated'}</Text>
                              <Flex align="center" gap="2" mt="1">
                                <Avatar size="1" radius="full" fallback={(act.user_id || 'A').substring(0, 1).toUpperCase()} color="gray" />
                                <Text size="1" color="gray">{act.user_id || 'agent'}</Text>
                                {act.timestamp && <><Text size="1" color="gray">·</Text><Text size="1" color="gray">{act.timestamp}</Text></>}
                              </Flex>
                            </Box>
                          ))}
                        </Flex>
                      )}
                    </ScrollAreaContainer>
                  </Flex>
                </Tabs.Content>
              </Tabs.Root>
            </Dialog.Content>
          </Dialog.Root>
        )}
      </Flex>
    </Box>
  )
}

function StatsCard({ title, value, icon, color, bg }) {
  return (
    <Card style={{ background: bg, border: '1px solid transparent' }}>
      <Flex align="center" gap="3">
        <Box style={{ color, background: 'white', padding: 8, borderRadius: 10, display: 'flex', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {icon}
        </Box>
        <Flex direction="column" gap="0">
          <Text color="gray" size="1" weight="medium">{title}</Text>
          <Heading size="6" style={{ lineHeight: 1.1 }}>{value}</Heading>
        </Flex>
      </Flex>
    </Card>
  )
}

function TaskCard({ task, sprints, isDragging, onClick }) {
  const matchedSprintName = useMemo(() => {
    if (!task.sprint_id) return null
    return sprints.find(s => (s.id || s._id) === task.sprint_id)?.name || null
  }, [task.sprint_id, sprints])

  const pcfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
  const rcfg = ROLE_CONFIG[task.role] || ROLE_CONFIG.backend_developer

  return (
    <Card
      onClick={onClick}
      style={{
        cursor: 'pointer',
        transition: 'box-shadow 0.15s ease, transform 0.1s ease',
        boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
        transform: isDragging ? 'rotate(2deg)' : undefined,
      }}
      onMouseEnter={(e) => { if (!isDragging) { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)' } }}
      onMouseLeave={(e) => { if (!isDragging) { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' } }}
    >
      <Flex direction="column" gap="2">
        <Text weight="bold" size="2" style={{ wordBreak: 'break-word', lineHeight: 1.3 }}>{task.title}</Text>
        {task.description && (
          <Text size="1" color="gray" style={{ lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {task.description}
          </Text>
        )}
        <Flex gap="1" align="center" wrap="wrap">
          <Badge size="1" style={{ background: rcfg.bg, color: rcfg.color, fontWeight: 600 }}>{rcfg.label}</Badge>
          {matchedSprintName && (
            <Badge size="1" color="blue" variant="soft">{matchedSprintName}</Badge>
          )}
        </Flex>
        <Flex justify="between" align="center" mt="1">
          <Badge size="1" style={{ background: pcfg.bg, color: pcfg.color, fontWeight: 600, textTransform: 'capitalize' }}>
            {task.priority}
          </Badge>
          <Text size="1" color="gray" weight="medium">{task.story_points} SP</Text>
        </Flex>
      </Flex>
    </Card>
  )
}

function ScrollAreaContainer({ children, height }) {
  return <div style={{ maxHeight: height, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column' }}>{children}</div>
}