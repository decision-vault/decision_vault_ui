import { Link } from 'react-router-dom'
import { Box, Button, Flex, Text, TextField, Link as RadixLink } from '@radix-ui/themes'
import { AuthShell } from '../../components/auth/AuthShell'

export function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset your password" subtitle="We’ll email you a reset link">
      <Flex direction="column" gap="3">
        <Flex direction="column" gap="1">
          <Text as="label" size="2" weight="medium">
            Email
          </Text>
          <TextField.Root type="email" placeholder="you@example.com" size="3" variant="surface" />
        </Flex>

        <Button size="3" style={{ width: '100%' }}>
          Send reset link
        </Button>

        <Box>
          <Text size="2" color="gray">
            Remembered your password?{' '}
            <RadixLink asChild>
              <Link to="/login">Sign in</Link>
            </RadixLink>
          </Text>
        </Box>
      </Flex>

      <Box mt="4">
        <Text size="1" color="gray">
          By continuing, you agree to DecisionVault&apos;s{' '}
          <RadixLink asChild>
            <Link to="/terms">Terms of Service</Link>
          </RadixLink>{' '}
          and{' '}
          <RadixLink asChild>
            <Link to="/privacy">Privacy Policy</Link>
          </RadixLink>
          .
        </Text>
      </Box>
    </AuthShell>
  )
}
