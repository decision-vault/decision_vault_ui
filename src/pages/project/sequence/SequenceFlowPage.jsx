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
import SequenceParticipantNode from './SequenceParticipantNode'
import {
  PARTICIPANT_NODE_TYPE,
  buildInitialNodes,
  buildInitialEdges,
} from './sequenceFlowData'

const nodeTypes = { [PARTICIPANT_NODE_TYPE]: SequenceParticipantNode }

const MOCK_SEQUENCE_SUGGESTIONS = [
  {
    label: 'Add GET /metrics step',
    prompt: 'Add a GET /metrics request from Browser to API and a query to DB.',
    applyChange: (nodes, edges) => {
      if (edges.some((e) => e.id === 'e-metrics-req')) return { nodes, edges }
      const newEdges = [
        ...edges,
        { id: 'e-metrics-req', source: 'browser', target: 'api', label: 'GET /metrics', data: { label: 'GET /metrics' } },
        { id: 'e-metrics-db', source: 'api', target: 'db', label: 'SELECT metrics', data: { label: 'SELECT metrics' } },
        { id: 'e-metrics-res', source: 'api', target: 'browser', label: '200 JSON', data: { label: '200 JSON' } },
      ]
      return { nodes, edges: newEdges }
    },
    summary: '**Changes applied:**\n• Added **GET /metrics** flow: Browser → API → DB → API → Browser.\n• Sequence diagram updated.',
  },
  {
    label: 'Add Cache participant',
    prompt: 'Add a Redis Cache participant between API and Database.',
    applyChange: (nodes, edges) => {
      if (nodes.some((n) => n.id === 'cache')) return { nodes, edges }
      const newNode = {
        id: 'cache',
        type: PARTICIPANT_NODE_TYPE,
        position: { x: 440, y: 100 },
        data: { name: 'Redis Cache' },
      }
      return {
        nodes: [...nodes, newNode],
        edges,
      }
    },
    summary: '**Changes applied:**\n• Added **Redis Cache** participant to the sequence diagram.\n• You can reconnect edges to include cache in the flow.',
  },
  {
    label: 'Add token refresh flow',
    prompt: 'Add POST /auth/refresh and JWT validation steps.',
    applyChange: (nodes, edges) => {
      if (edges.some((e) => e.id === 'e-refresh')) return { nodes, edges }
      const newEdges = [
        ...edges,
        { id: 'e-refresh', source: 'browser', target: 'api', label: 'POST /auth/refresh', data: { label: 'POST /auth/refresh' } },
        { id: 'e-refresh-res', source: 'api', target: 'browser', label: '200 JWT', data: { label: '200 JWT' } },
      ]
      return { nodes, edges: newEdges }
    },
    summary: '**Changes applied:**\n• Added **POST /auth/refresh** and **200 JWT** response to the sequence.\n• Sequence diagram updated.',
  },
]

export function SequenceFlowPage() {
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
            text: '**Edit received.** Describe a sequence change (e.g. add a step or participant) and try a suggestion below.',
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
      {/* Left: chat panel */}
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
          <Text size="2" weight="medium">Sequence diagram</Text>
        </Flex>
        <Box style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 12 }}>
          {editMessages.length === 0 && !isTyping ? (
            <Flex direction="column" gap="3">
              <Text size="2" color="gray">
                Request flows and interactions. Try a suggestion to add steps or participants:
              </Text>
              <Flex wrap="wrap" gap="2">
                {MOCK_SEQUENCE_SUGGESTIONS.map((s, i) => (
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
            placeholder="Describe a sequence change..."
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

      {/* Right: React Flow sequence diagram */}
      <Box style={{ flex: 1, minWidth: 0, minHeight: 0, height: '100%', background: 'var(--gray-2)' }}>
        {isAgentProcessing ? (
          <Flex align="center" justify="center" style={{ width: '100%', height: '100%', color: 'var(--gray-11)' }}>
            <Text size="2">Loading sequence changes…</Text>
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
            defaultEdgeOptions={{
              style: { stroke: 'var(--gray-9)' },
              labelStyle: { fill: 'var(--gray-12)', fontWeight: 500 },
              labelBgStyle: { fill: 'var(--color-panel)' },
              labelBgPadding: [8, 4],
              labelBgBorderRadius: 4,
            }}
          >
            <Background gap={16} size={1} color="var(--gray-5)" />
            <Controls showInteractive={false} />
          </ReactFlow>
        )}
      </Box>
    </Flex>
  )
}
