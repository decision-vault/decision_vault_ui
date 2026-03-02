import { useEffect, useMemo, useState } from 'react'
import { Badge, Box, Button, Flex, Text } from '@radix-ui/themes'
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import {
  getSchemaFlowRunStatus,
  pauseSchemaFlowRun,
  resumeSchemaFlowRun,
  stopSchemaFlowRun,
} from '../../services/requirementsApi'
import {
  clearActiveSchemaRun,
  getActiveSchemaRun,
  getSchemaTrackerCollapsed,
  setActiveSchemaRun,
  setSchemaTrackerCollapsed,
} from '../../services/schemaRunTracker'

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

export function GlobalSchemaRunTracker() {
  const [activeRun, setActiveRun] = useState(() => getActiveSchemaRun())
  const [collapsed, setCollapsed] = useState(() => getSchemaTrackerCollapsed())
  const [error, setError] = useState('')
  const [steps, setSteps] = useState([])
  const [totalElapsed, setTotalElapsed] = useState(null)

  useEffect(() => {
    const sync = () => setActiveRun(getActiveSchemaRun())
    window.addEventListener('dv:schema-run-updated', sync)
    return () => window.removeEventListener('dv:schema-run-updated', sync)
  }, [])

  useEffect(() => {
    if (!activeRun) return
    if (!activeRun.runId && activeRun.status === 'running') {
      setError('Schema run id missing. Start schema generation again.')
      setActiveSchemaRun({ ...activeRun, status: 'failed', message: 'Run id missing.' })
      setActiveRun((prev) => (prev ? { ...prev, status: 'failed', message: 'Run id missing.' } : prev))
    }
  }, [activeRun])

  useEffect(() => {
    if (!activeRun?.orgId || !activeRun?.projectId || !activeRun?.startedAt || !activeRun?.runId) return undefined
    let stopped = false
    let timer = null

    const poll = async () => {
      const startedAt = Number(activeRun.startedAt) || Date.now()
      const elapsed = Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
      setTotalElapsed(elapsed)

      try {
        const run = await getSchemaFlowRunStatus(activeRun.orgId, activeRun.projectId, activeRun.runId)
        if (stopped) return
        setSteps(Array.isArray(run?.steps) ? run.steps : [])
        setError(run?.error || '')
        setTotalElapsed(run?.timing?.total_elapsed_seconds ?? elapsed)
        const status = run?.status || 'running'
        setActiveSchemaRun({ ...activeRun, status, message: run?.error || '' })
        setActiveRun((prev) => (prev ? { ...prev, status, message: run?.error || '' } : prev))
        if (status === 'completed') {
          timer = window.setTimeout(() => clearActiveSchemaRun(), 5000)
          return
        }
        if (status === 'failed' || status === 'stopped') {
          return
        }
      } catch (e) {
        if (stopped) return
        setError(e instanceof Error ? e.message : 'Failed to poll schema run')
      }

      if (elapsed > 10 * 60) {
        setError('Schema generation tracking timed out.')
        setActiveSchemaRun({ ...activeRun, status: 'failed', message: 'Tracking timed out.' })
        setActiveRun((prev) => (prev ? { ...prev, status: 'failed', message: 'Tracking timed out.' } : prev))
        return
      }

      setActiveSchemaRun({ ...activeRun, status: 'running', message: '' })
      timer = window.setTimeout(poll, 2000)
    }

    poll()
    return () => {
      stopped = true
      if (timer) window.clearTimeout(timer)
    }
  }, [activeRun?.orgId, activeRun?.projectId, activeRun?.startedAt, activeRun?.runId])

  const status = activeRun?.status || 'running'
  const title = useMemo(() => {
    if (!activeRun?.projectId) return 'Schema Run'
    return `Schema Run • ${activeRun.projectId.slice(-6)}`
  }, [activeRun?.projectId])

  if (!activeRun?.startedAt) return null

  return (
    <Box
      style={{
        position: 'fixed',
        right: 0,
        top: '78%',
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
          setSchemaTrackerCollapsed(next)
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
            <Badge color={statusColor(status)}>{status}</Badge>
          </Flex>
          <Text size="1" color="gray" style={{ display: 'block', marginBottom: 8 }}>
            Total runtime: {formatDuration(totalElapsed)}
          </Text>
          {activeRun?.message ? (
            <Text size="1" color="gray" style={{ display: 'block', marginBottom: 8 }}>{activeRun.message}</Text>
          ) : null}
          {error ? (
            <Text size="1" color="red" style={{ display: 'block', marginBottom: 8 }}>{error}</Text>
          ) : null}
          <Flex direction="column" gap="2" style={{ maxHeight: 180, overflowY: 'auto' }}>
            {(steps.length > 0 ? steps : [{ stage: 'schema_generation', status }]).map((step, idx) => (
              <Flex key={`${step.stage || 'stage'}-${idx}`} justify="between" align="center">
                <Flex direction="column" gap="0">
                  <Text size="1">{step.stage || 'schema_generation'}</Text>
                  <Text size="1" color="gray">Done in: {formatDuration(step.duration_seconds)}</Text>
                </Flex>
                <Badge color={statusColor(step.status)} size="1">{step.status || 'queued'}</Badge>
              </Flex>
            ))}
          </Flex>
          <Flex justify="end" mt="3" gap="2">
            {status === 'running' ? (
              <Button
                variant="soft"
                size="1"
                color="amber"
                onClick={async () => {
                  if (!activeRun?.runId) return
                  await pauseSchemaFlowRun(activeRun.orgId, activeRun.projectId, activeRun.runId)
                  setActiveSchemaRun({ ...activeRun, status: 'paused' })
                  setActiveRun((prev) => (prev ? { ...prev, status: 'paused' } : prev))
                }}
              >
                Pause
              </Button>
            ) : null}
            {status === 'paused' ? (
              <Button
                variant="soft"
                size="1"
                color="blue"
                onClick={async () => {
                  if (!activeRun?.runId) return
                  await resumeSchemaFlowRun(activeRun.orgId, activeRun.projectId, activeRun.runId)
                  setActiveSchemaRun({ ...activeRun, status: 'running' })
                  setActiveRun((prev) => (prev ? { ...prev, status: 'running' } : prev))
                }}
              >
                Resume
              </Button>
            ) : null}
            {(status === 'running' || status === 'paused' || status === 'queued') ? (
              <Button
                variant="soft"
                size="1"
                color="red"
                onClick={async () => {
                  if (!activeRun?.runId) return
                  await stopSchemaFlowRun(activeRun.orgId, activeRun.projectId, activeRun.runId)
                  setActiveSchemaRun({ ...activeRun, status: 'stopped', message: 'Run stopped by user.' })
                  setActiveRun((prev) => (prev ? { ...prev, status: 'stopped', message: 'Run stopped by user.' } : prev))
                }}
              >
                Stop
              </Button>
            ) : null}
            <Button variant="soft" size="1" color="gray" onClick={() => clearActiveSchemaRun()}>
              Dismiss
            </Button>
          </Flex>
        </Box>
      ) : null}
    </Box>
  )
}
