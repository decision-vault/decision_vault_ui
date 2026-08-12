import { useEffect, useState } from 'react'
import { Box, Flex, Text, Skeleton } from '@radix-ui/themes'
import { ChevronRight, FolderPlus, Layout } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { listProjects } from '../../services/projectApi'

function statusTone(status) {
  if (!status) return 'gray'
  const value = String(status).toLowerCase()
  if (value.includes('completed') || value.includes('active') || value.includes('ready') || value.includes('healthy')) return 'green'
  if (value.includes('running') || value.includes('queued') || value.includes('draft')) return 'blue'
  if (value.includes('paused') || value.includes('pending')) return 'amber'
  if (value.includes('failed') || value.includes('error') || value.includes('stopped')) return 'red'
  return 'gray'
}

export function AccountProjectsList({ orgId, maxItems = 4 }) {
  const navigate = useNavigate()
  const [projects, setProjects] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    if (!orgId) return undefined
    setProjects(null)
    setError('')
    listProjects(orgId)
      .then((data) => {
        if (!cancelled) setProjects(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load projects')
          setProjects([])
        }
      })
    return () => {
      cancelled = true
    }
  }, [orgId])

  return (
    <Box px="4" py="2" style={{ borderBottom: '1px solid var(--gray-4)' }}>
      <Text size="1" weight="medium" style={{ color: 'var(--gray-9)', display: 'block', marginBottom: '6px' }}>
        Projects
      </Text>

      {projects === null ? (
        <Flex direction="column" gap="2" py="1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Flex key={i} align="center" gap="2">
              <Skeleton width="10px" height="10px" style={{ borderRadius: '50%' }} />
              <Skeleton height="12px" width={`${70 - i * 12}%`} />
            </Flex>
          ))}
        </Flex>
      ) : projects.length > 0 ? (
        <Flex direction="column" gap="1">
          {projects.slice(0, maxItems).map((project) => (
            <Flex
              key={project.id || project._id}
              align="center"
              gap="2"
              px="1"
              py="1"
              style={{ borderRadius: 6, cursor: 'pointer' }}
              onClick={(e) => {
                e.preventDefault()
                navigate(`/organizations/${orgId}/projects/${project.id || project._id}/dashboard/overview`)
              }}
            >
              <Box
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  flexShrink: 0,
                  backgroundColor: `var(--${statusTone(project.status)}-9)`,
                }}
              />
              <Text size="2" style={{ color: 'var(--gray-12)', minWidth: 0, flex: 1 }} className="truncate">
                {project.name || 'Untitled project'}
              </Text>
              <ChevronRight size={12} style={{ color: 'var(--gray-8)', flexShrink: 0 }} />
            </Flex>
          ))}
        </Flex>
      ) : (
        <Flex direction="column" align="center" justify="center" py="3" gap="1" style={{ textAlign: 'center' }}>
          <Layout size={14} style={{ color: 'var(--gray-7)' }} />
          <Text size="1" style={{ color: 'var(--gray-10)' }}>
            {error ? 'Could not load projects' : 'No projects yet'}
          </Text>
        </Flex>
      )}

      <Flex
        align="center"
        gap="2"
        px="1"
        py="1"
        mt="1"
        style={{ borderRadius: 6, cursor: 'pointer' }}
        onClick={(e) => {
          e.preventDefault()
          navigate(`/organizations/${orgId}/projects`)
        }}
      >
        <FolderPlus size={14} style={{ color: 'var(--blue-9)', flexShrink: 0 }} />
        <Text size="2" weight="medium" style={{ color: 'var(--blue-10)' }}>
          View all projects
        </Text>
      </Flex>
    </Box>
  )
}
