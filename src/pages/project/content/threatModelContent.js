// Threat Model Document – Startup Analytics Dashboard
// Assets, threat actors, threats, mitigations, risk matrix

export const THREAT_MODEL_CONTENT = `# Threat Model Document

**Project:** Startup Analytics Dashboard  
**Version:** 1.0  
**Date:** February 2026  
**Status:** Draft

This document describes assets, threat actors, threats, and security controls for the Startup Analytics Dashboard MVP.

---

## 1. Scope

- **In scope:** Web application (React SPA), REST API (FastAPI), PostgreSQL (RDS), AWS deployment (single region), multi-tenant data isolation.
- **Out of scope (MVP):** Third-party integrations, mobile apps, offline sync, multi-region failover.

---

## 2. Assets

| Asset | Description | Sensitivity |
|-------|-------------|-------------|
| User credentials | Email, password hashes (bcrypt) | High |
| JWT / refresh tokens | Session and API access | High |
| Tenant and user data | Org name, user profiles, roles | Medium |
| Metric and dashboard data | Business metrics, KPI values | Medium–High |
| Export files (CSV) | Generated reports | Medium |
| Application logs | Request logs, errors | Low–Medium |
| Infrastructure config | Terraform, env vars, secrets | High |

---

## 3. Trust Boundaries

- **Internet ↔ CloudFront / ALB:** Untrusted. All traffic over HTTPS (TLS).
- **ALB ↔ Backend (ECS):** Internal VPC. Treat as trusted network; still validate all inputs.
- **Backend ↔ RDS:** Private subnet. DB credentials in secrets manager; no public access.
- **Backend ↔ S3:** Private access via IAM; pre-signed URLs for user-facing exports.
- **Browser ↔ API:** Same-origin or allowed CORS; auth via JWT in \`Authorization\` header.

---

## 4. Threat Actors

| Actor | Motivation | Capability |
|-------|------------|------------|
| External attacker | Data theft, service disruption | Network attacks, credential stuffing, scanning |
| Malicious tenant user | Access other tenants’ data, abuse API | Authenticated access within one tenant |
| Insider (developer) | Misuse of access to code or prod | Access to repo, CI, cloud console (minimized) |
| Automated bot | Scraping, brute force, abuse of endpoints | High volume, scripted requests |

---

## 5. Threat List (STRIDE-style)

### 5.1 Spoofing

| ID | Threat | Asset | Mitigation |
|----|--------|-------|------------|
| T-S1 | Attacker impersonates user via stolen or guessed credentials | User credentials, JWT | Strong password policy, bcrypt, rate limiting on login, short-lived JWT + refresh |
| T-S2 | Forged or replayed JWT | JWT | Signed JWT (e.g. RS256), expiry, refresh rotation |

### 5.2 Tampering

| ID | Threat | Asset | Mitigation |
|----|--------|-------|------------|
| T-T1 | Tampering with API request/response in transit | All data in transit | TLS 1.2+ (HTTPS) only |
| T-T2 | Tampering with tenant data by another tenant | Tenant data | Strict \`tenant_id\` filtering; no cross-tenant access in queries |
| T-T3 | Tampering with static assets or frontend | Frontend, config | S3 + CloudFront; integrity checks; no secrets in frontend |

### 5.3 Repudiation

| ID | Threat | Asset | Mitigation |
|----|--------|-------|------------|
| T-R1 | User denies having performed an action | Application logs | Structured logging (user id, tenant, action); log retention policy |
| T-R2 | No trace of who accessed sensitive data | Access to DB, exports | Audit logging (future); access to prod DB restricted and logged |

### 5.4 Information Disclosure

| ID | Threat | Asset | Mitigation |
|----|--------|-------|------------|
| T-I1 | Leak of credentials or tokens | Credentials, JWT | Passwords hashed; tokens in httpOnly cookie or memory; no tokens in URLs |
| T-I2 | Leak of tenant data to another tenant | Tenant data | Every query filtered by \`tenant_id\`; integration tests for isolation |
| T-I3 | Sensitive data in logs or errors | Logs | No passwords/tokens in logs; sanitize stack traces in responses |
| T-I4 | Metadata leakage (headers, error messages) | API, app | Consistent error format; no internal paths or versions in 4xx/5xx |

### 5.5 Denial of Service

| ID | Threat | Asset | Mitigation |
|----|--------|-------|------------|
| T-D1 | API overload (e.g. expensive queries or high request rate) | API, DB | Rate limiting per tenant; pagination and query limits; timeouts |
| T-D2 | Resource exhaustion (CPU, memory, connections) | Backend, RDS | Bounded concurrency; connection pooling; auto-scaling with limits |
| T-D3 | Large export or report generation blocks others | Backend | Async or queue for large exports; pre-signed URL delivery |

### 5.6 Elevation of Privilege

| ID | Threat | Asset | Mitigation |
|----|--------|-------|------------|
| T-E1 | User gains Admin capabilities within tenant | Roles | Role checked on every privileged endpoint; role stored in JWT and DB |
| T-E2 | Backend or DB runs with excessive IAM/DB permissions | Infrastructure | Least privilege IAM roles; DB user with minimal required grants |
| T-E3 | Dependency or library vulnerability | Application | Dependency scanning in CI; patch policy; no unnecessary packages |

---

## 6. Risk Summary

| Risk ID | Severity | Likelihood | Notes |
|---------|----------|------------|-------|
| T-S1 | High | Medium | Credential stuffing; mitigations in place |
| T-S2 | High | Low | JWT signing and expiry |
| T-T1 | High | Low | TLS enforced |
| T-T2 | High | Medium | Critical: tenant isolation tested |
| T-I2 | High | Medium | Critical: tenant isolation tested |
| T-D1 | Medium | Medium | Rate limiting and limits |
| T-E1 | High | Low | Role enforcement on API |

**Overall:** MVP assumes single-region, no audit log persistence yet. Post-MVP: audit log storage, WAF, and optional WAF/DDoS protection.

---

## 7. Security Controls Checklist

- [ ] HTTPS only (TLS 1.2+); no mixed content
- [ ] Passwords hashed with bcrypt; no plaintext storage
- [ ] JWT signed (e.g. RS256), short-lived; refresh token rotation
- [ ] All API queries scoped by \`tenant_id\`
- [ ] Role (Admin/Member) enforced on sensitive endpoints
- [ ] Rate limiting per tenant (e.g. 100 req/min)
- [ ] Input validation (e.g. Pydantic); parameterized queries (no raw SQL concatenation)
- [ ] No secrets in frontend or in logs
- [ ] DB in private subnet; secrets in AWS Secrets Manager
- [ ] CORS restricted to known frontend origins
- [ ] Dependency and SAST in CI (post-MVP: formalized)
`
