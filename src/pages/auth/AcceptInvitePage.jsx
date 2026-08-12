import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Button, Flex, Text, TextField, IconButton } from '@radix-ui/themes'
import { EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons'

import { AuthShell } from '../../components/auth/AuthShell'
import { acceptOrgInvite } from '../../services/orgApi'
import { useAuth } from '../../auth/AuthContext'
import { useToast } from '../../components/Toast'

export function AcceptInvitePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { markAuthenticated } = useAuth()
  const toast = useToast()

  const token = useMemo(() => params.get('token') || '', [params])

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!token) {
      toast.error('Missing invite token', 'Please open the invite link again.')
      return
    }
    setLoading(true)
    try {
      const response = await acceptOrgInvite({ token, password: password.trim() || null })
      if (response?.access_token) {
        await markAuthenticated(response.access_token)
      }
      toast.success('Invite accepted', 'Welcome to your team!')
      navigate('/organizations')
    } catch (err) {
      toast.error('Unable to accept invite', err instanceof Error ? err.message : 'Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Accept invite" subtitle="Join your team on DecisionVault">
      <form onSubmit={onSubmit}>
        <Flex direction="column" gap="3">
          {!token ? (
            <Text size="2" color="red">
              Missing invite token. Please open the invite link again.
            </Text>
          ) : (
            <Text size="2" color="gray">
              Set a password (required only if this is a new account).
            </Text>
          )}

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
              disabled={!token}
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

          <Button size="3" style={{ width: '100%' }} disabled={loading || !token}>
            {loading ? 'Accepting...' : 'Accept invite'}
          </Button>
        </Flex>
      </form>

      <Box mt="4">
        <Text size="1" color="gray">
          Already have an account? You can accept the invite after signing in too.
        </Text>
      </Box>
    </AuthShell>
  )
}

