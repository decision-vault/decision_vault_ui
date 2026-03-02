import { useEffect, useRef, useState } from 'react'
import {
  Box,
  Flex,
  Heading,
  Text,
  TextArea,
  TextField,
  IconButton,
  Select,
  Button,
  Spinner,
  Badge,
  Container,
  Skeleton,
} from '@radix-ui/themes'
import { ArrowUpIcon, UploadIcon } from '@radix-ui/react-icons'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  generateRequirementsPrd,
  getLlmPrdRunStatus,
  getLatestLlmPrd,
  getLatestRequirementsSystemDesign,
  getRequirementsSystemDesignRunStatus,
  getRequirementsPrd,
  getSchemaFlow,
  getSchemaFlowVersion,
  getSchemaFlowVersions,
  getSchemaFlowRunStatus,
  getUsecaseFlow,
  getUsecaseFlowVersion,
  getUsecaseFlowVersions,
  getUsecaseFlowRunStatus,
  getRequirementsSystemDesign,
  getLatestRequirementsStatus,
  getRequirementsStatus,
  respondRequirements,
  respondLlmPrdClarification,
  startSchemaFlowRun,
  startUsecaseFlowRun,
  startRequirementsSystemDesignRun,
  startLlmPrdRun,
  startRequirements,
} from '../../services/requirementsApi'
import { clearActivePrdRun, getActivePrdRun, setActivePrdRun } from '../../services/prdRunTracker'
import { clearActiveSddRun, setActiveSddRun } from '../../services/sddRunTracker'
import { clearActiveSchemaRun, getActiveSchemaRun, setActiveSchemaRun } from '../../services/schemaRunTracker'

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
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isInsideDashboard = location.pathname.includes('/dashboard')

  const [typedText, setTypedText] = useState('')
  const [phase, setPhase] = useState('draft') // draft | loading | questions | done
  const [intakeId, setIntakeId] = useState('')
  const [questions, setQuestions] = useState([])
  const [questionFields, setQuestionFields] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [answers, setAnswers] = useState({})
  const [structuredPartial, setStructuredPartial] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [isGeneratingPrd, setIsGeneratingPrd] = useState(false)
  const [prdRunId, setPrdRunId] = useState('')
  const [prdRunStatus, setPrdRunStatus] = useState('')
  const [prdRunSteps, setPrdRunSteps] = useState([])
  const [prdVersion, setPrdVersion] = useState(null)
  const [prdMessage, setPrdMessage] = useState('')
  const [prdContent, setPrdContent] = useState('')
  const [isLoadingFinalPrd, setIsLoadingFinalPrd] = useState(false)
  const [prdSource, setPrdSource] = useState('')
  const [prdClarifications, setPrdClarifications] = useState([])
  const [prdDraftPayload, setPrdDraftPayload] = useState(null)
  const [clarificationAnswers, setClarificationAnswers] = useState({})
  const [isSubmittingClarifications, setIsSubmittingClarifications] = useState(false)
  const [isGeneratingSdd, setIsGeneratingSdd] = useState(false)
  const [sddContent, setSddContent] = useState('')
  const [sddVersion, setSddVersion] = useState(null)
  const [sddMessage, setSddMessage] = useState('')
  const [isGeneratingSchema, setIsGeneratingSchema] = useState(false)
  const [schemaRunId, setSchemaRunId] = useState('')
  const [schemaRunStatus, setSchemaRunStatus] = useState('')
  const [schemaRunSteps, setSchemaRunSteps] = useState([])
  const [schemaSummary, setSchemaSummary] = useState('')
  const [schemaMessage, setSchemaMessage] = useState('')
  const [schemaExists, setSchemaExists] = useState(false)
  const [schemaVersions, setSchemaVersions] = useState([])
  const [selectedSchemaVersion, setSelectedSchemaVersion] = useState('')
  const [isGeneratingUsecase, setIsGeneratingUsecase] = useState(false)
  const [usecaseRunId, setUsecaseRunId] = useState('')
  const [usecaseRunStatus, setUsecaseRunStatus] = useState('')
  const [usecaseRunSteps, setUsecaseRunSteps] = useState([])
  const [usecaseSummary, setUsecaseSummary] = useState('')
  const [usecaseMessage, setUsecaseMessage] = useState('')
  const [usecaseExists, setUsecaseExists] = useState(false)
  const [usecaseVersions, setUsecaseVersions] = useState([])
  const [selectedUsecaseVersion, setSelectedUsecaseVersion] = useState('')

  const textAreaRef = useRef(null)

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
    const syncFromGlobalRun = () => {
      const activeRun = getActivePrdRun()
      if (
        activeRun?.runId &&
        activeRun?.orgId === orgId &&
        activeRun?.projectId === projectId &&
        (activeRun?.status === 'queued' || activeRun?.status === 'running' || activeRun?.status === 'paused')
      ) {
        setPrdRunId(activeRun.runId)
        setPrdRunStatus(activeRun.status)
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
        setSchemaRunStatus(activeRun.status || 'queued')
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
    if (!isGeneratingPrd || !prdRunId || !orgId || !projectId) return undefined
    let stopped = false
    const poll = async () => {
      try {
        const run = await getLlmPrdRunStatus(orgId, projectId, prdRunId)
        if (stopped) return
        setPrdRunStatus(run?.status || '')
        setPrdRunSteps(Array.isArray(run?.steps) ? run.steps : [])
        if (run?.status === 'completed') {
          setIsGeneratingPrd(false)
          clearActivePrdRun()
          setIsLoadingFinalPrd(true)
          setPrdContent('')
          setPrdVersion(run?.result?.version ?? null)
          setPrdSource('LLM-10STEP')
          setPrdMessage('PRD generation completed.')
          try {
            const latestLlmPrd = await getLatestLlmPrd(orgId, projectId)
            if (!stopped && latestLlmPrd?.content) {
              setPrdContent(latestLlmPrd.content)
              setPrdVersion(latestLlmPrd.version ?? run?.result?.version ?? null)
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
          setIsGeneratingPrd(false)
          clearActivePrdRun()
          setPrdSource('')
          setPrdMessage(run?.error || 'PRD generation failed')
          const params = new URLSearchParams(searchParams)
          params.delete('prd_run_id')
          navigate(`?${params.toString()}`, { replace: true })
          return
        }
        if (run?.status === 'stopped') {
          setIsGeneratingPrd(false)
          clearActivePrdRun()
          setPrdSource('')
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
      window.setTimeout(poll, 2000)
    }
    poll()
    return () => {
      stopped = true
    }
  }, [isGeneratingPrd, prdRunId, orgId, projectId])

  useEffect(() => {
    if (!isGeneratingSchema || !schemaRunId || !orgId || !projectId || !intakeId) return undefined
    let stopped = false
    const poll = async () => {
      try {
        const run = await getSchemaFlowRunStatus(orgId, projectId, schemaRunId)
        if (stopped) return
        const status = run?.status || ''
        setSchemaRunStatus(status)
        setSchemaRunSteps(Array.isArray(run?.steps) ? run.steps : [])
        if (status === 'completed') {
          setIsGeneratingSchema(false)
          setSchemaMessage('Schema plan generated.')
          setSchemaExists(true)
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
            const latestSchema = await getSchemaFlow(orgId, projectId, intakeId)
            if (!stopped) {
              setSchemaExists(Boolean(latestSchema?.exists))
              setSchemaSummary(String(latestSchema?.summary || ''))
              setSchemaRunStatus('completed')
              const versionsResp = await getSchemaFlowVersions(orgId, projectId, intakeId)
              const items = Array.isArray(versionsResp?.items) ? versionsResp.items : []
              setSchemaVersions(items)
              const latestVer = latestSchema?.version ?? items?.[0]?.version_number
              setSelectedSchemaVersion(latestVer ? String(latestVer) : '')
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
      window.setTimeout(poll, 2000)
    }
    poll()
    return () => {
      stopped = true
    }
  }, [isGeneratingSchema, schemaRunId, orgId, projectId, intakeId])

  useEffect(() => {
    if (!isGeneratingUsecase || !usecaseRunId || !orgId || !projectId || !intakeId) return undefined
    let stopped = false
    const poll = async () => {
      try {
        const run = await getUsecaseFlowRunStatus(orgId, projectId, usecaseRunId)
        if (stopped) return
        const status = run?.status || ''
        setUsecaseRunStatus(status)
        setUsecaseRunSteps(Array.isArray(run?.steps) ? run.steps : [])
        if (status === 'completed') {
          setIsGeneratingUsecase(false)
          setUsecaseMessage('Use case diagram generated.')
          setUsecaseExists(true)
          try {
            const latest = await getUsecaseFlow(orgId, projectId, intakeId)
            if (!stopped) {
              setUsecaseExists(Boolean(latest?.exists))
              setUsecaseSummary(String(latest?.summary || ''))
              setUsecaseRunStatus('completed')
              const versionsResp = await getUsecaseFlowVersions(orgId, projectId, intakeId)
              const items = Array.isArray(versionsResp?.items) ? versionsResp.items : []
              setUsecaseVersions(items)
              const latestVer = latest?.version ?? items?.[0]?.version_number
              setSelectedUsecaseVersion(latestVer ? String(latestVer) : '')
            }
          } catch {
            // ignore summary load failure
          }
          return
        }
        if (status === 'failed') {
          setIsGeneratingUsecase(false)
          setUsecaseMessage(run?.error || 'Use case generation failed')
          return
        }
        if (status === 'stopped') {
          setIsGeneratingUsecase(false)
          setUsecaseMessage(run?.error || 'Use case generation stopped')
          return
        }
      } catch (error) {
        if (stopped) return
        setIsGeneratingUsecase(false)
        setUsecaseMessage(error instanceof Error ? error.message : 'Failed to poll use case run status')
      }
      window.setTimeout(poll, 2000)
    }
    poll()
    return () => {
      stopped = true
    }
  }, [isGeneratingUsecase, usecaseRunId, orgId, projectId, intakeId])

  useEffect(() => {
    let mounted = true
    const applyStatusToUI = (data, currentIntakeId) => {
      setIntakeId(currentIntakeId)
      setStructuredPartial(data?.structured_partial || null)
      const nextQuestions = data?.questions || []
      const missing = data?.missing_fields || []
      const lowQuality = data?.low_quality_fields || []
      setQuestions(nextQuestions)
      setQuestionFields([...missing, ...lowQuality])
      setCurrentQuestionIndex(0)

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
          try {
            const latestLlmPrd = await getLatestLlmPrd(orgId, projectId)
            if (mounted && latestLlmPrd?.content) {
              setPrdContent(latestLlmPrd.content)
              setPrdSource('LLM-10STEP')
              setPrdVersion(latestLlmPrd.version ?? null)
            }
          } catch {
            // fallback to requirements PRD
          }
          try {
            const prd = await getRequirementsPrd(orgId, projectId, activeIntakeId)
            if (mounted && prd?.content) {
              setPrdContent(prd.content)
              setPrdSource('SAVED')
              setPrdVersion(prd.version ?? null)
            }
          } catch {
            // ignore missing PRD
          }
          try {
            const latestSdd = await getLatestRequirementsSystemDesign(orgId, projectId)
            if (mounted && latestSdd?.content) {
              setSddContent(latestSdd.content)
              setSddVersion(latestSdd.version ?? null)
            }
          } catch {
            try {
              const sdd = await getRequirementsSystemDesign(orgId, projectId, activeIntakeId)
              if (mounted && sdd?.content) {
                setSddContent(sdd.content)
                setSddVersion(sdd.version ?? null)
              }
            } catch {
              // ignore missing SDD
            }
          }
          try {
            const schema = await getSchemaFlow(orgId, projectId, activeIntakeId)
            if (mounted && schema?.exists) {
              setSchemaExists(true)
              setSchemaSummary(String(schema?.summary || ''))
              setSchemaRunStatus('completed')
              setSchemaMessage('Schema plan generated.')
              const versionsResp = await getSchemaFlowVersions(orgId, projectId, activeIntakeId)
              const items = Array.isArray(versionsResp?.items) ? versionsResp.items : []
              setSchemaVersions(items)
              const latestVer = schema?.version ?? items?.[0]?.version_number
              setSelectedSchemaVersion(latestVer ? String(latestVer) : '')
            }
          } catch {
            // ignore missing schema plan
          }
          try {
            const usecase = await getUsecaseFlow(orgId, projectId, activeIntakeId)
            if (mounted && usecase?.exists) {
              setUsecaseExists(true)
              setUsecaseSummary(String(usecase?.summary || ''))
              setUsecaseRunStatus('completed')
              setUsecaseMessage('Use case diagram generated.')
              const versionsResp = await getUsecaseFlowVersions(orgId, projectId, activeIntakeId)
              const items = Array.isArray(versionsResp?.items) ? versionsResp.items : []
              setUsecaseVersions(items)
              const latestVer = usecase?.version ?? items?.[0]?.version_number
              setSelectedUsecaseVersion(latestVer ? String(latestVer) : '')
            }
          } catch {
            // ignore missing use case diagram
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
          setPrdRunId(activeRun.runId)
          setPrdRunStatus(activeRun.status)
          setIsGeneratingPrd(true)
          setPrdMessage(`Resuming PRD run: ${activeRun.runId}`)
        }
      } catch {
        try {
          const latestLlmPrd = await getLatestLlmPrd(orgId, projectId)
          if (!mounted || !latestLlmPrd?.content) return
          setPhase('done')
          setPrdContent(latestLlmPrd.content)
          setPrdSource('LLM-10STEP')
          setPrdVersion(latestLlmPrd.version ?? null)
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
      const result = await startRequirements(orgId, projectId, typedText)
      setIntakeId(result.intake_id)
      setStructuredPartial(result.structured_partial || null)
      navigate(`?intake_id=${encodeURIComponent(result.intake_id)}`, { replace: true })
      const missing = result.missing_fields || []
      const lowQuality = result.low_quality_fields || []
      const combinedFields = [...missing, ...lowQuality]
      const nextQuestions = result.questions || []
      setQuestions(nextQuestions)
      setQuestionFields(combinedFields)
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

    const fieldKey = questionFields[currentQuestionIndex] || `answer_${currentQuestionIndex}`
    const nextAnswers = { ...answers, [fieldKey]: answerText }
    setAnswers(nextAnswers)
    setCurrentAnswer('')

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1)
      return
    }

    if (!intakeId) {
      setPhase('done')
      return
    }

    setPhase('loading')
    setSubmitError('')
    try {
      const result = await respondRequirements(orgId, projectId, intakeId, nextAnswers)
      setStructuredPartial(result.structured_partial || null)
      const missing = result.missing_fields || []
      const lowQuality = result.low_quality_fields || []
      const combinedFields = [...missing, ...lowQuality]
      const nextQuestions = result.questions || []

      if (result.ready_for_prd || nextQuestions.length === 0) {
        setPhase('done')
      } else {
        setAnswers({})
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

  const handleInputReset = () => {
    setTypedText('')
    setQuestions([])
    setQuestionFields([])
    setCurrentQuestionIndex(0)
    setCurrentAnswer('')
    setAnswers({})
    setStructuredPartial(null)
    setIntakeId('')
    setSubmitError('')
    setIsGeneratingPrd(false)
    setPrdRunId('')
    setPrdRunStatus('')
    setPrdRunSteps([])
    setPrdVersion(null)
    setPrdMessage('')
    setPrdContent('')
    setIsLoadingFinalPrd(false)
    setPrdSource('')
    setPrdClarifications([])
    setPrdDraftPayload(null)
    setClarificationAnswers({})
    setIsGeneratingSdd(false)
    setSddContent('')
    setSddVersion(null)
    setSddMessage('')
    setIsGeneratingSchema(false)
    setSchemaRunId('')
    setSchemaRunStatus('')
    setSchemaRunSteps([])
    setSchemaSummary('')
    setSchemaMessage('')
    setSchemaExists(false)
    setSchemaVersions([])
    setSelectedSchemaVersion('')
    clearActiveSddRun()
    clearActiveSchemaRun()
    clearActivePrdRun()
    setPhase('draft')
    navigate('', { replace: true })
  }

  const handleGeneratePrd = async () => {
    if (!orgId || !projectId || !intakeId) return
    setPrdMessage('')
    setIsGeneratingPrd(true)
    setIsLoadingFinalPrd(false)
    setPrdClarifications([])
    setPrdSource('')
    setPrdRunId('')
    setPrdRunStatus('')
    setPrdRunSteps([])
    try {
      const baseResult = await generateRequirementsPrd(orgId, projectId, intakeId)
      setPrdVersion(baseResult?.version ?? null)

      const title = (structuredPartial?.project_name || typedText?.slice(0, 80) || 'Untitled Project').trim()
      const problemStatement = (structuredPartial?.problem_statement || typedText || '').trim()
      const targetUsers = Array.isArray(structuredPartial?.target_users)
        ? structuredPartial.target_users.join(', ')
        : ''
      const features = Array.isArray(structuredPartial?.desired_features)
        ? structuredPartial.desired_features.filter(Boolean)
        : []

      const run = await startLlmPrdRun(orgId, projectId, {
        title,
        problem_statement: problemStatement,
        target_users: targetUsers,
        features,
        additional_notes: baseResult?.content || '',
      })
      if (run?.status === 'clarification_required') {
        setIsGeneratingPrd(false)
        setPrdRunId('')
        setPrdRunStatus('')
        setPrdRunSteps([])
        setPrdDraftPayload({
          title,
          problem_statement: problemStatement,
          target_users: targetUsers,
          features,
          additional_notes: baseResult?.content || '',
        })
        setPrdClarifications(Array.isArray(run?.questions) ? run.questions : [])
        setPrdMessage('PRD clarification is required before run start.')
        return
      }
      if (!run?.run_id) throw new Error('Failed to start PRD run')
      setPrdClarifications([])
      setPrdDraftPayload(null)
      setClarificationAnswers({})
      setPrdRunId(run.run_id)
      setPrdRunStatus(run.status || 'queued')
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
      setPrdSource('')
      setPrdClarifications([])
      setPrdMessage(error instanceof Error ? error.message : 'Failed to generate PRD')
      setIsGeneratingPrd(false)
      clearActivePrdRun()
    }
  }

  const handleSubmitPrdClarifications = async () => {
    if (!orgId || !projectId || !prdDraftPayload || prdClarifications.length === 0) return
    const unanswered = prdClarifications.some((q) => !String(clarificationAnswers[q] || '').trim())
    if (unanswered) {
      setPrdMessage('Please answer all clarification questions.')
      return
    }

    setIsSubmittingClarifications(true)
    setPrdMessage('')
    try {
      const result = await respondLlmPrdClarification(orgId, projectId, {
        draft: prdDraftPayload,
        answers: clarificationAnswers,
      })
      if (result?.status === 'clarification_required') {
        setPrdClarifications(result?.questions || [])
        setPrdSource('')
        setPrdMessage('More clarification is required.')
      } else {
        if (!result?.run_id) throw new Error('Failed to start PRD run after clarification')
        setPrdClarifications([])
        setPrdDraftPayload(null)
        setClarificationAnswers({})
        setPrdRunId(result.run_id)
        setPrdRunStatus(result.status || 'queued')
        setIsGeneratingPrd(true)
        setActivePrdRun({
          runId: result.run_id,
          orgId,
          projectId,
          status: result.status || 'queued',
        })
        setPrdSource('')
        setPrdMessage(`PRD run started: ${result.run_id}`)
        const params = new URLSearchParams(searchParams)
        if (intakeId) params.set('intake_id', intakeId)
        params.set('prd_run_id', result.run_id)
        navigate(`?${params.toString()}`, { replace: true })
      }
    } catch (error) {
      setPrdMessage(error instanceof Error ? error.message : 'Failed to submit clarification answers')
    } finally {
      setIsSubmittingClarifications(false)
    }
  }

  const handleGenerateSdd = async () => {
    if (!orgId || !projectId || !intakeId) return
    const startedAt = Date.now()
    setActiveSddRun({ orgId, projectId, intakeId, startedAt, status: 'running', runId: '' })
    setIsGeneratingSdd(true)
    setSddMessage('')
    try {
      const run = await startRequirementsSystemDesignRun(orgId, projectId, intakeId)
      if (!run?.run_id) {
        throw new Error('Failed to start SDD run')
      }
      setActiveSddRun({ orgId, projectId, intakeId, startedAt, status: run.status || 'queued', runId: run.run_id })
      setSddMessage(`SDD run started: ${run.run_id}`)
      let completed = false
      while (!completed) {
        const statusResp = await getRequirementsSystemDesignRunStatus(orgId, projectId, run.run_id)
        const status = statusResp?.status || 'running'
        if (status === 'completed') {
          completed = true
          const latestSdd = await getLatestRequirementsSystemDesign(orgId, projectId)
          setSddContent(latestSdd?.content || '')
          setSddVersion(latestSdd?.version ?? null)
          setSddMessage('System Design Document generated.')
          setActiveSddRun({
            orgId,
            projectId,
            intakeId,
            startedAt,
            status: 'completed',
            runId: run.run_id,
            message: 'System Design Document generated.',
          })
          window.setTimeout(() => clearActiveSddRun(), 5000)
          break
        }
        if (status === 'failed') {
          throw new Error(statusResp?.error || 'SDD run failed')
        }
        if (status === 'stopped') {
          throw new Error(statusResp?.error || 'SDD run stopped')
        }
        await new Promise((resolve) => window.setTimeout(resolve, 2000))
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Failed to generate System Design Document'
      const stopped = String(errMsg).toLowerCase().includes('stopped')
      setSddMessage(errMsg)
      setActiveSddRun({
        orgId,
        projectId,
        intakeId,
        startedAt,
        status: stopped ? 'stopped' : 'failed',
        runId: '',
        message: errMsg,
      })
    } finally {
      setIsGeneratingSdd(false)
    }
  }

  const handleGenerateSchemaPlan = async () => {
    if (!orgId || !projectId || !intakeId || isGeneratingSchema) return
    const startedAt = Date.now()
    setIsGeneratingSchema(true)
    setSchemaMessage('')
    setSchemaRunSteps([])
    setSchemaSummary('')
    setSchemaExists(false)
    setSchemaVersions([])
    setSelectedSchemaVersion('')
    setActiveSchemaRun({ orgId, projectId, intakeId, startedAt, status: 'running', runId: '' })
    try {
      const run = await startSchemaFlowRun(orgId, projectId, intakeId, {
        request: 'Generate initial database schema plan from requirements and architecture inputs.',
        nodes: [],
        edges: [],
      })
      if (!run?.run_id) throw new Error('Failed to start schema run')
      setSchemaRunId(run.run_id)
      setSchemaRunStatus(run.status || 'queued')
      setSchemaMessage(`Schema run started: ${run.run_id}`)
      setActiveSchemaRun({
        orgId,
        projectId,
        intakeId,
        startedAt,
        status: run.status || 'queued',
        runId: run.run_id,
      })
    } catch (error) {
      setSchemaMessage(error instanceof Error ? error.message : 'Failed to start schema generation')
      setActiveSchemaRun({
        orgId,
        projectId,
        intakeId,
        startedAt,
        status: 'failed',
        runId: '',
        message: error instanceof Error ? error.message : 'Failed to start schema generation',
      })
      setIsGeneratingSchema(false)
    }
  }

  const handleSchemaVersionChange = async (value) => {
    if (!value || !orgId || !projectId || !intakeId) return
    setSelectedSchemaVersion(value)
    try {
      const versionDoc = await getSchemaFlowVersion(orgId, projectId, intakeId, Number(value))
      setSchemaExists(Boolean(versionDoc?.exists ?? true))
      setSchemaSummary(String(versionDoc?.summary || ''))
      setSchemaMessage(`Schema version ${value} loaded.`)
      setSchemaRunStatus('completed')
    } catch (error) {
      setSchemaMessage(error instanceof Error ? error.message : 'Failed to load schema version')
    }
  }

  const handleGenerateUsecaseDiagram = async () => {
    if (!orgId || !projectId || !intakeId || isGeneratingUsecase) return
    setIsGeneratingUsecase(true)
    setUsecaseMessage('')
    setUsecaseRunSteps([])
    setUsecaseSummary('')
    setUsecaseExists(false)
    setUsecaseVersions([])
    setSelectedUsecaseVersion('')
    try {
      const run = await startUsecaseFlowRun(orgId, projectId, intakeId, {
        request: 'Generate initial use case interaction diagram from requirements and architecture inputs.',
        nodes: [],
        edges: [],
      })
      if (!run?.run_id) throw new Error('Failed to start use case run')
      setUsecaseRunId(run.run_id)
      setUsecaseRunStatus(run.status || 'queued')
      setUsecaseMessage(`Use case run started: ${run.run_id}`)
    } catch (error) {
      setUsecaseMessage(error instanceof Error ? error.message : 'Failed to start use case generation')
      setIsGeneratingUsecase(false)
    }
  }

  const handleUsecaseVersionChange = async (value) => {
    if (!value || !orgId || !projectId || !intakeId) return
    setSelectedUsecaseVersion(value)
    try {
      const versionDoc = await getUsecaseFlowVersion(orgId, projectId, intakeId, Number(value))
      setUsecaseExists(Boolean(versionDoc?.exists ?? true))
      setUsecaseSummary(String(versionDoc?.summary || ''))
      setUsecaseMessage(`Use case version ${value} loaded.`)
      setUsecaseRunStatus('completed')
    } catch (error) {
      setUsecaseMessage(error instanceof Error ? error.message : 'Failed to load use case version')
    }
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <Box p="6">
      <Container size="4">
        <Flex direction="column" align="center" gap="6" style={{ width: '100%' }}>
          {orgId && projectId && !isInsideDashboard && (
            <Flex justify="end" style={{ width: '100%' }}>
              <Button size="2" variant="soft" asChild>
                <Link to={`/organizations/${orgId}/projects/${projectId}/dashboard`}>Assistant</Link>
              </Button>
            </Flex>
          )}

          <Flex direction="column" align="center" gap="4" style={{ width: '100%' }}>
            <Heading size="8" align="center">What do you want to make?</Heading>

            <Flex
              direction="column"
              style={{
                width: '100%',
                borderRadius: 'var(--radius-3)',
                border: '1px solid var(--gray-6)',
                background: 'var(--color-panel-solid)',
                overflow: 'hidden',
              }}
            >
              <TextArea
                ref={textAreaRef}
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder="Describe your product idea and requirements."
                size="3"
                variant="ghost"
                rows={6}
                style={{
                  minHeight: 140,
                  resize: 'none',
                  width: '100%',
                  border: 'none',
                  boxShadow: 'none',
                  overflow: 'hidden',
                }}
              />
              <Flex
                align="center"
                justify="between"
                gap="3"
                p="2"
                wrap="wrap"
                style={{ borderTop: '1px solid var(--gray-6)' }}
              >
                <IconButton variant="soft" size="3" radius="full" aria-label="Upload file">
                  <UploadIcon width="20" height="20" />
                </IconButton>
                <Flex align="center" gap="2">
                  <Button size="2" variant="soft" color="gray" onClick={handleInputReset}>Reset</Button>
                  <Select.Root size="3" defaultValue="default">
                    <Select.Trigger variant="soft" style={{ minWidth: 180 }} />
                    <Select.Content>
                      <Select.Item value="default">Default</Select.Item>
                    </Select.Content>
                  </Select.Root>
                  <IconButton
                    variant="soft"
                    size="3"
                    radius="full"
                    aria-label="Submit"
                    onClick={handleSubmit}
                    disabled={!typedText.trim() || phase === 'loading'}
                  >
                    <ArrowUpIcon width="20" height="20" />
                  </IconButton>
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <Flex direction="column" gap="4" style={{ width: '100%', minHeight: 220 }}>
            {phase === 'loading' ? (
              <Flex direction="column" align="center" gap="4" p="8">
                <Spinner size="3" />
                <Text size="2" color="gray">Analyzing your requirements…</Text>
              </Flex>
            ) : null}

            {submitError ? (
              <Text size="2" color="red">{submitError}</Text>
            ) : null}

            {phase === 'questions' && currentQuestion ? (
              <Flex
                direction="column"
                align="center"
                gap="3"
                p="3"
                style={{ width: '100%', maxWidth: 680, marginInline: 'auto', alignSelf: 'center' }}
              >
                <Flex
                  direction="column"
                  align="center"
                  gap="3"
                  style={{ width: '100%' }}
                >
                  <Text size="1" color="gray">Question {currentQuestionIndex + 1} of {questions.length}</Text>
                  <Heading size="4" align="center">{currentQuestion}</Heading>
                  <Flex direction="column" gap="3" style={{ width: '100%', alignSelf: 'stretch' }}>
                    <TextField.Root
                      size="3"
                      placeholder="Enter your answer"
                      value={currentAnswer}
                      onChange={(event) => setCurrentAnswer(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') handleAnswer()
                      }}
                    />
                    <Flex justify="center">
                      <Button size="3" onClick={handleAnswer} disabled={!currentAnswer.trim()}>
                        {currentQuestionIndex + 1 < questions.length ? 'Next' : 'Submit answers'}
                      </Button>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            ) : null}

            {phase === 'done' ? (
              <Flex
                direction="column"
                align="center"
                gap="4"
                p="6"
                style={{ width: '100%', minWidth: 0 }}
              >
                <Heading size="4">Requirements Captured</Heading>
                <Text size="2" color="gray" align="center">
                  Clarification is complete. You can continue to PRD generation.
                </Text>
               
             
          
                {Object.keys(answers).length > 0 ? (
                  <Flex direction="column" gap="2" style={{ width: '100%' }}>
                    {Object.entries(answers).map(([key, value]) => (
                      <Box
                        key={key}
                        p="2"
                        style={{
                          width: '100%',
                          border: '1px solid var(--gray-6)',
                          borderRadius: 'var(--radius-2)',
                          background: 'var(--gray-2)',
                          minWidth: 0,
                        }}
                      >
                        <Text
                          size="1"
                          color="gray"
                          style={{ display: 'block', wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                        >
                          {toLabel(String(key))}
                        </Text>
                        <Box mt="2" style={{ minWidth: 0 }}>
                          <Text size="2" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                            {String(value)}
                          </Text>
                        </Box>
                      </Box>
                    ))}
                  </Flex>
                ) : structuredPartial ? (
                  <Box style={{ width: '100%',overflowY: 'auto', overflowX: 'hidden', minWidth: 0 }}>
                    <Flex direction="column" gap="3" style={{ width: '100%', minWidth: 0 }}>
                    {Object.entries(structuredPartial).map(([key, value]) => (
                      <Box
                        key={key}
                        p="3"
                        style={{
                          width: '100%',
                          border: '1px solid var(--gray-6)',
                          borderRadius: 'var(--radius-2)',
                          background: 'var(--gray-2)',
                          minWidth: 0,
                        }}
                      >
                        <Text size="1" color="gray">{toLabel(key)}</Text>
                        <Box mt="2">
                          <FieldValue value={value} />
                        </Box>
                      </Box>
                    ))}
                    </Flex>
                  </Box>
                ) : null}
                {!prdContent && (
                  <Flex justify="start" style={{ width: '100%' }}>
                    <Button
                      size="3"
                      onClick={handleGeneratePrd}
                      disabled={!intakeId || isGeneratingPrd}
                    >
                      {isGeneratingPrd ? 'Generating PRD...' : 'Make PRD'}
                    </Button>
                  </Flex>
                )}
                {prdClarifications.length > 0 ? (
                  <Box
                    p="3"
                    style={{
                      width: '100%',
                      border: '1px solid var(--amber-6)',
                      borderRadius: 'var(--radius-2)',
                      background: 'var(--amber-2)',
                    }}
                  >
                    <Text size="1" color="amber">LLM Clarification Questions</Text>
                    <Flex direction="column" gap="3" mt="2">
                      {prdClarifications.map((question, idx) => (
                        <Box key={`${question}-${idx}`}>
                          <Text size="2">
                            {idx + 1}. {question}
                          </Text>
                          <TextArea
                            mt="2"
                            size="2"
                            value={clarificationAnswers[question] || ''}
                            onChange={(event) =>
                              setClarificationAnswers((prev) => ({ ...prev, [question]: event.target.value }))
                            }
                            placeholder="Enter your answer"
                            style={{ minHeight: 76 }}
                          />
                        </Box>
                      ))}
                      <Flex justify="end">
                        <Button
                          size="2"
                          onClick={handleSubmitPrdClarifications}
                          disabled={isSubmittingClarifications}
                        >
                          {isSubmittingClarifications ? 'Submitting...' : 'Submit clarification answers'}
                        </Button>
                      </Flex>
                    </Flex>
                  </Box>
                ) : null}
                {(isGeneratingPrd || isLoadingFinalPrd || prdContent) ? (
                  <Box
                    p="3"
                    style={{
                      width: '100%',
                      border: '1px solid var(--gray-6)',
                      borderRadius: 'var(--radius-2)',
                      background: 'var(--color-panel-solid)',
                    }}
                  >
                    <Flex align="center" justify="between" gap="3" wrap="wrap">
                      <Flex align="center" gap="2">
                        {(isGeneratingPrd || isLoadingFinalPrd) ? <Spinner size="2" /> : null}
                        <Text size="2" weight="medium">Product Requirements Document</Text>
                      </Flex>
                      <Flex align="center" gap="2">
                        {isGeneratingPrd ? <Badge color="blue">Running</Badge> : null}
                        {isLoadingFinalPrd ? <Badge color="amber">Finalizing</Badge> : null}
                        {!isGeneratingPrd && !isLoadingFinalPrd && prdContent ? <Badge color="green">Completed</Badge> : null}
                        {prdSource ? <Badge color="green">{prdSource}</Badge> : null}
                        {prdContent ? (
                          <Button
                            size="1"
                            variant="soft"
                            onClick={() =>
                              navigate(`/organizations/${orgId}/projects/${projectId}/dashboard/prd-view`, {
                                state: { prdMarkdown: prdContent, prdVersion },
                              })
                            }
                          >
                            Open In Doc View
                          </Button>
                        ) : null}
                        {prdContent ? (
                          <Button
                            size="1"
                            variant="soft"
                            color="indigo"
                            onClick={handleGeneratePrd}
                            disabled={!intakeId || isGeneratingPrd || isLoadingFinalPrd}
                          >
                            {isGeneratingPrd || isLoadingFinalPrd ? 'Regenerating…' : 'Regenerate PRD'}
                          </Button>
                        ) : null}
                      </Flex>
                    </Flex>
                    {(isGeneratingPrd || isLoadingFinalPrd) ? (
                      <Box mt="3">
                        <Skeleton style={{ height: 14, width: '58%', marginBottom: 10 }} />
                        <Skeleton style={{ height: 12, width: '92%', marginBottom: 8 }} />
                        <Skeleton style={{ height: 12, width: '88%', marginBottom: 8 }} />
                        <Skeleton style={{ height: 12, width: '84%' }} />
                      </Box>
                    ) : null}
                    {!isGeneratingPrd && !isLoadingFinalPrd && prdContent ? (
                      <Box mt="2">
                        <Text size="1" color="gray">
                          PRD is ready. Use Doc View to see the full content and step-by-step result.
                        </Text>
                      </Box>
                    ) : null}
                    {isGeneratingPrd && prdRunSteps.length > 0 ? (
                      <Box mt="3">
                        <Text size="1" color="gray" style={{ display: 'block', marginBottom: 6 }}>
                          Step Completion
                        </Text>
                        <Flex direction="column" gap="2">
                          {prdRunSteps.map((s, idx) => (
                            <Box key={`${s.stage || 'stage'}-${idx}`}>
                              <Flex justify="between" align="center">
                                <Text size="1">{String(s.stage || 'stage')}</Text>
                                <Badge
                                  size="1"
                                  color={
                                    s.status === 'completed'
                                      ? 'green'
                                      : s.status === 'running'
                                        ? 'blue'
                                        : s.status === 'paused'
                                          ? 'amber'
                                          : s.status === 'stopped'
                                            ? 'amber'
                                            : s.status === 'failed'
                                              ? 'red'
                                              : 'gray'
                                  }
                                >
                                  {s.status || 'queued'}
                                </Badge>
                              </Flex>
                            </Box>
                          ))}
                        </Flex>
                      </Box>
                    ) : null}
                  </Box>
                ) : null}
                {!isGeneratingPrd && !isLoadingFinalPrd && prdContent && !sddContent ? (
                  <Flex justify="start" style={{ width: '100%' }}>
                    <Button
                      size="2"
                      variant="solid"
                      color="indigo"
                      onClick={handleGenerateSdd}
                      disabled={!intakeId || isGeneratingSdd}
                    >
                      {isGeneratingSdd ? 'Generating SDD…' : 'Generate System Design Document (SDD)'}
                    </Button>
                  </Flex>
                ) : null}
                {(isGeneratingSdd || sddContent || sddMessage) ? (
                  <Box
                    p="3"
                    style={{
                      width: '100%',
                      border: '1px solid var(--gray-6)',
                      borderRadius: 'var(--radius-2)',
                      background: 'var(--color-panel-solid)',
                    }}
                  >
                    <Flex align="center" justify="between" gap="3" wrap="wrap">
                      <Flex align="center" gap="2">
                        {isGeneratingSdd ? <Spinner size="2" /> : null}
                        <Text size="2" weight="medium">System Design Document</Text>
                      </Flex>
                      <Flex align="center" gap="2">
                        {isGeneratingSdd ? <Badge color="blue">Running</Badge> : null}
                        {!isGeneratingSdd && sddContent ? <Badge color="green">Completed</Badge> : null}
                        {sddVersion ? <Badge color="green">Version {sddVersion}</Badge> : null}
                        {sddContent ? (
                          <Button
                            size="1"
                            variant="soft"
                            onClick={() =>
                              navigate(`/organizations/${orgId}/projects/${projectId}/dashboard/prd-view?type=sdd`, {
                                state: {
                                  docType: 'SDD',
                                  docMarkdown: sddContent,
                                  docVersion: sddVersion,
                                },
                              })
                            }
                          >
                            Open In Doc View
                          </Button>
                        ) : null}
                        {sddContent ? (
                          <Button
                            size="1"
                            variant="soft"
                            color="indigo"
                            onClick={handleGenerateSdd}
                            disabled={!intakeId || isGeneratingSdd}
                          >
                            {isGeneratingSdd ? 'Regenerating…' : 'Regenerate SDD'}
                          </Button>
                        ) : null}
                      </Flex>
                    </Flex>
                    {isGeneratingSdd ? (
                      <Box mt="3">
                        <Skeleton style={{ height: 14, width: '52%', marginBottom: 10 }} />
                        <Skeleton style={{ height: 12, width: '86%', marginBottom: 8 }} />
                        <Skeleton style={{ height: 12, width: '82%', marginBottom: 8 }} />
                        <Skeleton style={{ height: 12, width: '78%' }} />
                      </Box>
                    ) : null}
                    {sddMessage ? (
                      <Box mt="2">
                        <Text size="1" color="gray">{sddMessage}</Text>
                      </Box>
                    ) : null}
                  </Box>
                ) : null}
                {!isGeneratingSdd && sddContent && !schemaExists && !isGeneratingSchema ? (
                  <Flex justify="start" style={{ width: '100%' }}>
                    <Button
                      size="2"
                      variant="solid"
                      color="indigo"
                      onClick={handleGenerateSchemaPlan}
                      disabled={isGeneratingSchema}
                    >
                      Generate Schema Plan
                    </Button>
                  </Flex>
                ) : null}
                {(isGeneratingSchema || schemaExists || schemaSummary || schemaMessage || schemaRunStatus) ? (
                  <Box
                    p="3"
                    style={{
                      width: '100%',
                      border: '1px solid var(--gray-6)',
                      borderRadius: 'var(--radius-2)',
                      background: 'var(--color-panel-solid)',
                    }}
                  >
                    <Flex align="center" justify="between" gap="3" wrap="wrap">
                      <Flex align="center" gap="2">
                        {isGeneratingSchema ? <Spinner size="2" /> : null}
                        <Text size="2" weight="medium">Schema Plan</Text>
                      </Flex>
                      <Flex align="center" gap="2">
                        {isGeneratingSchema ? <Badge color="blue">Running</Badge> : null}
                        {!isGeneratingSchema && schemaRunStatus === 'completed' ? <Badge color="green">Completed</Badge> : null}
                        {!isGeneratingSchema && schemaRunStatus === 'failed' ? <Badge color="red">Failed</Badge> : null}
                        {schemaRunId ? <Badge color="gray">Run {schemaRunId.slice(-6)}</Badge> : null}
                        {schemaExists ? (
                          <Button
                            size="1"
                            variant="soft"
                            color="indigo"
                            onClick={handleGenerateSchemaPlan}
                            disabled={isGeneratingSchema}
                          >
                            {isGeneratingSchema ? 'Regenerating…' : 'Regenerate'}
                          </Button>
                        ) : null}
                        {selectedSchemaVersion ? <Badge color="gray">{`Version ${selectedSchemaVersion}`}</Badge> : null}
                        {schemaExists ? (
                          <Button
                            size="1"
                            variant="soft"
                            onClick={() => {
                              const versionQuery = selectedSchemaVersion ? `&version=${encodeURIComponent(selectedSchemaVersion)}` : ''
                              const intakeQuery = intakeId ? `?intake_id=${encodeURIComponent(intakeId)}${versionQuery}` : ''
                              navigate(`/organizations/${orgId}/projects/${projectId}/mvp/doc/2${intakeQuery}`)
                            }}
                          >
                            Open Schema View
                          </Button>
                        ) : null}
                      </Flex>
                    </Flex>
                    {isGeneratingSchema ? (
                      <Box mt="3">
                        <Skeleton style={{ height: 14, width: '48%', marginBottom: 10 }} />
                        <Skeleton style={{ height: 12, width: '84%', marginBottom: 8 }} />
                        <Skeleton style={{ height: 12, width: '80%', marginBottom: 8 }} />
                        <Skeleton style={{ height: 12, width: '76%' }} />
                      </Box>
                    ) : null}
                    {schemaMessage ? (
                      <Box mt="2">
                        <Text size="1" color={schemaRunStatus === 'failed' ? 'red' : 'gray'}>{schemaMessage}</Text>
                      </Box>
                    ) : null}
                 
                    {isGeneratingSchema && schemaRunSteps.length > 0 ? (
                      <Box mt="3">
                        <Text size="1" color="gray" style={{ display: 'block', marginBottom: 6 }}>
                          Step Completion
                        </Text>
                        <Flex direction="column" gap="2">
                          {schemaRunSteps.map((s, idx) => (
                            <Box key={`${s.stage || 'stage'}-${idx}`}>
                              <Flex justify="between" align="center">
                                <Text size="1">{String(s.stage || 'schema_generation')}</Text>
                                <Badge
                                  size="1"
                                  color={
                                    s.status === 'completed'
                                      ? 'green'
                                      : s.status === 'running'
                                        ? 'blue'
                                        : s.status === 'failed'
                                          ? 'red'
                                          : 'gray'
                                  }
                                >
                                  {s.status || 'queued'}
                                </Badge>
                              </Flex>
                            </Box>
                          ))}
                        </Flex>
                      </Box>
                    ) : null}
                  </Box>
                ) : null}
                {schemaExists && !usecaseExists && !isGeneratingUsecase ? (
                  <Flex justify="start" style={{ width: '100%' }}>
                    <Button
                      size="2"
                      variant="solid"
                      color="indigo"
                      onClick={handleGenerateUsecaseDiagram}
                      disabled={isGeneratingUsecase}
                    >
                      Generate Use Case Diagram
                    </Button>
                  </Flex>
                ) : null}
                {(isGeneratingUsecase || usecaseExists || usecaseSummary || usecaseMessage || usecaseRunStatus) ? (
                  <Box
                    p="3"
                    style={{
                      width: '100%',
                      border: '1px solid var(--gray-6)',
                      borderRadius: 'var(--radius-2)',
                      background: 'var(--color-panel-solid)',
                    }}
                  >
                    <Flex align="center" justify="between" gap="3" wrap="wrap">
                      <Flex align="center" gap="2">
                        {isGeneratingUsecase ? <Spinner size="2" /> : null}
                        <Text size="2" weight="medium">Use Case Diagram</Text>
                      </Flex>
                      <Flex align="center" gap="2">
                        {isGeneratingUsecase ? <Badge color="blue">Running</Badge> : null}
                        {!isGeneratingUsecase && usecaseRunStatus === 'completed' ? <Badge color="green">Completed</Badge> : null}
                        {!isGeneratingUsecase && usecaseRunStatus === 'failed' ? <Badge color="red">Failed</Badge> : null}
                        {usecaseRunId ? <Badge color="gray">Run {usecaseRunId.slice(-6)}</Badge> : null}
                        {selectedUsecaseVersion ? <Badge color="gray">{`Version ${selectedUsecaseVersion}`}</Badge> : null}
                        {usecaseExists ? (
                          <Select.Root value={selectedUsecaseVersion} onValueChange={handleUsecaseVersionChange}>
                            <Select.Trigger size="1" style={{ minWidth: 116 }} placeholder="Version" />
                            <Select.Content>
                              {usecaseVersions.map((v) => (
                                <Select.Item key={String(v.version_number)} value={String(v.version_number)}>
                                  {`Version ${v.version_number}`}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select.Root>
                        ) : null}
                        {usecaseExists ? (
                          <Button
                            size="1"
                            variant="soft"
                            color="indigo"
                            onClick={handleGenerateUsecaseDiagram}
                            disabled={isGeneratingUsecase}
                          >
                            {isGeneratingUsecase ? 'Regenerating…' : 'Regenerate'}
                          </Button>
                        ) : null}
                        {usecaseExists ? (
                          <Button
                            size="1"
                            variant="soft"
                            onClick={() => {
                              const versionQuery = selectedUsecaseVersion ? `&version=${encodeURIComponent(selectedUsecaseVersion)}` : ''
                              const intakeQuery = intakeId ? `?intake_id=${encodeURIComponent(intakeId)}${versionQuery}` : ''
                              navigate(`/organizations/${orgId}/projects/${projectId}/mvp/doc/3${intakeQuery}`)
                            }}
                          >
                            Open Use Case View
                          </Button>
                        ) : null}
                      </Flex>
                    </Flex>
                    {isGeneratingUsecase ? (
                      <Box mt="3">
                        <Skeleton style={{ height: 14, width: '48%', marginBottom: 10 }} />
                        <Skeleton style={{ height: 12, width: '84%', marginBottom: 8 }} />
                        <Skeleton style={{ height: 12, width: '80%', marginBottom: 8 }} />
                        <Skeleton style={{ height: 12, width: '76%' }} />
                      </Box>
                    ) : null}
                    {usecaseMessage ? (
                      <Box mt="2">
                        <Text size="1" color={usecaseRunStatus === 'failed' ? 'red' : 'gray'}>{usecaseMessage}</Text>
                      </Box>
                    ) : null}
                    {isGeneratingUsecase && usecaseRunSteps.length > 0 ? (
                      <Box mt="3">
                        <Text size="1" color="gray" style={{ display: 'block', marginBottom: 6 }}>
                          Step Completion
                        </Text>
                        <Flex direction="column" gap="2">
                          {usecaseRunSteps.map((s, idx) => (
                            <Box key={`${s.stage || 'stage'}-${idx}`}>
                              <Flex justify="between" align="center">
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
                            </Box>
                          ))}
                        </Flex>
                      </Box>
                    ) : null}
                  </Box>
                ) : null}
              </Flex>
            ) : null}
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}
