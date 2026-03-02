import { useEffect, useMemo, useState } from 'react'
import { Badge, Box, Button, Flex, Text } from '@radix-ui/themes'
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { getLlmPrdRunStatus, pauseLlmPrdRun, resumeLlmPrdRun, stopLlmPrdRun } from '../../services/requirementsApi'
import {
  clearActivePrdRun,
  getActivePrdRun,
  getPrdTrackerCollapsed,
  setActivePrdRun,
  setPrdTrackerCollapsed,
} from '../../services/prdRunTracker'

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

export function GlobalPrdRunTracker() {
  const [activeRun, setActiveRun] = useState(() => getActivePrdRun())
  const [collapsed, setCollapsed] = useState(() => getPrdTrackerCollapsed())
  const [steps, setSteps] = useState([])
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState('')
  const [totalElapsed, setTotalElapsed] = useState(null)

  useEffect(() => {
    const sync = () => setActiveRun(getActivePrdRun())
    window.addEventListener('dv:prd-run-updated', sync)
    return () => window.removeEventListener('dv:prd-run-updated', sync)
  }, [])

  useEffect(() => {
    if (!activeRun?.runId || !activeRun?.orgId || !activeRun?.projectId) return undefined
    let stopped = false
    let timer = null

    const poll = async () => {
      try {
        const run = await getLlmPrdRunStatus(activeRun.orgId, activeRun.projectId, activeRun.runId)
        if (stopped) return
        setSteps(Array.isArray(run?.steps) ? run.steps : [])
        setError(run?.error || '')
        setTotalElapsed(run?.timing?.total_elapsed_seconds ?? null)
        const status = run?.status || 'running'
        setActivePrdRun({ ...activeRun, status })
        setActiveRun((prev) => (prev ? { ...prev, status } : prev))

        if (status === 'completed' || status === 'failed' || status === 'stopped') {
          timer = window.setTimeout(() => {
            clearActivePrdRun()
            setSteps([])
            setError('')
          }, 5000)
          return
        }
      } catch (e) {
        if (stopped) return
        setError(e instanceof Error ? e.message : 'Failed to poll run status')
      }
      timer = window.setTimeout(poll, 2000)
    }

    poll()
    return () => {
      stopped = true
      if (timer) window.clearTimeout(timer)
    }
  }, [activeRun?.runId, activeRun?.orgId, activeRun?.projectId])

  const status = activeRun?.status || ''
  const title = useMemo(() => {
    if (!activeRun?.projectId) return 'PRD Run'
    return `PRD Run • ${activeRun.projectId.slice(-6)}`
  }, [activeRun?.projectId])

  if (!activeRun?.runId) return null

  return (
    <Box
      style={{
        position: 'fixed',
        right: 0,
        top: '50%',
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
          setPrdTrackerCollapsed(next)
        }}
        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
      >
        {collapsed ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </Button>
      {!collapsed ? (
        <Box
          p="3"
          style={{
            width: 320,
            background: 'var(--color-panel-solid)',
            border: '1px solid var(--gray-6)',
            borderRight: 'none',
            borderTopLeftRadius: 'var(--radius-3)',
            borderBottomLeftRadius: 'var(--radius-3)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.16)',
          }}
        >
          <Flex justify="between" align="center" mb="2">
            <Text size="2" weight="bold">{title}</Text>
            <Badge color={statusColor(status)}>{status || 'queued'}</Badge>
          </Flex>
          <Text size="1" color="gray" style={{ display: 'block', marginBottom: 8 }}>
            Total runtime: {formatDuration(totalElapsed)}
          </Text>
          {error ? (
            <Text size="1" color="red" style={{ display: 'block', marginBottom: 8 }}>{error}</Text>
          ) : null}
          <Flex direction="column" gap="2" style={{ maxHeight: 220, overflowY: 'auto' }}>
            {(steps.length > 0 ? steps : [{ stage: 'queued', status: status || 'queued' }]).map((step, idx) => (
              <Flex key={`${step.stage || 'stage'}-${idx}`} justify="between" align="center">
                <Flex direction="column" gap="0">
                  <Text size="1">{step.stage || 'queued'}</Text>
                  <Text size="1" color="gray">Done in: {formatDuration(step.duration_seconds)}</Text>
                </Flex>
                <Badge color={statusColor(step.status)} size="1">{step.status || 'queued'}</Badge>
              </Flex>
            ))}
          </Flex>
          <Flex justify="end" mt="3" gap="2" wrap="wrap">
            {status === 'running' ? (
              <Button
                variant="soft"
                size="1"
                color="amber"
                disabled={actionLoading !== ''}
                onClick={async () => {
                  if (!activeRun) return
                  setActionLoading('pause')
                  try {
                    await pauseLlmPrdRun(activeRun.orgId, activeRun.projectId, activeRun.runId)
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
                  if (!activeRun) return
                  setActionLoading('resume')
                  try {
                    await resumeLlmPrdRun(activeRun.orgId, activeRun.projectId, activeRun.runId)
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
                  if (!activeRun) return
                  setActionLoading('stop')
                  try {
                    await stopLlmPrdRun(activeRun.orgId, activeRun.projectId, activeRun.runId)
                    clearActivePrdRun()
                    setSteps([])
                  } finally {
                    setActionLoading('')
                  }
                }}
              >
                {actionLoading === 'stop' ? 'Stopping...' : 'Stop'}
              </Button>
            ) : null}
            <Button variant="soft" size="1" color="gray" onClick={() => clearActivePrdRun()}>
              Dismiss
            </Button>
          </Flex>
        </Box>
      ) : null}
    </Box>
  )
}
