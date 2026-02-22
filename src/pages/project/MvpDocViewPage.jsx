import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Box, Flex, Text, Button, TextArea } from '@radix-ui/themes'
import { ArrowLeftIcon, ArrowUpIcon } from '@radix-ui/react-icons'
import ReactMarkdown from 'react-markdown'
import { PRD_CONTENT } from './content/prdContent'
import { SYSTEM_DESIGN_CONTENT } from './content/systemDesignContent'
import { TERRAFORM_CONTENT } from './content/terraformContent'
import { LOAD_MATH_CONTENT } from './content/loadMathContent'
import { API_PLAN_CONTENT } from './content/apiPlanContent'
import { THREAT_MODEL_CONTENT } from './content/threatModelContent'

const DOC_STEP_IDS = ['prd', 'system-design', 'terraform', 'load-math', 'api-doc', 'threat-model']

const STEP_INITIAL_CONTENT = {
  prd: PRD_CONTENT,
  'system-design': SYSTEM_DESIGN_CONTENT,
  terraform: TERRAFORM_CONTENT,
  'load-math': LOAD_MATH_CONTENT,
  'api-doc': API_PLAN_CONTENT,
  'threat-model': THREAT_MODEL_CONTENT,
}

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

export function MvpDocViewPage() {
  const { orgId, projectId, stepIndex } = useParams()
  const index = parseInt(stepIndex, 10)
  const step = MVP_STEPS[index]
  const currentStepId = step?.id

  const [chatInput, setChatInput] = useState('')
  const [editMessagesByStep, setEditMessagesByStep] = useState(() => ({
    prd: [],
    'system-design': [],
    terraform: [],
    'load-math': [],
    'api-doc': [],
    'threat-model': [],
  }))
  const [contentByStep, setContentByStep] = useState(() => ({ ...STEP_INITIAL_CONTENT }))
  const [isEditMode, setIsEditMode] = useState(false)

  const hasDocContent = currentStepId && DOC_STEP_IDS.includes(currentStepId)
  const manualMdContent = contentByStep[currentStepId] ?? STEP_INITIAL_CONTENT[currentStepId]
  const editMessages = editMessagesByStep[currentStepId] ?? []

  const docContent = useMemo(() => (hasDocContent ? manualMdContent : null), [hasDocContent, manualMdContent])

  if (!step) {
    return (
      <Box p="6">
        <Button variant="soft" asChild>
          <Link to={`/organizations/${orgId}/projects/${projectId}`}>
            <ArrowLeftIcon width="16" height="16" /> Back
          </Link>
        </Button>
        <Text size="2" color="gray" style={{ display: 'block', marginTop: 16 }}>
          Step not found.
        </Text>
      </Box>
    )
  }

  const setEditMessages = (updater) => {
    setEditMessagesByStep((prev) => ({
      ...prev,
      [currentStepId]: typeof updater === 'function' ? updater(prev[currentStepId] ?? []) : updater,
    }))
  }

  const handleSendEdit = () => {
    const msg = chatInput.trim()
    if (!msg) return

    setEditMessages((prev) => [...prev, { role: 'user', text: msg }])
    setEditMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'Request captured. Mock edit simulation has been removed. Please use Edit mode to update the document directly.',
      },
    ])
    setChatInput('')
  }

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
          <Text size="2" weight="medium">Edit doc</Text>
        </Flex>

        <Box style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 12 }}>
          {editMessages.length === 0 ? (
            <Text size="2" color="gray">
              Add edit notes here. Mock edit flow is removed.
            </Text>
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
                  <Text size="2">{m.text}</Text>
                </Box>
              ))}
            </Flex>
          )}
        </Box>

        <Flex p="3" gap="2" style={{ borderTop: '1px solid var(--gray-6)' }}>
          <TextArea
            placeholder="Describe the edit you want..."
            size="2"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendEdit()
              }
            }}
            style={{ flex: 1, minHeight: 44, resize: 'none' }}
          />
          <Button size="2" onClick={handleSendEdit} disabled={!chatInput.trim()}>
            <ArrowUpIcon width="16" height="16" />
          </Button>
        </Flex>
      </Box>

      <Box
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--color-background)',
        }}
      >
        {hasDocContent && (
          <Flex p="2" gap="2" align="center" style={{ borderBottom: '1px solid var(--gray-6)', flexShrink: 0 }}>
            <Button size="1" variant={isEditMode ? 'soft' : 'ghost'} onClick={() => setIsEditMode(true)}>
              Edit
            </Button>
            <Button size="1" variant={!isEditMode ? 'soft' : 'ghost'} onClick={() => setIsEditMode(false)}>
              Preview
            </Button>
          </Flex>
        )}

        <Box p="6" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          {hasDocContent && isEditMode ? (
            <TextArea
              size="2"
              value={manualMdContent}
              onChange={(e) => {
                const next = e.target.value
                setContentByStep((prev) => ({ ...prev, [currentStepId]: next }))
              }}
              placeholder="Edit markdown..."
              style={{
                width: '100%',
                minHeight: 'calc(100vh - 180px)',
                fontFamily: 'ui-monospace, monospace',
                fontSize: 14,
                lineHeight: 1.5,
              }}
            />
          ) : docContent ? (
            <Box className="md-doc-viewer" style={{ maxWidth: 720, margin: '0 auto' }}>
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 12 }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: 24, marginBottom: 8 }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: 16, marginBottom: 6 }}>{children}</h3>,
                  p: ({ children }) => <p style={{ marginBottom: 12, lineHeight: 1.6 }}>{children}</p>,
                  ul: ({ children }) => <ul style={{ marginBottom: 12, paddingLeft: 24 }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ marginBottom: 12, paddingLeft: 24 }}>{children}</ol>,
                  li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
                  table: ({ children }) => (
                    <div style={{ overflow: 'auto', marginBottom: 16 }}>
                      <table style={{ borderCollapse: 'collapse', width: '100%' }}>{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th style={{ border: '1px solid var(--gray-7)', padding: '8px 12px', textAlign: 'left', background: 'var(--gray-3)' }}>
                      {children}
                    </th>
                  ),
                  td: ({ children }) => <td style={{ border: '1px solid var(--gray-6)', padding: '8px 12px' }}>{children}</td>,
                  strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
                  hr: () => <hr style={{ border: 'none', borderTop: '1px solid var(--gray-6)', margin: '24px 0' }} />,
                }}
              >
                {docContent}
              </ReactMarkdown>
            </Box>
          ) : !hasDocContent ? (
            <Box p="6" style={{ borderRadius: 'var(--radius-3)', background: 'var(--gray-3)', border: '1px dashed var(--gray-6)' }}>
              <Text size="2" color="gray">
                Document content for "{step.title}" will be rendered here.
              </Text>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Flex>
  )
}
