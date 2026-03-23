import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Box, Flex, Text, Button, TextArea, Select, Badge } from '@radix-ui/themes'
import { ArrowLeftIcon, ArrowUpIcon } from '@radix-ui/react-icons'
import ReactMarkdown from 'react-markdown'
import mermaid from 'mermaid'
import {
  generateArchitectureDiagram,
  getArchitectureDiagram,
  getArchitectureDiagramVersion,
  getArchitectureDiagramVersions,
  getLatestRequirementsStatus,
} from '../../../services/requirementsApi'

const SUGGESTIONS = [
  {
    label: 'High-level architecture',
    prompt: 'Show the high-level system architecture with Load Balancer and AWS components.',
  },
  {
    label: 'Data flow (API & DB)',
    prompt: 'Show data flow from User through Frontend to API endpoints and Database.',
  },
  {
    label: 'Module view (detailed)',
    prompt: 'Show the detailed module view: Frontend and Backend modules and DB tables.',
  },
  {
    label: 'Layered architecture',
    prompt: 'Show the full layered architecture: Presentation, API, Application, Infrastructure.',
  },
  {
    label: 'AWS deployment',
    prompt: 'Show the AWS deployment: CloudFront, S3, ALB, ECS, RDS, CloudWatch.',
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

export function ArchitectureDiagramPage() {
  const { orgId, projectId } = useParams()
  const [intakeId, setIntakeId] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [editMessages, setEditMessages] = useState([])
  const [diagramSource, setDiagramSource] = useState('')
  const [svgContent, setSvgContent] = useState('')
  const [renderError, setRenderError] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [isAgentProcessing, setIsAgentProcessing] = useState(false)
  const [versions, setVersions] = useState([])
  const [selectedVersion, setSelectedVersion] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(getIsDarkMode)
  const containerRef = useRef(null)

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
  }, [isDarkMode])

  useEffect(() => {
    if (!diagramSource.trim()) {
      setSvgContent('')
      setRenderError(null)
      return
    }
    renderDiagram(diagramSource)
  }, [diagramSource, renderDiagram])

  useEffect(() => {
    let mounted = true
    const loadInitial = async () => {
      if (!orgId || !projectId) return
      setIsAgentProcessing(true)
      try {
        const latest = await getLatestRequirementsStatus(orgId, projectId)
        const resolvedIntakeId = latest?.intake_id || ''
        if (!mounted || !resolvedIntakeId) return
        setIntakeId(resolvedIntakeId)
        const existing = await getArchitectureDiagram(orgId, projectId, resolvedIntakeId)
        const versionsResp = await getArchitectureDiagramVersions(orgId, projectId, resolvedIntakeId)
        if (!mounted) return
        const items = Array.isArray(versionsResp?.items) ? versionsResp.items : []
        setVersions(items)
        if (existing?.exists && String(existing?.mermaid || '').trim()) {
          setDiagramSource(String(existing.mermaid))
          const latestVersion = existing?.version ?? items?.[0]?.version_number
          setSelectedVersion(latestVersion ? String(latestVersion) : '')
        }
      } catch (e) {
        if (!mounted) return
        setEditMessages((prev) => [
          ...prev,
          { role: 'assistant', text: e instanceof Error ? e.message : 'Failed to load architecture diagram.' },
        ])
      } finally {
        if (mounted) setIsAgentProcessing(false)
      }
    }
    loadInitial()
    return () => {
      mounted = false
    }
  }, [orgId, projectId])

  const handleSendEdit = useCallback(
    async (optionalMessage) => {
      const msg = (optionalMessage ?? chatInput).trim()
      if (!msg) return
      setEditMessages((prev) => [...prev, { role: 'user', text: msg }])
      setChatInput('')
      if (!orgId || !projectId || !intakeId) {
        setEditMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: 'Requirements intake not found. Complete requirements first.',
          },
        ])
        return
      }

      setIsAgentProcessing(true)
      try {
        const result = await generateArchitectureDiagram(orgId, projectId, intakeId, { request: msg })
        const mermaidText = String(result?.mermaid || '').trim()
        if (mermaidText) {
          setDiagramSource(mermaidText)
        }
        const versionsResp = await getArchitectureDiagramVersions(orgId, projectId, intakeId)
        const items = Array.isArray(versionsResp?.items) ? versionsResp.items : []
        setVersions(items)
        const latestVersion = result?.version ?? items?.[0]?.version_number
        setSelectedVersion(latestVersion ? String(latestVersion) : '')
        setEditMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: String(result?.summary || '**Edit received.** Diagram updated.'),
          },
        ])
      } catch (e) {
        setEditMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: e instanceof Error ? e.message : 'Failed to update architecture diagram.',
          },
        ])
      } finally {
        setIsAgentProcessing(false)
      }
    },
    [chatInput, orgId, projectId, intakeId]
  )

  const handleVersionChange = useCallback(async (value) => {
    if (!value || !orgId || !projectId || !intakeId) return
    setSelectedVersion(value)
    try {
      const doc = await getArchitectureDiagramVersion(orgId, projectId, intakeId, Number(value))
      const mermaidText = String(doc?.mermaid || '').trim()
      if (mermaidText) setDiagramSource(mermaidText)
      setEditMessages((prev) => [
        ...prev,
        { role: 'assistant', text: String(doc?.summary || `Loaded architecture version ${value}.`) },
      ])
    } catch (e) {
      setEditMessages((prev) => [
        ...prev,
        { role: 'assistant', text: e instanceof Error ? e.message : 'Failed to load architecture version.' },
      ])
    }
  }, [orgId, projectId, intakeId])

  const startSuggestionEdit = useCallback(
    (suggestion) => {
      if (isTyping || isAgentProcessing) return
      const { prompt } = suggestion
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
          <Box style={{ marginLeft: 'auto' }}>
            <Flex align="center" gap="2">
              {selectedVersion ? <Badge color="gray">V{selectedVersion}</Badge> : null}
            </Flex>
          </Box>
        </Flex>
        <Box p="2" style={{ borderBottom: '1px solid var(--gray-6)' }}>
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
        </Box>
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
                    onClick={() => startSuggestionEdit(s)}
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
        ) : !svgContent ? (
          <Flex align="center" justify="center" style={{ width: '100%', height: '100%', minHeight: 300, color: 'var(--gray-11)' }}>
            <Text size="2">No architecture diagram yet.</Text>
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
