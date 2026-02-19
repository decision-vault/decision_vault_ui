import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Flex,
  Heading,
  Text,
  TextArea,
  IconButton,
  Card,
  Link as RadixLink,
  Select,
  Button,
  Spinner,
  Badge,
} from '@radix-ui/themes'
import { ArrowUpIcon, UploadIcon, CheckCircledIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { Link, useParams, useLocation } from 'react-router-dom'

const INITIAL_TEXT = `We are building a SaaS analytics dashboard for startups. Initially we planned to use Next.js for the frontend because of SSR capabilities, but after evaluating performance and developer experience, we are considering switching to Vite with React.

The backend will use FastAPI with PostgreSQL. We expect around 3,000 daily active users in the first six months. The system should support multi-tenant organizations with isolated data.

We need authentication with email/password and JWT. For MVP we do not require offline support. The application will be deployed on AWS in a single region.`

const DECISION_QUESTIONS = [
  { key: 'seo_required', text: 'Is SEO required for this SaaS product?' },
  { key: 'ssr_required', text: 'Is SSR required?' },
  { key: 'build_performance_issue', text: 'Is build performance currently a bottleneck?' },
  { key: 'team_react_experience', text: 'Does the team have stronger React experience?' },
  { key: 'migration_delay_acceptable', text: 'Is migration delay acceptable?' },
]

const TYPING_SPEED_MS = 18
const LOADER_DURATION_MS = 5000
const FINDINGS_DISPLAY_MS = 2500
const MVP_STEP_INTERVAL_MS = 10000
const MVP_STORAGE_KEY = (id) => `dv_mvp_${id}`

const MVP_STEPS = [
  { id: 'prd', title: 'Product Requirements Document (PRD)', description: 'Define features, scope, and acceptance criteria.' },
  { id: 'system-design', title: 'System Design Document', description: 'High-level architecture and component boundaries.' },
  { id: 'db-schema', title: 'Database schema SQL', description: 'Tables, indexes, and migrations.' },
  { id: 'sequence', title: 'Sequence diagrams', description: 'Request flows and interactions.' },
  { id: 'mermaid', title: 'Mermaid architecture diagrams', description: 'Visual system and data flow.' },
  { id: 'terraform', title: 'Deployment Terraform template', description: 'Infrastructure as code for AWS.' },
  { id: 'load-math', title: 'Load estimation math', description: 'Capacity and scaling calculations.' },
  { id: 'api-doc', title: 'API doc', description: 'Endpoints, payloads, and examples.' },
  { id: 'tasks', title: 'Create task', description: 'Breakdown into actionable tasks.' },
  { id: 'threat-model', title: 'Threat model document', description: 'Risks and security controls.' },
]

const EXAMPLES = [
  { id: '1', title: 'CoLabs My Projects Screen', author: 'Ana Boyer', imageCount: 6 },
  { id: '2', title: 'Minimalist sidebar component', author: 'Joshua Guo', imageCount: 1 },
  { id: '3', title: 'Interactive Grocery Mobile App', author: 'Ana Boyer', imageCount: 1 },
]

function ExampleCard({ title, author, imageCount }) {
  return (
    <Card variant="surface" size="2">
      <Flex direction="column" gap="2">
        <Box
          style={{
            aspectRatio: '4/3',
            borderRadius: 'var(--radius-2)',
            background: 'var(--gray-4)',
            overflow: 'hidden',
          }}
        >
          {imageCount > 1 ? (
            <Flex gap="1" wrap="wrap" p="1" style={{ height: '100%' }}>
              {Array.from({ length: Math.min(imageCount, 6) }).map((_, i) => (
                <Box
                  key={i}
                  style={{
                    flex: '1 1 30%',
                    minHeight: 60,
                    background: 'var(--gray-5)',
                    borderRadius: 4,
                  }}
                />
              ))}
            </Flex>
          ) : (
            <Box style={{ width: '100%', height: '100%', background: 'var(--gray-6)' }} />
          )}
        </Box>
        <Text size="2" weight="medium" trim="end">
          {title}
        </Text>
        <Text size="1" color="gray">
          by {author}
        </Text>
      </Flex>
    </Card>
  )
}

export function InputMainPage() {
  const { orgId, projectId } = useParams()
  const location = useLocation()
  const isInsideDashboard = location.pathname.includes('/dashboard')
  const [typedText, setTypedText] = useState('')
  const [phase, setPhase] = useState('typing') // typing | submitted | loading | findings | questions | done
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({
    seo_required: null,
    ssr_required: null,
    build_performance_issue: null,
    team_react_experience: null,
    migration_delay_acceptable: null,
  })
  const [questionVisible, setQuestionVisible] = useState(false)
  const [nextStep, setNextStep] = useState(null) // null | 'mvp' | 'prd'
  const [mvpCompletedStepIndex, setMvpCompletedStepIndex] = useState(-1) // -1 = not started, 0..9 = completed count, 10 = all done
  const textAreaRef = useRef(null)

  // Restore MVP stepper state when returning from doc view (e.g. back from View doc)
  useEffect(() => {
    if (!projectId) return
    try {
      const raw = sessionStorage.getItem(MVP_STORAGE_KEY(projectId))
      if (!raw) return
      const data = JSON.parse(raw)
      if (data.nextStep === 'mvp' && typeof data.mvpCompletedStepIndex === 'number') {
        setPhase('done')
        if (data.answers) setAnswers(data.answers)
        setCurrentQuestionIndex(DECISION_QUESTIONS.length - 1)
        setNextStep('mvp')
        setMvpCompletedStepIndex(Math.min(Math.max(0, data.mvpCompletedStepIndex), 10))
      }
    } catch (_) {}
  }, [projectId])

  // Persist MVP state so back navigation shows completed steps
  useEffect(() => {
    if (!projectId || phase !== 'done' || nextStep !== 'mvp') return
    sessionStorage.setItem(
      MVP_STORAGE_KEY(projectId),
      JSON.stringify({
        phase: 'done',
        answers,
        nextStep: 'mvp',
        mvpCompletedStepIndex,
      })
    )
  }, [projectId, phase, nextStep, mvpCompletedStepIndex, answers])

  // Typing animation
  useEffect(() => {
    if (phase !== 'typing') return
    if (typedText.length >= INITIAL_TEXT.length) {
      setPhase('submitted')
      return
    }
    const t = setTimeout(() => {
      setTypedText(INITIAL_TEXT.slice(0, typedText.length + 1))
    }, TYPING_SPEED_MS)
    return () => clearTimeout(t)
  }, [phase, typedText])

  // Scroll text area to bottom as typing
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight
    }
  }, [typedText])

  // MVP stepper: advance one step every 10s
  useEffect(() => {
    if (nextStep !== 'mvp' || mvpCompletedStepIndex < 0 || mvpCompletedStepIndex >= 10) return
    const t = setInterval(() => {
      setMvpCompletedStepIndex((i) => Math.min(i + 1, 10))
    }, MVP_STEP_INTERVAL_MS)
    return () => clearInterval(t)
  }, [nextStep, mvpCompletedStepIndex])

  const handleSubmit = () => {
    setPhase('loading')
    const loaderTimer = setTimeout(() => {
      setPhase('findings')
      const findingsTimer = setTimeout(() => {
        setPhase('questions')
        setQuestionVisible(true)
      }, FINDINGS_DISPLAY_MS)
      return () => clearTimeout(findingsTimer)
    }, LOADER_DURATION_MS)
    return () => clearTimeout(loaderTimer)
  }

  const handleAnswer = (value) => {
    const key = DECISION_QUESTIONS[currentQuestionIndex].key
    setAnswers((prev) => ({ ...prev, [key]: value }))
    setQuestionVisible(false)
    setTimeout(() => {
      if (currentQuestionIndex < DECISION_QUESTIONS.length - 1) {
        setCurrentQuestionIndex((i) => i + 1)
        setQuestionVisible(true)
      } else {
        setPhase('done')
      }
    }, 300)
  }

  const handleMvpReset = () => {
    if (projectId) sessionStorage.removeItem(MVP_STORAGE_KEY(projectId))
    setNextStep(null)
    setMvpCompletedStepIndex(-1)
  }

  const showExamples = phase === 'typing' || phase === 'submitted'
  const showLoader = phase === 'loading'
  const showFindings = phase === 'findings'
  const showQuestions = phase === 'questions' || (phase === 'done' && currentQuestionIndex < DECISION_QUESTIONS.length)
  const currentQuestion = DECISION_QUESTIONS[currentQuestionIndex]

  return (
    <Box p="6">
      <Flex direction="column" align="center" gap="6" style={{ width: '100%' }}>
        {orgId && projectId && !isInsideDashboard && (
          <Flex justify="end" style={{ width: '100%' }}>
            <Button size="2" variant="soft" color="purple" asChild>
              <Link to={`/organizations/${orgId}/projects/${projectId}/dashboard`}>
                Assistant
              </Link>
            </Button>
          </Flex>
        )}
        <Flex direction="column" align="center" gap="4" style={{ width: '100%' }}>
          <Heading size="8" align="center">
            What do you want to make?
          </Heading>

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
              readOnly={phase === 'typing'}
              onChange={(e) => phase === 'submitted' && setTypedText(e.target.value)}
              placeholder="Describe your idea. Attach a design to guide the result."
              size="3"
              variant="ghost"
              rows={6}
              style={{
                minHeight: 140,
                resize: 'vertical',
                width: '100%',
                border: 'none',
                boxShadow: 'none',
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
                <Select.Root size="3" defaultValue="default">
                  <Select.Trigger variant="soft" style={{ minWidth: 180 }} />
                  <Select.Content>
                    <Select.Item value="default">Default</Select.Item>
                    <Select.Item value="gpt-4">GPT-4</Select.Item>
                    <Select.Item value="claude">Claude</Select.Item>
                    <Select.Item value="custom">Custom</Select.Item>
                  </Select.Content>
                </Select.Root>
                <IconButton
                  variant="soft"
                  size="3"
                  radius="full"
                  aria-label="Submit"
                  onClick={handleSubmit}
                  disabled={phase === 'typing'}
                >
                  <ArrowUpIcon width="20" height="20" />
                </IconButton>
              </Flex>
            </Flex>
          </Flex>
        </Flex>

        {/* Replace "Start from an example" with loader / findings / questions */}
        <Flex
          direction="column"
          gap="4"
          style={{
            width: '100%',
            marginTop: 24,
            minHeight: 280,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {showExamples && (
            <>
              <Flex align="center" justify="between" wrap="wrap" gap="2">
                <Heading size="4">Start from an example</Heading>
                <Flex align="center" gap="2">
                  <RadixLink asChild size="2" color="gray">
                    <Link to="#">See more</Link>
                  </RadixLink>
                  <IconButton variant="soft" size="1" radius="full" aria-label="Previous">
                    ←
                  </IconButton>
                  <IconButton variant="soft" size="1" radius="full" aria-label="Next">
                    →
                  </IconButton>
                </Flex>
              </Flex>
              <Flex gap="4" wrap="wrap" justify="center">
                {EXAMPLES.map((ex) => (
                  <ExampleCard
                    key={ex.id}
                    title={ex.title}
                    author={ex.author}
                    imageCount={ex.imageCount}
                  />
                ))}
              </Flex>
            </>
          )}

          {showLoader && (
            <Flex direction="column" align="center" gap="4" p="8">
              <Spinner size="3" />
              <Text size="2" color="gray">
                Analyzing your requirements…
              </Text>
            </Flex>
          )}

          {showFindings && (
            <Flex
              direction="column"
              align="center"
              gap="2"
              p="6"
              style={{
                width: '100%',
                maxWidth: 560,
                animation: 'fadeIn 0.5s ease-out',
              }}
            >
              <Text size="3" weight="medium">
                Frontend Framework Selection
              </Text>
              <Text size="2" color="gray">
                We’ve identified a few confirmation questions to narrow down the best option.
              </Text>
            </Flex>
          )}

          {showQuestions && currentQuestion && (
            <Flex
              direction="column"
              align="center"
              gap="4"
              p="6"
              style={{
                width: '100%',
                maxWidth: 560,
                opacity: questionVisible ? 1 : 0,
                transform: questionVisible ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
              }}
            >
              <Text size="1" color="gray">
                Question {currentQuestionIndex + 1} of {DECISION_QUESTIONS.length}
              </Text>
              <Heading size="4" align="center">
                {currentQuestion.text}
              </Heading>
              <Flex gap="3" justify="center" wrap="wrap">
                <Button
                  size="3"
                  variant="soft"
                  color="green"
                  onClick={() => handleAnswer(true)}
                >
                  Yes
                </Button>
                <Button
                  size="3"
                  variant="soft"
                  color="red"
                  onClick={() => handleAnswer(false)}
                >
                  No
                </Button>
              </Flex>
            </Flex>
          )}

          {phase === 'done' && (
            <Flex
              direction="column"
              align="center"
              gap="4"
              p="6"
              style={{
                width: '100%',
                maxWidth: 560,
                animation: 'fadeIn 0.5s ease-out',
              }}
            >
              <Heading size="4">Your answers</Heading>
              <Flex direction="column" gap="2" style={{ width: '100%' }}>
                {Object.entries(answers).map(([key, value]) => (
                  <Flex key={key} justify="between" align="center">
                    <Text size="2">{key.replace(/_/g, ' ')}</Text>
                    <Badge color={value ? 'green' : 'red'} size="1">
                      {value ? 'Yes' : 'No'}
                    </Badge>
                  </Flex>
                ))}
              </Flex>
              <Text size="2" color="gray" style={{ marginTop: 8 }}>
                What would you like to do next?
              </Text>
              <Flex gap="3" wrap="wrap" justify="center">
                <Button
                  size="3"
                  color="green"
                  onClick={() => { setNextStep('mvp'); setMvpCompletedStepIndex(0) }}
                >
                  Make MVP plan
                </Button>
                <Button
                  size="3"
                  variant="soft"
                  onClick={() => setNextStep('prd')}
                >
                  Go to next step: PRD
                </Button>
              </Flex>
              {nextStep === 'mvp' && (
                <Flex direction="column" gap="3" style={{ width: '100%', marginTop: 12, maxWidth: 560 }}>
                  <Flex justify="between" align="center" wrap="wrap" gap="2">
                    <Heading size="3">MVP plan</Heading>
                    <Button size="1" variant="soft" color="gray" onClick={handleMvpReset}>
                      Reset
                    </Button>
                  </Flex>
                  <Text size="2" color="gray">Generating documents. One step completes every 10 seconds.</Text>
                  {MVP_STEPS.map((step, i) => {
                    const completed = i < mvpCompletedStepIndex
                    const inProgress = i === mvpCompletedStepIndex && mvpCompletedStepIndex < 10
                    return (
                      <Flex key={step.id} align="start" gap="3" style={{ width: '100%' }}>
                        <Flex align="center" justify="center" style={{ width: 28, height: 28, flexShrink: 0, borderRadius: '50%', background: completed ? 'var(--green-9)' : inProgress ? 'var(--accent-9)' : 'var(--gray-5)' }}>
                          {completed ? <CheckCircledIcon width="16" height="16" color="white" /> : inProgress ? <Spinner size="1" /> : <Text size="1">{i + 1}</Text>}
                        </Flex>
                        <Flex direction="column" gap="0" style={{ flex: 1, minWidth: 0 }}>
                          <Text size="2" weight="medium">{step.title}</Text>
                          <Text size="1" color="gray">{step.description}</Text>
                        </Flex>
                        <Button size="1" variant="ghost" asChild>
                          <Link to={`/organizations/${orgId}/projects/${projectId}/mvp/doc/${i}`}>
                            View <ChevronRightIcon width="14" height="14" />
                          </Link>
                        </Button>
                      </Flex>
                    )
                  })}
                  {mvpCompletedStepIndex >= 10 && (
                    <Flex align="center" gap="3" wrap="wrap" style={{ marginTop: 12 }}>
                      <Text size="2" color="green" weight="medium">
                        All steps complete.
                      </Text>
                      <Button size="2" color="green" asChild>
                        <Link to={`/organizations/${orgId}/projects/${projectId}/dashboard`}>
                          Go to dashboard
                        </Link>
                      </Button>
                    </Flex>
                  )}
                </Flex>
              )}
              {nextStep === 'prd' && (
                <Text size="2" color="gray" style={{ marginTop: 4 }}>
                  PRD step selected.
                </Text>
              )}
            </Flex>
          )}
        </Flex>
      </Flex>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  )
}
