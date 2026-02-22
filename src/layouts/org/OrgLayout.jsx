import { Link, useLocation, Outlet } from 'react-router-dom'
import {
  Box,
  Container,
  Flex,
  Text,
  Link as RadixLink,
  IconButton,
  Avatar,
  TextField,
  Kbd,
  DropdownMenu,
} from '@radix-ui/themes'
import { MagnifyingGlassIcon, QuestionMarkCircledIcon } from '@radix-ui/react-icons'
import logo from '../../assets/logo.svg'
import { useAuth } from '../../auth/AuthContext'

const navTitleByPath = {
  '/organizations': 'Organizations',
  '/organizations/new': 'New organization',
}

function getNavTitle(pathname) {
  return navTitleByPath[pathname] ?? 'Organizations'
}

export function OrgLayout() {
  const location = useLocation()
  const title = getNavTitle(location.pathname)
  const { sessionUser, refreshSession, signOut } = useAuth()
  const initials = (sessionUser?.email || 'DV')
    .split('@')[0]
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join('') || 'DV'

  return (
    <Box style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Flex
        align="center"
        justify="between"
        gap="4"
        p="4"
        style={{
          borderBottom: '1px solid var(--gray-6)',
          background: 'var(--color-panel-solid)',
        }}
      >
        <Flex align="center" gap="2">
          <Box
            asChild
            style={{
              width: 35,
              height: 35,
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <img src={logo} alt="DecisionVault logo" />
          </Box>
          <Text size="3" weight="bold">
            DecisionVault
          </Text>
          <Text size="2" color="gray">
            {title}
          </Text>
        </Flex>

        <Flex align="center" gap="3">
          <RadixLink asChild size="2" color="gray">
            <Link to="#">Feedback</Link>
          </RadixLink>

          <TextField.Root
            placeholder="Search..."
            size="2"
            variant="soft"
            style={{ minWidth: 200 }}
          >
            <TextField.Slot side="left">
              <MagnifyingGlassIcon width="16" height="16" />
            </TextField.Slot>
            <TextField.Slot side="right">
              <Kbd size="1">⌘K</Kbd>
            </TextField.Slot>
          </TextField.Root>

          <IconButton variant="ghost" size="2" radius="full" aria-label="Help">
            <QuestionMarkCircledIcon width="18" height="18" />
          </IconButton>
          <IconButton variant="ghost" size="2" radius="full" aria-label="Ideas">
            <Box
              component="span"
              style={{
                width: 18,
                height: 18,
                background: 'currentColor',
                borderRadius: 2,
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              }}
            />
          </IconButton>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton variant="ghost" size="2" radius="full" aria-label="Account">
                <Avatar size="2" radius="full" fallback={initials} />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" size="2">
              <DropdownMenu.Label>Session</DropdownMenu.Label>
              <DropdownMenu.Item disabled>
                {sessionUser?.email || 'No email'}
              </DropdownMenu.Item>
              <DropdownMenu.Item disabled>
                Role: {sessionUser?.role || 'unknown'}
              </DropdownMenu.Item>
              <DropdownMenu.Item disabled>
                Org: {sessionUser?.tenant_name || 'unknown'}
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item onSelect={() => void refreshSession()}>
                Refresh session
              </DropdownMenu.Item>
              <DropdownMenu.Item color="red" onSelect={signOut}>
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
      </Flex>

      <Box style={{ flex: 1 }}>
        <Container size="4">
          <Outlet />
        </Container>
      </Box>
    </Box>
  )
}
