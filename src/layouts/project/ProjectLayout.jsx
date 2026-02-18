import { Link, useLocation, useParams, Outlet } from 'react-router-dom'
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
  Badge,
} from '@radix-ui/themes'
import {
  MagnifyingGlassIcon,
  QuestionMarkCircledIcon,
  ChevronDownIcon,
} from '@radix-ui/react-icons'
import {
  ViewGridIcon,
  PersonIcon,
  TableIcon,
  BarChartIcon,
  GearIcon,
} from '@radix-ui/react-icons'

const ORG_NAMES = {
  '1': 'bloom-majesty',
  '2': 'bm',
  '3': 'kvstudio',
  '4': 'kavi',
}

const PROJECT_NAMES = {
  '1': 'meny-app',
}

function getContextTitle(pathname, projectId) {
  if (pathname.endsWith('/new')) return 'New project'
  if (projectId && PROJECT_NAMES[projectId]) return PROJECT_NAMES[projectId]
  return 'Projects'
}

export function ProjectLayout() {
  const { orgId, projectId } = useParams()
  const location = useLocation()
  const orgName = ORG_NAMES[orgId] ?? orgId ?? 'Organization'
  const contextTitle = getContextTitle(location.pathname, projectId)

  return (
    <Box style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Flex
        align="center"
        justify="between"
        gap="4"
        p="3"
        style={{
          borderBottom: '1px solid var(--gray-6)',
          background: 'var(--color-panel-solid)',
        }}
      >
        <Flex align="center" gap="3">
          <Box
            style={{
              width: 24,
              height: 24,
              background: 'var(--accent-9)',
              borderRadius: 6,
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }}
          />
          <Flex align="center" gap="2">
            <RadixLink asChild>
              <Link to="/organizations">
                <Text size="4" weight="bold">
                  {orgName}
                </Text>
              </Link>
            </RadixLink>
            <Badge size="1" color="gray">
              FREE
            </Badge>
            <IconButton variant="ghost" size="1" radius="full" aria-label="Switch organization">
              <ChevronDownIcon width="14" height="14" />
            </IconButton>
          </Flex>
          <Text size="2" color="gray">
            |
          </Text>
          <Text size="3" weight="medium">
            {contextTitle}
          </Text>
        </Flex>

        <Flex align="center" gap="3">
          <RadixLink asChild size="2" color="gray">
            <Link to="#">Feedback</Link>
          </RadixLink>
          <TextField.Root placeholder="Search..." size="2" variant="soft" style={{ minWidth: 200 }}>
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

      <Flex style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {!location.pathname.includes('/mvp/doc') && (
          <Flex
            direction="column"
            align="center"
            gap="2"
            p="2"
            style={{
              width: 56,
              borderRight: '1px solid var(--gray-6)',
              background: 'var(--color-panel-translucent)',
            }}
          >
            <IconButton variant="soft" size="3" radius="full" aria-label="Projects" title="Projects">
              <ViewGridIcon width="20" height="20" />
            </IconButton>
            <IconButton variant="ghost" size="3" radius="full" aria-label="Team" title="Team">
              <PersonIcon width="20" height="20" />
            </IconButton>
            <IconButton variant="ghost" size="3" radius="full" aria-label="Table" title="Table">
              <TableIcon width="20" height="20" />
            </IconButton>
            <IconButton variant="ghost" size="3" radius="full" aria-label="Analytics" title="Analytics">
              <BarChartIcon width="20" height="20" />
            </IconButton>
            <Box style={{ flex: 1 }} />
            <IconButton variant="ghost" size="3" radius="full" aria-label="Settings" title="Settings">
              <GearIcon width="20" height="20" />
            </IconButton>
          </Flex>
        )}

        <Box
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            overflow: location.pathname.includes('/mvp/doc') ? 'hidden' : 'auto',
          }}
        >
          {location.pathname.includes('/mvp/doc') ? (
            <Outlet />
          ) : (
            <Container size="4">
              <Outlet />
            </Container>
          )}
        </Box>
      </Flex>
    </Box>
  )
}
