import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Button, Flex, Text, TextField, Link as RadixLink } from '@radix-ui/themes'
import { AuthShell } from '../../components/auth/AuthShell'
import { useToast } from '../../components/Toast'

export function ForgotPasswordPage() {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const onSubmit = (event) => {
    event.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error('Enter a valid email', 'Please provide the email address for your account.')
      return
    }
    setSent(true)
    toast.success('Reset link sent', `If an account exists for ${trimmed}, a reset link is on its way.`)
  }

  return (
    <AuthShell title="Reset your password" subtitle="We’ll email you a reset link">
      <form onSubmit={onSubmit}>
        <Flex direction="column" gap="3">
          <Flex direction="column" gap="1">
            <Text as="label" size="2" weight="medium">
              Email
            </Text>
            <TextField.Root
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              size="3"
              variant="surface"
              required
            />
          </Flex>

          <Button size="3" style={{ width: '100%' }} type="submit" disabled={sent}>
            {sent ? 'Reset link sent' : 'Send reset link'}
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
      </form>

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
