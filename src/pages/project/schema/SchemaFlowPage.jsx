import { useState, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Box, Flex, Text, Button, TextArea } from '@radix-ui/themes'
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
import SchemaTableNode from './SchemaTableNode'
import {
  TABLE_NODE_TYPE,
  buildInitialNodes,
  buildInitialEdges,
} from './schemaFlowData'

const nodeTypes = { [TABLE_NODE_TYPE]: SchemaTableNode }

const MOCK_SCHEMA_SUGGESTIONS = [
  {
    label: 'Add audit_log table',
    prompt: 'Add an audit_log table linked to users for tracking actions.',
    applyChange: (nodes, edges) => {
      if (nodes.some((n) => n.id === 'audit_log')) return { nodes, edges }
      const newNode = {
        id: 'audit_log',
        type: TABLE_NODE_TYPE,
        position: { x: 740, y: 400 },
        data: {
          tableName: 'audit_log',
          columns: [
            { name: 'id', type: 'uuid', primaryKey: true, unique: false },
            { name: 'user_id', type: 'uuid', primaryKey: false, unique: false },
            { name: 'action', type: 'text', primaryKey: false, unique: false },
            { name: 'created_at', type: 'timestamptz', primaryKey: false, unique: false },
          ],
        },
      }
      const newEdge = {
        id: 'e-users-audit_log',
        source: 'users',
        target: 'audit_log',
        sourceHandle: 'id-out',
        targetHandle: 'user_id-in',
        style: { strokeDasharray: '5 5' },
      }
      return {
        nodes: [...nodes, newNode],
        edges: [...edges, newEdge],
      }
    },
    summary: '**Changes applied:**\n• Added **audit_log** table with columns: id, user_id, action, created_at.\n• Linked **users.id** → **audit_log.user_id**.\n• Schema diagram updated.',
  },
  {
    label: 'Add role column to users',
    prompt: 'Add a display_name column to the users table.',
    applyChange: (nodes, edges) => {
      return {
        nodes: nodes.map((n) => {
          if (n.id !== 'users') return n
          const cols = n.data.columns || []
          if (cols.some((c) => c.name === 'display_name')) return n
          return {
            ...n,
            data: {
              ...n.data,
              columns: [...cols, { name: 'display_name', type: 'text', primaryKey: false, unique: false }],
            },
          }
        }),
        edges,
      }
    },
    summary: '**Changes applied:**\n• Added **display_name** (text) to **users** table.\n• Schema diagram updated.',
  },
  {
    label: 'Add metric_value_history table',
    prompt: 'Add a metric_value_history table to track metric value over time.',
    applyChange: (nodes, edges) => {
      if (nodes.some((n) => n.id === 'metric_value_history')) return { nodes, edges }
      const newNode = {
        id: 'metric_value_history',
        type: TABLE_NODE_TYPE,
        position: { x: 100, y: 520 },
        data: {
          tableName: 'metric_value_history',
          columns: [
            { name: 'id', type: 'uuid', primaryKey: true, unique: false },
            { name: 'metric_id', type: 'uuid', primaryKey: false, unique: false },
            { name: 'value', type: 'numeric', primaryKey: false, unique: false },
            { name: 'recorded_at', type: 'timestamptz', primaryKey: false, unique: false },
          ],
        },
      }
      const newEdge = {
        id: 'e-metric-metric_value_history',
        source: 'metric',
        target: 'metric_value_history',
        sourceHandle: 'id-out',
        targetHandle: 'metric_id-in',
        style: { strokeDasharray: '5 5' },
      }
      return {
        nodes: [...nodes, newNode],
        edges: [...edges, newEdge],
      }
    },
    summary: '**Changes applied:**\n• Added **metric_value_history** table (id, metric_id, value, recorded_at).\n• Linked **metric.id** → **metric_value_history.metric_id**.\n• Schema diagram updated.',
  },
]

export function SchemaFlowPage() {
  const { orgId, projectId } = useParams()
  const [chatInput, setChatInput] = useState('')
  const [editMessages, setEditMessages] = useState([])
  const [nodes, setNodes, onNodesChange] = useNodesState(buildInitialNodes())
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildInitialEdges())
  const [isTyping, setIsTyping] = useState(false)
  const [isAgentProcessing, setIsAgentProcessing] = useState(false)
  const pendingMockEditRef = useRef(null)

  const handleSendEdit = useCallback(
    (optionalMessage) => {
      const msg = (optionalMessage ?? chatInput).trim()
      if (!msg) return
      setEditMessages((prev) => [...prev, { role: 'user', text: msg }])
      setChatInput('')
      const pending = pendingMockEditRef.current
      pendingMockEditRef.current = null
      if (pending) {
        const result = pending.applyChange(nodes, edges)
        setIsAgentProcessing(true)
        setTimeout(() => {
          setNodes(result.nodes)
          setEdges(result.edges)
          setEditMessages((prev) => [...prev, { role: 'assistant', text: pending.summary }])
          setIsAgentProcessing(false)
        }, 5000)
      } else {
        setEditMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: '**Edit received.** Describe a schema change (e.g. add a table or column) and use a suggestion below to see it applied to the diagram.',
          },
        ])
      }
    },
    [chatInput, nodes, edges, setNodes, setEdges]
  )

  const startMockEdit = useCallback(
    (suggestion) => {
      if (isTyping || isAgentProcessing) return
      const { prompt } = suggestion
      pendingMockEditRef.current = suggestion
      setIsTyping(true)
      let i = 0
      const id = setInterval(() => {
        setChatInput((prev) => prev + prompt[i])
        i += 1
        if (i >= prompt.length) {
          clearInterval(id)
          setIsTyping(false)
          setTimeout(() => handleSendEdit(prompt), 80)
        }
      }, 28)
    },
    [isTyping, isAgentProcessing, handleSendEdit]
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
        </Flex>
        <Box style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 12 }}>
          {editMessages.length === 0 && !isTyping ? (
            <Flex direction="column" gap="3">
              <Text size="2" color="gray">
                Ask for schema changes. Try a suggestion to auto-type and see the diagram update:
              </Text>
              <Flex wrap="wrap" gap="2">
                {MOCK_SCHEMA_SUGGESTIONS.map((s, i) => (
                  <Button
                    key={i}
                    size="1"
                    variant="soft"
                    disabled={isTyping || isAgentProcessing}
                    onClick={() => startMockEdit(s)}
                  >
                    {s.label}
                  </Button>
                ))}
              </Flex>
            </Flex>
          ) : editMessages.length === 0 && isTyping ? (
            <Box p="2" style={{ background: 'var(--gray-3)', borderRadius: 'var(--radius-2)', alignSelf: 'flex-start' }}>
              <Text size="2" color="gray">Typing…</Text>
            </Box>
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
              {(isTyping || isAgentProcessing) && (
                <Box p="2" style={{ background: 'var(--gray-3)', borderRadius: 'var(--radius-2)', alignSelf: 'flex-start' }}>
                  <Text size="2" color="gray">{isTyping ? 'Typing…' : 'Processing…'}</Text>
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
            disabled={isTyping || isAgentProcessing}
          />
          <Button size="2" onClick={() => handleSendEdit()} disabled={!chatInput.trim() || isTyping || isAgentProcessing}>
            <ArrowUpIcon width="16" height="16" />
          </Button>
        </Flex>
      </Box>

      {/* Right: React Flow diagram */}
      <Box style={{ flex: 1, minWidth: 0, minHeight: 0, height: '100%', background: 'var(--gray-2)' }}>
        {isAgentProcessing ? (
          <Flex align="center" justify="center" style={{ width: '100%', height: '100%', color: 'var(--gray-11)' }}>
            <Text size="2">Loading schema changes…</Text>
          </Flex>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            style={{ width: '100%', height: '100%', background: 'var(--gray-2)' }}
            defaultEdgeOptions={{ style: { stroke: 'var(--gray-8)' } }}
          >
            <Background gap={16} size={1} color="var(--gray-5)" />
            <Controls showInteractive={false} />
          </ReactFlow>
        )}
      </Box>
    </Flex>
  )
}
