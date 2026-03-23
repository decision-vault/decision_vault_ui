import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Box, Flex, Text, Button, TextArea } from '@radix-ui/themes'
import { ArrowLeftIcon, ArrowUpIcon } from '@radix-ui/react-icons'
import ReactMarkdown from 'react-markdown'
import mermaid from 'mermaid'
import { PRD_LOGIN_DASHBOARD, PRD_CSV_EXPORT, PRD_AUTH_REFRESH } from './mermaidDiagramContent'

const SUGGESTIONS = [
  {
    label: 'Show CSV export flow',
    prompt: 'Switch the diagram to the CSV export sequence from the PRD.',
    applyChange: () => PRD_CSV_EXPORT,
    summary: '**Changes applied:**\n• Diagram updated to **CSV export** flow (PRD §6.4 Reporting).\n• Shows Browser → API → DB → download.',
  },
  {
    label: 'Show login + refresh',
    prompt: 'Show login and token refresh sequence.',
    applyChange: () => PRD_AUTH_REFRESH,
    summary: '**Changes applied:**\n• Diagram updated to **Login + token refresh** (PRD §6.1 Auth).\n• Shows JWT renewal flow.',
  },
  {
    label: 'Show login + dashboard',
    prompt: 'Show the main login and dashboard load sequence from the PRD.',
    applyChange: () => PRD_LOGIN_DASHBOARD,
    summary: '**Changes applied:**\n• Diagram set to **Login + Dashboard** (PRD §6.1, §6.3).\n• Default sequence restored.',
  },
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

export function SequenceDiagramPage() {
  const { orgId, projectId } = useParams()
  const [chatInput, setChatInput] = useState('')
  const [editMessages, setEditMessages] = useState([])
  const [diagramSource, setDiagramSource] = useState(PRD_LOGIN_DASHBOARD)
  const [svgContent, setSvgContent] = useState('')
  const [renderError, setRenderError] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [isAgentProcessing, setIsAgentProcessing] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(getIsDarkMode)
  const containerRef = useRef(null)
  const pendingMockEditRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e) => setIsDarkMode(Boolean(e.matches))
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const renderDiagram = useCallback(async (source) => {
    mermaid.initialize(getMermaidConfig(isDarkMode))
    setRenderError(null)
    const id = `mermaid-seq-${Date.now()}`
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
  }, [isDarkMode])

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
            text: '**Edit received.** Ask to switch to another PRD flow (e.g. CSV export, token refresh) or try a suggestion below.',
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
          <Text size="2" weight="medium">Sequence diagrams</Text>
        </Flex>
        <Box style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 12 }}>
          {editMessages.length === 0 && !isTyping ? (
            <Flex direction="column" gap="3">
              <Text size="2" color="gray">
                PRD-based sequence diagrams. Try a suggestion to switch the diagram:
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
            placeholder="Ask to switch diagram (e.g. CSV export)..."
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
