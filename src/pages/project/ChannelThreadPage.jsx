import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Flex,
  Text,
  Button,
  TextArea,
  Avatar,
  IconButton,
  Card,
  ScrollArea,
} from '@radix-ui/themes'
import {
  DotsHorizontalIcon,
  StarIcon,
  InfoCircledIcon,
  PlusIcon,
  PaperPlaneIcon,
  Cross2Icon,
} from '@radix-ui/react-icons'

const CHANNEL_NAMES = {
  'ui-kit-design': '# Website / v3.0 / UI-kit design',
  'wireframe': '# Website / v3.0 / Wireframe',
  'design': '# Website / v3.0 / Design',
  'general': '# General',
  'frontend': '# Front-end',
  'website': '# Website',
  'v3': '# v3.0',
  'v2': '# v2.0 - actual version',
  'strategy': '# Strategy',
  'events': '# Events',
  'announcements': '# Announcements',
  'uiux': '# UI/UX',
}

const INITIAL_MESSAGES = [
  {
    id: '1',
    author: 'Sophia W.',
    avatar: 'S',
    time: '5d ago',
    text: "Hey team, I wanted to discuss the custom UI-kit we're developing for the site redesign. We need to finalize some components and make key design decisions to ensure consistency across the board. Let's make sure we cover colors, typography, buttons, and any other essential UI elements. @UX/UI @Sophia",
    reactions: [{ emoji: '👍', count: 2 }],
  },
  {
    id: '2',
    author: 'Diana T.',
    avatar: 'D',
    time: '2d ago',
    text: "I have already prepared all styles and components according to our standards during the design phase, so the UI kit is 90% complete. All that remains is to add some states to the interactive elements and prepare the Lottie files for animations. @Emily D., please take a look and let me know if you have any questions.",
    embed: { title: 'Conceptzilla website v.3.0', url: 'www.figma.com', linkLabel: 'Quick view' },
    reactions: [],
  },
  {
    id: '3',
    author: 'Daniel A.',
    avatar: 'D',
    time: '3h ago',
    text: 'Okay, keep me updated. @Diana T. I also wanted to remind you to keep the layers organized.',
    reactions: [],
  },
]

const TASK_DETAILS_MESSAGE = {
  id: 'task-details',
  author: 'Task details',
  avatar: 'T',
  time: 'Just now',
  isSystem: true,
  text: 'Current channel tasks: UI-kit design — Finalize components (colors, typography, buttons). Add states to interactive elements. Prepare Lottie animations. Project: Startup Analytics Dashboard · 3,000 DAU target. Decisions: Vite + React frontend; FastAPI + PostgreSQL backend.',
  reactions: [],
}

const AGENT_QUESTION = 'Based on the task and project details above, do you want to prioritize the Lottie animations or the interactive states first? Any specific components you want to align with the design system?'
const AGENT_RESPONSE_PREFIX = 'Based on the task and project details (Startup Analytics Dashboard, UI-kit design, 3,000 DAU): '

export function ChannelThreadPage() {
  const { channelId } = useParams()
  const [messages, setMessages] = useState([...INITIAL_MESSAGES, TASK_DETAILS_MESSAGE])
  const [inputValue, setInputValue] = useState('')
  const [agentQuestionShown, setAgentQuestionShown] = useState(false)
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false)
  const channelLabel = CHANNEL_NAMES[channelId] || `# ${channelId}`

  // After 5 seconds, add agent question
  useEffect(() => {
    if (agentQuestionShown) return
    const t = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: 'agent-q',
          author: 'Agent',
          avatar: 'A',
          time: 'Just now',
          isAgent: true,
          text: AGENT_QUESTION,
          reactions: [],
        },
      ])
      setAgentQuestionShown(true)
    }, 5000)
    return () => clearTimeout(t)
  }, [agentQuestionShown])

  const handleSend = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    const userMsg = {
      id: `user-${Date.now()}`,
      author: 'You',
      avatar: 'Y',
      time: 'Just now',
      text: trimmed,
      reactions: [],
    }
    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    setShowMentionSuggestions(false)

    // Mock agent response after user sends (based on task and project details)
    setTimeout(() => {
      const agentReply = AGENT_RESPONSE_PREFIX + (trimmed.toLowerCase().includes('lottie') || trimmed.toLowerCase().includes('animation')
        ? 'Prioritizing Lottie animations first makes sense for consistency. I recommend preparing 3–5 core animations (loading, success, empty state) and we can align interactive states with the same motion tokens.'
        : trimmed.toLowerCase().includes('state') || trimmed.toLowerCase().includes('interactive')
          ? 'Prioritizing interactive states first will unblock dev handoff. I suggest we define hover, focus, disabled, and loading states for buttons and inputs, then add Lottie for empty and success flows.'
          : 'Got it. I’ll keep the current task order: finish interactive states, then Lottie files. I’ll align with the design system and the Startup Analytics Dashboard scope (3,000 DAU).')
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          author: 'Agent',
          avatar: 'A',
          time: 'Just now',
          isAgent: true,
          text: agentReply,
          reactions: [],
        },
      ])
    }, 1500)
  }

  const handleDiscard = () => {
    setInputValue('')
    setShowMentionSuggestions(false)
  }

  return (
    <Flex direction="column" style={{ height: '100%', minHeight: 0, background: 'var(--color-background)' }}>
      {/* Header */}
      <Flex
        align="center"
        justify="between"
        p="3"
        style={{ borderBottom: '1px solid var(--gray-6)', background: 'var(--color-panel-solid)', flexShrink: 0 }}
      >
        <Text size="2" weight="medium">{channelLabel}</Text>
        <Flex gap="1">
          <IconButton variant="ghost" size="2" radius="full" aria-label="More">
            <DotsHorizontalIcon width="18" height="18" />
          </IconButton>
          <IconButton variant="ghost" size="2" radius="full" aria-label="Star">
            <StarIcon width="18" height="18" />
          </IconButton>
          <IconButton variant="ghost" size="2" radius="full" aria-label="Info">
            <InfoCircledIcon width="18" height="18" />
          </IconButton>
        </Flex>
      </Flex>

      {/* Messages */}
      <ScrollArea type="auto" scrollbars="vertical" style={{ flex: 1, minHeight: 0 }}>
        <Box p="4" style={{ paddingBottom: 24 }}>
          {messages.map((msg) => (
            <Flex key={msg.id} gap="3" mb="4" align="start">
              <Avatar size="2" radius="full" fallback={msg.avatar} style={{ flexShrink: 0 }} />
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Flex align="center" gap="2" mb="1">
                  <Text size="2" weight="medium">{msg.author}</Text>
                  <Text size="1" color="gray">{msg.time}</Text>
                </Flex>
                <Text size="2" style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.isSystem ? msg.text.replace(/\*\*/g, '') : msg.text}
                </Text>
                {msg.embed && (
                  <Card size="1" mt="2" style={{ maxWidth: 400 }}>
                    <Flex align="center" justify="between" gap="2">
                      <Flex direction="column" gap="0">
                        <Text size="2" weight="medium">{msg.embed.title}</Text>
                        <Text size="1" color="gray">{msg.embed.url}</Text>
                      </Flex>
                      <Button size="1" variant="soft">{msg.embed.linkLabel}</Button>
                    </Flex>
                  </Card>
                )}
                {msg.reactions && msg.reactions.length > 0 && (
                  <Flex gap="1" mt="2">
                    {msg.reactions.map((r, i) => (
                      <Flex key={i} align="center" gap="1" style={{ cursor: 'pointer', borderRadius: 4, padding: '2px 6px', background: 'var(--gray-3)' }}>
                        <Text size="1">{r.emoji}</Text>
                        <Text size="1" color="gray">{r.count}</Text>
                      </Flex>
                    ))}
                    <IconButton variant="ghost" size="1" radius="full"><PlusIcon width="12" height="12" /></IconButton>
                  </Flex>
                )}
              </Box>
            </Flex>
          ))}
        </Box>
      </ScrollArea>

      {/* Input area */}
      <Box p="3" style={{ borderTop: '1px solid var(--gray-6)', background: 'var(--color-panel-solid)', flexShrink: 0 }}>
        {showMentionSuggestions && (
          <Card size="1" mb="2" style={{ maxWidth: 280 }}>
            <Text size="1" weight="medium" mb="2" style={{ display: 'block' }}>Members</Text>
            <Flex direction="column" gap="1">
              <Flex align="center" gap="2" py="1" style={{ cursor: 'pointer', borderRadius: 4 }}>
                <Avatar size="1" radius="full" fallback="D" />
                <Text size="2">Diana Taylor</Text>
              </Flex>
              <Flex align="center" gap="2" py="1" style={{ cursor: 'pointer', borderRadius: 4 }}>
                <Avatar size="1" radius="full" fallback="DA" />
                <Text size="2">Daniel Anderson</Text>
              </Flex>
            </Flex>
          </Card>
        )}
        <TextArea
          placeholder="Type a message... Use @ to mention"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setShowMentionSuggestions(e.target.value.includes('@'))
          }}
          rows={3}
          style={{ minHeight: 72, marginBottom: 8 }}
        />
        <Flex align="center" justify="between" gap="2">
          <Flex gap="1">
            <IconButton variant="ghost" size="2" radius="full" aria-label="Star"><StarIcon width="16" height="16" /></IconButton>
            <IconButton variant="ghost" size="2" radius="full" aria-label="Mention">@</IconButton>
            <IconButton variant="ghost" size="2" radius="full" aria-label="Attach">📎</IconButton>
            <IconButton variant="ghost" size="2" radius="full" aria-label="Emoji">😊</IconButton>
            <IconButton variant="ghost" size="2" radius="full" aria-label="Voice">🎤</IconButton>
          </Flex>
          <Flex gap="2">
            <Button variant="soft" color="gray" size="2" onClick={handleDiscard}>
              <Cross2Icon width="14" height="14" /> Discard
            </Button>
            <Button size="2" onClick={handleSend} disabled={!inputValue.trim()}>
              <PaperPlaneIcon width="14" height="14" /> Send
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Flex>
  )
}
