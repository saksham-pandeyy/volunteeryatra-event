# System Design - Volunteer Yatra

A detailed technical overview of the system architecture, data flow, and design decisions behind the Volunteer Yatra platform.

---

## Table of Contents

- [System Architecture](#system-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database Design](#database-design)
- [Data Flow](#data-flow)
- [File Storage Strategy](#file-storage-strategy)
- [Error Handling Strategy](#error-handling-strategy)
- [Security Architecture](#security-architecture)
- [Performance and Scalability](#performance-and-scalability)

---

## System Architecture

Volunteer Yatra is a full-stack web application with three distinct layers:

- **Next.js frontend** handles user interface, routing, state management, client-side validation, and API communication.
- **Express.js backend** handles business logic, authentication, file uploads, authorization, and data access.
- **Supabase** provides the PostgreSQL database, file storage buckets, and real-time subscription capabilities.

The frontend and backend communicate exclusively through a REST API over HTTP. The frontend never connects directly to the database. All data access is mediated by the backend, which validates requests, enforces permissions, and returns structured JSON responses.

### Communication Flow

```
Browser -> Next.js (Pages) -> Feature Components -> Hooks -> RTK Query Services -> HTTP -> Express API -> Supabase/PostgreSQL
```

---

## Frontend Architecture

### Layer Dependency Rules

The frontend codebase is organized into five layers with strict dependency direction. A layer can only import from layers below it.

| Layer | Directory | Responsibility | Depends On |
|---|---|---|---|
| 1 - Pages | app/ | File-based routing, thin entry points | Layer 2 |
| 2 - Feature Components | features/*/components/ | Pure rendering, props in/events out | Layer 3, UI components |
| 3 - Feature Hooks | features/*/hooks/ | Business logic, side effects, form handling | Layer 4, Layer 5 |
| 4 - Feature Services | features/*/services/ | RTK Query endpoint definitions | Layer 5 |
| 5 - Common and Store | common/, store/ | API client, types, utils, Redux config | None |

### State Management

The application uses Redux Toolkit with RTK Query for server state management. Key characteristics:

- **Automatic Caching:** RTK Query caches API responses and serves them instantly on revisit. This eliminates redundant network requests and provides a snappy user experience.
- **Tag-Based Invalidation:** When a mutation succeeds (create, update, delete), RTK Query invalidates specific cache tags. This triggers automatic re-fetching of affected queries without manual intervention.
- **Cache Tags Used:** Events, Event:[id], Participants, User, DashboardStats.

### Data Table Architecture

The DataTable component is built on TanStack Table and provides:

- Column sorting by clicking headers
- Column resizing via drag handles
- Column visibility toggles in a dropdown menu
- Built-in search and filtering
- Pagination controls
- Cell tooltips for truncated content
- Copy-to-clipboard functionality

The table is fully typed and configured through column definitions that specify header text, accessor functions, cell renderers, and sort/filter behavior.

### Design System

UI components are built using Tailwind CSS 4 with design tokens defined as CSS variables. This enables dark/light mode switching without component changes. Components default to consistent spacing, color, and typography tokens while accepting className overrides for customization.

---

## Backend Architecture

### Module Structure

Each backend module follows a strict three-layer pattern:

**Routes Layer** (events.routes.ts, auth.routes.ts, participants.routes.ts)
- Defines HTTP endpoints and HTTP methods
- Attaches middleware (authenticate, validate) in the correct order
- Maps routes to controller functions
- Uses Zod schemas for request body validation

**Controller Layer** (events.controller.ts, auth.controller.ts, participants.controller.ts)
- Parses and validates request parameters through helper functions
- Calls authentication and authorization checks
- Invokes model layer functions
- Formats and sends structured JSON responses
- Handles edge cases like capacity limits, duplicate registration checks, and deadline enforcement

**Model Layer** (events.model.ts, auth.model.ts, participants.model.ts)
- Executes all database queries using the Supabase client
- Returns typed data rows or throws structured errors
- Contains query logic for filtering, sorting, pagination, and aggregation

### Middleware Pipeline

Every protected API endpoint passes through the following middleware chain:

1. **authenticate**: Extracts JWT from Authorization header, verifies signature and expiry, attaches userId to request object. Returns 401 for missing or invalid tokens.

2. **validate**: Parses request body against a Zod schema. Returns 400 with field-level error details on failure. The cleaned, typed data is passed to the controller.

3. **controller**: Executes business logic, performs authorization checks, and sends the response.

4. **error-handler**: Global middleware that catches all errors. Formats them into a consistent response shape regardless of error type.

### Participant Registration Flow

The participant registration flow incorporates multiple validation steps before inserting a record:

1. Event existence check
2. Maximum participant capacity check
3. Registration deadline check
4. Duplicate registration check (by user_id or email)
5. Cancelled registration re-activation (if the user had previously cancelled and is re-applying)
6. Email confirmation (fire-and-forget via Resend API)

Step 4 prevents the database unique constraint violation that was the original error. The check queries the participants table for an existing record with the same event_id and user_id (or email for guest volunteers). If a record exists with "applied" status, a 409 ALREADY_APPLIED error is returned. If a record exists with "cancelled" status, the existing record is re-activated by updating its status to "applied" and clearing the cancellation reason.

---

## Database Design

### Schema

The database consists of three tables with foreign key relationships:

**users**
- id (UUID, primary key)
- email (text, unique, indexed)
- password (text, bcrypt hashed)
- name (text)
- avatar_url (text, nullable)
- created_at (timestamptz)

**events**
- id (UUID, primary key)
- name (text)
- description (text, nullable)
- date (date)
- location (text, nullable)
- status (text: backlog, in_progress, completed)
- owner_id (UUID, foreign key referencing users.id, indexed)
- category (text)
- max_participants (integer, nullable)
- registration_deadline (text, nullable)
- start_time, end_time (text, nullable)
- cover_image_url (text, nullable)
- created_at, updated_at (timestamptz)

**participants**
- id (UUID, primary key)
- event_id (UUID, foreign key referencing events.id, indexed)
- user_id (UUID, foreign key referencing users.id, indexed, nullable)
- name (text)
- email (text)
- status (text: applied, cancelled)
- cancellation_reason (text, nullable)
- created_at (timestamptz)
- UNIQUE constraint on (event_id, user_id)

### Indexing Strategy

Indexes are created on columns used in WHERE clauses and JOIN conditions:

- users.email: Fast login lookups
- events.owner_id: Dashboard queries filtering by owner
- events.date: Chronological sorting and date range filtering
- participants.event_id: Loading participants for an event detail view
- participants.user_id: Looking up a user's registrations

### Data Integrity

- Foreign key constraints with CASCADE DELETE ensure referential integrity. Deleting an event removes all its participants. Deleting a user removes their events and registrations.
- The UNIQUE constraint on (event_id, user_id) prevents duplicate registrations at the database level, with application-level checks providing user-friendly error messages.
- CHECK constraints on status fields restrict values to the allowed set.

---

## Data Flow

### Event Creation Flow

1. User navigates to /events/create page
2. Next.js renders CreateEventForm component
3. useCreateEvent hook manages form state and validation
4. On submit, useCreateEventMutation dispatches a POST request to /api/events
5. Backend middleware chain: authenticate -> validate (Zod schema) -> controller
6. Controller verifies the authenticated user, inserts the event record
7. RTK Query invalidates Events and DashboardStats cache tags
8. Event list page automatically re-fetches and shows the new event

### Participant Registration Flow

1. User clicks "Apply" on an event detail page
2. useApplyToEvent hook shows a confirmation modal
3. On confirm, useApplyToEventMutation dispatches POST to /api/events/:eventId/apply
4. Backend validates the request, checks event existence, capacity, deadline, and duplicate registration
5. If no duplicate found, inserts participant record with "applied" status
6. If duplicate with "applied" status found, returns 409 error
7. If duplicate with "cancelled" status found, re-activates the existing record
8. Email confirmation is sent asynchronously
9. Frontend shows success toast and updates UI

---

## File Storage Strategy

### Architecture Decision: Supabase Storage over Local Filesystem

The application initially stored uploaded files on the local server filesystem. This approach had limitations: files were lost on server restart, could not be shared across multiple server instances, and consumed server disk space.

The architecture was migrated to Supabase Storage, which provides:

- **Durability:** Files are stored in Supabase's cloud infrastructure with redundancy.
- **Scalability:** Storage is decoupled from the application server, allowing servers to scale horizontally without file synchronization.
- **Access Control:** Signed URLs can be generated with expiration times for temporary access.
- **Performance:** Files are served directly from Supabase's CDN, reducing load on the application server.

### Storage Buckets

- **event-covers:** Public bucket for event cover images. Files are accessible via public URLs.
- **avatars:** Public bucket for user profile avatars. Files are accessible via public URLs.

### Upload Flow

1. Frontend sends file to backend API endpoint
2. Backend validates file type (JPEG, PNG, WebP, GIF) and size (max 5MB)
3. Backend generates a unique filename using UUID
4. File is uploaded to Supabase Storage via the Supabase client SDK
5. Backend returns the public URL of the uploaded file
6. Frontend stores the URL in the event or user profile record

---

## Error Handling Strategy

### Consistent Error Response Format

All API errors follow a uniform structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description"
  }
}
```

For validation errors, an additional `details` array provides field-level messages.

### Error Classification

| Error Code | HTTP Status | When It Occurs |
|---|---|---|
| VALIDATION_ERROR | 400 | Request body fails Zod schema validation |
| NOT_FOUND | 404 | Requested resource does not exist |
| AUTHENTICATION_ERROR | 401 | Missing or invalid JWT token |
| FORBIDDEN | 403 | User lacks permission for the action |
| ALREADY_APPLIED | 409 | User tries to register for an event they already applied to |
| DATABASE_ERROR | 500 | Database query fails |
| EVENT_FULL | 400 | Event has reached maximum participant capacity |
| DEADLINE_PASSED | 400 | Registration deadline has passed |

### Custom Error Classes

Each error type extends a base AppError class that sets the HTTP status code and error code automatically. This ensures consistent error creation across all controllers.

---

## Security Architecture

### Authentication

- JWT tokens are generated on login and registration
- Tokens contain the user ID and expiry timestamp
- Token expiry is set to 7 days
- The authenticate middleware verifies the token on every protected request
- Tokens are sent as Bearer tokens in the Authorization header

### Authorization

- Event owners are verified by comparing the requesting user's ID with the event's owner_id field
- Only event owners can update, delete, or change event status
- Only event owners can view participant lists and manage registrations
- Authorization checks are performed at the controller level, not trusted from client input

### Password Security

- Passwords are hashed using bcrypt with salt factor 10
- Original passwords are never stored or logged
- Password reset tokens are single-use and expire after a set duration

### Input Validation

- All request bodies are validated against Zod schemas before processing
- File uploads are restricted to image MIME types (JPEG, PNG, WebP, GIF)
- File size is capped at 5MB
- Validation errors return field-level details for frontend form display

---

## Performance and Scalability

### Frontend Performance

- RTK Query caching reduces API calls by serving cached data on revisit
- Feature-based code splitting via Next.js file-based routing loads only necessary JavaScript
- Lazy loading of components using dynamic imports for maps, charts, and heavy UI elements
- Debounced search inputs prevent excessive API calls during typing

### Backend Performance

- Stateless JWT authentication enables horizontal scaling without session storage
- Database indexing on frequently queried columns maintains query performance as data grows
- Fire-and-forget email sending prevents email latency from blocking API responses
- Pagination on list endpoints limits data transfer per request

### Database Performance

- PostgreSQL handles concurrent reads and writes efficiently
- Supabase provides automatic connection pooling for many concurrent connections
- Indexes on WHERE clause columns prevent full table scans
- Query filtering is done at the database level rather than in-memory

### Horizontal Scaling

The backend is stateless, meaning multiple instances can run behind a load balancer. No shared session storage is required. Each instance can handle any request independently. The Supabase database connection pool distributes queries across available connections.

---

## Production Deployment

### Deployment Checklist

1. Set a strong, unique JWT_SECRET in production
2. Configure Supabase production project URL and anon key
3. Set up database migrations in the production Supabase project
4. Create Storage buckets (event-covers, avatars) in the production Supabase project
5. Configure Resend API key for email delivery
6. Set FRONTEND_URL to the production frontend domain
7. Enable HTTPS on both frontend and backend
8. Set up environment variables for the deployment platform (Vercel for frontend, Render/Railway for backend)
9. Enable a process manager or container orchestration for the backend

### Monitoring

The application provides a /api/health endpoint for uptime monitoring. For production observability, consider:

- Request logging middleware for tracking API usage and debugging
- Error reporting integration (Sentry, Datadog)
- Database query performance monitoring via Supabase dashboard
- Frontend performance monitoring via Next.js Analytics
