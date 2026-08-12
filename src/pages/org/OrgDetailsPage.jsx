import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Flex,
  Heading,
  Text,
  TextField,
  Button,
  Card,
  Spinner,
  Badge,
  Separator,
  RadioGroup,
  Switch,
  Select,
  Grid,
  Dialog,
} from '@radix-ui/themes'
import {
  Settings,
  Shield,
  Key,
  FileText,
  Building2,
  Globe,
  AlertTriangle,
  Copy,
  Check,
  Save,
  X,
  User,
} from 'lucide-react'
import {
  getOrganization,
  updateOrganization,
  deleteOrganization,
  restoreOrganization,
} from '../../services/orgApi'
import { useToast } from '../../components/Toast'
import AccountSection from '../../components/org/AccountSection'

const DELETE_GRACE_DAYS = 30

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

function addDays(value, days) {
  const date = new Date(value)
  date.setDate(date.getDate() + days)
  return date
}

function FieldRow({ label, hint, children }) {
  return (
    <Grid
      columns={{ initial: '1', sm: '200px 1fr' }}
      gap="4"
      py="4"
      style={{ borderBottom: '1px solid var(--gray-3)', alignItems: 'start' }}
    >
      <Box>
        <Text size="2" weight="medium" style={{ color: 'var(--gray-12)', display: 'block', marginBottom: 2 }}>
          {label}
        </Text>
        {hint && (
          <Text size="1" color="gray" style={{ lineHeight: 1.5 }}>
            {hint}
          </Text>
        )}
      </Box>
      <Box>{children}</Box>
    </Grid>
  )
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <Box mb="6">
      <Flex align="center" gap="2" mb="1">
        <Icon size={14} color="var(--gray-9)" />
        <Heading size="4">{title}</Heading>
      </Flex>
      {subtitle && (
        <Text size="2" color="gray">
          {subtitle}
        </Text>
      )}
    </Box>
  )
}

function SectionNav({ active, onChange, paused }) {
  const items = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
  ]

  return (
    <Box
      style={{
        width: 200,
        flexShrink: 0,
        borderRight: '1px solid var(--gray-4)',
        background: 'var(--color-panel-background)',
        height: '100%',
      }}
    >
      <Box px="4" py="3" style={{ borderBottom: '1px solid var(--gray-4)' }}>
        <Text size="2" weight="bold" style={{ color: 'var(--gray-12)' }}>
          Settings
        </Text>
      </Box>
      <Flex direction="column" p="2" gap="1">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <Flex
              key={item.id}
              align="center"
              gap="3"
              px="3"
              py="2"
              onClick={() => onChange(item.id)}
              style={{
                borderRadius: 8,
                cursor: paused && item.id !== 'general' && item.id !== 'account' ? 'not-allowed' : 'pointer',
                background: isActive ? 'var(--accent-3)' : 'transparent',
                color: isActive ? 'var(--accent-11)' : 'var(--gray-11)',
                opacity: paused && item.id !== 'general' && item.id !== 'account' ? 0.5 : 1,
                transition: 'background 0.12s ease',
                userSelect: 'none',
              }}
            >
              <Icon size={14} style={{ flexShrink: 0 }} />
              <Text size="2" weight={isActive ? 'bold' : 'medium'}>
                {item.label}
              </Text>
            </Flex>
          )
        })}
      </Flex>
    </Box>
  )
}

export function OrgDetailsPage() {
  const { orgId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [org, setOrg] = useState(null)
  const [name, setName] = useState('')
  const [slugCopied, setSlugCopied] = useState(false)
  const [activeSection, setActiveSection] = useState('general')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const [mfaEnforced, setMfaEnforced] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState('8h')

  const [apiKeys] = useState([
    { id: 1, name: 'Production Key', prefix: 'dv_prod_****', created: '2026-06-01', status: 'active' },
    { id: 2, name: 'Development Key', prefix: 'dv_dev_****', created: '2026-06-15', status: 'active' },
  ])

  const [auditLogs] = useState([
    { action: 'User invited', actor: 'kaviyarasumaran@gmail.com', time: '2 hours ago', type: 'info' },
    { action: 'Settings updated', actor: 'kaviyarasumaran@gmail.com', time: '1 day ago', type: 'info' },
    { action: 'Member role changed', actor: 'kaviyarasumaran@gmail.com', time: '1 week ago', type: 'warning' },
  ])

  const isPaused = Boolean(org?.deleted_at)

  const loadOrg = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getOrganization(orgId)
      setOrg(data)
      setName(data.name || '')
    } catch (err) {
      toast.error('Failed to load organization', err instanceof Error ? err.message : undefined)
    } finally {
      setIsLoading(false)
    }
  }, [orgId, toast])

  useEffect(() => {
    loadOrg()
  }, [loadOrg])

  async function handleSave(event) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setIsSaving(true)
    try {
      const updated = await updateOrganization(orgId, { name: trimmed })
      setOrg(updated)
      setName(updated.name || '')
      toast.success('Organization updated', 'Your organization details have been saved.')
    } catch (err) {
      toast.error('Failed to update organization', err instanceof Error ? err.message : undefined)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const result = await deleteOrganization(orgId)
      setOrg((prev) => ({ ...prev, deleted_at: result?.deleted_at || new Date().toISOString() }))
      setConfirmOpen(false)
      toast.success(
        'Organization deleted',
        `Your organization will be permanently deleted in ${DELETE_GRACE_DAYS} days. You can restore it before then.`
      )
    } catch (err) {
      toast.error('Failed to delete organization', err instanceof Error ? err.message : undefined)
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleRestore() {
    setIsRestoring(true)
    try {
      const restored = await restoreOrganization(orgId)
      setOrg(restored)
      toast.success('Organization restored', 'Your organization is active again.')
    } catch (err) {
      toast.error('Failed to restore organization', err instanceof Error ? err.message : undefined)
    } finally {
      setIsRestoring(false)
    }
  }

  function handleCopySlug() {
    if (!org?.slug) return
    navigator.clipboard.writeText(org.slug)
    setSlugCopied(true)
    setTimeout(() => setSlugCopied(false), 2000)
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

  if (!org) {
    return (
      <Box p="6">
        <Text size="2" color="gray">
          Organization not found.
        </Text>
      </Box>
    )
  }

  const deleteByDate = org.deleted_at ? formatDate(addDays(org.deleted_at, DELETE_GRACE_DAYS)) : null

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {isPaused && (
        <Card
          mx="5"
          mt="5"
          variant="surface"
          size="2"
          style={{ border: '1px solid var(--red-6)', flexShrink: 0 }}
        >
          <Flex align="center" justify="between" gap="3" wrap="wrap">
            <Flex align="center" gap="2">
              <X size={16} style={{ color: 'var(--red-9)' }} />
              <Text size="2" weight="bold">
                This organization is scheduled for deletion on {deleteByDate}
              </Text>
            </Flex>
            <Button size="2" color="green" variant="solid" onClick={handleRestore} disabled={isRestoring}>
              <Check size={16} />
              {isRestoring ? 'Restoring…' : 'Restore organization'}
            </Button>
          </Flex>
        </Card>
      )}

      <Flex style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <SectionNav active={activeSection} onChange={setActiveSection} paused={isPaused} />

        <Box style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <Box px="5" pt="5" pb="6" style={{ maxWidth: 720 }}>
            {activeSection === 'general' && (
              <>
                <SectionHeader
                  icon={Building2}
                  title="Organization Details"
                  subtitle="Basic identity and reference information for your org."
                />

                <Flex align="center" justify="between" mb="4" gap="3">
                  <Flex align="center" gap="2">
                    <Badge color={isPaused ? 'red' : 'green'} variant="soft" size="2">
                      {isPaused ? 'Pending deletion' : 'Active'}
                    </Badge>
                    <Text size="1" color="gray">
                      Created {formatDate(org.created_at)}
                    </Text>
                  </Flex>
                </Flex>

                <Card size="2" style={{ background: 'var(--color-panel-solid)' }}>
                  <Box px="1">
                    <form onSubmit={handleSave}>
                      <FieldRow label="Organization name" hint="Shown across the dashboard and in invitations.">
                        <TextField.Root
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          size="2"
                          placeholder="My Organization"
                          disabled={isPaused || isSaving}
                        />
                      </FieldRow>

                      <FieldRow label="Organization slug" hint="Used in API routes. Cannot be changed.">
                        <Flex gap="2">
                          <TextField.Root value={org.slug || ''} size="2" disabled style={{ flex: 1, opacity: 0.6 }} />
                          <Button variant="soft" color="gray" size="2" onClick={handleCopySlug} style={{ gap: 5, flexShrink: 0 }}>
                            {slugCopied ? <Check size={12} /> : <Copy size={12} />}
                            {slugCopied ? 'Copied' : 'Copy'}
                          </Button>
                        </Flex>
                      </FieldRow>

                      <FieldRow label="Display timezone" hint="Used for log timestamps.">
                        <Select.Root defaultValue="asia_calcutta">
                          <Select.Trigger style={{ width: '100%' }} />
                          <Select.Content>
                            <Select.Item value="asia_calcutta">Asia/Calcutta (UTC+5:30)</Select.Item>
                            <Select.Item value="utc">UTC</Select.Item>
                            <Select.Item value="us_eastern">US/Eastern</Select.Item>
                          </Select.Content>
                        </Select.Root>
                      </FieldRow>

                      <Flex justify="end" gap="2" pt="3">
                        <Button
                          size="2"
                          variant="solid"
                          type="submit"
                          disabled={isPaused || isSaving || !name.trim() || name.trim() === org.name}
                          style={{ gap: 6 }}
                        >
                          {isSaving ? <Spinner size="1" /> : <Save size={13} />}
                          {isSaving ? 'Saving…' : 'Save changes'}
                        </Button>
                      </Flex>
                    </form>
                  </Box>
                </Card>

                <Separator size="4" my="6" />

                <Box>
                  <Flex align="center" gap="2" mb="3">
                    <Globe size={14} color="var(--gray-9)" />
                    <Heading size="4">Data Privacy</Heading>
                  </Flex>
                  <Text size="2" color="gray">
                    Control what data is shared with AI providers.
                  </Text>

                  <Card size="1" mt="3" style={{ background: 'var(--color-panel-solid)' }}>
                    <Box px="1" py="2">
                      <RadioGroup.Root defaultValue="disabled">
                        <Flex direction="column" gap="4" p="3">
                          {[
                            { value: 'disabled', label: 'Disabled', desc: 'No data shared. Responses will be generic.' },
                            { value: 'schema', label: 'Schema Only', desc: 'Share table/column names and relationships only.' },
                            { value: 'logs', label: 'Schema & Logs', desc: 'Share schema and logs (may contain PII).' },
                            { value: 'all', label: 'Schema, Logs & DB Data', desc: 'Full read-only database access for AI analysis.' },
                          ].map((opt) => (
                            <label
                              key={opt.value}
                              style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}
                            >
                              <RadioGroup.Item value={opt.value} style={{ marginTop: 3 }} />
                              <Box>
                                <Text size="2" weight="bold" style={{ display: 'block', marginBottom: 2 }}>
                                  {opt.label}
                                </Text>
                                <Text size="2" color="gray" style={{ lineHeight: 1.55 }}>
                                  {opt.desc}
                                </Text>
                              </Box>
                            </label>
                          ))}
                        </Flex>
                      </RadioGroup.Root>
                    </Box>
                  </Card>
                </Box>

                <Separator size="4" my="6" />

                <Box>
                  <Flex align="center" gap="2" mb="3">
                    <AlertTriangle size={14} color="var(--red-9)" />
                    <Heading size="4" style={{ color: 'var(--red-11)' }}>
                      Danger Zone
                    </Heading>
                  </Flex>
                  <Text size="2" color="gray" mb="3">
                    Deleting your organization pauses it immediately. All members lose access, and after{' '}
                    {DELETE_GRACE_DAYS} days the organization and all of its data (projects, documents, tasks,
                    and members) are permanently erased. You can restore it at any time during the grace period.
                  </Text>
                  <Card variant="ghost" size="1" style={{ border: '1px solid var(--red-5)', background: 'var(--red-1)' }}>
                    <Flex align="center" justify="between" p="4" gap="3" wrap="wrap">
                      <Box>
                        <Text size="2" weight="bold" style={{ display: 'block', color: 'var(--red-12)', marginBottom: 3 }}>
                          Delete this organization
                        </Text>
                        <Text size="2" color="gray">
                          This will remove all projects and data. This action cannot be undone.
                        </Text>
                      </Box>
                      {!isPaused && (
                        <Button
                          color="red"
                          variant="soft"
                          size="2"
                          onClick={() => setConfirmOpen(true)}
                          style={{ flexShrink: 0 }}
                        >
                          <AlertTriangle size={13} /> Delete organization
                        </Button>
                      )}
                    </Flex>
                  </Card>
                </Box>
              </>
            )}

            {activeSection === 'account' && (
              <>
                <SectionHeader
                  icon={User}
                  title="Account Details"
                  subtitle="Your personal profile, security and sign-in information."
                />
                <AccountSection />
              </>
            )}

            {activeSection === 'security' && (
              <>
                <SectionHeader
                  icon={Shield}
                  title="Security Settings"
                  subtitle="Manage authentication requirements for your organization."
                />
                <Card size="2" style={{ background: 'var(--color-panel-solid)' }}>
                  <Box px="1">
                    <FieldRow label="Enforce MFA" hint="Require all members to have multi-factor authentication enabled.">
                      <Flex align="center" gap="3">
                        <Switch checked={mfaEnforced} onCheckedChange={setMfaEnforced} disabled={isPaused} />
                        <Badge size="1" color={mfaEnforced ? 'green' : 'gray'} variant="soft">
                          {mfaEnforced ? 'Enforced' : 'Optional'}
                        </Badge>
                      </Flex>
                    </FieldRow>
                    <FieldRow label="Session timeout" hint="Automatically sign out inactive users.">
                      <Select.Root value={sessionTimeout} onValueChange={setSessionTimeout} disabled={isPaused}>
                        <Select.Trigger style={{ width: 200 }} />
                        <Select.Content>
                          <Select.Item value="1h">1 hour</Select.Item>
                          <Select.Item value="4h">4 hours</Select.Item>
                          <Select.Item value="8h">8 hours</Select.Item>
                          <Select.Item value="24h">24 hours</Select.Item>
                          <Select.Item value="never">Never</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </FieldRow>
                    <FieldRow label="Allowed domains" hint="Restrict sign-ups to specific email domains.">
                      <TextField.Root size="2" placeholder="acme.com, example.org" disabled={isPaused} />
                    </FieldRow>
                  </Box>
                </Card>
              </>
            )}

            {activeSection === 'api-keys' && (
              <>
                <Flex align="center" justify="between" mb="4" gap="3">
                  <SectionHeader icon={Key} title="API Keys" subtitle="Manage API keys for programmatic access to DecisionVault." />
                  <Button size="2" style={{ gap: 6 }} disabled={isPaused}>
                    <Key size={12} /> Generate new key
                  </Button>
                </Flex>

                <Flex direction="column" gap="2">
                  {apiKeys.map((k) => (
                    <Card key={k.id} size="1" style={{ background: 'var(--color-panel-solid)' }}>
                      <Flex align="center" justify="between" p="3" gap="3" wrap="wrap">
                        <Flex align="center" gap="3">
                          <Box
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: 'var(--accent-3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Key size={14} color="var(--accent-11)" />
                          </Box>
                          <Box>
                            <Text size="2" weight="bold" style={{ display: 'block', color: 'var(--gray-12)' }}>
                              {k.name}
                            </Text>
                            <Flex align="center" gap="2" mt="1">
                              <Text size="1" color="gray" style={{ fontFamily: 'monospace', fontSize: 11 }}>
                                {k.prefix}
                              </Text>
                              <Text size="1" color="gray">
                                · Created {k.created}
                              </Text>
                            </Flex>
                          </Box>
                        </Flex>
                        <Flex align="center" gap="2">
                          <Badge size="1" color="blue" variant="soft">
                            {k.status}
                          </Badge>
                          <Button variant="soft" color="gray" size="1" disabled={isPaused}>
                            Revoke
                          </Button>
                        </Flex>
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              </>
            )}

            {activeSection === 'audit' && (
              <>
                <SectionHeader
                  icon={FileText}
                  title="Audit Logs"
                  subtitle="A record of all security-relevant actions in your organization."
                />

                <Card size="1" style={{ background: 'var(--color-panel-solid)', overflow: 'hidden' }}>
                  <Flex
                    px="4"
                    py="2"
                    style={{ background: 'var(--gray-2)', borderBottom: '1px solid var(--gray-4)' }}
                  >
                    {['Action', 'Performed by', 'Time'].map((h) => (
                      <Text
                        key={h}
                        size="1"
                        color="gray"
                        weight="bold"
                        style={{ textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.05em', flex: 1 }}
                      >
                        {h}
                      </Text>
                    ))}
                  </Flex>
                  {auditLogs.map((log, i) => (
                    <Flex
                      key={i}
                      align="center"
                      px="4"
                      py="3"
                      style={{ borderBottom: i < auditLogs.length - 1 ? '1px solid var(--gray-3)' : 'none' }}
                    >
                      <Flex align="center" gap="2" style={{ flex: 1 }}>
                        <Box
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: log.type === 'warning' ? 'var(--amber-9)' : 'var(--accent-9)',
                            flexShrink: 0,
                          }}
                        />
                        <Text size="2" style={{ color: 'var(--gray-12)' }}>
                          {log.action}
                        </Text>
                      </Flex>
                      <Text size="2" color="gray" style={{ flex: 1 }}>
                        {log.actor}
                      </Text>
                      <Text size="1" color="gray" style={{ flex: 1 }}>
                        {log.time}
                      </Text>
                    </Flex>
                  ))}
                </Card>
              </>
            )}
          </Box>
        </Box>
      </Flex>

      <Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Dialog.Content maxWidth="480px">
          <Dialog.Title>Delete this organization?</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            This will immediately pause your organization and remove access for all members. Your data is kept
            for {DELETE_GRACE_DAYS} days, after which it is permanently deleted. You can restore the organization
            during that time.
          </Dialog.Description>
          <Flex gap="3" justify="end">
            <Button size="2" variant="soft" color="gray" onClick={() => setConfirmOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button size="2" variant="solid" color="red" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting…' : 'Delete organization'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}
