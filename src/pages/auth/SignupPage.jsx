import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Box, Button, Flex, Separator, Text, TextField, Link as RadixLink, IconButton } from '@radix-ui/themes'
import { EyeClosedIcon, EyeOpenIcon, GitHubLogoIcon, LockClosedIcon } from '@radix-ui/react-icons'
import { AuthShell } from '../../components/auth/AuthShell'

export function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <AuthShell title="Create an account" subtitle="Start building with Supabase">
      <Flex direction="column" gap="3">
        <Button variant="surface" size="3" style={{ width: '100%' }}>
          <Flex align="center" gap="2" style={{ flex: 1 }}>
            <GitHubLogoIcon width="18" height="18" />
            Continue with GitHub
          </Flex>
          <Badge size="1" color="green">
            LAST USED
          </Badge>
        </Button>
        <Button variant="surface" size="3" style={{ width: '100%' }}>
          <LockClosedIcon width="18" height="18" />
          Continue with SSO
        </Button>
      </Flex>

      <Flex align="center" gap="3" mt="3">
        <Separator size="4" />
        <Text size="1" color="gray">
          or
        </Text>
        <Separator size="4" />
      </Flex>

      <Flex direction="column" gap="3" mt="3">
        <Flex direction="column" gap="1">
          <Text as="label" size="2" weight="medium">
            Email
          </Text>
          <TextField.Root type="email" placeholder="you@example.com" size="3" variant="surface" />
        </Flex>

        <Flex direction="column" gap="1">
          <Text as="label" size="2" weight="medium">
            Password
          </Text>
          <TextField.Root
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            size="3"
            variant="surface"
          >
            <TextField.Slot side="right">
              <IconButton
                variant="ghost"
                size="1"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeClosedIcon width="16" height="16" /> : <EyeOpenIcon width="16" height="16" />}
              </IconButton>
            </TextField.Slot>
          </TextField.Root>
        </Flex>

        <Flex direction="column" gap="1">
          <Text as="label" size="2" weight="medium">
            Confirm password
          </Text>
          <TextField.Root
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            size="3"
            variant="surface"
          >
            <TextField.Slot side="right">
              <IconButton
                variant="ghost"
                size="1"
                onClick={() => setShowConfirm((p) => !p)}
                aria-label={showConfirm ? 'Hide password confirmation' : 'Show password confirmation'}
              >
                {showConfirm ? <EyeClosedIcon width="16" height="16" /> : <EyeOpenIcon width="16" height="16" />}
              </IconButton>
            </TextField.Slot>
          </TextField.Root>
        </Flex>

        <Button size="3" color="green" style={{ width: '100%' }}>
          Sign up
        </Button>
      </Flex>

      <Box mt="4">
        <Text size="2" color="gray">
          Already have an account?{' '}
          <RadixLink asChild>
            <Link to="/login">Sign in</Link>
          </RadixLink>
        </Text>
      </Box>

      <Box mt="4">
        <Text size="1" color="gray">
          By continuing, you agree to Supabase&apos;s{' '}
          <RadixLink asChild>
            <Link to="/terms">Terms of Service</Link>
          </RadixLink>{' '}
          and{' '}
          <RadixLink asChild>
            <Link to="/privacy">Privacy Policy</Link>
          </RadixLink>
          , and to receive periodic emails with updates.
        </Text>
      </Box>
    </AuthShell>
  )
}
