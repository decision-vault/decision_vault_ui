import { useState } from 'react'
import { Box, Flex, Text, Heading, Card, Button, Badge, Separator, ScrollArea, Avatar, TextField, Spinner } from '@radix-ui/themes'
import { User, Building2, Hash, RefreshCw, LogOut, Shield, Save, Check, KeyRound, Globe, Clock } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { useAccount } from '../../hooks/useAccount'
import { updateAccount, changeAccountPassword } from '../../services/accountApi'
import { useToast } from '../../components/Toast'

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

function InfoRow({ label, value, icon: Icon }) {
  return (
    <Flex align="center" justify="between" py="3" style={{ borderBottom: '1px solid var(--gray-4)' }}>
      <Flex align="center" gap="2">
        {Icon && <Icon size={13} color="var(--gray-9)" />}
        <Text size="2" color="gray">{label}</Text>
      </Flex>
      <Text size="2" weight="medium" style={{ color: 'var(--gray-12)', maxWidth: 260, textAlign: 'right', wordBreak: 'break-all' }}>
        {value}
      </Text>
    </Flex>
  )
}

export function UserProfilePage() {
  const { sessionUser, refreshSession, signOut } = useAuth()
  const toast = useToast()
  const { account, isLoading, reload } = useAccount()

  const [fullName, setFullName] = useState('')
  const [isSavingName, setIsSavingName] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const email = account?.email || sessionUser?.email || 'unknown'
  const initials = email
    .split('@')[0]
    .split(/[._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map(x => x[0]?.toUpperCase())
    .join('') || 'DV'

  const displayName = account?.full_name || email.split('@')[0]
  const isPasswordAuth = account?.provider === 'password'

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

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <Flex
        align="center" justify="between" px="6"
        style={{
          borderBottom: '1px solid var(--gray-4)',
          background: 'var(--color-panel-solid)',
          flexShrink: 0,
          height: 41,
        }}
      >
        <Flex align="center" gap="2">
          <User size={14} color="var(--gray-9)" />
          <Text size="2" color="gray">Account</Text>
          <Text size="2" color="gray">/</Text>
          <Text size="3" weight="medium">Profile</Text>
        </Flex>
        <Button
          size="1" variant="soft" color="gray"
          onClick={() => void refreshSession()}
          style={{ cursor: 'pointer', gap: 5 }}
        >
          <RefreshCw size={11} /> Refresh session
        </Button>
      </Flex>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <ScrollArea style={{ flex: 1 }}>
        <Box p="6" style={{ maxWidth: 680, margin: '0 auto' }}>
          {isLoading ? (
            <Flex justify="center" p="8">
              <Spinner />
            </Flex>
          ) : (
            <Flex direction="column" gap="5">

              {/* ── Identity Card ──────────────────────────────────────────── */}
              <Card size="3" style={{ background: 'var(--color-panel-solid)' }}>
                <Flex align="center" gap="4" mb="4">
                  <Avatar
                    size="5"
                    radius="full"
                    fallback={initials}
                    style={{ background: 'var(--accent-3)', color: 'var(--accent-11)', fontWeight: 700 }}
                  />
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Heading size="4" style={{ letterSpacing: '-0.3px' }}>{displayName}</Heading>
                    <Text size="2" color="gray">{email}</Text>
                    <Flex align="center" gap="2" mt="1" wrap="wrap">
                      <Badge size="1" color="blue" variant="soft" style={{ textTransform: 'capitalize' }}>
                        {account?.role || 'member'}
                      </Badge>
                      <Badge size="1" color="blue" variant="soft" style={{ textTransform: 'capitalize' }}>
                        {account?.provider || '—'}
                      </Badge>
                      <Badge size="1" color={account?.is_active ? 'green' : 'red'} variant="soft">
                        {account?.is_active ? 'Active' : 'Deactivated'}
                      </Badge>
                    </Flex>
                  </Box>
                </Flex>

                <Separator size="4" />

                <Flex direction="column" mt="3">
                  <Flex align="center" justify="between" py="3" style={{ borderBottom: '1px solid var(--gray-4)' }}>
                    <Flex align="center" gap="2">
                      <User size={13} color="var(--gray-9)" />
                      <Text size="2" color="gray">Display name</Text>
                    </Flex>
                    <Flex gap="2" align="center">
                      <TextField.Root
                        size="2"
                        value={fullName || account?.full_name || ''}
                        onChange={(event) => setFullName(event.target.value)}
                        placeholder="Your full name"
                        style={{ minWidth: 200 }}
                      />
                      <Button
                        size="2" variant="soft" color="gray"
                        onClick={handleSaveName}
                        disabled={!fullName.trim() || fullName.trim() === account?.full_name || isSavingName}
                        style={{ gap: 5, flexShrink: 0 }}
                      >
                        {nameSaved ? <Check size={13} /> : <Save size={13} />}
                        {nameSaved ? 'Saved' : isSavingName ? 'Saving…' : 'Save'}
                      </Button>
                    </Flex>
                  </Flex>
                  <InfoRow icon={Shield}    label="Role"         value={account?.role || 'unknown'} />
                  <InfoRow icon={Building2} label="Organization" value={account?.tenant_name || 'unknown'} />
                  <InfoRow icon={Hash}      label="User ID"      value={account?.id || 'N/A'} />
                  <InfoRow icon={Hash}      label="Tenant ID"    value={account?.tenant_id || 'N/A'} />
                  <InfoRow icon={Clock}     label="Created"      value={formatDate(account?.created_at)} />
                  <Box style={{ borderBottom: 'none' }}>
                    <InfoRow icon={Clock} label="Last login" value={formatDate(account?.last_login_at)} />
                  </Box>
                </Flex>
              </Card>

              {/* ── Change Password ───────────────────────────────────────── */}
              {isPasswordAuth && (
                <Card size="2" style={{ background: 'var(--color-panel-solid)' }}>
                  <Flex align="center" gap="2" mb="1">
                    <KeyRound size={14} color="var(--gray-9)" />
                    <Heading size="3">Change password</Heading>
                  </Flex>
                  <Text size="2" color="gray" mb="3">
                    Update the password used to sign in to this account.
                  </Text>
                  <form onSubmit={handleChangePassword}>
                    <Flex direction="column" gap="3">
                      <TextField.Root
                        size="2" type="password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        placeholder="Current password"
                      />
                      <TextField.Root
                        size="2" type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        placeholder="New password (at least 8 characters)"
                      />
                      <TextField.Root
                        size="2" type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Confirm new password"
                      />
                      <Flex justify="end">
                        <Button
                          size="2" variant="solid" type="submit"
                          disabled={!currentPassword || !newPassword || !confirmPassword || isSavingPassword}
                          style={{ gap: 6 }}
                        >
                          {isSavingPassword ? <Spinner size="1" /> : <KeyRound size={13} />}
                          {isSavingPassword ? 'Updating…' : 'Change password'}
                        </Button>
                      </Flex>
                    </Flex>
                  </form>
                </Card>
              )}

              {/* ── Danger Zone ────────────────────────────────────────────── */}
              <Card variant="ghost" size="2" style={{ border: '1px solid var(--red-5)', background: 'var(--red-1)' }}>
                <Flex align="center" justify="between">
                  <Box>
                    <Text size="2" weight="bold" color="red">Danger Zone</Text>
                    <Text size="1" color="gray" style={{ display: 'block', marginTop: 2 }}>
                      Signing out will end your current session.
                    </Text>
                  </Box>
                  <Button
                    variant="soft" color="red" size="2"
                    onClick={() => void signOut()}
                    style={{ cursor: 'pointer', gap: 6 }}
                  >
                    <LogOut size={13} /> Sign out
                  </Button>
                </Flex>
              </Card>

            </Flex>
          )}
        </Box>
      </ScrollArea>
    </Box>
  )
}
