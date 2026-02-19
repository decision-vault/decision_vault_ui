import { useState, useEffect } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import {
  Box,
  Flex,
  Text,
  IconButton,
  Badge,
  Avatar,
  ScrollArea,
} from '@radix-ui/themes'
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  MixIcon,
  ReaderIcon,
  BookmarkIcon,
  EnvelopeClosedIcon,
  ChatBubbleIcon,
  LayersIcon,
  GearIcon,
  BarChartIcon,
} from '@radix-ui/react-icons'

const SIDEBAR_WIDTH = 300

function SidebarItem({ icon: Icon, label, count, active, nested, badge, onClick }) {
  return (
    <Flex
      align="center"
      gap="2"
      py="1"
      px="2"
      style={{
        cursor: 'pointer',
        borderRadius: 6,
        background: active ? 'var(--gray-4)' : 'transparent',
        paddingLeft: nested ? 28 : 10,
      }}
      onClick={onClick}
    >
      {nested ? (
        <ChevronRightIcon width="14" height="14" style={{ color: 'var(--gray-10)', flexShrink: 0 }} />
      ) : Icon ? (
        <Icon width="18" height="18" style={{ color: 'var(--gray-11)', flexShrink: 0 }} />
      ) : null}
      <Text size="2" style={{ flex: 1, color: active ? 'var(--gray-12)' : 'var(--gray-11)' }}>
        {label}
      </Text>
      {badge && badge}
      {count != null && !badge && (
        <Badge size="1" color="gray" variant="soft" style={{ minWidth: 20, justifyContent: 'center' }}>
          {count}
        </Badge>
      )}
    </Flex>
  )
}

function SidebarSection({ title, open, onToggle, onAdd, addLabel, children }) {
  return (
    <Box mb="3">
      <Flex align="center" justify="between" gap="1" mb="1" px="2">
        <Flex align="center" gap="1" style={{ cursor: 'pointer' }} onClick={onToggle}>
          <Text size="1" weight="bold" style={{ color: 'var(--gray-11)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </Text>
          <ChevronDownIcon
            width="14"
            height="14"
            style={{ color: 'var(--gray-10)', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s' }}
          />
        </Flex>
        {onAdd && (
          <IconButton variant="ghost" size="1" radius="full" aria-label={addLabel} onClick={onAdd}>
            <PlusIcon width="14" height="14" />
          </IconButton>
        )}
      </Flex>
      {open && <Box>{children}</Box>}
    </Box>
  )
}

export function DashboardSidebar() {
  const { orgId, projectId } = useParams()
  const location = useLocation()
  const [favoritesOpen, setFavoritesOpen] = useState(true)
  const [channelsOpen, setChannelsOpen] = useState(true)
  const [activeId, setActiveId] = useState('assistant')

  useEffect(() => {
    const match = location.pathname.match(/\/dashboard\/channel\/([^/]+)/)
    if (match) setActiveId(match[1])
    else if (location.pathname.endsWith('/overview')) setActiveId('overview')
    else if (location.pathname.endsWith('/dashboard') || location.pathname.match(/\/dashboard\/?$/)) setActiveId('assistant')
  }, [location.pathname])

  return (
    <Flex
      direction="column"
      style={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        height: '100%',
        borderRight: '1px solid var(--gray-6)',
        background: 'var(--color-panel-solid)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box p="3" style={{ borderBottom: '1px solid var(--gray-5)' }}>
        <Flex align="center" justify="between" gap="2" mb="3">
          <Flex align="center" gap="1" style={{ cursor: 'pointer' }}>
            <Text size="3" weight="bold">
              Conceptzilla
            </Text>
            <ChevronDownIcon width="14" height="14" style={{ color: 'var(--gray-10)' }} />
          </Flex>
          <IconButton variant="ghost" size="2" radius="full" aria-label="Search">
            <MagnifyingGlassIcon width="18" height="18" />
          </IconButton>
        </Flex>
      </Box>

      <ScrollArea type="auto" scrollbars="vertical" style={{ flex: 1, minHeight: 0 }}>
        <Box p="2" style={{ paddingBottom: 24 }}>
          {/* Main nav */}
          <Flex direction="column" gap="0" mb="3">
            <Box
              asChild
              style={{ display: 'block', width: '100%', textDecoration: 'none', color: 'inherit', marginBottom: 2 }}
            >
              <Link
                to={orgId && projectId ? `/organizations/${orgId}/projects/${projectId}/dashboard` : '#'}
              >
                <SidebarItem
                  icon={MixIcon}
                  label="Assistant"
                  active={activeId === 'assistant'}
                  onClick={() => setActiveId('assistant')}
                  nested={false}
                  badge={<Badge size="1" color="purple" variant="solid" style={{ fontSize: 10 }}>NEW</Badge>}
                />
              </Link>
            </Box>
            <Box
              asChild
              style={{ display: 'block', width: '100%', textDecoration: 'none', color: 'inherit', marginBottom: 2 }}
            >
              <Link
                to={orgId && projectId ? `/organizations/${orgId}/projects/${projectId}/dashboard/overview` : '#'}
              >
                <SidebarItem
                  icon={BarChartIcon}
                  label="Overview"
                  active={activeId === 'overview'}
                  onClick={() => setActiveId('overview')}
                  nested={false}
                />
              </Link>
            </Box>
            <SidebarItem icon={ReaderIcon} label="Drafts" active={activeId === 'drafts'} onClick={() => setActiveId('drafts')} nested={false} />
            <SidebarItem icon={BookmarkIcon} label="Saved items" onClick={() => setActiveId('saved')} nested={false} />
            <SidebarItem icon={EnvelopeClosedIcon} label="Inbox" count={8} onClick={() => setActiveId('inbox')} nested={false} />
            <SidebarItem icon={ChatBubbleIcon} label="Direct messages" count={1} onClick={() => setActiveId('dms')} nested={false} />
          </Flex>

          {/* Favorites */}
          <SidebarSection title="Favorites" open={favoritesOpen} onToggle={() => setFavoritesOpen((o) => !o)}>
            <Flex direction="column" gap="0" mt="1">
              <Flex align="center" gap="2" py="1" px="2" style={{ cursor: 'pointer', borderRadius: 6 }}>
                <Avatar size="1" radius="full" fallback="S" />
                <Text size="2" style={{ flex: 1 }}>Sophia Wilson</Text>
                <Badge size="1" color="gray" variant="soft">2</Badge>
              </Flex>
              <SidebarItem icon={LayersIcon} label="Front-end" count={4} onClick={() => setActiveId('fe')} nested={false} />
            </Flex>
          </SidebarSection>

          {/* Channels */}
          <SidebarSection
            title="Channels"
            open={channelsOpen}
            onToggle={() => setChannelsOpen((o) => !o)}
            onAdd={() => {}}
            addLabel="Add channel"
          >
            <Flex direction="column" gap="0" mt="1">
              {[
                { id: 'general', label: 'General', icon: LayersIcon, count: 1, nested: false },
                // { id: 'frontend', label: 'Front-end', icon: LayersIcon, count: 4, nested: false },
                // { id: 'website', label: 'Website', icon: GearIcon, nested: false },
                // { id: 'v3', label: 'v3.0', icon: MixIcon, nested: false },
                // { id: 'wireframe', label: 'Wireframe', nested: true },
                // { id: 'design', label: 'Design', nested: true },
                // { id: 'ui-kit-design', label: 'UI-kit design', nested: true },
                // { id: 'v2', label: 'v2.0 - actual version', icon: LayersIcon, nested: false },
                // { id: 'strategy', label: 'Strategy', icon: GearIcon, nested: false },
                // { id: 'events', label: 'Events', icon: LayersIcon, nested: false },
                // { id: 'announcements', label: 'Announcements', icon: LayersIcon, nested: false },
                // { id: 'uiux', label: 'UI/UX', icon: LayersIcon, count: 2, nested: false },
              ].map((ch) => {
                const Item = (
                  <SidebarItem
                    icon={ch.icon}
                    label={ch.label}
                    count={ch.count}
                    nested={ch.nested}
                    active={activeId === ch.id}
                    onClick={() => setActiveId(ch.id)}
                  />
                )
                return (
                  <Box key={ch.id} asChild style={{ display: 'block', width: '100%', textDecoration: 'none', color: 'inherit', marginBottom: ch.nested ? 0 : 2 }}>
                    <Link to={orgId && projectId ? `/organizations/${orgId}/projects/${projectId}/dashboard/channel/${ch.id}` : '#'}>
                      {Item}
                    </Link>
                  </Box>
                )
              })}
            </Flex>
          </SidebarSection>
        </Box>
      </ScrollArea>
    </Flex>
  )
}
