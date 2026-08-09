import { Box, Flex, Text, Heading, Card, Button, Badge, Separator, ScrollArea, Avatar } from '@radix-ui/themes'
import { User, Building2, Hash, RefreshCw, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'

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

  const email = sessionUser?.email || 'unknown'
  const initials = email
    .split('@')[0]
    .split(/[._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map(x => x[0]?.toUpperCase())
    .join('') || 'DV'

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
        <Box p="6" style={{ maxWidth: 680 }}>
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
                <Box>
                  <Heading size="4" style={{ letterSpacing: '-0.3px' }}>{email.split('@')[0]}</Heading>
                  <Text size="2" color="gray">{email}</Text>
                  <Flex align="center" gap="2" mt="1">
                    <Badge size="1" color="blue" variant="soft" style={{ textTransform: 'capitalize' }}>
                      {sessionUser?.role || 'member'}
                    </Badge>
                    <Badge size="1" color="blue" variant="soft">Active</Badge>
                  </Flex>
                </Box>
              </Flex>

              <Separator size="4" />

              <Flex direction="column" mt="3">
                <InfoRow icon={User}      label="Email"        value={email} />
                <InfoRow icon={Shield}    label="Role"         value={sessionUser?.role || 'unknown'} />
                <InfoRow icon={Building2} label="Organization" value={sessionUser?.tenant_name || 'unknown'} />
                <InfoRow icon={Hash}      label="User ID"      value={sessionUser?.user_id || 'N/A'} />
                <InfoRow icon={Hash}      label="Tenant ID"    value={sessionUser?.tenant_id || 'N/A'} />
                {/* Remove bottom border on last row */}
                <Box style={{ borderBottom: 'none' }} />
              </Flex>
            </Card>

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
        </Box>
      </ScrollArea>
    </Box>
  )
}
