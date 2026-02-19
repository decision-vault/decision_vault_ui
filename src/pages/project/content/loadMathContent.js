// Load estimation math – Startup Analytics Dashboard (target: 3,000 DAU)

export const LOAD_MATH_CONTENT = `# Load Estimation Math

**Project:** Startup Analytics Dashboard  
**Target:** 3,000 Daily Active Users (DAU)

---

## Assumptions (Define First)

You must always define assumptions before math.

**Given:**

- 3,000 Daily Active Users
- Single-region AWS
- REST API
- PostgreSQL
- Dashboard-heavy usage

---

## 1. Estimate Concurrent Users

DAU ≠ concurrent users.

**Typical SaaS concurrency rate:** 5%–15% of DAU at peak. We’ll use **10%** peak concurrency.

\`\`\`
Concurrent Users = 3,000 × 10%
                 = 300 concurrent users
\`\`\`

---

## 2. Estimate Requests Per User

**Assume:**

- **User session:**
  - 1 dashboard load
  - 5 API calls (charts)
  - 3 filter interactions
  - 2 background refreshes  
  - **≈ 10 API requests per active session**
- Average session = **10 minutes**
- Peak window = **1 hour**

---

## 3. Requests Per Second (RPS)

If **300 concurrent users**, each generating **1 request every 5 seconds** (average):

\`\`\`
RPS = 300 / 5
    = 60 requests per second
\`\`\`

**Safe estimate:** 50–70 RPS peak

---

## 4. Backend CPU Estimation

**Assume:**

- FastAPI request handling time ≈ **50ms CPU time**
- Each vCPU can handle **~20–40 RPS** safely

So for 60 RPS:

\`\`\`
Required vCPUs ≈ 60 / 30
               ≈ 2 vCPUs
\`\`\`

**Safe production buffer:** **2–4 vCPUs** total across instances

**Example:**

- 2 Fargate tasks
- Each 1 vCPU
- Auto-scale to 4 if needed

---

## 5. Database Load Estimation

Each request likely makes **1–3 queries**. Assume:

\`\`\`
60 RPS × 2 queries = 120 queries/sec
\`\`\`

PostgreSQL **t3.micro** can handle ~100–200 QPS (simple queries).

**For safety:**

- Start with **db.t3.small**
- Enable **connection pooling**
- Add indexes on: **tenant_id**, **recorded_at**, **category**

---

## 6. Memory Estimation

**FastAPI instance:**

- Base memory ~**150MB**
- Per request ~**1–2MB** temporary

For 300 concurrent, worst case:

\`\`\`
300 × 2MB = 600MB
\`\`\`

Add base + buffer: **1GB memory per instance** safe

**So:** 2 instances × 1GB

---

## 7. Network Bandwidth

**Dashboard JSON response:** ~50KB per response average

\`\`\`
60 RPS × 50KB = 3,000 KB/sec ≈ 3 MB/sec ≈ 24 Mbps
\`\`\`

This is very manageable.

---

## 8. Storage Growth Estimation

**Assume:**

- Each user generates: **100 metrics per month**
- Each row ~**200 bytes**

\`\`\`
3,000 users × 100 × 200 bytes = 60,000,000 bytes ≈ 60 MB per month
\`\`\`

**1 year:** 60 MB × 12 = **720 MB**

Very small. Even 10× growth = manageable.

---

## 9. Cost Estimation (Rough Order, Monthly)

**Approximate AWS costs:**

| Component | Estimated |
|-----------|-----------|
| ECS (2 small tasks) | $60–120 |
| RDS t3.small | $40–70 |
| ALB | $20 |
| S3 | $5 |
| Data transfer | $10–20 |
| CloudWatch | $10 |

**Total:** **~$150–250/month**

Very affordable for 3,000 DAU.

---

## 10. Auto-Scaling Thresholds

Scale when:

- **CPU** > 60%
- **RPS** > 80
- **DB CPU** > 70%
- **DB connections** > 80%

---

## Summary Capacity Plan

| Metric | Value |
|--------|-------|
| DAU | 3,000 |
| Concurrent Users | 300 |
| Peak RPS | 60 |
| Required vCPU | 2–4 |
| Required RAM | 2–4 GB total |
| DB Instance | t3.small |
| Monthly Infra Cost | ~$200 |

---

## Important Insight

At **3,000 DAU** you do **not** need:

- Microservices
- Kafka
- Redis (yet)
- Multi-region
- Sharding

Your architecture is correct.
`
