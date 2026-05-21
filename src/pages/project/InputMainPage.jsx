import { useEffect, useRef, useState } from 'react'
import {
  Box,
  Card,
  Avatar,
  Flex,
  Text,
  TextArea,
  TextField,
  IconButton,
  ScrollArea,
	  Select,
	  Button,
	  Spinner,
	  Badge,
	  Skeleton,
	  DropdownMenu,
	} from '@radix-ui/themes'

import {
  ArrowUpIcon,
  UploadIcon,
  LightningBoltIcon,
  FileTextIcon,
  CodeIcon,
  ChatBubbleIcon,
  ArchiveIcon,
  FileIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  PaperPlaneIcon,
  Cross2Icon,
} from '@radix-ui/react-icons'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import logo from '../../assets/logo.svg'
import ReactMarkdown from 'react-markdown'
import {
  getLatestLlmPrd,
  getLatestRequirementsSystemDesign,
  getSchemaFlow,
  getSequenceFlow,
  getArchitectureDiagram,
  getUsecaseFlow,
  getRequirementsSystemDesign,
  getLatestRequirementsStatus,
  getRequirementsStatus,
  chatRequirements,
  assistantProjectChat,
  exportLlmPrd,
	  getDocById,
		  startGenerationRun,
		  getGenerationRunStatus,
		  respondGenerationRunClarification,
		  getActiveGenerationRuns,
		  pauseGenerationRun,
		  resumeGenerationRun,
		  stopGenerationRun,
		} from '../../services/requirementsApi'
import { clearActivePrdRun, getActivePrdRun, setActivePrdRun } from '../../services/prdRunTracker'
import { clearActiveSddRun, setActiveSddRun } from '../../services/sddRunTracker'
import { clearActiveSchemaRun, getActiveSchemaRun, setActiveSchemaRun } from '../../services/schemaRunTracker'
import { motion } from 'framer-motion'

function toLabel(key) {
  return key
    .replaceAll('_', ' ')
    .replaceAll('.', ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

function FieldValue({ value }) {
  if (value === null || value === undefined || value === '') {
    return <Text size="2" color="gray">Not provided</Text>
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <Text size="2" color="gray">Not provided</Text>
    return (
      <Flex direction="column" gap="2" style={{ width: '100%', minWidth: 0 }}>
        {value.map((item, index) => (
          <Box
            key={`${String(item)}-${index}`}
            p="2"
            style={{
              border: '1px solid var(--gray-5)',
              borderRadius: 'var(--radius-2)',
              background: 'var(--color-panel-solid)',
              width: '100%',
              minWidth: 0,
            }}
          >
            <Text size="2" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
              {String(item)}
            </Text>
          </Box>
        ))}
      </Flex>
    )
  }

  if (typeof value === 'object') {
    return (
      <Flex direction="column" gap="2" style={{ width: '100%', minWidth: 0 }}>
        {Object.entries(value).map(([subKey, subValue]) => (
          <Box
            key={subKey}
            p="2"
            style={{
              border: '1px solid var(--gray-5)',
              borderRadius: 'var(--radius-2)',
              minWidth: 0,
              width: '100%',
            }}
          >
            <Text size="1" color="gray">{toLabel(subKey)}</Text>
            <Box mt="1">
              <FieldValue value={subValue} />
            </Box>
          </Box>
        ))}
      </Flex>
    )
  }

  return <Text size="2" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{String(value)}</Text>
}

export function InputMainPage() {
  const { orgId, projectId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [typedText, setTypedText] = useState('')
  const [phase, setPhase] = useState('draft') // draft | loading | questions | done
  const [intakeId, setIntakeId] = useState('')
  const [questions, setQuestions] = useState([])
  const [questionFields, setQuestionFields] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState('')
		  const [projectChatDraft, setProjectChatDraft] = useState('')
		  const [isSendingProjectChat, setIsSendingProjectChat] = useState(false)
	  const [pendingPrdClarification, setPendingPrdClarification] = useState(null)
		  const [exportingType, setExportingType] = useState('')
	  const [answers, setAnswers] = useState({})
  const [chatMessages, setChatMessages] = useState([])
  const [runMessages, setRunMessages] = useState([])
  const [previewPaneOpen, setPreviewPaneOpen] = useState(true)
  const [activePreviewKey, setActivePreviewKey] = useState('')
  const [structuredPartial, setStructuredPartial] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [isGeneratingPrd, setIsGeneratingPrd] = useState(false)
  const [prdRunId, setPrdRunId] = useState('')
  const [prdMessage, setPrdMessage] = useState('')
  const [prdContent, setPrdContent] = useState('')
  const [isLoadingFinalPrd, setIsLoadingFinalPrd] = useState(false)
  const [isGeneratingSdd, setIsGeneratingSdd] = useState(false)
  const [sddRunId, setSddRunId] = useState('')
  const [sddContent, setSddContent] = useState('')
  const [isGeneratingSchema, setIsGeneratingSchema] = useState(false)
  const [schemaRunId, setSchemaRunId] = useState('')
  const [schemaSummary, setSchemaSummary] = useState('')
  const [schemaMessage, setSchemaMessage] = useState('')
  const [isGeneratingUsecase, setIsGeneratingUsecase] = useState(false)
  const [usecaseRunId, setUsecaseRunId] = useState('')
  const [usecaseSummary, setUsecaseSummary] = useState('')
  const [isGeneratingSequence, setIsGeneratingSequence] = useState(false)
  const [sequenceRunId, setSequenceRunId] = useState('')
  const [sequenceSummary, setSequenceSummary] = useState('')
	  const [isGeneratingArchitecture, setIsGeneratingArchitecture] = useState(false)
	  const [architectureExists, setArchitectureExists] = useState(false)
	  const [activeGenerationRuns, setActiveGenerationRuns] = useState([])
	  const STATUS_POLL_INTERVAL_MS = 10_000

  const [docTree, setDocTree] = useState(() => [
    { id: 'root', type: 'folder', name: 'Workspace', children: [] },
  ])
  const [expandedNodes, setExpandedNodes] = useState(() => new Set(['root']))
  const [selectedDocNodeId, setSelectedDocNodeId] = useState('root')
  const [createDraft, setCreateDraft] = useState(null) // { type: 'folder'|'file', parentId: string, name: string }

  const textAreaRef = useRef(null)
  const chatEndRef = useRef(null)
  const runExplainSeenRef = useRef(new Set())

  const stageLabel = (value) => {
    return String(value || '')
      .replaceAll('_', ' ')
      .replaceAll('-', ' ')
      .trim()
      .replace(/\b\w/g, (m) => m.toUpperCase())
  }

  const runKindLabel = (value) => {
    const k = String(value || '').toLowerCase()
    if (k === 'prd') return 'PRD'
    if (k === 'sdd') return 'SDD'
    if (k === 'usecase') return 'Usecase'
    if (k === 'schema') return 'Schema'
    if (k === 'sequence') return 'Sequence'
    if (k === 'architecture') return 'Architecture'
    return stageLabel(k)
  }

  const formatRuntime = (seconds) => {
    const total = Math.max(0, Math.floor(Number(seconds) || 0))
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const s = total % 60
    if (h > 0) return `${h}h ${m}m ${s}s`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }

  const [runtimeNowMs, setRuntimeNowMs] = useState(() => Date.now())
  useEffect(() => {
    const items = Array.isArray(activeGenerationRuns) ? activeGenerationRuns : []
    if (items.length === 0) return undefined
    const id = window.setInterval(() => setRuntimeNowMs(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [activeGenerationRuns])

  const summarizeStageOutput = (stageOutput) => {
    if (!stageOutput) return ''
    if (typeof stageOutput === 'string') {
      const t = stageOutput.replace(/\s+/g, ' ').trim()
      return t.length > 160 ? `${t.slice(0, 160)}…` : t
    }
    if (typeof stageOutput === 'object') {
      const pick =
        stageOutput.executive_summary ||
        stageOutput.primary_objective ||
        stageOutput.success_meaning ||
        stageOutput.summary ||
        stageOutput.title
      if (typeof pick === 'string' && pick.trim()) {
        const t = pick.replace(/\s+/g, ' ').trim()
        return t.length > 160 ? `${t.slice(0, 160)}…` : t
      }
      try {
        const t = JSON.stringify(stageOutput)
        return t.length > 160 ? `${t.slice(0, 160)}…` : t
      } catch {
        return ''
      }
    }
    return ''
  }

  const appendRunMessage = (key, text, action, meta) => {
    if (!text) return
    const seen = runExplainSeenRef.current
    if (seen.has(key)) return
    seen.add(key)
    setRunMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        kind: 'run',
        text,
        created_at: new Date().toISOString(),
        field_key: null,
        action: action || null,
        meta: meta || null,
      },
    ])
  }

  const normalizeChatMessages = (items) => {
    const arr = Array.isArray(items) ? items : []
    // Some endpoints may return newest-first; render oldest-first for a natural chat flow.
    return arr
      .map((m, idx) => {
        const raw = m && typeof m === 'object' ? m.created_at : null
        const t = typeof raw === 'string' ? Date.parse(raw) : NaN
        return { m, idx, t: Number.isFinite(t) ? t : 0 }
      })
      .sort((a, b) => (a.t - b.t) || (a.idx - b.idx))
      .map((x) => x.m)
  }

  const ingestRunSteps = (runType, runId, steps) => {
    const arr = Array.isArray(steps) ? steps : []
    for (const step of arr) {
      const stage = String(step?.stage || '').trim()
      const status = String(step?.status || '').trim()
      if (!stage || !status) continue
      const key = `${runType}:${runId}:${stage}:${status}:${String(step?.ended_at || step?.completed_at || '')}`
      const label = stageLabel(stage)
      const summary = summarizeStageOutput(step?.stage_output)
      const meta = { run_kind: String(runType || '').toLowerCase(), run_id: runId, stage, status }
      if (status === 'running') appendRunMessage(key, `${runType}: ${label} started.`, null, meta)
      else if (status === 'completed') appendRunMessage(key, `${runType}: ${label} completed.${summary ? ` ${summary}` : ''}`, null, meta)
      else if (status === 'failed') appendRunMessage(key, `${runType}: ${label} failed.${step?.error ? ` ${String(step.error)}` : ''}`, null, meta)
      else if (status === 'stopped') appendRunMessage(key, `${runType}: ${label} stopped.${step?.error ? ` ${String(step.error)}` : ''}`, null, meta)
      else appendRunMessage(key, `${runType}: ${label} ${status}.`, null, meta)
    }
  }

  const autoResizeTextArea = () => {
    const el = textAreaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(140, el.scrollHeight)}px`
  }

  useEffect(() => {
    autoResizeTextArea()
  }, [typedText])

  useEffect(() => {
    // Keep chat pinned to the latest activity.
    try {
      chatEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
    } catch {
      // ignore
    }
  }, [phase, currentQuestionIndex, questions.length, submitError])

  useEffect(() => {
    const syncFromGlobalRun = () => {
      const activeRun = getActivePrdRun()
      if (
        activeRun?.runId &&
        activeRun?.orgId === orgId &&
        activeRun?.projectId === projectId &&
        (activeRun?.status === 'queued' || activeRun?.status === 'running' || activeRun?.status === 'paused')
      ) {
        setPrdRunId(activeRun.runId)
        setIsGeneratingPrd(true)
        if (!prdMessage) {
          setPrdMessage(`Resuming PRD run: ${activeRun.runId}`)
        }
      }
    }

    syncFromGlobalRun()
    window.addEventListener('dv:prd-run-updated', syncFromGlobalRun)
    return () => window.removeEventListener('dv:prd-run-updated', syncFromGlobalRun)
  }, [orgId, projectId, prdMessage])

  useEffect(() => {
    const syncSchemaRun = () => {
      const activeRun = getActiveSchemaRun()
      if (
        activeRun?.runId &&
        activeRun?.orgId === orgId &&
        activeRun?.projectId === projectId &&
        (activeRun?.status === 'queued' || activeRun?.status === 'running')
      ) {
        setSchemaRunId(activeRun.runId)
        setIsGeneratingSchema(true)
        if (!schemaMessage) {
          setSchemaMessage(`Resuming schema run: ${activeRun.runId}`)
        }
      }
    }
    syncSchemaRun()
    window.addEventListener('dv:schema-run-updated', syncSchemaRun)
    return () => window.removeEventListener('dv:schema-run-updated', syncSchemaRun)
  }, [orgId, projectId, schemaMessage])

  useEffect(() => {
    // On reload, recover any in-flight runs for this project across services.
    if (!orgId || !projectId) return undefined
    let stopped = false
    let timer = null
    const sync = async () => {
      if (stopped) return
      try {
        const resp = await getActiveGenerationRuns(orgId, projectId)
        if (stopped) return
        const items = Array.isArray(resp?.items) ? resp.items : []
        // Enrich with backend timing.total_elapsed_seconds so the UI matches server truth.
        const enriched = await Promise.allSettled(
          items.map(async (it) => {
            const runId = String(it?.run_id || '').trim()
            if (!runId) return it
            try {
              const status = await getGenerationRunStatus(orgId, projectId, runId)
              const total = status?.timing?.total_elapsed_seconds
              const totalElapsedSeconds =
                total === null || total === undefined || Number.isNaN(Number(total)) ? null : Number(total)
              return { ...it, total_elapsed_seconds: totalElapsedSeconds, started_at: status?.started_at || it?.started_at }
            } catch {
              return it
            }
          }),
        )
        const finalItems = enriched.map((r, idx) => (r.status === 'fulfilled' ? r.value : items[idx]))
        setActiveGenerationRuns(finalItems)
        const latestByKind = new Map()
        for (const it of finalItems) {
          const kind = String(it?.kind || '').toLowerCase()
          if (!kind) continue
          if (!latestByKind.has(kind)) latestByKind.set(kind, it)
        }
        const prd = latestByKind.get('prd')
        if (prd?.run_id) {
          setPrdRunId((prev) => (String(prev || '').trim() ? prev : String(prd.run_id)))
          setIsGeneratingPrd(true)
        }
        const sdd = latestByKind.get('sdd')
        if (sdd?.run_id) {
          setSddRunId((prev) => (String(prev || '').trim() ? prev : String(sdd.run_id)))
          setIsGeneratingSdd(true)
        }
        const schema = latestByKind.get('schema')
        if (schema?.run_id) {
          setSchemaRunId((prev) => (String(prev || '').trim() ? prev : String(schema.run_id)))
          setIsGeneratingSchema(true)
        }
        const usecase = latestByKind.get('usecase')
        if (usecase?.run_id) {
          setUsecaseRunId((prev) => (String(prev || '').trim() ? prev : String(usecase.run_id)))
          setIsGeneratingUsecase(true)
        }
        const sequence = latestByKind.get('sequence')
        if (sequence?.run_id) {
          setSequenceRunId((prev) => (String(prev || '').trim() ? prev : String(sequence.run_id)))
          setIsGeneratingSequence(true)
        }
      } catch {
        // ignore
      }
      timer = window.setTimeout(sync, STATUS_POLL_INTERVAL_MS)
    }
    sync()
    return () => {
      stopped = true
      if (timer) window.clearTimeout(timer)
    }
  }, [orgId, projectId])

	  useEffect(() => {
	    if (!isGeneratingPrd || !prdRunId || !orgId || !projectId) return undefined
	    let stopped = false
	    let timer = null
	    const poll = async () => {
	      if (stopped) return
	      try {
	        const run = await getGenerationRunStatus(orgId, projectId, prdRunId)
	        if (stopped) return
	        ingestRunSteps('PRD', prdRunId, run?.steps)
	        const partial = run?.partial_result?.prd_markdown
	        if (typeof partial === 'string' && partial.trim()) {
	          // Always keep the live preview in sync with the latest partial markdown.
	          // Previous logic only set the first partial update, which made the UI look "stuck" on an older version.
	          setPrdContent((prev) => (prev === partial ? prev : partial))
	        }
			        if (run?.status === 'clarification_required') {
			          setPendingPrdClarification(run?.clarification || { pending: true })
			          try {
			            if (intakeId) {
			              const status = await getRequirementsStatus(orgId, projectId, intakeId)
			              if (!stopped && Array.isArray(status?.chat_messages)) setChatMessages(normalizeChatMessages(status.chat_messages))
		            }
		          } catch {
		            // ignore
		          }
		          timer = window.setTimeout(poll, STATUS_POLL_INTERVAL_MS)
		          return
		        }
	        if (run?.status === 'completed') {
          const notif = String(run?.result?.notification || '').trim()
          const docId = String(run?.result?.doc?.doc_id || '').trim()
	          if (docId) {
	            appendRunMessage(
	              `PRD:${prdRunId}:completed`,
	              notif || 'Document is ready. Click "View doc" to preview.',
	              { type: 'open_doc', kind: 'prd', docId },
	            )
          } else if (notif) {
            appendRunMessage(`PRD:${prdRunId}:completed_text`, notif)
          }
	          // Pull updated assistant messages (completion + generation log) from intake chat_messages.
	          try {
	            if (intakeId) {
	              const status = await getRequirementsStatus(orgId, projectId, intakeId)
	              if (!stopped && Array.isArray(status?.chat_messages)) {
	                setChatMessages(normalizeChatMessages(status.chat_messages))
	              }
	            }
	          } catch {
	            // ignore
	          }

	          setIsGeneratingPrd(false)
	          setPendingPrdClarification(null)
	          clearActivePrdRun()
          setIsLoadingFinalPrd(true)
          setPrdContent('')
          setPrdMessage('PRD generation completed.')
          try {
            if (docId) {
              const doc = await getDocById(orgId, projectId, 'prd', docId)
              if (!stopped && doc?.content) setPrdContent(String(doc.content))
            }
          } finally {
            if (!stopped) setIsLoadingFinalPrd(false)
          }
          const params = new URLSearchParams(searchParams)
          params.delete('prd_run_id')
          navigate(`?${params.toString()}`, { replace: true })
          return
        }
        if (run?.status === 'failed') {
          appendRunMessage(`PRD:${prdRunId}:failed`, `PRD: Generation failed.${run?.error ? ` ${String(run.error)}` : ''}`)
          setIsGeneratingPrd(false)
          clearActivePrdRun()
          setPrdMessage(run?.error || 'PRD generation failed')
          const params = new URLSearchParams(searchParams)
          params.delete('prd_run_id')
          navigate(`?${params.toString()}`, { replace: true })
          return
        }
        if (run?.status === 'stopped') {
          appendRunMessage(`PRD:${prdRunId}:stopped`, `PRD: Run stopped.${run?.error ? ` ${String(run.error)}` : ''}`)
          setIsGeneratingPrd(false)
          clearActivePrdRun()
          setPrdMessage(run?.error || 'PRD run stopped')
          const params = new URLSearchParams(searchParams)
          params.delete('prd_run_id')
          navigate(`?${params.toString()}`, { replace: true })
          return
        }
	      } catch (error) {
	        if (stopped) return
	        setIsGeneratingPrd(false)
	        clearActivePrdRun()
	        setPrdMessage(error instanceof Error ? error.message : 'Failed to poll PRD run status')
	        return
	      }
		      timer = window.setTimeout(poll, STATUS_POLL_INTERVAL_MS)
	    }
	    poll()
		    return () => {
		      stopped = true
		      if (timer) window.clearTimeout(timer)
		    }
		  }, [isGeneratingPrd, prdRunId, orgId, projectId])

	  useEffect(() => {
	    if (!isGeneratingSdd || !sddRunId || !orgId || !projectId || !intakeId) return undefined
	    let stopped = false
	    let timer = null
	    const poll = async () => {
	      if (stopped) return
	      try {
	        const run = await getGenerationRunStatus(orgId, projectId, sddRunId)
	        if (stopped) return
	        ingestRunSteps('SDD', sddRunId, run?.steps)
        const status = run?.status || ''
        if (status === 'completed') {
          const docId = String(run?.result?.doc_id || '').trim()
          appendRunMessage(
            `SDD:${sddRunId}:completed`,
            'SDD is ready. Click "View doc" to preview.',
            docId ? { type: 'open_doc', kind: 'sdd', docId } : null,
          )
          setIsGeneratingSdd(false)
          try {
            if (docId) {
              const doc = await getDocById(orgId, projectId, 'sdd', docId)
              if (!stopped) setSddContent(String(doc?.content || ''))
            }
          } catch {
            // ignore
          }
          clearActiveSddRun()
          return
        }
        if (status === 'failed') {
          appendRunMessage(`SDD:${sddRunId}:failed`, `SDD: Generation failed.${run?.error ? ` ${String(run.error)}` : ''}`)
          setIsGeneratingSdd(false)
          clearActiveSddRun()
          return
        }
        if (status === 'stopped') {
          appendRunMessage(`SDD:${sddRunId}:stopped`, `SDD: Run stopped.${run?.error ? ` ${String(run.error)}` : ''}`)
          setIsGeneratingSdd(false)
          clearActiveSddRun()
          return
        }
	      } catch (error) {
	        if (stopped) return
	        setIsGeneratingSdd(false)
	      }
	      timer = window.setTimeout(poll, STATUS_POLL_INTERVAL_MS)
	    }
	    poll()
	    return () => {
	      stopped = true
	      if (timer) window.clearTimeout(timer)
	    }
	  }, [isGeneratingSdd, sddRunId, orgId, projectId, intakeId])

	  useEffect(() => {
	    if (!isGeneratingSchema || !schemaRunId || !orgId || !projectId || !intakeId) return undefined
	    let stopped = false
	    let timer = null
	    const poll = async () => {
	      if (stopped) return
	      try {
	        const run = await getGenerationRunStatus(orgId, projectId, schemaRunId)
	        if (stopped) return
	        ingestRunSteps('Schema', schemaRunId, run?.steps)
        const status = run?.status || ''
        if (status === 'completed') {
          setIsGeneratingSchema(false)
          setSchemaMessage('Schema plan generated.')
          const existing = getActiveSchemaRun()
          setActiveSchemaRun({
            orgId,
            projectId,
            intakeId,
            runId: schemaRunId,
            startedAt: Number(existing?.startedAt) || Date.now(),
            status: 'completed',
            message: 'Schema plan generated.',
          })
          window.setTimeout(() => clearActiveSchemaRun(), 5000)
          try {
            const docId = String(run?.result?.doc_id || '').trim()
            if (docId) {
              const doc = await getDocById(orgId, projectId, 'schema', docId)
              if (!stopped) setSchemaSummary(String(doc?.content || ''))
            }
          } catch {
            // ignore summary load failure
          }
          return
        }
        if (status === 'failed') {
          setIsGeneratingSchema(false)
          setSchemaMessage(run?.error || 'Schema generation failed')
          const existing = getActiveSchemaRun()
          setActiveSchemaRun({
            orgId,
            projectId,
            intakeId,
            runId: schemaRunId,
            startedAt: Number(existing?.startedAt) || Date.now(),
            status: 'failed',
            message: run?.error || 'Schema generation failed',
          })
          return
        }
        if (status === 'stopped') {
          setIsGeneratingSchema(false)
          setSchemaMessage(run?.error || 'Schema generation stopped')
          const existing = getActiveSchemaRun()
          setActiveSchemaRun({
            orgId,
            projectId,
            intakeId,
            runId: schemaRunId,
            startedAt: Number(existing?.startedAt) || Date.now(),
            status: 'stopped',
            message: run?.error || 'Schema generation stopped',
          })
          return
        }
	      } catch (error) {
	        if (stopped) return
	        setIsGeneratingSchema(false)
	        setSchemaMessage(error instanceof Error ? error.message : 'Failed to poll schema run status')
	      }
	      timer = window.setTimeout(poll, STATUS_POLL_INTERVAL_MS)
	    }
	    poll()
	    return () => {
	      stopped = true
	      if (timer) window.clearTimeout(timer)
	    }
	  }, [isGeneratingSchema, schemaRunId, orgId, projectId, intakeId])

	  useEffect(() => {
	    if (!isGeneratingUsecase || !usecaseRunId || !orgId || !projectId || !intakeId) return undefined
	    let stopped = false
	    let timer = null
	    const poll = async () => {
	      if (stopped) return
	      try {
	        const run = await getGenerationRunStatus(orgId, projectId, usecaseRunId)
	        if (stopped) return
	        ingestRunSteps('Usecase', usecaseRunId, run?.steps)
        const status = run?.status || ''
        if (status === 'completed') {
          setIsGeneratingUsecase(false)
          try {
            const docId = String(run?.result?.doc_id || '').trim()
            if (docId) {
              const doc = await getDocById(orgId, projectId, 'usecase', docId)
              if (!stopped) setUsecaseSummary(String(doc?.content || ''))
            }
          } catch {
            // ignore summary load failure
          }
          return
        }
        if (status === 'failed') {
          setIsGeneratingUsecase(false)
          return
        }
        if (status === 'stopped') {
          setIsGeneratingUsecase(false)
          return
        }
	      } catch (error) {
	        if (stopped) return
	        setIsGeneratingUsecase(false)
	      }
	      timer = window.setTimeout(poll, STATUS_POLL_INTERVAL_MS)
	    }
	    poll()
	    return () => {
	      stopped = true
	      if (timer) window.clearTimeout(timer)
	    }
	  }, [isGeneratingUsecase, usecaseRunId, orgId, projectId, intakeId])

	  useEffect(() => {
	    if (!isGeneratingSequence || !sequenceRunId || !orgId || !projectId || !intakeId) return undefined
	    let stopped = false
	    let timer = null
	    const poll = async () => {
	      if (stopped) return
	      try {
	        const run = await getGenerationRunStatus(orgId, projectId, sequenceRunId)
	        if (stopped) return
	        ingestRunSteps('Sequence', sequenceRunId, run?.steps)
        const status = run?.status || ''
        if (status === 'completed') {
          setIsGeneratingSequence(false)
          try {
            const docId = String(run?.result?.doc_id || '').trim()
            if (docId) {
              const doc = await getDocById(orgId, projectId, 'sequence', docId)
              if (!stopped) setSequenceSummary(String(doc?.content || ''))
            }
          } catch {
            // ignore summary load failure
          }
          return
        }
        if (status === 'failed') {
          setIsGeneratingSequence(false)
          return
        }
        if (status === 'stopped') {
          setIsGeneratingSequence(false)
          return
        }
	      } catch (error) {
	        if (stopped) return
	        setIsGeneratingSequence(false)
	      }
	      timer = window.setTimeout(poll, STATUS_POLL_INTERVAL_MS)
	    }
	    poll()
	    return () => {
	      stopped = true
	      if (timer) window.clearTimeout(timer)
	    }
	  }, [isGeneratingSequence, sequenceRunId, orgId, projectId, intakeId])

  useEffect(() => {
    let mounted = true
    const applyStatusToUI = (data, currentIntakeId) => {
      setIntakeId(currentIntakeId)
      setStructuredPartial(data?.structured_partial || null)
      const nextQuestions = data?.questions || []
      const missing = data?.missing_fields || []
      const lowQuality = data?.low_quality_fields || []
      setQuestions(nextQuestions)
      if (Array.isArray(data?.question_fields) && data.question_fields.length) {
        setQuestionFields(data.question_fields)
      } else {
        setQuestionFields([...missing, ...lowQuality])
      }
      setCurrentQuestionIndex(0)
      if (data?.answers && typeof data.answers === 'object') {
        setAnswers(data.answers)
      }
      if (Array.isArray(data?.chat_messages)) {
        setChatMessages(normalizeChatMessages(data.chat_messages))
      }

      const rawText = data?.raw_text
      if (typeof rawText === 'string' && rawText.trim()) {
        setTypedText((prev) => (String(prev || '').trim() ? prev : rawText))
      }

      const problemStatement = data?.structured_partial?.problem_statement
      if (typeof problemStatement === 'string' && problemStatement.trim()) {
        // Preserve user's original typed text; use structured problem statement only when empty.
        setTypedText((prev) => (String(prev || '').trim() ? prev : problemStatement))
      }

      if (data?.ready_for_prd) {
        setPhase('done')
      } else if (nextQuestions.length > 0) {
        setPhase('questions')
      } else {
        setPhase('done')
      }
    }

    async function loadStatus() {
      if (!orgId || !projectId) return
      const intakeIdParam = searchParams.get('intake_id')
      const runIdParam = searchParams.get('prd_run_id')
      const activeRun = getActivePrdRun()
      try {
        const loadPersistedDocs = async (activeIntakeId) => {
          setArchitectureExists(false)
          let loadedLlmPrd = false
          try {
            const latestLlmPrd = await getLatestLlmPrd(orgId, projectId)
            if (mounted && latestLlmPrd?.content) {
              setPrdContent(latestLlmPrd.content)
              loadedLlmPrd = true
            }
	        } catch {
	          // fallback to requirements PRD
	        }
	        void loadedLlmPrd
	        try {
	          const latestSdd = await getLatestRequirementsSystemDesign(orgId, projectId)
	          if (mounted && latestSdd?.content) {
	            setSddContent(latestSdd.content)
            }
          } catch {
            try {
              const sdd = await getRequirementsSystemDesign(orgId, projectId, activeIntakeId)
              if (mounted && sdd?.content) {
                setSddContent(sdd.content)
              }
            } catch {
              // ignore missing SDD
            }
          }
          try {
            const schema = await getSchemaFlow(orgId, projectId, activeIntakeId)
            if (mounted && schema?.exists) {
              setSchemaSummary(String(schema?.summary || ''))
              setSchemaMessage('Schema plan generated.')
            }
          } catch {
            // ignore missing schema plan
          }
          try {
            const usecase = await getUsecaseFlow(orgId, projectId, activeIntakeId)
            if (mounted && usecase?.exists) {
              setUsecaseSummary(String(usecase?.summary || ''))
            }
          } catch {
            // ignore missing use case diagram
          }
          try {
            const sequence = await getSequenceFlow(orgId, projectId, activeIntakeId)
            if (mounted && sequence?.exists) {
              setSequenceSummary(String(sequence?.summary || ''))
            }
          } catch {
            // ignore missing sequence diagram
          }
          try {
            const architecture = await getArchitectureDiagram(orgId, projectId, activeIntakeId)
            if (mounted && architecture?.exists) {
              setArchitectureExists(true)
            }
          } catch {
            // ignore missing architecture diagram
          }
        }

        if (intakeIdParam) {
          const data = await getRequirementsStatus(orgId, projectId, intakeIdParam)
          if (!mounted) return
          applyStatusToUI(data, intakeIdParam)
          await loadPersistedDocs(intakeIdParam)
          return
        }

        const latest = await getLatestRequirementsStatus(orgId, projectId)
        if (!mounted) return
        if (latest?.intake_id) {
          navigate(`?intake_id=${encodeURIComponent(latest.intake_id)}`, { replace: true })
          applyStatusToUI(latest, latest.intake_id)
          await loadPersistedDocs(latest.intake_id)
        }
        if (runIdParam) {
          setPrdContent('')
          setPrdRunId(runIdParam)
          setIsGeneratingPrd(true)
          setActivePrdRun({
            runId: runIdParam,
            orgId,
            projectId,
            status: 'running',
          })
          setPrdMessage(`Resuming PRD run: ${runIdParam}`)
          return
        }

        if (
          activeRun?.runId &&
          activeRun?.orgId === orgId &&
          activeRun?.projectId === projectId &&
          (activeRun?.status === 'queued' || activeRun?.status === 'running' || activeRun?.status === 'paused')
        ) {
          setPrdContent('')
          setPrdRunId(activeRun.runId)
          setIsGeneratingPrd(true)
          setPrdMessage(`Resuming PRD run: ${activeRun.runId}`)
        }
      } catch {
        try {
          const latestLlmPrd = await getLatestLlmPrd(orgId, projectId)
          if (!mounted || !latestLlmPrd?.content) return
          setPhase('done')
          setPrdContent(latestLlmPrd.content)
        } catch {
          // ignore
        }
      }
    }
    loadStatus()
    return () => {
      mounted = false
    }
  }, [orgId, projectId, searchParams])

  const handleSubmit = async () => {
    if (!orgId || !projectId || !typedText.trim()) return
    setSubmitError('')
    setPhase('loading')
    setQuestions([])
    setQuestionFields([])
    setCurrentQuestionIndex(0)
    setAnswers({})
    setCurrentAnswer('')

    try {
      const result = await chatRequirements(orgId, projectId, { message: typedText })
      setIntakeId(result.intake_id)
      setStructuredPartial(result.structured_partial || null)
      navigate(`?intake_id=${encodeURIComponent(result.intake_id)}`, { replace: true })
      const missing = result.missing_fields || []
      const lowQuality = result.low_quality_fields || []
      const combinedFields =
        Array.isArray(result.question_fields) && result.question_fields.length
          ? result.question_fields
          : [...missing, ...lowQuality]
      const nextQuestions = result.questions || []
      setQuestions(nextQuestions)
      setQuestionFields(combinedFields)
      setAnswers(result.answers && typeof result.answers === 'object' ? result.answers : {})
      setChatMessages(Array.isArray(result.chat_messages) ? normalizeChatMessages(result.chat_messages) : [])
      if (nextQuestions.length === 0) {
        setPhase('done')
      } else {
        setPhase('questions')
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to start requirements flow')
      setPhase('draft')
    }
  }

  const handleAnswer = async () => {
    const answerText = currentAnswer.trim()
    if (!answerText) return

    if (!orgId || !projectId || !intakeId) return

    const fieldKey = questionFields[currentQuestionIndex] || `answer_${currentQuestionIndex}`
    setCurrentAnswer('')
    setPhase('loading')
    setSubmitError('')
    try {
      const result = await chatRequirements(orgId, projectId, { intake_id: intakeId, field_key: fieldKey, message: answerText })
      setStructuredPartial(result.structured_partial || null)
      const missing = result.missing_fields || []
      const lowQuality = result.low_quality_fields || []
      const combinedFields =
        Array.isArray(result.question_fields) && result.question_fields.length
          ? result.question_fields
          : [...missing, ...lowQuality]
      const nextQuestions = result.questions || []
      setChatMessages(Array.isArray(result.chat_messages) ? normalizeChatMessages(result.chat_messages) : [])
      if (result.answers && typeof result.answers === 'object') {
        setAnswers(result.answers)
      } else {
        setAnswers((prev) => ({ ...prev, [fieldKey]: answerText }))
      }

      if (result.ready_for_prd || nextQuestions.length === 0) {
        setPhase('done')
      } else {
        setCurrentQuestionIndex(0)
        setQuestions(nextQuestions)
        setQuestionFields(combinedFields)
        setPhase('questions')
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit answers')
      setPhase('questions')
    }
  }

	  const handleProjectChatSend = async () => {
	    if (!orgId || !projectId || !intakeId) return
	    const msg = String(projectChatDraft || '').trim()
	    if (!msg) return
	    setProjectChatDraft('')
	    setIsSendingProjectChat(true)
	    const optimisticAt = new Date().toISOString()

	    // If a PRD run is paused for clarification, treat the next chat message as the clarification answer.
	    if (pendingPrdClarification && prdRunId) {
	      setChatMessages((prev) => [
	        ...(Array.isArray(prev) ? prev : []),
	        { role: 'user', kind: 'answer', text: msg, field_key: null, created_at: optimisticAt },
	      ])
	      try {
	        const resp = await respondGenerationRunClarification(orgId, projectId, prdRunId, { message: msg })
	        if (Array.isArray(resp?.chat_messages)) {
	          setChatMessages(normalizeChatMessages(resp.chat_messages))
	        } else {
	          const status = await getRequirementsStatus(orgId, projectId, intakeId)
	          if (Array.isArray(status?.chat_messages)) setChatMessages(normalizeChatMessages(status.chat_messages))
	        }
	        setPendingPrdClarification(null)
	      } catch (error) {
	        const message = error instanceof Error ? error.message : 'Failed to submit clarification'
	        setChatMessages((prev) => [
	          ...(Array.isArray(prev) ? prev : []),
	          { role: 'assistant', kind: 'status', text: `Error: ${message}`, field_key: null, created_at: optimisticAt },
	        ])
	      } finally {
	        setIsSendingProjectChat(false)
	      }
	      return
	    }

	    setChatMessages((prev) => [
	      ...(Array.isArray(prev) ? prev : []),
	      { role: 'user', kind: 'chat', text: msg, field_key: null, created_at: optimisticAt },
	    ])
    try {
      const result = await assistantProjectChat(orgId, projectId, intakeId, msg)
      if (Array.isArray(result?.chat_messages)) {
        setChatMessages(normalizeChatMessages(result.chat_messages))
      } else if (typeof result?.message === 'string') {
        setChatMessages((prev) => [
          ...(Array.isArray(prev) ? prev : []),
          { role: 'assistant', kind: 'chat', text: result.message, field_key: null, created_at: optimisticAt },
        ])
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message'
      setChatMessages((prev) => [
        ...(Array.isArray(prev) ? prev : []),
        { role: 'assistant', kind: 'status', text: `Error: ${message}`, field_key: null, created_at: optimisticAt },
      ])
    } finally {
      setIsSendingProjectChat(false)
      window.setTimeout(() => {
        try {
          chatEndRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
        } catch {
          // ignore
        }
      }, 50)
    }
  }

  const handleGeneratePrd = async () => {
    if (!orgId || !projectId || !intakeId) return
    setActivePreviewKey('prd')
    setPreviewPaneOpen(true)
    appendRunMessage(`PRD:${intakeId}:start`, 'PRD: Starting generation. I will post step-by-step progress here.')
    setPrdMessage('')
    setIsGeneratingPrd(true)
    setIsLoadingFinalPrd(false)
    setPrdContent('')
    setPrdRunId('')
    try {
      const title = (structuredPartial?.project_name || typedText?.slice(0, 80) || 'Untitled Project').trim()
      const problemStatement = (structuredPartial?.problem_statement || typedText || '').trim()
      const targetUsers = Array.isArray(structuredPartial?.target_users)
        ? structuredPartial.target_users.join(', ')
        : ''
      const features = Array.isArray(structuredPartial?.desired_features)
        ? structuredPartial.desired_features.filter(Boolean)
        : []

      const run = await startGenerationRun(orgId, projectId, {
        kind: 'prd',
        intake_id: intakeId,
        payload: {
          title,
          problem_statement: problemStatement,
          target_users: targetUsers,
          features,
          // Do not generate/save the legacy requirements PRD here.
          // That content is an input artifact and was being stored as PRD version 1.
          additional_notes: '',
        },
      })
      if (run?.status === 'clarification_required') {
        setIsGeneratingPrd(false)
        setPrdRunId('')
       
        setPrdMessage('PRD clarification is required before run start.')
        return
      }
      if (!run?.run_id) throw new Error('Failed to start PRD run')
      appendRunMessage(`PRD:${run.run_id}:queued`, `PRD: Run queued (run_id=${run.run_id}).`)
      setPrdRunId(run.run_id)
      setActivePrdRun({
        runId: run.run_id,
        orgId,
        projectId,
        status: run.status || 'queued',
      })
      setPrdMessage(`PRD run started: ${run.run_id}`)
      const params = new URLSearchParams(searchParams)
      if (intakeId) params.set('intake_id', intakeId)
      params.set('prd_run_id', run.run_id)
      navigate(`?${params.toString()}`, { replace: true })
    } catch (error) {
      setPrdContent('')
      setPrdMessage(error instanceof Error ? error.message : 'Failed to generate PRD')
      setIsGeneratingPrd(false)
      clearActivePrdRun()
      appendRunMessage(
        `PRD:${intakeId}:start_failed`,
        `PRD: Failed to start.${error instanceof Error ? ` ${error.message}` : ''}`,
      )
    }
  }



  const handleGenerateSdd = async () => {
    if (!orgId || !projectId || !intakeId) return
    const startedAt = Date.now()
    setActivePreviewKey('sdd')
    setPreviewPaneOpen(true)
    appendRunMessage(`SDD:${intakeId}:start`, 'SDD: Starting generation. I will post step-by-step progress here.')
    setActiveSddRun({ orgId, projectId, intakeId, startedAt, status: 'running', runId: '' })
    setIsGeneratingSdd(true)
    try {
      const run = await startGenerationRun(orgId, projectId, { kind: 'sdd', intake_id: intakeId, payload: {} })
      if (!run?.run_id) {
        throw new Error('Failed to start SDD run')
      }
      appendRunMessage(`SDD:${run.run_id}:queued`, `SDD: Run queued (run_id=${run.run_id}).`)
      setSddRunId(run.run_id)
      setActiveSddRun({ orgId, projectId, intakeId, startedAt, status: run.status || 'queued', runId: run.run_id })
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Failed to generate System Design Document'
      const stopped = String(errMsg).toLowerCase().includes('stopped')
      setIsGeneratingSdd(false)
      setActiveSddRun({
        orgId,
        projectId,
        intakeId,
        startedAt,
        status: stopped ? 'stopped' : 'failed',
        runId: '',
        message: errMsg,
      })
      appendRunMessage(`SDD:${intakeId}:start_failed`, `SDD: ${errMsg}`)
    }
  }

	  const handleGenerateSchemaPlan = async () => {
	    if (!orgId || !projectId || !intakeId) return
	    setActivePreviewKey('schema')
	    setPreviewPaneOpen(true)
	    setSchemaMessage('')
	    setSchemaSummary('')
	    setIsGeneratingSchema(true)
	    try {
	      const run = await startGenerationRun(orgId, projectId, { kind: 'schema', intake_id: intakeId, payload: {} })
	      if (!run?.run_id) throw new Error('Failed to start schema run')
	      setSchemaRunId(run.run_id)
	      setActiveSchemaRun({
	        orgId,
        projectId,
        intakeId,
        startedAt: Date.now(),
        status: run.status || 'queued',
        runId: run.run_id,
      })
	      appendRunMessage(`SCHEMA:${run.run_id}:queued`, `Schema: Run queued (run_id=${run.run_id}).`)
	    } catch (error) {
	      setIsGeneratingSchema(false)
	      setSchemaMessage(error instanceof Error ? error.message : 'Schema generation failed')
	    }
	  }

	  const handleGenerateUsecaseDiagram = async () => {
	    if (!orgId || !projectId || !intakeId) return
	    setActivePreviewKey('usecase')
	    setPreviewPaneOpen(true)
	    setUsecaseSummary('')
	    setIsGeneratingUsecase(true)
	    try {
	      const run = await startGenerationRun(orgId, projectId, { kind: 'usecase', intake_id: intakeId, payload: {} })
	      if (!run?.run_id) throw new Error('Failed to start usecase run')
	      setUsecaseRunId(run.run_id)
	      appendRunMessage(`USECASE:${run.run_id}:queued`, `Usecase: Run queued (run_id=${run.run_id}).`)
	    } catch (error) {
      setIsGeneratingUsecase(false)
      appendRunMessage('USECASE:start_failed', `Usecase: ${error instanceof Error ? error.message : 'Failed to start'}`)
    }
  }

	  const handleGenerateSequenceDiagram = async () => {
	    if (!orgId || !projectId || !intakeId) return
	    setActivePreviewKey('sequence')
	    setPreviewPaneOpen(true)
	    setSequenceSummary('')
	    setIsGeneratingSequence(true)
	    try {
	      const run = await startGenerationRun(orgId, projectId, { kind: 'sequence', intake_id: intakeId, payload: {} })
	      if (!run?.run_id) throw new Error('Failed to start sequence run')
	      setSequenceRunId(run.run_id)
	      appendRunMessage(`SEQUENCE:${run.run_id}:queued`, `Sequence: Run queued (run_id=${run.run_id}).`)
	    } catch (error) {
      setIsGeneratingSequence(false)
      appendRunMessage('SEQUENCE:start_failed', `Sequence: ${error instanceof Error ? error.message : 'Failed to start'}`)
    }
  }

		  const handleGenerateArchitectureDiagram = async () => {
	    if (!orgId || !projectId || !intakeId) return
	    setActivePreviewKey('architecture')
	    setPreviewPaneOpen(true)
	    setIsGeneratingArchitecture(true)
	    try {
	      const run = await startGenerationRun(orgId, projectId, { kind: 'architecture', intake_id: intakeId, payload: {} })
	      if (run?.run_id) {
	        // Architecture is currently synchronous on the backend; fetch status once to attach doc_id for /api/docs access.
	        const status = await getGenerationRunStatus(orgId, projectId, run.run_id)
	        const docId = String(status?.result?.doc_id || '').trim()
	        if (docId) {
	          setArchitectureExists(true)
	          appendRunMessage(
	            `ARCH:${run.run_id}:completed`,
	            'Architecture diagram is ready. Click "View doc" to preview.',
	            { type: 'open_doc', kind: 'architecture', docId },
	          )
	        }
	      }
	    } catch (error) {
	      appendRunMessage('ARCH:failed', `Architecture: ${error instanceof Error ? error.message : 'Generation failed'}`)
	    } finally {
	      setIsGeneratingArchitecture(false)
	    }
		  }

  const pauseRunById = async (kind, runId) => {
    if (!orgId || !projectId || !runId) return
    const k = String(kind || '').toLowerCase()
    try {
      await pauseGenerationRun(orgId, projectId, runId)
      setActiveGenerationRuns((prev) => (Array.isArray(prev) ? prev.map((r) => (r?.run_id === runId ? { ...r, status: 'paused' } : r)) : prev))
      appendRunMessage(`GEN:${k}:${runId}:paused`, `${k.toUpperCase()}: Paused (run_id=${runId}).`)
    } catch (e) {
      appendRunMessage(`GEN:${k}:${runId}:pause_failed`, `${k.toUpperCase()}: Pause failed.${e instanceof Error ? ` ${e.message}` : ''}`)
    }
  }

  const resumeRunById = async (kind, runId) => {
    if (!orgId || !projectId || !runId) return
    const k = String(kind || '').toLowerCase()
    try {
      await resumeGenerationRun(orgId, projectId, runId)
      setActiveGenerationRuns((prev) => (Array.isArray(prev) ? prev.map((r) => (r?.run_id === runId ? { ...r, status: 'running' } : r)) : prev))
      appendRunMessage(`GEN:${k}:${runId}:resumed`, `${k.toUpperCase()}: Resumed (run_id=${runId}).`)
    } catch (e) {
      appendRunMessage(`GEN:${k}:${runId}:resume_failed`, `${k.toUpperCase()}: Resume failed.${e instanceof Error ? ` ${e.message}` : ''}`)
    }
  }

  const stopRunById = async (kind, runId) => {
    if (!orgId || !projectId || !runId) return
    const k = String(kind || '').toLowerCase()
    try {
      await stopGenerationRun(orgId, projectId, runId)
      setActiveGenerationRuns((prev) => (Array.isArray(prev) ? prev.filter((r) => r?.run_id !== runId) : prev))
      appendRunMessage(`GEN:${k}:${runId}:stopped`, `${k.toUpperCase()}: Stopped (run_id=${runId}).`)

      // Stop local polling immediately if this is the active run for that kind.
      if (k === 'prd' && prdRunId === runId) {
        setIsGeneratingPrd(false)
        setPrdRunId('')
        clearActivePrdRun()
      }
      if (k === 'sdd' && sddRunId === runId) {
        setIsGeneratingSdd(false)
        setSddRunId('')
        clearActiveSddRun()
      }
      if (k === 'schema' && schemaRunId === runId) {
        setIsGeneratingSchema(false)
        setSchemaRunId('')
        clearActiveSchemaRun()
      }
      if (k === 'usecase' && usecaseRunId === runId) {
        setIsGeneratingUsecase(false)
        setUsecaseRunId('')
      }
      if (k === 'sequence' && sequenceRunId === runId) {
        setIsGeneratingSequence(false)
        setSequenceRunId('')
      }
    } catch (e) {
      appendRunMessage(`GEN:${k}:${runId}:stop_failed`, `${k.toUpperCase()}: Stop failed.${e instanceof Error ? ` ${e.message}` : ''}`)
    }
  }

  const regenerateDoc = async (kind) => {
    const k = String(kind || '').toLowerCase()
    if (k === 'prd') {
      if (!orgId || !projectId || !intakeId) return
      setActivePreviewKey('prd')
      setPreviewPaneOpen(true)
      appendRunMessage(`PRD:${intakeId}:regenerate`, 'PRD: Regenerating. Previous run (if any) will be stopped.')
      setPrdMessage('')
      setIsGeneratingPrd(true)
      setIsLoadingFinalPrd(false)
      setPrdContent('')
      setPrdRunId('')
      try {
        const title = (structuredPartial?.project_name || typedText?.slice(0, 80) || 'Untitled Project').trim()
        const problemStatement = (structuredPartial?.problem_statement || typedText || '').trim()
        const targetUsers = Array.isArray(structuredPartial?.target_users)
          ? structuredPartial.target_users.join(', ')
          : ''
        const features = Array.isArray(structuredPartial?.desired_features)
          ? structuredPartial.desired_features.filter(Boolean)
          : []
        const run = await startGenerationRun(orgId, projectId, {
          kind: 'prd',
          intake_id: intakeId,
          replace_active: true,
          payload: { title, problem_statement: problemStatement, target_users: targetUsers, features, additional_notes: '' },
        })
        if (!run?.run_id) throw new Error('Failed to start PRD regenerate run')
        setPrdRunId(run.run_id)
        setActivePrdRun({ runId: run.run_id, orgId, projectId, status: run.status || 'queued' })
      } catch (e) {
        setIsGeneratingPrd(false)
        clearActivePrdRun()
        appendRunMessage(`PRD:${intakeId}:regenerate_failed`, `PRD: Regenerate failed.${e instanceof Error ? ` ${e.message}` : ''}`)
      }
      return
    }

    if (!orgId || !projectId || !intakeId) return
    try {
      const run = await startGenerationRun(orgId, projectId, { kind: k, intake_id: intakeId, replace_active: true, payload: {} })
      if (!run?.run_id) return
      if (k === 'sdd') {
        setSddRunId(run.run_id)
        setIsGeneratingSdd(true)
      } else if (k === 'schema') {
        setSchemaRunId(run.run_id)
        setIsGeneratingSchema(true)
      } else if (k === 'usecase') {
        setUsecaseRunId(run.run_id)
        setIsGeneratingUsecase(true)
      } else if (k === 'sequence') {
        setSequenceRunId(run.run_id)
        setIsGeneratingSequence(true)
      }
    } catch (e) {
      appendRunMessage(`GEN:${k}:regenerate_failed`, `${k.toUpperCase()}: Regenerate failed.${e instanceof Error ? ` ${e.message}` : ''}`)
    }
  }



  const currentQuestion = questions[currentQuestionIndex]

  const useNewUx = true
  const isPreSubmit = useNewUx && phase === 'draft' && !intakeId

  if (isPreSubmit) {
    return (
      <div className="relative min-h-[calc(100vh-2rem)] overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <div className="pointer-events-none absolute inset-0 dv-grid opacity-[0.22]" />
        <div className="pointer-events-none absolute inset-0 dv-noise" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-[520px] w-[980px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/20 via-cyan-400/10 to-emerald-400/10 blur-3xl" />

        <div className="mx-auto flex w-full max-w-[980px] flex-col items-center px-0 py-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex w-full flex-col items-center"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/70 shadow-soft backdrop-blur dark:bg-white/5">
                <img src={logo} alt="DecisionVault" className="h-7 w-7" />
              </div>
              <div className="flex flex-col">
                <Text size="2" weight="bold">
                  DecisionVault
                </Text>
                <div className="mt-0.5 flex items-center gap-2">
                  <Badge color="indigo" radius="full">
                    Starter plan
                  </Badge>
                  <Text size="1" color="gray">
                    License active
                  </Text>
                </div>
              </div>
            </div>

            <div className="mt-20 text-center">
              <Text size="3" color="gray" className="mx-auto mt-2 max-w-[68ch]">
                What do you want to make?
              </Text>
            </div>

            <div className="mt-8 w-full">
              <div className="overflow-hidden rounded-none border border-zinc-200/70 bg-white/75 shadow-soft backdrop-blur dark:border-white/10 dark:bg-white/5">
                <TextArea
                  ref={textAreaRef}
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  placeholder="Describe your product idea and requirements."
                  size="3"
                  variant="ghost"
                  rows={7}
                  style={{
                    minHeight: 170,
                    resize: 'none',
                    width: '100%',
                    border: 'none',
                    boxShadow: 'none',
                    overflow: 'hidden',
                  }}
                />
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200/70 p-2 dark:border-white/10">
                  <IconButton variant="soft" size="3" radius="full" aria-label="Upload file">
                    <UploadIcon width="20" height="20" />
                  </IconButton>
                  <div className="flex items-center gap-2">
                    <Select.Root size="3" defaultValue="default">
                      <Select.Trigger variant="soft" style={{ minWidth: 180 }} />
                      <Select.Content>
                        <Select.Item value="default">Default</Select.Item>
                      </Select.Content>
                    </Select.Root>
                    <IconButton
                      variant="solid"
                      size="3"
                      radius="full"
                      aria-label="Submit"
                      onClick={handleSubmit}
                      disabled={!typedText.trim() || phase === 'loading'}
                    >
                      <ArrowUpIcon width="20" height="20" />
                    </IconButton>
                  </div>
                </div>
              </div>

              {submitError ? (
                <div className="mt-3">
                  <Text size="2" color="red">
                    {submitError}
                  </Text>
                </div>
              ) : null}
            </div>

            <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="dv-card rounded-none p-4">
                <div className="flex items-center gap-2">
                  <LightningBoltIcon />
                  <Text size="2" weight="medium">
                    Live runs
                  </Text>
                </div>
                <Text size="1" className="mt-1 dv-muted-2">
                  Track PRD, SDD, schema, and diagram generation in one place.
                </Text>
              </div>
              <div className="dv-card rounded-none p-4">
                <div className="flex items-center gap-2">
                  <ChatBubbleIcon />
                  <Text size="2" weight="medium">
                    Clarifications
                  </Text>
                </div>
                <Text size="1" className="mt-1 dv-muted-2">
                  Answer targeted questions to tighten requirements quickly.
                </Text>
              </div>
              <div className="dv-card rounded-none p-4">
                <div className="flex items-center gap-2">
                  <FileTextIcon />
                  <Text size="2" weight="medium">
                    Document output
                  </Text>
                </div>
                <Text size="1" className="mt-1 dv-muted-2">
                  Markdown preview, versions, and “open full document” views.
                </Text>
              </div>
              <div className="dv-card rounded-none p-4">
                <div className="flex items-center gap-2">
                  <CodeIcon />
                  <Text size="2" weight="medium">
                    Diagrams
                  </Text>
                </div>
                <Text size="1" className="mt-1 dv-muted-2">
                  Schema plan, usecase, sequence, and architecture flows.
                </Text>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  const isPostSubmit = useNewUx && !isPreSubmit

			  if (isPostSubmit) {
			    const genNodeId = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`
			    const mkMsg = (id, createdByName, content, extra = {}) => ({ id, created_by_name: createdByName, content, ...extra })

			    const formatChatTimestamp = (value) => {
			      const iso = String(value || '').trim()
			      if (!iso) return ''
			      try {
			        const d = new Date(iso)
			        if (Number.isNaN(d.getTime())) return ''
			        return d.toLocaleString(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
			      } catch {
			        return ''
			      }
			    }

		    const fieldKeyForIndex = (idx) => questionFields[idx] || `answer_${idx}`

		    const openDoc = async (kind, docId) => {
		      if (!orgId || !projectId) return
		      const k = String(kind || '').trim()
		      const id = String(docId || '').trim()
		      if (!k || !id) return
		      try {
		        const resp = await getDocById(orgId, projectId, k, id)
		        const content = String(resp?.content || '')
		        if (k === 'prd') setPrdContent(content)
		        else if (k === 'sdd') setSddContent(content)
		        else if (k === 'schema') setSchemaSummary(content)
		        else if (k === 'usecase') setUsecaseSummary(content)
		        else if (k === 'sequence') setSequenceSummary(content)
		        else if (k === 'architecture') {
		          setArchitectureExists(true)
		          // Preview pane currently uses a placeholder for architecture; show content in sequence pane for now.
		          setSequenceSummary(content)
		        }

		        const previewKey =
		          k === 'prd' ? 'prd'
		            : k === 'sdd' ? 'sdd'
		              : k === 'schema' ? 'schema'
		                : k === 'usecase' ? 'usecase'
		                  : k === 'sequence' ? 'sequence'
		                    : 'architecture'
		        setActivePreviewKey(previewKey)
		        setPreviewPaneOpen(true)
		      } catch {
		        // ignore doc fetch errors in chat action
		      }
		    }

		    const isGeneratingAny =
		      isGeneratingPrd ||
		      isLoadingFinalPrd ||
		      isGeneratingSdd ||
	      isGeneratingSchema ||
	      isGeneratingUsecase ||
	      isGeneratingSequence ||
	      isGeneratingArchitecture

	    const hasAnyDoc =
	      Boolean(prdContent) ||
	      Boolean(sddContent) ||
	      Boolean(schemaSummary) ||
	      Boolean(usecaseSummary) ||
	      Boolean(sequenceSummary) ||
	      Boolean(architectureExists)

	    // When generation starts (or any doc exists), switch from centered container to full-width workspace.
	    const isWorkspaceMode = isGeneratingAny || hasAnyDoc
	    const showPreviewPane = isWorkspaceMode && previewPaneOpen

		    const cleanPreviewMarkdown = (key, value) => {
		      const text = String(value || '')
		      if (!text.trim()) return ''

		      const lines = text.split('\n')
		      const out = []
		      let skippingInput = false
		      for (const line of lines) {
		        const trimmed = line.trim()
		        if (/^(System|Style|Depth|Stage|Task|Rules|Allowed keys)\s*:/i.test(trimmed)) {
		          continue
		        }
		        if (/^Input\s*:/i.test(trimmed)) {
		          skippingInput = true
		          continue
		        }
		        if (skippingInput) {
		          // Stop skipping once the actual markdown starts.
		          if (trimmed.startsWith('#')) {
		            skippingInput = false
		            out.push(line)
		          }
		          continue
		        }
		        out.push(line)
		      }

		      let cleaned = out.join('\n').trim()
		      // If we still have prompt noise above the first heading, drop everything before the first markdown heading.
		      const headingIdx = cleaned.search(/(^|\n)#{1,6}\s+/)
		      if (headingIdx > 0 && (cleaned.includes('System:') || cleaned.includes('Allowed keys:') || cleaned.includes('Input:'))) {
		        cleaned = cleaned.slice(headingIdx).trim()
		      }
		      return cleaned
		    }

		    const previewDoc = (() => {
		      const byKey = {
		        prd: { key: 'prd', title: 'PRD', content: prdContent, loading: isGeneratingPrd || isLoadingFinalPrd },
		        sdd: { key: 'sdd', title: 'SDD', content: sddContent, loading: isGeneratingSdd },
		        schema: { key: 'schema', title: 'Schema', content: schemaSummary, loading: isGeneratingSchema },
		        usecase: { key: 'usecase', title: 'Usecase', content: usecaseSummary, loading: isGeneratingUsecase },
		        sequence: { key: 'sequence', title: 'Sequence', content: sequenceSummary, loading: isGeneratingSequence },
		        architecture: { key: 'architecture', title: 'Architecture', content: '', loading: isGeneratingArchitecture },
		      }

		      const preferred = String(activePreviewKey || '').trim()
		      if (preferred && (byKey[preferred]?.loading || String(byKey[preferred]?.content || '').trim())) {
		        return byKey[preferred]
		      }

		      if (isGeneratingPrd || isLoadingFinalPrd || prdContent) return byKey.prd
		      if (isGeneratingSdd || sddContent) return byKey.sdd
		      if (isGeneratingSchema || schemaSummary) return byKey.schema
		      if (isGeneratingUsecase || usecaseSummary) return byKey.usecase
		      if (isGeneratingSequence || sequenceSummary) return byKey.sequence
		      if (isGeneratingArchitecture || architectureExists) return byKey.architecture
		      return null
		    })()

        
			    const previewMarkdown = previewDoc ? cleanPreviewMarkdown(previewDoc.key, previewDoc.content) : ''
			    // IMPORTANT: avoid underscores here; markdown will parse `__TOKEN__` as <strong>TOKEN</strong>.
			    const DV_LOADING_TOKEN = '[[DV_LOADING]]'
			    const previewMarkdownForRender = previewMarkdown
			      ? previewMarkdown
			          .replace(/<!--\s*dv:loading\s*-->/g, DV_LOADING_TOKEN)
			          // Backward compat for older previews that used __DV_LOADING__.
			          .replace(/__DV_LOADING__/g, DV_LOADING_TOKEN)
			      : ''

			    const downloadTextFile = (filename, text) => {
			      try {
			        const blob = new Blob([String(text || '')], { type: 'text/plain;charset=utf-8' })
			        const url = URL.createObjectURL(blob)
			        const a = document.createElement('a')
			        a.href = url
			        a.download = filename
			        document.body.appendChild(a)
			        a.click()
			        a.remove()
			        URL.revokeObjectURL(url)
			      } catch {
			        // ignore
			      }
			    }

			    const handleExportActive = async (type) => {
			      if (!orgId || !projectId) return
			      const key = String(previewDoc?.key || '').trim()
			      if (!key) return
			      const exportType = String(type || '').trim()
			      if (!exportType) return

			      // PRD/SDD can use server export (md/pdf/doc). Others fall back to client-side markdown download.
			      if ((key === 'prd' || key === 'sdd') && (exportType === 'md' || exportType === 'pdf' || exportType === 'doc')) {
			        try {
			          setExportingType(exportType)
			          const versionNumber = undefined
			          const docKind = key === 'sdd' ? 'sdd' : 'prd'
			          const { blob, filename } = await exportLlmPrd(orgId, projectId, exportType, versionNumber, docKind)
			          const url = URL.createObjectURL(blob)
			          const anchor = document.createElement('a')
			          anchor.href = url
			          anchor.download = filename
			          document.body.appendChild(anchor)
			          anchor.click()
			          anchor.remove()
			          URL.revokeObjectURL(url)
			        } catch (e) {
			          appendRunMessage(`EXPORT:${key}:${exportType}:failed`, `Export failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
			        } finally {
			          setExportingType('')
			        }
			        return
			      }

			      const baseName = `decisionvault-${key}-${new Date().toISOString().slice(0, 10)}`
			      downloadTextFile(`${baseName}.md`, previewMarkdown)
			    }

			    const currentQuestionText = String(currentQuestion || '').trim()
		    const persistedMessages = Array.isArray(chatMessages) ? chatMessages : []
		    const explainMessages = Array.isArray(runMessages) ? runMessages : []
		    const messagesForUi = (() => {
		      const getMsgText = (m) => {
		        if (!m || typeof m !== 'object') return ''
		        const candidates = [m.text, m.content, m.message]
		        for (const c of candidates) {
		          if (typeof c === 'string' && c.trim()) return c
		        }
		        // Avoid surfacing internal stage/field keys in the chat UI.
		        // If we ever see a message without text, drop it instead of showing `stage_x:field_y`.
		        return ''
		      }
		      const fromPersisted = (persistedMessages.length || explainMessages.length)
		        ? (() => {
		            const combined = [...persistedMessages, ...explainMessages].filter((m) =>
		              String(getMsgText(m) || '').trim(),
		            )
		            const withTime = combined.map((m, idx) => {
		              const raw = m && typeof m === 'object' ? m.created_at : null
		              const t = typeof raw === 'string' ? Date.parse(raw) : NaN
		              const kind = String((m && typeof m === 'object' ? m.kind : '') || 'msg')
		              const kindLower = kind.toLowerCase()
		              const meta = m && typeof m === 'object' ? m.meta : null
		              return { m, idx, t: Number.isFinite(t) ? t : 0, kind, kindLower, meta }
		            })

		            // Prefer showing clarification question right under the corresponding stage log line.
		            const clarifyRunTsByStage = new Map()
		            for (const it of withTime) {
		              const isRun = String(it.kindLower || '') === 'run'
		              const stage = it?.meta && typeof it.meta === 'object' ? String(it.meta.stage || '').trim() : ''
		              const status = it?.meta && typeof it.meta === 'object' ? String(it.meta.status || '').trim() : ''
		              if (isRun && stage && status === 'clarification_required') {
		                clarifyRunTsByStage.set(stage, it.t)
		              }
		            }

		            const adjusted = withTime.map((it) => {
		              const stage = it?.meta && typeof it.meta === 'object' ? String(it.meta.stage || '').trim() : ''
		              if (!stage) return it
		              const anchor = clarifyRunTsByStage.get(stage)
		              if (!anchor) return it
		              const k = String(it.kindLower || '')
		              // Push clarification status/question messages just after the stage clarification log line.
		              if (k === 'status' || k === 'question') {
		                return { ...it, t: anchor + (k === 'status' ? 1 : 2) }
		              }
		              return it
		            })

		            const sorted = adjusted
		              .sort((a, b) => (a.t - b.t) || (a.idx - b.idx))
		              .map((x) => x.m)

		            return sorted.map((m, idx) => {
		              const sender = String(m.role || '').toLowerCase() === 'user' ? 'you' : 'DecisionVault'
		              const kind = String(m.kind || 'msg')
		              const key = `${kind}_${String(m.field_key || '')}_${String(m.created_at || '')}_${idx}`
		              const extra = {
		                kind,
		                field_key: m.field_key ?? null,
		                meta: m.meta ?? null,
		                ...(m.action ? { action: m.action } : null),
		                ...(m.created_at ? { created_at: m.created_at } : null),
		              }
		              return mkMsg(key, sender, String(getMsgText(m) || ''), extra)
		            })
		          })()
		        : null
			      const base = fromPersisted || null
			      if (base) return base

		      const items = []
		      const intakeText = String(typedText || '').trim()
		      if (intakeText) items.push(mkMsg('intake', 'you', intakeText))

		      if (phase === 'loading') {
		        items.push(
		          mkMsg(
		            'loading',
		            'DecisionVault',
		            'Extracting requirements and generating clarification questions…',
		          ),
		        )
		      }

		      if (submitError) {
		        items.push(mkMsg('error', 'DecisionVault', `Error: ${String(submitError)}`))
		      }

		      if (phase === 'questions') {
		        for (let idx = 0; idx < Math.min(currentQuestionIndex, questions.length); idx += 1) {
		          const q = String(questions[idx] || '').trim()
		          if (q) items.push(mkMsg(`q_${idx}`, 'DecisionVault', q))
		          const key = fieldKeyForIndex(idx)
		          const a = String(answers?.[key] || '').trim()
		          if (a) items.push(mkMsg(`a_${idx}`, 'you', a))
		        }
		        if (currentQuestionText) items.push(mkMsg(`q_${currentQuestionIndex}`, 'DecisionVault', currentQuestionText))
		      }

		      if (phase === 'done') {
		        items.push(mkMsg('ready', 'DecisionVault', 'Requirements captured. You can start generating documents.'))
		      }

			      return items
			    })()

		    const canGenerateDocs = phase === 'done' && Boolean(intakeId)

	    const findDocNode = (nodes, id) => {
	      for (const n of nodes) {
	        if (n?.id === id) return n
	        if (n?.type === 'folder' && Array.isArray(n.children)) {
	          const found = findDocNode(n.children, id)
	          if (found) return found
	        }
	      }
	      return null
	    }

	    const insertDocNode = (nodes, parentId, newNode) => {
	      return nodes.map((n) => {
	        if (n?.id === parentId && n?.type === 'folder') {
	          const nextChildren = Array.isArray(n.children) ? n.children : []
	          return { ...n, children: [...nextChildren, newNode] }
	        }
	        if (n?.type === 'folder' && Array.isArray(n.children)) {
	          return { ...n, children: insertDocNode(n.children, parentId, newNode) }
	        }
	        return n
	      })
	    }

	    const selectedFolderId = (() => {
	      const selected = findDocNode(docTree, selectedDocNodeId)
	      if (selected?.type === 'folder') return selected.id
	      return 'root'
	    })()

	    const commitCreate = () => {
	      const name = String(createDraft?.name || '').trim()
	      const parentId = String(createDraft?.parentId || 'root')
	      const type = createDraft?.type
	      if (!name || (type !== 'folder' && type !== 'file')) return

	      const node =
	        type === 'folder'
	          ? { id: genNodeId(), type: 'folder', name, children: [] }
	          : { id: genNodeId(), type: 'file', name, content: '' }

	      setDocTree((prev) => insertDocNode(prev, parentId, node))
	      setExpandedNodes((prev) => {
	        const next = new Set(prev)
	        next.add(parentId)
	        return next
	      })
	      setSelectedDocNodeId(node.id)
	      setCreateDraft(null)
	    }

	    const cancelCreate = () => setCreateDraft(null)

	    const summarizeDoc = (content) => {
	      const text = String(content || '')
	        .replace(/```[\s\S]*?```/g, ' ')
	        .replace(/#+\s+/g, '')
	        .replace(/\s+/g, ' ')
	        .trim()
	      if (!text) return ''
	      return text.length > 64 ? `${text.slice(0, 64)}…` : text
	    }

	    const toggleFolder = (folderId) => {
	      setExpandedNodes((prev) => {
	        const next = new Set(prev)
	        if (next.has(folderId)) next.delete(folderId)
	        else next.add(folderId)
	        return next
	      })
	    }

	    const renderTree = (nodes, depth) => {
	      return (nodes || []).map((n) => {
	        const isFolder = n?.type === 'folder'
	        const isSelected = n?.id === selectedDocNodeId
	        const isExpanded = isFolder && expandedNodes.has(n.id)
	        const desc = isFolder
	          ? `${Array.isArray(n?.children) ? n.children.length : 0} items`
	          : summarizeDoc(n?.content)
	        return (
	          <div key={n.id}>
	            <button
	              type="button"
	              onClick={() => {
	                setSelectedDocNodeId(n.id)
	                if (isFolder) toggleFolder(n.id)
	              }}
	              className={[
	                'flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left transition',
	                isSelected ? 'bg-indigo-500/15 text-zinc-950 dark:text-zinc-50' : 'hover:bg-zinc-950/5 dark:hover:bg-white/5',
	              ].join(' ')}
	              style={{ paddingLeft: 8 + depth * 14 }}
	            >
	              {isFolder ? (
	                isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />
	              ) : (
	                <span className="inline-block w-[15px]" />
	              )}
	              {isFolder ? <ArchiveIcon /> : <FileIcon />}
	              <div className="min-w-0 flex-1 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
	                <span className="truncate text-sm font-medium">{n.name}</span>
	                <span className="truncate text-xs text-zinc-500 dark:text-white/50">{desc}</span>
	              </div>
	            </button>
	            {isFolder && isExpanded && Array.isArray(n.children) && n.children.length > 0 ? (
	              <div className="mt-1">{renderTree(n.children, depth + 1)}</div>
	            ) : null}
	          </div>
	        )
	      })
	    }

		    return (
		      <div className="relative min-h-[calc(100vh-2rem)] overflow-hidden  text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
		        <div className="pointer-events-none absolute inset-0 dv-grid opacity-[0.22]" />
		        <div className="pointer-events-none absolute inset-0 dv-noise" />

			        <div className="w-full p-0">
			          <div
			            className={
			              showPreviewPane
			                ? 'grid grid-cols-1 gap-3 lg:grid-cols-[260px_minmax(0,1fr)_minmax(360px,40vw)]'
			                : 'grid grid-cols-1 gap-3 lg:grid-cols-[260px_1fr]'
			            }
			          >
		            <div className="dv-card rounded-none h-[calc(100vh-3rem)] overflow-hidden p-4 flex flex-col">
	              <div className="flex items-center justify-between gap-2">
	                <div className="min-w-0">
	                  <Text size="2" weight="bold">
	                    Docs
	                  </Text>
	                  
	                </div>
	                <div className="flex items-center gap-1">
	                  <IconButton
	                    variant="soft"
	                    size="2"
	                    radius="full"
	                    aria-label="New folder"
	                    onClick={() => setCreateDraft({ type: 'folder', parentId: selectedFolderId, name: '' })}
	                  >
	                    <PlusIcon />
	                  </IconButton>
	                  <IconButton
	                    variant="soft"
	                    size="2"
	                    radius="full"
	                    aria-label="New doc"
	                    onClick={() => setCreateDraft({ type: 'file', parentId: selectedFolderId, name: '' })}
	                  >
	                    <FileTextIcon />
	                  </IconButton>
	                </div>
	              </div>

		              {(() => {
		                const items = Array.isArray(activeGenerationRuns) ? activeGenerationRuns : []
		                if (items.length === 0) return null
		                return (
		                  <div className="mt-3 border border-white/10 bg-white/60 p-2 dark:bg-zinc-950/30">
		                    <div className="flex items-center justify-between gap-2">
		                      <div className="text-[11px] font-medium text-zinc-600 dark:text-white/60">Running</div>
		                      <Spinner size="2" />
		                    </div>
		                    <div className="mt-2 flex flex-col gap-1.5">
			                      {items.map((it) => {
			                        const kind = String(it?.kind || '').toLowerCase()
			                        const runId = String(it?.run_id || '').trim()
			                        const status = String(it?.status || '').trim() || 'running'
			                        const suffix = runId ? runId.slice(-6) : ''
			                        const serverElapsedSeconds =
			                          it?.total_elapsed_seconds === null || it?.total_elapsed_seconds === undefined || Number.isNaN(Number(it?.total_elapsed_seconds))
			                            ? null
			                            : Number(it.total_elapsed_seconds)
			                        const createdAtMs = (() => {
			                          const raw = it?.started_at || it?.created_at || null
			                          const ms = raw ? new Date(raw).getTime() : NaN
			                          return Number.isFinite(ms) ? ms : null
			                        })()
			                        const runtimeSeconds = serverElapsedSeconds !== null ? Math.floor(serverElapsedSeconds) : (createdAtMs ? Math.max(0, Math.floor((runtimeNowMs - createdAtMs) / 1000)) : null)
			                        return (
			                          <div
			                            key={runId || `${kind}-${suffix}`}
			                            className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/70 px-2 py-2 text-zinc-800 dark:bg-white/5 dark:text-white/80"
			                          >
		                            <div className="min-w-0">
		                              <div className="flex items-center gap-2">
		                                <span className="text-[12px] font-semibold">{runKindLabel(kind)}</span>
		                                {suffix ? (
		                                  <span className="text-[11px] text-zinc-500 dark:text-white/55">
		                                    #{suffix}
		                                  </span>
		                                ) : null}
			                              </div>
			                              <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-white/55">
			                                {stageLabel(status)}{runtimeSeconds !== null ? ` · ${formatRuntime(runtimeSeconds)}` : ''}
			                              </div>
			                            </div>
		                            <div className="flex items-center gap-1">
		                              {status === 'running' ? (
		                                <Button size="1" variant="soft" color="gray" onClick={() => pauseRunById(kind, runId)} disabled={!runId}>
		                                  Pause
		                                </Button>
		                              ) : null}
		                              {status === 'paused' ? (
		                                <Button size="1" variant="soft" color="gray" onClick={() => resumeRunById(kind, runId)} disabled={!runId}>
		                                  Resume
		                                </Button>
		                              ) : null}
		                              <Button size="1" variant="soft" color="red" onClick={() => stopRunById(kind, runId)} disabled={!runId}>
		                                Stop
		                              </Button>
		                            </div>
		                          </div>
		                        )
		                      })}
		                    </div>
		                  </div>
		                )
		              })()}

		              <div className="mt-3 border border-white/10 bg-white/60 p-2 dark:bg-zinc-950/30">
		                <Text size="1" color="gray">
		                  Actions
		                </Text>
		                <div className="mt-2 grid grid-cols-2 gap-2">
		                  <Button size="1" onClick={handleGeneratePrd} disabled={!canGenerateDocs || isGeneratingAny}>
		                    PRD
		                  </Button>
		                  <Button size="1" variant="soft" color="indigo" onClick={handleGenerateSdd} disabled={!canGenerateDocs || isGeneratingAny}>
		                    SDD
		                  </Button>
		                  <Button size="1" variant="soft" color="gray" onClick={handleGenerateSchemaPlan} disabled={!canGenerateDocs || isGeneratingAny}>
		                    Schema
		                  </Button>
		                  <Button size="1" variant="soft" color="gray" onClick={handleGenerateUsecaseDiagram} disabled={!canGenerateDocs || isGeneratingAny}>
		                    Usecase
		                  </Button>
		                  <Button size="1" variant="soft" color="gray" onClick={handleGenerateSequenceDiagram} disabled={!canGenerateDocs || isGeneratingAny}>
		                    Sequence
		                  </Button>
		                  <Button size="1" variant="soft" color="gray" onClick={handleGenerateArchitectureDiagram} disabled={!canGenerateDocs || isGeneratingAny}>
		                    Arch
		                  </Button>
		                </div>
			                {/* Per-run pause/resume/stop controls are shown in the Running section above. */}
		                <div className="mt-2 grid grid-cols-2 gap-2">
		                  <Button size="1" variant="soft" color="indigo" onClick={() => regenerateDoc('prd')} disabled={!canGenerateDocs}>
		                    Regenerate PRD
		                  </Button>
		                  <Button size="1" variant="soft" color="indigo" onClick={() => regenerateDoc('sdd')} disabled={!canGenerateDocs}>
		                    Regenerate SDD
		                  </Button>
		                </div>
		              </div>

	             

	              {createDraft ? (
	                <div className="mt-3  border border-white/10 bg-white/60 p-2 dark:bg-zinc-950/30">
	                  <Text size="1" color="gray">
	                    Create {createDraft.type === 'folder' ? 'folder' : 'doc'}
	                  </Text>
	                  <div className="mt-2 flex items-center gap-2">
	                    <TextField.Root
	                      size="2"
	                      value={createDraft.name}
	                      placeholder={createDraft.type === 'folder' ? 'Folder name' : 'Document name'}
	                      onChange={(e) => setCreateDraft((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
	                      onKeyDown={(e) => {
	                        if (e.key === 'Enter') commitCreate()
	                        if (e.key === 'Escape') cancelCreate()
	                      }}
	                    />
	                    <Button size="1" variant="solid" color="indigo" onClick={commitCreate} disabled={!String(createDraft.name || '').trim()}>
	                      Create
	                    </Button>
	                  </div>
	                  <div className="mt-2 flex justify-end">
	                    <Button size="1" variant="soft" color="gray" onClick={cancelCreate}>
	                      Cancel
	                    </Button>
	                  </div>
	                </div>
	              ) : null}

	              <div className="mt-4 flex-1 overflow-auto pr-1">
	                {renderTree(docTree, 0)}
	                {docTree?.[0]?.children?.length === 0 ? (
	                  <div className="mt-4 rounded-xl border border-white/10 bg-white/60 p-3 text-sm text-zinc-700 dark:bg-zinc-950/30 dark:text-white/70">
	                    Create a document or folder to start organizing outputs.
	                  </div>
	                ) : null}
	              </div>
	            </div>

		            <div className="min-w-0">
		              <Flex direction="column" className="dv-card rounded-none overflow-hidden" style={{ height: 'calc(100vh - 3rem)', minHeight: 0 }}>
		                <Flex
		                  align="center"
		                  justify="between"
		                  p="3"
		                  style={{ borderBottom: '1px solid var(--gray-6)', background: 'var(--color-panel-solid)', flexShrink: 0 }}
		                >
		                  <Flex direction="column" gap="1">
		                    <Flex align="center" gap="2">
		                      <Box
		                        style={{
		                          width: 22,
		                          height: 22,
		                          borderRadius: 6,
		                          overflow: 'hidden',
		                          display: 'grid',
		                          placeItems: 'center',
		                        }}
		                      >
		                        <img src={logo} alt="DecisionVault" style={{ width: 18, height: 18 }} />
		                      </Box>
		                      <Text size="2" weight="medium">Assistant</Text>
		                    </Flex>
		                    <Flex gap="2" wrap="wrap">
		                      
		                      {phase === 'loading' ? <Badge color="blue">Analyzing</Badge> : null}
		                      {phase === 'questions' ? <Badge color="amber">Clarification</Badge> : null}
		                      {phase === 'done' ? <Badge color="green">Ready</Badge> : null}
		                    </Flex>
		                  </Flex>
		                </Flex>

		                <ScrollArea type="auto" scrollbars="vertical" style={{ flex: 1, minHeight: 0 }}>
		                  <Box p="4" style={{ paddingBottom: 24 }}>
		                    {messagesForUi.length === 0 ? <Text size="2" color="gray">No messages yet.</Text> : null}
		                    {messagesForUi.map((msg) => {
		                      const isUser = String(msg.created_by_name || '').toLowerCase() === 'you'
		                      const name = isUser ? 'You' : String(msg.created_by_name || 'DecisionVault')
		                      const fallback = (name || 'D').slice(0, 1).toUpperCase()
		                      return (
		                        <Flex key={msg.id} gap="3" mb="4" align="start" justify={isUser ? 'end' : 'start'}>
		                          {!isUser ? (
		                            <Avatar size="2" radius="full" fallback={fallback} style={{ flexShrink: 0 }} />
		                          ) : null}
			                          <Box style={{ flex: 1, minWidth: 0, maxWidth: 760 }}>
				                            <Flex align="center" gap="2" mb="1" justify={isUser ? 'end' : 'start'}>
				                              <Text size="2" weight="medium">{name}</Text>
				                              {String(msg.kind || '') === 'question' ? (
				                                <Badge color="amber" size="1">Question</Badge>
				                              ) : null}
				                              {msg.created_at ? (
				                                <Text size="1" color="gray">
				                                  {formatChatTimestamp(msg.created_at)}
				                                </Text>
				                              ) : null}
				                            </Flex>
		                            <Card
		                              size="1"
		                              style={{
		                                borderRadius: 0,
		                                ...(isUser ? { background: 'rgba(99,102,241,0.12)' } : null),
		                              }}
		                            >
		                              {String(msg.kind || '') === 'question' ? (
		                                <Flex direction="column" gap="2">
		                                  <Text size="1" color="amber">
		                                    Clarification required to continue generation.
		                                  </Text>
		                                  <Text size="2" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Text>
		                                </Flex>
		                              ) : (
		                                <Text size="2" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Text>
		                              )}
		                            </Card>
			                            {msg.action?.type === 'open_doc' ? (
			                              <Flex justify="end" mt="2" gap="2" wrap="wrap">
			                                <Button
			                                  size="2"
			                                  variant="soft"
			                                  color="indigo"
			                                  onClick={() => {
			                                    openDoc(String(msg.action?.kind || ''), String(msg.action?.docId || ''))
			                                  }}
			                                >
			                                  <FileTextIcon /> View doc
			                                </Button>
			                              </Flex>
			                            ) : null}
			                            {msg.action?.type === 'open_preview' ? (
			                              <Flex justify="end" mt="2" gap="2" wrap="wrap">
			                                <Button
			                                  size="2"
			                                  variant="soft"
			                                  color="indigo"
			                                  onClick={() => {
			                                    setActivePreviewKey(String(msg.action?.previewKey || ''))
			                                    setPreviewPaneOpen(true)
			                                  }}
			                                >
			                                  <FileTextIcon /> View doc
			                                </Button>
			                              </Flex>
			                            ) : null}
		                            {msg.id === 'ready' ? (
		                              <Flex justify="end" mt="2" gap="2" wrap="wrap">
		                                <Button size="2" onClick={handleGeneratePrd} disabled={!intakeId || isGeneratingPrd || isLoadingFinalPrd}>
		                                  Generate PRD
		                                </Button>
		                                <Button size="2" variant="soft" color="indigo" onClick={handleGenerateSdd} disabled={!intakeId || isGeneratingSdd}>
		                                  Generate SDD
		                                </Button>
		                              </Flex>
		                            ) : null}
		                          </Box>
		                          {isUser ? (
		                            <Avatar size="2" radius="full" fallback={fallback} style={{ flexShrink: 0 }} />
		                          ) : null}
		                        </Flex>
		                      )
		                    })}
		                    {canGenerateDocs ? (
		                      <Flex justify="end" mt="2" gap="2" wrap="wrap">
		                        <Button size="2" onClick={handleGeneratePrd} disabled={!intakeId || isGeneratingPrd || isLoadingFinalPrd}>
		                          Generate PRD
		                        </Button>
		                        <Button size="2" variant="soft" color="indigo" onClick={handleGenerateSdd} disabled={!intakeId || isGeneratingSdd}>
		                          Generate SDD
		                        </Button>
		                      </Flex>
		                    ) : null}
		                    <div ref={chatEndRef} />
		                  </Box>
		                </ScrollArea>

		                {phase === 'questions' && currentQuestionText ? (
		                  <Box p="3" style={{ borderTop: '1px solid var(--gray-6)', background: 'var(--color-panel-solid)', flexShrink: 0 }}>
		                    <TextArea
		                      placeholder="Type your answer..."
		                      value={currentAnswer}
		                      onChange={(e) => setCurrentAnswer(e.target.value)}
		                      rows={3}
		                      style={{ minHeight: 72, marginBottom: 8 }}
		                      onKeyDown={(e) => {
		                        if (e.key === 'Enter' && !e.shiftKey) {
		                          e.preventDefault()
		                          handleAnswer()
		                        }
		                      }}
		                    />
		                    <Flex align="center" justify="end" gap="2">
		                      <Button variant="soft" color="gray" size="2" onClick={() => setCurrentAnswer('')}>
		                        <Cross2Icon width="14" height="14" /> Discard
		                      </Button>
		                      <Button size="2" onClick={handleAnswer} disabled={!currentAnswer.trim()}>
		                        <PaperPlaneIcon width="14" height="14" /> Send
		                      </Button>
		                    </Flex>
		                  </Box>
		                ) : intakeId ? (
		                  <Box p="3" style={{ borderTop: '1px solid var(--gray-6)', background: 'var(--color-panel-solid)', flexShrink: 0 }}>
		                    <Flex gap="2" align="end">
		                      <TextArea
		                        placeholder="Message the agent about this project..."
		                        value={projectChatDraft}
		                        onChange={(e) => setProjectChatDraft(e.target.value)}
		                        rows={2}
		                        style={{ minHeight: 56, flex: 1 }}
		                        onKeyDown={(e) => {
		                          if (e.key === 'Enter' && !e.shiftKey) {
		                            e.preventDefault()
		                            handleProjectChatSend()
		                          }
		                        }}
		                      />
		                      <Button size="2" onClick={handleProjectChatSend} disabled={!String(projectChatDraft || '').trim() || isSendingProjectChat}>
		                        <PaperPlaneIcon width="14" height="14" /> Send
		                      </Button>
		                    </Flex>
		                  </Box>
		                ) : null}
		              </Flex>
		            </div>

			            {showPreviewPane ? (
		              <div className="dv-card rounded-none h-[calc(100vh-3rem)] overflow-hidden p-4">
		                <div className="flex items-start justify-between gap-3">
		                  <div className="min-w-0">
		                    <Flex align="baseline" gap="2" wrap="wrap">
		                      <Text size="2" weight="bold">
		                        {previewDoc?.title || 'Document'}
		                      </Text>
		                      <Text size="1" color="gray">
		                        Live preview
		                      </Text>
		                    </Flex>
			                  </div>
			                  <div className="flex items-center gap-2">
			                    {previewDoc?.loading ? <Spinner size="2" /> : null}
			                    <DropdownMenu.Root>
			                      <DropdownMenu.Trigger>
			                        <Button size="1" variant="soft" disabled={!previewDoc || exportingType !== ''}>
			                          {exportingType ? `Exporting ${String(exportingType).toUpperCase()}…` : 'Actions'}
			                        </Button>
			                      </DropdownMenu.Trigger>
			                      <DropdownMenu.Content align="end" size="2">
			                        {(previewDoc?.key === 'prd' || previewDoc?.key === 'sdd') ? (
			                          <DropdownMenu.Item
			                            onSelect={() => {
			                              const type = previewDoc?.key === 'sdd' ? 'sdd' : 'prd'
			                              navigate(`/organizations/${orgId}/projects/${projectId}/dashboard/prd-view?type=${type}`)
			                            }}
			                          >
			                            Open full view
			                          </DropdownMenu.Item>
			                        ) : null}
			                        <DropdownMenu.Separator />
			                        <DropdownMenu.Item onSelect={() => handleExportActive('md')}>Download Markdown (.md)</DropdownMenu.Item>
			                        {(previewDoc?.key === 'prd' || previewDoc?.key === 'sdd') ? (
			                          <>
			                            <DropdownMenu.Item onSelect={() => handleExportActive('pdf')}>Export as PDF (.pdf)</DropdownMenu.Item>
			                            <DropdownMenu.Item onSelect={() => handleExportActive('doc')}>Export as DOC (.doc)</DropdownMenu.Item>
			                          </>
			                        ) : null}
			                      </DropdownMenu.Content>
			                    </DropdownMenu.Root>
			                    <IconButton
			                      variant="soft"
			                      size="2"
			                      radius="full"
		                      aria-label="Close preview"
		                      onClick={() => setPreviewPaneOpen(false)}
		                    >
		                      <Cross2Icon />
		                    </IconButton>
		                  </div>
		                </div>

		                <div className="mt-3 h-[calc(100%-3.25rem)] overflow-auto rounded-none border border-white/10 bg-white/60 p-4 dark:bg-zinc-950/30">
		                  {previewDoc?.loading && !previewDoc?.content ? (
		                    <div>
		                      <Skeleton style={{ height: 14, width: '62%', marginBottom: 10 }} />
		                      <Skeleton style={{ height: 12, width: '92%', marginBottom: 8 }} />
		                      <Skeleton style={{ height: 12, width: '88%', marginBottom: 8 }} />
		                      <Skeleton style={{ height: 12, width: '84%' }} />
		                    </div>
		                  ) : null}
			                  {previewMarkdownForRender ? (
			                    <div className="text-sm leading-7 text-zinc-900 dark:text-zinc-100">
			                      <ReactMarkdown
			                        components={{
			                          h1: (props) => <h1 className="mt-6 mb-3 text-xl font-semibold" {...props} />,
			                          h2: (props) => <h2 className="mt-6 mb-2 text-lg font-semibold" {...props} />,
			                          h3: (props) => <h3 className="mt-5 mb-2 text-base font-semibold" {...props} />,
			                          h4: (props) => <h4 className="mt-4 mb-2 text-sm font-semibold" {...props} />,
			                          p: ({ children, ...props }) => {
			                            const token =
			                              typeof children === 'string'
			                                ? children
			                                : Array.isArray(children) && children.length === 1 && typeof children[0] === 'string'
			                                  ? children[0]
			                                  : ''
			                            if (String(token || '').trim() === DV_LOADING_TOKEN) {
			                              return (
			                                <div className="my-3">
			                                  <Skeleton style={{ height: 12, width: '82%', marginBottom: 8 }} />
			                                  <Skeleton style={{ height: 12, width: '92%', marginBottom: 8 }} />
			                                  <Skeleton style={{ height: 12, width: '76%' }} />
			                                </div>
			                              )
			                            }
			                            return (
			                              <p className="my-3" {...props}>
			                                {children}
			                              </p>
			                            )
			                          },
			                          strong: ({ children, ...props }) => {
			                            // Backward compat if the token still got bolded by markdown.
			                            const token =
			                              typeof children === 'string'
			                                ? children
			                                : Array.isArray(children) && children.length === 1 && typeof children[0] === 'string'
			                                  ? children[0]
			                                  : ''
			                            if (String(token || '').trim() === 'DV_LOADING') {
			                              return (
			                                <span className="inline-block align-middle" style={{ width: 180 }}>
			                                  <Skeleton style={{ height: 10, width: '100%' }} />
			                                </span>
			                              )
			                            }
			                            return (
			                              <strong {...props}>
			                                {children}
			                              </strong>
			                            )
			                          },
			                          ul: (props) => <ul className="my-3 ml-5 list-disc space-y-1" {...props} />,
			                          ol: (props) => <ol className="my-3 ml-5 list-decimal space-y-1" {...props} />,
			                          li: ({ children, ...props }) => {
			                            // Often list items are rendered as <li><p>...</p></li>, so the `p` handler does most work.
			                            // This catches the rare case where the token is direct text in the <li>.
			                            const token =
			                              typeof children === 'string'
			                                ? children
			                                : Array.isArray(children) && children.length === 1 && typeof children[0] === 'string'
			                                  ? children[0]
			                                  : ''
			                            if (String(token || '').trim() === DV_LOADING_TOKEN) {
			                              return (
			                                <li className="leading-6" {...props}>
			                                  <Skeleton style={{ height: 10, width: '84%' }} />
			                                </li>
			                              )
			                            }
			                            return (
			                              <li className="leading-6" {...props}>
			                                {children}
			                              </li>
			                            )
			                          },
		                          blockquote: (props) => (
		                            <blockquote
		                              className="my-4 border-l-2 border-zinc-300/70 pl-3 text-zinc-700 dark:border-white/15 dark:text-white/75"
		                              {...props}
		                            />
		                          ),
		                          hr: (props) => <hr className="my-6 border-zinc-200/70 dark:border-white/10" {...props} />,
		                          code: ({ inline, className, children, ...props }) => {
		                            if (inline) {
		                              return (
		                                <code
		                                  className="rounded bg-zinc-950/5 px-1 py-0.5 font-mono text-[0.85em] dark:bg-white/10"
		                                  {...props}
		                                >
		                                  {children}
		                                </code>
		                              )
		                            }
		                            return (
		                              <code className={className} {...props}>
		                                {children}
		                              </code>
		                            )
		                          },
		                          pre: (props) => (
		                            <pre
		                              className="my-4 overflow-auto rounded-lg border border-white/10 bg-zinc-950/90 p-3 text-xs text-zinc-50"
		                              {...props}
		                            />
		                          ),
			                        }}
			                      >
			                        {previewMarkdownForRender}
			                      </ReactMarkdown>
			                    </div>
			                  ) : null}
		                  {!previewDoc ? (
		                    <Text size="2" color="gray">
		                      Start PRD or SDD generation to see the markdown preview here.
		                    </Text>
		                  ) : null}
		                  {previewDoc && !previewDoc.loading && !previewDoc.content && previewDoc.key === 'architecture' ? (
		                    <Text size="2" color="gray">
		                      Architecture output is available in the Architecture view.
		                    </Text>
		                  ) : null}
		                </div>
		              </div>
		            ) : null}
		          </div>
		        </div>
		      </div>
	    )
	  }

  
}
