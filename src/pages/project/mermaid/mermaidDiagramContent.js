// PRD-based Mermaid diagrams (Startup Analytics Dashboard)
// Sequence diagrams + Architecture / system & data flow diagrams

// ---- Sequence diagrams ----

/** Login + Dashboard load (PRD §6.1 Auth, §6.3 Dashboard) */
export const PRD_LOGIN_DASHBOARD = `sequenceDiagram
    participant User
    participant Browser as React SPA
    participant API as FastAPI
    participant DB as PostgreSQL

    Note over User,DB: Login (PRD §6.1 Auth)
    User->>Browser: Email + password
    Browser->>API: POST /auth/login
    API->>DB: SELECT user (tenant_id)
    DB-->>API: user row
    API->>API: Verify bcrypt, issue JWT
    API-->>Browser: 200 JWT
    Browser-->>User: Dashboard

    Note over User,DB: Dashboard load (PRD §6.3)
    User->>Browser: View dashboard
    Browser->>API: GET /metrics (JWT, tenant_id)
    API->>DB: SELECT metrics WHERE tenant_id=?
    DB-->>API: metrics
    API-->>Browser: 200 JSON
    Browser-->>User: KPI cards, charts
`

/** CSV export flow (PRD §6.4 Reporting) */
export const PRD_CSV_EXPORT = `sequenceDiagram
    participant User
    participant Browser as React SPA
    participant API as FastAPI
    participant DB as PostgreSQL

    Note over User,DB: CSV export (PRD §6.4)
    User->>Browser: Export CSV
    Browser->>API: GET /reports/export?format=csv (JWT)
    API->>DB: Aggregation by tenant_id
    DB-->>API: data
    API-->>Browser: 200 CSV
    Browser-->>User: Download
`

/** Auth + Token refresh (PRD §6.1) */
export const PRD_AUTH_REFRESH = `sequenceDiagram
    participant User
    participant Browser as React SPA
    participant API as FastAPI
    participant DB as PostgreSQL

    Note over User,DB: Login
    User->>Browser: Email + password
    Browser->>API: POST /auth/login
    API->>DB: SELECT user
    DB-->>API: user row
    API-->>Browser: 200 JWT

    Note over User,DB: Token refresh
    Browser->>API: POST /auth/refresh (JWT)
    API->>API: Validate JWT
    API-->>Browser: 200 new JWT
    Browser-->>User: Session renewed
`

// ---- Architecture / system & data flow diagrams ----

/** High-level system architecture (System Design §2) – detailed */
export const ARCH_HIGH_LEVEL = `flowchart TB
    subgraph Client["Client Layer"]
        Browser["Browser (React SPA)"]
        Browser -->|"HTTPS (TLS)"| LB
    end
    subgraph AWS["AWS Single Region"]
        LB["Load Balancer (ALB)"]
        LB -->|"HTTP"| API
        API["FastAPI Backend (stateless)"]
        API -->|"SQL (tenant-scoped)"| DB
        API -->|"Exports"| S3
        API -->|"Logs"| CW
        DB[("PostgreSQL RDS")]
        S3["S3 (CSV export)"]
        CW["CloudWatch"]
    end
`

/** Data flow: user to dashboard – detailed */
export const ARCH_DATA_FLOW = `flowchart LR
    subgraph User["User"]
        U[User]
    end
    subgraph Frontend["React SPA (Vite)"]
        A[Auth Context]
        D[Dashboard]
        R[Reports]
        T[Tenant Settings]
    end
    subgraph API["FastAPI /api/v1"]
        AuthAPI["/auth/login, /refresh"]
        MetricsAPI["/metrics, /summary"]
        ReportsAPI["/reports/export"]
        TenantsAPI["/tenants/me"]
    end
    subgraph Data["PostgreSQL"]
        DB[(tenant, users, metric, dashboard, session)]
    end
    U --> A
    U --> D
    U --> R
    U --> T
    A -->|"JWT 15min"| AuthAPI
    D -->|"JWT + tenant_id"| MetricsAPI
    R -->|"JWT + format=csv"| ReportsAPI
    T -->|"JWT"| TenantsAPI
    AuthAPI --> DB
    MetricsAPI --> DB
    ReportsAPI --> DB
    TenantsAPI --> DB
`

/** Module view (System Design §3) – detailed */
export const ARCH_MODULES = `flowchart TB
    subgraph Frontend["Frontend (Vite + React)"]
        AuthM[Auth: login UI, JWT store]
        DashM[Dashboard: KPI, charts, filters]
        ReportM[Reporting: CSV export]
        TenantM[Tenant Settings]
    end
    subgraph Backend["Backend (FastAPI)"]
        AuthAPI["Auth: bcrypt, JWT 15m, refresh"]
        TenantAPI[Tenant: isolation, /tenants/me]
        UserAPI[User: /users/me, POST /users]
        DashAPI[Dashboard: /metrics, /summary, by-date]
        ReportAPI[Reporting: /reports/summary, export]
    end
    subgraph DB["PostgreSQL (tenant_id on all)"]
        T[tenant]
        U[users]
        M[metric]
        D[dashboard]
        S[session]
    end
    AuthM --> AuthAPI
    DashM --> DashAPI
    ReportM --> ReportAPI
    TenantM --> TenantAPI
    AuthAPI --> TenantAPI
    AuthAPI --> UserAPI
    DashAPI --> ReportAPI
    AuthAPI --> U
    TenantAPI --> T
    UserAPI --> U
    DashAPI --> M
    DashAPI --> D
    ReportAPI --> M
`

/** Layered architecture – full stack detail */
export const ARCH_LAYERED = `flowchart TB
    subgraph L1["Presentation Layer"]
        SPA["React SPA (Vite)"]
        Router["React Router"]
        Axios["Axios API client"]
        AuthCtx["Auth Context (JWT)"]
        SPA --> Router
        SPA --> AuthCtx
        SPA --> Axios
    end
    subgraph L2["API Layer"]
        LB["Load Balancer"]
        FastAPI["FastAPI"]
        Pydantic["Pydantic schemas"]
        JWT["JWT middleware"]
        TenantDep["Tenant dependency"]
        LB --> FastAPI
        FastAPI --> JWT
        FastAPI --> TenantDep
        FastAPI --> Pydantic
    end
    subgraph L3["Application & Data"]
        AuthMod[Auth: login, refresh, bcrypt]
        TenantMod[Tenant isolation]
        UserMod[User, roles Admin/Member]
        DashMod[Dashboard, metrics, KPI]
        ReportMod[Reporting, CSV]
        RDS[("PostgreSQL RDS")]
        AuthMod --> RDS
        TenantMod --> RDS
        UserMod --> RDS
        DashMod --> RDS
        ReportMod --> RDS
    end
    subgraph L4["Infrastructure"]
        S3["S3 exports"]
        CloudWatch["CloudWatch logs"]
    end
    Axios -->|HTTPS| LB
    JWT --> AuthMod
    TenantDep --> TenantMod
    Pydantic --> AuthMod
    Pydantic --> DashMod
    Pydantic --> ReportMod
    ReportMod --> S3
    FastAPI --> CloudWatch
`

/** AWS deployment (System Design §9) */
export const ARCH_DEPLOYMENT = `flowchart TB
    subgraph Client
        User[User Browser]
    end
    subgraph AWS["AWS Single Region"]
        subgraph Edge
            CF["CloudFront CDN"]
            S3Static["S3 (static build)"]
            CF --> S3Static
        end
        subgraph Compute
            ALB["Application Load Balancer"]
            ECS["ECS / EC2 FastAPI"]
            ALB --> ECS
        end
        subgraph Data
            RDS[("RDS PostgreSQL")]
        end
        subgraph Ops
            CW["CloudWatch"]
            S3Export["S3 (CSV export)"]
        end
        User -->|HTTPS| CF
        User -->|API calls| ALB
        ECS --> RDS
        ECS --> S3Export
        ECS --> CW
    end
`
