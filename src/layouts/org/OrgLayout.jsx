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
} from '@radix-ui/themes'
import { MagnifyingGlassIcon, QuestionMarkCircledIcon } from '@radix-ui/react-icons'

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
            style={{
              width: 24,
              height: 24,
              background: 'var(--accent-9)',
              borderRadius: 6,
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }}
          />
          <Text size="4" weight="bold">
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
          <Avatar size="2" radius="full" fallback="K" />
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
