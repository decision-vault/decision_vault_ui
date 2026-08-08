import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Flex,
  Separator,
  Text,
  TextField,
  Link as RadixLink,
  IconButton,
} from '@radix-ui/themes'
import { EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons'

import { AuthShell } from '../../components/auth/AuthShell'
import { login } from '../../services/authApi'
import { useAuth } from '../../auth/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { markAuthenticated } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [tenantSlug, setTenantSlug] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await login({
        tenant_slug: tenantSlug.trim() || '',
        email,
        password,
      })
      markAuthenticated(response.access_token)
      navigate('/dashboard/discovery')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to DecisionVault">
      <form onSubmit={onSubmit}>
        <Flex direction="column" gap="3">
          <Flex direction="column" gap="1">
            <Text as="label" size="2" weight="medium">
              Workspace slug (optional)
            </Text>
            <TextField.Root
              value={tenantSlug}
              onChange={(event) => setTenantSlug(event.target.value)}
              placeholder="acme-fintech"
              size="3"
              variant="surface"
            />
          </Flex>

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

          <Flex direction="column" gap="1">
            <Flex justify="between" align="center">
              <Text as="label" size="2" weight="medium">
                Password
              </Text>
              <RadixLink asChild size="1" color="gray">
                <Link to="/forgot-password">Forgot password?</Link>
              </RadixLink>
            </Flex>

            <TextField.Root
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              size="3"
              variant="surface"
              required
            >
              <TextField.Slot side="right">
                <IconButton
                  variant="ghost"
                  size="1"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeClosedIcon width="16" height="16" /> : <EyeOpenIcon width="16" height="16" />}
                </IconButton>
              </TextField.Slot>
            </TextField.Root>
          </Flex>

          {error ? (
            <Text size="2" color="red">
              {error}
            </Text>
          ) : null}

          <Button size="3" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </Flex>
      </form>

      <Flex align="center" gap="3" mt="4">
        <Separator size="4" />
        <Text size="1" color="gray">
          New to DecisionVault?
        </Text>
        <Separator size="4" />
      </Flex>

      <Box mt="3">
        <Text size="2" color="gray">
          Don&apos;t have an account?{' '}
          <RadixLink asChild>
            <Link to="/signup">Create one</Link>
          </RadixLink>
        </Text>
      </Box>

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
