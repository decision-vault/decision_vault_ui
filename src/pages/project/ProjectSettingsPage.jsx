import { Box, Card, Flex, Heading, Text, TextField, Button } from '@radix-ui/themes'

export function ProjectSettingsPage() {
  return (
    <Box p="6">
      <Flex direction="column" gap="4">
        <Heading size="6">Project Settings</Heading>
        <Text size="2" color="gray">
          Update project metadata and operational settings.
        </Text>
        <Card size="2" variant="surface">
          <Flex direction="column" gap="3">
            <Flex direction="column" gap="1">
              <Text size="2" weight="medium">Project name</Text>
              <TextField.Root size="2" placeholder="Project name" />
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="2" weight="medium">Description</Text>
              <TextField.Root size="2" placeholder="Describe your project" />
            </Flex>
            <Box>
              <Button size="2">Save changes</Button>
            </Box>
          </Flex>
        </Card>
      </Flex>
    </Box>
  )
}

