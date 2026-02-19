// System Design Document - Startup Analytics Dashboard
export const SYSTEM_DESIGN_CONTENT = `# System Design Document

**Project:** Startup Analytics Dashboard  
**Version:** 1.0  
**Date:** February 2026  
**Architecture Decision Reference:** ARCH-001 (Frontend: Vite + React)

## 1. System Overview

The Startup Analytics Dashboard is a multi-tenant SaaS platform designed to support up to 3,000 daily active users during its initial growth phase.

The system architecture follows:

- Stateless backend
- Tenant-scoped database model
- Single-region AWS deployment
- Horizontally scalable API layer
- SPA frontend architecture

## 2. High-Level Architecture

\`\`\`
[ Browser (React SPA) ]
            ↓
     HTTPS (TLS)
            ↓
[ Load Balancer ]
            ↓
[ FastAPI Backend ]
            ↓
[ PostgreSQL (RDS) ]
            ↓
[ S3 / CloudWatch ]
\`\`\`

## 3. Service Decomposition

This is a modular monolith (MVP phase), structured by domain modules.

### 3.1 Auth Module

**Responsibilities:**

- Login
- Token generation (JWT)
- Token refresh
- Password hashing (bcrypt)
- Role validation

### 3.2 Tenant Module

**Responsibilities:**

- Tenant creation
- Tenant isolation enforcement
- Tenant configuration

### 3.3 User Module

**Responsibilities:**

- User registration
- Role assignment (Admin / Member)
- Profile management

### 3.4 Dashboard Module

**Responsibilities:**

- Fetch metrics
- Aggregate analytics
- Date filtering
- KPI computation

### 3.5 Reporting Module

**Responsibilities:**

- Generate summary reports
- CSV export
- Data aggregation queries

## 4. Data Model Design

All tenant-scoped entities include tenant_id.

### 4.1 Tenant

| Tenant | |
|--------|--|
| id (UUID) | |
| name | |
| created_at | |

### 4.2 User

| User | |
|------|--|
| id (UUID) | |
| tenant_id (FK) | |
| email | |
| password_hash | |
| role (admin \| member) | |
| created_at | |

### 4.3 Metric

| Metric | |
|--------|--|
| id (UUID) | |
| tenant_id (FK) | |
| name | |
| category | |
| value | |
| recorded_at | |
| created_at | |

### 4.4 Dashboard

| Dashboard | |
|-----------|--|
| id (UUID) | |
| tenant_id (FK) | |
| name | |
| configuration_json | |

### 4.5 Session (Optional Audit)

| Session | |
|---------|--|
| id | |
| user_id | |
| issued_at | |
| expires_at | |

## 5. API Design

**Base Path:** /api/v1/

### 5.1 Auth Endpoints

- POST   /auth/login
- POST   /auth/refresh
- POST   /auth/logout

### 5.2 Tenant Endpoints

- GET    /tenants/me

### 5.3 User Endpoints

- GET    /users/me
- POST   /users

### 5.4 Metrics Endpoints

- GET    /metrics
- POST   /metrics
- GET    /metrics/summary
- GET    /metrics/by-category
- GET    /metrics/by-date

### 5.5 Reporting

- GET    /reports/summary
- GET    /reports/export?format=csv

## 6. Authentication & Authorization

### 6.1 Authentication Flow

1. User submits email/password
2. Backend verifies hash
3. JWT issued (15 min expiry)
4. Refresh token optional (7 days)

### 6.2 Authorization Model

Role-based access control:

| Role | Permissions |
|------|-------------|
| Admin | Manage users, view all data |
| Member | View and manage metrics |

All queries automatically filtered by tenant_id.

## 7. Multi-Tenant Isolation Strategy

Isolation is enforced at:

- Application layer (FastAPI dependency injection)
- Database query filtering
- JWT token containing tenant_id

Every query includes:

\`WHERE tenant_id = current_user.tenant_id\`

## 8. Frontend Architecture (Vite + React)

### 8.1 Architecture Pattern

- SPA (Single Page Application)
- Component-based architecture
- Centralized API client
- Global auth context

### 8.2 Frontend Modules

- Auth Module
- Dashboard Module
- Reporting Module
- Tenant Settings

### 8.3 State Management

- React Context for Auth
- Local component state for dashboards
- API caching layer optional (React Query future phase)

## 9. Infrastructure Layout (AWS)

### 9.1 Deployment

- Frontend hosted on S3 + CloudFront
- Backend on EC2 or ECS
- PostgreSQL via AWS RDS
- CloudWatch for logging

### 9.2 Load Handling

For 3,000 DAU:

- Single app instance sufficient
- Enable auto-scaling group
- Horizontal scaling supported

## 10. Performance Design

**Targets:**

- API < 300ms (95th percentile)
- Dashboard < 3 seconds load

**Strategies:**

- Database indexing
- Query optimization
- Caching aggregated metrics (optional)
- Stateless API servers

## 11. Security Design

- TLS (HTTPS only)
- AES-256 encryption at rest (RDS default)
- Bcrypt password hashing
- JWT expiry validation
- Input validation via Pydantic
- SQL injection prevention (ORM parameterization)

## 12. Observability & Monitoring

- AWS CloudWatch logs
- Application-level structured logging
- Error tracking (future: Sentry)
- Health check endpoint: GET /health

## 13. Scalability Strategy

**Current:** 3,000 DAU

**Future-ready:**

- Horizontal API scaling
- DB read replicas
- Caching layer (Redis)
- Event-driven reporting pipeline

## 14. Failure Handling

- Graceful error responses
- JWT expiry handling
- Retry logic on frontend
- DB connection pooling

## 15. Future Evolution

**Phase 2:**

- Decision analytics integration
- Audit logs
- Advanced role types
- Multi-region support
- Real-time streaming metrics

## 16. System Characteristics Summary

| Attribute | Strategy |
|-----------|----------|
| Scalability | Horizontal API scaling |
| Reliability | 99.5% uptime target |
| Security | JWT + bcrypt + TLS |
| Isolation | Tenant-scoped data |
| Architecture | Modular monolith (MVP) |
| Deployment | Single AWS region |

---

*End of System Design — Version 1.0*
`
