import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box, Flex, Text, Button, Select,
  Grid, Badge, Card, Separator, ScrollArea, Spinner
} from '@radix-ui/themes'
import {
  BarChart2, ExternalLink, Lock, Zap, Database,
  Activity, TrendingUp, AlertTriangle
} from 'lucide-react'
import { getUsageOverview } from '../../services/usageApi'
import { listProjects } from '../../services/projectApi'

// ─── Metric tile (Summary grid) ──────────────────────────────────────────────
function MetricTile({ title, used, total, unit = '', pct = null, premium = false }) {
  const percent = pct ?? (total ? Math.round((parseFloat(used) / parseFloat(total)) * 100) : 0)
  const barColor = percent >= 90 ? 'var(--red-9)' : percent >= 70 ? 'var(--amber-9)' : 'var(--accent-9)'

  return (
    <Card size="1" style={{
     
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDateRange(start, end) {
  if (!start) return '—'
  const s = new Date(start)
  const e = end ? new Date(end) : null
  const opts = { month: 'short', day: 'numeric', year: 'numeric' }
  const startStr = Number.isNaN(s.getTime()) ? '—' : s.toLocaleDateString('en-US', opts)
  const endStr = e && !Number.isNaN(e.getTime()) ? e.toLocaleDateString('en-US', opts) : ''
  return endStr ? `${startStr} – ${endStr}` : startStr
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UsagePage() {
  const { orgId } = useParams()

  const [period, setPeriod] = useState('current')
  const [projectFilter, setProjectFilter] = useState('all')
  const [projects, setProjects] = useState([])
  const [overview, setOverview] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const seqRef = useRef(0)

  const loadUsage = React.useCallback(async (opts) => {
    if (!orgId) return
    const seq = ++seqRef.current
    try {
      const data = await getUsageOverview(orgId, {
        period: opts.period,
        projectId: opts.projectId === 'all' ? '' : opts.projectId,
      })
      if (seq !== seqRef.current) return
      setOverview(data)
      setLoadError('')
    } catch (err) {
      if (seq !== seqRef.current) return
      setLoadError(err instanceof Error ? err.message : 'Failed to load usage')
    } finally {
      if (seq === seqRef.current) setIsLoading(false)
    }
  }, [orgId])

  useEffect(() => {
    setIsLoading(true)
    loadUsage({ period, projectId: projectFilter })
  }, [orgId, period, projectFilter, loadUsage])

  useEffect(() => {
    if (!orgId) return
    let mounted = true
    listProjects(orgId)
      .then((data) => { if (mounted) setProjects(data || []) })
      .catch(() => {})
    return () => { mounted = false }
  }, [orgId])

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') {
        loadUsage({ period, projectId: projectFilter })
      }
    }
    const id = setInterval(tick, 60000)
    const onVisibility = () => { if (document.visibilityState === 'visible') tick() }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [orgId, period, projectFilter, loadUsage])

  const plan = overview?.plan || { name: 'Free' }
  const quotaExceeded = Boolean(overview?.plan?.quota_exceeded)
  const summary = overview?.summary || []
  const tiles = summary.filter((s) => s.key !== 'ai_calls')
  const detailRows = overview?.detail?.rows || []
  const capacityRows = overview?.detail?.capacity || []
  const daily = overview?.daily || []
  const dailyMax = useMemo(
    () => Math.max(0, ...daily.map((d) => Number(d.total_tokens) || 0)),
    [daily]
  )

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
          <Badge size="1" color="blue" variant="soft">{plan.name} Plan</Badge>
          <Text size="1" color="gray" style={{ fontSize: 10 }}>{formatDateRange(overview?.period?.start, overview?.period?.end)}</Text>
        </Flex>
      </Flex>

      {/* ══ Scrollable Body ══════════════════════════════════════════════════ */}
      <ScrollArea style={{ flex: 1 }}>
        <Box p="6" style={{ maxWidth: 1100 }}>

          {/* ── Controls toolbar ─────────────────────────────────────────── */}
          <Flex align="center" justify="between" mb="6" wrap="wrap" gap="3">
            <Flex align="center" gap="2">
              <Select.Root value={period} onValueChange={setPeriod}>
                <Select.Trigger size="2" placeholder="Billing cycle" />
                <Select.Content>
                  <Select.Item value="current">Current billing cycle</Select.Item>
                  <Select.Item value="previous">Previous billing cycle</Select.Item>
                </Select.Content>
              </Select.Root>
              <Select.Root value={projectFilter} onValueChange={setProjectFilter}>
                <Select.Trigger size="2" placeholder="All projects" />
                <Select.Content>
                  <Select.Item value="all">All projects</Select.Item>
                  {projects.map((p) => (
                    <Select.Item key={p.id || p._id} value={String(p.id || p._id)}>{p.name}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>

            {/* Quota status banner */}
            <Flex align="center" gap="2" px="3" py="1" style={{
              background: quotaExceeded ? 'var(--red-2)' : 'var(--blue-2)',
              border: quotaExceeded ? '1px solid var(--red-5)' : '1px solid var(--blue-5)',
              borderRadius: 'var(--radius-2)',
            }}>
              <TrendingUp size={12} color={quotaExceeded ? 'var(--red-11)' : 'var(--blue-11)'} />
              <Text size="1" color="gray">
                {quotaExceeded ? (
                  <>You have <Text size="1" weight="bold" style={{ color: 'var(--red-11)' }}>exceeded</Text> your {plan.name} Plan quota this cycle.</>
                ) : (
                  <>You have <Text size="1" weight="bold" style={{ color: 'var(--blue-11)' }}>not exceeded</Text> your {plan.name} Plan quota this cycle.</>
                )}
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
              Refreshes every minute
            </Text>
          </Flex>

          {isLoading ? (
            <Flex align="center" justify="center" py="12">
              <Spinner size="3" />
            </Flex>
          ) : loadError ? (
            <Flex direction="column" align="center" gap="3" py="10">
              <AlertTriangle size={18} color="var(--red-9)" />
              <Text size="2" color="gray">{loadError}</Text>
              <Button variant="soft" color="gray" size="2" style={{ cursor: 'pointer' }}
                onClick={() => { setIsLoading(true); loadUsage({ period, projectId: projectFilter }) }}>
                Retry
              </Button>
            </Flex>
          ) : (
            <>
              {/* ── Metric tiles grid ─────────────────────────────────────────── */}
              <Grid columns={{ initial: '1', sm: '2', md: '3', lg: '4' }} gap="3" mb="8">
                {tiles.map((t) => (
                  <MetricTile
                    key={t.key}
                    title={t.title}
                    used={t.used}
                    total={t.total === null ? 'Unlimited' : t.total}
                    unit={t.unit}
                    premium={t.premium}
                  />
                ))}
              </Grid>

              {/* ═══════════════════════════════════════════════════════════════ */}
              {/*  DETAIL SECTIONS                                               */}
              {/* ═══════════════════════════════════════════════════════════════ */}

              {/* 1. AI Tokens ─────────────────────────────────────────────── */}
              <UsageSection
                icon={Zap}
                title="AI Tokens"
                subtitle="Token consumption from AI-assisted PRD generation, workflow planning, and UI canvas generation. Usage is counted within this billing cycle and resets on renewal."
              >
                <Card size="1" style={{ background: 'var(--color-panel-solid)' }}>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block', color: 'var(--gray-11)' }}>AI Tokens usage</Text>
                  {detailRows.map((row) => (
                    <UsageRow key={row.label} label={row.label} value={row.value} highlight={row.highlight} />
                  ))}
                </Card>
                {daily.length > 0 ? (
                  <Box>
                    <Text size="2" weight="medium" mb="2" style={{ display: 'block', color: 'var(--gray-11)' }}>AI Tokens per day</Text>
                    <Flex align="end" gap="2"
                      style={{
                        border: '1px solid var(--gray-4)',
                        borderRadius: 'var(--radius-3)',
                        background: 'var(--gray-2)',
                        minHeight: 110,
                        padding: '10px',
                      }}
                    >
                      {daily.map((d) => (
                        <Box
                          key={d.date}
                          title={`${d.date}: ${Number(d.total_tokens).toLocaleString()} tokens`}
                          style={{
                            flex: 1,
                            background: 'var(--accent-9)',
                            borderRadius: 3,
                            minWidth: 3,
                            height: dailyMax ? `${Math.max(4, (Number(d.total_tokens) / dailyMax) * 100)}%` : '4px',
                          }}
                        />
                      ))}
                    </Flex>
                  </Box>
                ) : (
                  <EmptyChart title="AI Tokens per day" />
                )}
              </UsageSection>

              {/* 2. Plan Capacity ─────────────────────────────────────────── */}
              <UsageSection
                icon={Database}
                title="Plan Capacity"
                subtitle={`Included resource limits for your organization's ${plan.name} Plan. Projects, team members and storage are enforced as hard limits.`}
              >
                <Card size="1" style={{ background: 'var(--color-panel-solid)' }}>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block', color: 'var(--gray-11)' }}>Limits & usage</Text>
                  {capacityRows.map((row) => (
                    <UsageRow key={row.label} label={row.label} value={row.value} />
                  ))}
                </Card>
              </UsageSection>
            </>
          )}

        </Box>
      </ScrollArea>
    </Box>
  )
}
