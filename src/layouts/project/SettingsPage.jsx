import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Box, Flex, Text, Heading, Button, TextField,
  Grid, RadioGroup, Switch, Separator, Badge,
  Card, ScrollArea, TextArea, Select, Container
} from '@radix-ui/themes'
import {
  Settings, Shield, Key, Users, Plug, FileText,
  BookOpen, Save, AlertTriangle, Copy, Check,
  ChevronRight, Building2, Globe, Lock
} from 'lucide-react'

// ─── Section row (label | content) ───────────────────────────────────────────
function FieldRow({ label, hint, children }) {
  return (
    <Grid columns={{ initial: '1', sm: '200px 1fr' }} gap="4" py="4"
      style={{ borderBottom: '1px solid var(--gray-3)', alignItems: 'start' }}>
      <Box>
        <Text size="2" weight="medium" style={{ color: 'var(--gray-12)', display: 'block', marginBottom: 2 }}>{label}</Text>
        {hint && <Text size="1" color="gray" style={{ lineHeight: 1.5 }}>{hint}</Text>}
      </Box>
      <Box>{children}</Box>
    </Grid>
  )
}

// ─── Save footer ─────────────────────────────────────────────────────────────
function SaveFooter({ onSave, saved }) {
  return (
    <Flex justify="end" gap="2" px="5" py="3"
      style={{ borderTop: '1px solid var(--gray-4)', background: 'var(--gray-1)', flexShrink: 0 }}>
      <Button variant="soft" color="gray" size="2" style={{ cursor: 'pointer' }}>Cancel</Button>
      <Button size="2" onClick={onSave} style={{ cursor: 'pointer', gap: 6 }}>
        {saved ? <><Check size={13} /> Saved!</> : <><Save size={13} /> Save changes</>}
      </Button>
    </Flex>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION PANELS
// ═══════════════════════════════════════════════════════════════════════════

function GeneralPanel() {
  const [orgName, setOrgName]       = useState('bloom-majesty')
  const [slug]                      = useState('pbbaqwiuhissoupjdtnc')
  const [copied, setCopied]         = useState(false)
  const [privacyLevel, setPrivacy]  = useState('disabled')
  const [saved, setSaved]           = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(slug)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <Flex direction="column" style={{ flex: 1, minHeight: 0, paddingTop: "25px"}}>
      <ScrollArea style={{ flex: 1 }}>
        <Box px="5" pt="5" pb="3">

          {/* ── Organization Details ───────────────────────────────────── */}
          <Box mb="6">
            <Flex align="center" gap="2" mb="1">
              <Building2 size={14} color="var(--gray-9)" />
              <Heading size="4">Organization Details</Heading>
            </Flex>
            <Text size="2" color="gray">Basic identity and reference information for your org.</Text>

            <Card size="1" mt="3" style={{ border: '1px solid var(--gray-4)', background: 'var(--color-panel-solid)' }}>
              <Box px="1">
                <FieldRow label="Organization name" hint="Shown across the dashboard.">
                  <TextField.Root
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    size="2"
                    placeholder="My Organization"
                  />
                </FieldRow>
                <FieldRow label="Organization slug" hint="Used in API routes. Cannot be changed.">
                  <Flex gap="2">
                    <TextField.Root value={slug} size="2" disabled style={{ flex: 1, opacity: 0.6 }} />
                    <Button variant="soft" color="gray" size="2" onClick={handleCopy} style={{ cursor: 'pointer', gap: 5, flexShrink: 0 }}>
                      {copied ? <><Check size={12} />Copied</> : <><Copy size={12} />Copy</>}
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
              </Box>
            </Card>
          </Box>

          <Separator size="4" mb="6" />

          {/* ── Data Privacy ──────────────────────────────────────────── */}
          <Box mb="6">
            <Flex align="center" gap="2" mb="1">
              <Globe size={14} color="var(--gray-9)" />
              <Heading size="4">Data Privacy</Heading>
            </Flex>
            <Text size="2" color="gray">Control what data is shared with AI providers.</Text>

            <Card size="1" mt="3" style={{ border: '1px solid var(--gray-4)', background: 'var(--color-panel-solid)' }}>
              <Box px="1" py="2">
                <RadioGroup.Root value={privacyLevel} onValueChange={setPrivacy}>
                  <Flex direction="column" gap="4" p="3">
                    {[
                      { value: 'disabled', label: 'Disabled',                  desc: 'No data shared. Responses will be generic.' },
                      { value: 'schema',   label: 'Schema Only',               desc: 'Share table/column names and relationships only.' },
                      { value: 'logs',     label: 'Schema & Logs',             desc: 'Share schema and logs (may contain PII).' },
                      { value: 'all',      label: 'Schema, Logs & DB Data',    desc: 'Full read-only database access for AI analysis.' },
                    ].map(opt => (
                      <label key={opt.value} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
                        <RadioGroup.Item value={opt.value} style={{ marginTop: 3 }} />
                        <Box>
                          <Text size="2" weight="bold" style={{ display: 'block', marginBottom: 2 }}>{opt.label}</Text>
                          <Text size="2" color="gray" style={{ lineHeight: 1.55 }}>{opt.desc}</Text>
                        </Box>
                      </label>
                    ))}
                  </Flex>
                </RadioGroup.Root>
              </Box>
            </Card>
          </Box>

          <Separator size="4" mb="6" />

          {/* ── Danger Zone ───────────────────────────────────────────── */}
          <Box mb="6">
            <Flex align="center" gap="2" mb="3">
              <AlertTriangle size={14} color="var(--red-9)" />
              <Heading size="4" style={{ color: 'var(--red-11)' }}>Danger Zone</Heading>
            </Flex>
            <Card size="1" style={{ border: '1px solid var(--red-5)', background: 'var(--red-1)' }}>
              <Flex align="center" justify="between" p="4">
                <Box>
                  <Text size="2" weight="bold" style={{ display: 'block', color: 'var(--red-12)', marginBottom: 3 }}>
                    Delete this organization
                  </Text>
                  <Text size="2" color="gray">
                    This will remove all projects and data. This action cannot be undone.
                  </Text>
                </Box>
                <Button color="red" variant="soft" size="2" style={{ cursor: 'pointer', flexShrink: 0, marginLeft: 16 }}>
                  <AlertTriangle size={13} /> Delete organization
                </Button>
              </Flex>
            </Card>
          </Box>

        </Box>
      </ScrollArea>
      <SaveFooter onSave={handleSave} saved={saved} />
    </Flex>
  )
}

function SecurityPanel() {
  const [mfaEnforced, setMfa]    = useState(false)
  const [sessionTimeout, setTimeout_] = useState('8h')
  const [saved, setSaved]         = useState(false)

  return (
    <Flex direction="column" style={{ flex: 1, minHeight: 0 }}>
      <ScrollArea style={{ flex: 1 }}>
        <Box px="5" pt="5" pb="3">
          <Box mb="6">
            <Flex align="center" gap="2" mb="1">
              <Shield size={14} color="var(--gray-9)" />
              <Heading size="4">Security Settings</Heading>
            </Flex>
            <Text size="2" color="gray">Manage authentication requirements for your organization.</Text>

            <Card size="1" mt="3" style={{ border: '1px solid var(--gray-4)', background: 'var(--color-panel-solid)' }}>
              <Box px="1">
                <FieldRow label="Enforce MFA" hint="Require all members to have multi-factor authentication enabled.">
                  <Flex align="center" gap="3">
                    <Switch checked={mfaEnforced} onCheckedChange={setMfa} />
                    <Badge size="1" color={mfaEnforced ? 'green' : 'gray'} variant="soft">
                      {mfaEnforced ? 'Enforced' : 'Optional'}
                    </Badge>
                  </Flex>
                </FieldRow>
                <FieldRow label="Session timeout" hint="Automatically sign out inactive users.">
                  <Select.Root value={sessionTimeout} onValueChange={setTimeout_}>
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
                  <TextField.Root size="2" placeholder="acme.com, example.org" />
                </FieldRow>
              </Box>
            </Card>
          </Box>
        </Box>
      </ScrollArea>
      <SaveFooter onSave={() => { setSaved(true); setTimeout(() => setSaved(false), 2500) }} saved={saved} />
    </Flex>
  )
}

function ApiKeysPanel() {
  const [keys] = useState([
    { id: 1, name: 'Production Key',    prefix: 'dv_prod_****',  created: '2026-06-01', status: 'active' },
    { id: 2, name: 'Development Key',   prefix: 'dv_dev_****',   created: '2026-06-15', status: 'active' },
  ])

  return (
    <Flex direction="column" style={{ flex: 1, minHeight: 0 }}>
      <ScrollArea style={{ flex: 1 }}>
        <Box px="5" pt="5" pb="6">
          <Flex align="center" justify="between" mb="4">
            <Box>
              <Flex align="center" gap="2" mb="1">
                <Key size={14} color="var(--gray-9)" />
                <Heading size="4">API Keys</Heading>
              </Flex>
              <Text size="2" color="gray">Manage API keys for programmatic access to DecisionVault.</Text>
            </Box>
            <Button size="2" style={{ cursor: 'pointer', gap: 6 }}>
              <Key size={12} /> Generate new key
            </Button>
          </Flex>

          <Flex direction="column" gap="2">
            {keys.map(k => (
              <Card key={k.id} size="1" style={{ border: '1px solid var(--gray-4)', background: 'var(--color-panel-solid)' }}>
                <Flex align="center" justify="between" p="3">
                  <Flex align="center" gap="3">
                    <Box style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Key size={14} color="var(--accent-11)" />
                    </Box>
                    <Box>
                      <Text size="2" weight="bold" style={{ display: 'block', color: 'var(--gray-12)' }}>{k.name}</Text>
                      <Flex align="center" gap="2" mt="1">
                        <Text size="1" color="gray" style={{ fontFamily: 'monospace', fontSize: 11 }}>{k.prefix}</Text>
                        <Text size="1" color="gray">·</Text>
                        <Text size="1" color="gray">Created {k.created}</Text>
                      </Flex>
                    </Box>
                  </Flex>
                  <Flex align="center" gap="2">
                    <Badge size="1" color="blue" variant="soft">{k.status}</Badge>
                    <Button variant="soft" color="gray" size="1" style={{ cursor: 'pointer' }}>Revoke</Button>
                  </Flex>
                </Flex>
              </Card>
            ))}
          </Flex>
        </Box>
      </ScrollArea>
    </Flex>
  )
}



function AuditLogsPanel() {
  const logs = [
    { action: 'User invited',          actor: 'kaviyarasumaran@gmail.com', time: '2 hours ago',  type: 'info' },
    { action: 'Settings updated',      actor: 'kaviyarasumaran@gmail.com', time: '1 day ago',    type: 'info' },
    { action: 'API key generated',     actor: 'kaviyarasumaran@gmail.com', time: '3 days ago',   type: 'info' },
    { action: 'Member role changed',   actor: 'kaviyarasumaran@gmail.com', time: '1 week ago',   type: 'warning' },
  ]

  return (
    <Flex direction="column" style={{ flex: 1, minHeight: 0 }}>
      <ScrollArea style={{ flex: 1 }}>
        <Box px="5" pt="5" pb="6">
          <Flex align="center" gap="2" mb="1">
            <FileText size={14} color="var(--gray-9)" />
            <Heading size="4">Audit Logs</Heading>
          </Flex>
          <Text size="2" color="gray" style={{ display: 'block', marginBottom: 16 }}>
            A record of all security-relevant actions in your organization.
          </Text>

          <Card size="1" style={{ border: '1px solid var(--gray-4)', background: 'var(--color-panel-solid)', overflow: 'hidden' }}>
            <Flex px="4" py="2" style={{ background: 'var(--gray-2)', borderBottom: '1px solid var(--gray-4)' }}>
              {['Action', 'Performed by', 'Time'].map(h => (
                <Text key={h} size="1" color="gray" weight="bold"
                  style={{ textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.05em', flex: 1 }}>
                  {h}
                </Text>
              ))}
            </Flex>
            {logs.map((log, i) => (
              <Flex key={i} align="center" px="4" py="3"
                style={{ borderBottom: i < logs.length - 1 ? '1px solid var(--gray-3)' : 'none' }}>
                <Flex align="center" gap="2" style={{ flex: 1 }}>
                  <Box style={{ width: 6, height: 6, borderRadius: '50%', background: log.type === 'warning' ? 'var(--amber-9)' : 'var(--accent-9)', flexShrink: 0 }} />
                  <Text size="2" style={{ color: 'var(--gray-12)' }}>{log.action}</Text>
                </Flex>
                <Text size="2" color="gray" style={{ flex: 1 }}>{log.actor}</Text>
                <Text size="1" color="gray" style={{ flex: 1 }}>{log.time}</Text>
              </Flex>
            ))}
          </Card>
        </Box>
      </ScrollArea>
    </Flex>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
//  NAV CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const SECTIONS = [
  {
    group: 'Configuration',
    items: [
      { id: 'general',   label: 'General',   icon: Settings,  Panel: GeneralPanel  },
      { id: 'security',  label: 'Security',  icon: Shield,    Panel: SecurityPanel },
      { id: 'api-keys',  label: 'API Keys',  icon: Key,       Panel: ApiKeysPanel  },
    ],
  },

  {
    group: 'Compliance',
    items: [
      { id: 'audit',     label: 'Audit Logs', icon: FileText, Panel: AuditLogsPanel },
      { id: 'legal',     label: 'Legal',       icon: BookOpen, Panel: () => (
        <Flex align="center" justify="center" direction="column" gap="3" style={{ flex: 1, color: 'var(--gray-9)' }}>
          <Lock size={32} color="var(--gray-6)" />
          <Text size="2" color="gray">Legal documents will appear here.</Text>
        </Flex>
      )},
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function SettingsPage() {
  const [searchParams] = useSearchParams()
  const activeId = searchParams.get('section') || 'general'

  const allItems = SECTIONS.flatMap(s => s.items)
  const active   = allItems.find(i => i.id === activeId) || allItems[0]
  const { Panel } = active

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>

      {/* ── Body panel (nav is now in parent layout) wrapped in Container ── */}
      <Flex style={{ flex: 1, overflowY: 'auto', minHeight: 0 }} justify="center">
        <Container size="3" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Flex direction="column" style={{ flex: 1, minHeight: 0 }}>
            <Panel />
          </Flex>
        </Container>
      </Flex>
    </Box>
  )
}