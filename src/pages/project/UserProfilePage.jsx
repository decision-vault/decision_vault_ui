import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes'
import { useAuth } from '../../auth/AuthContext'

export function UserProfilePage() {
  const { sessionUser, refreshSession, signOut } = useAuth()

  return (
    <Box p="4" style={{ maxWidth: 720 }}>
      <Flex direction="column" gap="4">
        <Heading size="6">Profile</Heading>

        <Card size="3">
          <Flex direction="column" gap="2">
            <Text size="2" color="gray">
              Signed in as
            </Text>
            <Text size="4" weight="medium">
              {sessionUser?.email || 'Unknown'}
            </Text>

            <Box mt="3">
              <Flex direction="column" gap="1">
                <Text size="2" color="gray">
                  Role
                </Text>
                <Text size="2">{sessionUser?.role || 'unknown'}</Text>
              </Flex>
            </Box>

            <Box mt="3">
              <Flex direction="column" gap="1">
                <Text size="2" color="gray">
                  Organization
                </Text>
                <Text size="2">{sessionUser?.tenant_name || 'unknown'}</Text>
              </Flex>
            </Box>

            <Box mt="3">
              <Flex direction="column" gap="1">
                <Text size="2" color="gray">
                  IDs
                </Text>
                <Text size="2">User: {sessionUser?.user_id || 'unknown'}</Text>
                <Text size="2">Org: {sessionUser?.tenant_id || 'unknown'}</Text>
              </Flex>
            </Box>

            <Flex gap="2" mt="4" wrap="wrap">
              <Button variant="soft" onClick={() => void refreshSession()}>
                Refresh session
              </Button>
              <Button color="red" variant="soft" onClick={() => void signOut()}>
                Logout
              </Button>
            </Flex>
          </Flex>
        </Card>
      </Flex>
    </Box>
  )
}

