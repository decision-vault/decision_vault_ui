import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Box, Flex, Text, Button, TextArea, Select, Badge } from '@radix-ui/themes'
import { ArrowLeftIcon, ArrowUpIcon } from '@radix-ui/react-icons'
import ReactMarkdown from 'react-markdown'
import mermaid from 'mermaid'
import {
  getLatestRequirementsStatus,
  getSequenceFlow,
  getSequenceFlowVersion,
  getSequenceFlowVersions,
  getSequenceFlowRunStatus,
  pauseSequenceFlowRun,
  resumeSequenceFlowRun,
  startSequenceFlowRun,
  stopSequenceFlowRun,
} from '../../../services/requirementsApi'

const QUICK_PROMPTS = [
  'Add auth sequence: login request, token validation, and response path.',
  'Add error flow for invalid credentials and retry.',
  'Add Slack decision capture flow including webhook and storage.',
]

function getIsDarkMode() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function getMermaidConfig(isDarkMode) {
  const lineColor = isDarkMode ? '#ffffff' : '#000000'
  return {
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      lineColor,
      textColor: lineColor,
      primaryTextColor: lineColor,
      secondaryTextColor: lineColor,
      tertiaryTextColor: lineColor,
      actorTextColor: lineColor,
      signalColor: lineColor,
      sequenceNumberColor: lineColor,
      noteTextColor: lineColor,
      activationTextColor: lineColor,
      labelTextColor: lineColor,
    },
  }
}

function buildMermaidFromGraph(nodes, edges) {
  const participants = (Array.isArray(nodes) ? nodes : [])
    .map((node, idx) => {
      const id = String(node?.id || `participant_${idx}`).trim()
      const name = String(node?.data?.name || node?.name || id).trim()
      if (!id || !name) return null
      return { id, alias: id.replace(/[^a-zA-Z0-9_]/g, '_'), name }
    })
    .filter(Boolean)

  const byId = new Map(participants.map((p) => [p.id, p]))
  const lines = ['sequenceDiagram']
  participants.forEach((p) => {
    lines.push(`    participant ${p.alias} as ${p.name}`)
  })

  ;(Array.isArray(edges) ? edges : []).forEach((edge) => {
    const source = String(edge?.source || '').trim()
    const target = String(edge?.target || '').trim()
    if (!source || !target || !byId.has(source) || !byId.has(target)) return
    const label = String(edge?.label || edge?.data?.label || '').trim() || 'interaction'
    lines.push(`    ${byId.get(source).alias}->>${byId.get(target).alias}: ${label}`)
  })

  return lines.join('\n')
}

function normalizeSequenceFlowResponse(resp) {
  const rawNodes = Array.isArray(resp?.nodes) ? resp.nodes : []
  const rawEdges = Array.isArray(resp?.edges) ? resp.edges : []
  const mermaidText = String(resp?.mermaid || '').trim()
  const sanitizedMermaid = /^sequenceDiagram\s*$/i.test(mermaidText) ? '' : mermaidText

  const nodes = rawNodes
    .map((node, idx) => {
      const id = String(node?.id || `participant_${idx}`).trim()
      const name = String(node?.data?.name || node?.name || id).trim()
      if (!id || !name) return null
      return { id, data: { name } }
    })
    .filter(Boolean)

  const nodeIds = new Set(nodes.map((n) => n.id))
  const edges = rawEdges
    .map((edge, idx) => {
      const source = String(edge?.source || '').trim()
      const target = String(edge?.target || '').trim()
      if (!source || !target || !nodeIds.has(source) || !nodeIds.has(target)) return null
      const label = String(edge?.label || edge?.data?.label || '').trim()
      return {
        id: String(edge?.id || `e-${source}-${target}-${idx}`),
        source,
        target,
        label,
        data: { label },
      }
    })
    .filter(Boolean)

  return {
    nodes,
    edges,
    mermaid: sanitizedMermaid || (nodes.length > 0 && edges.length > 0 ? buildMermaidFromGraph(nodes, edges) : ''),
    summary: String(resp?.summary || ''),
    exists: Boolean(resp?.exists),
  }
}

export function SequenceFlowPage() {
  const { orgId, projectId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const containerRef = useRef(null)

  const [intakeId, setIntakeId] = useState(searchParams.get('intake_id') || '')
  const [runId, setRunId] = useState(searchParams.get('run_id') || '')
  const [runStatus, setRunStatus] = useState('')
  const [runSteps, setRunSteps] = useState([])
  const [versions, setVersions] = useState([])
  const [selectedVersion, setSelectedVersion] = useState(searchParams.get('version') || '')

  const [chatInput, setChatInput] = useState('')
  const [editMessages, setEditMessages] = useState([])
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [diagramSource, setDiagramSource] = useState('')
  const [svgContent, setSvgContent] = useState('')
  const [renderError, setRenderError] = useState('')
  const [isAgentProcessing, setIsAgentProcessing] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [actionLoading, setActionLoading] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(getIsDarkMode)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e) => setIsDarkMode(Boolean(e.matches))
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const renderDiagram = useCallback(async (source) => {
    mermaid.initialize(getMermaidConfig(isDarkMode))
    setRenderError('')
    const id = `sequence-diagram-${Date.now()}`
    try {
      const { svg, bindFunctions } = await mermaid.render(id, source)
      setSvgContent(svg)
      if (containerRef.current && bindFunctions) {
        requestAnimationFrame(() => bindFunctions(containerRef.current))
      }
    } catch (err) {
      setRenderError(err?.message || 'Failed to render Mermaid diagram.')
      setSvgContent('')
    }
  }, [isDarkMode])

  useEffect(() => {
    if (!diagramSource.trim()) {
      setSvgContent('')
      setRenderError('')
      return
    }
    renderDiagram(diagramSource)
  }, [diagramSource, renderDiagram])

  const updateUrl = useCallback((nextRunId, nextVersion) => {
    const params = new URLSearchParams(window.location.search)
    if (nextRunId) params.set('run_id', nextRunId)
    else params.delete('run_id')
    if (nextVersion) params.set('version', nextVersion)
    else params.delete('version')
    navigate({ search: params.toString() }, { replace: true })
  }, [navigate])

  const applyResult = useCallback((resp) => {
    const mapped = normalizeSequenceFlowResponse(resp)
    setNodes(mapped.nodes)
    setEdges(mapped.edges)
    setDiagramSource(mapped.mermaid)
    if (mapped.summary) {
      setEditMessages((prev) => [...prev, { role: 'assistant', text: mapped.summary }])
    }
    if (resp?.version !== undefined && resp?.version !== null) {
      const v = String(resp.version)
      setSelectedVersion(v)
      updateUrl('', v)
    }
  }, [updateUrl])

  const loadVersions = useCallback(async (resolvedIntakeId) => {
    if (!orgId || !projectId || !resolvedIntakeId) return
    try {
      const resp = await getSequenceFlowVersions(orgId, projectId, resolvedIntakeId)
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
    const started = await startSequenceFlowRun(orgId, projectId, resolvedIntakeId, {
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
          ? await getSequenceFlowVersion(orgId, projectId, resolvedIntakeId, Number(resolvedVersion))
          : await getSequenceFlow(orgId, projectId, resolvedIntakeId)

        if (!mounted) return
        const mapped = normalizeSequenceFlowResponse(saved)
        if ((mapped.nodes.length > 0 || mapped.mermaid) && mapped.exists) {
          applyResult(saved)
          await loadVersions(resolvedIntakeId)
          if (resolvedVersion) setSelectedVersion(String(resolvedVersion))
        } else if (!resolvedRunId) {
          await startRun(
            resolvedIntakeId,
            'Generate initial sequence interaction diagram from requirements and architecture inputs.',
            [],
            []
          )
        }
      } catch (e) {
        if (!mounted) return
        setLoadError(e instanceof Error ? e.message : 'Failed to load sequence diagram.')
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
        const run = await getSequenceFlowRunStatus(orgId, projectId, runId)
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
          setLoadError(run?.error || 'Sequence generation failed.')
          setRunId('')
          updateUrl('', selectedVersion)
          return
        }
        if (run?.status === 'stopped') {
          setIsAgentProcessing(false)
          setLoadError(run?.error || 'Sequence generation stopped.')
          setRunId('')
          updateUrl('', selectedVersion)
          return
        }
        setIsAgentProcessing(true)
      } catch (e) {
        if (stopped) return
        setIsAgentProcessing(false)
        setLoadError(e instanceof Error ? e.message : 'Failed to poll sequence run status.')
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
      const doc = await getSequenceFlowVersion(orgId, projectId, intakeId, Number(value))
      const mapped = normalizeSequenceFlowResponse(doc)
      setNodes(mapped.nodes)
      setEdges(mapped.edges)
      setDiagramSource(mapped.mermaid)
      setEditMessages((prev) => [...prev, { role: 'assistant', text: mapped.summary || `Loaded sequence version ${value}.` }])
      updateUrl('', value)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load sequence version.')
    }
  }, [orgId, projectId, intakeId, updateUrl])

  const handlePause = useCallback(async () => {
    if (!orgId || !projectId || !runId) return
    setActionLoading('pause')
    try {
      const r = await pauseSequenceFlowRun(orgId, projectId, runId)
      setRunStatus(r?.status || 'paused')
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to pause sequence run.')
    } finally {
      setActionLoading('')
    }
  }, [orgId, projectId, runId])

  const handleResume = useCallback(async () => {
    if (!orgId || !projectId || !runId) return
    setActionLoading('resume')
    try {
      const r = await resumeSequenceFlowRun(orgId, projectId, runId)
      setRunStatus(r?.status || 'running')
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to resume sequence run.')
    } finally {
      setActionLoading('')
    }
  }, [orgId, projectId, runId])

  const handleStop = useCallback(async () => {
    if (!orgId || !projectId || !runId) return
    setActionLoading('stop')
    try {
      const r = await stopSequenceFlowRun(orgId, projectId, runId)
      setRunStatus(r?.status || 'stopped')
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to stop sequence run.')
    } finally {
      setActionLoading('')
    }
  }, [orgId, projectId, runId])

  const handleRegenerate = useCallback(async () => {
    if (!orgId || !projectId || !intakeId || isAgentProcessing || runId) return
    setLoadError('')
    setEditMessages((prev) => [
      ...prev,
      { role: 'assistant', text: 'Regenerating sequence diagram from latest requirements and current interactions…' },
    ])
    setIsAgentProcessing(true)
    try {
      await startRun(
        intakeId,
        'Regenerate and improve this sequence interaction diagram. Keep participant ids stable and strengthen interaction labels.',
        nodes,
        edges
      )
    } catch (e) {
      setIsAgentProcessing(false)
      setLoadError(e instanceof Error ? e.message : 'Failed to regenerate sequence diagram.')
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
      setLoadError('Sequence generation is already running. Wait for completion.')
      return
    }
    setLoadError('')
    setEditMessages((prev) => [...prev, { role: 'user', text: msg }])
    setChatInput('')
    setIsAgentProcessing(true)
    try {
      await startRun(intakeId, msg, nodes, edges)
      setEditMessages((prev) => [...prev, { role: 'assistant', text: 'Sequence run started. Applying update…' }])
    } catch (e) {
      setIsAgentProcessing(false)
      setEditMessages((prev) => [
        ...prev,
        { role: 'assistant', text: e instanceof Error ? e.message : 'Failed to update sequence diagram.' },
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
          <Text size="2" weight="medium">Sequence Diagram</Text>
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
              <Text size="2" color="gray">Use prompts to update sequence interactions and participants.</Text>
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
              <Flex align="center" justify="between" gap="2">
                <Text size="2" color="gray">{runId ? 'Processing sequence run…' : 'Preparing…'}</Text>
                <Flex gap="2">
                  {runStatus === 'paused' ? (
                    <Button size="1" variant="soft" onClick={handleResume} disabled={actionLoading !== ''}>
                      {actionLoading === 'resume' ? 'Resuming…' : 'Resume'}
                    </Button>
                  ) : (
                    <Button
                      size="1"
                      variant="soft"
                      onClick={handlePause}
                      disabled={actionLoading !== '' || !(runStatus === 'running' || runStatus === 'queued')}
                    >
                      {actionLoading === 'pause' ? 'Pausing…' : 'Pause'}
                    </Button>
                  )}
                  <Button
                    size="1"
                    variant="soft"
                    color="red"
                    onClick={handleStop}
                    disabled={actionLoading !== '' || !(runStatus === 'running' || runStatus === 'queued' || runStatus === 'paused')}
                  >
                    {actionLoading === 'stop' ? 'Stopping…' : 'Stop'}
                  </Button>
                </Flex>
              </Flex>
            </Box>
          ) : null}

          {runSteps.length > 0 ? (
            <Box mt="3" p="2" style={{ border: '1px solid var(--gray-6)', borderRadius: 'var(--radius-2)' }}>
              <Text size="1" color="gray">Step Completion</Text>
              <Flex direction="column" gap="2" mt="2">
                {runSteps.map((s, idx) => (
                  <Flex key={`${s.stage || 'stage'}-${idx}`} justify="between" align="center">
                    <Text size="1">{String(s.stage || 'sequence_generation')}</Text>
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
            placeholder="Describe a sequence change..."
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

      <Box style={{ flex: 1, minWidth: 0, minHeight: 0, height: '100%', overflow: 'auto', background: 'var(--gray-2)', padding: 24 }}>
        {isAgentProcessing && !svgContent ? (
          <Flex align="center" justify="center" style={{ width: '100%', height: '100%', minHeight: 300 }}>
            <Text size="2" color="gray">Loading diagram…</Text>
          </Flex>
        ) : renderError ? (
          <Box p="4" style={{ background: 'var(--red-2)', border: '1px solid var(--red-6)', borderRadius: 8 }}>
            <Text size="2" color="red">{renderError}</Text>
          </Box>
        ) : !svgContent ? (
          <Flex align="center" justify="center" style={{ width: '100%', height: '100%', minHeight: 300 }}>
            <Text size="2" color="gray">No sequence diagram yet. Click Generate to create one.</Text>
          </Flex>
        ) : (
          <Box
            ref={containerRef}
            className="mermaid-diagram-container"
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: 300 }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </Box>
    </Flex>
  )
}
