import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Button, Flex, Text, Spinner } from '@radix-ui/themes'
import { CheckCircle2, XCircle, LogIn } from 'lucide-react'

import { AuthShell } from '../../components/auth/AuthShell'
import { acceptProjectInvite, declineProjectInvite } from '../../services/projectTeamApi'
import { useAuth } from '../../auth/AuthContext'

export default function ProjectInvitePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { isAuthenticated } = useAuth()

  const token = useMemo(() => params.get('token') || '', [params])

  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [accepted, setAccepted] = useState(null)

  useEffect(() => {
    let cancelled = false
    if (!token) {
      setStatus('error')
      setError('Missing invite token. Please open the invite link again.')
      return
    }
    const run = async () => {
      try {
        const result = await acceptProjectInvite(token)
        if (!cancelled) {
          setAccepted(result)
          setStatus('success')
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to accept invitation')
          setStatus('error')
        }
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [token])

  const handleDecline = async () => {
    if (!window.confirm('Decline this project invitation?')) return
    setStatus('loading')
    setError('')
    try {
      await declineProjectInvite(token)
      setStatus('declined')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to decline invitation')
      setStatus('error')
    }
  }

  const goToProject = () => {
    if (accepted) {
      navigate(`/organizations/${accepted.tenant_id}/projects/${accepted.project_id}`)
    }
  }

  return (
    <AuthShell title="Project invitation" subtitle="Join a project on DecisionVault">
      {status === 'loading' && (
        <Flex direction="column" align="center" gap="3" py="4">
          <Spinner size="3" />
          <Text size="2" color="gray">
            Processing invitation...
          </Text>
        </Flex>
      )}

      {status === 'success' && accepted && (
        <Flex direction="column" gap="3">
          <Flex align="center" gap="2">
            <CheckCircle2 size="20" color="var(--green-9)" />
            <Text size="3" weight="bold">
              You're in!
            </Text>
          </Flex>
          <Text size="2" color="gray">
            You joined <strong>{accepted.project_name}</strong> as{' '}
            <strong>{accepted.role}</strong>.
          </Text>
          <Button size="3" style={{ width: '100%' }} onClick={goToProject}>
            Go to project
          </Button>
        </Flex>
      )}

      {status === 'declined' && (
        <Flex direction="column" gap="3">
          <Flex align="center" gap="2">
            <XCircle size="20" color="var(--gray-9)" />
            <Text size="3" weight="bold">
              Invitation declined
            </Text>
          </Flex>
          <Text size="2" color="gray">
            You declined this project invitation.
          </Text>
          <Button size="3" variant="soft" color="gray" style={{ width: '100%' }} onClick={() => navigate('/organizations')}>
            Back to organizations
          </Button>
        </Flex>
      )}

      {status === 'error' && (
        <Flex direction="column" gap="3">
          <Text size="2" color="red">
            {error}
          </Text>
          {!isAuthenticated ? (
            <Flex gap="3">
              <Button size="3" variant="solid" style={{ flex: 1 }} asChild>
                <Link to={`/login?redirect=${encodeURIComponent(`/invite/project?token=${token}`)}`}>
                  <LogIn size={16} />
                  Sign in to accept
                </Link>
              </Button>
            </Flex>
          ) : (
            <Flex gap="3">
              <Button size="3" variant="soft" color="gray" style={{ flex: 1 }} onClick={handleDecline}>
                Decline invitation
              </Button>
            </Flex>
          )}
        </Flex>
      )}

      {status === 'success' && (
        <Box mt="4">
          <Text size="1" color="gray">
            Invitation is for a specific project. You can manage your team from the project&apos;s Team page.
          </Text>
        </Box>
      )}
    </AuthShell>
  )
}
