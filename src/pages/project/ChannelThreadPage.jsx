import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import {
  Box,
  Flex,
  Text,
  Button,
  TextArea,
  Avatar,
  Card,
  ScrollArea,
} from '@radix-ui/themes'
import { PaperPlaneIcon, Cross2Icon } from '@radix-ui/react-icons'
import { createMessage, listChannels, listMessages, listThreads } from '../../services/messengerApi'
import { listSlackChannelMessages, postSlackChannelMessage } from '../../services/connectorApi'

function formatTime(value) {
  try {
    return new Date(value).toLocaleString()
  } catch {
    return ''
  }
}

export function ChannelThreadPage() {
  const { orgId, projectId, channelId, slackChannelId } = useParams()
  const [searchParams] = useSearchParams()
  const threadId = searchParams.get('thread')
  const slackChannelName = searchParams.get('name') || ''
  const isSlackMode = Boolean(slackChannelId)
  const [channels, setChannels] = useState([])
  const [threads, setThreads] = useState([])
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function loadMeta() {
      if (!orgId || !projectId) return
      try {
        const [nextChannels, nextThreads] = await Promise.all([
          listChannels(orgId, projectId),
          !isSlackMode && channelId ? listThreads(orgId, projectId, channelId) : Promise.resolve([]),
        ])
        if (!mounted) return
        setChannels(nextChannels || [])
        setThreads(nextThreads || [])
      } catch {
        if (!mounted) return
        setChannels([])
        setThreads([])
      }
    }
    loadMeta()
    return () => {
      mounted = false
    }
  }, [orgId, projectId, channelId, isSlackMode])

  useEffect(() => {
    let mounted = true
    async function loadMessages() {
      if (!orgId || !projectId || (!channelId && !slackChannelId)) return
      setLoading(true)
      try {
        if (isSlackMode) {
          const data = await listSlackChannelMessages(orgId, slackChannelId, 100)
          if (!mounted) return
          setMessages((data?.messages || []).map((item) => ({
            id: item.id,
            content: item.text,
            created_by_name: item.user,
            created_at: item.created_at ? new Date(Number(item.created_at) * 1000).toISOString() : new Date().toISOString(),
          })))
        } else {
          const data = await listMessages(orgId, projectId, channelId, threadId)
          if (!mounted) return
          setMessages(data || [])
        }
      } catch {
        if (!mounted) return
        setMessages([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadMessages()
    return () => {
      mounted = false
    }
  }, [orgId, projectId, channelId, slackChannelId, threadId, isSlackMode])

  const channelLabel = useMemo(() => {
    if (isSlackMode) {
      return `# ${slackChannelName || slackChannelId}`
    }
    const channel = channels.find((item) => item.id === channelId)
    return channel ? `# ${channel.name}` : '# Channel'
  }, [channels, channelId, isSlackMode, slackChannelId, slackChannelName])

  const threadLabel = useMemo(() => {
    if (!threadId || isSlackMode) return null
    const thread = threads.find((item) => item.id === threadId)
    return thread ? `Thread: ${thread.title}` : 'Thread'
  }, [threads, threadId, isSlackMode])

  const handleSend = async () => {
    const content = inputValue.trim()
    if (!content) return
    try {
      if (isSlackMode) {
        const created = await postSlackChannelMessage(orgId, slackChannelId, content)
        setMessages((prev) => [
          ...prev,
          {
            id: created?.message?.id || `${Date.now()}`,
            content,
            created_by_name: 'you',
            created_at: new Date().toISOString(),
          },
        ])
      } else {
        const created = await createMessage(orgId, projectId, channelId, {
          content,
          thread_id: threadId || null,
        })
        setMessages((prev) => [...prev, created])
      }
      setInputValue('')
    } catch {
      // ignore for now
    }
  }

  return (
    <Flex direction="column" style={{ height: '100%', minHeight: 0, background: 'var(--color-background)' }}>
      <Flex
        align="center"
        justify="between"
        p="3"
        style={{ borderBottom: '1px solid var(--gray-6)', background: 'var(--color-panel-solid)', flexShrink: 0 }}
      >
        <Flex direction="column" gap="1">
          <Text size="2" weight="medium">{channelLabel}</Text>
          {threadLabel ? <Text size="1" color="gray">{threadLabel}</Text> : null}
        </Flex>
      </Flex>

      <ScrollArea type="auto" scrollbars="vertical" style={{ flex: 1, minHeight: 0 }}>
        <Box p="4" style={{ paddingBottom: 24 }}>
          {loading ? <Text size="2" color="gray">Loading messages...</Text> : null}
          {!loading && messages.length === 0 ? <Text size="2" color="gray">No messages yet.</Text> : null}
          {messages.map((msg) => (
            <Flex key={msg.id} gap="3" mb="4" align="start">
              <Avatar size="2" radius="full" fallback={(msg.created_by_name || 'U').slice(0, 1).toUpperCase()} style={{ flexShrink: 0 }} />
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Flex align="center" gap="2" mb="1">
                  <Text size="2" weight="medium">{msg.created_by_name || 'Unknown'}</Text>
                  <Text size="1" color="gray">{formatTime(msg.created_at)}</Text>
                </Flex>
                <Card size="1">
                  <Text size="2" style={{ whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </Text>
                </Card>
              </Box>
            </Flex>
          ))}
        </Box>
      </ScrollArea>

      <Box p="3" style={{ borderTop: '1px solid var(--gray-6)', background: 'var(--color-panel-solid)', flexShrink: 0 }}>
        <TextArea
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          rows={3}
          style={{ minHeight: 72, marginBottom: 8 }}
        />
        <Flex align="center" justify="end" gap="2">
          <Button variant="soft" color="gray" size="2" onClick={() => setInputValue('')}>
            <Cross2Icon width="14" height="14" /> Discard
          </Button>
          <Button size="2" onClick={handleSend} disabled={!inputValue.trim()}>
            <PaperPlaneIcon width="14" height="14" /> Send
          </Button>
        </Flex>
      </Box>
    </Flex>
  )
}
