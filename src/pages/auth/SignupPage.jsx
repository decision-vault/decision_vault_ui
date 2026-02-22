import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Box, Button, Flex, Text, TextField, Link as RadixLink, IconButton } from '@radix-ui/themes'
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons'

import { AuthShell } from '../../components/auth/AuthShell'
import { signup } from '../../services/authApi'
import { useAuth } from '../../auth/AuthContext'

export function SignupPage() {
  const navigate = useNavigate()
  const { markAuthenticated } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [tenantName, setTenantName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Password and confirmation must match.')
      return
    }

    setLoading(true)
    try {
      const response = await signup({
        tenant_name: tenantName,
        email,
        password,
      })
      markAuthenticated(response.access_token)
      navigate('/organizations')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Create your workspace" subtitle="Start with DecisionVault">
      <form onSubmit={onSubmit}>
        <Flex direction="column" gap="3">
          <Flex direction="column" gap="1">
            <Text as="label" size="2" weight="medium">
              Workspace name
            </Text>
            <TextField.Root
              value={tenantName}
              onChange={(event) => setTenantName(event.target.value)}
              placeholder="DecisionVault Team"
              size="3"
              variant="surface"
              required
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
            <Text as="label" size="2" weight="medium">
              Password
            </Text>
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

          <Flex direction="column" gap="1">
            <Text as="label" size="2" weight="medium">
              Confirm password
            </Text>
            <TextField.Root
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="••••••••"
              size="3"
              variant="surface"
              required
            >
              <TextField.Slot side="right">
                <IconButton
                  variant="ghost"
                  size="1"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  aria-label={showConfirm ? 'Hide password confirmation' : 'Show password confirmation'}
                >
                  {showConfirm ? <EyeClosedIcon width="16" height="16" /> : <EyeOpenIcon width="16" height="16" />}
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
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </Flex>
      </form>

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
