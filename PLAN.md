# Event Manager Dashboard - Architecture Plan

## Overview

A full-stack Event Manager Dashboard with a Next.js frontend, Express.js backend, and Supabase (PostgreSQL) database. The architecture follows feature-based module separation with strict dependency rules to ensure scalability, testability, and maintainability.

---

## 1. Project Structure

```
volunteerYatra/
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── (guest)/
│       │   │   ├── login/
│       │   │   │   └── page.tsx
│       │   │   └── register/
│       │   │       └── page.tsx
│       │   ├── (authenticated)/
│       │   │   ├── events/
│       │   │   │   ├── page.tsx
│       │   │   │   ├── [eventId]/
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   └── edit/
│       │   │   │   │       └── page.tsx
│       │   │   │   └── create/
│       │   │   │       └── page.tsx
│       │   │   └── dashboard/
│       │   │       └── page.tsx
│       │   ├── layout.tsx
│       │   └── page.tsx
│       ├── common/
│       │   ├── api/
│       │   │   ├── client.ts
│       │   │   ├── routes.ts
│       │   │   └── baseApi.ts
│       │   ├── types/
│       │   │   ├── event.ts
│       │   │   ├── participant.ts
│       │   │   ├── user.ts
│       │   │   ├── auth.ts
│       │   │   └── api.ts
│       │   ├── constants/
│       │   │   └── index.ts
│       │   └── utils/
│       │       ├── date.ts
│       │       └── validation.ts
│       ├── features/
│       │   ├── events/
│       │   │   ├── components/
│       │   │   ├── hooks/
│       │   │   └── services/
│       │   ├── participants/
│       │   │   ├── components/
│       │   │   ├── hooks/
│       │   │   └── services/
│       │   └── auth/
│       │       ├── components/
│       │       ├── hooks/
│       │       └── services/
│       ├── components/
│       │   ├── ui/
│       │   │   ├── button.tsx
│       │   │   ├── input.tsx
│       │   │   ├── card.tsx
│       │   │   ├── modal.tsx
│       │   │   ├── select.tsx
│       │   │   ├── table.tsx
│       │   │   ├── badge.tsx
│       │   │   ├── spinner.tsx
│       │   │   └── empty-state.tsx
│       │   └── layouts/
│       │       ├── authenticated-layout.tsx
│       │       └── guest-layout.tsx
│       └── store/
│           └── index.ts
├── backend/
│   └── src/
│       ├── config/
│       │   ├── database.ts
│       │   └── environment.ts
│       ├── modules/
│       │   ├── events/
│       │   │   ├── events.model.ts
│       │   │   ├── events.controller.ts
│       │   │   └── events.routes.ts
│       │   ├── participants/
│       │   │   ├── participants.model.ts
│       │   │   ├── participants.controller.ts
│       │   │   └── participants.routes.ts
│       │   └── auth/
│       │       ├── auth.model.ts
│       │       ├── auth.controller.ts
│       │       └── auth.routes.ts
│       ├── middleware/
│       │   ├── authenticate.ts
│       │   ├── validate.ts
│       │   └── error-handler.ts
│       ├── shared/
│       │   ├── errors.ts
│       │   └── types.ts
│       ├── app.ts
│       └── server.ts
└── supabase/
    └── migrations/
        ├── 001_users.sql
        ├── 002_events.sql
        └── 003_participants.sql
```

---

## 2. Dependency Rules

The architecture enforces a strict inward dependency model. Each layer may only depend on layers below it:

```
Pages (app/)  ──────────────>  Feature Components
Feature Components (features/*/components/)  ──>  Feature Hooks + UI Components
Feature Hooks (features/*/hooks/)  ────>  Feature Services + Redux Store
Feature Services (features/*/services/)  ──>  Common API Layer
Common API (common/api/)  ──────>  Axios + Constants
UI Components (components/ui/)  ──>  Tailwind Design Tokens only
Store (store/)  ──────────>  Redux Toolkit + RTK Query
```

Rules:
- A feature module must never import from another feature module.
- Pages must never contain business logic. They compose components.
- Components must never make API calls or import from services directly.
- Hooks must never import from UI components.
- Services must never import from hooks or components.

---

## 3. Page Routing Strategy

Route groups `(guest)` and `(authenticated)` separate public and private pages. Dynamic segments use descriptive parameter names (`eventId`) instead of generic `id`.

| Route Group | Path | Page Purpose |
|---|---|---|
| guest | /login | Authentication |
| guest | /register | User registration |
| authenticated | /events | Event listing with filters and sort |
| authenticated | /events/[eventId] | Event detail with apply button |
| authenticated | /events/[eventId]/edit | Edit event form |
| authenticated | /events/create | Create event form |
| authenticated | /dashboard | Owner dashboard with participants |

Pages in `app/` are thin entry points. They import a top-level component from the feature and render it. No business logic, no data fetching, no state.

```typescript
// app/(authenticated)/events/create/page.tsx
"use client";

import { CreateEventForm } from "@/features/events/components";

export default function CreateEventPage() {
  return <CreateEventForm />;
}
```

The `app/` directory serves as the routing table -- a single place to see all available routes.

---

## 4. Frontend Layer Specifications

### 4.1 Common API Layer (`common/api/`)

Centralizes all HTTP communication. If the backend base URL or routes change, only this layer is updated.

- `client.ts`: Axios instance with base URL, interceptors for auth token injection, and response error normalization.
- `routes.ts`: All API endpoints as typed constants.
- `baseApi.ts`: RTK Query base configuration with `fetchBaseQuery` wrapper.

### 4.2 Feature Services (`features/*/services/`)

Each feature service uses RTK Query's `injectEndpoints` to extend the base API. Each service exposes queries and mutations for its domain.

```typescript
// features/events/services/event-service.ts
const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listEvents: builder.query<ListEventsResponse, ListEventsParams>({
      query: (params) => ({ url: routes.events.list, params }),
    }),
    createEvent: builder.mutation<Event, CreateEventPayload>({
      query: (body) => ({ url: routes.events.create, method: "POST", body }),
    }),
  }),
});
```

### 4.3 Feature Hooks (`features/*/hooks/`)

Hooks contain all business logic. They consume RTK Query hooks, transform data, handle side effects (navigation, toast notifications), and expose clean interfaces to components.

```typescript
// features/events/hooks/use-event-list.ts
export function useEventList() {
  const [sort, setSort] = useState<SortConfig>(defaultSort);
  const [filters, setFilters] = useState<FilterConfig>(defaultFilters);

  const { data, isLoading, error } = useListEventsQuery({ sort, filters });

  return {
    events: data?.events ?? [],
    isLoading,
    error,
    sort,
    setSort,
    filters,
    setFilters,
  };
}
```

### 4.4 Feature Components (`features/*/components/`)

Components are pure rendering units. They receive props from hooks and emit events via callbacks. No direct API calls, no state management imports.

```typescript
// features/events/components/event-list.tsx
interface EventListProps {
  events: Event[];
  isLoading: boolean;
  onDelete: (eventId: string) => void;
  onEdit: (eventId: string) => void;
}

export function EventList({ events, isLoading, onDelete, onEdit }: EventListProps) {
  if (isLoading) return <Spinner />;
  if (events.length === 0) return <EmptyState message="No events found" />;

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </div>
  );
}
```

### 4.5 Base UI Components (`components/ui/`)

A design system of reusable primitives. Each component accepts Tailwind className for customization but defaults to design tokens. No hardcoded color values anywhere.

```typescript
// components/ui/button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
```

---

## 5. Backend Layer Specifications

### 5.1 Module Structure

Each backend module follows the three-layer pattern specified in the assignment:

| Layer | Responsibility |
|---|---|
| `*.model.ts` | Raw SQL queries executed via Supabase client |
| `*.controller.ts` | Request parsing, validation invocation, response formatting, error handling |
| `*.routes.ts` | Express Router with middleware chaining |

### 5.2 Example: Events Module

```typescript
// modules/events/events.model.ts
export async function findAllEvents(db: SupabaseClient, filters: EventFilters) {
  let query = db.from("events").select("*");

  if (filters.name) {
    query = query.ilike("name", `%${filters.name}%`);
  }
  if (filters.date) {
    query = query.eq("date", filters.date);
  }

  const { data, error } = await query.order("date", { ascending: filters.sortAsc });
  if (error) throw new DatabaseError(error.message);

  return data;
}
```

```typescript
// modules/events/events.controller.ts
export async function listEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = parseEventFilters(req.query);
    const events = await findAllEvents(req.db, filters);
    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
}
```

```typescript
// modules/events/events.routes.ts
const router = Router();

router.get("/", authenticate, validate(listEventsSchema), listEvents);
router.post("/", authenticate, validate(createEventSchema), createEvent);
router.get("/:eventId", authenticate, getEvent);
router.put("/:eventId", authenticate, validate(updateEventSchema), updateEvent);
router.delete("/:eventId", authenticate, deleteEvent);

export { router as eventRoutes };
```

### 5.3 Error Handling

A global error handler middleware normalizes all errors into a consistent response shape:

```typescript
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Event name is required",
    details: [{ field: "name", message: "Required" }]
  }
}
```

Custom error classes (`ValidationError`, `NotFoundError`, `AuthenticationError`, `DatabaseError`) ensure consistent status codes.

### 5.4 Middleware Chain

Each endpoint follows the same middleware pipeline:

```
authenticate  ->  validate(schema)  ->  controller  ->  errorHandler
```

---

## 6. Database Schema

### 6.1 Users Table

```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
```

### 6.2 Events Table

```sql
CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  date        DATE NOT NULL,
  location    TEXT,
  owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_owner ON events (owner_id);
CREATE INDEX idx_events_date ON events (date);
```

### 6.3 Participants Table

```sql
CREATE TABLE participants (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id            UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  email               TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'approved', 'cancelled')),
  cancellation_reason TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_participants_event ON participants (event_id);
CREATE INDEX idx_participants_user ON participants (user_id);
```

---

## 7. API Specification

### 7.1 Authentication

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Create account, return JWT |
| POST | /api/auth/login | No | Authenticate, return JWT |
| GET | /api/auth/me | Yes | Get current user profile |

### 7.2 Events

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /api/events | Yes | List events with search, date/location filter, date sort |
| GET | /api/events/:eventId | Yes | Get event details with participant count |
| POST | /api/events | Yes | Create event (zod validated) |
| PUT | /api/events/:eventId | Yes | Update event (owner only) |
| DELETE | /api/events/:eventId | Yes | Delete event (owner only) |

### 7.3 Participants

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/events/:eventId/apply | Yes | Register for event |
| GET | /api/events/:eventId/participants | Yes | List participants (owner only) |
| DELETE | /api/events/:eventId/participants/:participantId | Yes | Cancel registration with reason (owner only) |

---

## 8. Styling Strategy

### 8.1 Design Tokens

All colors, spacing, typography, and shadows are defined in `tailwind.config.ts` using CSS variables. Components reference these tokens only. No hex codes or rgb values in component files.

```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          muted: "var(--color-primary-muted)",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          hover: "var(--color-surface-hover)",
          border: "var(--color-surface-border)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          hover: "var(--color-danger-hover)",
          muted: "var(--color-danger-muted)",
        },
      },
      spacing: {
        page: "var(--spacing-page)",
        section: "var(--spacing-section)",
        element: "var(--spacing-element)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
    },
  },
};
```

### 8.2 Utility Classes

Extensive set of composite utility classes for consistent layout patterns:

```css
/* globals.css */
@layer utilities {
  .page-container {
    @apply mx-auto w-full max-w-7xl px-6 py-8;
  }
  .card-surface {
    @apply rounded-lg border border-surface-border bg-surface p-6 shadow-sm;
  }
  .flex-center {
    @apply flex items-center justify-center;
  }
  .flex-between {
    @apply flex items-center justify-between;
  }
  .form-field {
    @apply flex flex-col gap-1.5;
  }
  .form-input {
    @apply rounded-md border border-surface-border bg-background px-3 py-2 text-sm
           focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-muted;
  }
  .text-balance {
    @apply text-sm font-medium;
  }
  .text-muted {
    @apply text-sm text-foreground/60;
  }
}
```

---

## 9. Build Order

The implementation follows a bottom-up dependency order to ensure each layer can be tested as it is built.

| Phase | Tasks | Dependencies |
|---|---|---|
| 1. Foundation | Supabase project setup, migration files, Express app skeleton, Next.js scaffolding, Tailwind config with design tokens | None |
| 2. Backend Auth | Users table, auth model/controller/routes, JWT middleware | Phase 1 |
| 3. Backend Events | Events table, events model/controller/routes, validation schemas | Phase 1 |
| 4. Backend Participants | Participants table, participants model/controller/routes | Phase 1 |
| 5. Frontend Common | Axios client, API routes, RTK Query base, Redux store, types | Phase 1 |
| 6. Frontend UI | Base UI components (button, input, card, modal, table, etc.) | Phase 1 |
| 7. Frontend Auth | Auth feature (login/register pages, hooks, services) | Phases 2, 5, 6 |
| 8. Frontend Events | Events feature (create, list, detail, edit) | Phases 3, 5, 6, 7 |
| 9. Frontend Participants | Participants feature (apply, dashboard, cancel) | Phases 4, 5, 6, 7 |
| 10. Polish | Search, filter, sort, error handling, loading states, empty states | All above |

---

## 10. Key Conventions

- No comments in code. Code is self-documenting through clear naming, small functions, and consistent patterns.
- No emoji or AI-generated language in code, commits, or documentation.
- No console.log. Use structured logging on backend only.
- No default exports. Named exports only for predictable imports and better tree-shaking.
- Single responsibility. Each file does one thing. A hook file contains one hook. A component file contains one component.
- Error boundaries at the page level to prevent entire app crashes.
- Optimistic updates for delete operations via RTK Query cache manipulation.
