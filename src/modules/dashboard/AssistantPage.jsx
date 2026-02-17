import { Card, Flex, Heading, Text } from '@radix-ui/themes'

export function AssistantPage() {
  return (
    <Card className="panel thread-col" size="1">
      <Flex direction="column" gap="3" p="5">
        <Heading size="7">Assistant</Heading>
        <Text color="gray" size="3">
          Assistant page is using the same dashboard layout shell. Add your assistant widgets here.
        </Text>
      </Flex>
    </Card>
  )
}
