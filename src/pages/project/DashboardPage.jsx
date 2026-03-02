import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  ScrollArea,
  Separator,
  Text,
} from '@radix-ui/themes'
import {
  BarChartIcon,
  ClockIcon,
  LightningBoltIcon,
  ReloadIcon,
  RocketIcon,
  TokensIcon,
} from '@radix-ui/react-icons'
import { getOwnerDashboardSummary } from '../../services/dashboardApi'
import { useParams } from 'react-router-dom'

function formatNumber(value) {
  const num = Number(value || 0)
  return new Intl.NumberFormat().format(num)
}

function formatCurrency(value) {
  const num = Number(value || 0)
  return `$${num.toFixed(4)}`
}

function formatDate(value) {
  if (!value) return 'N/A'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return 'N/A'
  }
}

function statusColor(status) {
  if (!status) return 'gray'
  const value = String(status).toLowerCase()
  if (value.includes('completed') || value.includes('active') || value.includes('ready')) return 'green'
  if (value.includes('running') || value.includes('queued') || value.includes('draft')) return 'blue'
  if (value.includes('paused') || value.includes('pending')) return 'amber'
  if (value.includes('failed') || value.includes('error') || value.includes('stopped')) return 'red'
  return 'gray'
}

function KpiCard({ icon, label, value, subLabel }) {
  return (
    <Card size="2" style={{ borderRadius: 14, border: '1px solid var(--gray-6)' }}>
      <Flex direction="column" gap="2">
        <Flex align="center" justify="between">
          <Text size="1" color="gray" style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
            {label}
          </Text>
          <Box style={{ color: 'var(--accent-10)' }}>{icon}</Box>
        </Flex>
        <Text size="7" weight="bold" style={{ lineHeight: 1.1 }}>
          {value}
        </Text>
        <Text size="1" color="gray">{subLabel}</Text>
      </Flex>
    </Card>
  )
}

function VerticalBarChart({ title, rows, color = 'var(--accent-9)' }) {
  const max = Math.max(1, ...rows.map((item) => Number(item.value || 0)))
  return (
    <Card size="2" style={{ borderRadius: 14, border: '1px solid var(--gray-6)' }}>
      <Flex direction="column" gap="3">
        <Text size="2" weight="medium">{title}</Text>
        <Flex align="end" gap="2" style={{ minHeight: 180 }}>
          {rows.length === 0 ? <Text size="2" color="gray">No data in selected window.</Text> : null}
          {rows.map((row) => (
            <Flex key={row.label} direction="column" gap="1" style={{ flex: 1, minWidth: 0 }}>
              <Text size="1" color="gray" style={{ textAlign: 'center' }}>
                {formatNumber(row.value)}
              </Text>
              <Box
                style={{
                  height: `${Math.max(8, Math.round((Number(row.value || 0) / max) * 140))}px`,
                  borderRadius: 8,
                  background: color,
                }}
              />
              <Text
                size="1"
                color="gray"
                style={{
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {row.label}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Card>
  )
}

function HorizontalBars({ title, rows }) {
  const max = Math.max(1, ...rows.map((item) => Number(item.total_tokens || 0)))
  return (
    <Card size="2" style={{ borderRadius: 14, border: '1px solid var(--gray-6)' }}>
      <Flex direction="column" gap="3">
        <Text size="2" weight="medium">{title}</Text>
        {rows.length === 0 ? <Text size="2" color="gray">No feature usage yet.</Text> : null}
        {rows.map((row) => (
          <Flex key={row.feature} direction="column" gap="1">
            <Flex justify="between" align="center" gap="2">
              <Text size="2" style={{ textTransform: 'capitalize' }}>{row.feature}</Text>
              <Text size="1" color="gray">{formatNumber(row.total_tokens)} tokens</Text>
            </Flex>
            <Box style={{ background: 'var(--gray-4)', height: 10, borderRadius: 999 }}>
              <Box
                style={{
                  width: `${Math.max(4, Math.round((Number(row.total_tokens || 0) / max) * 100))}%`,
                  height: '100%',
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, #0f766e 0%, #0ea5e9 100%)',
                }}
              />
            </Box>
            <Flex justify="between">
              <Text size="1" color="gray">{row.requests} req</Text>
              <Text size="1" color="gray">{formatCurrency(row.estimated_cost)}</Text>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Card>
  )
}

function TokenUsabilityCard({ data }) {
  const budget = Number(data?.token_budget_per_request || 0)
  const maxUse = Number(data?.max_tokens_per_request || 0)
  const usagePct = budget > 0 ? Math.min(100, Math.round((maxUse / budget) * 100)) : 0
  const headroom = Number(data?.token_headroom_percent || 0)

  return (
    <Card size="2" style={{ borderRadius: 14, border: '1px solid var(--gray-6)' }}>
      <Flex direction="column" gap="3">
        <Flex align="center" justify="between">
          <Text size="2" weight="medium">Token Usability</Text>
          <TokensIcon width="16" height="16" />
        </Flex>
        <Flex align="center" gap="4">
          <Box
            style={{
              width: 84,
              height: 84,
              borderRadius: '50%',
              background: `conic-gradient(#0ea5e9 ${usagePct}%, var(--gray-5) ${usagePct}% 100%)`,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Box
              style={{
                width: 62,
                height: 62,
                borderRadius: '50%',
                background: 'var(--color-panel-solid)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Text size="2" weight="bold">{usagePct}%</Text>
            </Box>
          </Box>
          <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
            <Text size="2" weight="medium">{formatNumber(maxUse)} / {formatNumber(budget)} max/request</Text>
            <Text size="1" color="gray">Headroom: {headroom}%</Text>
            <Text size="1" color="gray">Avg request: {formatNumber(data?.avg_tokens_per_request || 0)} tokens</Text>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  )
}

export function DashboardPage() {
  const { orgId, projectId } = useParams()
  const [days, setDays] = useState(7)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)

  const loadSummary = useCallback(async () => {
    if (!orgId || !projectId) return
    setLoading(true)
    setError('')
    try {
      const data = await getOwnerDashboardSummary(orgId, projectId, days)
      setSummary(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard summary')
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }, [orgId, projectId, days])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  const kpis = summary?.kpis || {}
  const llm = summary?.llm_usage || {}
  const prd = summary?.prd || {}
  const requirements = summary?.requirements || {}

  const dailyUsageRows = useMemo(() => {
    const list = Array.isArray(llm?.daily) ? llm.daily : []
    return list.map((item) => ({
      label: String(item.date || '').slice(5),
      value: Number(item.tokens || 0),
    }))
  }, [llm])

  const topFeatures = Array.isArray(llm?.by_feature) ? llm.by_feature : []
  const recentDecisions = Array.isArray(summary?.recent_decisions) ? summary.recent_decisions : []
  const recentActivity = Array.isArray(summary?.recent_activity) ? summary.recent_activity : []

  return (
    <ScrollArea type="auto" scrollbars="vertical" style={{ height: '100%' }}>
      <Box
        p="4"
        style={{
          minHeight: '100%',
          background:
            'radial-gradient(1200px 500px at 10% -10%, rgba(14,165,233,0.16), transparent 40%), radial-gradient(900px 500px at 100% -20%, rgba(16,185,129,0.14), transparent 45%)',
        }}
      >
        <Flex direction="column" gap="4" style={{ maxWidth: 1240, margin: '0 auto' }}>
          <Card
            size="3"
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(2,132,199,0.08), rgba(15,118,110,0.08))',
              border: '1px solid var(--gray-6)',
            }}
          >
            <Flex justify="between" align="center" wrap="wrap" gap="3">
              <Box>
                <Text size="1" color="gray" style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Welcome Back
                </Text>
                <Heading size="6" style={{ marginTop: 6 }}>
                  {summary?.project?.name || 'Project Dashboard'}
                </Heading>
                <Flex gap="2" align="center" mt="2" wrap="wrap">
                  <Badge color={statusColor(summary?.project?.status)}>{summary?.project?.status || 'active'}</Badge>
                </Flex>
              </Box>
              <Flex gap="2" align="center">
                {[7, 14, 30].map((value) => (
                  <Button
                    key={value}
                    size="2"
                    variant={days === value ? 'solid' : 'soft'}
                    onClick={() => setDays(value)}
                  >
                    {value}d
                  </Button>
                ))}
                <Button size="2" variant="soft" onClick={loadSummary} disabled={loading}>
                  <ReloadIcon /> Refresh
                </Button>
              </Flex>
            </Flex>
          </Card>

          {error ? (
            <Card size="2" style={{ borderRadius: 14, border: '1px solid var(--red-6)' }}>
              <Text size="2" color="red">{error}</Text>
            </Card>
          ) : null}

          <Grid columns={{ initial: '1', sm: '2', lg: '4' }} gap="3">
            <KpiCard
              icon={<RocketIcon width="15" height="15" />}
              label="Team Members"
              value={formatNumber(kpis.members || 0)}
              subLabel={`${formatNumber(kpis.active_prd_runs || 0)} active PRD runs`}
            />
            <KpiCard
              icon={<BarChartIcon width="15" height="15" />}
              label="Decisions"
              value={formatNumber(kpis.decisions_total || 0)}
              subLabel={`${formatNumber(kpis.decisions_window || 0)} in last ${days} days`}
            />
            <KpiCard
              icon={<LightningBoltIcon width="15" height="15" />}
              label="LLM Requests"
              value={formatNumber(llm.requests || 0)}
              subLabel={`${formatNumber(llm.total_tokens || 0)} tokens in ${days}d`}
            />
            <KpiCard
              icon={<ClockIcon width="15" height="15" />}
              label="Messenger Volume"
              value={formatNumber(kpis.messages_total || 0)}
              subLabel={`${formatNumber(kpis.messages_24h || 0)} messages in 24h`}
            />
          </Grid>

          <Grid columns={{ initial: '1', lg: '2' }} gap="3">
            <VerticalBarChart title={`Daily Token Usage (${days} days)`} rows={dailyUsageRows} color="linear-gradient(180deg,#0ea5e9,#0284c7)" />
            <HorizontalBars title="Usage by Feature" rows={topFeatures} />
          </Grid>

          <Grid columns={{ initial: '1', lg: '3' }} gap="3">
            <TokenUsabilityCard data={llm} />

            <Card size="2" style={{ borderRadius: 14, border: '1px solid var(--gray-6)' }}>
              <Flex direction="column" gap="2">
                <Text size="2" weight="medium">LLM Cost & Throughput</Text>
                <Separator size="4" />
                <Flex justify="between" align="center">
                  <Text size="2" color="gray">Estimated cost ({days}d)</Text>
                  <Text size="3" weight="bold">{formatCurrency(llm.estimated_cost)}</Text>
                </Flex>
                <Flex justify="between" align="center">
                  <Text size="2" color="gray">Input tokens</Text>
                  <Text size="2">{formatNumber(llm.input_tokens)}</Text>
                </Flex>
                <Flex justify="between" align="center">
                  <Text size="2" color="gray">Output tokens</Text>
                  <Text size="2">{formatNumber(llm.output_tokens)}</Text>
                </Flex>
                <Flex justify="between" align="center">
                  <Text size="2" color="gray">Avg tokens/request</Text>
                  <Text size="2">{formatNumber(llm.avg_tokens_per_request)}</Text>
                </Flex>
              </Flex>
            </Card>

            <Card size="2" style={{ borderRadius: 14, border: '1px solid var(--gray-6)' }}>
              <Flex direction="column" gap="2">
                <Text size="2" weight="medium">Project Health</Text>
                <Separator size="4" />
                <Flex justify="between" align="center">
                  <Text size="2" color="gray">Requirements</Text>
                  <Badge color={statusColor(requirements.status)}>{requirements.status || 'N/A'}</Badge>
                </Flex>
                <Flex justify="between" align="center">
                  <Text size="2" color="gray">Latest PRD Run</Text>
                  <Badge color={statusColor(prd.latest_status)}>{prd.latest_status || 'N/A'}</Badge>
                </Flex>
                <Flex justify="between" align="center">
                  <Text size="2" color="gray">PRD version</Text>
                  <Text size="2" weight="medium">{prd.latest_version || 'N/A'}</Text>
                </Flex>
                <Flex justify="between" align="center">
                  <Text size="2" color="gray">Channels / Threads</Text>
                  <Text size="2" weight="medium">{kpis.channels || 0} / {kpis.threads || 0}</Text>
                </Flex>
                <Flex justify="between" align="center">
                  <Text size="2" color="gray">Personal chats</Text>
                  <Text size="2" weight="medium">{kpis.personal_chats || 0}</Text>
                </Flex>
              </Flex>
            </Card>
          </Grid>

          <Grid columns={{ initial: '1', lg: '2' }} gap="3" pb="4">
            <Card size="2" style={{ borderRadius: 14, border: '1px solid var(--gray-6)' }}>
              <Flex direction="column" gap="3">
                <Flex justify="between" align="center">
                  <Text size="3" weight="medium">Recent Decisions</Text>
                  <Badge variant="soft">{recentDecisions.length}</Badge>
                </Flex>
                {loading ? <Text size="2" color="gray">Loading decisions...</Text> : null}
                {!loading && recentDecisions.length === 0 ? (
                  <Text size="2" color="gray">No decision records found for this project yet.</Text>
                ) : null}
                <Flex direction="column" gap="2">
                  {recentDecisions.map((item) => (
                    <Box
                      key={item.id}
                      style={{
                        border: '1px solid var(--gray-6)',
                        borderRadius: 10,
                        padding: 10,
                        background: 'var(--gray-2)',
                      }}
                    >
                      <Flex justify="between" align="start" gap="2">
                        <Box style={{ minWidth: 0 }}>
                          <Text size="2" weight="medium">{item.title}</Text>
                          {item.statement ? (
                            <Text size="1" color="gray" style={{ display: 'block', marginTop: 4 }}>
                              {item.statement.length > 140 ? `${item.statement.slice(0, 140)}...` : item.statement}
                            </Text>
                          ) : null}
                        </Box>
                        <Badge variant="soft" color="gray">{item.source}</Badge>
                      </Flex>
                      <Text size="1" color="gray" style={{ display: 'block', marginTop: 6 }}>
                        {formatDate(item.created_at)}
                      </Text>
                    </Box>
                  ))}
                </Flex>
              </Flex>
            </Card>

            <Card size="2" style={{ borderRadius: 14, border: '1px solid var(--gray-6)' }}>
              <Flex direction="column" gap="3">
                <Flex justify="between" align="center">
                  <Text size="3" weight="medium">Recent Activity Feed</Text>
                  <Badge variant="soft">{recentActivity.length}</Badge>
                </Flex>
                {loading ? <Text size="2" color="gray">Loading activity...</Text> : null}
                {!loading && recentActivity.length === 0 ? (
                  <Text size="2" color="gray">No activity available for this scope.</Text>
                ) : null}
                <Flex direction="column" gap="2">
                  {recentActivity.map((item) => (
                    <Flex
                      key={item.id}
                      justify="between"
                      align="start"
                      gap="2"
                      style={{ borderBottom: '1px solid var(--gray-5)', paddingBottom: 8 }}
                    >
                      <Box style={{ minWidth: 0 }}>
                        <Text size="2" weight="medium">{item.action}</Text>
                        <Text size="1" color="gray">{item.entity_type} {item.entity_id ? `• ${item.entity_id}` : ''}</Text>
                      </Box>
                      <Text size="1" color="gray" style={{ whiteSpace: 'nowrap' }}>
                        {formatDate(item.created_at)}
                      </Text>
                    </Flex>
                  ))}
                </Flex>
              </Flex>
            </Card>
          </Grid>
        </Flex>
      </Box>
    </ScrollArea>
  )
}
