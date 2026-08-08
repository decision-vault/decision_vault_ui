import React from 'react'
import {
  Box, Flex, Text, Heading, Button, Select,
  Grid, Badge, Card, Progress, Separator, ScrollArea
} from '@radix-ui/themes'
import {
  BarChart2, ExternalLink, Info, Zap, Database,
  Users, Shield, Activity, TrendingUp, Lock
} from 'lucide-react'

// ─── Metric tile (Summary grid) ──────────────────────────────────────────────
function MetricTile({ title, used, total, unit = '', pct = null, premium = false }) {
  const percent = pct ?? (total ? Math.round((parseFloat(used) / parseFloat(total)) * 100) : 0)
  const barColor = percent >= 90 ? 'var(--red-9)' : percent >= 70 ? 'var(--amber-9)' : 'var(--accent-9)'

  return (
    <Card size="1" style={{
      border: '1px solid var(--gray-4)',
      background: 'var(--color-panel-solid)',
      borderRadius: 'var(--radius-3)',
      padding: '14px 16px',
    }}>
      <Flex justify="between" align="start" mb="2">
        <Text size="1" color="gray" weight="medium" style={{ lineHeight: 1.4, flex: 1, paddingRight: 8 }}>
          {title}
        </Text>
        {premium
          ? <Badge size="1" color="amber" variant="soft" style={{ flexShrink: 0, fontSize: 8 }}>PRO</Badge>
          : <Badge size="1" color={percent >= 90 ? 'red' : 'green'} variant="soft" style={{ flexShrink: 0, fontSize: 8 }}>
              {percent}%
            </Badge>
        }
      </Flex>

      {premium ? (
        <Text size="2" weight="bold" color="gray">Unavailable in plan</Text>
      ) : (
        <>
          <Text size="3" weight="bold" style={{ color: 'var(--gray-12)', display: 'block', marginBottom: 6 }}>
            {used}{unit} <Text size="1" color="gray" weight="regular">/ {total}{unit}</Text>
          </Text>
          {/* Progress bar */}
          <Box style={{ background: 'var(--gray-4)', borderRadius: 4, height: 4, overflow: 'hidden' }}>
            <Box style={{
              background: barColor,
              height: '100%',
              width: `${Math.min(percent, 100)}%`,
              borderRadius: 4,
              transition: 'width 0.4s ease',
            }} />
          </Box>
        </>
      )}
    </Card>
  )
}

// ─── Data row ────────────────────────────────────────────────────────────────
function UsageRow({ label, value, highlight = false }) {
  return (
    <Flex justify="between" align="center" py="2" style={{ borderBottom: '1px solid var(--gray-3)' }}>
      <Text size="2" color="gray">{label}</Text>
      <Text size="2" weight={highlight ? 'bold' : 'medium'} style={{ color: highlight ? 'var(--accent-11)' : 'var(--gray-12)' }}>
        {value}
      </Text>
    </Flex>
  )
}

// ─── Empty chart placeholder ──────────────────────────────────────────────────
function EmptyChart({ title }) {
  return (
    <Box>
      <Text size="2" weight="medium" mb="2" style={{ display: 'block', color: 'var(--gray-11)' }}>{title}</Text>
      <Flex direction="column" align="center" justify="center" gap="2"
        style={{
          border: '1px dashed var(--gray-5)',
          borderRadius: 'var(--radius-3)',
          background: 'var(--gray-2)',
          minHeight: 110,
          padding: '20px',
        }}
      >
        <BarChart2 size={22} color="var(--gray-7)" />
        <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>No data in period</Text>
        <Text size="1" color="gray">May take up to 24 hours to show</Text>
      </Flex>
    </Box>
  )
}

// ─── Locked feature card (paywall) ───────────────────────────────────────────
function LockedCard() {
  return (
    <Flex align="center" justify="between" p="4" style={{
      border: '1px solid var(--amber-5)',
      borderRadius: 'var(--radius-3)',
      background: 'var(--amber-2)',
    }}>
      <Flex align="center" gap="3">
        <Box style={{ width: 32, height: 32, borderRadius: 'var(--radius-2)', background: 'var(--amber-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Lock size={14} color="var(--amber-11)" />
        </Box>
        <Box>
          <Text size="2" weight="bold" style={{ display: 'block', color: 'var(--gray-12)', marginBottom: 2 }}>
            Not included in plan
          </Text>
          <Text size="2" color="gray">Upgrade to unlock this feature.</Text>
        </Box>
      </Flex>
      <Button size="2" style={{ cursor: 'pointer', flexShrink: 0 }}>
        Upgrade plan
      </Button>
    </Flex>
  )
}

// ─── Section block ────────────────────────────────────────────────────────────
function UsageSection({ icon: Icon, title, subtitle, docLabel, leftExtra, children }) {
  return (
    <Box style={{ borderTop: '1px solid var(--gray-4)', paddingTop: 28, paddingBottom: 28 }}>
      <Grid columns={{ initial: '1', md: '260px 1fr' }} gap="6">
        {/* Left */}
        <Flex direction="column" gap="3">
          <Flex align="center" gap="2">
            <Box style={{ width: 28, height: 28, borderRadius: 'var(--radius-2)', background: 'var(--accent-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={13} color="var(--accent-11)" />
            </Box>
            <Text size="3" weight="bold" style={{ color: 'var(--gray-12)' }}>{title}</Text>
          </Flex>
          <Text size="2" color="gray" style={{ lineHeight: 1.65 }}>{subtitle}</Text>
          {leftExtra}
          {docLabel && (
            <Flex align="center" gap="1" style={{ cursor: 'pointer' }}>
              <Text size="1" color="blue">{docLabel}</Text>
              <ExternalLink size={10} color="var(--accent-9)" />
            </Flex>
          )}
        </Flex>

        {/* Right */}
        <Flex direction="column" gap="4">{children}</Flex>
      </Grid>
    </Box>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UsagePage() {
  const METRICS = [
    { title: 'Database Size',                       used: '0.026', total: '0.5',       unit: ' GB', pct: 5  },
    { title: 'Egress',                              used: '0',     total: '5',          unit: ' GB', pct: 0  },
    { title: 'Cached Egress',                       used: '0',     total: '5',          unit: ' GB', pct: 0  },
    { title: 'Monthly Active Users',                used: '0',     total: '50,000',     unit: ' MAU',pct: 0  },
    { title: 'Monthly Active Third-Party Users',    used: '0',     total: '50,000',     unit: ' MAU',pct: 0  },
    { title: 'Storage Size',                        used: '0',     total: '1',          unit: ' GB', pct: 0  },
    { title: 'Realtime Peak Connections',           used: '0',     total: '200',        unit: '',    pct: 0  },
    { title: 'Realtime Messages',                   used: '0',     total: '2,000,000',  unit: '',    pct: 0  },
    { title: 'Edge Function Invocations',           used: '0',     total: '500,000',    unit: '',    pct: 0  },
    { title: 'Monthly Active SSO Users',            premium: true },
    { title: 'Storage Image Transformations',       premium: true },
  ]

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>

      {/* ══ Page Header ══════════════════════════════════════════════════════ */}
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
          <Activity size={14} color="var(--gray-9)" />
          <Text size="2" color="gray">Project</Text>
          <Text size="2" color="gray">/</Text>
          <Text size="3" weight="medium">Usage</Text>
        </Flex>

        {/* Plan pill + cycle */}
        <Flex align="center" gap="3">
          <Badge size="1" color="blue" variant="soft">Free Plan</Badge>
          <Text size="1" color="gray" style={{ fontSize: 10 }}>25 Jun 2026 – 25 Jul 2026</Text>
        </Flex>
      </Flex>

      {/* ══ Scrollable Body ══════════════════════════════════════════════════ */}
      <ScrollArea style={{ flex: 1 }}>
        <Box p="6" style={{ maxWidth: 1100 }}>

          {/* ── Controls toolbar ─────────────────────────────────────────── */}
          <Flex align="center" justify="between" mb="6" wrap="wrap" gap="3">
            <Flex align="center" gap="2">
              <Select.Root defaultValue="current">
                <Select.Trigger size="2" placeholder="Billing cycle" />
                <Select.Content>
                  <Select.Item value="current">Current billing cycle</Select.Item>
                  <Select.Item value="prev">Previous billing cycle</Select.Item>
                </Select.Content>
              </Select.Root>
              <Select.Root defaultValue="all">
                <Select.Trigger size="2" placeholder="All projects" />
                <Select.Content>
                  <Select.Item value="all">All projects</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>

            {/* Quota status banner */}
            <Flex align="center" gap="2" px="3" py="1" style={{
              background: 'var(--blue-2)',
              border: '1px solid var(--blue-5)',
              borderRadius: 'var(--radius-2)',
            }}>
              <TrendingUp size={12} color="var(--blue-11)" />
              <Text size="1" color="gray">
                You have <Text size="1" weight="bold" style={{ color: 'var(--blue-11)' }}>not exceeded</Text> your Free Plan quota this cycle.
              </Text>
            </Flex>
          </Flex>

          {/* ── Summary section header ────────────────────────────────────── */}
          <Flex align="center" gap="2" mb="4">
            <Text size="2" weight="bold" style={{ color: 'var(--gray-12)', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.06em' }}>
              Usage Summary
            </Text>
            <Separator orientation="horizontal" style={{ flex: 1 }} />
            <Text size="1" color="gray" style={{ fontSize: 10, fontStyle: 'italic' }}>
              Refreshes every hour
            </Text>
          </Flex>

          {/* ── Metric tiles grid ─────────────────────────────────────────── */}
          <Grid columns={{ initial: '1', sm: '2', md: '3', lg: '4' }} gap="3" mb="8">
            {METRICS.map((m, i) => (
              <MetricTile key={i} {...m} />
            ))}
          </Grid>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/*  DETAIL SECTIONS                                               */}
          {/* ═══════════════════════════════════════════════════════════════ */}

          {/* 1. Egress ─────────────────────────────────────────────────── */}
          <UsageSection
            icon={Activity}
            title="Egress"
            subtitle="Amount of data transmitted over all network connections. Billing is based on total uncached egress in GB throughout your billing period."
            docLabel="Documentation"
          >
            <Card size="1" style={{ border: '1px solid var(--gray-4)', background: 'var(--color-panel-solid)' }}>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block', color: 'var(--gray-11)' }}>Egress usage</Text>
              <UsageRow label="Included in Free Plan" value="5 GB" />
              <UsageRow label="Used in period"        value="0.00 GB" />
              <UsageRow label="Overage in period"     value="0 GB" highlight />
            </Card>
            <EmptyChart title="Egress per day" />
          </UsageSection>

          {/* 2. Database & Storage ─────────────────────────────────────── */}
          <UsageSection
            icon={Database}
            title="Database & Storage Size"
            subtitle="Database size refers to the actual space used by all database objects, as reported by Postgres. Storage size tracks file assets."
            docLabel="Documentation"
          >
            <Card size="1" style={{ border: '1px solid var(--gray-4)', background: 'var(--color-panel-solid)' }}>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block', color: 'var(--gray-11)' }}>Database size usage</Text>
              <UsageRow label="Included in Free Plan" value="0.5 GB per project" />
              <UsageRow label="Max database size"     value="24.62 MB" />
            </Card>

            <Card size="1" style={{ border: '1px solid var(--gray-4)', background: 'var(--color-panel-solid)' }}>
              <Flex justify="between" align="center">
                <Box>
                  <Text size="2" weight="bold" style={{ display: 'block', color: 'var(--gray-12)', marginBottom: 2 }}>
                    Current database size per project
                  </Text>
                  <Flex align="center" gap="2">
                    <Text size="2" weight="bold">test</Text>
                    <Text size="2" color="gray">24.62 MB</Text>
                    <Info size={12} color="var(--gray-8)" />
                  </Flex>
                </Box>
                <Button variant="soft" color="gray" size="1" style={{ cursor: 'pointer' }}>
                  Manage size
                </Button>
              </Flex>
            </Card>
          </UsageSection>

          {/* 3. Monthly Active Users ───────────────────────────────────── */}
          <UsageSection
            icon={Users}
            title="Monthly Active Users"
            subtitle="Users who log in or refresh their token count toward MAU. Billing is based on the sum of distinct users per billing period."
            docLabel="Auth documentation"
          >
            <Card size="1" style={{ border: '1px solid var(--gray-4)', background: 'var(--color-panel-solid)' }}>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block', color: 'var(--gray-11)' }}>Monthly Active Users usage</Text>
              <UsageRow label="Included in Free Plan"  value="50,000" />
              <UsageRow label="Cumulative in period"   value="0" />
              <UsageRow label="Overage in period"      value="0" highlight />
            </Card>
            <EmptyChart title="Cumulative MAU in billing period" />
          </UsageSection>

          {/* 4. SSO — locked ───────────────────────────────────────────── */}
          <UsageSection
            icon={Shield}
            title="Monthly Active SSO Users"
            subtitle="SSO users who log in or refresh their token count towards SSO MAU. Resets every billing cycle."
            docLabel="SSO with SAML 2.0"
          >
            <LockedCard />
          </UsageSection>

          {/* 5. Edge Functions ─────────────────────────────────────────── */}
          <UsageSection
            icon={Zap}
            title="Edge Function Invocations"
            subtitle="Every serverless function invocation, independent of response status, is counted toward your monthly quota."
            docLabel="Edge Functions docs"
          >
            <Card size="1" style={{ border: '1px solid var(--gray-4)', background: 'var(--color-panel-solid)' }}>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block', color: 'var(--gray-11)' }}>Edge Function Invocations usage</Text>
              <UsageRow label="Included in Free Plan" value="500,000" />
              <UsageRow label="Used in period"        value="0" />
              <UsageRow label="Overage in period"     value="0" highlight />
            </Card>
            <EmptyChart title="Edge Function Invocations per day" />
          </UsageSection>

        </Box>
      </ScrollArea>
    </Box>
  )
}