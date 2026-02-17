import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import {
  BookmarkIcon,
  ChatBubbleIcon,
  EnvelopeClosedIcon,
  FileIcon,
  MagicWandIcon,
  MagnifyingGlassIcon,
} from '@radix-ui/react-icons'
import { NavLink, useLocation } from 'react-router-dom'
import { Avatar, Badge, Card, Flex, Heading, ScrollArea, Text } from '@radix-ui/themes'

const topItems = [
  { label: 'Assistant', icon: MagicWandIcon, badge: 'NEW', plainIcon: true, path: '/dashboard/assistant' },
  { label: 'Drafts', icon: FileIcon, plainIcon: true },
  { label: 'Saved items', icon: BookmarkIcon, plainIcon: true },
  { label: 'Inbox', icon: EnvelopeClosedIcon, count: 8, plainIcon: true },
  { label: 'Direct messages', icon: ChatBubbleIcon, count: 1, plainIcon: true },
]

const favoriteItems = [
  { label: 'Sophia Wilson', count: 2, avatar: true },
  { label: 'Front-end', icon: '#', count: 4 },
]

const channelItems = [
  { label: 'General', icon: '🔥', count: 1 },
  { label: 'Front-end', icon: '#', count: 4 },
  { label: 'Website', icon: '⌘' },
  {
    label: 'v3.0',
    icon: '✴',
    children: [
      { label: 'Wireframe', icon: '↳' },
      { label: 'Design', icon: '↳' },
      { label: 'UI-kit design', icon: '↳', active: true, path: '/dashboard/chat' },
    ],
  },
  { label: 'v2.0 - actual version', icon: '#', indent: 1 },
  { label: 'Strategy', icon: '⌘' },
  { label: 'Events', icon: '🎈' },
  { label: 'Announcements', icon: '#' },
  { label: 'UI/UX', icon: '#', count: 2 },
]

function CountBadge({ count }) {
  return (
    <Badge variant="surface" className="side-count" color="gray">
      {count}
    </Badge>
  )
}

function IconChip({ icon }) {
  if (typeof icon !== 'string') {
    const Icon = icon
    return <Icon className="side-inline-icon" />
  }
  return <span className="side-icon-chip">{icon}</span>
}

function RowContent({ item }) {
  return (
      <Flex align="center" justify="between" width="100%" gap="2">
        <Flex align="center" gap="3" className="side-row-left" style={{ paddingLeft: `${(item.indent || 0) * 14}px` }}>
          {item.avatar ? <Avatar size="2" radius="full" fallback="SW" /> : <IconChip icon={item.icon} />}
          <Text className="side-row-label">{item.label}</Text>
        </Flex>
      {item.badge ? <Badge color="purple">{item.badge}</Badge> : null}
      {item.count ? <CountBadge count={item.count} /> : null}
    </Flex>
  )
}

function SidebarRow({ item }) {
  if (item.path) {
    return (
      <NavLink
        to={item.path}
        className={({ isActive }) => (isActive ? 'side-row side-row-active' : 'side-row')}
      >
        <RowContent item={item} />
      </NavLink>
    )
  }

  return (
    <button type="button" className={item.active ? 'side-row side-row-active' : 'side-row'}>
      <RowContent item={item} />
    </button>
  )
}

function SearchModal() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button type="button" className="side-search-btn" aria-label="Search">
          <MagnifyingGlassIcon />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="search-overlay" />
        <Dialog.Content className="search-modal">
          <div className="search-top">
            <input className="search-input" placeholder="Search in Conceptzilla..." autoFocus />
            <button type="button" className="search-filter-btn" aria-label="Filter search">
              ⚏
            </button>
          </div>

          <div className="search-tabs">
            <button type="button" className="search-tab active">
              All results
            </button>
            <button type="button" className="search-tab">
              Threads
            </button>
            <button type="button" className="search-tab">
              Members
            </button>
            <button type="button" className="search-tab">
              Files
            </button>
            <button type="button" className="search-tab">
              Direct messages
            </button>
            <button type="button" className="search-tab">
              Links
            </button>
          </div>

          <div className="search-body">
            <div className="search-meta-row">
              <Text className="search-section-title">Recent searches</Text>
              <Text className="search-sort">Sort by: Type</Text>
            </div>

            <Text className="search-day-label">Today</Text>
            <div className="search-item">
              <span className="search-item-icon">📄</span>
              <span className="search-item-text">fonts.zip</span>
              <span className="search-item-sub"># Website / v3.0</span>
            </div>
            <div className="search-item">
              <span className="search-item-icon">📄</span>
              <span className="search-item-text">responsive-design-guidelines.pdf</span>
              <span className="search-item-sub"># UI-kit design / UI-kit design</span>
            </div>
            <div className="search-item active">
              <span className="search-item-icon">👩</span>
              <span className="search-item-text">Sophia Wilson</span>
              <span className="search-item-sub">UX/UI designer</span>
              <span className="search-item-action">↵</span>
            </div>

            <Text className="search-day-label">Yesterday</Text>
            <div className="search-item">
              <span className="search-item-icon">👨</span>
              <span className="search-item-text">Michael Brown</span>
              <span className="search-item-sub">Back-end dev</span>
            </div>
            <div className="search-item">
              <span className="search-item-icon">📄</span>
              <span className="search-item-text">responsive-design-guidelines.pdf</span>
            </div>

            <Text className="search-day-label">20 May</Text>
            <div className="search-item">
              <span className="search-item-icon">#</span>
              <span className="search-item-text">Front-end</span>
            </div>
          </div>

          <div className="search-footer">
            <div className="search-keys">
              <span className="key-cap">▾</span>
              <span className="key-cap">▴</span>
              <span>Move</span>
              <span className="key-cap">↵</span>
              <span>Select</span>
              <span className="key-cap">/</span>
              <span>Command</span>
            </div>
            <div className="search-keys">
              <span className="key-cap">esc</span>
              <span>Cancel</span>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function WorkspaceSidebar() {
  const location = useLocation()
  const [channelsOpen, setChannelsOpen] = useState(true)
  const [threadGroupsOpen, setThreadGroupsOpen] = useState({ 'v3.0': true })

  const toggleThreadGroup = (label) => {
    setThreadGroupsOpen((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <Card className="panel sidebar-col" size="1">
      <Flex direction="column" height="100%" className="sidebar-wrap">
        <Flex align="center" justify="between" className="side-header">
          <Heading className="brand-title">Conceptzilla</Heading>
          <SearchModal />
        </Flex>

        <Flex direction="column" gap="1" className="side-section">
          {topItems.map((item) => (
            <SidebarRow
              key={item.label}
              item={{
                ...item,
                active: item.path ? location.pathname === item.path : item.active,
              }}
            />
          ))}
        </Flex>

        <Flex direction="column" gap="2" className="side-section">
          <Flex align="center" justify="between" className="side-section-title">
            <Text>Favorites</Text>
            <Text size="2">▾</Text>
          </Flex>
          <Flex direction="column" gap="1">
            {favoriteItems.map((item) => (
              <SidebarRow key={item.label} item={item} />
            ))}
          </Flex>
        </Flex>

        <Flex direction="column" gap="2" className="side-section scroll-host">
          <Flex align="center" justify="between" className="side-section-title">
            <Text>Channels</Text>
            <Flex gap="2" align="center">
              <Text size="5" className="side-plus">
                +
              </Text>
              <button
                type="button"
                className="side-section-toggle"
                onClick={() => setChannelsOpen((prev) => !prev)}
                aria-label={channelsOpen ? 'Collapse channels' : 'Expand channels'}
              >
                {channelsOpen ? '▾' : '▸'}
              </button>
            </Flex>
          </Flex>

          {channelsOpen ? (
            <ScrollArea type="auto" scrollbars="vertical" className="scroll-fill">
              <Flex direction="column" gap="1" pr="2">
                {channelItems.map((item) => {
                  if (!item.children) {
                    return <SidebarRow key={item.label} item={item} />
                  }

                  const expanded = threadGroupsOpen[item.label] ?? true

                  return (
                    <Flex key={item.label} direction="column" gap="1">
                      <div className={expanded ? 'side-row-wrap side-row-active' : 'side-row-wrap'}>
                        <button type="button" className="side-row side-row-group">
                          <RowContent item={item} />
                        </button>
                        <button
                          type="button"
                          className="side-disclosure"
                          onClick={() => toggleThreadGroup(item.label)}
                          aria-label={expanded ? `Collapse ${item.label}` : `Expand ${item.label}`}
                        >
                          {expanded ? '▾' : '▸'}
                        </button>
                      </div>

                      {expanded
                        ? item.children.map((child) => {
                            const childItem = {
                              ...child,
                              indent: 2,
                              active: child.path ? location.pathname === child.path : child.active,
                            }
                            return <SidebarRow key={`${item.label}-${child.label}`} item={childItem} />
                          })
                        : null}
                    </Flex>
                  )
                })}
              </Flex>
            </ScrollArea>
          ) : null}
        </Flex>
      </Flex>
    </Card>
  )
}
