import { Link, useLocation, useParams } from 'react-router-dom'
import { Box, Flex } from '@radix-ui/themes'
import { CheckCircledIcon } from '@radix-ui/react-icons'

const Icons = {
  Tasks: CheckCircledIcon,
}

export const WORKSPACE_ITEMS = [
  {
    key: 'tasks',
    label: 'Tasks',
    icon: Icons.Tasks,
  },
]

export function SidebarWorkspaceGroup() {
  const location = useLocation()
  const { orgId, projectId } = useParams()

  const getPath = (itemKey) => {
    if (orgId && projectId && orgId !== 'undefined' && projectId !== 'undefined') {
      return `/organizations/${orgId}/projects/${projectId}/${itemKey}`
    }
    return `/dashboard/${itemKey}`
  }

  const isActive = (itemKey) => {
    const path = location.pathname
    return (
      path === `/dashboard/${itemKey}` ||
      path.startsWith(`/dashboard/${itemKey}/`) ||
      (orgId && projectId && (
        path === `/organizations/${orgId}/projects/${projectId}/${itemKey}` ||
        path.startsWith(`/organizations/${orgId}/projects/${projectId}/${itemKey}/`)
      ))
    )
  }

  return (
    <Box className="mt-4">
      {/* Decorative divider for collapsed layout */}
      <Box className="w-full border-t border-zinc-900/60 my-2" />

      {/* Nav Items list */}
      <Flex direction="column" gap="1">
        {WORKSPACE_ITEMS.map((item) => {
          const active = isActive(item.key)
          const Icon = item.icon
          const linkTarget = getPath(item.key)
          
          return (
            <Box
              key={item.key}
              asChild
              style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                borderRadius: 10,
                background: active ? 'var(--accent-3)' : 'transparent',
              }}
            >
              <Link to={linkTarget}>
                <Flex
                  align="center"
                  gap="2"
                  px="2"
                  py="2"
                  justify="center"
                  className={`group transition-all duration-300 rounded-lg ${
                    active
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent'
                  }`}
                >
                  <Icon
                    width="16"
                    height="16"
                    className={`transition-transform duration-300 group-hover:scale-110 ${
                      active ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-300'
                    }`}
                  />
                </Flex>
              </Link>
            </Box>
          )
        })}
      </Flex>
    </Box>
  )
}