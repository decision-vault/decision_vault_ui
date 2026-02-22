import { Link, useLocation, useParams } from 'react-router-dom'
import { Box, Flex, IconButton, ScrollArea, Text } from '@radix-ui/themes'
import {
  DashboardIcon,
  PersonIcon,
  GearIcon,
  FileTextIcon,
  MixIcon,
  ReaderIcon,
  LightningBoltIcon,
  ChatBubbleIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import logo from '../../assets/logo.svg'

function NavItem({ to, label, icon: Icon, active, collapsed }) {
  return (
    <Box
      asChild
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        borderRadius: 10,
        background: active ? 'var(--accent-3)' : 'transparent',
      }}
    >
      <Link to={to}>
        <Flex align="center" gap="2" px="2" py="2" justify={collapsed ? 'center' : 'start'}>
          <Icon width="16" height="16" />
          {!collapsed ? (
            <Text size="2" weight={active ? 'medium' : 'regular'}>
              {label}
            </Text>
          ) : null}
        </Flex>
      </Link>
    </Box>
  )
}

export function DashboardSidebar({ collapsed, onToggle }) {
  const { orgId, projectId } = useParams()
  const location = useLocation()

  const base = `/organizations/${orgId}/projects/${projectId}/dashboard`
  const items = [
    { key: 'assistant', label: 'Assistant', icon: LightningBoltIcon, to: base, match: '/dashboard' },
    { key: 'messenger', label: 'Messenger', icon: ChatBubbleIcon, to: `${base}/messenger`, match: '/messenger' },
    { key: 'dashboard', label: 'Dashboard', icon: DashboardIcon, to: `${base}/overview`, match: '/overview' },
    { key: 'teams', label: 'Teams', icon: PersonIcon, to: `${base}/team`, match: '/team' },
    { key: 'llm', label: 'LLM Config', icon: MixIcon, to: `${base}/llm-config`, match: '/llm-config' },
    { key: 'connectors', label: 'Connectors', icon: ReaderIcon, to: `${base}/connectors`, match: '/connectors' },
    { key: 'logs', label: 'Logs', icon: FileTextIcon, to: `${base}/logs`, match: '/logs' },
    { key: 'settings', label: 'Settings', icon: GearIcon, to: `${base}/settings`, match: '/settings' },
  ]

  const isActive = (item) => {
    if (item.key === 'assistant') {
      return location.pathname === base
    }
    if (item.key === 'messenger') {
      return location.pathname.includes('/messenger') || location.pathname.includes('/channel/')
    }
    if (item.key === 'dashboard') return location.pathname.endsWith('/overview')
    return location.pathname.includes(item.match)
  }

  return (
    <Flex
      direction="column"
      style={{
        borderRight: '1px solid var(--gray-6)',
        background: 'var(--color-panel-solid)',
        minWidth: 0,
      }}
    >
      <Flex align="center" gap="2" p="3" style={{ borderBottom: '1px solid var(--gray-6)' }}>
        <Box asChild style={{ width: 30, height: 30, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
          <img src={logo} alt="DecisionVault logo" />
        </Box>
        {!collapsed ? (
          <Text size="3" weight="bold">
            DecisionVault
          </Text>
        ) : null}
      </Flex>

      <ScrollArea type="auto" scrollbars="vertical" style={{ flex: 1 }}>
        <Flex direction="column" gap="1" p="2">
          {items.map((item) => (
            <NavItem
              key={item.key}
              to={item.to}
              label={item.label}
              icon={item.icon}
              active={isActive(item)}
              collapsed={collapsed}
            />
          ))}
        </Flex>
      </ScrollArea>

      <Flex justify="end" p="2" style={{ borderTop: '1px solid var(--gray-6)' }}>
        <IconButton
          variant="ghost"
          size="2"
          radius="full"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={onToggle}
        >
          {collapsed ? <DoubleArrowRightIcon width="16" height="16" /> : <DoubleArrowLeftIcon width="16" height="16" />}
        </IconButton>
      </Flex>
    </Flex>
  )
}
