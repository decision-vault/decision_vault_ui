import { useLocation, useNavigate } from 'react-router-dom'
import { Box, Flex, Text, IconButton, Avatar, DropdownMenu } from '@radix-ui/themes'
import { BellIcon } from '@radix-ui/react-icons'
import { useAuth } from '../../auth/AuthContext'

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
  const location = useLocation()
  const navigate = useNavigate()
  const title = getDashboardTitle(location.pathname)
  const { sessionUser, signOut } = useAuth()
  const email = sessionUser?.email || ''
  const initials =
    (email || sessionUser?.tenant_name || 'DV')
      .split(/[@\s]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase())
      .join('') || 'DV'

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
        <IconButton variant="ghost" size="2" radius="full" aria-label="Notifications">
          <BellIcon width="16" height="16" />
        </IconButton>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <IconButton variant="ghost" size="2" radius="full" aria-label="Account">
              <Avatar size="2" radius="full" fallback={initials} />
            </IconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end" size="2">
            <DropdownMenu.Label>Session</DropdownMenu.Label>
            <DropdownMenu.Item disabled>{sessionUser?.email || 'No email'}</DropdownMenu.Item>
            <DropdownMenu.Item disabled>Role: {sessionUser?.role || 'unknown'}</DropdownMenu.Item>
            <DropdownMenu.Item disabled>Org: {sessionUser?.tenant_name || 'unknown'}</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onSelect={() => navigate('profile')}>Profile</DropdownMenu.Item>
            <DropdownMenu.Item color="red" onSelect={signOut}>
              Logout
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>
    </Flex>
  )
}
