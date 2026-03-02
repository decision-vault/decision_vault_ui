import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Avatar, Badge, Box, Button, Card, Flex, Heading, ScrollArea, Text } from '@radix-ui/themes'
import { ChatBubbleIcon, PersonIcon } from '@radix-ui/react-icons'
import { createPersonalChat, listPersonalChats, listPersonalContacts } from '../../services/messengerApi'

export function MessengerPage() {
  const { orgId, projectId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [chats, setChats] = useState([])
  const [contacts, setContacts] = useState([])

  useEffect(() => {
    let mounted = true
    async function loadData() {
      if (!orgId || !projectId) return
      setLoading(true)
      try {
        const [chatData, contactData] = await Promise.all([
          listPersonalChats(orgId, projectId),
          listPersonalContacts(orgId, projectId),
        ])
        if (!mounted) return
        setChats(chatData || [])
        setContacts(contactData || [])
      } catch {
        if (!mounted) return
        setChats([])
        setContacts([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadData()
    return () => {
      mounted = false
    }
  }, [orgId, projectId])

  const startChatHandler = async (participantUserId) => {
    try {
      const created = await createPersonalChat(orgId, projectId, {
        participant_user_id: participantUserId,
      })
      if (created?.id) {
        navigate(`/organizations/${orgId}/projects/${projectId}/dashboard/personal/${created.id}`)
      }
    } catch {
      // ignore for now
    }
  }

  return (
    <Box p="4" style={{ height: '100%' }}>
      <Flex direction="column" gap="3" style={{ height: '100%' }}>
        <Flex align="center" gap="2">
          <ChatBubbleIcon width="18" height="18" />
          <Heading size="5">Chat</Heading>
        </Flex>

        <Flex gap="3" style={{ minHeight: 0, flex: 1 }}>
          <Card size="2" style={{ flex: 1, minWidth: 0 }}>
            <Text size="2" weight="medium">Recent chats</Text>
            <ScrollArea type="auto" scrollbars="vertical" style={{ maxHeight: '55vh', marginTop: 12 }}>
              <Flex direction="column" gap="2">
                {loading ? <Text size="2" color="gray">Loading chats...</Text> : null}
                {!loading && chats.length === 0 ? (
                  <Text size="2" color="gray">No chats yet.</Text>
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

          <Card size="2" style={{ width: 340, minWidth: 280 }}>
            <Text size="2" weight="medium">Start a new chat</Text>
            <ScrollArea type="auto" scrollbars="vertical" style={{ maxHeight: '55vh', marginTop: 12 }}>
              <Flex direction="column" gap="2">
                {contacts.length === 0 ? (
                  <Text size="2" color="gray">No teammates available.</Text>
                ) : null}
                {contacts.map((contact) => (
                  <Flex key={contact.user_id} align="center" justify="between" gap="2">
                    <Flex align="center" gap="2" style={{ minWidth: 0 }}>
                      <PersonIcon width="14" height="14" />
                      <Text size="2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {contact.display_name}
                      </Text>
                    </Flex>
                    <Button size="1" variant="soft" onClick={() => startChatHandler(contact.user_id)}>
                      Chat
                    </Button>
                  </Flex>
                ))}
              </Flex>
            </ScrollArea>
          </Card>
        </Flex>
      </Flex>
    </Box>
  )
}
