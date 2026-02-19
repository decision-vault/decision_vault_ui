// Role-based task breakdown – Startup Analytics Dashboard
// Tasks grouped by role (Product, Backend, Frontend, DevOps, QA)

export const TASKS_CONTENT = `# Task Breakdown by Role

**Project:** Startup Analytics Dashboard  
**Version:** 1.0  
**Date:** February 2026  
**Status:** Draft

Tasks are grouped by role. Each task includes title, description, acceptance criteria, and optional estimate.

---

## 1. Product Owner / PM

| # | Task | Description | Acceptance criteria | Est. |
|---|------|-------------|---------------------|------|
| PO-1 | Finalize PRD and scope | Lock MVP scope and get stakeholder sign-off | PRD v1 approved; In/Out scope documented | 1 d |
| PO-2 | Define success metrics | Set DAU, latency, uptime targets | Metrics in PRD Section 3; dashboard KPIs listed | 0.5 d |
| PO-3 | Prioritize Phase 1 backlog | Order features for first release | Ordered backlog; dependencies noted | 0.5 d |
| PO-4 | Review and accept deliverables | Review API plan, schema, and UI flows | Sign-off on API plan and schema | Ongoing |

---

## 2. Backend Developer

| # | Task | Description | Acceptance criteria | Est. |
|---|------|-------------|---------------------|------|
| BE-1 | Set up FastAPI project and DB connection | Project skeleton, PostgreSQL connection, env config | App runs; health check returns 200 | 1 d |
| BE-2 | Implement auth module | Login, JWT issue/refresh, logout, bcrypt | POST /auth/login, /auth/refresh, /auth/logout per API plan | 2 d |
| BE-3 | Implement tenant and user modules | Tenant isolation, GET /tenants/me, GET/POST /users | All endpoints tenant-scoped; roles enforced | 2 d |
| BE-4 | Implement metrics CRUD and queries | GET/POST /metrics, summary, by-category, by-date | Pagination, filters, and aggregations working | 3 d |
| BE-5 | Implement reporting endpoints | GET /reports/summary, GET /reports/export?format=csv | Summary JSON; CSV export generated or pre-signed URL | 2 d |
| BE-6 | Add rate limiting and validation | 100 req/min per tenant; Pydantic on all bodies | 429 when exceeded; 422 on invalid input | 1 d |
| BE-7 | OpenAPI spec and tests | Generate OpenAPI 3.0; add integration tests | /api/v1/openapi.json served; critical paths tested | 1.5 d |

---

## 3. Frontend Developer

| # | Task | Description | Acceptance criteria | Est. |
|---|------|-------------|---------------------|------|
| FE-1 | Set up Vite + React app and routing | Project scaffold, React Router, theme | App loads; routes for login and dashboard | 0.5 d |
| FE-2 | Auth UI and context | Login form, token storage, refresh, logout | Login flow; protected routes redirect when unauthenticated | 1.5 d |
| FE-3 | Dashboard layout and navigation | Shell, sidebar, header, tenant/user display | Layout responsive; nav reflects role | 1 d |
| FE-4 | Metrics list and filters | Table/list of metrics; date and category filters | Uses GET /metrics with query params; pagination | 2 d |
| FE-5 | Charts and KPI cards | Summary and by-date charts (e.g. Recharts) | Uses /metrics/summary, /metrics/by-date | 2 d |
| FE-6 | CSV export flow | Button to trigger export; download or link | Uses GET /reports/export?format=csv | 0.5 d |
| FE-7 | User management (Admin) | List users, invite (POST /users) for admins | Admin-only route; form validates and shows errors | 1.5 d |

---

## 4. DevOps / Infrastructure

| # | Task | Description | Acceptance criteria | Est. |
|---|------|-------------|---------------------|------|
| OPS-1 | Terraform: VPC, subnets, RDS, ECS, ALB | Apply Terraform for dev environment | Stack applies; RDS and ECS reachable | 2 d |
| OPS-2 | CI pipeline | Build, test, and deploy on push (e.g. GitHub Actions) | Backend and frontend build; tests run | 1.5 d |
| OPS-3 | Frontend hosting (S3 + CloudFront) | Build artifact to S3; CloudFront distribution | App served over HTTPS | 1 d |
| OPS-4 | Secrets and env config | Store DB URL, JWT secret, API URL in secrets manager | No secrets in repo; app reads from env | 0.5 d |
| OPS-5 | Monitoring and alerts | CloudWatch dashboards; alerts for 5xx and RDS CPU | Alerts configured; runbook noted | 1 d |

---

## 5. QA / Test

| # | Task | Description | Acceptance criteria | Est. |
|---|------|-------------|---------------------|------|
| QA-1 | Test plan and cases | Document test scenarios for auth, metrics, export, roles | Test plan doc; cases mapped to requirements | 1 d |
| QA-2 | API and E2E tests | Automated tests for critical API and login→dashboard flow | Key flows green in CI | 2 d |
| QA-3 | Cross-browser and responsive check | Chrome, Firefox, Safari; mobile view | No critical bugs on target browsers | 0.5 d |
| QA-4 | UAT support and bug triage | Support UAT; log and prioritize bugs | Bug list with severity; regression run before release | Ongoing |

---

## 6. Summary by Role

| Role | Task count | Est. (days) |
|------|------------|-------------|
| Product Owner | 4 | 2 |
| Backend | 7 | 12.5 |
| Frontend | 7 | 9 |
| DevOps | 5 | 6 |
| QA | 4 | 3.5 |
| **Total** | **27** | **33** |

---

## 7. Dependencies

- BE-1 before all other Backend tasks.
- FE-1, FE-2 before other Frontend tasks.
- OPS-1 before OPS-2, OPS-3.
- BE-2 (auth) unblocks FE-2 (auth UI); BE-4 unblocks FE-4, FE-5.
- QA-2 runs after BE and FE milestones for the current sprint.
`
