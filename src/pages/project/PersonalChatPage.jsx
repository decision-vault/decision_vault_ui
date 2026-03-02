import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Avatar, Box, Button, Card, Flex, ScrollArea, Text, TextArea } from '@radix-ui/themes'
import { Cross2Icon, PaperPlaneIcon } from '@radix-ui/react-icons'
import {
  createPersonalMessage,
  listPersonalChats,
  listPersonalMessages,
} from '../../services/messengerApi'

function formatTime(value) {
  try {
    return new Date(value).toLocaleString()
  } catch {
    return ''
  }
}

export function PersonalChatPage() {
  const { orgId, projectId, chatId } = useParams()
  const [chats, setChats] = useState([])
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function loadChats() {
      if (!orgId || !projectId) return
      try {
        const data = await listPersonalChats(orgId, projectId)
        if (!mounted) return
        setChats(data || [])
      } catch {
        if (!mounted) return
        setChats([])
      }
    }
    loadChats()
    return () => {
      mounted = false
    }
  }, [orgId, projectId])

  useEffect(() => {
    let mounted = true
    async function loadMessages() {
      if (!orgId || !projectId || !chatId) return
      setLoading(true)
      try {
        const data = await listPersonalMessages(orgId, projectId, chatId, 300)
        if (!mounted) return
        setMessages(data || [])
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
  }, [orgId, projectId, chatId])

  const activeChat = useMemo(() => chats.find((chat) => chat.id === chatId), [chats, chatId])
  const title = activeChat?.participant_display_name || 'Personal chat'
  const subtitle = activeChat?.participant_email || ''

  const handleSend = async () => {
    const content = inputValue.trim()
    if (!content || !chatId) return
    try {
      const created = await createPersonalMessage(orgId, projectId, chatId, { content })
      setMessages((prev) => [...prev, created])
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
          <Text size="2" weight="medium">{title}</Text>
          {subtitle ? <Text size="1" color="gray">{subtitle}</Text> : null}
        </Flex>
      </Flex>

      <ScrollArea type="auto" scrollbars="vertical" style={{ flex: 1, minHeight: 0 }}>
        <Box p="4" style={{ paddingBottom: 24 }}>
          {loading ? <Text size="2" color="gray">Loading messages...</Text> : null}
          {!loading && messages.length === 0 ? <Text size="2" color="gray">No messages yet.</Text> : null}
          {messages.map((msg) => (
            <Flex key={msg.id} gap="3" mb="4" align="start">
              <Avatar
                size="2"
                radius="full"
                fallback={(msg.created_by_name || 'U').slice(0, 1).toUpperCase()}
                style={{ flexShrink: 0 }}
              />
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
          placeholder="Type a direct message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          rows={3}
          style={{ minHeight: 72, marginBottom: 8 }}
        />
        <Flex align="center" justify="end" gap="2">
          <Button variant="soft" color="gray" size="2" onClick={() => setInputValue('')}>
            <Cross2Icon width="14" height="14" /> Discard
          </Button>
          <Button size="2" onClick={handleSend} disabled={!inputValue.trim() || !chatId}>
            <PaperPlaneIcon width="14" height="14" /> Send
          </Button>
        </Flex>
      </Box>
    </Flex>
  )
}
