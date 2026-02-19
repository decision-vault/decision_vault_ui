// API Plan Document – Startup Analytics Dashboard
// REST API specification: base URL, versioning, auth, endpoints, payloads, errors

export const API_PLAN_CONTENT = `# API Plan Document

**Project:** Startup Analytics Dashboard  
**Version:** 1.0  
**Date:** February 2026  
**Base URL:** \`https://api.example.com\` (configurable per environment)

---

## 1. Overview

This document defines the REST API plan for the Startup Analytics Dashboard backend. All endpoints are tenant-scoped; \`tenant_id\` is derived from the authenticated user and must not be passed in request bodies for tenant resources.

**Design principles:**

- REST over HTTP/HTTPS
- JSON request and response bodies
- JWT in \`Authorization: Bearer <token>\`
- Semantic HTTP status codes
- Consistent error payload shape

---

## 2. Versioning

- **URL path versioning:** \`/api/v1/\`
- Current version: **v1**
- Deprecation: new minor versions (e.g. v2) will be introduced via path; v1 supported for at least 6 months after v2 release.
- **Header (optional):** \`Accept: application/vnd.api+json; version=1\`

---

## 3. Authentication

### 3.1 Obtaining a token

- **Login:** \`POST /api/v1/auth/login\`
- **Refresh:** \`POST /api/v1/auth/refresh\` (with valid refresh token in body or cookie)

### 3.2 Using the token

- **Header:** \`Authorization: Bearer <access_token>\`
- **Access token expiry:** 15 minutes
- **Refresh token expiry:** 7 days

### 3.3 Unauthenticated endpoints

Only the following do not require \`Authorization\`:

- \`POST /api/v1/auth/login\`
- Health: \`GET /api/v1/health\` (if implemented)

All other endpoints return \`401 Unauthorized\` when the token is missing or invalid.

---

## 4. Rate Limiting

- **Default:** 100 requests per minute per tenant (configurable).
- **Response when exceeded:** \`429 Too Many Requests\`
- **Headers:** \`X-RateLimit-Limit\`, \`X-RateLimit-Remaining\`, \`X-RateLimit-Reset\`
- **Scope:** Per tenant (tenant identified by JWT).

---

## 5. Common Conventions

### 5.1 Request IDs

- Server may send \`X-Request-Id\` on responses for support and logging.
- Client should not send request IDs unless specified in a later version.

### 5.2 Timestamps

- All timestamps in ISO 8601 UTC: \`2026-02-19T10:30:00Z\`

### 5.3 Pagination

- **Query params:** \`page\` (1-based), \`page_size\` (default 20, max 100).
- **Response:** \`meta\` object with \`total\`, \`page\`, \`page_size\`, \`total_pages\`.

### 5.4 Filtering and sorting

- **Filter:** \`?field=value\` or \`?filter[field]=value\` as needed per endpoint.
- **Sort:** \`?sort=field\` or \`?sort=-field\` for descending.

---

## 6. Error Response Format

All errors use a consistent JSON shape:

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": []
  }
}
\`\`\`

**Common codes:**

| HTTP | Code | Meaning |
|------|------|---------|
| 400 | BAD_REQUEST | Malformed request body or query |
| 401 | UNAUTHORIZED | Missing or invalid token |
| 403 | FORBIDDEN | Valid token but insufficient permissions |
| 404 | NOT_FOUND | Resource not found (or not in tenant) |
| 409 | CONFLICT | e.g. duplicate email in tenant |
| 422 | VALIDATION_ERROR | Schema validation failed (details in \`details\`) |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |

---

## 7. Endpoint Reference

### 7.1 Auth

#### POST /api/v1/auth/login

**Request:**

\`\`\`json
{
  "email": "user@example.com",
  "password": "plaintext-password"
}
\`\`\`

**Response (200):**

\`\`\`json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 900
}
\`\`\`

**Errors:** 401 (invalid credentials), 422 (validation).

---

#### POST /api/v1/auth/refresh

**Request:**

\`\`\`json
{
  "refresh_token": "eyJ..."
}
\`\`\`

**Response (200):** Same shape as login.

**Errors:** 401 (invalid or expired refresh token), 422 (validation).

---

#### POST /api/v1/auth/logout

**Headers:** \`Authorization: Bearer <token>\`

**Request body:** Optional \`{ "refresh_token": "..." }\` to invalidate refresh token server-side.

**Response (204):** No content.

---

### 7.2 Tenant

#### GET /api/v1/tenants/me

**Headers:** \`Authorization: Bearer <token>\`

**Response (200):**

\`\`\`json
{
  "id": "uuid",
  "name": "Acme Inc",
  "created_at": "2026-02-19T10:30:00Z"
}
\`\`\`

**Errors:** 401.

---

### 7.3 Users

#### GET /api/v1/users/me

**Headers:** \`Authorization: Bearer <token>\`

**Response (200):**

\`\`\`json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "email": "user@example.com",
  "role": "admin",
  "created_at": "2026-02-19T10:30:00Z"
}
\`\`\`

**Errors:** 401.

---

#### POST /api/v1/users

**Headers:** \`Authorization: Bearer <token>\` (Admin only for creating users in same tenant)

**Request:**

\`\`\`json
{
  "email": "newuser@example.com",
  "password": "plaintext-password",
  "role": "member"
}
\`\`\`

**Response (201):** User object (excluding \`password\`).

**Errors:** 403 (non-admin), 409 (email already exists in tenant), 422 (validation).

---

### 7.4 Metrics

#### GET /api/v1/metrics

**Query:** \`page\`, \`page_size\`, \`category\`, \`from_date\`, \`to_date\`, \`sort\`

**Response (200):** Paginated list of metrics:

\`\`\`json
{
  "data": [
    {
      "id": "uuid",
      "tenant_id": "uuid",
      "name": "Revenue",
      "category": "finance",
      "value": 12500.50,
      "recorded_at": "2026-02-19T00:00:00Z",
      "created_at": "2026-02-19T10:30:00Z"
    }
  ],
  "meta": { "total": 42, "page": 1, "page_size": 20, "total_pages": 3 }
}
\`\`\`

---

#### POST /api/v1/metrics

**Request:**

\`\`\`json
{
  "name": "Revenue",
  "category": "finance",
  "value": 12500.50,
  "recorded_at": "2026-02-19T00:00:00Z"
}
\`\`\`

**Response (201):** Created metric object.

**Errors:** 422 (validation), 403 if role cannot create metrics.

---

#### GET /api/v1/metrics/summary

**Query:** \`from_date\`, \`to_date\`, \`category\`

**Response (200):** Aggregated summary (e.g. count, sum, min, max per category or overall).

---

#### GET /api/v1/metrics/by-category

**Query:** \`from_date\`, \`to_date\`

**Response (200):** List of categories with aggregated values.

---

#### GET /api/v1/metrics/by-date

**Query:** \`from_date\`, \`to_date\`, \`granularity\` (day | week | month)

**Response (200):** Time-series data for charts.

---

### 7.5 Reporting

#### GET /api/v1/reports/summary

**Query:** \`from_date\`, \`to_date\`

**Response (200):** Summary report payload (KPIs, counts, top metrics).

---

#### GET /api/v1/reports/export

**Query:** \`format=csv\`, \`from_date\`, \`to_date\`

**Response (200):** CSV file (Content-Type: text/csv) or redirect to pre-signed S3 URL for large exports.

**Errors:** 422 (unsupported format), 429 (export rate limit).

---

## 8. Security Checklist

- [ ] All mutation endpoints require \`Authorization\`
- [ ] Tenant isolation enforced on every tenant-scoped resource
- [ ] Passwords never logged; only bcrypt hashes stored
- [ ] Input validation (e.g. Pydantic) on all request bodies
- [ ] Rate limiting applied per tenant
- [ ] CORS configured for known frontend origins only

---

## 9. Future API Additions (Post-MVP)

- **Dashboards API:** CRUD for saved dashboard configurations (e.g. \`GET/POST/PATCH/DELETE /api/v1/dashboards\`).
- **Webhooks:** Optional outbound webhooks for metric thresholds or report completion.
- **Bulk import:** \`POST /api/v1/metrics/bulk\` for CSV/JSON batch upload.
- **OpenAPI:** Published OpenAPI 3.0 spec at \`/api/v1/openapi.json\`.
`
