import { Box, Card, Flex, Heading, Text } from '@radix-ui/themes'
import { ChatBubbleIcon } from '@radix-ui/react-icons'

export function MessengerPage() {
  return (
    <Box p="5">
      <Card size="3" style={{ maxWidth: 760 }}>
        <Flex direction="column" gap="3">
          <Flex align="center" gap="2">
            <ChatBubbleIcon width="18" height="18" />
            <Heading size="5">Messenger</Heading>
          </Flex>
          <Text size="3" color="gray">
            Select a channel from the left panel or create a new channel/thread using the plus buttons.
          </Text>
        </Flex>
      </Card>
    </Box>
  )
}
