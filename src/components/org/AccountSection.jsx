import { useState } from 'react'
import {
  Box,
  Flex,
  Text,
  Card,
  TextField,
  Button,
  Badge,
  Spinner,
  Grid,
  Separator,
} from '@radix-ui/themes'
import {
  Save,
  Check,
  KeyRound,
  User,
  Shield,
  Building2,
  Hash,
  Mail,
  Clock,
  Globe,
  RefreshCw,
} from 'lucide-react'
import { useToast } from '../Toast'
import { useAccount } from '../../hooks/useAccount'
import { updateAccount, changeAccountPassword } from '../../services/accountApi'

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function Row({ icon: Icon, label, children }) {
  return (
    <Grid
      columns={{ initial: '1', sm: '200px 1fr' }}
      gap="4"
      py="3"
      style={{ borderBottom: '1px solid var(--gray-3)', alignItems: 'center' }}
    >
      <Flex align="center" gap="2">
        {Icon && <Icon size={13} color="var(--gray-9)" />}
        <Text size="2" color="gray">
          {label}
        </Text>
      </Flex>
      <Box>{children}</Box>
    </Grid>
  )
}

export default function AccountSection() {
  const toast = useToast()
  const { account, isLoading, error, reload } = useAccount()

  const [fullName, setFullName] = useState('')
  const [isSavingName, setIsSavingName] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  async function handleSaveName() {
    const trimmed = fullName.trim()
    if (!trimmed || trimmed === account?.full_name) return
    setIsSavingName(true)
    try {
      const updated = await updateAccount({ full_name: trimmed })
      await reload()
      setFullName(updated?.full_name || trimmed)
      setNameSaved(true)
      setTimeout(() => setNameSaved(false), 2000)
      toast.success('Account updated', 'Your display name has been saved.')
    } catch (err) {
      toast.error('Failed to update account', err instanceof Error ? err.message : undefined)
    } finally {
      setIsSavingName(false)
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match', 'Your new password and confirmation must match.')
      return
    }
    setIsSavingPassword(true)
    try {
      await changeAccountPassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password changed', 'Your password has been updated.')
    } catch (err) {
      toast.error('Failed to change password', err instanceof Error ? err.message : undefined)
    } finally {
      setIsSavingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <Box p="6">
        <Flex justify="center" p="8">
          <Spinner />
        </Flex>
      </Box>
    )
  }

  if (error || !account) {
    return (
      <Card variant="surface" size="2">
        <Flex align="center" justify="between" gap="3" wrap="wrap">
          <Text size="2" color="gray">
            {error || 'Unable to load account details.'}
          </Text>
          <Button size="2" variant="soft" color="gray" onClick={() => void reload()}>
            <RefreshCw size={13} /> Retry
          </Button>
        </Flex>
      </Card>
    )
  }

  const isPasswordAuth = account.provider === 'password'

  return (
    <>
      <Card size="2" style={{ background: 'var(--color-panel-solid)' }}>
        <Flex align="center" gap="2" px="1" pt="2">
          <User size={14} color="var(--gray-9)" />
          <Text size="2" weight="bold">
            Profile
          </Text>
        </Flex>
        <Box px="1" pb="2">
          <Row icon={User} label="Display name">
            <Flex gap="2" wrap="wrap">
              <TextField.Root
                value={fullName || account.full_name || ''}
                onChange={(event) => setFullName(event.target.value)}
                size="2"
                placeholder="Your full name"
                style={{ flex: 1, minWidth: 200 }}
              />
              <Button
                size="2"
                variant="soft"
                color="gray"
                onClick={handleSaveName}
                disabled={!fullName.trim() || fullName.trim() === account.full_name || isSavingName}
                style={{ gap: 5, flexShrink: 0 }}
              >
                {nameSaved ? <Check size={13} /> : <Save size={13} />}
                {nameSaved ? 'Saved' : isSavingName ? 'Saving…' : 'Save'}
              </Button>
            </Flex>
          </Row>
          <Row icon={Mail} label="Email">
            <Text size="2" weight="medium" style={{ color: 'var(--gray-12)' }}>
              {account.email}
            </Text>
          </Row>
          <Row icon={Shield} label="Role">
            <Badge size="1" color="blue" variant="soft" style={{ textTransform: 'capitalize' }}>
              {account.role}
            </Badge>
          </Row>
          <Row icon={Globe} label="Provider">
            <Text size="2" style={{ textTransform: 'capitalize' }}>
              {account.provider}
            </Text>
          </Row>
          <Row icon={Check} label="Status">
            <Badge size="1" color={account.is_active ? 'green' : 'red'} variant="soft">
              {account.is_active ? 'Active' : 'Deactivated'}
            </Badge>
          </Row>
          <Row icon={Hash} label="User ID">
            <Text size="1" style={{ fontFamily: 'monospace' }}>
              {account.id}
            </Text>
          </Row>
          <Row icon={Building2} label="Organization">
            <Text size="2" weight="medium" style={{ color: 'var(--gray-12)' }}>
              {account.tenant_name || '—'}
            </Text>
          </Row>
          <Row icon={Hash} label="Tenant ID">
            <Text size="1" style={{ fontFamily: 'monospace' }}>
              {account.tenant_id || '—'}
            </Text>
          </Row>
          <Row icon={Clock} label="Created">
            <Text size="2" color="gray">
              {formatDate(account.created_at)}
            </Text>
          </Row>
          <Box style={{ borderBottom: 'none' }}>
            <Row icon={Clock} label="Last login">
              <Text size="2" color="gray">
                {formatDate(account.last_login_at)}
              </Text>
            </Row>
          </Box>
        </Box>
      </Card>

      {isPasswordAuth && (
        <>
          <Separator size="4" my="6" />
          <Flex align="center" gap="2" mb="2">
            <KeyRound size={14} color="var(--gray-9)" />
            <Text size="2" weight="bold">
              Change password
            </Text>
          </Flex>
          <Text size="2" color="gray" mb="3">
            Update the password used to sign in to this account.
          </Text>
          <Card size="2" style={{ background: 'var(--color-panel-solid)' }}>
            <Box px="1" py="2">
              <form onSubmit={handleChangePassword}>
                <Row icon={KeyRound} label="Current password">
                  <TextField.Root
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    size="2"
                    placeholder="Current password"
                  />
                </Row>
                <Row icon={KeyRound} label="New password">
                  <TextField.Root
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    size="2"
                    placeholder="At least 8 characters"
                  />
                </Row>
                <Row icon={KeyRound} label="Confirm password">
                  <TextField.Root
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    size="2"
                    placeholder="Repeat new password"
                  />
                </Row>
                <Flex justify="end" pt="3">
                  <Button
                    size="2"
                    variant="solid"
                    type="submit"
                    disabled={!currentPassword || !newPassword || !confirmPassword || isSavingPassword}
                    style={{ gap: 6 }}
                  >
                    {isSavingPassword ? <Spinner size="1" /> : <KeyRound size={13} />}
                    {isSavingPassword ? 'Updating…' : 'Change password'}
                  </Button>
                </Flex>
              </form>
            </Box>
          </Card>
        </>
      )}
    </>
  )
}
