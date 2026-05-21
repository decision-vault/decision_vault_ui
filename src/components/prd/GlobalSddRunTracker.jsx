import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Badge, Box, Button, Flex, Text } from '@radix-ui/themes'
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import {
  getRequirementsSystemDesignRunStatus,
  pauseRequirementsSystemDesignRun,
  resumeRequirementsSystemDesignRun,
  stopRequirementsSystemDesignRun,
} from '../../services/requirementsApi'
import {
  clearActiveSddRun,
  getActiveSddRun,
  getSddTrackerCollapsed,
  setActiveSddRun,
  setSddTrackerCollapsed,
} from '../../services/sddRunTracker'

function statusColor(status) {
  if (status === 'completed') return 'green'
  if (status === 'failed') return 'red'
  if (status === 'stopped') return 'red'
  if (status === 'paused') return 'amber'
  if (status === 'running') return 'blue'
  return 'gray'
}

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) return '--'
  const total = Math.max(0, Math.floor(Number(seconds)))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function stageLabel(stage) {
  return String(stage || '')
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

export function GlobalSddRunTracker() {
  const STATUS_POLL_INTERVAL_MS = 10_000
  const [activeRun, setActiveRun] = useState(() => getActiveSddRun())
  const [collapsed, setCollapsed] = useState(() => getSddTrackerCollapsed())
  const [error, setError] = useState('')
  const [steps, setSteps] = useState([])
  const [totalElapsed, setTotalElapsed] = useState(null)
  const [actionLoading, setActionLoading] = useState('')

  useEffect(() => {
    const sync = () => setActiveRun(getActiveSddRun())
    window.addEventListener('dv:sdd-run-updated', sync)
    return () => window.removeEventListener('dv:sdd-run-updated', sync)
  }, [])

  useEffect(() => {
    if (!activeRun) return
    if (!activeRun.runId && activeRun.status === 'running') {
      setError('SDD run id missing. Start SDD generation again.')
      setActiveSddRun({ ...activeRun, status: 'failed', message: 'Run id missing.' })
      setActiveRun((prev) => (prev ? { ...prev, status: 'failed', message: 'Run id missing.' } : prev))
    }
  }, [activeRun])

  useEffect(() => {
    if (!activeRun?.orgId || !activeRun?.projectId || !activeRun?.startedAt || !activeRun?.runId) return undefined
    if (activeRun?.status === 'completed' || activeRun?.status === 'failed' || activeRun?.status === 'stopped') return undefined
    let stopped = false
    let timer = null

    const poll = async () => {
      if (stopped) return
      const startedAt = Number(activeRun.startedAt) || Date.now()
      const elapsed = Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
      setTotalElapsed(elapsed)

      try {
        const run = await getRequirementsSystemDesignRunStatus(activeRun.orgId, activeRun.projectId, activeRun.runId)
        if (stopped) return
        setSteps(Array.isArray(run?.steps) ? run.steps : [])
        setError(run?.error || '')
        setTotalElapsed(run?.timing?.total_elapsed_seconds ?? elapsed)
        const status = run?.status || 'running'
        setActiveSddRun({ ...activeRun, status, message: run?.error || '' })
        setActiveRun((prev) => (prev ? { ...prev, status, message: run?.error || '' } : prev))
        if (status === 'completed') {
          timer = window.setTimeout(() => clearActiveSddRun(), 5000)
          return
        }
        if (status === 'failed' || status === 'stopped') {
          return
        }
      } catch (e) {
        if (stopped) return
        const msg = e instanceof Error ? e.message : 'Failed to poll SDD run'
        if (String(msg).toLowerCase().includes('tenant mismatch')) {
          setError('SDD tracker cleared: run belongs to a different tenant.')
          clearActiveSddRun()
          setActiveRun(null)
          return
        }
        setError(msg)
      }

      // Do not mark long-running jobs as failed on client timeout;
      // backend status is the source of truth.
      setActiveSddRun({ ...activeRun, status: activeRun.status || 'running', message: '' })
      timer = window.setTimeout(poll, STATUS_POLL_INTERVAL_MS)
    }

    poll()
    return () => {
      stopped = true
      if (timer) window.clearTimeout(timer)
    }
  }, [activeRun?.orgId, activeRun?.projectId, activeRun?.startedAt, activeRun?.runId])

  const status = activeRun?.status || 'running'
  const title = useMemo(() => {
    if (!activeRun?.projectId) return 'SDD Run'
    return `SDD Run • ${activeRun.projectId.slice(-6)}`
  }, [activeRun?.projectId])

  const stepItems = steps.length > 0 ? steps : [{ stage: 'sdd_generation', status: status || 'queued' }]
  const latestCompletedIdx = (() => {
    for (let i = stepItems.length - 1; i >= 0; i -= 1) {
      if (String(stepItems[i]?.status || '') === 'completed') return i
    }
    return -1
  })()
  const progressPct = (() => {
    if (stepItems.length <= 1) return status === 'completed' ? 100 : status ? 30 : 0
    const done = latestCompletedIdx + 1
    return Math.max(0, Math.min(100, Math.round((done / stepItems.length) * 100)))
  })()

  if (!activeRun?.startedAt) return null

  if (typeof document === 'undefined') return null

  return createPortal((
    <Box
      style={{
        position: 'fixed',
        right: 0,
        top: '62%',
        transform: 'translateY(-50%)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'stretch',
      }}
    >
      <Button
        variant="solid"
        size="2"
        onClick={() => {
          const next = !collapsed
          setCollapsed(next)
          setSddTrackerCollapsed(next)
        }}
        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
      >
        {collapsed ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </Button>
      {!collapsed ? (
        <Box
          p="3"
          style={{
            width: 340,
            background: 'linear-gradient(180deg, rgba(99,102,241,0.14), rgba(0,0,0,0))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRight: 'none',
            borderTopLeftRadius: 'var(--radius-3)',
            borderBottomLeftRadius: 'var(--radius-3)',
            boxShadow: '0 16px 44px rgba(0,0,0,0.28)',
          }}
        >
          <Flex justify="between" align="center" mb="2">
            <Text size="2" weight="bold">{title}</Text>
            <Badge color={statusColor(status)}>{status}</Badge>
          </Flex>
          <Box
            style={{
              height: 6,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.10)',
              overflow: 'hidden',
              marginBottom: 10,
            }}
          >
            <Box style={{ height: '100%', width: `${progressPct}%`, background: 'rgba(99,102,241,0.65)' }} />
          </Box>
          <Text size="1" color="gray" style={{ display: 'block', marginBottom: 8 }}>
            Total runtime: {formatDuration(totalElapsed)}
          </Text>
          {activeRun?.message ? (
            <Text size="1" color="gray" style={{ display: 'block', marginBottom: 8 }}>{activeRun.message}</Text>
          ) : null}
          {error ? (
            <Text size="1" color="red" style={{ display: 'block', marginBottom: 8 }}>{error}</Text>
          ) : null}
          <Flex direction="column" gap="2" style={{ maxHeight: 190, overflowY: 'auto' }}>
            {stepItems.map((step, idx) => {
              const s = String(step?.status || 'queued')
              const stage = stageLabel(step?.stage || 'sdd_generation')
              const isActive = s === 'running' || (idx === latestCompletedIdx + 1 && status === 'running')
              const isDone = s === 'completed' || idx <= latestCompletedIdx
              return (
                <Flex key={`${step.stage || 'stage'}-${idx}`} justify="between" align="center">
                  <Flex align="center" gap="2" style={{ minWidth: 0 }}>
                    <Box
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: isDone ? 'rgba(34,197,94,0.85)' : isActive ? 'rgba(99,102,241,0.85)' : 'rgba(148,163,184,0.55)',
                        boxShadow: isActive ? '0 0 0 3px rgba(99,102,241,0.18)' : 'none',
                        flexShrink: 0,
                      }}
                    />
                    <Flex direction="column" gap="0" style={{ minWidth: 0 }}>
                      <Text size="1" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 210 }}>
                        {stage}
                      </Text>
                      <Text size="1" color="gray">Done in: {formatDuration(step.duration_seconds)}</Text>
                    </Flex>
                  </Flex>
                  <Badge color={statusColor(s)} size="1">{s}</Badge>
                </Flex>
              )
            })}
          </Flex>
          <Flex justify="end" mt="3" gap="2" wrap="wrap">
            {status === 'running' ? (
              <Button
                variant="soft"
                size="1"
                color="amber"
                disabled={actionLoading !== ''}
                onClick={async () => {
                  if (!activeRun?.runId) return
                  setActionLoading('pause')
                  try {
                    await pauseRequirementsSystemDesignRun(activeRun.orgId, activeRun.projectId, activeRun.runId)
                    setActiveSddRun({ ...activeRun, status: 'paused' })
                    setActiveRun((prev) => (prev ? { ...prev, status: 'paused' } : prev))
                  } finally {
                    setActionLoading('')
                  }
                }}
              >
                {actionLoading === 'pause' ? 'Pausing...' : 'Pause'}
              </Button>
            ) : null}
            {status === 'paused' ? (
              <Button
                variant="soft"
                size="1"
                color="blue"
                disabled={actionLoading !== ''}
                onClick={async () => {
                  if (!activeRun?.runId) return
                  setActionLoading('resume')
                  try {
                    await resumeRequirementsSystemDesignRun(activeRun.orgId, activeRun.projectId, activeRun.runId)
                    setActiveSddRun({ ...activeRun, status: 'running' })
                    setActiveRun((prev) => (prev ? { ...prev, status: 'running' } : prev))
                  } finally {
                    setActionLoading('')
                  }
                }}
              >
                {actionLoading === 'resume' ? 'Resuming...' : 'Resume'}
              </Button>
            ) : null}
            {(status === 'running' || status === 'paused' || status === 'queued') ? (
              <Button
                variant="soft"
                size="1"
                color="red"
                disabled={actionLoading !== ''}
                onClick={async () => {
                  if (!activeRun?.runId) return
                  setActionLoading('stop')
                  try {
                    await stopRequirementsSystemDesignRun(activeRun.orgId, activeRun.projectId, activeRun.runId)
                    setActiveSddRun({ ...activeRun, status: 'stopped', message: 'Run stopped by user.' })
                    setActiveRun((prev) => (prev ? { ...prev, status: 'stopped', message: 'Run stopped by user.' } : prev))
                  } finally {
                    setActionLoading('')
                  }
                }}
              >
                {actionLoading === 'stop' ? 'Stopping...' : 'Stop'}
              </Button>
            ) : null}
            <Button variant="soft" size="1" color="gray" onClick={() => clearActiveSddRun()} disabled={actionLoading !== ''}>
              Dismiss
            </Button>
          </Flex>
        </Box>
      ) : null}
    </Box>
  ), document.body)
}
