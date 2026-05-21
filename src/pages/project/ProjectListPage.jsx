import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
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
} from '@radix-ui/themes'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  MixerHorizontalIcon,
  ViewGridIcon,
  ListBulletIcon,
  DotsVerticalIcon,
  PauseIcon,
  InfoCircledIcon,
} from '@radix-ui/react-icons'
import { deleteProject, listProjects, restoreProject } from '../../services/projectApi'
import { listMyProjectAccessRequests, listProjectCatalog, requestProjectAccess } from '../../services/projectApi'
import { useAuth } from '../../auth/AuthContext'

const PROJECT_LIST_VIEW_KEY = 'dv_project_list_view'
const PROJECT_LIST_STATUS_FILTER_KEY = 'dv_project_list_status_filter'

export function ProjectListPage() {
  const { orgId } = useParams()
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
  const [restoringId, setRestoringId] = useState('')
  const [error, setError] = useState('')
  const [catalog, setCatalog] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [catalogError, setCatalogError] = useState('')
  const [accessRequests, setAccessRequests] = useState([])
  const [requestingProjectId, setRequestingProjectId] = useState('')

  useEffect(() => {
    let mounted = true
    setIsLoading(true)
    const timer = setTimeout(() => {
      ;(async () => {
        try {
          const data = await listProjects(orgId, search, statusFilter)
          if (!mounted) return
          setProjects(data || [])
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
    let mounted = true
    async function loadCatalog() {
      if (!orgId) return
      if (canCreateProject) return
      setCatalogLoading(true)
      setCatalogError('')
      try {
        const [projects, myRequests] = await Promise.all([
          listProjectCatalog(orgId),
          listMyProjectAccessRequests(orgId),
        ])
        if (!mounted) return
        setCatalog(Array.isArray(projects) ? projects : [])
        setAccessRequests(Array.isArray(myRequests) ? myRequests : [])
      } catch (err) {
        if (!mounted) return
        setCatalogError(err instanceof Error ? err.message : 'Failed to load project catalog')
      } finally {
        if (mounted) setCatalogLoading(false)
      }
    }
    loadCatalog()
    return () => {
      mounted = false
    }
  }, [orgId, canCreateProject])

  useEffect(() => {
    localStorage.setItem(PROJECT_LIST_VIEW_KEY, view)
  }, [view])

  useEffect(() => {
    localStorage.setItem(PROJECT_LIST_STATUS_FILTER_KEY, statusFilter)
  }, [statusFilter])

  const filtered = useMemo(() => projects, [projects])
  const isEmpty = projects.length === 0

  const getRestoreLabel = (project) => {
    if (project.can_restore) return 'Restore'
    if (!project.restore_available_at) return 'Restore'
    const restoreAt = new Date(project.restore_available_at).getTime()
    const mins = Math.max(1, Math.ceil((restoreAt - Date.now()) / 60000))
    return `Restore in ${mins}m`
  }

  const onRestoreProject = async (project) => {
    setError('')
    setRestoringId(project.id)
    try {
      await restoreProject(orgId, project.id)
      setProjects((prev) =>
        prev.map((item) =>
          item.id === project.id
            ? {
                ...item,
                status: 'active',
                status_message: 'Project restored',
                can_restore: false,
                restore_available_at: null,
              }
            : item,
        ),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore project')
    } finally {
      setRestoringId('')
    }
  }

  const onDeleteProject = async (project) => {
    const confirmed = window.confirm(`Delete project "${project.name}"?`)
    if (!confirmed) return
    setError('')
    setDeletingId(project.id)
    try {
      await deleteProject(orgId, project.id)
      setProjects((prev) => prev.filter((item) => item.id !== project.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project')
    } finally {
      setDeletingId('')
    }
  }

  const renderProjectActions = (project) => (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton variant="ghost" size="1" radius="full" aria-label="Options">
          <DotsVerticalIcon width="16" height="16" />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {(project.status || '').toLowerCase() === 'paused' ? (
          <DropdownMenu.Item
            disabled={!project.can_restore || restoringId === project.id}
            onSelect={() => onRestoreProject(project)}
          >
            {getRestoreLabel(project)}
          </DropdownMenu.Item>
        ) : (
          <>
            <DropdownMenu.Item>Settings</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              color="red"
              disabled={deletingId === project.id}
              onSelect={() => onDeleteProject(project)}
            >
              Delete
            </DropdownMenu.Item>
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )

  return (
    <Box p="6">
      <Flex direction="column" gap="6">
        <Heading size="8">Projects</Heading>

        <Flex gap="3" align="center" wrap="wrap">
          <TextField.Root
            placeholder="Search for a project"
            size="3"
            variant="surface"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ flex: 1, minWidth: 240 }}
          >
            <TextField.Slot side="left">
              <MagnifyingGlassIcon width="18" height="18" />
            </TextField.Slot>
          </TextField.Root>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton variant="soft" size="3" aria-label="Filter by status">
                <MixerHorizontalIcon width="18" height="18" />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Label>Project status</DropdownMenu.Label>
              <DropdownMenu.Item onSelect={() => setStatusFilter('all')}>
                {statusFilter === 'all' ? '✓ ' : ''}All
              </DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => setStatusFilter('active')}>
                {statusFilter === 'active' ? '✓ ' : ''}Active
              </DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => setStatusFilter('paused')}>
                {statusFilter === 'paused' ? '✓ ' : ''}Paused
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <IconButton
            variant={view === 'grid' ? 'soft' : 'ghost'}
            size="3"
            aria-label="Grid view"
            onClick={() => setView('grid')}
          >
            <ViewGridIcon width="18" height="18" />
          </IconButton>
          <IconButton
            variant={view === 'list' ? 'soft' : 'ghost'}
            size="3"
            aria-label="List view"
            onClick={() => setView('list')}
          >
            <ListBulletIcon width="18" height="18" />
          </IconButton>
          {canCreateProject ? (
            <Button size="3" asChild>
              <Link to={`/organizations/${orgId}/projects/new`}>
                <PlusIcon width="18" height="18" />
                New project
              </Link>
            </Button>
          ) : null}
        </Flex>

        {isLoading ? (
          <Flex justify="center" p="6">
            <Spinner />
          </Flex>
        ) : null}

        {error ? (
          <Text size="2" color="red">
            {error}
          </Text>
        ) : null}

        {!isLoading && !error && isEmpty && !canCreateProject ? (
          <Card variant="surface" size="3">
            <Flex direction="column" gap="4" p="5">
              <Heading size="6">Request project access</Heading>
              <Text size="2" color="gray">
                You don&apos;t have access to any projects yet. Request access from your organization admin.
              </Text>

              {catalogLoading ? (
                <Flex align="center" gap="2">
                  <Spinner />
                  <Text size="2" color="gray">
                    Loading projects...
                  </Text>
                </Flex>
              ) : null}
              {catalogError ? (
                <Text size="2" color="red">
                  {catalogError}
                </Text>
              ) : null}

              <Flex direction="column" gap="2">
                {catalog.map((project) => {
                  const pending = accessRequests.some((r) => r.project_id === project.id && r.status === 'pending')
                  return (
                    <Card key={project.id} variant="surface" size="1">
                      <Flex align="center" justify="between" gap="3">
                        <Flex direction="column" gap="0" style={{ minWidth: 0 }}>
                          <Text size="2" weight="medium" trim="end">
                            {project.name}
                          </Text>
                          <Text size="1" color="gray">
                            {pending ? 'Request pending' : 'Not a member'}
                          </Text>
                        </Flex>
                        <Button
                          size="1"
                          variant={pending ? 'soft' : 'solid'}
                          disabled={pending || requestingProjectId === project.id}
                          onClick={async () => {
                            setCatalogError('')
                            setRequestingProjectId(project.id)
                            try {
                              const created = await requestProjectAccess(orgId, project.id)
                              setAccessRequests((prev) => {
                                const next = Array.isArray(prev) ? [...prev] : []
                                if (created?.id && !next.some((r) => r.id === created.id)) next.unshift(created)
                                return next
                              })
                            } catch (err) {
                              setCatalogError(err instanceof Error ? err.message : 'Unable to request access')
                            } finally {
                              setRequestingProjectId('')
                            }
                          }}
                        >
                          {requestingProjectId === project.id ? 'Requesting...' : pending ? 'Requested' : 'Request access'}
                        </Button>
                      </Flex>
                    </Card>
                  )
                })}
                {!catalogLoading && !catalogError && catalog.length === 0 ? (
                  <Text size="2" color="gray">
                    No projects available.
                  </Text>
                ) : null}
              </Flex>
            </Flex>
          </Card>
        ) : null}

        {!isLoading && !error && isEmpty && canCreateProject ? (
          <Card
            variant="surface"
            size="3"
            style={{
              border: '2px dashed var(--gray-6)',
              background: 'var(--color-panel-translucent)',
            }}
          >
            <Flex
              direction="column"
              align="center"
              justify="center"
              gap="4"
              p="8"
              style={{ minHeight: 320 }}
            >
              <Box
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: 'var(--gray-4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PlusIcon width="28" height="28" style={{ opacity: 0.7 }} />
              </Box>
              <Flex direction="column" align="center" gap="1">
                <Heading size="6">Create a project</Heading>
                <Text size="2" color="gray">
                  Launch a complete backend built on Postgres.
                </Text>
              </Flex>
              <Button size="3" variant="soft" color="gray" asChild>
                <Link to={`/organizations/${orgId}/projects/new`}>
                  <PlusIcon width="18" height="18" />
                  New project
                </Link>
              </Button>
            </Flex>
          </Card>
        ) : view === 'grid' ? (
          <Grid
            columns={{ initial: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
            gap="4"
          >
            {filtered.map((project) => (
              <Card key={project.id} variant="surface" size="3" asChild>
                <Link
                  to={`/organizations/${orgId}/projects/${project.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Flex direction="column" gap="4">
                    <Flex justify="between" align="start">
                    <Text size="3" weight="bold" trim="end">
                      {project.name}
                    </Text>
                      <Box onClick={(e) => e.stopPropagation()} style={{ margin: -4 }}>
                        {renderProjectActions(project)}
                      </Box>
                    </Flex>
                   
                    <Badge
                      size="1"
                      color={(project.status || 'active') === 'paused' ? 'amber' : 'green'}
                    >
                      {(project.status || 'active').toUpperCase()}
                    </Badge>
                    
                  </Flex>
                </Link>
              </Card>
            ))}
          </Grid>
        ) : (
          <Flex direction="column" gap="3">
            {filtered.map((project) => (
              <Card key={project.id} variant="surface" size="3">
                <Flex align="center" justify="between" gap="3">
                  <Box asChild style={{ minWidth: 0, flex: 1 }}>
                    <Link
                      to={`/organizations/${orgId}/projects/${project.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <Flex align="center" gap="3" style={{ minWidth: 0 }}>
                        <Box
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: 'var(--gray-4)',
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <ViewGridIcon width="16" height="16" />
                        </Box>
                        <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
                          <Text size="3" weight="medium" trim="end">
                            {project.name}
                          </Text>
                          <Flex align="center" gap="2" wrap="wrap">
                            <Badge
                              size="1"
                              color={(project.status || 'active') === 'paused' ? 'amber' : 'green'}
                            >
                              {(project.status || 'active').toUpperCase()}
                            </Badge>
                            <Text size="1" color="gray">
                              {project.region || 'Region not set'}
                            </Text>
                            <Text size="1" color="gray">
                              {project.status_message || project.statusMessage || 'Project ready'}
                            </Text>
                          </Flex>
                        </Flex>
                      </Flex>
                    </Link>
                  </Box>
                  <Box onClick={(e) => e.stopPropagation()}>{renderProjectActions(project)}</Box>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}
      </Flex>
    </Box>
  )
}
