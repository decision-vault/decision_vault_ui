import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Avatar, Badge, Box, Card, Flex, Heading, ScrollArea, Text } from '@radix-ui/themes'
import { ChatBubbleIcon } from '@radix-ui/react-icons'
import { listPersonalChats } from '../../services/messengerApi'

export function MessengerPage() {
  const { orgId, projectId } = useParams()
  const [loading, setLoading] = useState(false)
  const [chats, setChats] = useState([])

  useEffect(() => {
    let mounted = true
    async function loadData() {
      if (!orgId || !projectId) return
      setLoading(true)
      try {
        const chatData = await listPersonalChats(orgId, projectId)
        if (!mounted) return
        setChats(chatData || [])
      } catch {
        if (!mounted) return
        setChats([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadData()
    return () => {
      mounted = false
    }
  }, [orgId, projectId])

  return (
    <Box p="4" style={{ height: '100%' }}>
      <Flex direction="column" gap="3" style={{ height: '100%' }}>
        <Flex align="center" gap="2">
          <ChatBubbleIcon width="18" height="18" />
          <Heading size="5">Chat</Heading>
        </Flex>

        <Flex gap="3" style={{ minHeight: 0, flex: 1 }}>
          <Card size="2" style={{ flex: 1, minWidth: 0 }}>
            <ScrollArea type="auto" scrollbars="vertical" style={{ maxHeight: '55vh' }}>
              <Flex direction="column" gap="2">
                {loading ? <Text size="2" color="gray">Loading chats...</Text> : null}
                {!loading && chats.length === 0 ? (
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    gap="2"
                    style={{ padding: 24, minHeight: 220 }}
                  >
                    <ChatBubbleIcon width="28" height="28" color="var(--gray-9)" />
                    <Text size="2" color="gray" style={{ textAlign: 'center' }}>
                      No chats yet.
                    </Text>
                  </Flex>
                ) : null}
                {chats.map((chat) => (
                  <Box
                    key={chat.id}
                    asChild
                    style={{
                      borderRadius: 8,
                      border: '1px solid var(--gray-6)',
                      padding: 10,
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <Link to={`/organizations/${orgId}/projects/${projectId}/dashboard/personal/${chat.id}`}>
                      <Flex align="center" justify="between" gap="2">
                        <Flex align="center" gap="2">
                          <Avatar
                            size="2"
                            radius="full"
                            fallback={(chat.participant_display_name || 'U').slice(0, 1).toUpperCase()}
                          />
                          <Box>
                            <Text size="2" weight="medium">{chat.participant_display_name || 'Unknown'}</Text>
                            {chat.last_message_preview ? (
                              <Text size="1" color="gray">{chat.last_message_preview}</Text>
                            ) : (
                              <Text size="1" color="gray">No messages yet</Text>
                            )}
                          </Box>
                        </Flex>
                        {chat.message_count ? <Badge>{chat.message_count}</Badge> : null}
                      </Flex>
                    </Link>
                  </Box>
                ))}
              </Flex>
            </ScrollArea>
          </Card>
        </Flex>
      </Flex>
    </Box>
  )
}
