import { useNavigate } from 'react-router-dom'
import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes'

export function OrgPlansPage() {
  const navigate = useNavigate()

  return (
    <Box p="6">
      <Flex direction="column" gap="5">
        <Heading size="6">Organization Management</Heading>

        <Text size="2" color="gray">
          DecisionVault currently allows organization creation and management without subscription plans.
        </Text>

        <Card size="2" variant="surface">
          <Flex direction="column" gap="3">
            <Heading size="4">Organization Workspace</Heading>

            <Text size="2" color="gray">
              Create organizations, manage projects, invite team members, and collaborate on requirements,
              PRDs, architecture, tasks, and decisions.
            </Text>

            <Button
              size="2"
              onClick={() => navigate('/organizations/new')}
            >
              Create Organization
            </Button>
          </Flex>
        </Card>

        <Box>
          <Button
            variant="soft"
            color="gray"
            size="2"
            onClick={() => navigate('/organizations')}
          >
            Back to Organizations
          </Button>
        </Box>
      </Flex>
    </Box>
  )
}