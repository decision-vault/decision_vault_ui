import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import {
  Box,
  Flex,
  IconButton,
  ScrollArea,
  Text,
  Badge,
  Dialog,
  TextField,
  Button,
} from '@radix-ui/themes'
import {
  ChevronDownIcon,
  PlusIcon,
  LayersIcon,
  MagnifyingGlassIcon,
  LightningBoltIcon,
  ChatBubbleIcon,
  StarIcon,
  StarFilledIcon,
} from '@radix-ui/react-icons'
import {
  createChannel,
  createThread,
  favoriteChannel,
  listChannels,
  listThreads,
  unfavoriteChannel,
} from '../../services/messengerApi'
import { listSlackChannels } from '../../services/connectorApi'

function Section({ title, open, onToggle, onAdd, children }) {
  return (
    <Box mb="3">
      <Flex align="center" justify="between" px="2" mb="1">
        <Flex align="center" gap="1" style={{ cursor: 'pointer' }} onClick={onToggle}>
          <Text size="1" weight="bold" style={{ color: 'var(--gray-11)', textTransform: 'uppercase' }}>
            {title}
          </Text>
          <ChevronDownIcon
            width="14"
            height="14"
            style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s' }}
          />
        </Flex>
        {onAdd ? (
          <IconButton variant="ghost" size="1" radius="full" aria-label={`Add ${title}`} onClick={onAdd}>
            <PlusIcon width="14" height="14" />
          </IconButton>
        ) : null}
      </Flex>
      {open ? children : null}
    </Box>
  )
}

function ChannelItem({ label, to, active, count, isFavorite, onToggleFavorite }) {
  return (
    <Box
      asChild
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        borderRadius: 8,
        background: active ? 'var(--gray-4)' : 'transparent',
      }}
    >
      <Link to={to}>
        <Flex align="center" justify="between" gap="2" px="2" py="1">
          <Flex align="center" gap="2">
            <LayersIcon width="14" height="14" />
            <Text size="2">{label}</Text>
          </Flex>
          <Flex align="center" gap="1">
            <IconButton
              variant="ghost"
              size="1"
              radius="full"
              aria-label={isFavorite ? 'Unfavorite channel' : 'Favorite channel'}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onToggleFavorite?.()
              }}
            >
              {isFavorite ? <StarFilledIcon width="13" height="13" /> : <StarIcon width="13" height="13" />}
            </IconButton>
            {count ? (
              <Badge size="1" color="gray" variant="soft">
                {count}
              </Badge>
            ) : null}
          </Flex>
        </Flex>
      </Link>
    </Box>
  )
}

function ThreadItem({ label, to, active }) {
  return (
    <Box
      asChild
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        borderRadius: 8,
        background: active ? 'var(--gray-4)' : 'transparent',
      }}
    >
      <Link to={to}>
        <Flex align="center" gap="2" px="2" py="1">
          <Text size="2" style={{ color: 'var(--gray-11)' }}>
            # {label}
          </Text>
        </Flex>
      </Link>
    </Box>
  )
}

function SlackChannelItem({ label, channelId, to, active }) {
  return (
    <Box
      asChild
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        borderRadius: 8,
        background: active ? 'var(--gray-4)' : 'transparent',
      }}
    >
      <Link to={to}>
        <Flex align="center" justify="between" gap="2" px="2" py="1">
          <Text size="2"># {label}</Text>
          <Badge size="1" color="gray" variant="soft">
            {channelId}
          </Badge>
        </Flex>
      </Link>
    </Box>
  )
}

export function DashboardLeftListPanel() {
  const { orgId, projectId } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [favoritesOpen, setFavoritesOpen] = useState(true)
  const [channelsOpen, setChannelsOpen] = useState(true)
  const [threadsOpen, setThreadsOpen] = useState(true)
  const [slackChannelsOpen, setSlackChannelsOpen] = useState(true)
  const [channels, setChannels] = useState([])
  const [slackChannels, setSlackChannels] = useState([])
  const [threads, setThreads] = useState([])
  const [activeChannel, setActiveChannel] = useState('')
  const [channelDialogOpen, setChannelDialogOpen] = useState(false)
  const [threadDialogOpen, setThreadDialogOpen] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newThreadTitle, setNewThreadTitle] = useState('')

  useEffect(() => {
    const match = location.pathname.match(/\/dashboard\/channel\/([^/]+)/)
    if (match) {
      setActiveChannel(match[1])
      return
    }
    if (channels.length > 0) {
      setActiveChannel(channels[0].id)
    }
  }, [location.pathname, channels])

  useEffect(() => {
    let mounted = true
    async function loadChannels() {
      if (!orgId || !projectId) return
      try {
        const data = await listChannels(orgId, projectId)
        if (!mounted) return
        setChannels(data || [])
      } catch {
        if (!mounted) return
        setChannels([])
      }
    }
    loadChannels()
    return () => {
      mounted = false
    }
  }, [orgId, projectId])

  useEffect(() => {
    let mounted = true
    async function loadSlack() {
      if (!orgId) return
      try {
        const data = await listSlackChannels(orgId)
        if (!mounted) return
        setSlackChannels(data?.channels || [])
      } catch {
        if (!mounted) return
        setSlackChannels([])
      }
    }
    loadSlack()
    return () => {
      mounted = false
    }
  }, [orgId])

  useEffect(() => {
    let mounted = true
    async function loadThreads() {
      if (!orgId || !projectId || !activeChannel) {
        setThreads([])
        return
      }
      try {
        const data = await listThreads(orgId, projectId, activeChannel)
        if (!mounted) return
        setThreads(data || [])
      } catch {
        if (!mounted) return
        setThreads([])
      }
    }
    loadThreads()
    return () => {
      mounted = false
    }
  }, [orgId, projectId, activeChannel])

  const base = `/organizations/${orgId}/projects/${projectId}/dashboard`
  const activeThread = searchParams.get('thread') || ''
  const activeSlackChannel = location.pathname.match(/\/dashboard\/slack\/([^/]+)/)?.[1] || ''
  const isMessengerActive =
    location.pathname.includes('/messenger') ||
    location.pathname.includes('/channel/') ||
    location.pathname.includes('/slack/')

  const createChannelHandler = async () => {
    const name = newChannelName.trim()
    if (!name) return
    try {
      const created = await createChannel(orgId, projectId, { name })
      setChannels((prev) => [...prev, created])
      setActiveChannel(created.id)
      setNewChannelName('')
      setChannelDialogOpen(false)
    } catch {
      // ignore for now
    }
  }

  const createThreadHandler = async () => {
    if (!activeChannel) return
    const title = newThreadTitle.trim()
    if (!title) return
    try {
      const created = await createThread(orgId, projectId, activeChannel, { title })
      setThreads((prev) => [...prev, created])
      setNewThreadTitle('')
      setThreadDialogOpen(false)
    } catch {
      // ignore for now
    }
  }

  const favoriteChannels = useMemo(() => channels.filter((channel) => channel.is_favorite), [channels])
  const toggleFavoriteHandler = async (channel) => {
    try {
      if (channel.is_favorite) {
        await unfavoriteChannel(orgId, projectId, channel.id)
      } else {
        await favoriteChannel(orgId, projectId, channel.id)
      }
      setChannels((prev) =>
        prev.map((item) =>
          item.id === channel.id ? { ...item, is_favorite: !channel.is_favorite } : item
        )
      )
    } catch {
      // ignore for now
    }
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
      <Flex align="center" justify="between" p="3" style={{ borderBottom: '1px solid var(--gray-6)' }}>
        <Text size="3" weight="medium">
          Messenger
        </Text>
        <IconButton variant="ghost" size="2" radius="full" aria-label="Search">
          <MagnifyingGlassIcon width="16" height="16" />
        </IconButton>
      </Flex>

      <ScrollArea type="auto" scrollbars="vertical" style={{ flex: 1 }}>
        <Box p="2">
          <Box
            asChild
            style={{
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              borderRadius: 8,
              background: location.pathname === base ? 'var(--gray-4)' : 'transparent',
              marginBottom: 10,
            }}
          >
            <Link to={base}>
              <Flex align="center" gap="2" px="2" py="1">
                <LightningBoltIcon width="14" height="14" />
                <Text size="2" weight="medium">
                  Assistant
                </Text>
              </Flex>
            </Link>
          </Box>

          <Box
            asChild
            style={{
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              borderRadius: 8,
              background: isMessengerActive ? 'var(--gray-4)' : 'transparent',
              marginBottom: 10,
            }}
          >
            <Link to={`${base}/messenger`}>
              <Flex align="center" gap="2" px="2" py="1">
                <ChatBubbleIcon width="14" height="14" />
                <Text size="2" weight="medium">
                  Messenger
                </Text>
              </Flex>
            </Link>
          </Box>

          <Section title="Favorites" open={favoritesOpen} onToggle={() => setFavoritesOpen((v) => !v)}>
            {favoriteChannels.map((channel) => (
              <ChannelItem
                key={`fav-${channel.id}`}
                label={channel.name}
                to={`${base}/channel/${channel.id}`}
                active={activeChannel === channel.id}
                count={channel.message_count}
                isFavorite={channel.is_favorite}
                onToggleFavorite={() => toggleFavoriteHandler(channel)}
              />
            ))}
          </Section>

          <Section
            title="Channels"
            open={channelsOpen}
            onToggle={() => setChannelsOpen((v) => !v)}
            onAdd={() => setChannelDialogOpen(true)}
          >
            {channels.map((channel) => (
              <ChannelItem
                key={channel.id}
                label={channel.name}
                to={`${base}/channel/${channel.id}`}
                active={activeChannel === channel.id}
                count={channel.message_count}
                isFavorite={channel.is_favorite}
                onToggleFavorite={() => toggleFavoriteHandler(channel)}
              />
            ))}
          </Section>

          <Section
            title="Threads"
            open={threadsOpen}
            onToggle={() => setThreadsOpen((v) => !v)}
            onAdd={() => setThreadDialogOpen(true)}
          >
            {threads.map((thread) => (
              <ThreadItem
                key={`${activeChannel}-${thread.id}`}
                label={thread.title}
                to={`${base}/channel/${activeChannel}?thread=${thread.id}`}
                active={activeThread === thread.id}
              />
            ))}
          </Section>

          <Section
            title="Slack Channels"
            open={slackChannelsOpen}
            onToggle={() => setSlackChannelsOpen((v) => !v)}
          >
            {slackChannels.map((channel) => (
              <SlackChannelItem
                key={channel.id}
                label={channel.name}
                channelId={channel.id}
                to={`${base}/slack/${channel.id}?name=${encodeURIComponent(channel.name || channel.id)}`}
                active={activeSlackChannel === channel.id}
              />
            ))}
          </Section>
        </Box>
      </ScrollArea>

      <Dialog.Root open={channelDialogOpen} onOpenChange={setChannelDialogOpen}>
        <Dialog.Content maxWidth="420px">
          <Dialog.Title>Create channel</Dialog.Title>
          <Dialog.Description size="2" mb="3">
            Add a new channel for this project.
          </Dialog.Description>
          <TextField.Root
            placeholder="Channel name"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') createChannelHandler()
            }}
          />
          <Flex gap="3" mt="4" justify="end">
            <Button variant="soft" color="gray" onClick={() => setChannelDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createChannelHandler} disabled={!newChannelName.trim()}>
              Create
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={threadDialogOpen} onOpenChange={setThreadDialogOpen}>
        <Dialog.Content maxWidth="420px">
          <Dialog.Title>Create thread</Dialog.Title>
          <Dialog.Description size="2" mb="3">
            Add a thread to the selected channel.
          </Dialog.Description>
          <TextField.Root
            placeholder="Thread title"
            value={newThreadTitle}
            onChange={(e) => setNewThreadTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') createThreadHandler()
            }}
          />
          <Flex gap="3" mt="4" justify="end">
            <Button variant="soft" color="gray" onClick={() => setThreadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createThreadHandler} disabled={!newThreadTitle.trim() || !activeChannel}>
              Create
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  )
}
