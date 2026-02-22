import { Link, useLocation, useParams } from 'react-router-dom'
import { Box, Flex, Text, IconButton, Avatar, Button } from '@radix-ui/themes'
import { LightningBoltIcon, BellIcon, PlusIcon } from '@radix-ui/react-icons'

function getDashboardTitle(pathname) {
  if (pathname.includes('/overview')) return 'Overview'
  if (pathname.includes('/channel/')) return 'Channel'
  if (pathname.includes('/team')) return 'Teams'
  if (pathname.includes('/llm-config')) return 'LLM Config'
  if (pathname.includes('/connectors')) return 'Connectors'
  if (pathname.includes('/logs')) return 'Logs'
  if (pathname.includes('/settings')) return 'Settings'
  return 'Assistant'
}

export function DashboardHeaderBar() {
  const { orgId, projectId } = useParams()
  const location = useLocation()
  const title = getDashboardTitle(location.pathname)

  return (
    <Flex
      align="center"
      justify="between"
      px="4"
      py="3"
      style={{
        borderBottom: '1px solid var(--gray-6)',
        background: 'var(--color-panel-solid)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Flex align="center" gap="2">
        <Text size="2" color="gray">
          Dashboard
        </Text>
        <Text size="2" color="gray">
          /
        </Text>
        <Text size="3" weight="medium">
          {title}
        </Text>
      </Flex>

      <Flex align="center" gap="2">
        <Button variant="soft" size="2" asChild>
          <Link to={`/organizations/${orgId}/projects/${projectId}/dashboard`}>
            <PlusIcon width="14" height="14" />
            New thread
          </Link>
        </Button>
        <IconButton variant="ghost" size="2" radius="full" aria-label="Automation">
          <LightningBoltIcon width="16" height="16" />
        </IconButton>
        <IconButton variant="ghost" size="2" radius="full" aria-label="Notifications">
          <BellIcon width="16" height="16" />
        </IconButton>
        <Box>
          <Avatar size="2" radius="full" fallback="DV" />
        </Box>
      </Flex>
    </Flex>
  )
}
