import { useState } from 'react'
import {
  Box,
  Flex,
  Text,
  IconButton,
  Badge,
  Avatar,
  ScrollArea,
  Separator,
} from '@radix-ui/themes'
import {
  PersonIcon,
  CalendarIcon,
  SunIcon,
  SymbolIcon,
  CheckCircledIcon,
  PlusIcon,
  Link2Icon,
  HamburgerMenuIcon,
} from '@radix-ui/react-icons'

const PANEL_WIDTH = 420

const TABS = ['Info', 'Pins', 'Files', 'Links']

const MEMBERS = [
  { name: 'Daniel Anderson', role: 'Art director', tag: 'Design', tagColor: 'green' },
  { name: 'Andrew Miller', role: 'Product owner', tag: 'Management', tagColor: 'orange' },
  { name: 'William Johnson', role: 'UX/UI designer', tag: 'Design', tagColor: 'green' },
  { name: 'Emily Davis', role: 'Front-end dev', tag: 'Development', tagColor: 'blue' },
]

// Placeholder activity bars (e.g. 7 columns of varying height)
const ACTIVITY_BARS = [3, 5, 2, 6, 4, 5, 2, 4, 6, 3, 5, 4]

function InfoTab() {
  return (
    <Flex direction="column" gap="4">
      {/* Main info */}
      <Box>
        <Text size="2" weight="bold" style={{ display: 'block', marginBottom: 10 }}>
          Main info
        </Text>
        <Flex direction="column" gap="2">
          <Flex align="center" gap="2">
            <PersonIcon width="16" height="16" style={{ color: 'var(--gray-10)', flexShrink: 0 }} />
            <Text size="2" color="gray">Creator</Text>
            <Flex align="center" gap="1" style={{ marginLeft: 'auto' }}>
              <Text size="2">Andrew M.</Text>
              <Avatar size="1" radius="full" fallback="A" />
            </Flex>
          </Flex>
          <Flex align="center" gap="2">
            <CalendarIcon width="16" height="16" style={{ color: 'var(--gray-10)', flexShrink: 0 }} />
            <Text size="2" color="gray">Date of creation</Text>
            <Text size="2" style={{ marginLeft: 'auto' }}>28 May</Text>
          </Flex>
          <Flex align="center" gap="2">
            <SunIcon width="16" height="16" style={{ color: 'var(--gray-10)', flexShrink: 0 }} />
            <Text size="2" color="gray">Status</Text>
            <Badge size="1" variant="soft" style={{ marginLeft: 'auto' }}>Active</Badge>
          </Flex>
          <Flex align="center" gap="2">
            <SymbolIcon width="16" height="16" style={{ color: 'var(--gray-10)', flexShrink: 0 }} />
            <Text size="2" color="gray">Tags</Text>
            <Flex align="center" gap="1" style={{ marginLeft: 'auto', cursor: 'pointer' }}>
              <Text size="2">13</Text>
              <Text size="2" color="gray">&gt;</Text>
            </Flex>
          </Flex>
          <Flex align="center" gap="2">
            <CheckCircledIcon width="16" height="16" style={{ color: 'var(--gray-10)', flexShrink: 0 }} />
            <Text size="2" color="gray">Tasks</Text>
            <Flex align="center" gap="1" style={{ marginLeft: 'auto', cursor: 'pointer' }}>
              <Text size="2">4</Text>
              <Text size="2" color="gray">&gt;</Text>
            </Flex>
          </Flex>
        </Flex>
      </Box>

      <Separator size="4" />

      {/* Linked threads */}
      <Box>
        <Text size="2" weight="bold" style={{ display: 'block', marginBottom: 8 }}>
          Linked threads
        </Text>
        <Flex direction="column" gap="1">
          <Flex align="center" gap="2" style={{ cursor: 'pointer', borderRadius: 4, padding: '4px 0' }}>
            <Text size="2"># Front-end</Text>
            <Badge size="1" color="gray" variant="soft">4</Badge>
          </Flex>
          <Flex align="center" gap="2" style={{ cursor: 'pointer', borderRadius: 4, padding: '4px 0' }}>
            <Text size="2"># UI-kit design standards</Text>
          </Flex>
        </Flex>
      </Box>

      <Separator size="4" />

      {/* Thread activity */}
      <Box>
        <Text size="2" weight="bold" style={{ display: 'block', marginBottom: 8 }}>
          Thread activity
        </Text>
        <Flex gap="1" align="end" style={{ height: 32 }}>
          {ACTIVITY_BARS.map((h, i) => (
            <Box
              key={i}
              style={{
                flex: 1,
                minWidth: 4,
                height: `${(h / 6) * 100}%`,
                minHeight: 4,
                background: i % 2 === 0 ? 'var(--blue-8)' : 'var(--blue-6)',
                borderRadius: 2,
              }}
            />
          ))}
        </Flex>
      </Box>

      <Separator size="4" />

      {/* Members */}
      <Box>
        <Flex align="center" justify="between" gap="1" mb="2">
          <Text size="2" weight="bold">
            Members 9
          </Text>
          <Flex gap="1">
            <IconButton variant="ghost" size="1" radius="full" aria-label="Add member">
              <PlusIcon width="14" height="14" />
            </IconButton>
            <IconButton variant="ghost" size="1" radius="full" aria-label="Link">
              <Link2Icon width="14" height="14" />
            </IconButton>
            <IconButton variant="ghost" size="1" radius="full" aria-label="Sort">
              <HamburgerMenuIcon width="14" height="14" />
            </IconButton>
          </Flex>
        </Flex>
        <Flex direction="column" gap="4">
          {MEMBERS.map((m) => (
            <Flex key={m.name} align="center" gap="2" py="2">
              <Avatar size="2" radius="full" fallback={m.name.split(' ').map((n) => n[0]).join('')} />
              <Flex direction="column" gap="0" style={{ flex: 1, minWidth: 0 }}>
                <Text size="2" weight="medium" trim="end">{m.name}</Text>
                <Text size="1" color="gray">{m.role}</Text>
              </Flex>
              <Badge size="1" color={m.tagColor} variant="soft">{m.tag}</Badge>
            </Flex>
          ))}
        </Flex>
        <Text size="1" color="gray" mt="4" style={{ display: 'block' }}>
          Offline
        </Text>
      </Box>
    </Flex>
  )
}

export function DashboardRightPanel() {
  const [activeTab, setActiveTab] = useState('Info')

  return (
    <Flex
      direction="column"
      style={{
        width: PANEL_WIDTH,
        flexShrink: 0,
        height: '100%',
        borderLeft: '1px solid var(--gray-6)',
        background: 'var(--color-panel-solid)',
        overflow: 'hidden',
      }}
    >
      {/* Tabs */}
      <Flex gap="0" p="2" style={{ borderBottom: '1px solid var(--gray-5)' }}>
        {TABS.map((tab) => (
          <Box
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '8px 4px',
              cursor: 'pointer',
              borderRadius: 6,
              background: activeTab === tab ? 'var(--gray-4)' : 'transparent',
            }}
          >
            <Text size="2" weight={activeTab === tab ? 'medium' : 'regular'}>
              {tab}
            </Text>
          </Box>
        ))}
      </Flex>

      <ScrollArea type="auto" scrollbars="vertical" style={{ flex: 1, minHeight: 0 }}>
        <Box p="3">
          {activeTab === 'Info' && <InfoTab />}
          {activeTab === 'Pins' && <Text size="2" color="gray">Pinned items will appear here.</Text>}
          {activeTab === 'Files' && <Text size="2" color="gray">Files will appear here.</Text>}
          {activeTab === 'Links' && <Text size="2" color="gray">Links will appear here.</Text>}
        </Box>
      </ScrollArea>
    </Flex>
  )
}
