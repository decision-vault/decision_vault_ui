// Structured role-based task breakdown for UI (no markdown)

export const TASK_PROJECT_META = {
  projectName: 'Startup Analytics Dashboard',
  version: '1.0',
  date: 'February 2026',
  status: 'Draft',
}

export const ROLES_WITH_TASKS = [
  {
    id: 'product',
    title: 'Product Owner / PM',
    shortTitle: 'Product',
    taskCount: 4,
    estimateDays: 2,
    tasks: [
      { id: 'PO-1', task: 'Finalize PRD and scope', description: 'Lock MVP scope and get stakeholder sign-off', acceptanceCriteria: 'PRD v1 approved; In/Out scope documented', estimate: '1 d' },
      { id: 'PO-2', task: 'Define success metrics', description: 'Set DAU, latency, uptime targets', acceptanceCriteria: 'Metrics in PRD Section 3; dashboard KPIs listed', estimate: '0.5 d' },
      { id: 'PO-3', task: 'Prioritize Phase 1 backlog', description: 'Order features for first release', acceptanceCriteria: 'Ordered backlog; dependencies noted', estimate: '0.5 d' },
      { id: 'PO-4', task: 'Review and accept deliverables', description: 'Review API plan, schema, and UI flows', acceptanceCriteria: 'Sign-off on API plan and schema', estimate: 'Ongoing' },
    ],
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    shortTitle: 'Backend',
    taskCount: 7,
    estimateDays: 12.5,
    tasks: [
      { id: 'BE-1', task: 'Set up FastAPI project and DB connection', description: 'Project skeleton, PostgreSQL connection, env config', acceptanceCriteria: 'App runs; health check returns 200', estimate: '1 d' },
      { id: 'BE-2', task: 'Implement auth module', description: 'Login, JWT issue/refresh, logout, bcrypt', acceptanceCriteria: 'POST /auth/login, /auth/refresh, /auth/logout per API plan', estimate: '2 d' },
      { id: 'BE-3', task: 'Implement tenant and user modules', description: 'Tenant isolation, GET /tenants/me, GET/POST /users', acceptanceCriteria: 'All endpoints tenant-scoped; roles enforced', estimate: '2 d' },
      { id: 'BE-4', task: 'Implement metrics CRUD and queries', description: 'GET/POST /metrics, summary, by-category, by-date', acceptanceCriteria: 'Pagination, filters, and aggregations working', estimate: '3 d' },
      { id: 'BE-5', task: 'Implement reporting endpoints', description: 'GET /reports/summary, GET /reports/export?format=csv', acceptanceCriteria: 'Summary JSON; CSV export generated or pre-signed URL', estimate: '2 d' },
      { id: 'BE-6', task: 'Add rate limiting and validation', description: '100 req/min per tenant; Pydantic on all bodies', acceptanceCriteria: '429 when exceeded; 422 on invalid input', estimate: '1 d' },
      { id: 'BE-7', task: 'OpenAPI spec and tests', description: 'Generate OpenAPI 3.0; add integration tests', acceptanceCriteria: '/api/v1/openapi.json served; critical paths tested', estimate: '1.5 d' },
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend Developer',
    shortTitle: 'Frontend',
    taskCount: 7,
    estimateDays: 9,
    tasks: [
      { id: 'FE-1', task: 'Set up Vite + React app and routing', description: 'Project scaffold, React Router, theme', acceptanceCriteria: 'App loads; routes for login and dashboard', estimate: '0.5 d' },
      { id: 'FE-2', task: 'Auth UI and context', description: 'Login form, token storage, refresh, logout', acceptanceCriteria: 'Login flow; protected routes redirect when unauthenticated', estimate: '1.5 d' },
      { id: 'FE-3', task: 'Dashboard layout and navigation', description: 'Shell, sidebar, header, tenant/user display', acceptanceCriteria: 'Layout responsive; nav reflects role', estimate: '1 d' },
      { id: 'FE-4', task: 'Metrics list and filters', description: 'Table/list of metrics; date and category filters', acceptanceCriteria: 'Uses GET /metrics with query params; pagination', estimate: '2 d' },
      { id: 'FE-5', task: 'Charts and KPI cards', description: 'Summary and by-date charts (e.g. Recharts)', acceptanceCriteria: 'Uses /metrics/summary, /metrics/by-date', estimate: '2 d' },
      { id: 'FE-6', task: 'CSV export flow', description: 'Button to trigger export; download or link', acceptanceCriteria: 'Uses GET /reports/export?format=csv', estimate: '0.5 d' },
      { id: 'FE-7', task: 'User management (Admin)', description: 'List users, invite (POST /users) for admins', acceptanceCriteria: 'Admin-only route; form validates and shows errors', estimate: '1.5 d' },
    ],
  },
  {
    id: 'devops',
    title: 'DevOps / Infrastructure',
    shortTitle: 'DevOps',
    taskCount: 5,
    estimateDays: 6,
    tasks: [
      { id: 'OPS-1', task: 'Terraform: VPC, subnets, RDS, ECS, ALB', description: 'Apply Terraform for dev environment', acceptanceCriteria: 'Stack applies; RDS and ECS reachable', estimate: '2 d' },
      { id: 'OPS-2', task: 'CI pipeline', description: 'Build, test, and deploy on push (e.g. GitHub Actions)', acceptanceCriteria: 'Backend and frontend build; tests run', estimate: '1.5 d' },
      { id: 'OPS-3', task: 'Frontend hosting (S3 + CloudFront)', description: 'Build artifact to S3; CloudFront distribution', acceptanceCriteria: 'App served over HTTPS', estimate: '1 d' },
      { id: 'OPS-4', task: 'Secrets and env config', description: 'Store DB URL, JWT secret, API URL in secrets manager', acceptanceCriteria: 'No secrets in repo; app reads from env', estimate: '0.5 d' },
      { id: 'OPS-5', task: 'Monitoring and alerts', description: 'CloudWatch dashboards; alerts for 5xx and RDS CPU', acceptanceCriteria: 'Alerts configured; runbook noted', estimate: '1 d' },
    ],
  },
  {
    id: 'qa',
    title: 'QA / Test',
    shortTitle: 'QA',
    taskCount: 4,
    estimateDays: 3.5,
    tasks: [
      { id: 'QA-1', task: 'Test plan and cases', description: 'Document test scenarios for auth, metrics, export, roles', acceptanceCriteria: 'Test plan doc; cases mapped to requirements', estimate: '1 d' },
      { id: 'QA-2', task: 'API and E2E tests', description: 'Automated tests for critical API and login→dashboard flow', acceptanceCriteria: 'Key flows green in CI', estimate: '2 d' },
      { id: 'QA-3', task: 'Cross-browser and responsive check', description: 'Chrome, Firefox, Safari; mobile view', acceptanceCriteria: 'No critical bugs on target browsers', estimate: '0.5 d' },
      { id: 'QA-4', task: 'UAT support and bug triage', description: 'Support UAT; log and prioritize bugs', acceptanceCriteria: 'Bug list with severity; regression run before release', estimate: 'Ongoing' },
    ],
  },
]

export const TASK_SUMMARY = {
  totalTasks: 27,
  totalDays: 33,
}

export const TASK_DEPENDENCIES = [
  'BE-1 before all other Backend tasks.',
  'FE-1, FE-2 before other Frontend tasks.',
  'OPS-1 before OPS-2, OPS-3.',
  'BE-2 (auth) unblocks FE-2 (auth UI); BE-4 unblocks FE-4, FE-5.',
  'QA-2 runs after BE and FE milestones for the current sprint.',
]
