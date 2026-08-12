import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  TextField,
  Card,
  Grid,
  IconButton,
  Badge,
  DropdownMenu,
  Spinner,
  Dialog,
  Progress,
} from '@radix-ui/themes'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ViewGridIcon,
  ListBulletIcon,
  DotsVerticalIcon,
  ChevronDownIcon,
  ArrowDownIcon,
} from '@radix-ui/react-icons'
import { deleteProject, listProjects, restoreProject } from '../../services/projectApi'
import { getBillingOverview } from '../../services/billingApi'
import { useAuth } from '../../auth/AuthContext'

const PROJECT_LIST_VIEW_KEY = 'dv_project_list_view'
const PROJECT_LIST_STATUS_FILTER_KEY = 'dv_project_list_status_filter'

const QUOTA_ROWS = [
  { key: 'projects', label: 'PROJECTS', format: (v) => Number(v).toLocaleString() },
  { key: 'team_members', label: 'TEAM MEMBERS', format: (v) => Number(v).toLocaleString() },
  {
    key: 'storage_mb',
    label: 'STORAGE',
    format: (v) => `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 1 })} MB`,
  },
  { key: 'ai_tokens', label: 'AI TOKENS', format: (v) => Number(v).toLocaleString() },
]

export function ProjectListPage() {
  const { orgId } = useParams()
  const navigate = useNavigate()
  const { sessionUser } = useAuth()
  const canCreateProject = (sessionUser?.role || '').toLowerCase() !== 'viewer'
  
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(() => {
    const saved = localStorage.getItem(PROJECT_LIST_STATUS_FILTER_KEY)
    return saved === 'active' || saved === 'paused' || saved === 'all' ? saved : 'all'
  })
  const [view, setView] = useState(() => {
    const saved = localStorage.getItem(PROJECT_LIST_VIEW_KEY)
    return saved === 'list' || saved === 'grid' ? saved : 'grid'
  })
  
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [restoringId, setRestoringId] = useState('')
  const [error, setError] = useState('')
  const [billingOverview, setBillingOverview] = useState(null)
  const [billingLoading, setBillingLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setBillingLoading(true)
    getBillingOverview(orgId)
      .then((data) => { if (mounted) setBillingOverview(data) })
      .catch(() => {})
      .finally(() => { if (mounted) setBillingLoading(false) })
    return () => { mounted = false }
  }, [orgId])

  useEffect(() => {
    let mounted = true
    setIsLoading(true)
    const timer = setTimeout(() => {
      ;(async () => {
        try {
          const data = await listProjects(orgId, search, statusFilter)
          if (!mounted) return
          const formatted = (data || []).map(p => ({
            ...p,
            provider: p.provider || 'AWS',
            region: p.region || 'ap-southeast-1',
            tier: p.tier || 'NANO'
          }))
          setProjects(formatted)
          setError('')
        } catch (err) {
          if (!mounted) return
          setError(err instanceof Error ? err.message : 'Failed to load projects')
        } finally {
          if (mounted) setIsLoading(false)
        }
      })()
    }, 250)
    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [orgId, search, statusFilter])

  useEffect(() => {
    localStorage.setItem(PROJECT_LIST_VIEW_KEY, view)
  }, [view])

  useEffect(() => {
    localStorage.setItem(PROJECT_LIST_STATUS_FILTER_KEY, statusFilter)
  }, [statusFilter])

  const filtered = useMemo(() => projects, [projects])
  const isEmpty = projects.length === 0

  const onRestoreProject = async (project) => {
    setError('')
    setRestoringId(project.id)
    try {
      await restoreProject(orgId, project.id)
      setProjects((prev) =>
        prev.map((item) =>
          item.id === project.id ? { ...item, status: 'active' } : item,
        ),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore project')
    } finally {
      setRestoringId('')
    }
  }

  const openDeleteDialog = (project) => {
    setDeleteTarget(project)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setError('')
    setDeletingId(deleteTarget.id)
    try {
      await deleteProject(orgId, deleteTarget.id)
      setProjects((prev) => prev.filter((item) => item.id !== deleteTarget.id))
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project')
    } finally {
      setDeletingId('')
    }
  }

  const renderProjectActions = (project) => (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton variant="ghost" size="2" color="gray" radius="full" style={{ cursor: 'pointer' }}>
          <DotsVerticalIcon width="16" height="16" />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        {(project.status || '').toLowerCase() === 'paused' ? (
          <DropdownMenu.Item
            disabled={restoringId === project.id}
            onSelect={() => onRestoreProject(project)}
          >
            Restore Project
          </DropdownMenu.Item>
        ) : (
          <>
            <DropdownMenu.Item onSelect={() => navigate(`/organizations/${orgId}/projects/${project.id}/dashboard/settings`)}>
              Settings
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              color="red"
              disabled={deletingId === project.id}
              onSelect={() => openDeleteDialog(project)}
            >
              Delete
            </DropdownMenu.Item>
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )

  return (
    <Box p="6" style={{ background: 'var(--color-background)', minHeight: '100vh', maxWidth: '100%', overflowX: 'clip' }}>
      <Flex direction="column" gap="5" mx="auto" style={{ maxWidth: 1400 }}>
        
        {/* Title Heading */}
        <Flex justify="between" align="center" wrap="wrap" gap="3">
          <Box>
            <Heading size="7" weight="bold" style={{ color: 'var(--gray-12)', letterSpacing: '-0.02em' }}>
              Projects
            </Heading>
            <Text size="2" color="gray" mt="1">
              {projects.length > 0
                ? `${projects.length} ${projects.length === 1 ? 'project' : 'projects'} in this organization`
                : 'Create and manage your organization projects'}
            </Text>
          </Box>
          {canCreateProject && (
            <Button size="2" variant="solid" style={{ fontWeight: '600', cursor: 'pointer' }} asChild>
              <Link to={`/organizations/${orgId}/new`} style={{ textDecoration: 'none' }}>
                <PlusIcon width="16" height="16" />
                New project
              </Link>
            </Button>
          )}
        </Flex>

        {/* ================= CONTROLS ACTION DOCK ================= */}
        <Flex justify="between" align="center" wrap="wrap" gap="3">
          <Flex gap="3" align="center" style={{ flex: 1, minWidth: 0 }}>
            <TextField.Root
              placeholder="Search for a project"
              size="2"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ width: 280 }}
            >
              <TextField.Slot side="left">
                <MagnifyingGlassIcon width="16" height="16" color="var(--gray-9)" />
              </TextField.Slot>
            </TextField.Root>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant="surface" color="gray" size="2" style={{ cursor: 'pointer' }}>
                  <Text size="2">Status</Text>
                  <ChevronDownIcon width="14" height="14" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item onSelect={() => setStatusFilter('all')}>All Statuses</DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => setStatusFilter('active')}>Active</DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => setStatusFilter('paused')}>Paused</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>

            <Button variant="surface" color="gray" size="2">
              <ArrowDownIcon width="14" height="14" />
              <Text size="2">Sorted by name</Text>
            </Button>
          </Flex>

          <Flex align="center" gap="3">
            <Flex gap="1">
              <IconButton
                variant="ghost"
                color="gray"
                style={{ opacity: view === 'grid' ? 1 : 0.4, cursor: 'pointer' }}
                onClick={() => setView('grid')}
              >
                <ViewGridIcon width="18" height="18" />
              </IconButton>
              <IconButton
                variant="ghost"
                color="gray"
                style={{ opacity: view === 'list' ? 1 : 0.4, cursor: 'pointer' }}
                onClick={() => setView('list')}
              >
                <ListBulletIcon width="18" height="18" />
              </IconButton>
            </Flex>
          </Flex>
        </Flex>

        {error && (
          <Text size="2" color="red">
            {error}
          </Text>
        )}

        {/* ================= TWO-COLUMN GRID WORKSPACE ================= */}
        <Grid columns={{ initial: '1fr', lg: '1fr 360px' }} gap="6" mt="2" style={{ minWidth: 0, width: '100%' }}>
          
          {/* LEFT: Projects List Frame */}
          <Box>
            {isLoading ? (
              <Flex justify="center" align="center" p="2" style={{ minHeight: 200 }}>
                <Spinner size="3" />
              </Flex>
            ) : isEmpty ? (
              <Flex direction="column" align="center" justify="center" gap="3" style={{ minHeight: 300 }}>
                <Heading size="4">No projects found</Heading>
                <Text size="2" color="gray">
                  {search || statusFilter !== 'all'
                    ? 'Try adjusting your search or status filter.'
                    : 'Create your first project to get started.'}
                </Text>
                {canCreateProject && !search && statusFilter === 'all' && (
                  <Button size="2" variant="solid" style={{ fontWeight: '600', cursor: 'pointer' }} asChild>
                    <Link to={`/organizations/${orgId}/new`} style={{ textDecoration: 'none' }}>
                      <PlusIcon width="16" height="16" />
                      New project
                    </Link>
                  </Button>
                )}
              </Flex>
            ) : view === 'grid' ? (
              <Grid
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '16px',
                  width: '100%',
                  minWidth: 0,
                }}
              >
                {filtered.map((project) => {
                  const isPaused = (project.status || '').toLowerCase() === 'paused'
                  return (
                  <Card
                    key={project.id}
                    className="project-card-interactive"
                    onClick={() => navigate(`/organizations/${orgId}/projects/${project.id}`)}
                    style={{
                      padding: '16px',
                      background: 'var(--color-panel-solid)',
                      overflow: 'hidden',
                      minWidth: 0,
                      width: '100%',
                      maxWidth: '100%',
                    }}
                  >
                    <style>{`
                      .project-card-interactive {
                        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
                        cursor: pointer;
                      }
                      .project-card-interactive:hover {
                        border-color: var(--accent-7) !important;
                        box-shadow: 0 12px 32px var(--gray-a4);
                        transform: translateY(-4px);
                      }
                    `}</style>

                    <Flex justify="between" align="start" gap="3">
                      <Box style={{ minWidth: 0, overflow: 'hidden' }}>
                        <Heading
                          size="4"
                          weight="bold"
                          style={{
                            color: 'var(--gray-12)',
                            letterSpacing: '-0.01em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {project.name}
                        </Heading>
                        <Text
                          size="2"
                          color="gray"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            marginTop: 6,
                            minHeight: 34,
                          }}
                        >
                          {project.description || 'No description yet.'}
                        </Text>
                      </Box>
                      <Box onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
                        {renderProjectActions(project)}
                      </Box>
                    </Flex>

                    <Box mt="3">
                      {isPaused ? (
                        <Badge size="1" color="amber" variant="soft" highContrast={false}>
                          Paused
                        </Badge>
                      ) : (
                        <Badge size="1" color="green" variant="soft" highContrast={false}>
                          Active
                        </Badge>
                      )}
                    </Box>
                  </Card>
                )})}
              </Grid>
            ) : (
              <Flex direction="column" gap="2">
                {filtered.map((project) => (
                  <Card 
                    key={project.id} 
                    variant="ghost"
                    className="project-card-interactive"
                    onClick={() => navigate(`/organizations/${orgId}/projects/${project.id}`)}
                    style={{ padding: '16px', border: '1px solid var(--gray-4)', position: 'relative', background: 'var(--color-panel-solid)' }}
                  >
                    <Flex align="center" justify="between" style={{ gap: 12, minWidth: 0 }}>
                      <Flex align="center" gap="4" style={{ flex: 1, minWidth: 0 }}>
                        <Heading
                          size="3"
                          style={{
                            color: 'var(--gray-12)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {project.name}
                        </Heading>
                        <Text size="2" color="gray" style={{ whiteSpace: 'nowrap' }}> {project.description || 'No description yet.'}</Text>
 <Badge size="1" color="green" variant="soft" highContrast={false}>
                          Active
                        </Badge>                      </Flex>
                      <Box onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
                        {renderProjectActions(project)}
                      </Box>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            )}
          </Box>

          {/* ================= RIGHT: PLAN USAGE TRACKING MODULE ================= */}
          <Box>
            <Card variant="ghost" style={{ padding: '20px', border: '1px solid var(--gray-4)', background: 'var(--color-panel-solid)' }}>
              <Flex justify="between" align="center" mb="4">
                <Box>
                  <Heading size="3" weight="bold" style={{ color: 'var(--gray-12)' }}>
                    {billingOverview?.plan_name || (billingOverview?.plan?.plan || 'Free')} plan usage
                  </Heading>
                  <Text size="1" color="gray" style={{ display: 'block', marginTop: '2px' }}>
                    Current billing cycle
                  </Text>
                </Box>

                <Button size="2" variant="solid" style={{ fontWeight: '600', cursor: 'pointer' }}
                  onClick={() => navigate(`/organizations/${orgId}/billing`)}>
                  Upgrade
                </Button>
              </Flex>

              {billingLoading ? (
                <Flex justify="center" align="center" py="6">
                  <Spinner size="3" />
                </Flex>
              ) : (
                <Flex direction="column" gap="3">
                  {QUOTA_ROWS.map(({ key, label, format }) => {
                    const q = billingOverview?.plan?.quotas?.[key]
                    if (!q) return null
                    const limit = q.limit
                    const pct = limit ? Math.min(100, (q.used / limit) * 100) : 0
                    return (
                      <Box key={key}>
                        <Flex justify="between" align="center" mb="2">
                          <Text size="1" weight="bold" color="gray">{label}</Text>
                          <Text size="1" weight="medium" style={{ color: 'var(--gray-12)' }}>
                            <strong>{format(q.used)}</strong> <span style={{ color: 'var(--gray-8)' }}>/ {limit == null ? '∞' : format(limit)}</span>
                          </Text>
                        </Flex>
                        <Progress value={pct} size="1" color={pct >= 90 ? 'red' : pct >= 70 ? 'amber' : 'blue'} radius="full" style={{ height: '6px' }} />
                      </Box>
                    )
                  })}
                </Flex>
              )}
            </Card>
          </Box>
        </Grid>
      </Flex>

      {/* Confirmation Modals Area */}
      <Dialog.Root
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
          setDeleteDialogOpen(open)
        }}
      >
        <Dialog.Content maxWidth="500px">
          <Dialog.Title>Delete project</Dialog.Title>
          <Dialog.Description size="2" mb="3">
            {deleteTarget?.name
              ? `Are you sure you want to delete project "${deleteTarget.name}"? This action cannot be undone.`
              : 'Are you sure you want to delete this project?'}
          </Dialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <Button variant="soft" color="gray" onClick={() => setDeleteDialogOpen(false)} disabled={!!deletingId}>
              Cancel
            </Button>
            <Button color="red" onClick={handleConfirmDelete} disabled={!!deletingId}>
              {deletingId ? 'Deleting...' : 'Delete'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}