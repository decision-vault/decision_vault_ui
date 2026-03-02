import { useState, useCallback } from 'react'
import { useEffect } from 'react'
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Box, Flex, Text, Button, TextArea, Select } from '@radix-ui/themes'
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
import './schemaViewer.css'
import SchemaTableNode from './SchemaTableNode'
import {
  getLatestRequirementsStatus,
  getSchemaFlow,
  getSchemaFlowVersion,
  getSchemaFlowVersions,
  getSchemaFlowRunStatus,
  startSchemaFlowRun,
} from '../../../services/requirementsApi'
import { TABLE_NODE_TYPE } from './schemaFlowData'

const nodeTypes = { [TABLE_NODE_TYPE]: SchemaTableNode }

function normalizeSchemaFlowResponse(resp) {
  const rawNodes = Array.isArray(resp?.nodes) ? resp.nodes : []
  const rawEdges = Array.isArray(resp?.edges) ? resp.edges : []

  const nodes = rawNodes
    .map((node, idx) => {
      const tableName = node?.data?.tableName || node?.data?.table_name || node?.tableName || node?.table_name || ''
      const columnsRaw = Array.isArray(node?.data?.columns) ? node.data.columns : (Array.isArray(node?.columns) ? node.columns : [])
      const columns = columnsRaw
        .map((c) => ({
          name: String(c?.name || '').trim(),
          type: String(c?.type || '').trim(),
          primaryKey: Boolean(c?.primaryKey ?? c?.primary_key),
          unique: Boolean(c?.unique),
        }))
        .filter((c) => c.name && c.type)

      const id = String(node?.id || tableName || `table_${idx}`)
      const pos = node?.position || {}
      const x = Number.isFinite(Number(pos?.x)) ? Number(pos.x) : 120 + (idx % 4) * 260
      const y = Number.isFinite(Number(pos?.y)) ? Number(pos.y) : 80 + Math.floor(idx / 4) * 220

      if (!tableName) return null
      return {
        id,
        type: TABLE_NODE_TYPE,
        position: { x, y },
        data: { tableName, columns },
      }
    })
    .filter(Boolean)

  const nodeIds = new Set(nodes.map((n) => n.id))
  const nodeById = new Map(nodes.map((n) => [n.id, n]))

  const resolveTargetHandle = (targetId, rawHandle) => {
    const targetNode = nodeById.get(targetId)
    const cols = Array.isArray(targetNode?.data?.columns) ? targetNode.data.columns : []
    if (cols.length === 0) return null
    const raw = String(rawHandle || '').trim()
    if (raw && cols.some((c) => c.name === raw)) return `${raw}-in`
    return `${cols[0].name}-in`
  }

  const resolveSourceHandle = (sourceId, rawHandle) => {
    const sourceNode = nodeById.get(sourceId)
    const cols = Array.isArray(sourceNode?.data?.columns) ? sourceNode.data.columns : []
    if (cols.length === 0) return null
    const pkCols = cols.filter((c) => c.primaryKey)
    const raw = String(rawHandle || '').trim()
    if (raw) {
      const matched = cols.find((c) => c.name === raw)
      if (matched?.primaryKey) return `${raw}-out`
    }
    if (pkCols.length > 0) return `${pkCols[0].name}-out`
    return null
  }

  const edges = rawEdges
    .map((edge, idx) => {
      const source = String(edge?.source || '').trim()
      const target = String(edge?.target || '').trim()
      if (!source || !target || !nodeIds.has(source) || !nodeIds.has(target)) return null
      return {
        id: String(edge?.id || `e-${source}-${target}-${idx}`),
        source,
        target,
        sourceHandle: resolveSourceHandle(source, edge?.sourceHandle || edge?.source_handle),
        targetHandle: resolveTargetHandle(target, edge?.targetHandle || edge?.target_handle),
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#8f96a3', strokeWidth: 1.4, strokeDasharray: '6 6' },
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

export function SchemaFlowPage() {
  const { orgId, projectId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [intakeId, setIntakeId] = useState(searchParams.get('intake_id') || '')
  const [runId, setRunId] = useState(searchParams.get('run_id') || '')
  const [runStatus, setRunStatus] = useState('')
  const [runSteps, setRunSteps] = useState([])
  const [versions, setVersions] = useState([])
  const [selectedVersion, setSelectedVersion] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [editMessages, setEditMessages] = useState([])
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isAgentProcessing, setIsAgentProcessing] = useState(false)
  const [loadError, setLoadError] = useState('')

  const updateUrlRunId = useCallback((nextRunId) => {
    const params = new URLSearchParams(window.location.search)
    if (nextRunId) params.set('run_id', nextRunId)
    else params.delete('run_id')
    navigate({ search: params.toString() }, { replace: true })
  }, [navigate])

  const applySchemaResult = useCallback((resp) => {
    const mapped = normalizeSchemaFlowResponse(resp)
    if (mapped.nodes.length > 0) {
      setNodes(mapped.nodes)
      setEdges(mapped.edges)
    }
    if (mapped.summary) {
      setEditMessages((prev) => [...prev, { role: 'assistant', text: mapped.summary }])
    }
    if (resp?.version !== undefined && resp?.version !== null) {
      setSelectedVersion(String(resp.version))
    }
  }, [setEdges, setNodes])

  const loadVersions = useCallback(async (resolvedIntake) => {
    if (!orgId || !projectId || !resolvedIntake) return
    try {
      const resp = await getSchemaFlowVersions(orgId, projectId, resolvedIntake)
      const items = Array.isArray(resp?.items) ? resp.items : []
      setVersions(items)
      if (!selectedVersion && items.length > 0) {
        const latest = items[0]?.version_number
        if (latest !== undefined && latest !== null) {
          setSelectedVersion(String(latest))
        }
      }
    } catch {
      setVersions([])
    }
  }, [orgId, projectId, selectedVersion])

  const startRun = useCallback(async (resolvedIntake, request, currentNodes, currentEdges) => {
    if (!orgId || !projectId || !resolvedIntake) return
    const started = await startSchemaFlowRun(orgId, projectId, resolvedIntake, {
      request,
      nodes: currentNodes || [],
      edges: currentEdges || [],
    })
    const nextRunId = started?.run_id || ''
    setRunId(nextRunId)
    setRunStatus(started?.status || 'queued')
    if (nextRunId) updateUrlRunId(nextRunId)
  }, [orgId, projectId, updateUrlRunId])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!orgId || !projectId) return
      let resolvedIntake = searchParams.get('intake_id') || ''
      const resolvedRunId = searchParams.get('run_id') || ''
      const resolvedVersion = searchParams.get('version') || ''
      if (!resolvedIntake) {
        try {
          const latest = await getLatestRequirementsStatus(orgId, projectId)
          resolvedIntake = latest?.intake_id || ''
        } catch {
          // ignore
        }
      }
      if (!mounted || !resolvedIntake) return
      setIntakeId(resolvedIntake)
      if (resolvedRunId) setRunId(resolvedRunId)
      setIsAgentProcessing(true)
      try {
        const saved = resolvedVersion
          ? await getSchemaFlowVersion(orgId, projectId, resolvedIntake, Number(resolvedVersion))
          : await getSchemaFlow(orgId, projectId, resolvedIntake)
        if (!mounted) return
        const mapped = normalizeSchemaFlowResponse(saved)
        if (mapped.nodes.length > 0 && mapped.exists) {
          applySchemaResult(saved)
          await loadVersions(resolvedIntake)
          if (resolvedVersion) setSelectedVersion(String(resolvedVersion))
        } else if (!resolvedRunId) {
          await startRun(
            resolvedIntake,
            'Generate initial database schema plan from requirements and architecture inputs.',
            [],
            []
          )
        }
      } catch (e) {
        if (!mounted) return
        setLoadError(e instanceof Error ? e.message : 'Failed to load schema flow.')
      } finally {
        if (mounted) setIsAgentProcessing(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [orgId, projectId, searchParams, applySchemaResult, startRun, loadVersions])

  useEffect(() => {
    if (!orgId || !projectId || !runId) return undefined
    let stopped = false
    let polling = false
    const tick = async () => {
      if (polling) return
      polling = true
      try {
        const run = await getSchemaFlowRunStatus(orgId, projectId, runId)
        if (stopped) return
        setRunStatus(run?.status || '')
        setRunSteps(Array.isArray(run?.steps) ? run.steps : [])
        if (run?.status === 'completed') {
          setIsAgentProcessing(false)
          if (run?.result) applySchemaResult(run.result)
          if (intakeId) await loadVersions(intakeId)
          setRunId('')
          updateUrlRunId('')
          return
        }
        if (run?.status === 'failed') {
          setIsAgentProcessing(false)
          setLoadError(run?.error || 'Schema generation failed.')
          setRunId('')
          updateUrlRunId('')
          return
        }
        setIsAgentProcessing(true)
      } catch (e) {
        if (stopped) return
        setIsAgentProcessing(false)
        setLoadError(e instanceof Error ? e.message : 'Failed to poll schema run status.')
        setRunId('')
        updateUrlRunId('')
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
  }, [orgId, projectId, runId, applySchemaResult, updateUrlRunId, loadVersions, intakeId])

  const handleVersionChange = useCallback(async (value) => {
    if (!value || !orgId || !projectId || !intakeId) return
    setSelectedVersion(value)
    try {
      const doc = await getSchemaFlowVersion(orgId, projectId, intakeId, Number(value))
      const mapped = normalizeSchemaFlowResponse(doc)
      if (mapped.nodes.length > 0) {
        setNodes(mapped.nodes)
        setEdges(mapped.edges)
      }
      setEditMessages((prev) => [...prev, { role: 'assistant', text: mapped.summary || `Loaded schema version ${value}.` }])
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load schema version.')
    }
  }, [orgId, projectId, intakeId, setNodes, setEdges])

  const handleRegenerate = useCallback(async () => {
    if (!orgId || !projectId || !intakeId || isAgentProcessing || runId) return
    setLoadError('')
    setEditMessages((prev) => [
      ...prev,
      { role: 'assistant', text: 'Regenerating schema plan from latest requirements and current graph…' },
    ])
    setIsAgentProcessing(true)
    try {
      await startRun(
        intakeId,
        'Regenerate and improve this schema plan. Keep table ids stable when possible and strengthen relationships.',
        nodes,
        edges
      )
    } catch (e) {
      setIsAgentProcessing(false)
      setLoadError(e instanceof Error ? e.message : 'Failed to regenerate schema flow.')
    }
  }, [orgId, projectId, intakeId, isAgentProcessing, runId, startRun, nodes, edges])

  const handleSendEdit = useCallback(
    async (optionalMessage) => {
      const msg = (optionalMessage ?? chatInput).trim()
      if (!msg) return
      if (!orgId || !projectId || !intakeId) {
        setLoadError('Requirements intake not found. Complete requirements first.')
        return
      }
      setLoadError('')
      if (runId) {
        setLoadError('Schema generation already running. Wait for current run to finish.')
        return
      }
      setEditMessages((prev) => [...prev, { role: 'user', text: msg }])
      setChatInput('')
      setIsAgentProcessing(true)
      try {
        await startRun(intakeId, msg, nodes, edges)
        setEditMessages((prev) => [...prev, { role: 'assistant', text: 'Schema run started. Applying update…' }])
      } catch (e) {
        setEditMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: e instanceof Error ? e.message : 'Failed to generate schema update.',
          },
        ])
      } finally {
        // kept true while status polling is active
      }
    },
    [chatInput, nodes, edges, orgId, projectId, intakeId, runId, startRun]
  )

  return (
    <Flex style={{ width: '100%', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {/* Left: chat panel (same as doc edit) */}
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
          <Text size="2" weight="medium">Database schema</Text>
          <Button
            size="1"
            variant="soft"
            color="indigo"
            onClick={handleRegenerate}
            disabled={isAgentProcessing || !!runId || !intakeId}
          >
            {isAgentProcessing || runId ? 'Regenerating…' : 'Regenerate'}
          </Button>
          <Box style={{ marginLeft: 'auto', minWidth: 160 }}>
            <Select.Root value={selectedVersion} onValueChange={handleVersionChange}>
              <Select.Trigger placeholder="Schema Version" />
              <Select.Content>
                {versions.length === 0 ? (
                  <Select.Item value="none" disabled>
                    No versions
                  </Select.Item>
                ) : null}
                {versions.map((v) => (
                  <Select.Item key={String(v.version_number)} value={String(v.version_number)}>
                    {`Version ${v.version_number}`}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>
        </Flex>
        <Box style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 12 }}>
          {editMessages.length === 0 ? (
            <Flex direction="column" gap="3">
              {loadError ? <Text size="2" color="red">{loadError}</Text> : null}
              {runId ? (
                <Text size="2" color="gray">
                  Run `{runId}` {runStatus || 'running'} {runSteps.length > 0 ? `(${runSteps.length} step)` : ''}
                </Text>
              ) : null}
              <Text size="2" color="gray">
                Ask for schema changes to generate and apply updates in the diagram.
              </Text>
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
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p style={{ margin: 0, marginBottom: 6, lineHeight: 1.5 }}>{children}</p>,
                          strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
                          ul: ({ children }) => <ul style={{ margin: 0, paddingLeft: 18 }}>{children}</ul>,
                          li: ({ children }) => <li style={{ marginBottom: 2 }}>{children}</li>,
                        }}
                      >
                        {m.text}
                      </ReactMarkdown>
                    </Box>
                  ) : (
                    <Text size="2">{m.text}</Text>
                  )}
                </Box>
              ))}
              {isAgentProcessing && (
                <Box p="2" style={{ background: 'var(--gray-3)', borderRadius: 'var(--radius-2)', alignSelf: 'flex-start' }}>
                  <Text size="2" color="gray">
                    {runId ? `Run ${runStatus || 'running'}...` : 'Processing…'}
                  </Text>
                </Box>
              )}
            </Flex>
          )}
        </Box>
        <Flex p="3" gap="2" style={{ borderTop: '1px solid var(--gray-6)' }}>
          <TextArea
            placeholder="Describe a schema change..."
            size="2"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendEdit() } }}
            style={{ flex: 1, minHeight: 44, resize: 'none' }}
            disabled={isAgentProcessing}
          />
          <Button size="2" onClick={() => handleSendEdit()} disabled={!chatInput.trim() || isAgentProcessing}>
            <ArrowUpIcon width="16" height="16" />
          </Button>
        </Flex>
      </Box>

      {/* Right: React Flow diagram */}
      <Box style={{ flex: 1, minWidth: 0, minHeight: 0, height: '100%', background: '#0b0d12' }}>
        {isAgentProcessing ? (
          <Flex align="center" justify="center" style={{ width: '100%', height: '100%', color: 'var(--gray-11)' }}>
            <Text size="2">Loading schema changes…</Text>
          </Flex>
        ) : (
          <ReactFlow
            className="schema-viewer-flow"
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            style={{
              width: '100%',
              height: '100%',
              background: '#0b0d12',
              color: '#e5e7eb',
            }}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: false,
              style: { stroke: '#8f96a3', strokeWidth: 1.4, strokeDasharray: '6 6' },
            }}
          >
            <Background variant="dots" gap={18} size={1.2} color="#1f2430" />
            <Controls showInteractive={false} />
          </ReactFlow>
        )}
      </Box>
    </Flex>
  )
}
