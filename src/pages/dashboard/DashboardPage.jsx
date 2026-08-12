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
  Skeleton,
  Text,
} from '@radix-ui/themes'
import {
  Activity,
  ArrowRight,
  Bell,
  Bug,
  ChevronDown,
  ChevronUp,
  Coins,
  FileText,
  Inbox,
  Layout,
  ListChecks,
  RefreshCw,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'
import { getOwnerDashboardSummary } from '../../services/dashboardApi'
import { useParams, useNavigate } from 'react-router-dom'
import { AreaTrend, BarSeries, Donut } from '../../components/charts/SimpleCharts'
import { useNotificationUnread } from '../../hooks/useNotificationUnread'

const fmtCompact = (n) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n || 0)

const fmtNum = (n) => (n || 0).toLocaleString()

function statusColor(status) {
  if (!status) return 'gray'
  const value = String(status).toLowerCase()
  if (value.includes('completed') || value.includes('active') || value.includes('ready') || value.includes('healthy')) return 'green'
  if (value.includes('running') || value.includes('queued') || value.includes('draft')) return 'blue'
  if (value.includes('paused') || value.includes('pending')) return 'amber'
  if (value.includes('failed') || value.includes('error') || value.includes('stopped')) return 'red'
  return 'gray'
}

function KpiCard({ icon, label, value, caption, tone = 'blue', badge, onClick }) {
  return (
    <Card
      size="2"
      style={{
        borderRadius: '10px',
        borderTop: `3px solid var(--${tone}-9)`,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <Flex justify="between" align="center" gap="2">
        <Box style={{ color: `var(--${tone}-9)` }}>{icon}</Box>
        {badge}
      </Flex>
      <Text size="6" weight="bold" mt="3" as="div" style={{ color: 'var(--gray-12)', letterSpacing: '-0.02em' }}>
        {value}
      </Text>
      <Text size="1" weight="bold" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-10)' }}>
        {label}
      </Text>
      {caption && (
        <Text size="1" color="gray" mt="1" as="div" style={{ lineHeight: 1.5 }}>
          {caption}
        </Text>
      )}
    </Card>
  )
}

function Delta({ pct }) {
  if (pct === null || pct === undefined) return null
  const up = pct > 0
  const flat = pct === 0
  return (
    <Badge size="1" color={flat ? 'gray' : up ? 'red' : 'green'} variant="soft" radius="full">
      {flat ? (
        '0%'
      ) : (
        <Flex align="center" gap="1">
          {up ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          {Math.abs(pct).toFixed(0)}%
        </Flex>
      )}
    </Badge>
  )
}

function SectionHeader({ title, sub, action }) {
  return (
    <Flex justify="between" align="center" mb="3" wrap="wrap" gap="2">
      <Box>
        <Heading size="3" weight="bold" style={{ color: 'var(--gray-12)' }}>
          {title}
        </Heading>
        {sub && (
          <Text size="1" color="gray">
            {sub}
          </Text>
        )}
      </Box>
      {action}
    </Flex>
  )
}

function UsageEmpty({ onPrd, onUi }) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      p="6"
      gap="2"
      style={{
        border: '1px dashed var(--gray-5)',
        borderRadius: '8px',
        backgroundColor: 'var(--gray-1)',
        minHeight: '150px',
        textAlign: 'center',
      }}
    >
      <Sparkles size={20} style={{ color: 'var(--blue-9)' }} />
      <Text size="2" weight="bold" style={{ color: 'var(--gray-12)' }}>
        No AI usage recorded in this window
      </Text>
      <Text size="1" style={{ color: 'var(--gray-10)' }} as="div">
        Generate a PRD or build a UI mockup to start seeing token, call and cost metrics.
      </Text>
      <Flex gap="2" mt="2">
        {onPrd && (
          <Button size="1" variant="soft" color="blue" radius="sm" onClick={onPrd}>
            Generate PRD
          </Button>
        )}
        {onUi && (
          <Button size="1" variant="soft" color="gray" radius="sm" onClick={onUi}>
            Build UI mockup
          </Button>
        )}
      </Flex>
    </Flex>
  )
}

function ActivityItem({ item }) {
  const color = item.action?.includes('created') ? 'green' : item.action?.includes('deleted') ? 'red' : 'blue'
  const icon =
    color === 'green' ? (
      <Sparkles size={13} />
    ) : color === 'red' ? (
      <Bug size={13} />
    ) : (
      <Activity size={13} />
    )
  return (
    <Flex align="start" gap="3" style={{ position: 'relative' }}>
      <Flex
        align="center"
        justify="center"
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: `var(--${color}-3)`,
          color: `var(--${color}-9)`,
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        {icon}
      </Flex>
      <Box style={{ minWidth: 0, flex: 1 }}>
        <Text size="2" weight="medium" style={{ color: 'var(--gray-12)', wordBreak: 'break-word' }}>
          {String(item.action || 'event').replace(/\./g, ' ')}
        </Text>
        <Flex gap="2" align="center" mt="1">
          <Text size="1" style={{ color: 'var(--gray-9)' }}>
            {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
          </Text>
          {item.entity_id && (
            <Text size="1" style={{ color: 'var(--gray-9)', fontFamily: 'monospace' }}>
              {String(item.entity_id).slice(0, 8)}
            </Text>
          )}
        </Flex>
      </Box>
    </Flex>
  )
}

function QuotaRow({ title, used, total, unit = '', icon }) {
  const pct = total === null || total === undefined ? null : total > 0 ? Math.min(100, (used / total) * 100) : 0
  const barColor =
    pct === null
      ? 'var(--blue-6)'
      : pct >= 100
        ? 'var(--red-9)'
        : pct >= 80
          ? 'var(--amber-9)'
          : 'var(--blue-9)'
  return (
    <Box>
      <Flex justify="between" align="center" mb="1">
        <Flex align="center" gap="2">
          <Box style={{ color: 'var(--gray-9)' }}>{icon}</Box>
          <Text size="1" weight="bold" style={{ color: 'var(--gray-11)' }}>
            {title}
          </Text>
        </Flex>
        <Text size="1" weight="bold" style={{ color: 'var(--gray-12)' }}>
          {total === null || total === undefined ? `${fmtCompact(used)}${unit}` : `${fmtCompact(used)} / ${fmtCompact(total)}${unit}`}
        </Text>
      </Flex>
      <Box style={{ height: 6, borderRadius: 999, background: 'var(--gray-4)', overflow: 'hidden' }}>
        <Box
          style={{
            height: '100%',
            width: `${pct === null ? 100 : pct}%`,
            borderRadius: 999,
            background: barColor,
            opacity: pct === null ? 0.25 : 1,
          }}
        />
      </Box>
    </Box>
  )
}

function LoadingDashboard() {
  return (
    <Flex direction="column" gap="6">
      <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} size="2" style={{ borderRadius: '10px' }}>
            <Skeleton height="28px" width="28px" />
            <Skeleton height="26px" mt="3" />
            <Skeleton height="12px" mt="2" width="60%" />
          </Card>
        ))}
      </Grid>
      <Grid columns={{ initial: '1', lg: '2' }} gap="4">
        <Card size="2" style={{ borderRadius: '10px' }}>
          <Skeleton height="16px" width="40%" />
          <Skeleton height="160px" mt="3" />
        </Card>
        <Card size="2" style={{ borderRadius: '10px' }}>
          <Skeleton height="16px" width="40%" />
          <Skeleton height="160px" mt="3" />
        </Card>
      </Grid>
    </Flex>
  )
}

export function DashboardPage() {
  const { orgId, projectId } = useParams()
  const navigate = useNavigate()
  const [days, setDays] = useState(7)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)
  const { unread: unreadNotifications } = useNotificationUnread(orgId)

  const projectPath = `/organizations/${orgId}/projects/${projectId}`

  const loadSummary = useCallback(
    async (silent = false) => {
      if (!orgId || !projectId) return
      if (!silent) setLoading(true)
      else setRefreshing(true)
      setError('')
      try {
        const data = await getOwnerDashboardSummary(orgId, projectId, days)
        setSummary(data)
      } catch (err) {
        if (!silent) setError(err instanceof Error ? err.message : 'Failed to load dashboard summary')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [orgId, projectId, days]
  )

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  useEffect(() => {
    const t = setInterval(() => loadSummary(true), 60_000)
    return () => clearInterval(t)
  }, [loadSummary])

  const llm = useMemo(() => summary?.llm_usage || {}, [summary])
  const kpis = useMemo(() => summary?.kpis || {}, [summary])
  const plan = useMemo(() => summary?.plan || {}, [summary])
  const delta = useMemo(() => summary?.usage_delta || {}, [summary])
  const activity = summary?.recent_activity || []

  const tokensQuota = plan.quotas?.find((q) => q.key === 'ai_tokens')
  const projectsQuota = plan.quotas?.find((q) => q.key === 'projects')
  const membersQuota = plan.quotas?.find((q) => q.key === 'team_members')

  const taskSegments = [
    { label: 'To do', value: kpis.tasks_by_status?.todo, color: 'var(--gray-7)' },
    { label: 'In progress', value: kpis.tasks_by_status?.in_progress, color: 'var(--blue-9)' },
    { label: 'Done', value: kpis.tasks_by_status?.done, color: 'var(--green-9)' },
    { label: 'Blocked', value: kpis.tasks_by_status?.blocked, color: 'var(--red-9)' },
  ]

  return (
    <ScrollArea type="auto" scrollbars="vertical" style={{ height: '100%' }}>
      <Box p="8" style={{ minHeight: '100%', backgroundColor: 'var(--gray-1)' }}>
        <Flex direction="column" gap="6" style={{ width: '100%', maxWidth: 1200, margin: '0 auto' }}>
          <Flex justify="between" align="flex-start" wrap="wrap" gap="4">
            <Box>
              <Heading size="7" weight="bold" mb="1" style={{ letterSpacing: '-0.02em', color: 'var(--gray-12)' }}>
                {summary?.project?.name || 'Dashboard'}
              </Heading>
              <Flex align="center" gap="2" wrap="wrap">
                <Badge size="1" color={statusColor(summary?.project?.status)} variant="soft" radius="full">
                  {summary?.project?.status || 'active'}
                </Badge>
                <Text size="2" color="gray">
                  {summary?.project?.description}
                </Text>
              </Flex>
            </Box>

            <Flex align="center" gap="3" wrap="wrap">
              <Flex align="center" gap="1" style={{ background: 'var(--gray-3)', padding: 3, borderRadius: 8 }}>
                {[7, 30, 90].map((d) => (
                  <Button
                    key={d}
                    size="1"
                    radius="sm"
                    variant={days === d ? 'solid' : 'ghost'}
                    color={days === d ? 'blue' : 'gray'}
                    onClick={() => setDays(d)}
                  >
                    {d}d
                  </Button>
                ))}
              </Flex>
              <Button size="1" variant="outline" color="gray" radius="sm" onClick={() => loadSummary(true)} disabled={refreshing}>
                <RefreshCw size={12} className={refreshing ? 'dv-spin' : ''} /> Refresh
              </Button>
              <Text size="1" color="gray">
                Updated {summary ? new Date().toLocaleTimeString() : '—'}
              </Text>
            </Flex>
          </Flex>

          {error && (
            <Card variant="ghost" size="2" style={{ borderRadius: 8, border: '1px solid var(--red-6)' }}>
              <Flex justify="between" align="center" gap="3">
                <Text size="2" color="red">
                  {error}
                </Text>
                <Button size="1" variant="soft" color="red" radius="sm" onClick={() => loadSummary()}>
                  Retry
                </Button>
              </Flex>
            </Card>
          )}

          {loading ? (
            <LoadingDashboard />
          ) : (
            <>
              <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4">
                <KpiCard
                  icon={<Zap size={16} />}
                  label="AI Tokens"
                  value={fmtCompact(llm.total_tokens)}
                  tone="blue"
                  badge={tokensQuota?.total ? <Badge size="1" color="blue" variant="soft">{Math.round((tokensQuota.used / tokensQuota.total) * 100)}%</Badge> : null}
                  caption={
                    tokensQuota?.total
                      ? `${fmtCompact(tokensQuota.used)} / ${fmtCompact(tokensQuota.total)} tokens`
                      : `${fmtNum(llm.input_tokens)} in · ${fmtNum(llm.output_tokens)} out`
                  }
                  onClick={() => navigate(`/organizations/${orgId}/usage`)}
                />
                <KpiCard
                  icon={<Activity size={16} />}
                  label="AI Calls"
                  value={fmtNum(llm.requests)}
                  tone="purple"
                  badge={<Delta pct={delta.requests_pct} />}
                  caption={`${days}d window · avg ${fmtNum(llm.avg_tokens_per_request)} tokens/req`}
                  onClick={() => navigate(`/organizations/${orgId}/usage`)}
                />
                <KpiCard
                  icon={<Coins size={16} />}
                  label="Est. Cost"
                  value={`$${Number(llm.estimated_cost || 0).toFixed(2)}`}
                  tone="green"
                  badge={<Delta pct={delta.tokens_pct} />}
                  caption="Estimated at current token rates"
                  onClick={() => navigate(`/organizations/${orgId}/billing`)}
                />
                <KpiCard
                  icon={<Layout size={16} />}
                  label="Decisions"
                  value={fmtNum(kpis.decisions_total)}
                  tone="amber"
                  caption={`${fmtNum(kpis.decisions_window)} this period · ${fmtNum(kpis.project_decisions)} in project`}
                  onClick={() => navigate(`${projectPath}/dashboard/ui-builder`)}
                />
                <KpiCard
                  icon={<FileText size={16} />}
                  label="PRD Docs"
                  value={fmtNum(kpis.prd_docs)}
                  tone="cyan"
                  caption={`${fmtNum(kpis.prd_runs_window)} runs this period`}
                  onClick={() => navigate(`${projectPath}/dashboard/document-management`)}
                />
                <KpiCard
                  icon={<Bug size={16} />}
                  label="Open Issues"
                  value={fmtNum(kpis.open_issues)}
                  tone="red"
                  caption={`${fmtNum(kpis.feedback_total)} total feedback items`}
                  onClick={() => navigate(`/organizations/${orgId}/feedback`)}
                />
              </Grid>

              <Grid columns={{ initial: '1', lg: '2' }} gap="4">
                <Card size="2" style={{ borderRadius: '10px' }}>
                  <SectionHeader
                    title="Token usage"
                    sub={`Daily input + output tokens · last ${days} days`}
                    action={
                      <Text size="2" weight="bold" style={{ color: 'var(--blue-9)' }}>
                        {fmtCompact(llm.total_tokens)}
                      </Text>
                    }
                  />
                  {llm.daily?.length ? (
                    llm.requests > 0 ? (
                      <AreaTrend
                        data={llm.daily}
                        color="var(--blue-9)"
                        softColor="var(--blue-9)"
                        format={(v) => `${fmtCompact(v)} tokens`}
                      />
                    ) : (
                      <UsageEmpty
                        onPrd={() => navigate(`${projectPath}/dashboard/agentsMain`)}
                        onUi={() => navigate(`${projectPath}/dashboard/ui-builder`)}
                      />
                    )
                  ) : (
                    <UsageEmpty onPrd={() => navigate(`${projectPath}/dashboard/agentsMain`)} onUi={() => navigate(`${projectPath}/dashboard/ui-builder`)} />
                  )}
                </Card>

                <Card size="2" style={{ borderRadius: '10px' }}>
                  <SectionHeader
                    title="AI calls per day"
                    sub={`Requests to AI features · last ${days} days`}
                    action={
                      <Text size="2" weight="bold" style={{ color: 'var(--green-9)' }}>
                        {fmtNum(llm.requests)}
                      </Text>
                    }
                  />
                  {llm.daily?.length ? (
                    llm.requests > 0 ? (
                      <BarSeries
                        data={llm.daily}
                        color="var(--green-9)"
                        format={(v) => `${v} calls`}
                      />
                    ) : (
                      <UsageEmpty onPrd={() => navigate(`${projectPath}/dashboard/agentsMain`)} onUi={() => navigate(`${projectPath}/dashboard/ui-builder`)} />
                    )
                  ) : (
                    <UsageEmpty onPrd={() => navigate(`${projectPath}/dashboard/agentsMain`)} onUi={() => navigate(`${projectPath}/dashboard/ui-builder`)} />
                  )}
                </Card>
              </Grid>

              <Grid columns={{ initial: '1', lg: '2' }} gap="4">
                <Card size="2" style={{ borderRadius: '10px' }}>
                  <SectionHeader
                    title="Plan & capacity"
                    sub={`${plan.name || 'Free'} plan${plan.quota_exceeded ? ' · quota exceeded' : ''}`}
                    action={
                      plan.quota_exceeded ? (
                        <Badge size="1" color="red" variant="soft">
                          Exceeded
                        </Badge>
                      ) : (
                        <Button size="1" variant="ghost" color="gray" radius="sm" onClick={() => navigate(`/organizations/${orgId}/billing`)}>
                          Manage plan <ArrowRight size={12} />
                        </Button>
                      )
                    }
                  />
                  <Flex direction="column" gap="4">
                    <QuotaRow
                      title="AI Tokens"
                      used={tokensQuota?.used || 0}
                      total={tokensQuota?.total}
                      unit=""
                      icon={<Zap size={13} />}
                    />
                    <QuotaRow
                      title="Projects"
                      used={projectsQuota?.used || 0}
                      total={projectsQuota?.total}
                      icon={<Layout size={13} />}
                    />
                    <QuotaRow
                      title="Team Members"
                      used={membersQuota?.used || 0}
                      total={membersQuota?.total}
                      icon={<Users size={13} />}
                    />
                  </Flex>
                  <Flex gap="4" mt="4" wrap="wrap">
                    <Flex align="center" gap="2">
                      <Users size={13} style={{ color: 'var(--gray-9)' }} />
                      <Text size="1" color="gray">
                        {fmtNum(kpis.members)} active members
                      </Text>
                    </Flex>
                    <Flex align="center" gap="2">
                      <ListChecks size={13} style={{ color: 'var(--gray-9)' }} />
                      <Text size="1" color="gray">
                        {fmtNum(kpis.sprints_total)} active sprint{kpis.sprints_total === 1 ? '' : 's'}
                      </Text>
                    </Flex>
                    <Flex
                      align="center"
                      gap="2"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/organizations/${orgId}/details`)}
                    >
                      <Bell size={13} style={{ color: unreadNotifications ? 'var(--red-9)' : 'var(--gray-9)' }} />
                      <Text size="1" color="gray">
                        {fmtNum(unreadNotifications)} unread notifications
                      </Text>
                    </Flex>
                  </Flex>
                </Card>

                <Card size="2" style={{ borderRadius: '10px' }}>
                  <SectionHeader
                    title="Recent activity"
                    sub="Audit trail for this project"
                    action={
                      activity.length ? (
                        <Button size="1" variant="ghost" color="gray" radius="sm" onClick={() => navigate(`/organizations/${orgId}/troubleshooting`)}>
                          View logs <ArrowRight size={12} />
                        </Button>
                      ) : null
                    }
                  />
                  {activity.length ? (
                    <Flex direction="column" gap="4">
                      {activity.map((item) => (
                        <ActivityItem key={item.id} item={item} />
                      ))}
                    </Flex>
                  ) : (
                    <Flex direction="column" align="center" justify="center" p="6" gap="2" style={{ border: '1px dashed var(--gray-5)', borderRadius: 8, backgroundColor: 'var(--gray-1)', minHeight: 150, textAlign: 'center' }}>
                      <Inbox size={18} style={{ color: 'var(--gray-7)' }} />
                      <Text size="2" style={{ color: 'var(--gray-10)' }}>
                        No activity in this window yet
                      </Text>
                    </Flex>
                  )}
                </Card>
              </Grid>

              <Grid columns={{ initial: '1', lg: '2' }} gap="4">
                <Card size="2" style={{ borderRadius: '10px' }}>
                  <SectionHeader
                    title="Task & sprint progress"
                    sub={`${fmtNum(kpis.tasks_total)} tasks across ${fmtNum(kpis.sprints_total)} sprint${kpis.sprints_total === 1 ? '' : 's'}`}
                    action={
                      <Button size="1" variant="ghost" color="gray" radius="sm" onClick={() => navigate(`${projectPath}/tasks`)}>
                        Open tasks <ArrowRight size={12} />
                      </Button>
                    }
                  />
                  {kpis.tasks_total > 0 ? (
                    <Donut
                      segments={taskSegments}
                      centerLabel={fmtNum(kpis.tasks_total)}
                      centerSub="tasks"
                    />
                  ) : (
                    <Flex direction="column" align="center" justify="center" p="6" gap="2" style={{ border: '1px dashed var(--gray-5)', borderRadius: 8, backgroundColor: 'var(--gray-1)', minHeight: 150, textAlign: 'center' }}>
                      <ListChecks size={18} style={{ color: 'var(--gray-7)' }} />
                      <Text size="2" style={{ color: 'var(--gray-10)' }}>
                        No tasks yet
                      </Text>
                      <Button size="1" variant="soft" color="blue" radius="sm" mt="2" onClick={() => navigate(`${projectPath}/tasks`)}>
                        Create a task
                      </Button>
                    </Flex>
                  )}
                </Card>

                <Card size="2" style={{ borderRadius: '10px' }}>
                  <SectionHeader
                    title="Notifications & feedback"
                    sub="Recent signals that may need attention"
                    action={
                      <Button size="1" variant="ghost" color="gray" radius="sm" onClick={() => navigate(`/organizations/${orgId}/details`)}>
                        View all <ArrowRight size={12} />
                      </Button>
                    }
                  />
                  <Grid columns={{ initial: '1', sm: '3' }} gap="3">
                    {[
                      { icon: <Bell size={16} />, label: 'Unread', value: unreadNotifications, tone: 'red' },
                      { icon: <Bug size={16} />, label: 'Open issues', value: kpis.open_issues, tone: 'amber' },
                      { icon: <Activity size={16} />, label: 'Active AI runs', value: kpis.active_prd_runs, tone: 'blue' },
                    ].map((s, i) => (
                      <Flex
                        key={i}
                        direction="column"
                        align="center"
                        justify="center"
                        p="4"
                        gap="1"
                        style={{ border: '1px solid var(--gray-4)', borderRadius: 8, backgroundColor: 'var(--gray-1)' }}
                      >
                        <Box style={{ color: `var(--${s.tone}-9)` }}>{s.icon}</Box>
                        <Text size="4" weight="bold" style={{ color: 'var(--gray-12)' }}>
                          {fmtNum(s.value)}
                        </Text>
                        <Text size="1" style={{ color: 'var(--gray-9)' }}>
                          {s.label}
                        </Text>
                      </Flex>
                    ))}
                  </Grid>
                </Card>
              </Grid>
            </>
          )}
        </Flex>
      </Box>
    </ScrollArea>
  )
}
