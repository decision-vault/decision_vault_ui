import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Box, Flex, Text, Button, TextArea } from '@radix-ui/themes'
import { ArrowLeftIcon, ArrowUpIcon } from '@radix-ui/react-icons'
import ReactMarkdown from 'react-markdown'
import mermaid from 'mermaid'
import { ARCH_HIGH_LEVEL, ARCH_DATA_FLOW, ARCH_MODULES, ARCH_LAYERED, ARCH_DEPLOYMENT } from './mermaidDiagramContent'

const SUGGESTIONS = [
  {
    label: 'High-level architecture',
    prompt: 'Show the high-level system architecture with Load Balancer and AWS components.',
    applyChange: () => ARCH_HIGH_LEVEL,
    summary: '**Changes applied:**\n• **High-level architecture** (System Design §2).\n• Client → LB → FastAPI (stateless) → RDS, S3, CloudWatch; TLS, JWT, tenant-scoped SQL.',
  },
  {
    label: 'Data flow (API & DB)',
    prompt: 'Show data flow from User through Frontend to API endpoints and Database.',
    applyChange: () => ARCH_DATA_FLOW,
    summary: '**Changes applied:**\n• **Data flow** with Auth/Dashboard/Reports/Tenant → /auth, /metrics, /reports, /tenants → PostgreSQL (tenant, users, metric, dashboard, session).',
  },
  {
    label: 'Module view (detailed)',
    prompt: 'Show the detailed module view: Frontend and Backend modules and DB tables.',
    applyChange: () => ARCH_MODULES,
    summary: '**Changes applied:**\n• **Module view** (System Design §3).\n• Frontend modules, Backend endpoints (bcrypt, JWT, tenant isolation), and PostgreSQL tables.',
  },
  {
    label: 'Layered architecture',
    prompt: 'Show the full layered architecture: Presentation, API, Application, Infrastructure.',
    applyChange: () => ARCH_LAYERED,
    summary: '**Changes applied:**\n• **Layered architecture**: Presentation (React, Router, Axios, Auth) → API (LB, FastAPI, JWT, Pydantic) → App & Data (modules + RDS) → S3, CloudWatch.',
  },
  {
    label: 'AWS deployment',
    prompt: 'Show the AWS deployment: CloudFront, S3, ALB, ECS, RDS, CloudWatch.',
    applyChange: () => ARCH_DEPLOYMENT,
    summary: '**Changes applied:**\n• **AWS deployment** (System Design §9): CloudFront + S3 static, ALB + ECS/EC2, RDS, S3 export, CloudWatch.',
  },
]

let mermaidInitialized = false
function ensureMermaid() {
  if (mermaidInitialized) return
  mermaid.initialize({ startOnLoad: false, theme: 'base' })
  mermaidInitialized = true
}

export function ArchitectureDiagramPage() {
  const { orgId, projectId } = useParams()
  const [chatInput, setChatInput] = useState('')
  const [editMessages, setEditMessages] = useState([])
  const [diagramSource, setDiagramSource] = useState(ARCH_HIGH_LEVEL)
  const [svgContent, setSvgContent] = useState('')
  const [renderError, setRenderError] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [isAgentProcessing, setIsAgentProcessing] = useState(false)
  const containerRef = useRef(null)
  const pendingMockEditRef = useRef(null)

  const renderDiagram = useCallback(async (source) => {
    ensureMermaid()
    setRenderError(null)
    const id = `mermaid-arch-${Date.now()}`
    try {
      const { svg, bindFunctions } = await mermaid.render(id, source)
      setSvgContent(svg)
      if (containerRef.current && bindFunctions) {
        requestAnimationFrame(() => bindFunctions(containerRef.current))
      }
    } catch (err) {
      setRenderError(err.message || 'Failed to render diagram')
      setSvgContent('')
    }
  }, [])

  useEffect(() => {
    renderDiagram(diagramSource)
  }, [diagramSource, renderDiagram])

  const handleSendEdit = useCallback(
    (optionalMessage) => {
      const msg = (optionalMessage ?? chatInput).trim()
      if (!msg) return
      setEditMessages((prev) => [...prev, { role: 'user', text: msg }])
      setChatInput('')
      const pending = pendingMockEditRef.current
      pendingMockEditRef.current = null
      if (pending) {
        const newSource = typeof pending.applyChange === 'function' ? pending.applyChange() : pending.applyChange
        setIsAgentProcessing(true)
        setTimeout(() => {
          setDiagramSource(newSource)
          setEditMessages((prev) => [...prev, { role: 'assistant', text: pending.summary }])
          setIsAgentProcessing(false)
        }, 5000)
      } else {
        setEditMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: '**Edit received.** Ask to switch to another architecture view (e.g. data flow, modules) or try a suggestion below.',
          },
        ])
      }
    },
    [chatInput]
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
          <Text size="2" weight="medium">Architecture diagrams</Text>
        </Flex>
        <Box style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 12 }}>
          {editMessages.length === 0 && !isTyping ? (
            <Flex direction="column" gap="3">
              <Text size="2" color="gray">
                System architecture and data flow. Try a suggestion to switch the diagram:
              </Text>
              <Flex wrap="wrap" gap="2">
                {SUGGESTIONS.map((s, i) => (
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
            placeholder="Ask to switch diagram (e.g. data flow, modules)..."
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
      <Box style={{ flex: 1, minWidth: 0, minHeight: 0, height: '100%', overflow: 'auto', background: 'var(--gray-2)', padding: 24 }}>
        {isAgentProcessing ? (
          <Flex align="center" justify="center" style={{ width: '100%', height: '100%', minHeight: 300, color: 'var(--gray-11)' }}>
            <Text size="2">Loading diagram…</Text>
          </Flex>
        ) : renderError ? (
          <Box p="4" style={{ background: 'var(--red-2)', border: '1px solid var(--red-6)', borderRadius: 8 }}>
            <Text size="2" color="red">{renderError}</Text>
          </Box>
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
