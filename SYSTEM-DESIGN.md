# System Design - Volunteer Yatra

A detailed technical overview of the system architecture, data flow, and design decisions behind the Volunteer Yatra platform.

---

## Table of Contents

- [System Architecture](#system-architecture)
- [Frontend Design](#frontend-design)
- [Backend Design](#backend-design)
- [Database Design](#database-design)
- [Data Flow](#data-flow)
- [File Storage Strategy](#file-storage-strategy)
- [Error Handling Strategy](#error-handling-strategy)
- [Security Architecture](#security-architecture)
- [Performance and Scalability](#performance-and-scalability)

---

## System Architecture

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#059669', 'primaryTextColor': '#fff', 'lineColor': '#94a3b8', 'fontFamily': 'Inter, sans-serif'}}}%%
graph TB
    subgraph Client["Client Layer"]
        B[("Browser")]
        N["Next.js 15\nReact 19\nTypeScript"]
    end

    subgraph CDN["CDN Layer"]
        VC["Vercel Edge Network\nGlobal CDN\nAutomatic Caching"]
    end

    subgraph Server["Server Layer"]
        EX["Express.js 5\nTypeScript\nMiddleware Pipeline"]
        API[("REST API\n/api/*")]
    end

    subgraph Data["Data Layer"]
        PG[("Supabase PostgreSQL\nusers / events / participants")]
        SB[("Supabase Storage\nevent-covers / avatars")]
        RT["Real-time Subscriptions"]
    end

    subgraph External["External Integrations"]
        RS["Resend API\nTransactional Email"]
        OM["OpenStreetMap\nLocation Geocoding"]
    end

    B -->|"HTTPS"| N
    N -->|"Deployed on"| VC
    VC -->|"API Calls"| EX
    EX -->|"CRUD Queries"| API
    API -->|"SQL"| PG
    API -->|"File Upload"| SB
    PG -->|"Real-time"| RT
    RT -->|"WebSocket"| N
    EX -->|"Email"| RS
    EX -->|"Geocode"| OM

    style Client fill:#059669,color:#fff,stroke:#047857,stroke-width:2px
    style CDN fill:#2563eb,color:#fff,stroke:#1d4ed8,stroke-width:2px
    style Server fill:#7c3aed,color:#fff,stroke:#6d28d9,stroke-width:2px
    style Data fill:#0f172a,color:#fff,stroke:#1e293b,stroke-width:2px
    style External fill:#d97706,color:#fff,stroke:#b45309,stroke-width:2px
```

### Key Architectural Decisions

| Decision | Rationale | Trade-off |
|---|---|---|
| Supabase over raw PostgreSQL | Built-in real-time subscriptions, file storage, auth | Vendor lock-in, no custom extensions |
| RTK Query over React Query | Tight Redux integration, cache tag invalidation patterns | Larger bundle size |
| Server-side pagination | Scales to millions of events without client memory issues | More complex API queries |
| Fire-and-forget emails | API responses not blocked by email latency | No retry on failure guarantee |
| Supabase Storage over local FS | Horizontal scaling, CDN delivery, no disk management | Network latency for uploads |

---

## Frontend Design

### Layer Architecture

The frontend follows a strict unidirectional dependency model. Each layer can only import from layers below it.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#059669', 'primaryTextColor': '#fff', 'lineColor': '#94a3b8', 'fontFamily': 'Inter, sans-serif'}}}%%
flowchart TB
    subgraph Layer1["Layer 1 - Pages"]
        direction LR
        P1["app/(authenticated)/"]
        P2["app/(guest)/"]
    end

    subgraph Layer2["Layer 2 - Feature Components"]
        C1["events/components/"]
        C2["participants/components/"]
        C3["auth/components/"]
        C4["settings/components/"]
    end

    subgraph Layer3["Layer 3 - Feature Hooks"]
        H1["events/hooks/"]
        H2["participants/hooks/"]
        H3["auth/hooks/"]
        H4["settings/hooks/"]
    end

    subgraph Layer4["Layer 4 - Feature Services"]
        S1["events/services/"]
        S2["participants/services/"]
        S3["auth/services/"]
    end

    subgraph Layer5["Layer 5 - Common & Store"]
        CM["common/api/\nAxios + Routes"]
        TYPES["common/types/\nTypeScript Interfaces"]
        UTILS["common/utils/\nDate, Validation, Notify"]
        STORE["store/\nRedux Store Config"]
    end

    subgraph UI["Design System"]
        UI1["components/ui/\nButton, Input, Card, Table\nCharts, Maps, DatePicker"]
    end

    P1 --> C1
    P1 --> C2
    P2 --> C3
    P2 --> C4

    C1 --> H1
    C2 --> H2
    C3 --> H3
    C4 --> H4

    C1 --> UI1
    C2 --> UI1

    H1 --> S1
    H1 --> UTILS
    H2 --> S2
    H3 --> S3

    S1 --> CM
    S1 --> TYPES
    S1 --> STORE
    S2 --> CM
    S3 --> CM

    style Layer1 fill:#059669,color:#fff,stroke:#047857,stroke-width:2px
    style Layer2 fill:#10b981,color:#fff,stroke:#059669,stroke-width:1px
    style Layer3 fill:#3b82f6,color:#fff,stroke:#2563eb,stroke-width:1px
    style Layer4 fill:#8b5cf6,color:#fff,stroke:#7c3aed,stroke-width:1px
    style Layer5 fill:#f59e0b,color:#fff,stroke:#d97706,stroke-width:2px
    style UI fill:#ec4899,color:#fff,stroke:#db2777,stroke-width:2px
```

### State Management with RTK Query

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#059669', 'primaryTextColor': '#fff', 'lineColor': '#94a3b8', 'fontFamily': 'Inter, sans-serif'}}}%%
flowchart LR
    subgraph Mutations["Mutations"]
        M1["createEvent"]
        M2["updateEvent"]
        M3["deleteEvent"]
        M4["applyToEvent"]
    end

    subgraph Cache["Cache Tags"]
        T1["Events"]
        T2["Event:{id}"]
        T3["Participants"]
        T4["DashboardStats"]
    end

    subgraph Queries["Auto-refetched Queries"]
        Q1["useListEventsQuery"]
        Q2["useGetEventQuery"]
        Q3["useListParticipantsQuery"]
        Q4["useGetDashboardStatsQuery"]
    end

    M1 -->|"invalidates"| T1
    M1 -->|"invalidates"| T4
    M2 -->|"invalidates"| T1
    M2 -->|"invalidates"| T2
    M3 -->|"invalidates"| T1
    M3 -->|"invalidates"| T4
    M4 -->|"invalidates"| T3

    T1 -->|"refetches"| Q1
    T2 -->|"refetches"| Q2
    T3 -->|"refetches"| Q3
    T4 -->|"refetches"| Q4

    style Mutations fill:#dc2626,color:#fff,stroke:#b91c1c,stroke-width:2px
    style Cache fill:#d97706,color:#fff,stroke:#b45309,stroke-width:2px
    style Queries fill:#059669,color:#fff,stroke:#047857,stroke-width:2px
```

### Design System

The UI component library uses CSS variables for theming, enabling dark/light mode without component changes:

- **Button** - variants: primary, secondary, danger, ghost
- **DataTable** - sorting, resizing, column visibility, pagination, search
- **DateRangePicker** - presets (7d, 14d, 30d, 90d), custom range, dual-calendar
- **Charts** - bar charts, pie charts with adaptive intervals
- **Modal** - confirmation dialogs with loading states
- **Skeleton** - loading placeholders for every view

---

## Backend Design

### Module Structure

Each backend module follows a strict three-layer pattern:

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#2563eb', 'primaryTextColor': '#fff', 'lineColor': '#94a3b8', 'fontFamily': 'Inter, sans-serif'}}}%%
flowchart TB
    subgraph Request["HTTP Request Flow"]
        REQ["Incoming Request"]
        AUTH["authenticate.ts\nJWT Verification"]
        VAL["validate.ts\nZod Schema"]
        CTRL["controller\nBusiness Logic"]
        RES["JSON Response"]
    end

    subgraph Module["Module Structure"]
        R["*.routes.ts\nEndpoints + Middleware"]
        C["*.controller.ts\nParse -> Authorize -> Call Model -> Respond"]
        M["*.model.ts\nSupabase Queries -> Typed Data"]
    end

    REQ --> AUTH
    AUTH --> VAL
    VAL --> CTRL
    CTRL --> RES

    R --> C
    C --> M

    style Request fill:#1e40af,color:#fff,stroke:#1e3a8a,stroke-width:2px
    style Module fill:#059669,color:#fff,stroke:#047857,stroke-width:2px
```

### Participant Registration Flow

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#059669', 'primaryTextColor': '#fff', 'lineColor': '#94a3b8', 'fontFamily': 'Inter, sans-serif'}}}%%
flowchart TB
    START["User clicks Apply"]
    CHECK_EVENT["1. Event Exists?"]
    CHECK_CAP["2. Capacity Available?"]
    CHECK_DEAD["3. Deadline Passed?"]
    CHECK_DUP["4. Already Applied?"]
    CHECK_STATUS{"5. Existing Registration Status?"}
    REACTIVATE["Re-activate Cancelled Registration"]
    INSERT["Insert New Registration"]
    SEND_EMAIL["Send Confirmation Email (async)"]
    DONE["201 Created / 200 Re-activated"]

    START --> CHECK_EVENT
    CHECK_EVENT -->|"Not found"| ERR_404["404 Not Found"]
    CHECK_EVENT -->|"Found"| CHECK_CAP
    CHECK_CAP -->|"Full"| ERR_FULL["400 Event Full"]
    CHECK_CAP -->|"Available"| CHECK_DEAD
    CHECK_DEAD -->|"Expired"| ERR_DEAD["400 Deadline Passed"]
    CHECK_DEAD -->|"Open"| CHECK_DUP
    CHECK_DUP -->|"No existing"| INSERT
    CHECK_DUP -->|"Found"| CHECK_STATUS
    CHECK_STATUS -->|"Applied"| ERR_DUP["409 Already Applied"]
    CHECK_STATUS -->|"Cancelled"| REACTIVATE
    INSERT --> SEND_EMAIL
    REACTIVATE --> DONE
    SEND_EMAIL --> DONE

    style START fill:#059669,color:#fff,stroke:#047857
    style DONE fill:#059669,color:#fff,stroke:#047857
    style ERR_404 fill:#dc2626,color:#fff,stroke:#b91c1c
    style ERR_FULL fill:#dc2626,color:#fff,stroke:#b91c1c
    style ERR_DEAD fill:#dc2626,color:#fff,stroke:#b91c1c
    style ERR_DUP fill:#dc2626,color:#fff,stroke:#b91c1c
```

---

## Database Design

### Entity Relationship Diagram

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#059669', 'primaryTextColor': '#fff', 'lineColor': '#94a3b8', 'fontFamily': 'Inter, sans-serif'}}}%%
erDiagram
    users {
        uuid id PK "gen_random_uuid()"
        text email UK "unique, indexed"
        text password "bcrypt, salt=10"
        text name
        text avatar_url "nullable, Supabase Storage URL"
        timestamptz created_at "default now()"
    }

    events {
        uuid id PK "gen_random_uuid()"
        text name "not null"
        text description "nullable"
        date date "not null, indexed"
        text location "nullable"
        text status "backlog|in_progress|completed"
        uuid owner_id FK "not null, indexed"
        text category "default 'other'"
        integer max_participants "nullable, capacity limit"
        text registration_deadline "nullable"
        text start_time "nullable"
        text end_time "nullable"
        text cover_image_url "nullable, Supabase Storage URL"
        timestamptz created_at "default now()"
        timestamptz updated_at "default now()"
    }

    participants {
        uuid id PK "gen_random_uuid()"
        uuid event_id FK "not null, indexed, cascade delete"
        uuid user_id FK "nullable for guest, indexed"
        text name "not null"
        text email "not null"
        text status "applied|cancelled, default applied"
        text cancellation_reason "nullable"
        timestamptz created_at "default now()"
    }

    users ||--o{ events : "owner"
    users ||--o{ participants : "registrant"
    events ||--o{ participants : "participants"

    events }|--|| participants : "contains"
```

### Constraints and Integrity

| Constraint Type | Table | Columns | Purpose |
|---|---|---|---|
| Primary Key | users | id | Unique user identification |
| Primary Key | events | id | Unique event identification |
| Primary Key | participants | id | Unique participant identification |
| Unique | users | email | Prevent duplicate accounts |
| Unique | participants | event_id, user_id | Prevent duplicate registrations |
| Foreign Key | events | owner_id -> users.id | Ensure valid owner |
| Foreign Key | participants | event_id -> events.id | Ensure valid event |
| Foreign Key | participants | user_id -> users.id | Ensure valid user (nullable) |
| Check | events | status IN (backlog, in_progress, completed) | Valid status values |
| Check | participants | status IN (applied, cancelled) | Valid status values |

---

## Data Flow

### Complete Request Cycle

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#059669', 'primaryTextColor': '#fff', 'lineColor': '#94a3b8', 'fontFamily': 'Inter, sans-serif', 'actorBkg': '#f1f5f9', 'actorTextColor': '#0f172a', 'actorBorder': '#cbd5e1', 'signalColor': '#059669', 'signalTextColor': '#059669'}}}%%
sequenceDiagram
    participant User as Browser
    participant Next as Next.js
    participant Hook as Feature Hook
    participant Service as RTK Query
    participant API as Express API
    participant DB as Supabase

    User->>Next: Navigate to /events
    Next->>Hook: Mount EventListPage
    Hook->>Service: useListEventsQuery({dateFrom, dateTo, status, page})
    Service->>API: GET /api/events?dateFrom=...&dateTo=...

    Note over API: authenticate middleware
    Note over API: validate middleware (query params)

    API->>DB: SELECT * FROM events WHERE date >= $1 AND date <= $2
    DB-->>API: [events with count]

    API-->>Service: { success, data: Event[], pagination }
    Service-->>Hook: Cached Event[] data
    Hook-->>Next: events, isLoading, error
    Next-->>User: Rendered table with filters

    User->>Next: Set date range filter
    Next->>Hook: handleFilterDateRange({from, to})
    Hook->>Service: Refetch with new query params
    Service->>API: GET /api/events?dateFrom=2024-01-01&dateTo=2024-12-31
    API->>DB: SELECT ... WHERE date BETWEEN $1 AND $2
    DB-->>API: Filtered results
    API-->>Service: Updated data
    Service-->>Hook: Cache invalidated, new data
    Hook-->>Next: Re-render with filtered events
    Next-->>User: Updated table
```

---

## File Storage Strategy

### Architecture Decision Record

**Context:** The application needed to store user avatars and event cover images. Initial implementation used the local server filesystem.

**Problem:** Local filesystem storage prevented horizontal scaling (files not shared across instances), consumed server disk space, and files were lost on redeploy.

**Decision:** Migrate to Supabase Storage.

**Consequences:**
- Files stored redundantly in cloud infrastructure
- Storage decoupled from application server (enables horizontal scaling)
- Files served via CDN for reduced server load
- Pay-per-use pricing eliminates wasted disk allocation

### Storage Architecture

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#7c3aed', 'primaryTextColor': '#fff', 'lineColor': '#94a3b8', 'fontFamily': 'Inter, sans-serif'}}}%%
flowchart LR
    subgraph Upload["Upload Flow"]
        FE["Frontend\nSelect File"]
        BE["Express API\n/api/upload"]
        VALI["Validate\nType + Size"]
        UUID["Generate UUID\nFilename"]
        SB["Supabase Storage\nUpload API"]
        URL["Return Public URL"]
        DB["Store URL in\nPostgreSQL"]
    end

    subgraph Buckets["Storage Buckets"]
        C["event-covers\nPublic\nEvent Images"]
        A["avatars\nPublic\nProfile Photos"]
    end

    FE -->|"multipart/form-data"| BE
    BE --> VALI
    VALI -->|"JPEG/PNG/WebP/GIF"| UUID
    UUID --> SB
    SB --> C
    SB --> A
    SB --> URL
    URL --> DB

    style Upload fill:#7c3aed,color:#fff,stroke:#6d28d9,stroke-width:2px
    style Buckets fill:#059669,color:#fff,stroke:#047857,stroke-width:2px
```

### Validation Rules

| Check | Rule | Error Response |
|---|---|---|
| File type | JPEG, PNG, WebP, GIF | 400 INVALID_FILE_TYPE |
| File size | Max 5MB | 400 FILE_TOO_LARGE |
| No file | File required | 400 NO_FILE |

---

## Error Handling Strategy

### Consistent Error Responses

Every API error follows a uniform JSON structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description"
  }
}
```

Validation errors include field-level details:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "name", "message": "Name is required" }
    ]
  }
}
```

### Error Classification

| Error Code | HTTP Status | Source | Description |
|---|---|---|---|
| VALIDATION_ERROR | 400 | Zod schemas | Request body or params fail validation |
| NOT_FOUND | 404 | Controller | Requested resource does not exist |
| AUTHENTICATION_ERROR | 401 | authenticate middleware | Missing, expired, or invalid JWT |
| FORBIDDEN | 403 | Controller | User lacks ownership permissions |
| ALREADY_APPLIED | 409 | participants controller | Duplicate registration attempt |
| DATABASE_ERROR | 500 | model layer | Supabase query error |
| EVENT_FULL | 400 | participants controller | Capacity limit reached |
| DEADLINE_PASSED | 400 | participants controller | Registration closed |

### Error Class Hierarchy

```
AppError (base class)
  +-- ValidationError (400, VALIDATION_ERROR)
  +-- NotFoundError (404, NOT_FOUND)
  +-- AuthenticationError (401, AUTHENTICATION_ERROR)
  +-- ForbiddenError (403, FORBIDDEN)
  +-- DatabaseError (500, DATABASE_ERROR)
```

Each class sets the HTTP status code and error code automatically, keeping error handling consistent across all controllers.

---

## Security Architecture

### Defense in Depth

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#dc2626', 'primaryTextColor': '#fff', 'lineColor': '#94a3b8', 'fontFamily': 'Inter, sans-serif'}}}%%
graph TB
    subgraph Perimeter["Perimeter Security"]
        HTTPS["TLS 1.3 Encryption\nAll traffic HTTPS-only"]
        CORS["CORS Whitelist\nFrontend origin only"]
    end

    subgraph AuthN["Authentication Layer"]
        JWT["JWT Bearer Tokens\nHS256, 7-day expiry"]
        BCRYPT["Password Storage\nbcrypt, salt factor 10"]
        RESET["Password Reset\nTime-limited tokens"]
    end

    subgraph AuthZ["Authorization Layer"]
        OWNER["Owner Verification\nuser_id vs owner_id"]
        ROUTE["Route Protection\nauthenticate middleware"]
        OWNER_CHECK["Controller-level Check\nEvery write operation"]
    end

    subgraph Validation["Input Validation Layer"]
        ZOD["Zod Schemas\nAll request bodies validated"]
        FILE_VAL["File Upload Validation\nMIME type + size check"]
        PARAM["Param Sanitization\nparseQuery helper"]
    end

    subgraph Output["Output Security"]
        ERR_SAFE["Safe Error Messages\nNo stack traces"]
        CSV_ESCAPE["CSV Escaping\nProper quote handling"]
    end

    HTTPS --> JWT
    CORS --> JWT
    JWT --> ROUTE
    BCRYPT --> JWT
    RESET --> JWT
    ROUTE --> OWNER
    OWNER --> OWNER_CHECK
    ROUTE --> ZOD
    ZOD --> FILE_VAL
    ZOD --> PARAM
    OWNER_CHECK --> ERR_SAFE
    FILE_VAL --> ERR_SAFE

    style Perimeter fill:#1e40af,color:#fff,stroke:#1e3a8a,stroke-width:2px
    style AuthN fill:#059669,color:#fff,stroke:#047857,stroke-width:2px
    style AuthZ fill:#d97706,color:#fff,stroke:#b45309,stroke-width:2px
    style Validation fill:#7c3aed,color:#fff,stroke:#6d28d9,stroke-width:2px
    style Output fill:#dc2626,color:#fff,stroke:#b91c1c,stroke-width:2px
```

### Security Measures Checklist

| Category | Measure | Implementation |
|---|---|---|
| Transport | TLS 1.3 | Vercel/HTTPS termination |
| Transport | CORS | Backend whitelist frontend origin |
| Authentication | JWT | HS256, 7-day expiry, Bearer token |
| Authentication | Password hashing | bcrypt, salt factor 10 |
| Authentication | Password reset | Time-limited tokens, email verification |
| Authorization | Owner check | req.userId vs event.owner_id |
| Authorization | Route guards | authenticate middleware on all protected routes |
| Validation | Request body | Zod schemas on every endpoint |
| Validation | File upload | MIME type check, 5MB size limit |
| Output | Error messages | Clean messages, no stack traces |
| Output | CSV export | Proper quote escaping for injection prevention |

---

## Performance and Scalability

### Caching Strategy

| Cache Layer | Mechanism | Benefit |
|---|---|---|
| Browser | RTK Query automatic caching | Instant page loads on revisit |
| Network | Next.js static generation | Pre-built pages served from CDN |
| Server | None (stateless API) | Enables horizontal scaling |
| Database | PostgreSQL indexes | Fast queries at any data size |

### Database Performance

- All WHERE clause columns are indexed
- Pagination uses Supabase .range() with LIMIT/OFFSET
- Count queries use `{ count: 'exact', head: true }` for performance
- Query filtering at database level, not in-memory

### Horizontal Scaling

The backend is fully stateless:
- No session data stored on server
- JWT contains all auth state
- Any instance can handle any request
- Load balancer distributes traffic arbitrarily

---

## Production Deployment

### Deployment Architecture

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#059669', 'primaryTextColor': '#fff', 'lineColor': '#94a3b8', 'fontFamily': 'Inter, sans-serif'}}}%%
graph LR
    subgraph Vercel["Vercel (Frontend)"]
        N1["Next.js Build\nStatic + SSR Pages"]
        EDGE["Edge Network\nGlobal CDN"]
    end

    subgraph Hosting["Hosting Platform (Backend)"]
        E1["Express Server\nNode.js Runtime"]
        E2["Express Server\nNode.js Runtime"]
        LB["Load Balancer"]
    end

    subgraph Supabase_["Supabase"]
        PG_["PostgreSQL\nDatabase"]
        SB_["Storage\nFile Buckets"]
        WS["Real-time\nWebSockets"]
    end

    subgraph Email["Resend"]
        EM["Email API\nTransactional"]
    end

    User --> EDGE
    EDGE --> N1
    N1 --> LB
    LB --> E1
    LB --> E2
    E1 --> PG_
    E2 --> PG_
    E1 --> SB_
    E2 --> SB_
    E1 --> EM
    E2 --> EM
    PG_ --> WS
    WS --> N1

    style Vercel fill:#2563eb,color:#fff,stroke:#1d4ed8,stroke-width:2px
    style Hosting fill:#7c3aed,color:#fff,stroke:#6d28d9,stroke-width:2px
    style Supabase_ fill:#059669,color:#fff,stroke:#047857,stroke-width:2px
    style Email fill:#d97706,color:#fff,stroke:#b45309,stroke-width:2px
```

### Deployment Checklist

1. Set JWT_SECRET to a strong, unique value (min 32 characters)
2. Configure Supabase production project URL and anon key
3. Run database migrations on production Supabase project
4. Create Storage buckets: event-covers, avatars
5. Set bucket visibility rules (public for both)
6. Configure Resend API key for email delivery
7. Set FRONTEND_URL to production frontend domain
8. Enable HTTPS (automatic with Vercel)
9. Configure environment variables on deployment platform
10. Enable a process manager (PM2) or container orchestration for backend

### Monitoring

| Metric | Tool | Purpose |
|---|---|---|
| Uptime | /api/health endpoint | Basic health checks |
| API errors | Global error handler logs | Debugging production issues |
| Database performance | Supabase dashboard | Query performance monitoring |
| Frontend performance | Next.js Analytics | Core Web Vitals tracking |
