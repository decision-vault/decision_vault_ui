import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Card, Flex, Heading, Text, TextArea, Grid,
  IconButton, TextField, Button, Separator, DropdownMenu, SegmentedControl
} from '@radix-ui/themes'
import { marked } from 'marked'
marked.setOptions({ gfm: true, breaks: true })
import { Bot, ArrowLeft, RotateCcw, Lock, CreditCard, TrendingUp, ClipboardList } from 'lucide-react'
import { DocsManagementService } from '../../services/docManager'
import { AgentWorkspaceService } from '../../services/agentApi'
import { PlannerApi } from '../../services/plannerApi'
import { KnowledgeApi } from '../../services/knowledgeApi'
import { getProject } from '../../services/projectApi'
import { getTasks } from '../../services/taskApi'
import { CanvasApi } from '../../services/canvasApi'
import { apiRequest } from '../../services/apiClient'
import logo from '../../assets/logo.svg'

import AIWorkflowPage from '../dashboard/AIWorkflowPage'
import UIBuilderPage from './UIBuilderPage'
import './AgentWorkspace.css'

/* ═══════════════════════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════════════════════ */

const IconSparkles = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="m12 3-1.912 5.886a1 1 0 0 1-.95.684H2.93a1 1 0 0 0-.588 1.81l5.021 3.648a1 1 0 0 1 .364 1.118L5.816 22a1 1 0 0 0 1.54 1.118l5.019-3.647a1 1 0 0 1 1.173 0l5.018 3.647a1 1 0 0 0 1.54-1.118l-1.911-5.854a1 1 0 0 1 .364-1.118l5.022-3.649a1 1 0 0 0-.588-1.81h-6.212a1 1 0 0 1-.95-.684z" />
  </svg>
)

const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

const IconMic = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v1a7 7 0 0 1-14 0v-1" /><line x1="12" x2="12" y1="19" y2="22" />
  </svg>
)

const IconMicActive = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red-9)" strokeWidth="2">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v1a7 7 0 0 1-14 0v-1" /><line x1="12" x2="12" y1="19" y2="22" />
  </svg>
)

const IconPaperclip = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
)

const IconDoc = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4M10 9h4M10 13h4M10 17h2" />
  </svg>
)

const IconArrowRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)

const IconDownload = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
  </svg>
)

/* ═══════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════ */

import mermaid from 'mermaid'

mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' })

let mermaidIdCounter = 0

function MermaidDiagram({ code, index }) {
  const [error, setError] = useState(null)
  const [svg, setSvg] = useState(null)
  const id = `mermaid-diag-${index}-${++mermaidIdCounter}`

  useEffect(() => {
    if (!code) return
    let cancelled = false
    const render = async () => {
      try {
        const doc = new DOMParser().parseFromString(code, 'text/html')
        let cleaned = doc.documentElement.textContent
        cleaned = cleaned.replace(/^\s+|\s+$/g, '')
        const { svg: result } = await mermaid.render(id, cleaned)
        if (!cancelled) setSvg(result)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Invalid diagram syntax')
      }
    }
    render()
    return () => { cancelled = true }
  }, [code, id])

  if (error) {
    return (
      <div style={{ width: '100%' }}>
        <pre style={{ color: 'var(--red-9)', fontSize: 12, margin: 0, padding: 12, background: 'var(--red-2)', borderRadius: 6, border: '1px solid var(--red-5)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{error}</pre>
        <pre style={{ fontSize: 11, margin: 0, padding: 12, background: 'var(--gray-2)', borderRadius: 6, border: '1px solid var(--gray-4)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--gray-11)', maxHeight: 120, overflowY: 'auto' }}>{code}</pre>
      </div>
    )
  }
  if (svg) return <div dangerouslySetInnerHTML={{ __html: svg }} />
  return <Text size="1" color="gray">Rendering diagram...</Text>
}

function sanitizeMermaid(code) {
  let fixed = code.trim()
  fixed = fixed.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  if (/^graph\s+(TD|TB|LR|RL|BT)\b/i.test(fixed) && /^sequenceDiagram/m.test(fixed)) {
    fixed = fixed.replace(/^graph\s+(?:TD|TB|LR|RL|BT)\s*\n?/im, '')
  }
  fixed = fixed.replace(/^participant\s+\[([^\]]+)\]\s+as\s+(.+)$/gm, 'participant $1 as $2')
  fixed = fixed.replace(/^participant\s+(\w+)\s*\[([^\]]+)\]$/gm, 'participant $1 as $2')
  return fixed
}

function extractMermaidBlocks(md) {
  const regex = /```mermaid\s*\n([\s\S]*?)```/g
  const blocks = []
  let match
  while ((match = regex.exec(md)) !== null) {
    blocks.push(sanitizeMermaid(match[1]))
  }
  return blocks
}

function DiagramCard({ code, index }) {
  const [showSource, setShowSource] = useState(false)
  return (
    <div className="diagram-card">
      <div className="diagram-card-header">
        <span>Diagram {index + 1}</span>
        <button className="doc-view-tab" onClick={() => setShowSource(!showSource)} style={{ fontSize: 10, padding: '2px 8px' }}>
          {showSource ? 'Hide source' : 'Show source'}
        </button>
      </div>
      <div className="diagram-card-body">
        <MermaidDiagram code={code} index={index} />
      </div>
      {showSource && (
        <pre className="diagram-card-source diagram-source-open">{code}</pre>
      )}
    </div>
  )
}

function SkeletonLoader() {
  return (
    <div className="skeleton-loader">
      <div className="skeleton-header">
        <div className="skeleton-dot" />
        <div className="skeleton-title" />
      </div>
      <div className="skeleton-line" />
      <div className="skeleton-line" />
      <div className="skeleton-line" />
      <div className="skeleton-line" />
      <div className="skeleton-block" />
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
      <Text size="1" color="gray" italic>kavi ai is thinking...</Text>
    </div>
  )
}

function ExecutionActivityPanel({ steps }) {
  if (!steps || steps.length === 0) return null
  const activeCount = steps.filter(s => s.status === 'active').length
  const doneCount = steps.filter(s => s.status === 'done').length
  const failedCount = steps.filter(s => s.status === 'failed').length
  const statusLabel = failedCount > 0
    ? 'Execution failed'
    : activeCount > 0
      ? 'Executing strategy analysis...'
      : 'Strategy analysis'
  return (
    <div className="execution-activity-panel">
      <div className="execution-activity-head">
        <Text size="1" weight="bold" style={{ color: 'var(--blue-11)' }}>{statusLabel}</Text>
        <Text size="1" color="gray">{doneCount}/{steps.length} complete · {activeCount} active</Text>
      </div>
      <div className="execution-activity-steps">
        {steps.map(step => {
          let icon
          if (step.status === 'done') {
            icon = <span className="execution-step-check">✓</span>
          } else if (step.status === 'failed') {
            icon = <span className="execution-step-fail">✕</span>
          } else if (step.status === 'active') {
            icon = <span className="execution-step-spinner" />
          } else {
            icon = <span className="execution-step-dot">○</span>
          }
          return (
            <div key={step.id} className={`execution-step execution-step-${step.status}`}>
              <span className="execution-step-icon">{icon}</span>
              <div className="execution-step-body">
                <Text size="1">{step.title}</Text>
                {step.status === 'active' && step.progress && (
                  <Text size="1" color="gray">{step.progress}</Text>
                )}
                {step.status === 'failed' && step.message && (
                  <Text size="1" color="red">{step.message}</Text>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DocSnapshotCard({ snapshotBody, timestamp, onOpen }) {
  const snippet = String(snapshotBody || '')
    .replace(/[#*`_>|-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 150)
  let dateLabel = ''
  if (timestamp) {
    try { dateLabel = new Date(timestamp).toLocaleString() } catch { dateLabel = '' }
  }
  return (
    <div className="doc-snapshot-card">
      <div className="doc-snapshot-icon"><IconDoc /></div>
      <div className="doc-snapshot-body">
        <Text size="1" weight="bold" style={{ color: 'var(--blue-11)' }}>Generated Document</Text>
        <Text size="1" color="gray" className="doc-snapshot-snippet">{snippet}</Text>
        {dateLabel && <Text size="1" color="gray">{dateLabel}</Text>}
      </div>
      <Button size="1" variant="soft" color="blue" style={{ cursor: 'pointer', flexShrink: 0 }} onClick={onOpen}>
        Open
      </Button>
    </div>
  )
}

function Citations({ citations }) {
  const [open, setOpen] = React.useState(false)
  if (!citations || citations.length === 0) return null
  return (
    <div className="kb-citations">
      <button type="button" className="kb-citations-toggle" onClick={() => setOpen(o => !o)}>
        <IconDoc /> {citations.length} source{citations.length > 1 ? 's' : ''} <span className="kb-citations-caret">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="kb-citations-list">
          {citations.map((c, i) => (
            <div key={i} className="kb-citation">
              <Text size="1" weight="bold" style={{ color: 'var(--blue-11)' }}>[Source {i + 1}] {c.source_title}</Text>
              {c.chunk_text && <Text size="1" color="gray" style={{ display: 'block', lineHeight: 1.4 }}>{c.chunk_text}</Text>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SectionContextMenu({ onExplain, onEdit }) {
  return (
    <div className="section-context-menu" onClick={(e) => e.stopPropagation()}>
      <button className="section-ctx-btn explain" onClick={onExplain}><Bot size={11} /> Explain</button>
      <button className="section-ctx-btn edit" onClick={onEdit}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg> Edit</button>
    </div>
  )
}

function SectionAwareMarkdown({ content, onExplain, onEdit }) {
  const sections = content.split(/(?=^## )/m).filter(Boolean)
  return sections.map((section, i) => (
    <div key={i} className="prd-section">
      <SectionContextMenu onExplain={() => onExplain(section)} onEdit={() => onEdit(section)} />
      <div dangerouslySetInnerHTML={{ __html: marked.parse(section) }} />
    </div>
  ))
}

function SectionModal({ mode, sectionText, onClose, onSendToAgent }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bodyRef = useRef(null)

  useEffect(() => { bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight) }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsLoading(true)

    try {
      const result = await onSendToAgent(userMsg, mode)
      setMessages(prev => [...prev, { role: 'assistant', content: result }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    }
    setIsLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const title = mode === 'explain' ? 'Explain Section' : 'Edit Section'

  return (
    <div className="section-modal-overlay" onClick={onClose}>
      <div className="section-modal" onClick={(e) => e.stopPropagation()}>
        <div className="section-modal-header">
          <h3>{title}</h3>
          <IconButton size="1" variant="ghost" color="gray" onClick={onClose} style={{ cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </IconButton>
        </div>
        <div className="section-modal-body" ref={bodyRef}>
          <div className="modal-section-text" dangerouslySetInnerHTML={{ __html: marked.parse(sectionText) }} />
          {messages.length > 0 && (
            <div className="modal-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`modal-msg ${msg.role}`} dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} />
              ))}
              {isLoading && <div className="modal-msg assistant loading">kavi ai is thinking...</div>}
            </div>
          )}
        </div>
        <div className="section-modal-footer">
          <div className="modal-input-row">
            <textarea
              rows={1}
              placeholder={mode === 'explain' ? 'Ask a follow-up question...' : 'Describe the changes you want...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button size="2" variant="soft" color="blue" onClick={handleSend} disabled={!input.trim() || isLoading} style={{ cursor: 'pointer', flexShrink: 0 }}>
              <IconSend />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyProcessState() {
  return (
    <div className="empty-state">
      <SkeletonLoader />
      <Heading size="3" style={{ color: 'var(--gray-11)' }}>No active processes</Heading>
      <Text size="2" color="gray" style={{ maxWidth: 280, lineHeight: 1.5 }}>
        Start a refinement session to compile specifications.
      </Text>
    </div>
  )
}

function LoaderMessage({ text }) {
  return (
    <div className="loader-card">
      <div className="loader-pulse" />
      <Text size="2" color="gray" italic>{text}</Text>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   FEATURE EVALUATION (22 SaaS Features) — Interactive Parser
   ═══════════════════════════════════════════════════════════ */

function parseFeatureEvaluation(content) {
  const header = content.match(/### Feature (\d+)\/22:\s*(.+)/)
  if (!header) return null

  const observationMatch = content.match(/\[LLM Observation Stream\]([\s\S]*?)(?:\r?\n---|\r?\n### Implementation Options)/)
  const observation = observationMatch ? observationMatch[1].trim() : ''

  const options = []
  const optionLines = content.split('\n')
  for (let i = 0; i < optionLines.length; i++) {
    const line = optionLines[i]
    const m = line.match(/^\[([ xX])\]\s*Option\s*(\d+):\s*(.+?)(?:\s*\[(STRONGLY RECOMMENDED)\])?\s*$/)
    if (!m) continue
    let value = ''
    for (let j = i + 1; j < optionLines.length; j++) {
      const vm = optionLines[j].match(/└\s*Value:\s*(.+)/)
      if (vm) { value = vm[1].trim(); break }
      if (/^\[\s*[ xX]\]\s*Option/.test(optionLines[j])) break
    }
    options.push({
      num: parseInt(m[2], 10),
      name: m[3].replace(/\*\*/g, '').trim(),
      recommended: !!m[4],
      checked: m[1].toLowerCase() === 'x',
      value,
    })
  }

  const footer = content.match(/\*Please select your preferred option\(s\).*\*/)
  return {
    featureNumber: header[1],
    featureName: header[2].trim(),
    observation,
    options,
    footer: footer ? footer[0] : '',
  }
}

function getNextFeatureNumber(historyPool = []) {
  let highest = 0
  for (const msg of historyPool) {
    if (msg?.role !== 'assistant') continue
    const parsed = parseFeatureEvaluation(msg.content)
    if (parsed) {
      const n = parseInt(parsed.featureNumber, 10)
      if (n > highest) highest = n
    }
  }
  return highest + 1
}

function FeatureEvalCard({ content, onSendSelection, disabled }) {
  const parsed = React.useMemo(() => parseFeatureEvaluation(content), [content])
  const [selection, setSelection] = React.useState(() =>
    parsed ? parsed.options.filter((o) => o.checked).map((o) => o.num) : []
  )

  if (!parsed) return null

  const toggle = (num) =>
    setSelection((prev) => prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num])

  const selectedOptions = parsed.options.filter((o) => selection.includes(o.num))
  const sendText = selection.length === 0
    ? `Move to the next feature.`
    : `Selected for Feature ${parsed.featureNumber}: ${selectedOptions.map((o) => `Option ${o.num} (${o.name})`).join(', ')}`

  return (
    <div className="feature-eval-card">
      <div className="md-content" dangerouslySetInnerHTML={{ __html: marked.parse(content.split('### Implementation Options')[0]) }} />

      <div className="feature-options">
        {parsed.options.map((o) => {
          const isSelected = selection.includes(o.num)
          return (
            <button
              key={o.num}
              type="button"
              className={`feature-option-row ${isSelected ? 'feature-option-row-selected' : ''}`}
              onClick={() => !disabled && toggle(o.num)}
              disabled={disabled}
            >
              <span className="feature-checkbox">{isSelected ? '✓' : ''}</span>
              <span className="feature-option-body">
                <span className="feature-option-name">
                  Option {o.num}: {o.name}
                  {o.recommended && <span className="feature-recommended">STRONGLY RECOMMENDED</span>}
                </span>
                {o.value && <span className="feature-option-value">{o.value}</span>}
              </span>
            </button>
          )
        })}
      </div>

      <Flex gap="2" mt="2">
        <Button
          size="1" variant="soft" color="blue"
          style={{ cursor: disabled ? 'not-allowed' : 'pointer', borderRadius: 6 }}
          disabled={disabled}
          onClick={() => !disabled && onSendSelection(sendText)}
        >
          {selection.length === 0 ? 'Next Feature' : `Send Selection (${selection.length})`}
        </Button>
        {selection.length > 0 && (
          <Button
            size="1" variant="ghost" color="gray"
            style={{ cursor: disabled ? 'not-allowed' : 'pointer', borderRadius: 6 }}
            disabled={disabled}
            onClick={() => !disabled && onSendSelection(`Move to the next feature.`)}
          >
            Skip
          </Button>
        )}
      </Flex>

      {parsed.footer && (
        <Text size="1" color="gray" style={{ display: 'block', marginTop: 8, fontStyle: 'italic' }}>
          {parsed.footer}
        </Text>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function AgentWorkspacePage() {
  const { orgId, projectId } = useParams()
  const navigate = useNavigate()

  const [userInputText, setUserInputText] = useState('')
  const [isSetupState, setIsSetupState] = useState(true)
  const [chatMessages, setChatMessages] = useState([])
  const [canvasRefreshKey, setCanvasRefreshKey] = useState(0)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)
  const eventSourceRef = useRef(null)
  const [executionSteps, setExecutionSteps] = useState([])

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close()
      eventSourceRef.current = null
    }
  }, [])

  const [isProcessing, setIsProcessing] = useState(false)
  const [submittedFeatureEvals, setSubmittedFeatureEvals] = useState([])
  const [activeDocumentId, setActiveDocumentId] = useState(null)
  const [isLoadingPage, setIsLoadingPage] = useState(true)
  const [activeSegment, setActiveSegment] = useState('doc')
  const [showDocumentSplitPane, setShowDocumentSplitPane] = useState(false)
  const [documentPreviewBody, setDocumentPreviewBody] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [taskFlowGenerated, setTaskFlowGenerated] = useState(false)
  const [uiGenerated, setUiGenerated] = useState(false)
  const [isGeneratingWorkflow, setIsGeneratingWorkflow] = useState(false)
  const [isGeneratingUI, setIsGeneratingUI] = useState(false)
  const [progressPages, setProgressPages] = useState([])
  const [progressEdges, setProgressEdges] = useState([])
  const [uiGenerationProgress, setUIGenerationProgress] = useState(null)
  const [inputMode, setInputMode] = useState('chat')
  const [liveExplainabilityText, setLiveExplainabilityText] = useState('Initializing background process models...')
  const [completeHistoryPool, setCompleteHistoryPool] = useState([])
  const [currentPageIndex, setCurrentPageIndex] = useState(1)
  const [hasMoreHistoryToLoad, setHasMoreHistoryToLoad] = useState(true)
  const [isPaginationLoading, setIsPaginationLoading] = useState(false)
  const [snapshotHistoryStack, setSnapshotHistoryStack] = useState([])
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(-1)
  const [sectionModal, setSectionModal] = useState(null) // { mode: 'explain'|'edit', sectionText: '' }
  const [docVersions, setDocVersions] = useState([]) // [{ body, label, timestamp }]
  const [docVersionIndex, setDocVersionIndex] = useState(-1)
  const [showVersionPanel, setShowVersionPanel] = useState(false)
  const [docViewMode, setDocViewMode] = useState('rendered') // 'rendered' | 'source' | 'diagrams'
  const pageSize = 8
  const [kbStatus, setKbStatus] = useState(null)
  const [isKbBusy, setIsKbBusy] = useState(false)

  const chatScrollContainerRef = useRef(null)
  const chatBottomRef = useRef(null)
  const isFirstLoadRef = useRef(true)

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('')
  const [productName, setProductName] = useState('')
  const [targetAudience] = useState('Enterprise Users')
  const [techStackFocus] = useState('FastAPI, MongoDB, React')

  /* ─── Helpers ─────────────────────────────────────────── */

  const updateUrlParam = (docId) => {
    const url = new URL(window.location.href)
    if (docId) url.searchParams.set('docId', docId)
    else url.searchParams.delete('docId')
    window.history.pushState({}, '', url.toString())
  }

  const getStageStatus = (stage) => {
    const t = liveExplainabilityText || ""
    if (stage === 'doc') {
      if (t.includes("Compiling project task flows") || t.includes("Designing front-end UI") || t.includes("completed") || t.includes("successfully")) return 'done'
      return 'loading'
    }
    if (stage === 'tasks') {
      if (t.includes("Designing front-end UI") || t.includes("completed") || t.includes("successfully")) return 'done'
      if (t.includes("Compiling project task flows")) return 'loading'
      return 'pending'
    }
    if (stage === 'ui') {
      if (t.includes("completed") || t.includes("successfully")) return 'done'
      if (t.includes("Designing front-end UI")) return 'loading'
      return 'pending'
    }
    return 'pending'
  }

  const decodeHtmlEntities = (html) => {
    const entities = { '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#x27;': "'", '&apos;': "'", '&ensp;': ' ', '&emsp;': ' ', '&mdash;': '—', '&ndash;': '–', '&hellip;': '…', '&lsquo;': '\u2018', '&rsquo;': '\u2019', '&ldquo;': '\u201C', '&rdquo;': '\u201D', '&copy;': '©', '&reg;': '®', '&trade;': '™' }
    return html.replace(/&[#\w]+;/g, (entity) => entities[entity] || entity)
  }

  const cleanAndExtractMarkdown = (rawContent) => {
    if (!rawContent) return ''
    let processed = rawContent.trim()
    if (processed.startsWith('"') && processed.endsWith('"')) processed = processed.slice(1, -1)

    for (let i = 0; i < 5; i++) {
      if (processed.startsWith('{') || processed.includes('"response"')) {
        try {
          const standardized = processed.replace(/\\n/g, '\n').replace(/\\"/g, '"')
          const parsed = JSON.parse(standardized)
          if (parsed?.response) { processed = parsed.response; continue }
          if (typeof parsed === 'string') { processed = parsed; continue }
        } catch {
          const match = processed.match(/"response"\s*:\s*"([\s\S]*?)"\s*(?:,|\s*})/)
          if (match?.[1]) { processed = match[1]; continue }
          break
        }
      } else break
    }
    processed = processed.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\t/g, '\t')
    processed = decodeHtmlEntities(processed)
    processed = processed.replace(/<[^>]+>/g, '')
    processed = processed.replace(/(#{1,6}\s)/g, '\n\n$1')
    processed = processed.replace(/\n{3,}/g, '\n\n')
    return processed.trim()
  }

  /* Maps a raw chat_history entry to [userMsg, assistantMsg]. Generated
     documents (is_doc_snapshot or multi-heading bodies) become individual
     snapshots the user can reopen from the timeline. */
  const mapChatEntryToMessage = (log) => {
    if (!log || typeof log.agent_prompt_or_chat !== 'string') return null
    const splitIdx = log.agent_prompt_or_chat.indexOf(' | Agent: ')
    if (splitIdx === -1) return null
    const userPart = log.agent_prompt_or_chat.substring(6, splitIdx)
    const agentPart = log.agent_prompt_or_chat.substring(splitIdx + 9)
    const md = cleanAndExtractMarkdown(agentPart)
    const isDocSnapshot = !!log.is_doc_snapshot || (md.match(/^#{1,3} /gm) || []).length > 3
    const snapshotBody = (log.saved_snapshot_body && String(log.saved_snapshot_body).length > 40)
      ? log.saved_snapshot_body
      : (isDocSnapshot ? md : undefined)
    return [
      { role: 'user', content: userPart, timestamp: log.timestamp },
      {
        role: 'assistant',
        content: md || agentPart,
        isDocSnapshot,
        snapshotBody,
        citations: log.citations || [],
        timestamp: log.timestamp
      }
    ]
  }

  /* ─── Fetch Project Name ──────────────────────────────── */

  useEffect(() => {
    if (!projectId || !orgId) return
    getProject(orgId, projectId)
      .then((proj) => { if (proj?.name) setProductName(proj.name) })
      .catch(() => {})
  }, [orgId, projectId])

  /* ─── Session Hydration ──────────────────────────────── */

  useEffect(() => {
    const autoHydrateSession = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search)
        const urlDocId = searchParams.get('docId') || localStorage.getItem('active_prd_doc_id')
        const directoryPool = await DocsManagementService.getAllWorkspaces(orgId)
        if (directoryPool.length > 0) {
          const matchWorkspace = directoryPool.find(ws => String(ws.project_id) === String(projectId))
          const targetWorkspace = matchWorkspace || directoryPool[0]
          setSelectedWorkspaceId(targetWorkspace.id)

          const sortedDocs = targetWorkspace.documents
            ? [...targetWorkspace.documents].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            : []

          let targetDoc = null
          if (urlDocId) targetDoc = sortedDocs.find(d => String(d.id) === String(urlDocId) || String(d._id) === String(urlDocId))
          if (!targetDoc) targetDoc = sortedDocs.find(d => d.title === `Interactive PRD: ${productName}`)

          if (targetDoc) {
            const parsedMessages = []
            const structuralStack = []

            if (targetDoc.chat_history?.length) {
              targetDoc.chat_history.forEach(log => {
                if (log.is_plan_card) { return }
                const mapped = mapChatEntryToMessage(log)
                if (!mapped) return
                parsedMessages.push(...mapped)
                const snap = mapped[1]
                if (snap.isDocSnapshot && snap.snapshotBody && !structuralStack.includes(snap.snapshotBody)) structuralStack.push(snap.snapshotBody)
              })
            }

            if (targetDoc.body && targetDoc.body !== 'Initializing configuration loop...') {
              const mainMd = cleanAndExtractMarkdown(targetDoc.body)
              setDocumentPreviewBody(mainMd)
              setDocVersions([{ body: mainMd, label: 'Initial version', timestamp: new Date(targetDoc.updated_at || Date.now()) }])
              setDocVersionIndex(0)
              if (mainMd && !structuralStack.includes(mainMd)) structuralStack.push(mainMd)
            }

            setCompleteHistoryPool(parsedMessages)
            const validLogs = (targetDoc.chat_history || []).filter(log =>
              !log.is_plan_card
              && typeof log.agent_prompt_or_chat === 'string'
              && log.agent_prompt_or_chat.includes(' | Agent: ')
            )
            const pageOneLogs = validLogs.slice(Math.max(0, validLogs.length - pageSize))
            setChatMessages(pageOneLogs.flatMap(log => mapChatEntryToMessage(log)).filter(Boolean))
            setHasMoreHistoryToLoad(validLogs.length > pageSize)

            // Restore the last agent execution activity (steps + statuses) from the
            // API response so the activity panel survives a page refresh.
            if (targetDoc.last_execution?.steps?.length) {
              setExecutionSteps((targetDoc.last_execution.steps || []).map(s => ({
                id: s.id,
                title: s.title,
                description: s.description || '',
                status: s.status || 'done',
                result: s.result || '',
                progress: s.progress || ''
              })))
            }
            setSnapshotHistoryStack(structuralStack)
            setCurrentSnapshotIndex(structuralStack.length - 1)

            const docId = targetDoc.id || targetDoc._id
            setActiveDocumentId(docId)
            localStorage.setItem('active_prd_doc_id', docId)
            updateUrlParam(docId)
            setIsSetupState(false)
            setShowDocumentSplitPane(inputMode === 'plan')

            if (projectId) {
              try {
                const existingTasks = await getTasks(projectId)
                if (existingTasks && existingTasks.length > 0) setTaskFlowGenerated(true)
              } catch (_) {}
              try {
                const canvas = await CanvasApi.getCanvas(projectId)
                if (canvas?.layout_json) setUiGenerated(true)
              } catch (_) {}
            }

            const savedJobId = localStorage.getItem('running_compilation_job_id')
            const savedJobMode = localStorage.getItem('running_compilation_mode')
            const savedJobHistory = localStorage.getItem('running_compilation_history')
            if (savedJobId) {
              setIsProcessing(true)
              if (savedJobMode) { setInputMode(savedJobMode); if (savedJobMode === 'plan') { setActiveSegment('process'); setShowDocumentSplitPane(true) } }
              const parsed = savedJobHistory ? JSON.parse(savedJobHistory) : []
              if (parsed.length) setChatMessages(parsed)
              startStatusPollingLoop(savedJobId, parsed, savedJobMode || 'chat')
            }
          }
        }
      } catch (err) { console.error('Session hydration failed:', err) }
      finally { setIsLoadingPage(false) }
    }
    autoHydrateSession()
  }, [])

  useEffect(() => {
    if (chatMessages.length > 0 && isFirstLoadRef.current) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'auto' })
      isFirstLoadRef.current = false
    } else if (chatMessages.length > 0 && !isPaginationLoading && !isProcessing) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, isPaginationLoading, isProcessing])

  /* ─── Polling Loop ──────────────────────────────────── */

  const startStatusPollingLoop = (jobId, workingHistory, targetMode = inputMode) => {
    localStorage.setItem('running_compilation_job_id', jobId)
    localStorage.setItem('running_compilation_mode', targetMode)
    localStorage.setItem('running_compilation_history', JSON.stringify(workingHistory))

    // Reset the structured-execution activity panel for this new run.
    setExecutionSteps([])

    const upsertStep = (stepId, patch, titleFallback) => {
      setExecutionSteps(prev => {
        if (!stepId) return prev
        const idx = prev.findIndex(s => s.id === stepId)
        if (idx === -1) {
          return [...prev, { id: stepId, title: titleFallback || stepId, description: '', status: 'pending', ...patch }]
        }
        const next = [...prev]
        next[idx] = { ...next[idx], ...patch }
        return next
      })
    }

    let settled = false
    const finalizeJob = (jobData) => {
      if (settled) return
      settled = true
      clearInterval(interval)
      eventSourceRef.current?.close()
      eventSourceRef.current = null
      localStorage.removeItem('running_compilation_job_id')
      localStorage.removeItem('running_compilation_mode')
      localStorage.removeItem('running_compilation_history')

      const cleanedMd = cleanAndExtractMarkdown(jobData.response)
      const isDocSnapshot = (cleanedMd.match(/^#{1,3} /gm) || []).length > 3
      const msg = {
        role: 'assistant',
        content: cleanedMd,
        isDocSnapshot,
        snapshotBody: isDocSnapshot ? cleanedMd : undefined,
        citations: jobData.citations || []
      }
      setChatMessages([...workingHistory, msg])
      setCompleteHistoryPool(prev => [...prev, msg])
      if (isDocSnapshot) {
        const updatedStack = [...snapshotHistoryStack, cleanedMd]
        setSnapshotHistoryStack(updatedStack)
        setCurrentSnapshotIndex(updatedStack.length - 1)
        pushDocVersion(cleanedMd, 'Generated document')
        setShowDocumentSplitPane(true)
        setCanvasRefreshKey(prev => prev + 1)
      }
      setIsProcessing(false)
    }
    const failJob = () => {
      if (settled) return
      settled = true
      clearInterval(interval)
      eventSourceRef.current?.close()
      eventSourceRef.current = null
      localStorage.removeItem('running_compilation_job_id')
      localStorage.removeItem('running_compilation_mode')
      localStorage.removeItem('running_compilation_history')
      setIsProcessing(false)
    }

    // Polling watchdog/fallback: still resolves if SSE drops or is unavailable.
    const interval = setInterval(async () => {
      try {
        const jobData = await AgentWorkspaceService.checkBackgroundJobStatus(jobId)
        if (jobData.explainability) setLiveExplainabilityText(jobData.explainability)

        if (jobData.status === 'completed') {
          finalizeJob(jobData)
        } else if (jobData.status === 'failed') {
          failJob()
        }
      } catch { /* polling error */ }
    }, 1500)

    // Live SSE status stream from the backend.
    try {
      eventSourceRef.current = AgentWorkspaceService.streamInteractiveChatJob(jobId, {
        onStatus: ({ explainability } = {}) => {
          if (explainability) setLiveExplainabilityText(explainability)
        },
        onExecutionStarted: () => {
          setExecutionSteps([])
        },
        onPlan: ({ steps } = {}) => {
          setExecutionSteps((steps || []).map(s => ({
            id: s.id, title: s.title, description: s.description || '', status: 'pending'
          })))
        },
        onStepStarted: ({ step_id, title, description } = {}) => {
          upsertStep(step_id, { status: 'active', title: title || step_id, description: description || '' }, title)
        },
        onStepProgress: ({ step_id, status } = {}) => {
          upsertStep(step_id, { status: 'active', progress: status || '' }, null)
        },
        onStepCompleted: ({ step_id, title, result } = {}) => {
          upsertStep(step_id, { status: 'done', title: title || step_id, result: result || '' }, null)
        },
        onStepFailed: ({ step_id, title, message } = {}) => {
          upsertStep(step_id, { status: 'failed', title: title || step_id, message: message || '' }, null)
        },
        onResult: (result) => finalizeJob({ ...result, status: 'completed' }),
        onError: () => failJob(),
        onDone: () => {
          // Server closed the stream; polling watchdog takes over if not settled.
          eventSourceRef.current?.close()
          eventSourceRef.current = null
        }
      })
    } catch { /* SSE unavailable — polling only */ }
  }

  /* ─── Handlers ──────────────────────────────────────── */

  /* Version History (Undo/Redo) */
  const pushDocVersion = (newBody, label = '') => {
    setDocVersions(prev => {
      const trimmed = prev.slice(0, docVersionIndex + 1)
      const entry = { body: newBody, label: label || `Version ${trimmed.length + 1}`, timestamp: new Date() }
      const updated = [...trimmed, entry]
      setDocVersionIndex(updated.length - 1)
      return updated
    })
    setDocumentPreviewBody(newBody)
  }

  const handleUndo = () => {
    if (docVersionIndex > 0) {
      const prev = docVersionIndex - 1
      setDocVersionIndex(prev)
      setDocumentPreviewBody(docVersions[prev].body)
    }
  }

  const handleRedo = () => {
    if (docVersionIndex < docVersions.length - 1) {
      const next = docVersionIndex + 1
      setDocVersionIndex(next)
      setDocumentPreviewBody(docVersions[next].body)
    }
  }

  const handleJumpToVersion = (idx) => {
    setDocVersionIndex(idx)
    setDocumentPreviewBody(docVersions[idx].body)
  }

  /* Legacy snapshot nav (kept for plan mode cards) */
  const handleNavigateHistoryBack = () => {
    if (currentSnapshotIndex > 0) {
      const prev = currentSnapshotIndex - 1
      setCurrentSnapshotIndex(prev)
      setDocumentPreviewBody(snapshotHistoryStack[prev])
    }
  }

  const handleNavigateHistoryForward = () => {
    if (currentSnapshotIndex < snapshotHistoryStack.length - 1) {
      const next = currentSnapshotIndex + 1
      setCurrentSnapshotIndex(next)
      setDocumentPreviewBody(snapshotHistoryStack[next])
    }
  }

  const handleTriggerFileDownloadExport = (fmt) => {
    let content = documentPreviewBody
    let fileName = `${productName.toLowerCase().replace(/\s+/g, '_')}_prd`
    let mime = 'text/markdown'
    if (fmt === 'html') {
      content = `<!DOCTYPE html><html><head><title>PRD - ${productName}</title><style>body{font-family:sans-serif;line-height:1.6;padding:40px;max-width:800px;margin:0 auto;}</style></head><body>${documentPreviewBody.replace(/\n/g, '<br/>')}</body></html>`
      fileName += '.html'; mime = 'text/html'
    } else if (fmt === 'json') {
      content = JSON.stringify({ product_name: productName, prd_body_markdown: documentPreviewBody }, null, 2)
      fileName += '.json'; mime = 'application/json'
    } else { fileName += '.md' }

    const blob = new Blob([content], { type: mime })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = fileName
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  const handleScrollPaginationTrackLoop = (e) => {
    const el = e.currentTarget
    if (el.scrollTop <= 5 && hasMoreHistoryToLoad && !isPaginationLoading && chatMessages.length > 0) {
      setIsPaginationLoading(true)
      const prevHeight = el.scrollHeight
      const nextPage = currentPageIndex + 1
      AgentWorkspaceService.getDocumentChatHistory(activeDocumentId, nextPage, pageSize)
        .then(({ entries, has_more } = {}) => {
          const chunk = []
          ;(entries || []).forEach(log => {
            const mapped = mapChatEntryToMessage(log)
            if (mapped) chunk.push(...mapped)
          })
          if (chunk.length > 0) {
            setChatMessages(prev => [...chunk, ...prev])
            setCurrentPageIndex(nextPage)
          }
          setHasMoreHistoryToLoad(has_more === true)
          setTimeout(() => { el.scrollTop = el.scrollHeight - prevHeight }, 0)
        })
        .catch(() => setHasMoreHistoryToLoad(false))
        .finally(() => setIsPaginationLoading(false))
    }
  }

  const handleToggleVoiceDictation = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    if (isListening) { setIsListening(false); return }
    const rec = new SR()
    rec.continuous = false; rec.lang = 'en-US'
    rec.onstart = () => setIsListening(true)
    rec.onend = () => setIsListening(false)
    rec.onresult = (e) => setUserInputText(prev => prev + " " + e.results[0][0].transcript)
    rec.start()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    setTimeout(() => {
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`
      setUploadedFile({ name: file.name, size: sizeStr, type: file.type || 'application/octet-stream' })
      setIsUploading(false)
    }, 600)
  }

  /* ─── Section Modal Handlers ────────────────────────── */

  const handleOpenExplain = (sectionText) => setSectionModal({ mode: 'explain', sectionText })
  const handleOpenEdit = (sectionText) => setSectionModal({ mode: 'edit', sectionText })
  const handleCloseModal = () => setSectionModal(null)

  const handleSectionAgentCall = async (userMessage, mode) => {
    if (!selectedWorkspaceId) return 'No workspace selected.'
    const prompt = mode === 'explain'
      ? `Explain the following PRD section in detail. Break down what it means, why it matters, implementation implications, and answer the user's follow-up question.\n\nSection:\n${sectionModal.sectionText}\n\nUser question: ${userMessage}`
      : `The user wants to edit the following PRD section. Understand their requested changes, ask clarifying questions if needed, then output the COMPLETE revised section in markdown. Preserve the original heading.\n\nOriginal section:\n${sectionModal.sectionText}\n\nRequested change: ${userMessage}`

    const nextMsg = { role: 'user', content: prompt }
    setChatMessages(prev => [...prev, nextMsg])
    setCompleteHistoryPool(prev => [...prev, nextMsg])

    try {
      const token = await AgentWorkspaceService.processInteractiveChatStep({
        workspace_id: selectedWorkspaceId, product_name: productName,
        messages: [nextMsg], target_audience: targetAudience, tech_stack_focus: techStackFocus,
        document_id: activeDocumentId, project_id: projectId, mode: 'chat'
      })
      setActiveDocumentId(token.document_id)
      localStorage.setItem('active_prd_doc_id', token.document_id)
      updateUrlParam(token.document_id)

      const jobData = await new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
          try {
            const status = await AgentWorkspaceService.checkBackgroundJobStatus(token.job_id)
            if (status.explainability) setLiveExplainabilityText(status.explainability)
            if (status.status === 'completed') { clearInterval(interval); resolve(status) }
            else if (status.status === 'failed') { clearInterval(interval); reject(new Error('failed')) }
          } catch { /* polling */ }
        }, 1200)

        try {
          const stream = AgentWorkspaceService.streamInteractiveChatJob(token.job_id, {
            onStatus: ({ explainability } = {}) => {
              if (explainability) setLiveExplainabilityText(explainability)
            },
            onResult: (result) => {
              clearInterval(interval)
              stream.close()
              resolve({ ...result, status: 'completed' })
            },
            onError: () => {
              clearInterval(interval)
              stream.close()
              reject(new Error('failed'))
            },
            onDone: () => stream.close()
          })
        } catch { /* SSE unavailable — polling only */ }
      })

      const cleanedMd = cleanAndExtractMarkdown(jobData.response)
      const msg = { role: 'assistant', content: cleanedMd, hasChangeSummaryCard: false, citations: jobData.citations || [] }
      setChatMessages(prev => [...prev, msg])
      setCompleteHistoryPool(prev => [...prev, msg])

      if (mode === 'edit') {
        const sectionHeading = sectionModal.sectionText.split('\n')[0].replace(/^#+\s*/, '').trim()
        const headingPattern = new RegExp(`(^## ${sectionHeading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?)(?=\\n## |$)`, 'm')
        const updated = documentPreviewBody.replace(headingPattern, cleanedMd)
        if (updated !== documentPreviewBody) {
          pushDocVersion(updated, `Edited: ${sectionHeading}`)
        } else {
          pushDocVersion(documentPreviewBody.replace(sectionModal.sectionText, cleanedMd), `Edited: ${sectionHeading}`)
        }
      }

      return cleanedMd
    } catch {
      return 'Request failed. Please try again.'
    }
  }

  const handleStartRefinementLoop = async (overridePrompt = null) => {
    const promptToSend = overridePrompt || userInputText
    if (!promptToSend.trim() || !selectedWorkspaceId) return

    setIsSetupState(false)
    setIsProcessing(true)
    setActiveSegment('process')
    isFirstLoadRef.current = true
    setLiveExplainabilityText("Spawning background thread worker instances...")

    const nextMsg = { role: 'user', content: promptToSend }
    setChatMessages(prev => [...prev, nextMsg])
    setCompleteHistoryPool(prev => [...prev, nextMsg])
    setUserInputText('')

    try {
      const token = await AgentWorkspaceService.processInteractiveChatStep({
        workspace_id: selectedWorkspaceId, product_name: productName,
        messages: [nextMsg], target_audience: targetAudience, tech_stack_focus: techStackFocus,
        document_id: activeDocumentId, project_id: projectId, mode: 'chat',
        current_feature: getNextFeatureNumber(completeHistoryPool)
      }, orgId)
      setActiveDocumentId(token.document_id)
      localStorage.setItem('active_prd_doc_id', token.document_id)
      updateUrlParam(token.document_id)
      startStatusPollingLoop(token.job_id, [nextMsg], 'chat')
    } catch { setIsProcessing(false) }
  }

  const handleSendChatMessage = async () => {
    if (!userInputText.trim() || isProcessing) return
    setIsProcessing(true)
    setActiveSegment('process')

    const nextMsg = { role: 'user', content: userInputText }
    const fullPool = [...completeHistoryPool, nextMsg]
    setChatMessages(prev => [...prev, nextMsg])
    setCompleteHistoryPool(fullPool)
    setUserInputText('')
    setLiveExplainabilityText("Sending updates payload upstream...")

    try {
      const token = await AgentWorkspaceService.processInteractiveChatStep({
        workspace_id: selectedWorkspaceId, product_name: productName,
        messages: fullPool, target_audience: targetAudience, tech_stack_focus: techStackFocus,
        document_id: activeDocumentId, project_id: projectId, mode: 'chat',
        current_feature: getNextFeatureNumber(fullPool)
      }, orgId)
      startStatusPollingLoop(token.job_id, [...chatMessages, nextMsg], 'chat')
    } catch { setIsProcessing(false) }
  }

  const handleFeatureSelectionSend = async (selectionText, submittedMsgKey) => {
    if (!selectionText.trim() || isProcessing) return
    setIsProcessing(true)
    setActiveSegment('process')
    if (submittedMsgKey) setSubmittedFeatureEvals(prev => [...prev, submittedMsgKey])

    const parsedCard = submittedMsgKey ? parseFeatureEvaluation(submittedMsgKey) : null
    const nextFeature = parsedCard
      ? (parseInt(parsedCard.featureNumber, 10) || 0) + 1
      : getNextFeatureNumber(completeHistoryPool)

    const nextMsg = { role: 'user', content: selectionText }
    const fullPool = [...completeHistoryPool, nextMsg]
    setChatMessages(prev => [...prev, nextMsg])
    setCompleteHistoryPool(fullPool)
    setUserInputText('')
    setLiveExplainabilityText("Recording feature selections...")

    try {
      const token = await AgentWorkspaceService.processInteractiveChatStep({
        workspace_id: selectedWorkspaceId, product_name: productName,
        messages: fullPool, target_audience: targetAudience, tech_stack_focus: techStackFocus,
        document_id: activeDocumentId, project_id: projectId, mode: 'chat',
        current_feature: nextFeature
      }, orgId)
      startStatusPollingLoop(token.job_id, [...chatMessages, nextMsg], 'chat')
    } catch { setIsProcessing(false) }
  }

  const handleMakeTaskFlow = async () => {
    if (!activeDocumentId || !projectId || isGeneratingPlan) return
    setIsGeneratingPlan(true)
    try {
      await PlannerApi.generateProjectPlan(projectId, activeDocumentId)
      await PlannerApi.generateWorkflow(projectId)
      setTaskFlowGenerated(true)
      setActiveSegment('task-flow')
    } catch (err) {
      console.error('Task flow generation failed:', err)
    } finally {
      setIsGeneratingPlan(false)
    }
  }

  const handleGenerateUI = async () => {
    if (!activeDocumentId || !projectId || isGeneratingUI) return
    setIsGeneratingUI(true)
    setProgressPages([])
    setProgressEdges([])
    setUIGenerationProgress({ current: 0, total: 0, screenName: '' })
    setActiveSegment('ui-builder')

    await CanvasApi.generateCanvasStream(projectId, activeDocumentId, {
      onPage: (page, index, total) => {
        setProgressPages(prev => [...prev, page])
        setUIGenerationProgress({ current: index + 1, total, screenName: page.name })
      },
      onComplete: (total, edges) => {
        setProgressEdges(edges || [])
        setUiGenerated(true)
        setUIGenerationProgress(null)
        setCanvasRefreshKey(prev => prev + 1)
        setTimeout(() => { setProgressPages([]); setProgressEdges([]) }, 500)
      },
      onError: (err) => {
        console.error('UI generation failed:', err)
        setUIGenerationProgress(null)
        setProgressPages([])
      }
    })
    setIsGeneratingUI(false)
  }

  const handleRegeneratePrd = (msg) => {
    if (!msg?.historicalSnapshotSnapshot) return
    const md = msg.historicalSnapshotSnapshot
    setDocumentPreviewBody(md)
    setDocVersions(prev => {
      const next = [...prev, { body: md, label: 'Regenerated version', timestamp: new Date() }]
      return next
    })
    setDocVersionIndex(prev => prev + 1)
    setActiveSegment('doc')
  }

  const handleIndexKnowledge = async () => {
    if (!projectId || isKbBusy) return
    setIsKbBusy(true)
    try {
      const result = await KnowledgeApi.indexProject(orgId, projectId)
      setKbStatus(prev => ({ ...(prev || {}), indexed_documents: result.indexed_documents, chunks_created: result.chunks_created }))
    } catch (err) {
      console.error('Knowledge index failed:', err)
    } finally {
      setIsKbBusy(false)
    }
  }

  const handleExtractDecisions = async () => {
    if (!projectId || isKbBusy) return
    setIsKbBusy(true)
    try {
      const result = await KnowledgeApi.extractDecisions(orgId, projectId)
      setKbStatus(prev => ({ ...(prev || {}), decisions_extracted: result.decisions_extracted }))
    } catch (err) {
      console.error('Decision extraction failed:', err)
    } finally {
      setIsKbBusy(false)
    }
  }

  const handleOpenSpecificGenerationSnapshot = (snapshotText) => {
    if (!snapshotText) return
    const idx = snapshotHistoryStack.indexOf(snapshotText)
    if (idx !== -1) setCurrentSnapshotIndex(idx)
    setDocumentPreviewBody(snapshotText)
    setShowDocumentSplitPane(true)
  }

  /* ─── Loading ──────────────────────────────────────── */

  if (isLoadingPage) {
    return (
      <div className="agent-workspace" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text size="2" color="gray" weight="medium">Syncing session data...</Text>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */

  return (
    <div className="agent-workspace">

      {/* Loading Overlay */}
      {isGeneratingWorkflow && (
        <div className="loading-overlay">
          <div className="loading-card">
            <div className="spinner" />
            <Heading size="3" weight="bold">Generating Workflow...</Heading>
            <Text size="2" color="gray" style={{ marginTop: 8 }}>Compiling milestones, tasks, and agent nodes.</Text>
          </div>
        </div>
      )}

      {isSetupState ? (
        /* ═══════════════════════════════════════════════════
           SETUP VIEW
           ═══════════════════════════════════════════════════ */
        <div className="agent-setup">
          <Box width="100%" mb="6">
            <Flex align="center" gap="2" mb="3">
              <Box
                asChild
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                <img src={logo} alt="DecisionVault logo" />
              </Box>
              <Text size="4" weight="bold">
                DecisionVault
              </Text>
            </Flex>
            <h1 className="agent-setup-heading">How can I assist your<br />PRD creation today?</h1>
            <p className="agent-setup-sub">Choose a template below or describe your product to start generating specifications.</p>
          </Box>

          <Grid columns={{ initial: '1', sm: '2', md: '4' }} gap="3" width="100%" mb="6">
            {[
              { text: "Create an enterprise user permission authentication system.", icon: <Lock size={14} />, color: 'var(--blue-3)' },
              { text: "Design a secure payment portal using Stripe billing APIs.", icon: <CreditCard size={14} />, color: 'var(--blue-3)' },
              { text: "Build a real-time system metrics monitoring dashboard.", icon: <TrendingUp size={14} />, color: 'var(--amber-3)' },
              { text: "Establish a collaborative team task management sprint board.", icon: <ClipboardList size={14} />, color: 'var(--violet-3)' }
            ].map((item, i) => (
              <div key={i} className="suggestion-card" onClick={() => handleStartRefinementLoop(item.text)}>
                <Text size="2" color="gray" weight="medium" style={{ lineHeight: '1.45' }}>{item.text}</Text>
                <Flex justify="end" mt="2">
                  <div className="suggestion-icon" style={{ background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</div>
                </Flex>
              </div>
            ))}
          </Grid>

          {/* Unified Input Bar */}
          <div className="unified-input-bar">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.txt,.json,.md,.png,.jpg" />
            <textarea
              className="input-textarea"
              placeholder="Describe your product idea, specifications, or ask anything..."
              value={userInputText}
              onChange={(e) => setUserInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleStartRefinementLoop())}
            />
            {uploadedFile && !isUploading && (
              <div className="file-chip">
                <Box style={{ background: 'var(--blue-3)', color: 'var(--blue-11)', padding: 6, borderRadius: 8, display: 'flex' }}>
                  <IconDoc />
                </Box>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text size="1" weight="bold">{uploadedFile.name}</Text>
                  <Text size="1" color="gray" style={{ display: 'block', fontSize: 10 }}>{uploadedFile.size}</Text>
                </Box>
                <IconButton size="1" variant="ghost" color="red" onClick={() => setUploadedFile(null)} style={{ cursor: 'pointer', borderRadius: '50%' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </IconButton>
              </div>
            )}
            <div className="input-actions-bar">
              <Flex gap="2">
                <Button variant="outline" color="gray" size="2" style={{ borderRadius: 20, cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                  <IconPaperclip /> 
                </Button>
                <Button variant="outline" color="gray" size="2" style={{ borderRadius: 20, cursor: 'pointer' }} onClick={handleToggleVoiceDictation}>
                  {isListening ? <IconMicActive /> : <IconMic />}
                  {isListening ? 'Listening...' : ''}
                </Button>
              </Flex>
              <Button
                color="blue" size="2"
                style={{ borderRadius: 20, cursor: 'pointer' }}
                disabled={!userInputText.trim() || isProcessing}
                onClick={() => handleStartRefinementLoop()}
              >
                <IconSend /> Generate
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════
           SPLIT VIEW
           ═══════════════════════════════════════════════════ */
        <div className="split-view">
          <Flex style={{ height: '100%' }}>

            {/* ─── Chat Panel ─── */}
            <div className={`chat-panel ${showDocumentSplitPane ? 'chat-panel-narrow' : 'chat-panel-full'}`}>

              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-header-left">
                  <div className="chat-header-brand">
                    <div className="chat-header-dot" />
                    <Text size="2" weight="bold" style={{ color: 'var(--gray-12)' }}>kavi ai</Text>
                  </div>
                </div>
                <Flex align="center" gap="2">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <Button size="1" variant="soft" color="gray" style={{ cursor: 'pointer' }}>
                        <IconDoc /> Knowledge
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content variant="classic" style={{ zIndex: 50, minWidth: 240 }}>
                      <DropdownMenu.Item onClick={handleIndexKnowledge} disabled={isKbBusy} style={{ cursor: isKbBusy ? 'wait' : 'pointer' }}>
                        <Flex align="center" justify="between" gap="2" style={{ width: '100%' }}>
                          <span>Index project docs</span>
                          {isKbBusy && <Text size="1" color="gray">…</Text>}
                        </Flex>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item onClick={handleExtractDecisions} disabled={isKbBusy} style={{ cursor: isKbBusy ? 'wait' : 'pointer' }}>
                        Extract decision records
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item disabled>
                        <Text size="1" color="gray">
                          {kbStatus
                            ? `${kbStatus.indexed_documents ?? 0} docs · ${kbStatus.chunks_created ?? 0} chunks${kbStatus.decisions_extracted != null ? ` · ${kbStatus.decisions_extracted} decisions` : ''}`
                            : 'Not indexed yet — grounded answers need docs in the KB.'}
                        </Text>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                  <IconButton
                    size="1"
                    variant={showDocumentSplitPane ? 'soft' : 'ghost'}
                    color={showDocumentSplitPane ? 'blue' : 'gray'}
                    onClick={() => setShowDocumentSplitPane(v => !v)}
                    title={showDocumentSplitPane ? 'Close workspace panel' : 'Open workspace panel'}
                    style={{ cursor: 'pointer' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M15 3v18" />
                    </svg>
                  </IconButton>
                </Flex>
              </div>

              {/* Chat Messages */}
              <div
                className="chat-messages"
                ref={chatScrollContainerRef}
                onScroll={handleScrollPaginationTrackLoop}
              >
                <div className="chat-messages-inner">
                  {isPaginationLoading && (
                    <Flex justify="center" p="1">
                      <Text size="1" color="gray" italic>Loading history...</Text>
                    </Flex>
                  )}

                  {chatMessages.map((msg, index) => {
                    const isLastAI = msg.role === 'assistant' && index === chatMessages.length - 1

                    if (msg.is_loader) {
                      return (
                        <div key={index} className="chat-bubble-ai">
                          <LoaderMessage text={msg.saved_snapshot_body} />
                        </div>
                      )
                    }

                    return (
                      <div key={index} className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                        <div className={msg.role === 'user' ? 'chat-bubble-content-user' : 'chat-bubble-content-ai'}>
                          {msg.role === 'user'
                            ? <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                            : parseFeatureEvaluation(msg.content) ? (
                              <FeatureEvalCard
                                content={msg.content}
                                disabled={isProcessing || submittedFeatureEvals.includes(msg.content)}
                                onSendSelection={(text) => handleFeatureSelectionSend(text, msg.content)}
                              />
                            )                             : (
                              <>
                                {msg.isDocSnapshot && (
                                  <DocSnapshotCard
                                    snapshotBody={msg.snapshotBody}
                                    timestamp={msg.timestamp}
                                    onOpen={() => handleOpenSpecificGenerationSnapshot(msg.snapshotBody)}
                                  />
                                )}
                                <div className="md-content" dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} />
                                <Citations citations={msg.citations} />
                              </>
                            )
                          }
                        </div>
                      </div>
                    )
                  })}

                  {executionSteps.length > 0 && <ExecutionActivityPanel steps={executionSteps} />}
                  {isProcessing && executionSteps.length === 0 && <TypingIndicator />}
                  <div ref={chatBottomRef} />
                </div>
              </div>

              {/* Chat Input Dock */}
              <div className="chat-input-dock">
                <div className="chat-input-wrapper">
                  <IconButton
                    className="chat-input-action"
                    onClick={() => document.getElementById('chat-file-uploader')?.click()}
                    disabled={isProcessing}
                    style={{ background: 'transparent' }}
                  >
                    <IconPaperclip />
                  </IconButton>
                  <input type="file" id="chat-file-uploader" style={{ display: 'none' }} onChange={(e) => { if (e.target.files?.[0]) alert(`File "${e.target.files[0].name}" attached.`) }} />
                  <TextField.Root
                    variant="soft" size="3"
                    placeholder={isListening ? "Listening..." : isProcessing ? "kavi ai is thinking..." : "Describe your product idea or ask anything..."}
                    value={userInputText}
                    onChange={(e) => setUserInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                    disabled={isProcessing}
                    style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', boxShadow: 'none', fontSize: 14, height: 40 }}
                  />
                  <IconButton
                    className="chat-input-action"
                    onClick={handleToggleVoiceDictation} disabled={isProcessing}
                    style={{ color: isListening ? 'var(--red-9)' : 'var(--gray-9)', background: 'transparent' }}
                  >
                    {isListening ? <IconMicActive /> : <IconMic />}
                  </IconButton>
                  <IconButton
                    className="chat-input-action"
                    onClick={handleSendChatMessage}
                    disabled={isProcessing || !userInputText.trim()}
                    style={{ color: 'var(--blue-9)', background: 'transparent' }}
                  >
                    <IconSend />
                  </IconButton>
                </div>
              </div>
            </div>

            {/* ─── Right Panel ─── */}
            {showDocumentSplitPane && (
              <div className="right-panel" style={{ position: 'relative' }}>
                <div className="panel-header" padding="4">
                  <Flex align="center" gap="1">
                    <Bot size={14} color="var(--blue-9)" />
                    <Text size="1" weight="bold" color="gray">Workspace</Text>
                  </Flex>
                  <SegmentedControl.Root size="1" value={activeSegment} onValueChange={setActiveSegment}>
                    <SegmentedControl.Item value="doc">Doc</SegmentedControl.Item>
                    <SegmentedControl.Item value="task-flow">Tasks</SegmentedControl.Item>
                    <SegmentedControl.Item value="ui-builder">UI</SegmentedControl.Item>
                  </SegmentedControl.Root>
                </div>

                <div className="panel-content" style={{ padding: activeSegment === 'doc' ? '20px' : 0 }}>
                  {activeSegment === 'doc' && (
                    <Flex direction="column" style={{ width: '100%' }}>
                      <div className="doc-toolbar">
                        <Flex align="center" gap="1">
                          <IconButton size="1" variant="soft" color="gray" onClick={handleUndo} disabled={docVersionIndex <= 0} title="Undo" style={{ cursor: docVersionIndex > 0 ? 'pointer' : 'not-allowed' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                          </IconButton>
                          <IconButton size="1" variant="soft" color="gray" onClick={handleRedo} disabled={docVersionIndex >= docVersions.length - 1} title="Redo" style={{ cursor: docVersionIndex < docVersions.length - 1 ? 'pointer' : 'not-allowed' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
                          </IconButton>
                          <div style={{ width: 1, height: 14, background: 'var(--gray-5)', margin: '0 4px' }} />
                          <DropdownMenu.Root open={showVersionPanel} onOpenChange={setShowVersionPanel}>
                            <DropdownMenu.Trigger>
                              <Button size="1" variant="ghost" color="gray" style={{ cursor: 'pointer', fontSize: 11, fontWeight: 600, color: 'var(--gray-10)', padding: '0 8px' }}>
                                v{docVersionIndex + 1}/{docVersions.length}
                              </Button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content variant="classic" style={{ zIndex: 50, minWidth: 220, maxHeight: 300, overflowY: 'auto' }}>
                              {docVersions.map((v, i) => (
                                <DropdownMenu.Item key={i} onClick={() => handleJumpToVersion(i)} style={{ background: i === docVersionIndex ? 'var(--blue-3)' : undefined }}>
                                  <Flex direction="column" gap="1" style={{ width: '100%' }}>
                                    <Text size="1" weight={i === docVersionIndex ? 'bold' : 'normal'}>{v.label}</Text>
                                    <Text size="1" color="gray" style={{ fontSize: 10 }}>{v.timestamp.toLocaleTimeString()}</Text>
                                  </Flex>
                                </DropdownMenu.Item>
                              ))}
                              {docVersions.length === 0 && <DropdownMenu.Item disabled><Text size="1" color="gray">No versions yet</Text></DropdownMenu.Item>}
                            </DropdownMenu.Content>
                          </DropdownMenu.Root>
                          <div style={{ width: 1, height: 14, background: 'var(--gray-5)', margin: '0 4px' }} />
                          <div className="doc-view-tabs">
                            <button className={`doc-view-tab ${docViewMode === 'rendered' ? 'active' : ''}`} onClick={() => setDocViewMode('rendered')}>Preview</button>
                            <button className={`doc-view-tab ${docViewMode === 'diagrams' ? 'active' : ''}`} onClick={() => setDocViewMode('diagrams')}>Diagrams</button>
                          </div>
                        </Flex>
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger>
                            <Button size="1" variant="outline" color="gray" style={{ cursor: 'pointer', borderRadius: 6 }}>
                              <IconDownload /> Export
                            </Button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content variant="classic" style={{ zIndex: 50 }}>
                            <DropdownMenu.Item onClick={() => handleTriggerFileDownloadExport('md')}>Markdown (.md)</DropdownMenu.Item>
                            <DropdownMenu.Item onClick={() => handleTriggerFileDownloadExport('html')}>HTML (.html)</DropdownMenu.Item>
                            <DropdownMenu.Item onClick={() => handleTriggerFileDownloadExport('json')}>JSON (.json)</DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Root>
                      </div>

                      {/* ─── Doc View Body ─── */}
                      {documentPreviewBody ? (
                        <>
                          {docViewMode === 'rendered' && (
                            <div className="prd-preview">
                              <SectionAwareMarkdown content={documentPreviewBody} onExplain={handleOpenExplain} onEdit={handleOpenEdit} />
                            </div>
                          )}

                          {docViewMode === 'diagrams' && (
                            <div className="diagram-view">
                              {(() => {
                                const blocks = extractMermaidBlocks(documentPreviewBody)
                                if (blocks.length === 0) {
                                  return (
                                    <div className="empty-state">
                                      <Text size="2" color="gray" weight="medium" style={{ marginBottom: 4 }}>No diagrams found</Text>
                                      <Text size="1" color="gray">Mermaid code blocks (```mermaid) in your PRD will appear here as rendered diagrams.</Text>
                                    </div>
                                  )
                                }
                                return blocks.map((code, i) => (
                                  <DiagramCard key={i} code={code} index={i} />
                                ))
                              })()}
                            </div>
                          )}
                        </>
                      ) : isProcessing ? (
                        <div className="doc-processing-skeleton">
                          <div className="skel-line" /><div className="skel-line" /><div className="skel-line" /><div className="skel-line" />
                          <div className="skel-line" /><div className="skel-line" /><div className="skel-line" /><div className="skel-line" />
                        </div>
                      ) : (
                        <div className="empty-state">
                          <SkeletonLoader />
                        </div>
                      )}
                    </Flex>
                  )}

                  {activeSegment === 'task-flow' && (
                    <Box style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                      <AIWorkflowPage key={`taskflow-${taskFlowGenerated}-${Date.now()}`} />
                    </Box>
                  )}

                  {activeSegment === 'ui-builder' && (
                    <Box style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                      <UIBuilderPage
                        key={`uibuilder-${canvasRefreshKey}`}
                        externalPages={progressPages.length > 0 ? progressPages : undefined}
                        externalEdges={progressEdges.length > 0 ? progressEdges : undefined}
                        generationProgress={uiGenerationProgress}
                      />
                    </Box>
                  )}
                </div>
              </div>
            )}
          </Flex>
        </div>
      )}
      {sectionModal && (
        <SectionModal
          mode={sectionModal.mode}
          sectionText={sectionModal.sectionText}
          onClose={handleCloseModal}
          onSendToAgent={handleSectionAgentCall}
        />
      )}
    </div>
  )
}
