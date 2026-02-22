import { Box, Card, Flex, Heading, Text } from '@radix-ui/themes'

export function ProjectLogsPage() {
  return (
    <Box p="6">
      <Flex direction="column" gap="4">
        <Heading size="6">Logs</Heading>
        <Card size="2" variant="surface">
          <Text size="2" color="gray">
            Project activity logs will appear here.
          </Text>
        </Card>
      </Flex>
    </Box>
  )
}

