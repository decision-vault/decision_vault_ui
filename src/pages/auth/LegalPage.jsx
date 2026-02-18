import { Link } from 'react-router-dom'
import { Box, Button, Card, Flex, Heading, Text, Link as RadixLink } from '@radix-ui/themes'
import { AuthShell } from '../../components/auth/AuthShell'

export function LegalPage({ title, body }) {
  return (
    <AuthShell title={title} subtitle="Placeholder content">
      <Card variant="surface" size="3">
        <Flex direction="column" gap="3">
          <Heading size="4">{title}</Heading>
          <Text size="2" color="gray">
            {body}
          </Text>
          <Box>
            <RadixLink asChild>
              <Link to="/login">
                <Button variant="surface">Back to login</Button>
              </Link>
            </RadixLink>
          </Box>
        </Flex>
      </Card>
    </AuthShell>
  )
}
