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
} from '@radix-ui/themes'
import { ArrowUpIcon, UploadIcon } from '@radix-ui/react-icons'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  generateLlmPrd,
  generateRequirementsPrd,
  getLatestRequirementsStatus,
  getRequirementsStatus,
  respondRequirements,
  respondLlmPrdClarification,
  startRequirements,
} from '../../services/requirementsApi'

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
  const [prdVersion, setPrdVersion] = useState(null)
  const [prdMessage, setPrdMessage] = useState('')
  const [prdContent, setPrdContent] = useState('')
  const [prdSource, setPrdSource] = useState('')
  const [prdClarifications, setPrdClarifications] = useState([])
  const [prdDraftPayload, setPrdDraftPayload] = useState(null)
  const [clarificationAnswers, setClarificationAnswers] = useState({})
  const [isSubmittingClarifications, setIsSubmittingClarifications] = useState(false)

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
        setTypedText(problemStatement)
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
      try {
        if (intakeIdParam) {
          const data = await getRequirementsStatus(orgId, projectId, intakeIdParam)
          if (!mounted) return
          applyStatusToUI(data, intakeIdParam)
          return
        }

        const latest = await getLatestRequirementsStatus(orgId, projectId)
        if (!mounted) return
        if (latest?.intake_id) {
          navigate(`?intake_id=${encodeURIComponent(latest.intake_id)}`, { replace: true })
          applyStatusToUI(latest, latest.intake_id)
        }
      } catch {
        // ignore
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
    setPrdVersion(null)
    setPrdMessage('')
    setPrdContent('')
    setPrdSource('')
    setPrdClarifications([])
    setPrdDraftPayload(null)
    setClarificationAnswers({})
    setPhase('draft')
    navigate('', { replace: true })
  }

  const handleGeneratePrd = async () => {
    if (!orgId || !projectId || !intakeId) return
    setPrdMessage('')
    setIsGeneratingPrd(true)
    setPrdClarifications([])
    setPrdSource('')
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

      const llmResult = await generateLlmPrd(orgId, projectId, {
        title,
        problem_statement: problemStatement,
        target_users: targetUsers,
        features,
        additional_notes: baseResult?.content || '',
      })

      if (llmResult?.status === 'clarification_required') {
        setPrdContent('')
        setPrdSource('')
        setPrdClarifications(llmResult?.questions || [])
        setPrdDraftPayload({
          title,
          problem_statement: problemStatement,
          target_users: targetUsers,
          features,
          additional_notes: baseResult?.content || '',
        })
        setClarificationAnswers({})
        setPrdMessage('PRD needs clarification before LLM generation.')
      } else {
        if (!llmResult?.prd_markdown) {
          throw new Error('LLM response did not include prd_markdown')
        }
        setPrdClarifications([])
        setPrdDraftPayload(null)
        setClarificationAnswers({})
        setPrdContent(llmResult.prd_markdown)
        setPrdSource('LLM')
        setPrdMessage('PRD generated successfully from LLM.')
      }
    } catch (error) {
      setPrdContent('')
      setPrdSource('')
      setPrdClarifications([])
      setPrdMessage(error instanceof Error ? error.message : 'Failed to generate PRD')
    } finally {
      setIsGeneratingPrd(false)
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
        if (!result?.prd_markdown) {
          throw new Error('LLM response did not include prd_markdown')
        }
        setPrdClarifications([])
        setPrdDraftPayload(null)
        setClarificationAnswers({})
        setPrdContent(result.prd_markdown)
        setPrdSource('LLM')
        setPrdMessage('PRD generated successfully from LLM.')
      }
    } catch (error) {
      setPrdMessage(error instanceof Error ? error.message : 'Failed to submit clarification answers')
    } finally {
      setIsSubmittingClarifications(false)
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
              <Flex direction="column" align="center" gap="4" p="6" style={{ width: '100%', maxWidth: 680 }}>
                <Text size="1" color="gray">Question {currentQuestionIndex + 1} of {questions.length}</Text>
                <Heading size="4" align="center">{currentQuestion}</Heading>
                <Flex direction="column" gap="3" style={{ width: '100%' }}>
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
                <Flex align="center" gap="3" wrap="wrap">
                  <Button
                    size="3"
                    onClick={handleGeneratePrd}
                    disabled={!intakeId || isGeneratingPrd}
                  >
                    {isGeneratingPrd ? 'Generating PRD...' : 'Make PRD'}
                  </Button>
                  {prdVersion ? <Badge color="green">Version {prdVersion}</Badge> : null}
                </Flex>
                {prdMessage ? (
                  <Text size="2" color={prdVersion ? 'green' : 'red'}>
                    {prdMessage}
                  </Text>
                ) : null}
                {Object.keys(answers).length > 0 ? (
                  <Flex direction="column" gap="2" style={{ width: '100%' }}>
                    {Object.entries(answers).map(([key, value]) => (
                      <Flex key={key} justify="between" align="center" gap="2">
                        <Text size="2" style={{ wordBreak: 'break-word' }}>{key}</Text>
                        <Badge color="green" size="1">{String(value)}</Badge>
                      </Flex>
                    ))}
                  </Flex>
                ) : structuredPartial ? (
                  <Box style={{ width: '100%', maxHeight: '52vh', overflowY: 'auto', overflowX: 'hidden', minWidth: 0 }}>
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
                {prdContent ? (
                  <Box
                    p="3"
                    style={{
                      width: '100%',
                      border: '1px solid var(--gray-6)',
                      borderRadius: 'var(--radius-2)',
                      background: 'var(--color-panel-solid)',
                    }}
                  >
                    <Flex align="center" justify="between">
                      <Text size="1" color="gray">Generated PRD</Text>
                      {prdSource ? <Badge color="green">{prdSource}</Badge> : null}
                    </Flex>
                    <pre
                      style={{
                        margin: '8px 0 0 0',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        maxHeight: '56vh',
                        overflowY: 'auto',
                        fontSize: 12,
                        lineHeight: 1.5,
                      }}
                    >
                      {prdContent}
                    </pre>
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
