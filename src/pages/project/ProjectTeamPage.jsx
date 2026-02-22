import { Box, Card, Flex, Heading, Text, Avatar, Button } from '@radix-ui/themes'

const MEMBERS = [
  { id: '1', name: 'Owner User', email: 'owner@example.com', role: 'owner' },
]

export function ProjectTeamPage() {
  return (
    <Box p="6">
      <Flex direction="column" gap="4">
        <Heading size="6">Team</Heading>
        <Text size="2" color="gray">
          Manage project members and roles.
        </Text>
        <Card size="2" variant="surface">
          <Flex direction="column" gap="3">
            {MEMBERS.map((member) => (
              <Flex key={member.id} align="center" justify="between">
                <Flex align="center" gap="2">
                  <Avatar size="2" radius="full" fallback={member.name.slice(0, 2).toUpperCase()} />
                  <Flex direction="column" gap="0">
                    <Text size="2" weight="medium">{member.name}</Text>
                    <Text size="1" color="gray">{member.email}</Text>
                  </Flex>
                </Flex>
                <Text size="1" color="gray">{member.role}</Text>
              </Flex>
            ))}
            <Box>
              <Button size="2">Invite member</Button>
            </Box>
          </Flex>
        </Card>
      </Flex>
    </Box>
  )
}

