import { useState, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Box, Flex, Text, Button, TextArea } from '@radix-ui/themes'
import { ArrowLeftIcon, ArrowUpIcon, CheckIcon, Cross2Icon } from '@radix-ui/react-icons'
import ReactMarkdown from 'react-markdown'
import { diffLines } from 'diff'
import { PRD_CONTENT } from './content/prdContent'
import { SYSTEM_DESIGN_CONTENT } from './content/systemDesignContent'
import { TERRAFORM_CONTENT } from './content/terraformContent'
import { LOAD_MATH_CONTENT } from './content/loadMathContent'
import { API_PLAN_CONTENT } from './content/apiPlanContent'
import { THREAT_MODEL_CONTENT } from './content/threatModelContent'

// Mock edit suggestions by doc type
const MOCK_EDIT_SUGGESTIONS_PRD = [
  {
    label: 'Add API rate limiting',
    prompt: 'Add API rate limiting to the In Scope (MVP) section.',
    applyChange: (content) => {
      const scope = '### In Scope (MVP)\n\n- Multi-tenant SaaS architecture'
      if (content.includes(scope)) {
        return content.replace(
          scope,
          '### In Scope (MVP)\n\n- Multi-tenant SaaS architecture\n- API rate limiting (per-tenant quotas)'
        )
      }
      return content + '\n\n- API rate limiting (per-tenant quotas)'
    },
    summary: '**Changes applied:**\n• Added **API rate limiting (per-tenant quotas)** to **Section 5 – In Scope (MVP)**.\n• Document updated and reflected in the PRD.',
  },
  {
    label: 'Update DAU to 5000',
    prompt: 'Update the target from 3,000 to 5,000 daily active users.',
    applyChange: (content) =>
      content.replace(/3,000 daily active users/g, '5,000 daily active users').replace(/3,000 DAU/g, '5,000 DAU'),
    summary: '**Changes applied:**\n• Updated **daily active user** targets from **3,000** to **5,000** in Executive Summary, Goals, and Non-Functional Requirements.\n• Document updated and reflected in the PRD.',
  },
  {
    label: 'Add audit logs to Future',
    prompt: 'Add audit logs to Future Enhancements and mention it in Phase 3.',
    applyChange: (content) => {
      let next = content
      if (next.includes('- Audit logs')) return next
      next = next.replace(
        '## 14. Future Enhancements (Post-MVP)\n\n- AI-driven analytics insights',
        '## 14. Future Enhancements (Post-MVP)\n\n- Audit logs (user actions and API access)\n- AI-driven analytics insights'
      )
      next = next.replace(
        '**Phase 3 – Optimization**\n\n- Performance tuning',
        '**Phase 3 – Optimization**\n\n- Audit logging for security\n- Performance tuning'
      )
      return next
    },
    summary: '**Changes applied:**\n• Added **Audit logs (user actions and API access)** to **Section 14 – Future Enhancements**.\n• Added **Audit logging for security** to **Phase 3 – Optimization** in the Release Plan.\n• Document updated and reflected in the PRD.',
  },
]

const MOCK_EDIT_SUGGESTIONS_SYSTEM_DESIGN = [
  {
    label: 'Add ElastiCache Redis to deployment',
    prompt: 'Add ElastiCache Redis for metric caching to the Infrastructure Deployment section.',
    applyChange: (content) => {
      if (content.includes('ElastiCache')) return content
      return content.replace(
        '### 9.1 Deployment\n\n- Frontend hosted on S3 + CloudFront',
        '### 9.1 Deployment\n\n- ElastiCache (Redis) for metric caching\n- Frontend hosted on S3 + CloudFront'
      )
    },
    summary: '**Changes applied:**\n• Added **ElastiCache (Redis) for metric caching** to **Section 9.1 – Infrastructure Deployment**.\n• Document updated and reflected in the System Design.',
  },
  {
    label: 'Add rate limiting to API',
    prompt: 'Add rate limiting to the API Design and Security sections.',
    applyChange: (content) => {
      let next = content
      if (next.includes('Rate limiting')) return next
      next = next.replace(
        '**Base Path:** /api/v1/\n\n### 5.1 Auth Endpoints',
        '**Base Path:** /api/v1/\n**Rate Limiting:** 100 req/min per tenant (configurable)\n\n### 5.1 Auth Endpoints'
      )
      next = next.replace(
        '- Input validation via Pydantic\n- SQL injection prevention',
        '- Input validation via Pydantic\n- Rate limiting (per-tenant quotas)\n- SQL injection prevention'
      )
      return next
    },
    summary: '**Changes applied:**\n• Added **rate limiting** (100 req/min per tenant) to **Section 5 – API Design**.\n• Added **rate limiting (per-tenant quotas)** to **Section 11 – Security Design**.\n• Document updated and reflected in the System Design.',
  },
  {
    label: 'Update DAU to 5000',
    prompt: 'Update the target from 3,000 to 5,000 daily active users across the document.',
    applyChange: (content) =>
      content.replace(/3,000 daily active users/g, '5,000 daily active users').replace(/3,000 DAU/g, '5,000 DAU'),
    summary: '**Changes applied:**\n• Updated **daily active user** targets from **3,000** to **5,000** in System Overview, Load Handling, and Scalability Strategy.\n• Document updated and reflected in the System Design.',
  },
]

const MOCK_EDIT_SUGGESTIONS_TERRAFORM = [
  {
    label: 'Add HTTPS listener',
    prompt: 'Add an HTTPS listener to the ALB with SSL.',
    applyChange: (content) => {
      if (content.includes('aws_lb_listener.https')) return content
      const block = `### HTTPS Listener

\`\`\`hcl
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.app.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.ssl_certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}
\`\`\`
`
      return content.replace('### S3 (frontend + exports)', `${block}\n\n### S3 (frontend + exports)`)
    },
    summary: '**Changes applied:**\n• Added **HTTPS listener** (port 443) to ALB with \`var.ssl_certificate_arn\`.\n• Terraform template updated.',
  },
  {
    label: 'Increase ECS task memory',
    prompt: 'Increase ECS task memory from 512 to 1024.',
    applyChange: (content) =>
      content.replace('memory                   = "512"', 'memory                   = "1024"'),
    summary: '**Changes applied:**\n• ECS task definition **memory** updated from 512 to **1024** MB.\n• Terraform template updated.',
  },
  {
    label: 'Add desired_count variable',
    prompt: 'Make ECS desired_count a variable.',
    applyChange: (content) => {
      let next = content
      if (next.includes('variable "desired_count"')) return next
      next = next.replace(
        'variable "container_image" {',
        'variable "desired_count" {\n  default = 2\n}\n\nvariable "container_image" {'
      )
      next = next.replace('desired_count   = 2', 'desired_count   = var.desired_count')
      return next
    },
    summary: '**Changes applied:**\n• Added **variable "desired_count"** (default 2).\n• ECS service **desired_count** now uses **var.desired_count**.\n• Terraform template updated.',
  },
]

const MOCK_EDIT_SUGGESTIONS_LOAD_MATH = [
  {
    label: 'Scale to 5,000 DAU',
    prompt: 'Update the load math to target 5,000 DAU instead of 3,000.',
    applyChange: (content) =>
      content
        .replace(/3,000 Daily Active Users/g, '5,000 Daily Active Users')
        .replace(/3,000 DAU/g, '5,000 DAU')
        .replace(/3,000 × 10%/g, '5,000 × 10%')
        .replace(/= 300 concurrent/g, '= 500 concurrent')
        .replace(/300 concurrent users/g, '500 concurrent users')
        .replace(/300 \/ 5/g, '500 / 5')
        .replace(/= 60 requests/g, '= 100 requests')
        .replace(/60 RPS/g, '100 RPS')
        .replace(/60 \/ 30/g, '100 / 30')
        .replace(/≈ 2 vCPUs/g, '≈ 3–4 vCPUs')
        .replace(/2–4 vCPUs/g, '4–6 vCPUs')
        .replace(/60 RPS × 2 queries/g, '100 RPS × 2 queries')
        .replace(/= 120 queries/g, '= 200 queries')
        .replace(/300 × 2MB/g, '500 × 2MB')
        .replace(/60 × 50KB/g, '100 × 50KB')
        .replace(/3,000 users × 100/g, '5,000 users × 100')
        .replace(/60 MB × 12/g, '100 MB × 12')
        .replace(/720 MB/g, '1.2 GB')
        .replace(/3,000 DAU/g, '5,000 DAU')
        .replace(/\| 3,000 \|/g, '| 5,000 |')
        .replace(/\| 300 \|/g, '| 500 |')
        .replace(/\| 60 \|/g, '| 100 |')
        .replace(/At \*\*3,000 DAU\*\*/g, 'At **5,000 DAU**'),
    summary: '**Changes applied:**\n• Load math updated for **5,000 DAU**.\n• Concurrent users 500, peak RPS ~100, vCPU 4–6, storage ~1.2 GB/year.\n• Document updated.',
  },
  {
    label: 'Add Redis consideration',
    prompt: 'Add a note about when to consider Redis for caching.',
    applyChange: (content) => {
      if (content.includes('Redis (yet)')) return content
      return content.replace(
        '- Redis (yet)\n- Multi-region',
        '- Redis (yet) — consider at >100 RPS or >5,000 DAU\n- Multi-region'
      )
    },
    summary: '**Changes applied:**\n• Added note: consider **Redis** at >100 RPS or >5,000 DAU.\n• Load math document updated.',
  },
  {
    label: 'Raise scale threshold RPS',
    prompt: 'Raise the auto-scale RPS threshold from 80 to 100.',
    applyChange: (content) =>
      content.replace('**RPS** > 80', '**RPS** > 100'),
    summary: '**Changes applied:**\n• Auto-scaling threshold **RPS** updated from 80 to **100**.\n• Document updated.',
  },
]

const MOCK_EDIT_SUGGESTIONS_API_PLAN = [
  {
    label: 'Add GET /dashboards endpoint',
    prompt: 'Add a GET /dashboards endpoint to the API plan for listing saved dashboards.',
    applyChange: (content) => {
      if (content.includes('GET /api/v1/dashboards')) return content
      return content.replace(
        '### 7.5 Reporting\n\n#### GET /api/v1/reports/summary',
        '### 7.5 Dashboards\n\n#### GET /api/v1/dashboards\n\n**Query:** `page`, `page_size`\n\n**Response (200):** Paginated list of dashboard configs (id, tenant_id, name, configuration_json, created_at).\n\n---\n\n### 7.6 Reporting\n\n#### GET /api/v1/reports/summary'
      )
    },
    summary: '**Changes applied:**\n• Added **GET /api/v1/dashboards** to **Section 7 – Endpoint Reference** with query params and response shape.\n• API plan document updated.',
  },
  {
    label: 'Increase rate limit to 200/min',
    prompt: 'Update the default rate limit from 100 to 200 requests per minute per tenant.',
    applyChange: (content) =>
      content.replace(/100 requests per minute per tenant/, '200 requests per minute per tenant'),
    summary: '**Changes applied:**\n• Default **rate limit** updated from 100 to **200** requests per minute per tenant in **Section 4 – Rate Limiting**.\n• API plan document updated.',
  },
  {
    label: 'Add OpenAPI spec to current scope',
    prompt: 'Add serving OpenAPI 3.0 spec at /api/v1/openapi.json to the current API scope (not only Future).',
    applyChange: (content) => {
      if (content.includes('**OpenAPI:** Published')) return content
      return content.replace(
        '## 8. Security Checklist',
        '## 8. API Specification\n\n- **OpenAPI:** Published OpenAPI 3.0 spec at `/api/v1/openapi.json` for interactive docs and client generation.\n\n## 9. Security Checklist'
      ).replace(
        '## 9. Future API Additions',
        '## 10. Future API Additions'
      )
    },
    summary: '**Changes applied:**\n• Added **Section 8 – API Specification** with OpenAPI 3.0 at `/api/v1/openapi.json`.\n• Renumbered Security Checklist and Future API Additions.\n• API plan document updated.',
  },
]

const MOCK_EDIT_SUGGESTIONS_THREAT_MODEL = [
  {
    label: 'Add WAF to post-MVP',
    prompt: 'Add WAF and DDoS protection to the post-MVP / future controls section.',
    applyChange: (content) => {
      if (content.includes('WAF') && content.includes('post-MVP')) return content
      return content.replace(
        '**Overall:** MVP assumes single-region, no audit log persistence yet. Post-MVP: audit log storage, WAF, and optional WAF/DDoS protection.',
        '**Overall:** MVP assumes single-region, no audit log persistence yet. Post-MVP: audit log storage, WAF (e.g. AWS WAF) for common web attacks, and DDoS protection (e.g. Shield Standard).'
      )
    },
    summary: '**Changes applied:**\n• Updated **Section 6 – Risk Summary** post-MVP line to include **WAF** (e.g. AWS WAF) and **DDoS protection** (e.g. Shield Standard).\n• Threat model document updated.',
  },
  {
    label: 'Add audit log to Security Controls',
    prompt: 'Add an audit logging control to the Security Controls Checklist.',
    applyChange: (content) => {
      if (content.includes('Audit log') && content.includes('Security Controls')) return content
      return content.replace(
        '- [ ] Dependency and SAST in CI (post-MVP: formalized)',
        '- [ ] Audit log for sensitive actions (login, export, user create) — post-MVP persistence\n- [ ] Dependency and SAST in CI (post-MVP: formalized)'
      )
    },
    summary: '**Changes applied:**\n• Added **Audit log** for sensitive actions to **Section 7 – Security Controls Checklist**.\n• Threat model document updated.',
  },
  {
    label: 'Add threat for weak password reset',
    prompt: 'Add a threat about weak or missing password reset flow and mitigation.',
    applyChange: (content) => {
      if (content.includes('Password reset')) return content
      return content.replace(
        '| T-S2 | Forged or replayed JWT | JWT | Signed JWT (e.g. RS256), expiry, refresh rotation |',
        '| T-S2 | Forged or replayed JWT | JWT | Signed JWT (e.g. RS256), expiry, refresh rotation |\n| T-S3 | Weak or missing password reset; account takeover | User credentials | Secure reset flow (time-limited token, no user enumeration); consider rate limit on reset requests |'
      )
    },
    summary: '**Changes applied:**\n• Added **T-S3 – Password reset** threat and mitigation to **Section 5.1 – Spoofing**.\n• Threat model document updated.',
  },
]

const DOC_STEP_IDS = ['prd', 'system-design', 'terraform', 'load-math', 'api-doc', 'threat-model']
const STEP_INITIAL_CONTENT = { 'prd': PRD_CONTENT, 'system-design': SYSTEM_DESIGN_CONTENT, 'terraform': TERRAFORM_CONTENT, 'load-math': LOAD_MATH_CONTENT, 'api-doc': API_PLAN_CONTENT, 'threat-model': THREAT_MODEL_CONTENT }
const MOCK_EDIT_SUGGESTIONS_BY_STEP = { 'prd': MOCK_EDIT_SUGGESTIONS_PRD, 'system-design': MOCK_EDIT_SUGGESTIONS_SYSTEM_DESIGN, 'terraform': MOCK_EDIT_SUGGESTIONS_TERRAFORM, 'load-math': MOCK_EDIT_SUGGESTIONS_LOAD_MATH, 'api-doc': MOCK_EDIT_SUGGESTIONS_API_PLAN, 'threat-model': MOCK_EDIT_SUGGESTIONS_THREAT_MODEL }

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
  const [contentByStep, setContentByStep] = useState(() => ({ ...STEP_INITIAL_CONTENT }))
  const [editMessagesByStep, setEditMessagesByStep] = useState(() => ({ prd: [], 'system-design': [], 'terraform': [], 'load-math': [], 'api-doc': [], 'threat-model': [] }))
  const [pendingDiffByStep, setPendingDiffByStep] = useState(() => ({ prd: null, 'system-design': null, 'terraform': null, 'load-math': null, 'api-doc': null, 'threat-model': null }))
  const [isEditMode, setIsEditMode] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isAgentProcessing, setIsAgentProcessing] = useState(false)
  const pendingMockEditRef = useRef(null)

  const hasDocContent = currentStepId && DOC_STEP_IDS.includes(currentStepId)
  const manualMdContent = contentByStep[currentStepId] ?? STEP_INITIAL_CONTENT[currentStepId]
  const editMessages = editMessagesByStep[currentStepId] ?? []
  const pendingDiff = pendingDiffByStep[currentStepId] ?? null
  const mockSuggestions = hasDocContent ? (MOCK_EDIT_SUGGESTIONS_BY_STEP[currentStepId] ?? []) : []

  const setManualMdContent = useCallback((updater) => {
    setContentByStep((prev) => ({
      ...prev,
      [currentStepId]: typeof updater === 'function' ? updater(prev[currentStepId] ?? STEP_INITIAL_CONTENT[currentStepId]) : updater,
    }))
  }, [currentStepId])

  const setEditMessages = useCallback((updater) => {
    setEditMessagesByStep((prev) => ({
      ...prev,
      [currentStepId]: typeof updater === 'function' ? updater(prev[currentStepId] ?? []) : updater,
    }))
  }, [currentStepId])

  const setPendingDiff = useCallback((val) => {
    setPendingDiffByStep((prev) => ({ ...prev, [currentStepId]: val }))
  }, [currentStepId])

  const docContent = hasDocContent ? manualMdContent : null

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

  const handleSendEdit = useCallback(
    (optionalMessage) => {
      const msg = (optionalMessage ?? chatInput).trim()
      if (!msg) return
      setEditMessages((prev) => [...prev, { role: 'user', text: msg }])
      if (optionalMessage === undefined) setChatInput('')
      else setChatInput('')
      const pending = pendingMockEditRef.current
      pendingMockEditRef.current = null
      if (pending && hasDocContent) {
        const stepId = currentStepId
        const prevContent = contentByStep[stepId] ?? STEP_INITIAL_CONTENT[stepId]
        const proposed = pending.applyChange(prevContent)
        const payload = { previousContent: prevContent, proposedContent: proposed, summary: pending.summary }
        setIsAgentProcessing(true)
        setTimeout(() => {
          setPendingDiffByStep((p) => ({ ...p, [stepId]: payload }))
          setEditMessagesByStep((p) => ({
            ...p,
            [stepId]: [...(p[stepId] ?? []), { role: 'assistant', text: payload.summary }],
          }))
          setIsAgentProcessing(false)
        }, 5000)
      } else {
        setEditMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: '**Edit received.** In a full implementation, an agent would apply your requested changes and show a summary here. For now, use "Edit" mode on the right to update the document manually, or try a mock edit suggestion below.',
          },
        ])
      }
    },
    [chatInput, hasDocContent, currentStepId, contentByStep]
  )

  const startMockEdit = useCallback(
    (suggestion) => {
      if (isTyping || !hasDocContent) return
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
    [isTyping, hasDocContent, handleSendEdit]
  )

  return (
    <Flex style={{ width: '100%', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {/* Left panel: 480px – chat to edit the doc (no scroll) */}
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
          {editMessages.length === 0 && !isTyping ? (
            <Flex direction="column" gap="3">
              <Text size="2" color="gray">
                Ask for changes to the document. Your edits will appear here. Try a mock edit to see auto-type and agent summary:
              </Text>
              {hasDocContent && (
                <Flex wrap="wrap" gap="2">
                  {mockSuggestions.map((s, i) => (
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
              )}
            </Flex>
          ) : editMessages.length === 0 && isTyping ? (
            <Box
              p="2"
              style={{
                background: 'var(--gray-3)',
                borderRadius: 'var(--radius-2)',
                alignSelf: 'flex-start',
              }}
            >
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
                <Box
                  p="2"
                  style={{
                    background: 'var(--gray-3)',
                    borderRadius: 'var(--radius-2)',
                    alignSelf: 'flex-start',
                  }}
                >
                  <Text size="2" color="gray">
                    {isTyping ? 'Typing…' : 'Processing your edit…'}
                  </Text>
                </Box>
              )}
            </Flex>
          )}
        </Box>
        <Flex p="3" gap="2" style={{ borderTop: '1px solid var(--gray-6)' }}>
          <TextArea
            placeholder="Describe the edit you want..."
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

      {/* Right: remaining width = markdown doc viewer or manual MD editor (only scrollable area) */}
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
            <Button
              size="1"
              variant={isEditMode ? 'soft' : 'ghost'}
              onClick={() => setIsEditMode(true)}
            >
              Edit
            </Button>
            <Button
              size="1"
              variant={!isEditMode ? 'soft' : 'ghost'}
              onClick={() => setIsEditMode(false)}
            >
              Preview
            </Button>
            {pendingDiff && (
              <Flex gap="2" style={{ marginLeft: 'auto' }}>
                <Text size="1" color="gray">Review changes:</Text>
                <Button
                  size="1"
                  color="green"
                  variant="soft"
                  onClick={() => {
                    setManualMdContent(pendingDiff.proposedContent)
                    setPendingDiff(null)
                  }}
                >
                  <CheckIcon width="14" height="14" /> Accept
                </Button>
                <Button
                  size="1"
                  color="red"
                  variant="soft"
                  onClick={() => setPendingDiff(null)}
                >
                  <Cross2Icon width="14" height="14" /> Reject
                </Button>
              </Flex>
            )}
          </Flex>
        )}
        <Box
          p="6"
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
          }}
        >
        {isAgentProcessing ? (
          <Flex
            align="center"
            justify="center"
            style={{ flex: 1, minHeight: 200, color: 'var(--gray-11)' }}
          >
            <Text size="2">Loading changes…</Text>
          </Flex>
        ) : pendingDiff ? (
          <Box
            style={{
              maxWidth: 900,
              margin: '0 auto',
              fontFamily: 'ui-monospace, monospace',
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <Flex gap="2" mb="3" align="center">
              <Text size="2" weight="medium">Current vs proposed</Text>
              <Flex gap="3" style={{ marginLeft: 16 }}>
                <Text size="1" style={{ background: 'var(--red-3)', color: 'var(--red-11)', padding: '2px 8px', borderRadius: 4 }}>Removed</Text>
                <Text size="1" style={{ background: 'var(--green-3)', color: 'var(--green-11)', padding: '2px 8px', borderRadius: 4 }}>Added</Text>
              </Flex>
            </Flex>
            <Box
              style={{
                border: '1px solid var(--gray-6)',
                borderRadius: 'var(--radius-2)',
                overflow: 'hidden',
                background: 'var(--gray-2)',
              }}
            >
              {diffLines(pendingDiff.previousContent, pendingDiff.proposedContent).map((part, i) => {
                if (part.added) {
                  return (
                    <Box
                      key={i}
                      as="pre"
                      style={{
                        margin: 0,
                        padding: '2px 10px',
                        background: 'var(--green-3)',
                        color: 'var(--green-11)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {part.value}
                    </Box>
                  )
                }
                if (part.removed) {
                  return (
                    <Box
                      key={i}
                      as="pre"
                      style={{
                        margin: 0,
                        padding: '2px 10px',
                        background: 'var(--red-3)',
                        color: 'var(--red-11)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {part.value}
                    </Box>
                  )
                }
                return (
                  <Box
                    key={i}
                    as="pre"
                    style={{
                      margin: 0,
                      padding: '2px 10px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      color: 'var(--gray-11)',
                    }}
                  >
                    {part.value}
                  </Box>
                )
              })}
            </Box>
          </Box>
        ) : hasDocContent && isEditMode ? (
          <TextArea
            size="2"
            value={manualMdContent}
            onChange={(e) => setManualMdContent(e.target.value)}
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
          <Box
            className="md-doc-viewer"
            style={{
              maxWidth: 720,
              margin: '0 auto',
            }}
          >
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 12 }}>{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: 24, marginBottom: 8 }}>{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: 16, marginBottom: 6 }}>{children}</h3>
                ),
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
                  <th
                    style={{
                      border: '1px solid var(--gray-7)',
                      padding: '8px 12px',
                      textAlign: 'left',
                      background: 'var(--gray-3)',
                    }}
                  >
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td style={{ border: '1px solid var(--gray-6)', padding: '8px 12px' }}>{children}</td>
                ),
                strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
                hr: () => <hr style={{ border: 'none', borderTop: '1px solid var(--gray-6)', margin: '24px 0' }} />,
              }}
            >
              {docContent}
            </ReactMarkdown>
          </Box>
        ) : !hasDocContent ? (
          <Box
            p="6"
            style={{
              borderRadius: 'var(--radius-3)',
              background: 'var(--gray-3)',
              border: '1px dashed var(--gray-6)',
            }}
          >
            <Text size="2" color="gray">
              Document content for “{step.title}” will be rendered here.
            </Text>
          </Box>
        ) : null}
        </Box>
      </Box>
    </Flex>
  )
}
