import { useLocation, useNavigate } from 'react-router-dom'
import { Box, Flex, Text, IconButton, Avatar, DropdownMenu, Badge } from '@radix-ui/themes'
import { BellIcon } from '@radix-ui/react-icons'
import { useAuth } from '../../auth/AuthContext'

function getDashboardTitle(pathname) {
  if (pathname.includes('/overview')) return 'Overview'
  if (pathname.includes('/channel/')) return 'Channel'
  if (pathname.includes('/llm-config')) return 'LLM Config'
  if (pathname.includes('/logs')) return 'Logs'
  if (pathname.includes('/settings')) return 'Settings'
  if (pathname.includes('/discovery')) return 'Product Discovery'
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
      py="1"
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
            <Box
              px="3"
              py="3"
              style={{
                background: 'var(--gray-2)',
                borderBottom: '1px solid var(--gray-4)',
                margin: '-4px -4px 4px -4px',
                borderTopLeftRadius: 'var(--radius-3)',
                borderTopRightRadius: 'var(--radius-3)',
              }}
            >
              <Flex gap="3" align="center">
                <Avatar size="1" radius="full" fallback={initials} />
                <Flex direction="column" style={{ minWidth: 0 }}>
                  <Text size="2" weight="bold" style={{ display: 'block', wordBreak: 'break-all', lineHeight: 1.2 }}>
                    {sessionUser?.email || 'No email'}
                  </Text>
                  <Flex gap="2" align="center" mt="1">
                    <Badge size="1" color="blue" variant="soft" style={{ textTransform: 'capitalize' }}>
                      {sessionUser?.role || 'unknown'}
                    </Badge>
                    <Text size="1" color="gray">•</Text>
                    <Text size="1" weight="medium" color="gray" highContrast style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sessionUser?.tenant_name || 'unknown'}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </Box>
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
