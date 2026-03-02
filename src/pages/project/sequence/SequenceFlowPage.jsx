import { useState, useCallback, useEffect } from 'react'
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Box, Flex, Text, Button, TextArea, Select, Badge } from '@radix-ui/themes'
import { ArrowLeftIcon, ArrowUpIcon } from '@radix-ui/react-icons'
import ReactMarkdown from 'react-markdown'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import SequenceParticipantNode from './SequenceParticipantNode'
import {
  getLatestRequirementsStatus,
  getUsecaseFlow,
  getUsecaseFlowVersion,
  getUsecaseFlowVersions,
  getUsecaseFlowRunStatus,
  startUsecaseFlowRun,
} from '../../../services/requirementsApi'
import { PARTICIPANT_NODE_TYPE } from './sequenceFlowData'

const nodeTypes = { [PARTICIPANT_NODE_TYPE]: SequenceParticipantNode }

const QUICK_PROMPTS = [
  'Add auth sequence: login request, token validation, and response path.',
  'Add error flow for invalid credentials and retry.',
  'Add Slack decision capture flow including webhook and storage.',
]

function normalizeUsecaseFlowResponse(resp) {
  const rawNodes = Array.isArray(resp?.nodes) ? resp.nodes : []
  const rawEdges = Array.isArray(resp?.edges) ? resp.edges : []

  const nodes = rawNodes
    .map((node, idx) => {
      const id = String(node?.id || `participant_${idx}`)
      const name = String(node?.data?.name || node?.name || id)
      const pos = node?.position || {}
      const x = Number.isFinite(Number(pos?.x)) ? Number(pos.x) : 120 + (idx % 4) * 240
      const y = Number.isFinite(Number(pos?.y)) ? Number(pos.y) : 80 + Math.floor(idx / 4) * 220
      if (!name) return null
      return {
        id,
        type: PARTICIPANT_NODE_TYPE,
        position: { x, y },
        data: { name },
      }
    })
    .filter(Boolean)

  const ids = new Set(nodes.map((n) => n.id))
  const edges = rawEdges
    .map((edge, idx) => {
      const source = String(edge?.source || '').trim()
      const target = String(edge?.target || '').trim()
      if (!source || !target || !ids.has(source) || !ids.has(target)) return null
      const label = String(edge?.label || edge?.data?.label || '').trim()
      return {
        id: String(edge?.id || `e-${source}-${target}-${idx}`),
        source,
        target,
        label,
        data: { label },
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#8f96a3', strokeWidth: 1.4, strokeDasharray: '6 6' },
        labelStyle: { fill: 'var(--gray-12)', fontWeight: 500 },
        labelBgStyle: { fill: 'var(--color-panel)' },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
      }
    })
    .filter(Boolean)

  return {
    nodes,
    edges,
    summary: String(resp?.summary || ''),
    exists: Boolean(resp?.exists),
  }
}

export function SequenceFlowPage() {
  const { orgId, projectId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [intakeId, setIntakeId] = useState(searchParams.get('intake_id') || '')
  const [runId, setRunId] = useState(searchParams.get('run_id') || '')
  const [runStatus, setRunStatus] = useState('')
  const [runSteps, setRunSteps] = useState([])
  const [versions, setVersions] = useState([])
  const [selectedVersion, setSelectedVersion] = useState(searchParams.get('version') || '')

  const [chatInput, setChatInput] = useState('')
  const [editMessages, setEditMessages] = useState([])
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isAgentProcessing, setIsAgentProcessing] = useState(false)
  const [loadError, setLoadError] = useState('')

  const updateUrl = useCallback((nextRunId, nextVersion) => {
    const params = new URLSearchParams(window.location.search)
    if (nextRunId) params.set('run_id', nextRunId)
    else params.delete('run_id')
    if (nextVersion) params.set('version', nextVersion)
    navigate({ search: params.toString() }, { replace: true })
  }, [navigate])

  const applyResult = useCallback((resp) => {
    const mapped = normalizeUsecaseFlowResponse(resp)
    if (mapped.nodes.length > 0) {
      setNodes(mapped.nodes)
      setEdges(mapped.edges)
    }
    if (mapped.summary) {
      setEditMessages((prev) => [...prev, { role: 'assistant', text: mapped.summary }])
    }
    if (resp?.version !== undefined && resp?.version !== null) {
      const v = String(resp.version)
      setSelectedVersion(v)
      updateUrl('', v)
    }
  }, [setEdges, setNodes, updateUrl])

  const loadVersions = useCallback(async (resolvedIntakeId) => {
    if (!orgId || !projectId || !resolvedIntakeId) return
    try {
      const resp = await getUsecaseFlowVersions(orgId, projectId, resolvedIntakeId)
      const items = Array.isArray(resp?.items) ? resp.items : []
      setVersions(items)
      if (!selectedVersion && items.length > 0) {
        const latest = items[0]?.version_number
        if (latest !== undefined && latest !== null) {
          const v = String(latest)
          setSelectedVersion(v)
          updateUrl('', v)
        }
      }
    } catch {
      setVersions([])
    }
  }, [orgId, projectId, selectedVersion, updateUrl])

  const startRun = useCallback(async (resolvedIntakeId, request, currentNodes, currentEdges) => {
    if (!orgId || !projectId || !resolvedIntakeId) return
    const started = await startUsecaseFlowRun(orgId, projectId, resolvedIntakeId, {
      request,
      nodes: currentNodes || [],
      edges: currentEdges || [],
    })
    const nextRunId = started?.run_id || ''
    setRunId(nextRunId)
    setRunStatus(started?.status || 'queued')
    if (nextRunId) updateUrl(nextRunId, selectedVersion)
  }, [orgId, projectId, selectedVersion, updateUrl])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!orgId || !projectId) return
      let resolvedIntakeId = searchParams.get('intake_id') || ''
      const resolvedRunId = searchParams.get('run_id') || ''
      const resolvedVersion = searchParams.get('version') || ''

      if (!resolvedIntakeId) {
        try {
          const latest = await getLatestRequirementsStatus(orgId, projectId)
          resolvedIntakeId = latest?.intake_id || ''
        } catch {
          // ignore
        }
      }
      if (!mounted || !resolvedIntakeId) return

      setIntakeId(resolvedIntakeId)
      if (resolvedRunId) setRunId(resolvedRunId)
      setIsAgentProcessing(true)
      try {
        const saved = resolvedVersion
          ? await getUsecaseFlowVersion(orgId, projectId, resolvedIntakeId, Number(resolvedVersion))
          : await getUsecaseFlow(orgId, projectId, resolvedIntakeId)

        if (!mounted) return
        const mapped = normalizeUsecaseFlowResponse(saved)
        if (mapped.nodes.length > 0 && mapped.exists) {
          applyResult(saved)
          await loadVersions(resolvedIntakeId)
          if (resolvedVersion) setSelectedVersion(String(resolvedVersion))
        } else if (!resolvedRunId) {
          await startRun(
            resolvedIntakeId,
            'Generate initial use case interaction diagram from requirements and architecture inputs.',
            [],
            []
          )
        }
      } catch (e) {
        if (!mounted) return
        setLoadError(e instanceof Error ? e.message : 'Failed to load use case diagram.')
      } finally {
        if (mounted) setIsAgentProcessing(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [orgId, projectId, searchParams, applyResult, loadVersions, startRun])

  useEffect(() => {
    if (!orgId || !projectId || !runId) return undefined
    let stopped = false
    let polling = false
    const tick = async () => {
      if (polling) return
      polling = true
      try {
        const run = await getUsecaseFlowRunStatus(orgId, projectId, runId)
        if (stopped) return
        setRunStatus(run?.status || '')
        setRunSteps(Array.isArray(run?.steps) ? run.steps : [])
        if (run?.status === 'completed') {
          setIsAgentProcessing(false)
          if (run?.result) applyResult(run.result)
          if (intakeId) await loadVersions(intakeId)
          setRunId('')
          updateUrl('', selectedVersion)
          return
        }
        if (run?.status === 'failed') {
          setIsAgentProcessing(false)
          setLoadError(run?.error || 'Use case generation failed.')
          setRunId('')
          updateUrl('', selectedVersion)
          return
        }
        if (run?.status === 'stopped') {
          setIsAgentProcessing(false)
          setLoadError(run?.error || 'Use case generation stopped.')
          setRunId('')
          updateUrl('', selectedVersion)
          return
        }
        setIsAgentProcessing(true)
      } catch (e) {
        if (stopped) return
        setIsAgentProcessing(false)
        setLoadError(e instanceof Error ? e.message : 'Failed to poll use case run status.')
        setRunId('')
        updateUrl('', selectedVersion)
      } finally {
        polling = false
      }
    }
    tick()
    const id = window.setInterval(tick, 2000)
    return () => {
      stopped = true
      window.clearInterval(id)
    }
  }, [orgId, projectId, runId, intakeId, selectedVersion, applyResult, loadVersions, updateUrl])

  const handleVersionChange = useCallback(async (value) => {
    if (!value || !orgId || !projectId || !intakeId) return
    setSelectedVersion(value)
    try {
      const doc = await getUsecaseFlowVersion(orgId, projectId, intakeId, Number(value))
      const mapped = normalizeUsecaseFlowResponse(doc)
      if (mapped.nodes.length > 0) {
        setNodes(mapped.nodes)
        setEdges(mapped.edges)
      }
      setEditMessages((prev) => [...prev, { role: 'assistant', text: mapped.summary || `Loaded use case version ${value}.` }])
      updateUrl('', value)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load use case version.')
    }
  }, [orgId, projectId, intakeId, setNodes, setEdges, updateUrl])

  const handleRegenerate = useCallback(async () => {
    if (!orgId || !projectId || !intakeId || isAgentProcessing || runId) return
    setLoadError('')
    setEditMessages((prev) => [
      ...prev,
      { role: 'assistant', text: 'Regenerating use case diagram from latest requirements and current interactions…' },
    ])
    setIsAgentProcessing(true)
    try {
      await startRun(
        intakeId,
        'Regenerate and improve this use case interaction diagram. Keep participant ids stable and strengthen interaction labels.',
        nodes,
        edges
      )
    } catch (e) {
      setIsAgentProcessing(false)
      setLoadError(e instanceof Error ? e.message : 'Failed to regenerate use case diagram.')
    }
  }, [orgId, projectId, intakeId, isAgentProcessing, runId, nodes, edges, startRun])

  const handleSendEdit = useCallback(async (optionalMessage) => {
    const msg = (optionalMessage ?? chatInput).trim()
    if (!msg) return
    if (!orgId || !projectId || !intakeId) {
      setLoadError('Requirements intake not found. Complete requirements first.')
      return
    }
    if (runId) {
      setLoadError('Use case generation is already running. Wait for completion.')
      return
    }
    setLoadError('')
    setEditMessages((prev) => [...prev, { role: 'user', text: msg }])
    setChatInput('')
    setIsAgentProcessing(true)
    try {
      await startRun(intakeId, msg, nodes, edges)
      setEditMessages((prev) => [...prev, { role: 'assistant', text: 'Use case run started. Applying update…' }])
    } catch (e) {
      setIsAgentProcessing(false)
      setEditMessages((prev) => [
        ...prev,
        { role: 'assistant', text: e instanceof Error ? e.message : 'Failed to update use case diagram.' },
      ])
    }
  }, [chatInput, orgId, projectId, intakeId, runId, nodes, edges, startRun])

  return (
    <Flex style={{ width: '100%', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      <Box
        style={{
          width: 480,
          minWidth: 480,
          flexShrink: 0,
          borderRight: '1px solid var(--gray-6)',
          background: 'var(--color-panel-translucent)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <Flex p="3" align="center" gap="2" style={{ borderBottom: '1px solid var(--gray-6)' }}>
          <Button variant="ghost" size="1" asChild>
            <Link to={`/organizations/${orgId}/projects/${projectId}`}>
              <ArrowLeftIcon width="16" height="16" />
            </Link>
          </Button>
          <Text size="2" weight="medium">Use Case Diagram</Text>
          <Box style={{ marginLeft: 'auto' }}>
            <Flex align="center" gap="2">
              {runStatus === 'running' || runStatus === 'queued' ? <Badge color="blue">Running</Badge> : null}
              {runStatus === 'completed' ? <Badge color="green">Completed</Badge> : null}
              {selectedVersion ? <Badge color="gray">V{selectedVersion}</Badge> : null}
            </Flex>
          </Box>
        </Flex>

        <Box p="2" style={{ borderBottom: '1px solid var(--gray-6)' }}>
          <Flex align="center" gap="2" wrap="wrap">
            <Select.Root value={selectedVersion} onValueChange={handleVersionChange}>
              <Select.Trigger placeholder="Version" style={{ minWidth: 120 }} />
              <Select.Content>
                {versions.map((v) => (
                  <Select.Item key={String(v.version_number)} value={String(v.version_number)}>
                    {`Version ${v.version_number}`}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            <Button size="1" variant="soft" onClick={handleRegenerate} disabled={isAgentProcessing || Boolean(runId)}>
              Regenerate
            </Button>
          </Flex>
        </Box>

        <Box style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 12 }}>
          {editMessages.length === 0 ? (
            <Flex direction="column" gap="3">
              <Text size="2" color="gray">Use prompts to update interactions and participants.</Text>
              <Flex wrap="wrap" gap="2">
                {QUICK_PROMPTS.map((prompt) => (
                  <Button
                    key={prompt}
                    size="1"
                    variant="soft"
                    disabled={isAgentProcessing || Boolean(runId)}
                    onClick={() => handleSendEdit(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </Flex>
            </Flex>
          ) : (
            <Flex direction="column" gap="3">
              {editMessages.map((m, i) => (
                <Box
                  key={i}
                  p="2"
                  style={{
                    background: m.role === 'user' ? 'var(--accent-3)' : 'var(--gray-3)',
                    borderRadius: 'var(--radius-2)',
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '100%',
                  }}
                >
                  {m.role === 'assistant' ? (
                    <Box className="md-doc-viewer">
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </Box>
                  ) : (
                    <Text size="2">{m.text}</Text>
                  )}
                </Box>
              ))}
            </Flex>
          )}

          {(isAgentProcessing || runId) ? (
            <Box mt="3" p="2" style={{ background: 'var(--gray-3)', borderRadius: 'var(--radius-2)' }}>
              <Text size="2" color="gray">{runId ? 'Processing…' : 'Preparing…'}</Text>
            </Box>
          ) : null}

          {runSteps.length > 0 ? (
            <Box mt="3" p="2" style={{ border: '1px solid var(--gray-6)', borderRadius: 'var(--radius-2)' }}>
              <Text size="1" color="gray">Step Completion</Text>
              <Flex direction="column" gap="2" mt="2">
                {runSteps.map((s, idx) => (
                  <Flex key={`${s.stage || 'stage'}-${idx}`} justify="between" align="center">
                    <Text size="1">{String(s.stage || 'usecase_generation')}</Text>
                    <Badge
                      size="1"
                      color={
                        s.status === 'completed'
                          ? 'green'
                          : s.status === 'running'
                            ? 'blue'
                            : s.status === 'failed'
                              ? 'red'
                              : s.status === 'stopped'
                                ? 'amber'
                                : 'gray'
                      }
                    >
                      {s.status || 'queued'}
                    </Badge>
                  </Flex>
                ))}
              </Flex>
            </Box>
          ) : null}

          {loadError ? (
            <Box mt="3"><Text size="2" color="red">{loadError}</Text></Box>
          ) : null}
        </Box>

        <Flex p="3" gap="2" style={{ borderTop: '1px solid var(--gray-6)' }}>
          <TextArea
            placeholder="Describe a use-case change..."
            size="2"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendEdit()
              }
            }}
            style={{ flex: 1, minHeight: 44, resize: 'none' }}
            disabled={isAgentProcessing || Boolean(runId)}
          />
          <Button
            size="2"
            onClick={() => handleSendEdit()}
            disabled={!chatInput.trim() || isAgentProcessing || Boolean(runId)}
          >
            <ArrowUpIcon width="16" height="16" />
          </Button>
        </Flex>
      </Box>

      <Box style={{ flex: 1, minWidth: 0, minHeight: 0, height: '100%', background: 'var(--gray-2)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          style={{ width: '100%', height: '100%', background: 'var(--gray-2)' }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#8f96a3', strokeWidth: 1.4, strokeDasharray: '6 6' },
            labelStyle: { fill: 'var(--gray-12)', fontWeight: 500 },
            labelBgStyle: { fill: 'var(--color-panel)' },
            labelBgPadding: [8, 4],
            labelBgBorderRadius: 4,
          }}
        >
          <Background gap={16} size={1} color="var(--gray-5)" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </Box>
    </Flex>
  )
}
